// Generates 16x16 procedural texture tiles into public/pixel/*.png (no dependencies).
// Run: node scripts/gen-pixel-textures.mjs
// Original art: seeded noise over our own palette. Edit PALETTES to retune.
import { deflateSync } from 'node:zlib';
import { mkdirSync, writeFileSync } from 'node:fs';

const SIZE = 16;
const hex = (h) => [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16));

// Mirrors --stone-*, --dirt*, --grass*, --bedrock in src/styles/pixel-tokens.css
const PALETTES = {
  stone: ['#3c3c46', '#464651', '#33333c', '#50505b'],
  dirt: ['#8a5a2e', '#7a4f28', '#9a6837', '#5b3a1e'],
  grass: ['#5fa332', '#6fb53e', '#4f8c29', '#8fd14f'],
  deepslate: ['#1d1f30', '#292c42', '#161724', '#353a56'],
  bedrock: ['#1a1a24', '#222230', '#12121a', '#2b2b33'],
};

function rng(seed) {
  let s = seed >>> 0;
  return () => ((s = (Math.imul(s, 1664525) + 1013904223) >>> 0) / 4294967296);
}

const crcTable = Array.from({ length: 256 }, (_, n) => {
  let c = n;
  for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
  return c >>> 0;
});
const crc32 = (buf) => {
  let c = 0xffffffff;
  for (const b of buf) c = crcTable[(c ^ b) & 255] ^ (c >>> 8);
  return (c ^ 0xffffffff) >>> 0;
};
const chunk = (type, data) => {
  const len = Buffer.alloc(4);
  len.writeUInt32BE(data.length);
  const td = Buffer.concat([Buffer.from(type), data]);
  const crc = Buffer.alloc(4);
  crc.writeUInt32BE(crc32(td));
  return Buffer.concat([len, td, crc]);
};

function png(pixels) {
  const raw = Buffer.alloc((SIZE * 3 + 1) * SIZE);
  for (let y = 0; y < SIZE; y++) {
    raw[y * (SIZE * 3 + 1)] = 0;
    for (let x = 0; x < SIZE; x++) {
      const o = y * (SIZE * 3 + 1) + 1 + x * 3;
      raw.set(pixels[y * SIZE + x], o);
    }
  }
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(SIZE, 0);
  ihdr.writeUInt32BE(SIZE, 4);
  ihdr[8] = 8;
  ihdr[9] = 2;
  return Buffer.concat([
    Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]),
    chunk('IHDR', ihdr),
    chunk('IDAT', deflateSync(raw)),
    chunk('IEND', Buffer.alloc(0)),
  ]);
}

mkdirSync(new URL('../public/pixel/', import.meta.url), { recursive: true });
let seed = 31113;
for (const [name, pal] of Object.entries(PALETTES)) {
  const rand = rng((seed += 7));
  const colors = pal.map(hex);
  const pixels = [];
  for (let i = 0; i < SIZE * SIZE; i++) {
    const r = rand();
    // weighted: mostly base, some variation
    const idx = r < 0.55 ? 0 : r < 0.75 ? 1 : r < 0.9 ? 2 : 3;
    pixels.push(colors[idx]);
  }
  writeFileSync(new URL(`../public/pixel/${name}.png`, import.meta.url), png(pixels));
  console.log('wrote', name);
}

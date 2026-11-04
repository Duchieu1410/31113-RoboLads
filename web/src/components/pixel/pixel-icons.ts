/**
 * 16x16 pixel icons, drawn as strings. Edit these to change the art; no build step needed.
 * One character = one pixel. Rows shorter than 16 chars are padded; icons with fewer
 * than 16 rows are centered vertically.
 *
 * Palette letters map to CSS tokens in src/styles/pixel-tokens.css (see PALETTE below).
 * TODO(art): a teammate can redraw any icon in Piskel/Aseprite and paste it here.
 */
export const PALETTE: Record<string, string> = {
  K: 'var(--outline)',
  w: 'var(--ink)',
  g: 'var(--gold)',
  G: 'var(--gold-dark)',
  s: 'var(--stone-300)',
  S: 'var(--stone-500)',
  n: 'var(--dirt)',
  N: 'var(--dirt-dark)',
  r: 'var(--redstone)',
  x: 'var(--redstone-dark)',
  d: 'var(--diamond)',
  b: 'var(--cobalt)',
  p: 'var(--parchment)',
  e: 'var(--grass)',
  E: 'var(--grass-light)',
};

export const PIXEL_ICONS = {
  sword: [
    '............KKK.',
    '...........KwwwK',
    '..........KwwsK.',
    '.........KwwsK..',
    '........KwwsK...',
    '.......KwwsK....',
    '..K...KwwsK.....',
    '..KK.KwwsK......',
    '...KKwwsK.......',
    '....KKwsK.......',
    '..KgggggggK.....',
    '..KGGGGGGGK.....',
    '....KnnK........',
    '...KnnK.........',
    '..KnnK..........',
    '..KKK...........',
  ],
  pickaxe: [
    '....KKKKKKK.....',
    '..KKsssssssKK...',
    '.KsswwSSSSsssK..',
    '.KsK..KnK..KsK..',
    'KsK...KnK...KsK.',
    'KK....KnK....KK.',
    '.....KnNK.......',
    '.....KnNK.......',
    '.....KnNK.......',
    '.....KnNK.......',
    '.....KnNK.......',
    '.....KnNK.......',
    '.....KnNK.......',
    '.....KnNK.......',
    '.....KKKK.......',
  ],
  redstone: [
    '.....KKKKKK.....',
    '....KrrrrrrK....',
    '...KrwrrrrrrK...',
    '..KrrwrrrrrrrK..',
    '..KrrrrrrrrrxK..',
    '..KrrrrrrrrxxK..',
    '...KrrrrrrxxK...',
    '...KrrrrxxxxK...',
    '....KxxxxxxK....',
    '.....KKKKKK.....',
  ],
  book: [
    '..KKKKKKKKKKK...',
    '.KbbbbbbbbbbbK..',
    '.KbwwwwwwwwwbK..',
    '.KbbbbbbbbbbbK..',
    '.KbbggggggbbbK..',
    '.KbbbbbbbbbbbK..',
    '.KbbbbbbbbbbbK..',
    '.KbbbbbbbbbbbK..',
    '.KbbbbbbbbbbbK..',
    '.KbbbbbbbbbbbK..',
    '.KbbbbbbbbbbbK..',
    '.KKKKKKKKKKKKK..',
    '.KppppppppppK...',
    '.KKKKKKKKKKKK...',
  ],
  chest: [
    '..KKKKKKKKKKKK..',
    '.KnnnnnnnnnnnnK.',
    '.KnNnnnnnnnnNnK.',
    '.KnnnnnnnnnnnnK.',
    '.KKKKKKggKKKKKK.',
    '.KnnnnKggKnnnnK.',
    '.KnNnnKKKKnnNnK.',
    '.KnnnnnnnnnnnnK.',
    '.KnNnnnnnnnnNnK.',
    '.KnnnnnnnnnnnnK.',
    '.KNNNNNNNNNNNNK.',
    '..KKKKKKKKKKKK..',
  ],
  compass: [
    '......KKKK......',
    '....KKssssKK....',
    '..KKsssrrsssKK..',
    '.KsssssrrsssssK.',
    'KssssssrrssssssK',
    'KsssssrrrrsssssK',
    'KssssssKKssssssK',
    'KsssssbbbbsssssK',
    'KssssssbbssssssK',
    '.KsssssbbsssssK.',
    '..KKsssbbsssKK..',
    '....KKssssKK....',
    '......KKKK......',
  ],
  gear: [
    '......KKKK......',
    '..KK.KggggK.KK..',
    '.KggKKggggKKggK.',
    '.KgggggggggggGK.',
    '..KgggKKKKgggK..',
    'KKggKK....KKggKK',
    'KggggK....KggggK',
    'KggggK....KggggK',
    'KgggGK....KGgggK',
    'KKggKK....KKggKK',
    '..KgggKKKKgggK..',
    '.KgGggggggggGgK.',
    '.KggKKggggKKggK.',
    '..KK.KggggK.KK..',
    '......KKKK......',
  ],
  camera: [
    '....KKKK........',
    '.KKKKKKKKKKKKKK.',
    '.KSSSSSSSSSSSSK.',
    '.KSSSKKKKKKSSSK.',
    '.KSSKddddddKSSK.',
    '.KSSKdwddddKSSK.',
    '.KSSKddddddKSSK.',
    '.KSSSKKKKKKSSSK.',
    '.KSSSSSSSSSSSSK.',
    '.KKKKKKKKKKKKKK.',
  ],
  code: [
    '....dd...gdd....',
    '...dd....g.dd...',
    '..dd....g...dd..',
    '.dd.....g....dd.',
    'dd.....g......dd',
    '.dd....g.....dd.',
    '..dd..g.....dd..',
    '...dd.g....dd...',
    '....ddg...dd....',
  ],
  wrench: [
    '.........KK.KK..',
    '........KssKssK.',
    '........KssssssK',
    '........KKssssK.',
    '.......KssssKK..',
    '......KssssK....',
    '.....KssssK.....',
    '....KssssK......',
    '...KssssK.......',
    '..KssssK........',
    '.KssssK.........',
    '.KsssK..........',
    '..KKK...........',
  ],
  star: [
    '.......KK.......',
    '......KggK......',
    '......KggK......',
    'KKKKKKggggKKKKKK',
    '.KggggggggggggK.',
    '..KggggwggggK...',
    '...KggggggggK...',
    '...KgggKKgggK...',
    '..KggK....KggK..',
    '..KgK......KgK..',
    '...K........K...',
  ],
} as const;

export type PixelIconName = keyof typeof PIXEL_ICONS;

export const ICON_NAMES = Object.keys(PIXEL_ICONS) as PixelIconName[];

export interface IconRect {
  x: number;
  y: number;
  w: number;
  color: string;
}

/** Converts an icon into horizontal runs of same-colored pixels (fewer SVG nodes). */
export function iconRects(name: PixelIconName): IconRect[] {
  const rows: readonly string[] = PIXEL_ICONS[name];
  const top = Math.floor((16 - rows.length) / 2);
  const rects: IconRect[] = [];
  rows.forEach((raw, i) => {
    const row = raw.padEnd(16, '.').slice(0, 16);
    let x = 0;
    while (x < 16) {
      const ch = row[x];
      if (ch === '.' || !PALETTE[ch]) {
        x++;
        continue;
      }
      let w = 1;
      while (x + w < 16 && row[x + w] === ch) w++;
      rects.push({ x, y: top + i, w, color: PALETTE[ch] });
      x += w;
    }
  });
  return rects;
}

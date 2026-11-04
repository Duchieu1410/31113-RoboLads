// Checks WCAG contrast for the token pairs used by pixel components.
// Run: node scripts/check-pixel-contrast.mjs   (exit code 1 if any required pair fails)
import { readFileSync } from 'node:fs';

const css = readFileSync(new URL('../src/styles/pixel-tokens.css', import.meta.url), 'utf8');
const tok = {};
for (const m of css.matchAll(/--([\w-]+):\s*(#[0-9a-fA-F]{6})\s*;/g)) tok[m[1]] = m[2];

const lum = (hex) => {
  const [r, g, b] = [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16) / 255).map((c) => (c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4));
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
};
const ratio = (a, b) => {
  const [hi, lo] = [lum(tok[a]), lum(tok[b])].sort((x, y) => y - x);
  return (hi + 0.05) / (lo + 0.05);
};

// [foreground, background, required, where]
const PAIRS = [
  ['ink', 'stone-700', 4.5, 'panel text / stone button'],
  ['ink', 'night', 4.5, 'page text'],
  ['ink', 'night-panel', 4.5, 'night panel text'],
  ['ink', 'dirt', 4.5, 'dirt panel text'],
  ['ink', 'bedrock', 4.5, 'bedrock panel text'],
  ['ink-dark', 'parchment', 4.5, 'parchment reading'],
  ['ink-dark', 'gold', 4.5, 'primary button'],
  ['ink', 'redstone-dark', 4.5, 'danger button'],
  ['ink-dark', 'ink', 4.5, 'primary button hover'],
  ['gold', 'stone-700', 4.5, 'stone button hover (gold text)'],
  ['gold', 'tooltip-bg', 4.5, 'tooltip / toast title'],
  ['ink', 'tooltip-bg', 4.5, 'tooltip body'],
  ['stone-300', 'tooltip-bg', 4.5, 'toast close'],
  ['stone-300', 'stone-900', 4.5, 'disabled button / hotbar key'],
  ['gold', 'night', 4.5, 'splash text / headings'],
  ['grass-light', 'night', 4.5, 'XP level number'],
  ['diamond', 'night', 3, 'focus ring on night (non-text)'],
  ['diamond', 'stone-700', 3, 'focus ring on stone (non-text)'],
  ['ink', 'bedrock', 3, 'selected slot frame (non-text)'],
];

let failed = 0;
for (const [fg, bg, need, where] of PAIRS) {
  const r = ratio(fg, bg);
  const ok = r >= need;
  if (!ok) failed++;
  console.log(`${ok ? 'PASS' : 'FAIL'}  ${r.toFixed(2).padStart(5)}:1 (need ${need})  ${fg} on ${bg}  - ${where}`);
}
process.exit(failed ? 1 : 0);

/**
 * HSGS RoboLads (FTC #31113) - Pixel Character Sprites
 * 
 * TODO(art): These placeholder sprites are hand-coded 32x32 matrices.
 * Teammates can redraw them in Aseprite, Piskel, or Lospec Pixel Editor:
 * - Canvas size: 32x32 px
 * - Export format: 32x32 PNG or 1-to-1 character matrix (32 lines x 32 chars)
 * - Palette mapping:
 *     # = #000000 (Black Outline)
 *     R = #dc2626 (Cerberus Crimson Body)
 *     D = #1e293b (Dark Charcoal Armor)
 *     S = #475569 (Slate Steel)
 *     G = #fbbf24 (Gold Core & Collars)
 *     Y = #fef08a (Glowing Amber Cyber-Eyes)
 *     W = #ffffff (Fangs & Highlights)
 *     C = #38bdf8 (Cyan Sensor Glow)
 *     A = #94a3b8 (6061-T6 Aluminum Plates)
 *     . = transparent
 */

export const SPRITE_PALETTE = {
  '#': '#000000',
  'R': '#dc2626',
  'D': '#1e293b',
  'S': '#475569',
  'G': '#fbbf24',
  'Y': '#fef08a',
  'W': '#ffffff',
  'C': '#38bdf8',
  'A': '#94a3b8',
};

// 32x32 Cerberus Running Frame 1 (Front Paw Forward, Tail Up)
export const CERBERUS_FRAME_1: string[] = [
  '................................', // 0
  '.........##.......##......##....', // 1 - Ear tips
  '........#RR#.....#RR#....#RR#...', // 2
  '........#RR#.....#RR#....#RR#...', // 3
  '.......#RRRR#...#RRRR#..#RRRR#..', // 4 - Triple Head crowns
  '......#RR#YY#..#RR#YY#.#RR#YY#..', // 5 - Glowing Amber Eyes
  '......#RR#YY#..#RR#YY#.#RR#YY#..', // 6
  '.....#RRRR##..#RRRR##.#RRRR##...', // 7 - Snouts
  '.....#RRWW#...#RRWW#..#RRWW#....', // 8 - Fangs
  '.....#RR##....#RR##...#RR##.....', // 9 - Jaws
  '......##..####..##..####..##....', // 10
  '........#GGGGGGGGGGGGGG#........', // 11 - Cybernetic Collar
  '.......#GGYYYYYYYYYYYYGG#.......', // 12 - Gold Core
  '......#DDDDDDDDDDDDDDDDDD#......', // 13 - Main Thorax Armor
  '.....#DDSSDDDDSSSSDDDDSSDD#.....', // 14
  '....#DDSSSSDDSSSSSSDDSSSSDD#....', // 15
  '....#DDSSSSDDSSSSSSDDSSSSDD#....', // 16
  '....#DDSSDDDDSSSSDDDDSSDDDD#....', // 17
  '....#DDDDDDDDDDDDDDDDDDDDDD#....', // 18
  '...#GGDDDDDDDDDDDDDDDDDDDDDD#...', // 19
  '...#GGDDDDDDDDDDDDDDDDDDDDDD#...', // 20
  '....###DDDDDDDDDDDDDDDDDD###....', // 21 - Abdomen
  '......#DDDDDDDDDDDDDDDD#........', // 22
  '.....#SSDDDD##....##DDDDSS#.....', // 23 - Hip joints
  '....#SSDD##..........##DDSS#....', // 24
  '...#SSDD#..............#SSDD#...', // 25 - Front & back paws stride
  '...#SSDD#...............#SSDD#..', // 26
  '..#SSDD#.................#SSDD#.', // 27
  '..#SSDD#.................#SSDD#.', // 28
  '..#WW##...................#WW##.', // 29 - Cyber Paws
  '..####.....................####.', // 30
  '................................', // 31
];

// 32x32 Cerberus Running Frame 2 (Paws Compressed, Tail Down)
export const CERBERUS_FRAME_2: string[] = [
  '................................', // 0
  '.........##.......##......##....', // 1
  '........#RR#.....#RR#....#RR#...', // 2
  '........#RR#.....#RR#....#RR#...', // 3
  '.......#RRRR#...#RRRR#..#RRRR#..', // 4
  '......#RR#YY#..#RR#YY#.#RR#YY#..', // 5
  '......#RR#YY#..#RR#YY#.#RR#YY#..', // 6
  '.....#RRRR##..#RRRR##.#RRRR##...', // 7
  '.....#RRWW#...#RRWW#..#RRWW#....', // 8
  '.....#RR##....#RR##...#RR##.....', // 9
  '......##..####..##..####..##....', // 10
  '........#GGGGGGGGGGGGGG#........', // 11
  '.......#GGYYYYYYYYYYYYGG#.......', // 12
  '......#DDDDDDDDDDDDDDDDDD#......', // 13
  '.....#DDSSDDDDSSSSDDDDSSDD#.....', // 14
  '....#DDSSSSDDSSSSSSDDSSSSDD#....', // 15
  '....#DDSSSSDDSSSSSSDDSSSSDD#....', // 16
  '....#DDSSDDDDSSSSDDDDSSDDDD#....', // 17
  '....#DDDDDDDDDDDDDDDDDDDDDD#....', // 18
  '...#GGDDDDDDDDDDDDDDDDDDDDDD#...', // 19
  '...#GGDDDDDDDDDDDDDDDDDDDDDD#...', // 20
  '....###DDDDDDDDDDDDDDDDDD###....', // 21
  '......#DDDDDDDDDDDDDDDD#........', // 22
  '......#SSDD##......##DDSS#......', // 23 - Mid-stride compression
  '.....#SSDD#..........#SSDD#.....', // 24
  '.....#SSDD#..........#SSDD#.....', // 25
  '....#SSDD#............#SSDD#....', // 26
  '...#SSDD#..............#SSDD#...', // 27
  '...#SSDD#..............#SSDD#...', // 28
  '...#WW##................#WW##...', // 29
  '...####..................####...', // 30
  '................................', // 31
];

// 32x32 Mini DecodeBot Robot Companion Sprite
export const MINI_ROBOT_SPRITE: string[] = [
  '................................', // 0
  '...........##########...........', // 1 - Specimen Lift / Linear Slide
  '...........#AAAAAAAA#...........', // 2
  '...........#AA#GG#AA#...........', // 3
  '...........#AA#GG#AA#...........', // 4
  '..........##AA#GG#AA##..........', // 5
  '..........#AAAAAAAAAA#..........', // 6
  '..........#AAAAAAAAAA#..........', // 7
  '.........##AAAAAAAAAA##.........', // 8
  '.........#CCCCCCCCCCCC#.........', // 9 - Optical Sensor Array
  '.........#CY#CY##CY#CY#.........', // 10 - Cyan Laser Eyes
  '.........#CY#CY##CY#CY#.........', // 11
  '.........#CCCCCCCCCCCC#.........', // 12
  '.......###DDDDDDDDDDDD###.......', // 13 - Chassis Core
  '......#DDDDDDDDDDDDDDDDDD#......', // 14
  '.....#DD#GGGGGGGGGGGGGG#DD#.....', // 15 - Gold Intake Rollers
  '....#DD#GGGGGGGGGGGGGGGG#DD#....', // 16
  '....#DD#GG############GG#DD#....', // 17
  '....#DD#GG#AAAAAAAAAA#GG#DD#....', // 18
  '....#DD#GG#AAAAAAAAAA#GG#DD#....', // 19
  '....#DD#GG############GG#DD#....', // 20
  '.....#DD#GGGGGGGGGGGGGG#DD#.....', // 21
  '......#DDDDDDDDDDDDDDDDDD#......', // 22
  '.....###DDDDDDDDDDDDDDDD###.....', // 23
  '....#DDD################DDD#....', // 24 - Mecanum Wheel Base
  '...#DDDD#AA##AA##AA##AA#DDDD#...', // 25 - 45° Mecanum Rollers
  '...#DDDD#AA##AA##AA##AA#DDDD#...', // 26
  '...#DDDD#AA##AA##AA##AA#DDDD#...', // 27
  '...#DDDD#AA##AA##AA##AA#DDDD#...', // 28
  '....#DDD################DDD#....', // 29
  '.....###................###.....', // 30
  '................................', // 31
];

/**
 * Converts a 32x32 string grid into an optimized SVG string with crispEdges.
 */
export function spriteToSvg(
  grid: string[],
  palette: Record<string, string> = SPRITE_PALETTE,
  size: number = 32
): string {
  const pixelSize = 1;
  const rects: string[] = [];

  for (let y = 0; y < grid.length; y++) {
    const row = grid[y];
    for (let x = 0; x < row.length; x++) {
      const char = row[x];
      const color = palette[char];
      if (color) {
        rects.push(`<rect x="${x * pixelSize}" y="${y * pixelSize}" width="${pixelSize}" height="${pixelSize}" fill="${color}" />`);
      }
    }
  }

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${size} ${size}" width="${size}" height="${size}" shape-rendering="crispEdges">${rects.join('')}</svg>`;
}

/**
 * Returns an inline SVG data URI for use in <img> tags or CSS background-image.
 */
export function spriteToDataUri(
  grid: string[],
  palette: Record<string, string> = SPRITE_PALETTE,
  size: number = 32
): string {
  const svg = spriteToSvg(grid, palette, size);
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}

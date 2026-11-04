import fs from 'fs';

const nodes = JSON.parse(fs.readFileSync('D:/Robotics/31113-robolads/web/scripts/node_positions.json'));
const meshes = nodes.filter(n => n.isMesh);

const PALETTE = {
  stone300: '#a8a8b3', // light stone grey (side plates)
  stone500: '#6b6b76', // medium stone (rails/standoffs)
  stone700: '#3c3c46', // dark stone (hardware, brackets)
  stone900: '#2b2b33', // deep slate (fasteners, shafts)
  gold:     '#fbbf24', // Hub & Avionics
  diamond:  '#3be0d0', // Polycarbonate guard
  redstone: '#d33a2c', // Belts
  grass:    '#5fa332', // Intake rollers
  cobalt:   '#2b4fb8', // Scoring hood
};

function getRemappedToken(name) {
  if (name.includes('side_plate')) return { token: 'stone300', hex: PALETTE.stone300, desc: 'Side Plate' };
  if (name.includes('Belt')) return { token: 'redstone', hex: PALETTE.redstone, desc: 'HTD Belt' };
  if (name.startsWith('REV-31-1152') || name.startsWith('REV-31-1153')) return { token: 'gold', hex: PALETTE.gold, desc: 'REV Hub' };
  if (name.startsWith('2800-0004-0030')) return { token: 'grass', hex: PALETTE.grass, desc: 'Intake Roller' };
  if (name.includes('EnclosureTopThin')) return { token: 'diamond', hex: PALETTE.diamond, desc: 'Polycarbonate Guard' };
  if (name.startsWith('5647') || name === 'Part_1_8') return { token: 'cobalt', hex: PALETTE.cobalt, desc: 'Scoring Hood' };
  if (name.startsWith('1106') || name.startsWith('1516')) return { token: 'stone500', hex: PALETTE.stone500, desc: 'Structural Rails/Standoffs' };
  if (name.includes('wheel_adap') || name.includes('Magnet')) return { token: 'stone700', hex: PALETTE.stone700, desc: 'Wheel Hubs' };
  if (name.includes('VITE') || name.includes('M25') || name.includes('Shaft')) return { token: 'stone900', hex: PALETTE.stone900, desc: 'Axle/Fasteners' };
  return { token: 'stone500', hex: PALETTE.stone500, desc: 'General Internal' };
}

const breakdown = {};
meshes.forEach(m => {
  const match = getRemappedToken(m.name);
  breakdown[match.token] = (breakdown[match.token] || 0) + 1;
  console.log(`${m.name.padEnd(36)} -> ${match.token.padEnd(10)} ${match.hex} (${match.desc})`);
});

console.log('\nToken breakdown:', breakdown);

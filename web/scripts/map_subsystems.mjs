import fs from 'fs';

const nodes = JSON.parse(fs.readFileSync('D:/Robotics/31113-robolads/web/scripts/node_positions.json'));

console.log('Total nodes:', nodes.length);
console.log('Meshes:', nodes.filter(n => n.isMesh).length);

// Let's print each mesh with its name, center, size, and material color
nodes.filter(n => n.isMesh).forEach((m, idx) => {
  console.log(
    `[${String(idx).padStart(2, '0')}] ${m.name.padEnd(36)} ` +
    `tri: ${String(m.triangles).padStart(6)} ` +
    `c: [${m.center.map(v => String(v).padStart(6)).join(',')}] ` +
    `s: [${m.size.map(v => String(v).padStart(5)).join(',')}] ` +
    `col: ${m.color} (${m.material})`
  );
});

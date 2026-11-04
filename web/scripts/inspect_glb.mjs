import fs from 'fs';
import path from 'path';
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { MeshoptDecoder } from 'three/examples/jsm/libs/meshopt_decoder.module.js';

// Polyfill window/self/document for GLTFLoader in Node if needed
if (typeof self === 'undefined') {
  global.self = global;
}

const glbPath = 'D:/Robotics/31113-robolads/assets/models/DecodeBot.web.glb';
const glbBuffer = fs.readFileSync(glbPath);
const arrayBuffer = glbBuffer.buffer.slice(glbBuffer.byteOffset, glbBuffer.byteOffset + glbBuffer.byteLength);

const loader = new GLTFLoader();
loader.setMeshoptDecoder(MeshoptDecoder);

loader.parse(arrayBuffer, '', (gltf) => {
  const scene = gltf.scene;

  let totalNodes = 0;
  let totalMeshes = 0;
  let totalTriangles = 0;
  const materialMap = new Map();
  const nodeNames = [];
  const meshDetails = [];

  scene.traverse((obj) => {
    totalNodes++;
    nodeNames.push(obj.name || '(unnamed)');

    if (obj.isMesh) {
      totalMeshes++;
      const geom = obj.geometry;
      let triCount = 0;
      if (geom.index) {
        triCount = geom.index.count / 3;
      } else if (geom.attributes.position) {
        triCount = geom.attributes.position.count / 3;
      }
      totalTriangles += triCount;

      const mat = obj.material;
      const mats = Array.isArray(mat) ? mat : [mat];
      mats.forEach((m) => {
        if (m) {
          const count = materialMap.get(m.name || m.uuid) || 0;
          materialMap.set(m.name || m.uuid, count + 1);
        }
      });

      meshDetails.push({
        name: obj.name,
        parentName: obj.parent?.name,
        triangles: triCount,
        material: Array.isArray(mat) ? mat.map(m => m.name).join(', ') : mat?.name,
      });
    }
  });

  console.log('=== GLB SUMMARY ===');
  console.log(`File: ${glbPath}`);
  console.log(`File Size: ${(glbBuffer.length / 1024 / 1024).toFixed(2)} MB (${glbBuffer.length} bytes)`);
  console.log(`Total Nodes: ${totalNodes}`);
  console.log(`Total Meshes: ${totalMeshes}`);
  console.log(`Total Materials: ${materialMap.size}`);
  console.log(`Total Triangles: ${totalTriangles}`);

  // Subsystem keyword matching
  const keywords = {
    chassis: ['chassis', 'side', 'plate', 'rail', 'standoff', '1120', '1106', 'turntable', 'structural'],
    drivetrain: ['drivetrain', 'wheel', 'mecanum', 'belt', '140-2m', '78-5m', 'pulley', 'motor', 'planetary', '3110', 'bearing', '1615', 'axle', 'hex'],
    intake: ['intake', 'roller', 'compliant', 'omni', 'polycarbonate', 'shield', '2800', 'feeder', 'chute'],
    turret_avionics: ['turret', 'avionics', 'rev', 'hub', '31-1595', '5647', 'hood', 'camera', 'scoring', 'servo', 'guide'],
  };

  const categorized = {
    chassis: [],
    drivetrain: [],
    intake: [],
    turret_avionics: [],
    other: [],
  };

  nodeNames.forEach((name) => {
    const lower = name.toLowerCase();
    let matched = false;
    for (const [cat, words] of Object.entries(keywords)) {
      if (words.some((w) => lower.includes(w))) {
        categorized[cat].push(name);
        matched = true;
      }
    }
    if (!matched) {
      categorized.other.push(name);
    }
  });

  console.log('\n=== CATEGORIZED NODE MATCHES ===');
  console.log(`Chassis matches (${categorized.chassis.length}):`, categorized.chassis.slice(0, 20));
  console.log(`Drivetrain matches (${categorized.drivetrain.length}):`, categorized.drivetrain.slice(0, 20));
  console.log(`Intake matches (${categorized.intake.length}):`, categorized.intake.slice(0, 20));
  console.log(`Turret/Avionics matches (${categorized.turret_avionics.length}):`, categorized.turret_avionics.slice(0, 20));
  console.log(`Other nodes count: ${categorized.other.length}`);

  // Save full node and mesh list to JSON for deep analysis
  fs.writeFileSync('C:/Users/admin/.gemini/antigravity-cli/brain/ff2f7233-852c-4693-ac57-2b46770a8bf2/scratch/glb_dump.json', JSON.stringify({
    totalNodes,
    totalMeshes,
    totalMaterials: materialMap.size,
    totalTriangles,
    materials: Array.from(materialMap.entries()),
    nodeNames,
    categorized,
    meshDetails,
  }, null, 2));

  console.log('\nWrote full dump to glb_dump.json');
}, (err) => {
  console.error('Error parsing GLB:', err);
});

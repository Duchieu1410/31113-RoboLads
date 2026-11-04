import fs from 'fs';
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { MeshoptDecoder } from 'three/examples/jsm/libs/meshopt_decoder.module.js';

if (typeof self === 'undefined') {
  global.self = global;
}

const glbPath = 'D:/Robotics/31113-robolads/assets/models/DecodeBot.web.glb';
const glbBuffer = fs.readFileSync(glbPath);
const arrayBuffer = glbBuffer.buffer.slice(glbBuffer.byteOffset, glbBuffer.byteOffset + glbBuffer.byteLength);

const loader = new GLTFLoader();
loader.setMeshoptDecoder(MeshoptDecoder);

loader.parse(arrayBuffer, '', (gltf) => {
  const rawModel = gltf.scene;
  rawModel.updateMatrixWorld(true);
  const rawBox = new THREE.Box3().setFromObject(rawModel);
  const rawCenter = rawBox.getCenter(new THREE.Vector3());

  rawModel.position.sub(rawCenter);

  const c40 = Math.cos((40 * Math.PI) / 180);
  const s40 = Math.sin((40 * Math.PI) / 180);
  const basisMatrix = new THREE.Matrix4().set(
    0,   1, 0,    0,
    c40, 0, -s40, 0,
    s40, 0, c40,  0,
    0,   0, 0,    1
  );

  const alignedGroup = new THREE.Group();
  alignedGroup.applyMatrix4(basisMatrix);
  alignedGroup.add(rawModel);

  const robotRoot = new THREE.Group();
  robotRoot.add(alignedGroup);

  robotRoot.updateMatrixWorld(true);
  const alignedBox = new THREE.Box3().setFromObject(alignedGroup);
  const alignedCenter = alignedBox.getCenter(new THREE.Vector3());
  alignedGroup.position.x -= alignedCenter.x;
  alignedGroup.position.z -= alignedCenter.z;
  alignedGroup.position.y -= alignedBox.min.y + 0.235;
  robotRoot.updateMatrixWorld(true);

  const fullBox = new THREE.Box3().setFromObject(robotRoot);
  console.log('=== ROBOT BOUNDING BOX IN STAGE ===');
  console.log('min:', fullBox.min.toArray().map(n => n.toFixed(3)));
  console.log('max:', fullBox.max.toArray().map(n => n.toFixed(3)));
  console.log('size:', fullBox.getSize(new THREE.Vector3()).toArray().map(n => n.toFixed(3)));
  console.log('center:', fullBox.getCenter(new THREE.Vector3()).toArray().map(n => n.toFixed(3)));

  const nodes = [];
  rawModel.traverse((child) => {
    const box = new THREE.Box3().setFromObject(child);
    const center = box.getCenter(new THREE.Vector3());
    const size = box.getSize(new THREE.Vector3());
    const isMesh = child.isMesh;

    let triCount = 0;
    let matName = '';
    let matColor = '';
    if (isMesh) {
      if (child.geometry.index) {
        triCount = child.geometry.index.count / 3;
      } else if (child.geometry.attributes.position) {
        triCount = child.geometry.attributes.position.count / 3;
      }
      const m = child.material;
      matName = m.name;
      if (m.color) {
        matColor = '#' + m.color.getHexString();
      }
    }

    nodes.push({
      name: child.name,
      type: child.type,
      isMesh,
      triangles: triCount,
      material: matName,
      color: matColor,
      center: center.toArray().map(n => Number(n.toFixed(3))),
      size: size.toArray().map(n => Number(n.toFixed(3))),
    });
  });

  console.log(`\nTraversed ${nodes.length} nodes.`);
  fs.writeFileSync('D:/Robotics/31113-robolads/web/scripts/node_positions.json', JSON.stringify(nodes, null, 2));
  console.log('Saved to web/scripts/node_positions.json');
});

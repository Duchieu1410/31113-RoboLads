import fs from 'fs';
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { MeshoptDecoder } from 'three/examples/jsm/libs/meshopt_decoder.module.js';

const loader = new GLTFLoader();
loader.setMeshoptDecoder(MeshoptDecoder);
const glbBuffer = fs.readFileSync('assets/models/DecodeBot.web.glb');

loader.parse(glbBuffer.buffer, '', (gltf) => {
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

  const box = new THREE.Box3();
  const center = new THREE.Vector3();
  const size = new THREE.Vector3();

  const results = [];
  rawModel.traverse((child) => {
    if (child.isMesh) {
      box.setFromObject(child);
      box.getCenter(center);
      box.getSize(size);
      results.push({
        name: child.name,
        center: [center.x, center.y, center.z],
        size: [size.x, size.y, size.z]
      });
    }
  });

  results.sort((a,b) => b.size[0] - a.size[0]);
  results.forEach(r => {
    console.log(r.name.padEnd(36), 'X:', r.center[0].toFixed(3), 'Y:', r.center[1].toFixed(3), 'Z:', r.center[2].toFixed(3), 'szX:', r.size[0].toFixed(3), 'szY:', r.size[1].toFixed(3), 'szZ:', r.size[2].toFixed(3));
  });
});

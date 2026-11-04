import fs from 'fs';
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { MeshoptDecoder } from 'three/examples/jsm/libs/meshopt_decoder.module.js';

// We can check the model structure directly
const loader = new GLTFLoader();
loader.setMeshoptDecoder(MeshoptDecoder);

const glbBuffer = fs.readFileSync('assets/models/DecodeBot.web.glb');
loader.parse(glbBuffer.buffer, '', (gltf) => {
  const scene = gltf.scene;
  console.log('Total children:', scene.children.length);
  scene.traverse((obj) => {
    if (obj.isMesh) {
      const geo = obj.geometry;
      geo.computeBoundingBox();
      const b = geo.boundingBox;
      const sz = new THREE.Vector3();
      b.getSize(sz);
      // If bounds match the side plates
      if (sz.x > 0.2 || sz.y > 0.2 || sz.z > 0.2) {
        console.log(obj.name.padEnd(35), 'geoSize:', sz.toArray().map(v=>v.toFixed(3)));
      }
    }
  });
});

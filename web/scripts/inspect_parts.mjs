import fs from 'fs';
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { MeshoptDecoder } from 'three/examples/jsm/libs/meshopt_decoder.module.js';

const loader = new GLTFLoader();
loader.setMeshoptDecoder(MeshoptDecoder);
const glbBuffer = fs.readFileSync('assets/models/DecodeBot.web.glb');

loader.parse(glbBuffer.buffer, '', (gltf) => {
  gltf.scene.traverse((obj) => {
    if (obj.isMesh && obj.name.startsWith('Part_1')) {
      const origMat = obj.material;
      console.log(
        obj.name.padEnd(12),
        'origName:', origMat.name || '(unnamed)',
        'origCol:', origMat.color ? origMat.color.getHexString() : 'none',
        'triangles:', obj.geometry.index ? obj.geometry.index.count / 3 : obj.geometry.attributes.position.count / 3
      );
    }
  });
});

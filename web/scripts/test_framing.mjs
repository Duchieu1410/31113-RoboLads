import * as THREE from 'three';

// Robot bounding box in stage
const box = new THREE.Box3(
  new THREE.Vector3(-0.213, -0.235, -0.285),
  new THREE.Vector3(0.213, 0.333, 0.285)
);
const center = box.getCenter(new THREE.Vector3());
const size = box.getSize(new THREE.Vector3());
const sphere = box.getBoundingSphere(new THREE.Sphere());

console.log('Center:', center);
console.log('Size:', size);
console.log('Sphere radius:', sphere.radius);

// Target container aspects:
const viewports = [
  { name: 'mobile 375x480', width: 375, height: 480 },
  { name: 'desktop 800x600', width: 800, height: 600 },
  { name: 'fullscreen 1920x1080', width: 1920, height: 1080 },
];

const fov = 34; // degrees
const vFovRad = THREE.MathUtils.degToRad(fov);

viewports.forEach(vp => {
  const aspect = vp.width / vp.height;
  const hFovRad = 2 * Math.atan(Math.tan(vFovRad / 2) * aspect);
  
  // Padding factor 1.45 reserves room for 60px HUD chips at top and 60px control bar at bottom
  const padding = 1.45;
  const distV = (sphere.radius * padding) / Math.sin(vFovRad / 2);
  const distH = (sphere.radius * padding) / Math.sin(hFovRad / 2);
  const dist = Math.max(distV, distH);

  console.log(`\nViewport: ${vp.name} (aspect ${aspect.toFixed(2)})`);
  console.log(`Required distance: ${dist.toFixed(3)}m`);

  // Default camera position: 3/4 angle (theta = 45 deg), 27 deg elevation (phi = 63 deg)
  const elevDeg = 27;
  const phi = THREE.MathUtils.degToRad(90 - elevDeg);
  const theta = Math.PI / 4;

  const camPos = new THREE.Vector3().setFromSpherical(new THREE.Spherical(dist, phi, theta)).add(center);
  console.log(`Camera pos: [${camPos.x.toFixed(2)}, ${camPos.y.toFixed(2)}, ${camPos.z.toFixed(2)}]`);
  console.log(`Camera Y (above floor y=-0.245): ${(camPos.y - (-0.245)).toFixed(2)}m`);
});

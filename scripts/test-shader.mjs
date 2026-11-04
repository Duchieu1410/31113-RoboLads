import * as THREE from '../web/node_modules/three/build/three.module.js';

const vertexShader = `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = vec4(position, 1.0);
  }
`;

const fragmentShader = `
  uniform sampler2D uColorTexture;
  uniform sampler2D uDepthTexture;
  uniform sampler2D uNormalTexture;
  uniform vec2 uResolution;
  uniform float uNear;
  uniform float uFar;
  uniform float uIsXRay;
  uniform vec3 uPalette[16];

  varying vec2 vUv;

  float linearizeDepth(float d) {
    return (2.0 * uNear * uFar) / (uFar + uNear - (d * 2.0 - 1.0) * (uFar - uNear));
  }

  vec3 quantizeToPalette(vec3 c) {
    vec3 bestCol = uPalette[0];
    float minDist = 99999.0;
    vec3 weights = vec3(0.299, 0.587, 0.114);
    for (int i = 0; i < 16; i++) {
      vec3 diff = (c - uPalette[i]) * weights;
      float dist = dot(diff, diff);
      if (dist < minDist) {
        minDist = dist;
        bestCol = uPalette[i];
      }
    }
    return bestCol;
  }

  void main() {
    vec4 colorSample = texture2D(uColorTexture, vUv);
    float rawDepth = texture2D(uDepthTexture, vUv).r;

    if (colorSample.a < 0.05 || rawDepth >= 0.9999) {
      gl_FragColor = vec4(0.0, 0.0, 0.0, 0.0);
      return;
    }

    vec2 texel = 1.0 / uResolution;

    if (uIsXRay > 0.5) {
      gl_FragColor = colorSample;
      return;
    }

    float dCenter = linearizeDepth(rawDepth);
    float dLeft   = linearizeDepth(texture2D(uDepthTexture, vUv + vec2(-texel.x, 0.0)).r);
    float dRight  = linearizeDepth(texture2D(uDepthTexture, vUv + vec2( texel.x, 0.0)).r);
    float dUp     = linearizeDepth(texture2D(uDepthTexture, vUv + vec2(0.0,  texel.y)).r);
    float dDown   = linearizeDepth(texture2D(uDepthTexture, vUv + vec2(0.0, -texel.y)).r);

    float depthEdge = (abs(dLeft - dRight) + abs(dUp - dDown)) * 0.5;
    float depthThresh = 0.038 * max(1.0, dCenter * 0.9);
    bool isDepthEdge = depthEdge > depthThresh;

    vec3 nCenter = texture2D(uNormalTexture, vUv).rgb * 2.0 - 1.0;
    vec3 nLeft   = texture2D(uNormalTexture, vUv + vec2(-texel.x, 0.0)).rgb * 2.0 - 1.0;
    vec3 nRight  = texture2D(uNormalTexture, vUv + vec2( texel.x, 0.0)).rgb * 2.0 - 1.0;
    vec3 nUp     = texture2D(uNormalTexture, vUv + vec2(0.0,  texel.y)).rgb * 2.0 - 1.0;
    vec3 nDown   = texture2D(uNormalTexture, vUv + vec2(0.0, -texel.y)).rgb * 2.0 - 1.0;

    float normalEdge = (length(nLeft - nRight) + length(nUp - nDown)) * 0.5;
    bool isNormalEdge = normalEdge > 0.40;

    float rawLeft  = texture2D(uDepthTexture, vUv + vec2(-texel.x, 0.0)).r;
    float rawRight = texture2D(uDepthTexture, vUv + vec2( texel.x, 0.0)).r;
    float rawUp    = texture2D(uDepthTexture, vUv + vec2(0.0,  texel.y)).r;
    float rawDown  = texture2D(uDepthTexture, vUv + vec2(0.0, -texel.y)).r;
    bool isSilhouette = (rawLeft >= 0.999 || rawRight >= 0.999 || rawUp >= 0.999 || rawDown >= 0.999);

    if (isSilhouette || isDepthEdge || isNormalEdge) {
      gl_FragColor = vec4(0.08, 0.08, 0.12, 1.0);
      return;
    }

    vec3 baseColor = colorSample.rgb;
    float lum = dot(baseColor, vec3(0.299, 0.587, 0.114));

    float toonScale = 0.38;
    if (lum >= 0.62) {
      toonScale = 1.18;
    } else if (lum >= 0.38) {
      toonScale = 0.88;
    } else if (lum >= 0.18) {
      toonScale = 0.58;
    }

    vec3 steppedColor = baseColor * (toonScale / max(0.02, lum));
    vec3 quantized = quantizeToPalette(steppedColor);

    gl_FragColor = vec4(quantized, colorSample.a);
  }
`;

const mat = new THREE.ShaderMaterial({
  vertexShader,
  fragmentShader,
  uniforms: {
    uColorTexture: { value: null },
    uDepthTexture: { value: null },
    uNormalTexture: { value: null },
    uResolution: { value: new THREE.Vector2(320, 180) },
    uNear: { value: 0.05 },
    uFar: { value: 25.0 },
    uIsXRay: { value: 0.0 },
    uPalette: { value: new Array(16).fill(new THREE.Vector3(0, 0, 0)) },
  },
});

console.log('ShaderMaterial initialized without errors!');

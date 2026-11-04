'use client';

import React, { useEffect, useRef, useState, useCallback, useMemo } from 'react';
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { useAdvancements, Tooltip } from '@/components/pixel';
import { playPixelSound } from '@/lib/pixel-sound';
import { MeshoptDecoder } from 'three/examples/jsm/libs/meshopt_decoder.module.js';
import { Orbit, Layers, Eye, RotateCcw, Cpu, Sparkles } from 'lucide-react';

export type RenderMode = 'pixel' | 'cad';
export type InspectMode = RenderMode | 'blueprint' | 'exploded';

export interface RobotChapter {
  id: number;
  code: string;
  title: string;
  subtitle: string;
  annotationLabel: string;
  annotationValue: string;
  description: string;
  specs: string[];
  worldAnchor: [number, number, number];
}

export const ROBOT_CHAPTERS: RobotChapter[] = [
  {
    id: 0,
    code: '01 // PARAMETRIC ASSEMBLY',
    title: 'DECODEBOT 2026',
    subtitle: 'Full FTC Competition Assembly',
    annotationLabel: 'CAD ASSEMBLY',
    annotationValue: 'PARAMETRIC 3D',
    description:
      'Engineered in Onshape by HSGS RoboLads for the FIRST Tech Challenge competition.',
    specs: [
      'Parametric solid model designed in Onshape CAD cloud',
      'Engineered by HSGS RoboLads (FTC Team #31113)',
      'Precision mechanical clearances and hardware assemblies',
    ],
    worldAnchor: [0, 0.049, 0],
  },
];

export const DEFAULT_SUBSYSTEM_ANCHORS: [number, number, number][] = [
  [0, 0.049, 0],
];

export interface SubsystemView {
  theta: number;
  phi: number;
  distFactor: number;
  lookTarget: THREE.Vector3;
}

export const SUBSYSTEM_VIEWS: SubsystemView[] = [
  {
    theta: THREE.MathUtils.degToRad(45),
    phi: THREE.MathUtils.degToRad(62),
    distFactor: 1.0,
    lookTarget: new THREE.Vector3(0, 0.049, 0),
  },
];

export function getSubsystemForMesh(meshName: string): number {
  if (
    meshName.startsWith('5647') ||
    meshName === 'Part_1_8' ||
    meshName.startsWith('REV-31-') ||
    meshName.startsWith('mesh37226') ||
    meshName.startsWith('mesh37525') ||
    meshName.startsWith('mesh2950') ||
    meshName.startsWith('mesh6075') ||
    meshName.startsWith('mesh9782')
  ) {
    return 3; // Avionics & Turret
  }

  if (
    meshName.startsWith('2800-0004-0030') ||
    meshName.includes('EnclosureTopThin') ||
    meshName.startsWith('2824-') ||
    meshName === 'Part_1_3'
  ) {
    return 2; // Intake
  }

  if (
    meshName.includes('Belt') ||
    meshName.includes('wheel_adap') ||
    meshName.includes('Magnet') ||
    meshName.includes('sticker') ||
    meshName.startsWith('mesh40762') ||
    meshName === 'Board' ||
    meshName.startsWith('M25_') ||
    meshName === 'Shaft' ||
    meshName.includes('Rubber')
  ) {
    return 1; // Drivetrain
  }

  return 0; // Chassis fallback (plates, rails, standoffs, hardware)
}

export interface DecodeBotStageProps {
  /** Normalized scroll progress [0..1] across the robot showcase */
  scrollProgress?: number;
  /** Currently active chapter index [0..3] */
  activeChapter?: number;
  /** Callback when user clicks a 3D hotspot or chapter button */
  onSelectChapter?: (chapterIndex: number) => void;
  /** When true, renders in ambient companion mode (lightweight HUD, continuous slow turntable rotation, decoupled from scroll) */
  ambientMode?: boolean;
  /** When true, renders interactive 3D hotspot callouts (defaults to false) */
  showHotspots?: boolean;
  /** Callback to trigger full CAD modal inspection */
  onOpenModal?: () => void;
  /** Custom model URL (default: '/assets/models/DecodeBot.opt.glb') */
  modelUrl?: string;
  /** When true, shows the PIXEL / REAL CAD mode toggle buttons */
  showModeToggle?: boolean;
  /** Initial render mode ('pixel' or 'cad', default: 'pixel') */
  initialRenderMode?: RenderMode;
  /** When true, hides all overlay telemetry, badges, and bottom control bars, leaving only the clean 3D model */
  minimal?: boolean;
}

interface MeshExplosionRecord {
  mesh: THREE.Mesh;
  subsystem: number;
  basePos: THREE.Vector3;
  explodeVec: THREE.Vector3;
  originalMat: THREE.Material | THREE.Material[];
  pixelMat: THREE.Material;
  blueprintMat: THREE.MeshStandardMaterial;
  basePixelColor: THREE.Color;
  baseOrigColor?: THREE.Color;
  baseRoughness: number;
}

/**
 * ============================================================================
 * PIXEL CAD TUNING CONTROLS
 * Easily adjust brightness, contrast, lighting, and shading in one place.
 * You can tweak these values anytime to dial in your preferred aesthetic.
 * ============================================================================
 */
export const CAD_LIGHTING_CONFIG = {
  // Global Exposure (1.0 = standard neutral; 0.9 = dimmer, 1.2 = very bright)
  exposure: 1.05,

  // Primary Key Light (crisp directional light from top-right-front)
  keyLightIntensity: 3,
  keyLightColor: 0xf8fafc,

  // Soft Fill Light (front-left fill to keep shadowed mechanics readable without wash out)
  fillLightIntensity: 0.95,
  fillLightColor: 0xdbeafe,

  // Ambient Sky & Ground Bounce
  hemiIntensity: 0.75,
  hemiSkyColor: 0xe2e8f0,
  hemiGroundColor: 0x222634,

  // Warm Amber Silhouette Rim Light (placed behind the robot)
  rimIntensity: 1.7,
  rimColor: 0xfbbf24,

  // Toon Shading & Palette Controls
  toonMinShadow: 0.30,       // Minimum shadow luminance floor (0.20 = deep shadow, 0.45 = very flat/light)
  toonBrightnessMult: 1.0,   // Stepped color multiplier (1.0 = normal, 1.15 = boosted)
  paletteMixRatio: 0.45,     // Balance between 16-color retro palette (0.0) and smooth posterized (1.0)
  edgeDarkening: 0.82,       // Crease edge factor (0.70 = dark creases, 0.90 = faint creases)
};

// Design system tokens from docs/pixel-redesign.md Section 5 - calibrated for balanced mechanical contrast
const PIXEL_TOKENS = {
  night: 0x060816,
  nightPanel: 0x0b0f24,
  bedrock: 0x1a1a24,
  stone900: 0x2b2b35,
  stone700: 0x444452,
  stone600: 0x585868,
  stone500: 0x707080,
  stone400: 0x8a8e9c,
  stone300: 0xa4aab8, // Balanced anodized aluminum plate (crisp contrast without white washout)
  stone200: 0xc4c9d6, // Highlight aluminum
  stone100: 0xe6e9f2,
  grass: 0x65a30d,
  grassLight: 0x8fd14f,
  dirt: 0x8a5a2e,
  dirtDark: 0x5b3a1e,
  gold: 0xfbbf24,
  diamond: 0x38bdf8,
  redstone: 0xef4444,
  cobalt: 0x2563eb, // Balanced royal/electric blue
  parchment: 0xe8d9a8,
};

function getSiteTokenColor(cssVarName: string, fallback: number): THREE.Color {
  if (typeof window !== 'undefined') {
    const styleVal = getComputedStyle(document.documentElement).getPropertyValue(cssVarName).trim();
    if (styleVal) {
      return new THREE.Color(styleVal);
    }
  }
  return new THREE.Color(fallback);
}

function createPixelMaterial(meshName: string, originalColor?: THREE.Color): THREE.Material {
  // 1. Articulated scoring hood: team signature vivid cobalt blue
  if (meshName.startsWith('5647') || meshName === 'Part_1_8') {
    return new THREE.MeshStandardMaterial({
      color: getSiteTokenColor('--cobalt', PIXEL_TOKENS.cobalt),
      roughness: 0.32,
      metalness: 0.20,
    });
  }

  // 2. Drivetrain synchronous HTD belts: vivid bright redstone accent
  if (meshName.includes('Belt')) {
    return new THREE.MeshStandardMaterial({
      color: getSiteTokenColor('--redstone', PIXEL_TOKENS.redstone),
      roughness: 0.65,
      metalness: 0.05,
    });
  }

  // 3. Polycarbonate protective guard shield: transparent diamond cyan accent
  if (meshName.includes('EnclosureTopThin')) {
    return new THREE.MeshStandardMaterial({
      color: getSiteTokenColor('--diamond', PIXEL_TOKENS.diamond),
      roughness: 0.10,
      metalness: 0.08,
      transparent: true,
      opacity: 0.65,
      depthWrite: false, // Prevents alpha sorting glitches on interior parts
    });
  }

  // 4. Ribbed elastomer intake rollers: bright lime grass green accent
  if (meshName.startsWith('2800-0004-0030')) {
    return new THREE.MeshStandardMaterial({
      color: getSiteTokenColor('--grass-light', PIXEL_TOKENS.grassLight),
      roughness: 0.70,
      metalness: 0.02,
    });
  }

  // 5. If the CAD mesh has an authentic color from Onshape, preserve and stylize it
  if (originalColor) {
    const col = originalColor.clone();
    // Lift any extremely dark hardware so it never disappears into pitch black
    const lum = col.r * 0.299 + col.g * 0.587 + col.b * 0.114;
    if (lum < 0.22) {
      col.addScalar(0.22 - lum);
    }
    return new THREE.MeshStandardMaterial({
      color: col,
      roughness: 0.35,
      metalness: 0.15,
    });
  }

  // 6. Default clean brushed mechanical fallback
  return new THREE.MeshStandardMaterial({
    color: getSiteTokenColor('--stone-300', PIXEL_TOKENS.stone300),
    roughness: 0.35,
    metalness: 0.15,
  });
}

/**
 * Generates a 16x16 procedural pixel-stone canvas tile with beveled edges
 * drawn directly from site palette tokens (#3c3c46, #464651, #33333c, #50505b, #2b2b33).
 */
function createProceduralStoneTexture(repeatX = 4, repeatY = 4): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 16;
  canvas.height = 16;
  const ctx = canvas.getContext('2d');
  if (ctx) {
    const colors = ['#3a3a46', '#464654', '#32323c', '#525262', '#2a2a34'];
    let s = 31113;
    const rng = () => {
      s = (Math.imul(s, 1664525) + 1013904223) >>> 0;
      return s / 4294967296;
    };

    for (let y = 0; y < 16; y++) {
      for (let x = 0; x < 16; x++) {
        let colorIdx = 0;
        const r = rng();
        // 1-pixel outer bevel: top & left lighter edge, bottom & right darker edge
        if (y === 0 || x === 0) {
          colorIdx = r < 0.65 ? 1 : 3;
        } else if (y === 15 || x === 15) {
          colorIdx = r < 0.65 ? 4 : 2;
        } else {
          colorIdx = r < 0.52 ? 0 : r < 0.74 ? 1 : r < 0.88 ? 2 : 3;
        }
        ctx.fillStyle = colors[colorIdx];
        ctx.fillRect(x, y, 1, 1);
      }
    }
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.magFilter = THREE.NearestFilter;
  texture.minFilter = THREE.NearestFilter;
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(repeatX, repeatY);
  texture.needsUpdate = true;
  return texture;
}

/**
 * Generates a procedural 32x32 toon/pixel contact blob shadow
 * using stepped opacity levels directly beneath the robot footprint.
 */
function createProceduralBlobShadowTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 32;
  canvas.height = 32;
  const ctx = canvas.getContext('2d');
  if (ctx) {
    ctx.clearRect(0, 0, 32, 32);
    for (let y = 0; y < 32; y++) {
      for (let x = 0; x < 32; x++) {
        const dx = (x - 15.5) / 14.5;
        const dy = (y - 15.5) / 14.5;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < 1.0) {
          let alpha = 0;
          if (dist < 0.45) alpha = 0.78;
          else if (dist < 0.75) alpha = 0.48;
          else if (dist < 0.98) alpha = 0.22;

          if (alpha > 0) {
            ctx.fillStyle = `rgba(5, 8, 22, ${alpha})`;
            ctx.fillRect(x, y, 1, 1);
          }
        }
      }
    }
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.magFilter = THREE.NearestFilter;
  texture.minFilter = THREE.NearestFilter;
  texture.needsUpdate = true;
  return texture;
}

/**
 * Generates an authentic 4x4 Bayer ordered dither vignette data URL (zero smooth gradients).
 * Center is completely transparent; edges and corners shade through stepped pixel dithering into dark world color.
 */
function generateDitherVignetteDataUrl(): string {
  if (typeof document === 'undefined') return '';
  const canvas = document.createElement('canvas');
  canvas.width = 120;
  canvas.height = 70;
  const ctx = canvas.getContext('2d');
  if (!ctx) return '';

  const bayer4 = [
    [0, 8, 2, 10],
    [12, 4, 14, 6],
    [3, 11, 1, 9],
    [15, 7, 13, 5],
  ];

  const imgData = ctx.createImageData(120, 70);
  const data = imgData.data;

  for (let y = 0; y < 70; y++) {
    for (let x = 0; x < 120; x++) {
      const nx = x / 60 - 1.0;
      const ny = y / 35 - 1.0;
      const dist = Math.sqrt(nx * nx * 0.85 + ny * ny * 1.15);

      let darkFactor = 0;
      if (dist > 0.65) {
        darkFactor = Math.min(1.0, (dist - 0.65) / 0.65);
      }

      const threshold = bayer4[y % 4][x % 4] / 16;
      const idx = (y * 120 + x) * 4;

      if (darkFactor > threshold) {
        data[idx] = 2;
        data[idx + 1] = 3;
        data[idx + 2] = 8;
        data[idx + 3] = Math.min(220, Math.round(200 * (darkFactor - threshold + 0.3)));
      } else {
        data[idx + 3] = 0;
      }
    }
  }

  ctx.putImageData(imgData, 0, 0);
  return canvas.toDataURL('image/png');
}

export function DecodeBotStage({
  scrollProgress = 0,
  activeChapter = 0,
  onSelectChapter,
  ambientMode = false,
  showHotspots = false,
  onOpenModal,
  modelUrl,
  showModeToggle = false,
  initialRenderMode = 'pixel',
  minimal = false,
}: DecodeBotStageProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const pinRefs = useRef<(HTMLDivElement | null)[]>([]);

  const [mounted, setMounted] = useState<boolean>(false);
  useEffect(() => {
    setMounted(true);
  }, []);

  const [loadState, setLoadState] = useState<'idle' | 'loading' | 'ready' | 'error'>('idle');
  const [loadPct, setLoadPct] = useState<number>(0);
  const [renderMode, setRenderMode] = useState<RenderMode>(initialRenderMode);
  const [isXRay, setIsXRay] = useState<boolean>(false);
  const [isExploded, setIsExploded] = useState<boolean>(false);
  const [isDragging, setIsDragging] = useState(false);
  const { unlock } = useAdvancements();

  const vignetteDataUrl = useMemo(() => generateDitherVignetteDataUrl(), []);

  // Framing & Spherical Orbit Constants
  const DEFAULT_THETA = Math.PI / 4; // 45° azimuth (3/4 isometric viewpoint)
  const DEFAULT_PHI = THREE.MathUtils.degToRad(68); // 22° elevation for heroic mechanical profile
  const DEFAULT_LOOK_TARGET = new THREE.Vector3(0, ambientMode || minimal ? 0.095 : 0.049, 0); // Model center in stage
  const BOUNDING_RADIUS = 0.455; // DecodeBot bounding sphere radius (m)

  // Mutable state bridged into the rAF loop without re-binding WebGL
  const stateRef = useRef({
    scrollProgress: 0,
    smoothedProgress: 0,
    activeChapter: 0,
    ambientMode: false,
    showHotspots: false,
    renderMode: initialRenderMode as RenderMode,
    isXRay: false,
    isExploded: false,
    explodeFactor: 0,
    targetTheta: DEFAULT_THETA,
    currentTheta: DEFAULT_THETA,
    targetPhi: DEFAULT_PHI,
    currentPhi: DEFAULT_PHI,
    targetDistance: 2.26,
    currentDistance: 2.26,
    defaultDistance: 2.26,
    lookTarget: DEFAULT_LOOK_TARGET.clone(),
    targetLookTarget: DEFAULT_LOOK_TARGET.clone(),
    userSelectedSubsystem: null as number | null,
    isPointerDown: false,
    lastPointerX: 0,
    lastPointerY: 0,
    lastInteractionTime: 0,
    isInView: false,
    isDocHidden: false,
    reducedMotion: false,
  });

  const updateMeshHighlightDimRef = useRef<((focusedIdx: number | null) => void) | null>(null);

  const selectSubsystem = useCallback((idx: number) => {
    const st = stateRef.current;
    st.userSelectedSubsystem = idx;
    const view = SUBSYSTEM_VIEWS[idx];
    if (view) {
      st.targetTheta = view.theta;
      st.targetPhi = view.phi;
      st.targetDistance = st.defaultDistance * view.distFactor;
      st.targetLookTarget.copy(view.lookTarget);
      if (st.reducedMotion) {
        st.currentTheta = view.theta;
        st.currentPhi = view.phi;
        st.currentDistance = st.defaultDistance * view.distFactor;
        st.lookTarget.copy(view.lookTarget);
      }
    }
    st.lastInteractionTime = performance.now();
    updateMeshHighlightDimRef.current?.(idx);
  }, []);

  const handleResetView = useCallback(() => {
    const st = stateRef.current;
    st.userSelectedSubsystem = null;
    st.targetTheta = DEFAULT_THETA;
    st.targetPhi = DEFAULT_PHI;
    st.targetDistance = st.defaultDistance;
    st.targetLookTarget.copy(DEFAULT_LOOK_TARGET);
    st.renderMode = initialRenderMode;
    st.isXRay = false;
    st.isExploded = false;
    if (st.reducedMotion) {
      st.currentTheta = DEFAULT_THETA;
      st.currentPhi = DEFAULT_PHI;
      st.currentDistance = st.defaultDistance;
      st.lookTarget.copy(DEFAULT_LOOK_TARGET);
    }
    st.lastInteractionTime = performance.now();
    setRenderMode(initialRenderMode);
    setIsXRay(false);
    setIsExploded(false);
    updateMeshHighlightDimRef.current?.(null);
  }, [initialRenderMode]);

  const isFirstMountRef = useRef(true);
  useEffect(() => {
    stateRef.current.scrollProgress = scrollProgress;
    stateRef.current.activeChapter = activeChapter;
    stateRef.current.ambientMode = ambientMode;
    stateRef.current.showHotspots = showHotspots;

    // Ambient mode maintains continuous slow rotation and never snaps to subsystems
    if (ambientMode) {
      return;
    }

    if (isFirstMountRef.current) {
      isFirstMountRef.current = false;
      selectSubsystem(activeChapter);
      return;
    }
    selectSubsystem(activeChapter);
  }, [scrollProgress, activeChapter, ambientMode, showHotspots, selectSubsystem]);

  useEffect(() => {
    stateRef.current.renderMode = renderMode;
    stateRef.current.isXRay = isXRay;
    stateRef.current.isExploded = isExploded;
  }, [renderMode, isXRay, isExploded]);

  const handleStageKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLDivElement>) => {
      const st = stateRef.current;
      st.lastInteractionTime = performance.now();
      if (e.key === 'ArrowLeft') {
        e.preventDefault();
        st.targetTheta -= 0.16;
      } else if (e.key === 'ArrowRight') {
        e.preventDefault();
        st.targetTheta += 0.16;
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        st.targetPhi = Math.max(0.20, st.targetPhi - 0.10);
      } else if (e.key === 'ArrowDown') {
        e.preventDefault();
        st.targetPhi = Math.min(1.48, st.targetPhi + 0.10);
      } else if (e.key === '+' || e.key === '=' || e.key === ']') {
        e.preventDefault();
        st.targetDistance = Math.max(st.defaultDistance * 0.50, st.targetDistance - 0.15);
      } else if (e.key === '-' || e.key === '_' || e.key === '[') {
        e.preventDefault();
        st.targetDistance = Math.min(st.defaultDistance * 1.60, st.targetDistance + 0.15);
      } else if (e.key === 'r' || e.key === 'R') {
        handleResetView();
      }
    },
    [handleResetView]
  );

  useEffect(() => {
    const container = containerRef.current;
    const canvas = canvasRef.current;
    if (!container || !canvas) return;

    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    stateRef.current.reducedMotion = mq.matches;
    const onMqChange = (e: MediaQueryListEvent) => {
      stateRef.current.reducedMotion = e.matches;
    };
    mq.addEventListener('change', onMqChange);

    const onVisibilityChange = () => {
      stateRef.current.isDocHidden = document.hidden;
    };
    document.addEventListener('visibilitychange', onVisibilityChange);

    // 1. Scene (no smooth gradients or atmospheric fog)
    const scene = new THREE.Scene();

    // 2. Camera
    const camera = new THREE.PerspectiveCamera(
      36,
      Math.max(1, container.clientWidth) / Math.max(1, container.clientHeight),
      0.05,
      25
    );

    // 3. Renderer
    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({
        canvas,
        antialias: true,
        alpha: true,
        powerPreference: 'high-performance',
      });
    } catch {
      setLoadState('error');
      return;
    }

    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.5));
    renderer.setSize(container.clientWidth, container.clientHeight, false);
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = CAD_LIGHTING_CONFIG.exposure;
    renderer.outputColorSpace = THREE.SRGBColorSpace;

    // 4. Studio Lighting Rig: Cool-white key, balanced fill, amber rim, and soft ambient hemisphere
    const hemiLight = new THREE.HemisphereLight(
      CAD_LIGHTING_CONFIG.hemiSkyColor,
      CAD_LIGHTING_CONFIG.hemiGroundColor,
      CAD_LIGHTING_CONFIG.hemiIntensity
    );
    scene.add(hemiLight);

    // Primary cool-white key light: crisp neutral directional illumination
    const keyLight = new THREE.DirectionalLight(
      CAD_LIGHTING_CONFIG.keyLightColor,
      CAD_LIGHTING_CONFIG.keyLightIntensity
    );
    keyLight.position.set(2.4, 3.6, 2.8);
    keyLight.target.position.set(0, 0.049, 0);
    scene.add(keyLight);
    scene.add(keyLight.target);

    // Dedicated cool fill light (front-left): prevents opposite-side mechanisms from sinking into dark shadows
    const fillLight = new THREE.DirectionalLight(
      CAD_LIGHTING_CONFIG.fillLightColor,
      CAD_LIGHTING_CONFIG.fillLightIntensity
    );
    fillLight.position.set(-2.6, 2.8, 2.2);
    fillLight.target.position.set(0, 0.049, 0);
    scene.add(fillLight);
    scene.add(fillLight.target);

    // Warm amber rim light: strictly behind the robot to highlight silhouette edges only
    const rimGoldLight = new THREE.DirectionalLight(
      CAD_LIGHTING_CONFIG.rimColor,
      CAD_LIGHTING_CONFIG.rimIntensity
    );
    rimGoldLight.position.set(-2.8, 2.2, -3.2);
    rimGoldLight.target.position.set(0, 0.049, 0);
    scene.add(rimGoldLight);
    scene.add(rimGoldLight.target);

    const setTimeLighting = (time: 'day' | 'sunset' | 'night') => {
      if (time === 'day') {
        hemiLight.color.setHex(0xf8fafc);
        hemiLight.groundColor.setHex(0x384152);
        hemiLight.intensity = CAD_LIGHTING_CONFIG.hemiIntensity * 1.15;
        keyLight.intensity = CAD_LIGHTING_CONFIG.keyLightIntensity * 1.1;
        fillLight.intensity = CAD_LIGHTING_CONFIG.fillLightIntensity * 1.1;
        rimGoldLight.intensity = CAD_LIGHTING_CONFIG.rimIntensity * 0.85;
      } else if (time === 'sunset') {
        hemiLight.color.setHex(0xfef3c7);
        hemiLight.groundColor.setHex(0x302824);
        hemiLight.intensity = CAD_LIGHTING_CONFIG.hemiIntensity * 0.9;
        keyLight.intensity = CAD_LIGHTING_CONFIG.keyLightIntensity * 0.95;
        fillLight.intensity = CAD_LIGHTING_CONFIG.fillLightIntensity * 0.9;
        rimGoldLight.intensity = CAD_LIGHTING_CONFIG.rimIntensity * 1.25;
        rimGoldLight.color.setHex(0xf59e0b);
      } else {
        hemiLight.color.setHex(CAD_LIGHTING_CONFIG.hemiSkyColor);
        hemiLight.groundColor.setHex(CAD_LIGHTING_CONFIG.hemiGroundColor);
        hemiLight.intensity = CAD_LIGHTING_CONFIG.hemiIntensity;
        keyLight.intensity = CAD_LIGHTING_CONFIG.keyLightIntensity;
        fillLight.intensity = CAD_LIGHTING_CONFIG.fillLightIntensity;
        rimGoldLight.intensity = CAD_LIGHTING_CONFIG.rimIntensity;
        rimGoldLight.color.setHex(CAD_LIGHTING_CONFIG.rimColor);
      }
    };

    const onTimeChange = (e: Event) => {
      const custom = e as CustomEvent<{ time: 'day' | 'sunset' | 'night' }>;
      if (custom.detail?.time) {
        setTimeLighting(custom.detail.time);
      }
    };
    window.addEventListener('pixel-time-change', onTimeChange);

    // 5. Square Pixel-Stone Platform & Contact Blob Shadow (centered directly under robot footprint)
    const platformGroup = new THREE.Group();
    platformGroup.position.y = -0.245;
    scene.add(platformGroup);

    // Procedural 16x16 pixel-stone canvas textures (nearest-neighbor filtered, zero game assets)
    const stoneTopTex = createProceduralStoneTexture(4, 4);
    const stoneSideTex = createProceduralStoneTexture(4, 1);

    const platformMatTop = new THREE.MeshStandardMaterial({
      map: stoneTopTex,
      roughness: 0.82,
      metalness: 0.05,
    });
    const platformMatSide = new THREE.MeshStandardMaterial({
      map: stoneSideTex,
      roughness: 0.82,
      metalness: 0.05,
    });
    const platformMaterials = [
      platformMatSide, // +X
      platformMatSide, // -X
      platformMatTop,  // +Y (top surface)
      platformMatSide, // -Y (bottom)
      platformMatSide, // +Z
      platformMatSide, // -Z
    ];

    const platformSize = ambientMode || minimal ? 0.80 : 0.84;
    const platformHeight = 0.08;
    const platformGeo = new THREE.BoxGeometry(platformSize, platformHeight, platformSize);
    const platformMesh = new THREE.Mesh(platformGeo, platformMaterials);
    platformMesh.position.set(0, -platformHeight / 2, 0); // Top surface flush at y = 0
    platformGroup.add(platformMesh);

    // Dark stepped pixel/toon contact blob shadow directly under the robot footprint
    const shadowTex = createProceduralBlobShadowTexture();
    const shadowGeo = new THREE.PlaneGeometry(0.52, 0.64);
    shadowGeo.rotateX(-Math.PI / 2);
    const shadowMat = new THREE.MeshBasicMaterial({
      map: shadowTex,
      transparent: true,
      depthWrite: false,
    });
    const shadowMesh = new THREE.Mesh(shadowGeo, shadowMat);
    shadowMesh.position.set(0, 0.001, 0); // Immediately above platform surface to prevent z-fighting
    platformGroup.add(shadowMesh);

    // 6. Robot Assembly Hierarchy & Alignment
    const robotRoot = new THREE.Group();
    scene.add(robotRoot);

    const explosionRecords: MeshExplosionRecord[] = [];
    const robotMeshList: THREE.Mesh[] = [];

    // Assembly anchor
    const dynamicAnchors = DEFAULT_SUBSYSTEM_ANCHORS.map(
      (a) => new THREE.Vector3(...a)
    );

    const updateMeshHighlightDim = (focusedIdx: number | null) => {
      for (let i = 0; i < explosionRecords.length; i++) {
        const rec = explosionRecords[i];
        const isFocused = focusedIdx === null || rec.subsystem === focusedIdx;

        // 1. Pixel Material
        const pMat = rec.pixelMat as THREE.MeshStandardMaterial;
        if (pMat.color) {
          if (focusedIdx === null) {
            pMat.color.copy(rec.basePixelColor);
            pMat.emissive.setHex(0x000000);
            pMat.roughness = rec.baseRoughness;
          } else if (isFocused) {
            pMat.color.copy(rec.basePixelColor);
            pMat.emissive.setHex(0x332610);
            pMat.emissiveIntensity = 0.35;
            pMat.roughness = rec.baseRoughness;
          } else {
            pMat.color.copy(rec.basePixelColor).multiplyScalar(0.32);
            pMat.emissive.setHex(0x000000);
            pMat.roughness = 0.90;
          }
        }

        // 2. Original CAD PBR Material
        const oMat = Array.isArray(rec.originalMat) ? rec.originalMat[0] : rec.originalMat;
        if ((oMat as THREE.MeshStandardMaterial)?.color && rec.baseOrigColor) {
          const stdMat = oMat as THREE.MeshStandardMaterial;
          if (focusedIdx === null || isFocused) {
            stdMat.color.copy(rec.baseOrigColor);
            if (stdMat.emissive) {
              stdMat.emissive.setHex(isFocused && focusedIdx !== null ? 0x221a08 : 0x000000);
            }
          } else {
            stdMat.color.copy(rec.baseOrigColor).multiplyScalar(0.32);
            if (stdMat.emissive) stdMat.emissive.setHex(0x000000);
          }
        }

        // 3. X-Ray Blueprint Material
        if (focusedIdx === null || isFocused) {
          rec.blueprintMat.color.setHex(0x38bdf8);
          rec.blueprintMat.emissive.setHex(0x38bdf8);
          rec.blueprintMat.opacity = isFocused && focusedIdx !== null ? 0.88 : 0.58;
        } else {
          rec.blueprintMat.color.setHex(0x0f2937);
          rec.blueprintMat.emissive.setHex(0x000000);
          rec.blueprintMat.opacity = 0.16;
        }
      }
    };
    updateMeshHighlightDimRef.current = updateMeshHighlightDim;

    // 7. Progressive Model Loader: fetches /assets/models/DecodeBot.web.glb when near viewport or idle
    let isDisposed = false;
    let modelLoadStarted = false;

    const startModelLoad = () => {
      if (modelLoadStarted || isDisposed) return;
      modelLoadStarted = true;
      setLoadState('loading');
      setLoadPct(12);

      const loader = new GLTFLoader();
      loader.setMeshoptDecoder(MeshoptDecoder);

      const targetModel = modelUrl || '/assets/models/DecodeBot.opt.glb';
      loader.load(
        targetModel,
        (gltf) => {
          if (isDisposed) return;

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
          robotRoot.add(alignedGroup);

          robotRoot.updateMatrixWorld(true);
          const alignedBox = new THREE.Box3().setFromObject(alignedGroup);
          const alignedCenter = alignedBox.getCenter(new THREE.Vector3());
          alignedGroup.position.x -= alignedCenter.x;
          alignedGroup.position.z -= alignedCenter.z;
          alignedGroup.position.y -= alignedBox.min.y + 0.235;
          robotRoot.updateMatrixWorld(true);

          const robotCenterWorld = new THREE.Vector3(0, 0.02, 0);
          const meshBox = new THREE.Box3();
          const meshCenterWorld = new THREE.Vector3();
          const invBasis = basisMatrix.clone().invert();

          rawModel.traverse((child) => {
            if ((child as THREE.Mesh).isMesh) {
              const mesh = child as THREE.Mesh;
              const sub = getSubsystemForMesh(mesh.name);
              (mesh as any).__subsystem = sub;
              robotMeshList.push(mesh);

              meshBox.setFromObject(mesh);
              meshBox.getCenter(meshCenterWorld);

              // Center point
              if (dynamicAnchors[0]) {
                dynamicAnchors[0].set(0, 0.049, 0);
              }

              // 1. Preserve original Onshape CAD materials for REAL CAD mode
              const origMat = (
                Array.isArray(mesh.material)
                  ? mesh.material.map((m) => m.clone())
                  : mesh.material.clone()
              ) as THREE.Material | THREE.Material[];

              const oSingle = Array.isArray(origMat) ? origMat[0] : origMat;
              const baseOrigColor = (oSingle as THREE.MeshStandardMaterial)?.color
                ? (oSingle as THREE.MeshStandardMaterial).color.clone()
                : undefined;

              // 2. Generate remapped materials using authentic CAD colors with pixel styling
              const pixelMat = createPixelMaterial(mesh.name, baseOrigColor);

              // 3. X-Ray Blueprint wireframe material
              const blueprintMat = new THREE.MeshStandardMaterial({
                color: 0x38bdf8,
                emissive: 0x38bdf8,
                emissiveIntensity: 0.45,
                wireframe: true,
                transparent: true,
                opacity: 0.58,
              });

              // Apply pixelMat by default
              mesh.material = pixelMat;

              const pStd = pixelMat as THREE.MeshStandardMaterial;
              const basePixelColor = pStd.color ? pStd.color.clone() : new THREE.Color(0xa8a8b3);
              const baseRoughness = pStd.roughness ?? 0.5;

              const worldDelta = meshCenterWorld.clone().sub(robotCenterWorld);
              if (worldDelta.lengthSq() < 0.0001) {
                worldDelta.set(0, 0.1, 0);
              }
              const localExplode = worldDelta.clone().applyMatrix4(invBasis).multiplyScalar(0.24);

              explosionRecords.push({
                mesh,
                subsystem: sub,
                basePos: mesh.position.clone(),
                explodeVec: localExplode,
                originalMat: origMat,
                pixelMat,
                blueprintMat,
                basePixelColor,
                baseOrigColor,
                baseRoughness,
              });
            }
          });

          // Sync initial highlight/dim state if a subsystem was selected
          if (stateRef.current.userSelectedSubsystem !== null) {
            updateMeshHighlightDim(stateRef.current.userSelectedSubsystem);
          }

          setLoadPct(100);
          setLoadState('ready');
        },
        (evt) => {
          if (evt.lengthComputable && evt.total > 0) {
            const pct = Math.min(98, Math.max(15, Math.round((evt.loaded / evt.total) * 100)));
            setLoadPct(pct);
          } else {
            setLoadPct((prev) => Math.min(92, prev + 7));
          }
        },
        (err) => {
          console.error('Failed to load DecodeBot.web.glb:', err);
          if (!isDisposed) setLoadState('error');
        }
      );
    };

    // 8. Low-Resolution RenderTargets & Post-Processing Pipeline (Fine-Grain Pixel CAD)
    const PIXEL_SCALE = ambientMode || minimal ? 0.50 : 0.35;
    const initialRtW = Math.max(64, Math.floor(container.clientWidth * PIXEL_SCALE));
    const initialRtH = Math.max(36, Math.floor(container.clientHeight * PIXEL_SCALE));

    const colorRenderTarget = new THREE.WebGLRenderTarget(initialRtW, initialRtH, {
      minFilter: THREE.NearestFilter,
      magFilter: THREE.NearestFilter,
      format: THREE.RGBAFormat,
      type: THREE.UnsignedByteType,
      depthBuffer: true,
    });
    colorRenderTarget.depthTexture = new THREE.DepthTexture(initialRtW, initialRtH);
    colorRenderTarget.depthTexture.format = THREE.DepthFormat;
    colorRenderTarget.depthTexture.type = THREE.UnsignedIntType;

    const postScene = new THREE.Scene();
    const postCamera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
    const postGeo = new THREE.PlaneGeometry(2, 2);

    const postVertexShader = `
      varying vec2 vUv;
      void main() {
        vUv = uv;
        gl_Position = vec4(position, 1.0);
      }
    `;

    const postFragmentShader = `
      uniform sampler2D uColorTexture;
      uniform sampler2D uDepthTexture;
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

        // If background / sky, preserve transparency so the dithered underlay shows through
        if (colorSample.a < 0.05 || rawDepth >= 0.9999) {
          gl_FragColor = vec4(0.0, 0.0, 0.0, 0.0);
          return;
        }

        // When in X-Ray wireframe mode, output glowing blueprint lines directly
        if (uIsXRay > 0.5) {
          gl_FragColor = colorSample;
          return;
        }

        vec2 texel = 1.0 / uResolution;

        // 1. Depth Discontinuity (Silhouette & Depth Steps)
        float dCenter = linearizeDepth(rawDepth);
        float rawLeft  = texture2D(uDepthTexture, vUv + vec2(-texel.x, 0.0)).r;
        float rawRight = texture2D(uDepthTexture, vUv + vec2( texel.x, 0.0)).r;
        float rawUp    = texture2D(uDepthTexture, vUv + vec2(0.0,  texel.y)).r;
        float rawDown  = texture2D(uDepthTexture, vUv + vec2(0.0, -texel.y)).r;

        bool isSilhouette = (rawLeft >= 0.999 || rawRight >= 0.999 || rawUp >= 0.999 || rawDown >= 0.999);

        float dLeft   = linearizeDepth(rawLeft);
        float dRight  = linearizeDepth(rawRight);
        float dUp     = linearizeDepth(rawUp);
        float dDown   = linearizeDepth(rawDown);

        float depthEdge = (abs(dLeft - dRight) + abs(dUp - dDown)) * 0.5;
        float depthThresh = 0.048 * max(1.0, dCenter * 0.90);
        bool isDepthEdge = depthEdge > depthThresh;

        // 2. Color Discontinuity (Interior mechanical boundaries & material contrasts)
        vec3 cLeft   = texture2D(uColorTexture, vUv + vec2(-texel.x, 0.0)).rgb;
        vec3 cRight  = texture2D(uColorTexture, vUv + vec2( texel.x, 0.0)).rgb;
        vec3 cUp     = texture2D(uColorTexture, vUv + vec2(0.0,  texel.y)).rgb;
        vec3 cDown   = texture2D(uColorTexture, vUv + vec2(0.0, -texel.y)).rgb;

        float colorDelta = length(cLeft - cRight) + length(cUp - cDown);
        bool isColorEdge = colorDelta > 0.52;

        // 1. Subtle mechanical crease shading (depth and color boundaries)
        float edgeFactor = 1.0;
        if (isDepthEdge || isColorEdge) {
          edgeFactor = 0.90;
        }

        // 2. Fine-grain 8-step toon shading for crisp mechanical curvature
        vec3 baseColor = colorSample.rgb * edgeFactor;
        float lum = dot(baseColor, vec3(0.299, 0.587, 0.114));

        float steps = 8.0;
        float toonScale = clamp(floor(lum * steps + 0.38) / steps, 0.38, 1.15);
        vec3 steppedColor = baseColor * (toonScale / max(0.04, lum));

        // 3. Clean pixel-art posterization with authentic mechanical CAD colors
        vec3 posterized = floor(steppedColor * 18.0 + 0.5) / 18.0;
        gl_FragColor = vec4(posterized, colorSample.a);
      }
    `;

    const paletteVectors = [
      new THREE.Vector3(0.025, 0.032, 0.088), // night #060816
      new THREE.Vector3(0.045, 0.060, 0.142), // nightPanel #0b0f24
      new THREE.Vector3(0.105, 0.105, 0.142), // bedrock #1a1a24
      new THREE.Vector3(0.180, 0.180, 0.220), // stone900 #2e2e38
      new THREE.Vector3(0.280, 0.280, 0.330), // stone700 #474754
      new THREE.Vector3(0.440, 0.440, 0.500), // stone500 #707080
      new THREE.Vector3(0.640, 0.665, 0.730), // stone300 #a3a9ba
      new THREE.Vector3(0.780, 0.800, 0.860), // stone200 #c7ccdb
      new THREE.Vector3(0.380, 0.650, 0.200), // grass #61a633
      new THREE.Vector3(0.560, 0.820, 0.310), // grassLight #8fd14f
      new THREE.Vector3(0.550, 0.360, 0.180), // dirt #8c5c2e
      new THREE.Vector3(0.984, 0.749, 0.141), // gold #fbbf24
      new THREE.Vector3(0.220, 0.740, 0.970), // diamond #38bdf8
      new THREE.Vector3(0.930, 0.260, 0.260), // redstone #ed4242
      new THREE.Vector3(0.150, 0.390, 0.920), // cobalt #2663eb
      new THREE.Vector3(0.910, 0.851, 0.659), // parchment #e8d9a8
    ];

    const postMaterial = new THREE.ShaderMaterial({
      vertexShader: postVertexShader,
      fragmentShader: postFragmentShader,
      uniforms: {
        uColorTexture: { value: colorRenderTarget.texture },
        uDepthTexture: { value: colorRenderTarget.depthTexture },
        uResolution: { value: new THREE.Vector2(initialRtW, initialRtH) },
        uNear: { value: camera.near },
        uFar: { value: camera.far },
        uIsXRay: { value: 0.0 },
        uPalette: { value: paletteVectors },
      },
      transparent: true,
      depthWrite: false,
    });

    const postQuad = new THREE.Mesh(postGeo, postMaterial);
    postScene.add(postQuad);

    let stageWidth = container.clientWidth || 800;
    let stageHeight = container.clientHeight || 500;

    const computeFitDistance = (w: number, h: number): number => {
      const aspect = Math.max(0.1, w / h);
      const fov = w < 640 ? 38 : 34;
      camera.fov = fov;
      camera.aspect = aspect;
      camera.updateProjectionMatrix();

      const vFovRad = THREE.MathUtils.degToRad(fov);
      const hFovRad = 2 * Math.atan(Math.tan(vFovRad / 2) * aspect);
      // Ambient / minimal homepage mode zooms in close (~60% closer) to heroically display mechanism details
      // Workstation (/cad) mode leaves standard padding for HUD callouts and timeline controls
      const padding = ambientMode || minimal ? 1.5 : 1.75;
      const robotRadius = ambientMode || minimal ? 0.40 : BOUNDING_RADIUS;
      const distV = (robotRadius * padding) / Math.sin(vFovRad / 2);
      const distH = (robotRadius * padding) / Math.sin(hFovRad / 2);
      return Math.max(distV, distH);
    };

    const handleResize = () => {
      if (!container) return;
      const w = Math.max(1, container.clientWidth);
      const h = Math.max(1, container.clientHeight);
      stageWidth = w;
      stageHeight = h;
      const fitDist = computeFitDistance(w, h);
      stateRef.current.defaultDistance = fitDist;
      stateRef.current.targetDistance = fitDist;

      const rtw = Math.max(64, Math.floor(w * PIXEL_SCALE));
      const rth = Math.max(36, Math.floor(h * PIXEL_SCALE));
      colorRenderTarget.setSize(rtw, rth);
      postMaterial.uniforms.uResolution.value.set(rtw, rth);

      renderer.setSize(w, h, false);
    };
    const resizeObserver = new ResizeObserver(handleResize);
    resizeObserver.observe(container);
    handleResize();

    // 10. IntersectionObservers:
    // - preloadObserver starts GLB fetch when stage is within 900px of viewport
    // - renderObserver pauses rAF loop when stage is offscreen
    const preloadObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            startModelLoad();
            preloadObserver.disconnect();
          }
        });
      },
      { rootMargin: '900px 0px' }
    );
    preloadObserver.observe(container);

    const idleTimer = window.setTimeout(startModelLoad, 1400);

    const renderObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          stateRef.current.isInView = entry.isIntersecting;
        });
      },
      { threshold: 0.01 }
    );
    renderObserver.observe(container);

    // 11. Animation Loop (zero per-frame heap allocations)
    let rafId = 0;
    const camPos = new THREE.Vector3();
    const spherical = new THREE.Spherical();
    const projVec = new THREE.Vector3();
    const camForward = new THREE.Vector3();
    const toAnchor = new THREE.Vector3();
    const rayDir = new THREE.Vector3();

    const animate = () => {
      rafId = requestAnimationFrame(animate);
      const st = stateRef.current;
      if (!st.isInView || st.isDocHidden) return;

      const now = performance.now();

      // Slow Continuous Turntable Rotation:
      // In ambient mode (homepage): rotates slowly and smoothly at all times; pauses while user drags, resumes 1.2s after release.
      // In workstation mode (/cad): activates after 3s of user inactivity.
      const interactionCooldown = st.ambientMode ? 1200 : 3000;
      const isInteracting = st.isPointerDown || (now - st.lastInteractionTime < interactionCooldown);
      if (!st.reducedMotion && !isInteracting) {
        st.targetTheta += st.ambientMode ? 0.0016 : 0.0020;
      }

      // Smooth camera damping
      const lerpRate = st.reducedMotion ? 1.0 : 0.12;
      st.currentTheta += (st.targetTheta - st.currentTheta) * lerpRate;
      st.currentPhi += (st.targetPhi - st.currentPhi) * lerpRate;
      st.currentDistance += (st.targetDistance - st.currentDistance) * lerpRate;
      st.lookTarget.lerp(st.targetLookTarget, lerpRate);

      // Floor clamping: ensure phi never dips below floor level (clamped above floor plane y = -0.245)
      const clampedPhi = Math.max(0.20, Math.min(1.48, st.currentPhi));

      spherical.set(st.currentDistance, clampedPhi, st.currentTheta);
      camPos.setFromSpherical(spherical).add(st.lookTarget);

      camera.position.copy(camPos);
      camera.lookAt(st.lookTarget);

      // Update Explode & Wireframe states smoothly (only mutates positions when active or animating)
      const targetExplode = st.isExploded ? 1.0 : 0.0;
      const isExplodeChanging = Math.abs(targetExplode - st.explodeFactor) > 0.001;
      if (explosionRecords.length > 0 && (isExplodeChanging || st.explodeFactor > 0.002)) {
        st.explodeFactor += (targetExplode - st.explodeFactor) * (st.reducedMotion ? 1.0 : 0.14);
        if (st.explodeFactor < 0.001) st.explodeFactor = 0;

        for (let i = 0; i < explosionRecords.length; i++) {
          const rec = explosionRecords[i];
          const targetMat = st.isXRay
            ? rec.blueprintMat
            : (st.renderMode === 'cad' ? rec.originalMat : rec.pixelMat);

          if (rec.mesh.material !== targetMat) {
            rec.mesh.material = targetMat;
          }
          if (st.explodeFactor > 0.001) {
            rec.mesh.position
              .copy(rec.basePos)
              .addScaledVector(rec.explodeVec, st.explodeFactor);
          } else {
            rec.mesh.position.copy(rec.basePos);
          }
        }
      } else if (explosionRecords.length > 0) {
        // Explode is completely idle at 0: only check if materials need switching
        const first = explosionRecords[0];
        const targetMat = st.isXRay
          ? first.blueprintMat
          : (st.renderMode === 'cad' ? first.originalMat : first.pixelMat);
        if (first.mesh.material !== targetMat) {
          for (let i = 0; i < explosionRecords.length; i++) {
            const rec = explosionRecords[i];
            rec.mesh.material = st.isXRay
              ? rec.blueprintMat
              : (st.renderMode === 'cad' ? rec.originalMat : rec.pixelMat);
          }
        }
      }

      // Render Scene
      if (st.renderMode === 'pixel') {
        // Pass 1: Render Color + Depth into low-res render target with nearest-neighbor filtering
        renderer.setRenderTarget(colorRenderTarget);
        renderer.clear();
        renderer.render(scene, camera);

        // Pass 2: Post-processing toon, edge detection outlines & palette quantization to canvas
        renderer.setRenderTarget(null);
        postMaterial.uniforms.uIsXRay.value = st.isXRay ? 1.0 : 0.0;
        postMaterial.uniforms.uNear.value = camera.near;
        postMaterial.uniforms.uFar.value = camera.far;
        renderer.render(postScene, postCamera);
      } else {
        // REAL CAD Mode: full-res standard render
        renderer.setRenderTarget(null);
        renderer.render(scene, camera);
      }

      // Project 3D subsystem anchors to 2D HUD pins with edge clamping & geometric occlusion
      const cw = stageWidth;
      const ch = stageHeight;
      const cx = cw * 0.5;
      const cy = ch * 0.5;

      const padX = Math.min(36, Math.max(24, cw * 0.05));
      const padTop = 46;
      const padBottom = 58;
      const minX = padX;
      const maxX = cw - padX;
      const minY = padTop;
      const maxY = ch - padBottom;

      camera.getWorldDirection(camForward);

      if (stateRef.current.showHotspots) {
        // Ultra-fast geometric occlusion: test if line-of-sight passes through robot core
        const robotCoreCenter = new THREE.Vector3(0, 0.04, 0);
        const toRobotCore = new THREE.Vector3();

        for (let i = 0; i < ROBOT_CHAPTERS.length; i++) {
          const pinEl = pinRefs.current[i];
          if (!pinEl) continue;

          const anchor = dynamicAnchors[i];
          toAnchor.subVectors(anchor, camera.position);
          const distToAnchor = toAnchor.length();
          const isBehind = toAnchor.dot(camForward) <= 0.02;

          let isOccluded = false;
          if (!isBehind) {
            rayDir.copy(toAnchor).normalize();
            toRobotCore.subVectors(robotCoreCenter, camera.position);
            const projOnRay = toRobotCore.dot(rayDir);
            if (projOnRay > 0.1 && projOnRay < distToAnchor - 0.08) {
              const perpDistSq = toRobotCore.lengthSq() - projOnRay * projOnRay;
              // Robot core radius ~0.20m (0.04m^2)
              if (perpDistSq < 0.040) {
                isOccluded = true;
              }
            }
          }
          projVec.copy(anchor);
          projVec.project(camera);

          let sx = (projVec.x * 0.5 + 0.5) * cw;
          let sy = (-projVec.y * 0.5 + 0.5) * ch;

          let isClamped = false;
          let arrowDir: 'left' | 'right' | 'up' | 'down' | null = null;

          if (isBehind || sx < minX || sx > maxX || sy < minY || sy > maxY) {
            isClamped = true;
            let dx = sx - cx;
            let dy = sy - cy;

            if (isBehind) {
              dx = -dx;
              dy = -dy;
            }
            if (Math.abs(dx) < 0.001 && Math.abs(dy) < 0.001) {
              dx = 1;
              dy = 0;
            }

            const limitX = dx > 0 ? (maxX - cx) : (minX - cx);
            const limitY = dy > 0 ? (maxY - cy) : (minY - cy);
            const tx = limitX / dx;
            const ty = limitY / dy;
            const t = Math.min(Math.abs(tx), Math.abs(ty));

            sx = cx + dx * t;
            sy = cy + dy * t;

            if (Math.abs(t - Math.abs(tx)) < 0.001) {
              arrowDir = dx > 0 ? 'right' : 'left';
            } else {
              arrowDir = dy > 0 ? 'down' : 'up';
            }
          }

          pinEl.style.transform = `translate3d(${sx.toFixed(1)}px, ${sy.toFixed(1)}px, 0)`;

          const arrowPrefix = pinEl.querySelector('.hotspot-arrow-prefix') as HTMLElement | null;
          const arrowSuffix = pinEl.querySelector('.hotspot-arrow-suffix') as HTMLElement | null;
          const dotIndicator = pinEl.querySelector('.hotspot-dot') as HTMLElement | null;

          if (arrowDir === 'left') {
            if (arrowPrefix) { arrowPrefix.textContent = '◀'; arrowPrefix.style.display = 'inline-block'; }
            if (arrowSuffix) { arrowSuffix.style.display = 'none'; }
            if (dotIndicator) { dotIndicator.style.display = 'none'; }
          } else if (arrowDir === 'right') {
            if (arrowPrefix) { arrowPrefix.style.display = 'none'; }
            if (arrowSuffix) { arrowSuffix.textContent = '▶'; arrowSuffix.style.display = 'inline-block'; }
            if (dotIndicator) { dotIndicator.style.display = 'none'; }
          } else if (arrowDir === 'up') {
            if (arrowPrefix) { arrowPrefix.textContent = '▲'; arrowPrefix.style.display = 'inline-block'; }
            if (arrowSuffix) { arrowSuffix.style.display = 'none'; }
            if (dotIndicator) { dotIndicator.style.display = 'none'; }
          } else if (arrowDir === 'down') {
            if (arrowPrefix) { arrowPrefix.textContent = '▼'; arrowPrefix.style.display = 'inline-block'; }
            if (arrowSuffix) { arrowSuffix.style.display = 'none'; }
            if (dotIndicator) { dotIndicator.style.display = 'none'; }
          } else {
            if (arrowPrefix) { arrowPrefix.style.display = 'none'; }
            if (arrowSuffix) { arrowSuffix.style.display = 'none'; }
            if (dotIndicator) { dotIndicator.style.display = 'inline-block'; }
          }

          if (isClamped) {
            pinEl.style.opacity = '0.92';
            pinEl.style.filter = 'none';
          } else if (isOccluded) {
            pinEl.style.opacity = '0.35';
            pinEl.style.filter = 'contrast(85%)';
          } else {
            pinEl.style.opacity = '1.0';
            pinEl.style.filter = 'none';
          }
        }
      }
    };

    rafId = requestAnimationFrame(animate);

    return () => {
      isDisposed = true;
      updateMeshHighlightDimRef.current = null;
      window.clearTimeout(idleTimer);
      cancelAnimationFrame(rafId);
      window.removeEventListener('pixel-time-change', onTimeChange);
      mq.removeEventListener('change', onMqChange);
      document.removeEventListener('visibilitychange', onVisibilityChange);
      resizeObserver.disconnect();
      preloadObserver.disconnect();
      renderObserver.disconnect();

      explosionRecords.forEach((rec) => {
        rec.blueprintMat.dispose();
        if (Array.isArray(rec.pixelMat)) {
          rec.pixelMat.forEach((m) => m.dispose());
        } else {
          rec.pixelMat.dispose();
        }
        if (Array.isArray(rec.originalMat)) {
          rec.originalMat.forEach((m) => m.dispose());
        } else {
          rec.originalMat.dispose();
        }
      });
      stoneTopTex.dispose();
      stoneSideTex.dispose();
      shadowTex.dispose();
      colorRenderTarget.dispose();
      colorRenderTarget.depthTexture?.dispose();
      postMaterial.dispose();
      postGeo.dispose();
      scene.traverse((obj) => {
        if ((obj as THREE.Mesh).isMesh) {
          const m = obj as THREE.Mesh;
          m.geometry?.dispose();
          if (Array.isArray(m.material)) {
            m.material.forEach((mat) => mat.dispose());
          } else {
            m.material?.dispose();
          }
        }
      });
      renderer.dispose();
    };
  }, []);

  // Pointer drag handlers for direct 1:1 orbit inspection (pan-y preserves vertical touch scrolling)
  const onPointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if ((e.target as HTMLElement).closest('button')) return;
    const st = stateRef.current;
    st.isPointerDown = true;
    st.lastPointerX = e.clientX;
    st.lastPointerY = e.clientY;
    st.lastInteractionTime = performance.now();
    setIsDragging(true);
    try {
      e.currentTarget.setPointerCapture(e.pointerId);
    } catch {
      // Ignore if pointer capture is unsupported
    }
  };

  const onPointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    const st = stateRef.current;
    if (!st.isPointerDown) return;
    const dx = e.clientX - st.lastPointerX;
    const dy = e.clientY - st.lastPointerY;
    st.lastPointerX = e.clientX;
    st.lastPointerY = e.clientY;
    st.lastInteractionTime = performance.now();

    st.targetTheta -= dx * 0.0055;
    st.targetPhi = Math.max(0.20, Math.min(1.48, st.targetPhi + dy * 0.0055));
  };

  const onPointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    const st = stateRef.current;
    st.isPointerDown = false;
    st.lastInteractionTime = performance.now();
    setIsDragging(false);
    try {
      e.currentTarget.releasePointerCapture(e.pointerId);
    } catch {
      // Ignore if pointer was not captured
    }
  };

  return (
    <div
      ref={containerRef}
      tabIndex={0}
      onKeyDown={handleStageKeyDown}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onPointerCancel={onPointerUp}
      style={{ touchAction: 'pan-y' }}
      className={`decodebot-stage-container relative w-full h-full select-none overflow-hidden bg-[#060816] focus-visible:outline-2 focus-visible:outline-amber-400 ${
        isDragging ? 'cursor-grabbing' : 'cursor-grab'
      }`}
      role="region"
      aria-label="Interactive 3D CAD Stage of HSGS RoboLads DecodeBot. Drag or press Left and Right arrow keys to orbit."
    >
      {/* Static CAD Blueprint Fallback / Progressive Streaming Underlay */}
      <div
        className={`absolute inset-0 transition-opacity duration-500 ${
          loadState === 'ready' ? 'opacity-0 pointer-events-none' : 'opacity-100'
        }`}
      >
        <img
          src="/Photo/cad-robot.jpg"
          alt="DecodeBot Onshape CAD Render"
          className="w-full h-full object-cover opacity-40 filter contrast-125"
        />
        <div className="absolute inset-0 bg-[#060816]/80" />
        <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center">
          <div className="bg-stone-900 border-4 border-black px-6 py-6 shadow-[6px_6px_0_#000000] max-w-md w-full">
            <div className="flex items-center justify-between font-display text-[9px] text-amber-400 mb-3">
              <span className="flex items-center gap-2">
                <Cpu className="w-4 h-4 animate-pulse" />
                {loadState === 'error'
                  ? 'ONSHAPE CAD RENDER FALLBACK'
                  : 'LOADING 3D DECODEBOT CAD...'}
              </span>
              {loadState !== 'error' && <span>{loadPct}%</span>}
            </div>
            {loadState !== 'error' && (
              <div className="w-full h-4 bg-stone-950 border-2 border-stone-700 p-0.5">
                <div
                  className="h-full bg-amber-400 transition-all duration-150"
                  style={{ width: `${Math.max(6, loadPct)}%` }}
                />
              </div>
            )}
            <p className="text-xs text-slate-300 font-body mt-3">
              {loadState === 'error'
                ? 'Displaying static Onshape CAD render (/Photo/cad-robot.jpg)'
                : 'Streaming optimized CAD assembly (DecodeBot.web.glb)'}
            </p>
          </div>
        </div>
      </div>

      {/* Background: Flat dark world color with subtle procedural 4x4 Bayer dithered vignette (zero smooth gradients) */}
      <div className="absolute inset-0 bg-[#060816] pointer-events-none" />
      {mounted && vignetteDataUrl && (
        <div
          className="absolute inset-0 pointer-events-none select-none z-0"
          style={{
            backgroundImage: `url(${vignetteDataUrl})`,
            backgroundSize: '100% 100%',
            imageRendering: 'pixelated',
          }}
          aria-hidden="true"
        />
      )}

      {/* Live WebGL Canvas (alpha: true transparently overlays the dithered background) */}
      <canvas
        ref={canvasRef}
        style={{ imageRendering: renderMode === 'pixel' ? 'pixelated' : 'auto' }}
        className="relative z-[1] block w-full h-full"
      />

      {/* Top Action Overlay */}
      {!minimal && ambientMode && onOpenModal && (
        <div className="absolute top-3 right-3 z-20 pointer-events-none">
          <button
            type="button"
            onClick={onOpenModal}
            className="pointer-events-auto bg-stone-900/90 hover:bg-stone-800 border-2 border-amber-400/80 hover:border-amber-400 px-3 py-1.5 font-display text-[8px] sm:text-[9px] text-amber-300 hover:text-amber-200 shadow-[2px_2px_0_#000] cursor-pointer transition-colors flex items-center gap-1.5"
            aria-label="FULL CAD LAB - Open Fullscreen"
          >
            <span>FULL CAD LAB</span>
            <span className="text-amber-400">⛶</span>
          </button>
        </div>
      )}

      {/* Stage Control Bar */}
      {!minimal && (
        <div className="absolute bottom-3 left-3 sm:bottom-4 sm:left-4 right-3 sm:right-auto z-20 flex flex-wrap items-center gap-2 pointer-events-auto">
        <div className="flex bg-stone-900/95 border-2 border-stone-700 px-3 py-1.5 sm:px-3.5 sm:py-2 text-xs font-display text-slate-200 items-center gap-2 shadow-[4px_4px_0_#000000]">
          <Orbit className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-amber-400 shrink-0" />
          <span>DRAG TO ORBIT</span>
        </div>

        {ambientMode ? (
          <>
            {onOpenModal && (
              <button
                type="button"
                onClick={() => {
                  playPixelSound('click');
                  onOpenModal();
                }}
                className="px-3 py-1.5 sm:px-3.5 sm:py-2 font-display text-xs bg-amber-400 text-black font-bold border-2 border-white hover:bg-amber-300 shadow-[4px_4px_0_#000000] flex items-center gap-1.5 cursor-pointer transition-transform active:translate-x-[1px] active:translate-y-[1px] focus-visible:outline-2 focus-visible:outline-white"
                title="Launch Full CAD Lab"
              >
                <Cpu className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                <span>FULL CAD LAB ↗</span>
              </button>
            )}

            <button
              type="button"
              onClick={() => {
                playPixelSound('click');
                handleResetView();
              }}
              className="px-2.5 py-1.5 sm:px-3 sm:py-2 font-display text-xs bg-stone-900/95 text-slate-300 border-2 border-stone-700 hover:border-amber-400 hover:text-amber-400 shadow-[4px_4px_0_#000000] flex items-center gap-1.5 cursor-pointer focus-visible:outline-2 focus-visible:outline-white"
              title="Reset camera orbit"
              aria-label="Reset 3D view"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">RESET</span>
            </button>
          </>
        ) : (
          <>
            {showModeToggle ? (
              <>
                <button
                  type="button"
                  onClick={() => {
                    playPixelSound('click');
                    setRenderMode('pixel');
                  }}
                  aria-pressed={renderMode === 'pixel'}
                  className={`px-3 py-2 font-display text-[10px] border-2 shadow-[3px_3px_0_#000000] flex items-center gap-1.5 cursor-pointer transition-transform active:translate-x-[1px] active:translate-y-[1px] focus-visible:outline-2 focus-visible:outline-white ${
                    renderMode === 'pixel'
                      ? 'bg-amber-400 text-black border-white font-bold'
                      : 'bg-stone-900/95 text-slate-200 border-stone-700 hover:border-amber-400'
                  }`}
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>PIXEL</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    playPixelSound('click');
                    setRenderMode('cad');
                  }}
                  aria-pressed={renderMode === 'cad'}
                  className={`px-3 py-2 font-display text-[10px] border-2 shadow-[3px_3px_0_#000000] flex items-center gap-1.5 cursor-pointer transition-transform active:translate-x-[1px] active:translate-y-[1px] focus-visible:outline-2 focus-visible:outline-white ${
                    renderMode === 'cad'
                      ? 'bg-amber-400 text-black border-white font-bold'
                      : 'bg-stone-900/95 text-slate-200 border-stone-700 hover:border-amber-400'
                  }`}
                >
                  <Cpu className="w-3.5 h-3.5" />
                  <span>REAL CAD</span>
                </button>
              </>
            ) : null}

            <button
              type="button"
              onClick={() => {
                playPixelSound('click');
                setIsXRay((prev) => !prev);
                unlock('xray');
              }}
              aria-pressed={isXRay}
              className={`px-3 py-2 font-display text-[10px] border-2 shadow-[3px_3px_0_#000000] flex items-center gap-1.5 cursor-pointer transition-transform active:translate-x-[1px] active:translate-y-[1px] focus-visible:outline-2 focus-visible:outline-white ${
                isXRay
                  ? 'bg-sky-400 text-black border-white font-bold'
                  : 'bg-stone-900/95 text-slate-200 border-stone-700 hover:border-sky-400'
              }`}
            >
              <Eye className="w-3.5 h-3.5" />
              <span className="sm:hidden">X-RAY</span>
              <span className="hidden sm:inline">X-RAY WIREFRAME</span>
            </button>

            <button
              type="button"
              onClick={() => {
                playPixelSound('click');
                setIsExploded((prev) => !prev);
                unlock('explode');
              }}
              aria-pressed={isExploded}
              className={`px-3 py-2 font-display text-[10px] border-2 shadow-[3px_3px_0_#000000] flex items-center gap-1.5 cursor-pointer transition-transform active:translate-x-[1px] active:translate-y-[1px] focus-visible:outline-2 focus-visible:outline-white ${
                isExploded
                  ? 'bg-amber-400 text-black border-white font-bold'
                  : 'bg-stone-900/95 text-slate-200 border-stone-700 hover:border-amber-400'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span className="sm:hidden">EXPLODE</span>
              <span className="hidden sm:inline">EXPLODE SUBSYSTEMS</span>
            </button>

            <button
              type="button"
              onClick={() => {
                playPixelSound('click');
                handleResetView();
              }}
              className="px-3 py-2 font-display text-[10px] bg-stone-900/95 text-slate-300 border-2 border-stone-700 hover:border-amber-400 hover:text-amber-400 shadow-[3px_3px_0_#000000] flex items-center gap-1.5 cursor-pointer focus-visible:outline-2 focus-visible:outline-white"
              title="Reset camera orbit, modes and isolation"
              aria-label="Reset 3D view"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span className="hidden md:inline">RESET</span>
            </button>
          </>
        )}
      </div>
      )}
    </div>
  );
}

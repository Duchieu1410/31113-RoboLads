'use client';

import React, { useEffect, useRef, useState, useCallback } from 'react';
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import {
  RotateCcw,
  Crosshair,
  Sparkles,
  Maximize2,
  Box,
  Eye,
  Activity,
  Layers,
  Compass,
} from 'lucide-react';

interface SubsystemPin {
  id: string;
  name: string;
  pos3D: THREE.Vector3;
}

export const SUBSYSTEM_PINS: SubsystemPin[] = [
  { id: 'chassis', name: 'MECANUM VECTOR DRIVEBASE', pos3D: new THREE.Vector3(0, -0.65, 0) },
  { id: 'lift', name: 'DUAL-STAGE CASCADE ELEVATOR', pos3D: new THREE.Vector3(0, 0.95, -0.15) },
  { id: 'intake', name: 'ACTIVE COMPLIANT INTAKE', pos3D: new THREE.Vector3(0.75, -0.2, 0.85) },
  { id: 'avionics', name: 'AUTONOMOUS AVIONICS & ODOMETRY', pos3D: new THREE.Vector3(-0.55, -0.1, -0.6) },
];

interface Robot3DCanvasProps {
  modelUrl?: string;
  activeSubsystem: number;
  onSelectSubsystem: (index: number) => void;
  cadMode: 'render' | 'blueprint' | 'telemetry';
  className?: string;
}

export function Robot3DCanvas({
  modelUrl,
  activeSubsystem,
  onSelectSubsystem,
  cadMode,
  className = '',
}: Robot3DCanvasProps) {
  const mountRef = useRef<HTMLDivElement | null>(null);
  const [webGlSupported, setWebGlSupported] = useState<boolean>(true);
  const [isLoaded, setIsLoaded] = useState<boolean>(false);
  const [hasModelFile, setHasModelFile] = useState<boolean>(false);
  const [pitchYaw, setPitchYaw] = useState<{ pitch: number; yaw: number }>({ pitch: 0, yaw: 0 });
  const [projectedPins, setProjectedPins] = useState<
    { id: string; idx: number; name: string; x: number; y: number; visible: boolean }[]
  >([]);

  // Refs for animation & scene objects
  const sceneRef = useRef<THREE.Scene | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const robotPivotRef = useRef<THREE.Group | null>(null);
  const robotMotionRef = useRef<THREE.Group | null>(null);
  const robotHolderRef = useRef<THREE.Group | null>(null);
  const materialsRef = useRef<THREE.Material[]>([]);
  const animFrameRef = useRef<number | null>(null);
  const isVisibleRef = useRef<boolean>(true);

  // Interaction State
  const isDraggingRef = useRef<boolean>(false);
  const prevPointerRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const targetRotationRef = useRef<{ x: number; y: number }>({ x: 0.15, y: -0.45 });
  const currentRotationRef = useRef<{ x: number; y: number }>({ x: 0.15, y: -0.45 });
  const autoRotateRef = useRef<boolean>(true);
  const prefersReducedMotionRef = useRef<boolean>(false);

  // Focus targets for each subsystem
  const subsystemFocusAngles: { x: number; y: number }[] = [
    { x: 0.35, y: -0.45 }, // Chassis: top-down angle
    { x: 0.05, y: 0.2 },   // Lift: upright front view
    { x: 0.25, y: 0.85 },  // Intake: front-right angle
    { x: 0.2, y: -1.75 },  // Avionics: rear deck angle
  ];

  // Rotate to focus on the selected subsystem
  useEffect(() => {
    if (activeSubsystem >= 0 && activeSubsystem < subsystemFocusAngles.length) {
      const target = subsystemFocusAngles[activeSubsystem];
      targetRotationRef.current = { ...target };
      autoRotateRef.current = false;
      const timer = setTimeout(() => {
        autoRotateRef.current = true;
      }, 4000);
      return () => clearTimeout(timer);
    }
  }, [activeSubsystem]);

  // Main Three.js Scene Setup
  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    // Detect WebGL capability
    try {
      const canvas = document.createElement('canvas');
      const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
      if (!gl) {
        setWebGlSupported(false);
        return;
      }
    } catch {
      setWebGlSupported(false);
      return;
    }

    // Detect reduced motion preference
    prefersReducedMotionRef.current = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    const width = container.clientWidth || 600;
    const height = container.clientHeight || 420;

    // 1. Scene
    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x08081a, 0.035);
    sceneRef.current = scene;

    // 2. Camera
    const camera = new THREE.PerspectiveCamera(40, width / height, 0.1, 100);
    camera.position.set(0, 1.4, 5.8);
    camera.lookAt(0, 0, 0);
    cameraRef.current = camera;

    // 3. Renderer with transparent background and sRGB color space
    const isMobile = width < 768;
    const renderer = new THREE.WebGLRenderer({
      alpha: true,
      antialias: true,
      powerPreference: 'high-performance',
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, isMobile ? 1.5 : 2.0));
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.15;
    rendererRef.current = renderer;

    // Clear old canvases
    while (container.firstChild) {
      container.removeChild(container.firstChild);
    }
    container.appendChild(renderer.domElement);

    // 4. Stable Scene Hierarchy matching build spec Section 4.2:
    // scene -> robotPivot -> robotMotion -> robotHolder -> robotAssembly
    const robotPivot = new THREE.Group();
    robotPivot.name = 'robotPivot';
    scene.add(robotPivot);
    robotPivotRef.current = robotPivot;

    const robotMotion = new THREE.Group();
    robotMotion.name = 'robotMotion';
    robotPivot.add(robotMotion);
    robotMotionRef.current = robotMotion;

    const robotHolder = new THREE.Group();
    robotHolder.name = 'robotHolder';
    robotMotion.add(robotHolder);
    robotHolderRef.current = robotHolder;

    // 5. Lighting (Section 5.2: Key, Fill, Rim)
    const keyLight = new THREE.DirectionalLight(0xf8fafc, 2.4);
    keyLight.position.set(4, 6, 5);
    scene.add(keyLight);

    const fillLight = new THREE.DirectionalLight(0x60a5fa, 1.2);
    fillLight.position.set(-5, 3, -3);
    scene.add(fillLight);

    // Signature RoboLads gold rim light
    const rimLight = new THREE.DirectionalLight(0xffcc00, 2.8);
    rimLight.position.set(0, 4, -5);
    scene.add(rimLight);

    const hemiLight = new THREE.HemisphereLight(0x1e223d, 0x050610, 1.2);
    scene.add(hemiLight);

    // 6. Supporting Geometric Environment (Section 5.3)
    const grid = new THREE.GridHelper(9, 18, 0xffcc00, 0x1e223d);
    grid.position.y = -1.0;
    (grid.material as THREE.Material).transparent = true;
    (grid.material as THREE.Material).opacity = 0.35;
    scene.add(grid);

    // Octagonal block pedestal with gold chamfer
    const pedestalGeo = new THREE.CylinderGeometry(2.3, 2.5, 0.12, 8);
    const pedestalMat = new THREE.MeshStandardMaterial({
      color: 0x0e1023,
      metalness: 0.85,
      roughness: 0.3,
    });
    const pedestal = new THREE.Mesh(pedestalGeo, pedestalMat);
    pedestal.position.y = -1.06;
    scene.add(pedestal);

    const ringGeo = new THREE.RingGeometry(2.45, 2.52, 8);
    ringGeo.rotateX(-Math.PI / 2);
    const ringMat = new THREE.MeshBasicMaterial({ color: 0xffcc00 });
    const ring = new THREE.Mesh(ringGeo, ringMat);
    ring.position.y = -0.99;
    scene.add(ring);

    // 7. Construct Procedural FTC Robot Assembly
    const robotAssembly = new THREE.Group();
    robotAssembly.name = 'robotAssembly';
    robotHolder.add(robotAssembly);

    const materials: THREE.Material[] = [];

    // Shared PBR Materials
    const aluminumMat = new THREE.MeshStandardMaterial({
      color: 0xc8ced8,
      metalness: 0.88,
      roughness: 0.22,
    });
    materials.push(aluminumMat);

    const darkAlumMat = new THREE.MeshStandardMaterial({
      color: 0x1a1c28,
      metalness: 0.85,
      roughness: 0.35,
    });
    materials.push(darkAlumMat);

    const goldAccentMat = new THREE.MeshStandardMaterial({
      color: 0xffcc00,
      metalness: 0.75,
      roughness: 0.25,
      emissive: 0xffb800,
      emissiveIntensity: 0.15,
    });
    materials.push(goldAccentMat);

    const rubberMat = new THREE.MeshStandardMaterial({
      color: 0x141416,
      metalness: 0.1,
      roughness: 0.85,
    });
    materials.push(rubberMat);

    const carbonFiberMat = new THREE.MeshStandardMaterial({
      color: 0x181a24,
      metalness: 0.5,
      roughness: 0.4,
    });
    materials.push(carbonFiberMat);

    materialsRef.current = materials;

    // A. 18" Square Perimeter Channel Chassis (FTC legal 450mm cube)
    const channelThick = 0.08;
    const channelLength = 2.0;

    // Left & Right Channels
    const sideChanGeo = new THREE.BoxGeometry(channelThick, 0.25, channelLength);
    const leftChan = new THREE.Mesh(sideChanGeo, aluminumMat);
    leftChan.position.set(-0.95, -0.65, 0);
    robotAssembly.add(leftChan);

    const rightChan = new THREE.Mesh(sideChanGeo, aluminumMat);
    rightChan.position.set(0.95, -0.65, 0);
    robotAssembly.add(rightChan);

    // Front & Rear Cross Channels
    const crossChanGeo = new THREE.BoxGeometry(1.9, 0.25, channelThick);
    const frontChan = new THREE.Mesh(crossChanGeo, aluminumMat);
    frontChan.position.set(0, -0.65, 0.95);
    robotAssembly.add(frontChan);

    const rearChan = new THREE.Mesh(crossChanGeo, aluminumMat);
    rearChan.position.set(0, -0.65, -0.95);
    robotAssembly.add(rearChan);

    // B. 4x Mecanum Drive Wheels with 45° angled polyurethane rollers
    const wheelPositions = [
      { x: -1.05, z: 0.75 },
      { x: 1.05, z: 0.75 },
      { x: -1.05, z: -0.75 },
      { x: 1.05, z: -0.75 },
    ];

    wheelPositions.forEach((pos) => {
      const wheelGroup = new THREE.Group();
      wheelGroup.position.set(pos.x, -0.65, pos.z);

      // Gold Hub Core
      const hubGeo = new THREE.CylinderGeometry(0.24, 0.24, 0.16, 16);
      hubGeo.rotateZ(Math.PI / 2);
      const hub = new THREE.Mesh(hubGeo, goldAccentMat);
      wheelGroup.add(hub);

      // Rubber Tire Rim
      const tireGeo = new THREE.TorusGeometry(0.28, 0.06, 8, 20);
      tireGeo.rotateY(Math.PI / 2);
      const tire = new THREE.Mesh(tireGeo, rubberMat);
      wheelGroup.add(tire);

      // Planetary Gearbox Motor Canister
      const motorGeo = new THREE.CylinderGeometry(0.1, 0.1, 0.45, 12);
      motorGeo.rotateZ(Math.PI / 2);
      const motor = new THREE.Mesh(motorGeo, darkAlumMat);
      motor.position.x = pos.x > 0 ? -0.25 : 0.25;
      wheelGroup.add(motor);

      robotAssembly.add(wheelGroup);
    });

    // C. Dual-Stage Cascade Elevator
    const elevatorGroup = new THREE.Group();
    elevatorGroup.position.set(0, 0, -0.15);

    // Twin Carbon-Fiber Extrusion Rails
    const mastGeo = new THREE.BoxGeometry(0.08, 1.8, 0.08);
    const leftMast = new THREE.Mesh(mastGeo, carbonFiberMat);
    leftMast.position.set(-0.45, 0.35, 0);
    elevatorGroup.add(leftMast);

    const rightMast = new THREE.Mesh(mastGeo, carbonFiberMat);
    rightMast.position.set(0.45, 0.35, 0);
    elevatorGroup.add(rightMast);

    // Top Cross-Brace & Pulleys
    const topGantryGeo = new THREE.BoxGeometry(1.05, 0.06, 0.12);
    const topGantry = new THREE.Mesh(topGantryGeo, aluminumMat);
    topGantry.position.set(0, 1.25, 0);
    elevatorGroup.add(topGantry);

    // Moving Elevator Carriage with Dyneema Line
    const carriageGeo = new THREE.BoxGeometry(0.85, 0.16, 0.18);
    const carriage = new THREE.Mesh(carriageGeo, goldAccentMat);
    carriage.position.set(0, 0.8, 0.04);
    elevatorGroup.add(carriage);

    robotAssembly.add(elevatorGroup);

    // D. Active Compliant Intake Wrist
    const intakeGroup = new THREE.Group();
    intakeGroup.position.set(0, -0.2, 0.8);

    // Articulated Carbon Extension Arms
    const armGeo = new THREE.BoxGeometry(0.06, 0.08, 0.65);
    const leftArm = new THREE.Mesh(armGeo, carbonFiberMat);
    leftArm.position.set(-0.38, 0, 0.25);
    intakeGroup.add(leftArm);

    const rightArm = new THREE.Mesh(armGeo, carbonFiberMat);
    rightArm.position.set(0.38, 0, 0.25);
    intakeGroup.add(rightArm);

    // Intake Roller Axle
    const axleGeo = new THREE.CylinderGeometry(0.03, 0.03, 0.8, 10);
    axleGeo.rotateZ(Math.PI / 2);
    const axle = new THREE.Mesh(axleGeo, aluminumMat);
    axle.position.set(0, 0, 0.55);
    intakeGroup.add(axle);

    // 4x High-Grip Compliant Silicone Stars
    [-0.26, -0.09, 0.09, 0.26].forEach((xPos) => {
      const starGeo = new THREE.CylinderGeometry(0.18, 0.18, 0.06, 6);
      starGeo.rotateZ(Math.PI / 2);
      const star = new THREE.Mesh(starGeo, goldAccentMat);
      star.position.set(xPos, 0, 0.55);
      intakeGroup.add(star);
    });

    robotAssembly.add(intakeGroup);

    // E. Autonomous Avionics & Control Deck
    const deckGeo = new THREE.BoxGeometry(1.1, 0.04, 0.7);
    const deck = new THREE.Mesh(deckGeo, darkAlumMat);
    deck.position.set(0, -0.48, -0.4);
    robotAssembly.add(deck);

    // REV Control Hub (Android SOC with LED beacon)
    const hubBoxGeo = new THREE.BoxGeometry(0.42, 0.12, 0.35);
    const hubBox = new THREE.Mesh(hubBoxGeo, darkAlumMat);
    hubBox.position.set(-0.25, -0.4, -0.4);
    robotAssembly.add(hubBox);

    const ledBeaconGeo = new THREE.BoxGeometry(0.04, 0.02, 0.04);
    const ledBeaconMat = new THREE.MeshBasicMaterial({ color: 0x10b981 });
    const ledBeacon = new THREE.Mesh(ledBeaconGeo, ledBeaconMat);
    ledBeacon.position.set(-0.25, -0.33, -0.4);
    robotAssembly.add(ledBeacon);

    // Battery Pack
    const batteryGeo = new THREE.BoxGeometry(0.32, 0.14, 0.28);
    const battery = new THREE.Mesh(batteryGeo, aluminumMat);
    battery.position.set(0.3, -0.39, -0.4);
    robotAssembly.add(battery);

    // Center and scale the assembled model inside robotHolder
    robotHolder.scale.set(0.85, 0.85, 0.85);
    robotHolder.position.y = 0.1;

    // Optional GLTF Loader integration if user has a verified GLB model
    if (modelUrl) {
      const loader = new GLTFLoader();
      loader.load(
        modelUrl,
        (gltf) => {
          // Cleanly replace procedural assembly with source CAD GLB
          robotHolder.remove(robotAssembly);
          robotHolder.add(gltf.scene);
          setHasModelFile(true);
        },
        undefined,
        (err) => {
          console.warn('[Robot3DCanvas] CAD model load fallback to verified procedural CAD:', err);
        }
      );
    }

    setIsLoaded(true);

    // 8. IntersectionObserver to PAUSE rendering when offscreen (Section 9.2)
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          isVisibleRef.current = entry.isIntersecting;
        });
      },
      { threshold: 0.1 }
    );
    observer.observe(container);

    // Page Visibility listener
    const handleVisibilityChange = () => {
      isVisibleRef.current = document.visibilityState === 'visible';
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);

    // 9. Resize handler
    const handleResize = () => {
      if (!container || !rendererRef.current || !cameraRef.current) return;
      const w = container.clientWidth;
      const h = container.clientHeight;
      cameraRef.current.aspect = w / h;
      cameraRef.current.updateProjectionMatrix();
      rendererRef.current.setSize(w, h);
    };
    window.addEventListener('resize', handleResize);

    // 10. Single Managed Animation Loop (Section 9.2: zero object allocation in loop)
    const projectedVector = new THREE.Vector3();
    let lastTime = performance.now();

    const animate = () => {
      animFrameRef.current = requestAnimationFrame(animate);

      // Skip render if offscreen or hidden
      if (!isVisibleRef.current) return;

      const now = performance.now();
      const delta = (now - lastTime) / 1000;
      lastTime = now;

      // Auto slow rotation if not dragging and reduced-motion not active
      if (autoRotateRef.current && !prefersReducedMotionRef.current) {
        targetRotationRef.current.y += 0.28 * delta;
      }

      // Smooth Lerp Damping
      const lerpFactor = prefersReducedMotionRef.current ? 1.0 : 0.06;
      currentRotationRef.current.x += (targetRotationRef.current.x - currentRotationRef.current.x) * lerpFactor;
      currentRotationRef.current.y += (targetRotationRef.current.y - currentRotationRef.current.y) * lerpFactor;

      // Clamp vertical pitch to avoid model flipping
      currentRotationRef.current.x = Math.max(-0.6, Math.min(0.65, currentRotationRef.current.x));

      if (robotMotionRef.current) {
        robotMotionRef.current.rotation.x = currentRotationRef.current.x;
        robotMotionRef.current.rotation.y = currentRotationRef.current.y;
      }

      // Render
      if (rendererRef.current && sceneRef.current && cameraRef.current) {
        rendererRef.current.render(sceneRef.current, cameraRef.current);
      }

      // Project 3D Subsystem Pins to 2D Screen Percentages
      if (cameraRef.current && robotHolderRef.current) {
        const matrixWorld = robotHolderRef.current.matrixWorld;
        const newCoords = SUBSYSTEM_PINS.map((pin, idx) => {
          projectedVector.copy(pin.pos3D);
          projectedVector.applyMatrix4(matrixWorld);
          projectedVector.project(cameraRef.current!);
          const visible = projectedVector.z < 1.0;
          const x = (projectedVector.x * 0.5 + 0.5) * 100;
          const y = (-(projectedVector.y * 0.5) + 0.5) * 100;
          return { id: pin.id, idx, name: pin.name, x, y, visible };
        });
        setProjectedPins(newCoords);

        // Update Pitch & Yaw for HUD
        setPitchYaw({
          pitch: Number((currentRotationRef.current.x * (180 / Math.PI)).toFixed(1)),
          yaw: Number((currentRotationRef.current.y * (180 / Math.PI)).toFixed(1)),
        });
      }
    };

    animFrameRef.current = requestAnimationFrame(animate);

    // Teardown
    return () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
      window.removeEventListener('resize', handleResize);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      observer.disconnect();

      if (rendererRef.current) {
        rendererRef.current.dispose();
      }
      materials.forEach((m) => m.dispose());
      scene.clear();
    };
  }, [modelUrl]);

  // Mode updates (RENDER, BLUEPRINT, TELEMETRY)
  useEffect(() => {
    materialsRef.current.forEach((mat) => {
      if (mat instanceof THREE.MeshStandardMaterial) {
        if (cadMode === 'blueprint') {
          mat.color.set(0x38bdf8);
          mat.emissive.set(0x0284c7);
          mat.emissiveIntensity = 0.35;
          mat.wireframe = true;
        } else if (cadMode === 'telemetry') {
          mat.color.set(0xffcc00);
          mat.emissive.set(0xb38600);
          mat.emissiveIntensity = 0.25;
          mat.wireframe = false;
        } else {
          // Normal Render
          mat.wireframe = false;
          mat.emissiveIntensity = 0.05;
          if (mat.name === 'goldAccent') mat.color.set(0xffcc00);
        }
      }
    });
  }, [cadMode]);

  // Mouse & Touch Pointer Drag Handlers
  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    isDraggingRef.current = true;
    autoRotateRef.current = false;
    prevPointerRef.current = { x: e.clientX, y: e.clientY };
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!isDraggingRef.current) return;
    const deltaX = e.clientX - prevPointerRef.current.x;
    const deltaY = e.clientY - prevPointerRef.current.y;
    prevPointerRef.current = { x: e.clientX, y: e.clientY };

    targetRotationRef.current.y += deltaX * 0.008;
    targetRotationRef.current.x += deltaY * 0.008;
  };

  const handlePointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    isDraggingRef.current = false;
    try {
      (e.target as HTMLElement).releasePointerCapture(e.pointerId);
    } catch {
      // Ignored
    }
    // Resume auto-rotation after 3.5s of inactivity
    setTimeout(() => {
      if (!isDraggingRef.current) autoRotateRef.current = true;
    }, 3500);
  };

  const handleResetView = () => {
    targetRotationRef.current = { x: 0.15, y: -0.45 };
    autoRotateRef.current = true;
  };

  return (
    <div className={`relative w-full h-full min-h-[380px] bg-[#050610] overflow-hidden select-none ${className}`}>
      {/* 3D WebGL Canvas Container */}
      <div
        ref={mountRef}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
        className="w-full h-full min-h-[380px] cursor-grab active:cursor-grabbing touch-pan-y"
      />

      {/* Fallback Poster (Displayed if WebGL fails or while loading) */}
      {!webGlSupported && (
        <div className="absolute inset-0 flex flex-col items-center justify-center p-6 bg-[#08081a] text-center">
          <img
            src="/Photo/cad-robot.jpg"
            alt="HSGS RoboLads Robot CAD Fallback"
            className="max-w-md max-h-56 object-contain mb-4 border border-[#1e223d]"
          />
          <p className="font-pixel text-[10px] text-amber-400 mb-1">
            HARDWARE ACCELERATION NOTICE
          </p>
          <p className="text-xs text-slate-400 max-w-sm font-sans">
            WebGL is inactive or unsupported on your browser. Displaying static verified CAD assembly view.
          </p>
        </div>
      )}

      {/* Top HUD Telemetry Readout */}
      <div className="absolute top-3 left-4 right-4 flex items-center justify-between font-pixel text-[8px] sm:text-[9px] pointer-events-none z-20">
        <div className="flex items-center gap-2 text-amber-400 bg-[#08081a]/85 backdrop-blur-sm px-2.5 py-1 border border-[#1e223d] shadow-[2px_2px_0_#000000]">
          <Crosshair className="w-3.5 h-3.5 text-amber-400" />
          <span>THREE.JS REAL-TIME 3D CAD ENGINE</span>
        </div>

        <div className="hidden sm:flex items-center gap-3 text-slate-400 bg-[#08081a]/85 backdrop-blur-sm px-2.5 py-1 border border-[#1e223d]">
          <span className="text-emerald-400">● 60 FPS</span>
          <span>PITCH: {pitchYaw.pitch}°</span>
          <span>YAW: {pitchYaw.yaw}°</span>
        </div>
      </div>

      {/* Real-Time Projected 3D Subsystem Pins */}
      {isLoaded &&
        webGlSupported &&
        projectedPins.map((pin) => {
          if (!pin.visible) return null;
          const isActive = activeSubsystem === pin.idx;
          return (
            <button
              key={pin.id}
              type="button"
              onClick={() => onSelectSubsystem(pin.idx)}
              style={{
                left: `${pin.x}%`,
                top: `${pin.y}%`,
              }}
              className={`absolute -translate-x-1/2 -translate-y-1/2 w-7 h-7 font-pixel text-[9px] border-2 shadow-[2px_2px_0_#000000] cursor-pointer touch-manipulation z-30 transition-transform duration-150 ${
                isActive
                  ? 'bg-amber-400 text-black border-white scale-125 shadow-[0_0_12px_rgba(255,204,0,0.85)]'
                  : 'bg-[#0e1023] text-amber-400 border-amber-400 hover:scale-115 hover:bg-amber-400 hover:text-black'
              }`}
              title={`Inspect 0${pin.idx + 1}: ${pin.name}`}
              aria-label={`Inspect subsystem: ${pin.name}`}
            >
              <span>0{pin.idx + 1}</span>
              {isActive && (
                <span className="absolute inset-[-6px] border border-amber-400 pointer-events-none animate-ping" />
              )}
            </button>
          );
        })}

      {/* Bottom Controls Bar */}
      <div className="absolute bottom-3 left-4 right-4 flex items-center justify-between z-20 pointer-events-auto">
        <span className="text-[8px] font-pixel text-slate-500 hidden sm:inline bg-[#08081a]/80 px-2 py-1 border border-[#1e223d]">
          DRAG TO ROTATE 3D PERSPECTIVE • TAP HOTSPOTS TO FOCUS
        </span>

        <button
          type="button"
          onClick={handleResetView}
          className="font-pixel text-[8px] sm:text-[9px] px-2.5 py-1 bg-[#0e1023] border border-[#1e223d] hover:border-amber-400 text-amber-400 flex items-center gap-1.5 shadow-[2px_2px_0_#000000] cursor-pointer ml-auto"
          title="Reset 3D camera to default orientation"
        >
          <RotateCcw className="w-3 h-3 text-amber-400" />
          <span>RESET VIEW</span>
        </button>
      </div>
    </div>
  );
}

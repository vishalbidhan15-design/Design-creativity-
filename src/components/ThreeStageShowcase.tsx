import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';
import { SlideData, ThemePalette } from '../types/presentation';
import {
  AtmospherePreset,
  computeSlideLayerOffset,
} from '../utils/deckEngine';
import { ChevronDown, ChevronUp, Pause, Play, RotateCcw } from 'lucide-react';

interface ThreeStageShowcaseProps {
  deckTitle: string;
  slides: SlideData[];
  activeSlideIndex: number;
  theme: ThemePalette;
  atmosphere: AtmospherePreset;
  onSelectSlideIndex?: (index: number) => void;
}

type CameraPresetId = 'isometric' | 'front' | 'top';

const CAMERA_PRESETS: Record<
  CameraPresetId,
  { pos: [number, number, number]; look: [number, number, number]; label: string }
> = {
  isometric: {
    pos: [4.2, 2.35, 5.4],
    look: [0, 0.25, 0],
    label: 'Isometric Orbit',
  },
  front: {
    pos: [0.2, 0.75, 6.2],
    look: [0, 0.3, 0],
    label: 'Keynote Front',
  },
  top: {
    pos: [0.0, 6.4, 2.2],
    look: [0, 0.0, 0],
    label: 'Blueprint Overhead',
  },
};

// Pre-allocated scratch objects outside the render loop (Zero GC in tick)
const _targetCamPos = new THREE.Vector3();
const _targetLookAt = new THREE.Vector3();
const _currentLookAt = new THREE.Vector3(0, 0.25, 0);
const _dummyMatrix = new THREE.Matrix4();
const _dummyPos = new THREE.Vector3();
const _dummyQuat = new THREE.Quaternion();
const _dummyScale = new THREE.Vector3();
const _tempColor = new THREE.Color();

function createSlideCanvasTexture(
  slide: SlideData,
  slideIdx: number,
  totalSlides: number,
  deckTitle: string,
  theme: ThemePalette,
  maxAnisotropy: number
): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 1024;
  canvas.height = 576;
  const ctx = canvas.getContext('2d');
  if (ctx) {
    // Background fill
    ctx.fillStyle = theme.backgroundHex;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Subtle architectural grid lines
    ctx.strokeStyle = theme.borderHex;
    ctx.lineWidth = 1;
    for (let x = 64; x < canvas.width; x += 80) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, canvas.height);
      ctx.stroke();
    }

    // Top Accent Bar
    ctx.fillStyle = theme.accentHex;
    ctx.fillRect(0, 0, canvas.width, 12);

    // Header Kicker & Slide Index
    ctx.fillStyle = theme.accentHex;
    ctx.font = '600 22px "Plus Jakarta Sans", sans-serif';
    ctx.fillText(slide.sectionKicker.toUpperCase(), 56, 68);

    ctx.fillStyle = theme.textMutedHex;
    ctx.font = '500 20px "JetBrains Mono", monospace';
    const counterText = `${String(slideIdx + 1).padStart(2, '0')} / ${String(
      totalSlides
    ).padStart(2, '0')}`;
    ctx.fillText(counterText, canvas.width - 140, 68);

    // Header divider
    ctx.strokeStyle = theme.borderHex;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(56, 92);
    ctx.lineTo(canvas.width - 56, 92);
    ctx.stroke();

    const hasInjectedMedia =
      slide.customMedia && slide.customMedia.mode !== 'artwork';
    const maxHeadlineWidth = hasInjectedMedia ? 500 : canvas.width - 120;

    // Headline (word-wrapped up to 2 lines)
    ctx.fillStyle = theme.textPrimaryHex;
    ctx.font = '700 38px "Plus Jakarta Sans", sans-serif';
    const words = slide.headline.split(' ');
    let line = '';
    let y = 164;
    for (let i = 0; i < words.length; i++) {
      const testLine = line + words[i] + ' ';
      if (ctx.measureText(testLine).width > maxHeadlineWidth && line !== '') {
        ctx.fillText(line.trim(), 56, y);
        line = words[i] + ' ';
        y += 48;
        if (y > 224) break;
      } else {
        line = testLine;
      }
    }
    if (y <= 224 && line.trim()) {
      ctx.fillText(line.trim(), 56, y);
    }

    // Subtitle
    ctx.fillStyle = theme.accentHex;
    ctx.font = '600 22px "DM Sans", sans-serif';
    ctx.fillText(
      slide.subtitle.slice(0, hasInjectedMedia ? 36 : 62),
      56,
      278
    );

    if (hasInjectedMedia && slide.customMedia) {
      // Designated Media Placeholder on Right Half of 3D Slide
      const mx = 580;
      const my = 122;
      const mw = 388;
      const mh = 362;

      const mediaGrad = ctx.createLinearGradient(mx, my, mx + mw, my + mh);
      mediaGrad.addColorStop(0, '#1E1B4B');
      mediaGrad.addColorStop(0.5, '#311042');
      mediaGrad.addColorStop(1, '#0F172A');
      ctx.fillStyle = mediaGrad;
      ctx.fillRect(mx, my, mw, mh);

      ctx.strokeStyle = theme.accentHex;
      ctx.lineWidth = 3;
      ctx.strokeRect(mx, my, mw, mh);

      // Dynamic Aurora Wave / Media Preview Graphic inside 3D Placeholder
      const waveColors = ['#38BDF8', '#F472B6', '#FBBF24'];
      for (let wIdx = 0; wIdx < 3; wIdx++) {
        ctx.beginPath();
        ctx.strokeStyle = waveColors[wIdx];
        ctx.lineWidth = 3;
        for (let px = 16; px <= mw - 16; px += 12) {
          const py =
            my +
            mh * 0.48 +
            Math.sin(px * 0.025 + wIdx * 1.4 + slideIdx) * (26 + wIdx * 10);
          if (px === 16) ctx.moveTo(mx + px, py);
          else ctx.lineTo(mx + px, py);
        }
        ctx.stroke();
      }

      // Badge & Injected Media Caption inside 3D Slide
      ctx.fillStyle = theme.accentHex;
      ctx.fillRect(mx + 16, my + 16, 176, 30);
      ctx.fillStyle = '#FFFFFF';
      ctx.font = '700 14px "JetBrains Mono", monospace';
      ctx.fillText(
        `INJECTED ${slide.customMedia.mode.toUpperCase()}`,
        mx + 28,
        my + 36
      );

      ctx.fillStyle = 'rgba(0, 0, 0, 0.72)';
      ctx.fillRect(mx + 2, my + mh - 54, mw - 4, 52);
      ctx.fillStyle = '#F8FAFC';
      ctx.font = '500 15px "JetBrains Mono", monospace';
      ctx.fillText(
        (slide.customMedia.caption || 'Visitor Media').slice(0, 34),
        mx + 16,
        my + mh - 22
      );
    }

    // KPI Cards Row at Bottom of Slide
    const kpiList =
      slide.kpis.length > 0
        ? slide.kpis.slice(0, hasInjectedMedia ? 2 : 3)
        : [
            { label: 'Grid Precision', value: '12-Col', delta: 'WCAG AAA' },
            { label: 'Frame Aspect', value: '16:9 HD', delta: 'Vector Sync' },
            { label: 'Slide Layer', value: `#0${slideIdx + 1}`, delta: 'Active' },
          ].slice(0, hasInjectedMedia ? 2 : 3);

    const cardWidth = hasInjectedMedia ? 236 : 278;
    const cardHeight = 148;
    const startX = 56;
    const cardY = 336;

    kpiList.forEach((kpi, idx) => {
      const x = startX + idx * (cardWidth + 24);
      ctx.fillStyle = theme.surfaceHex;
      ctx.fillRect(x, cardY, cardWidth, cardHeight);
      ctx.strokeStyle = theme.borderHex;
      ctx.lineWidth = 2;
      ctx.strokeRect(x, cardY, cardWidth, cardHeight);

      // Accent top bar on KPI card
      ctx.fillStyle = theme.accentHex;
      ctx.fillRect(x, cardY, 64, 4);

      ctx.fillStyle = theme.textMutedHex;
      ctx.font = '500 17px "DM Sans", sans-serif';
      ctx.fillText(kpi.label.slice(0, 20), x + 18, cardY + 42);

      ctx.fillStyle = theme.textPrimaryHex;
      ctx.font = '700 34px "JetBrains Mono", monospace';
      ctx.fillText(kpi.value, x + 18, cardY + 94);

      ctx.fillStyle = theme.accentHex;
      ctx.font = '600 16px "JetBrains Mono", monospace';
      ctx.fillText(kpi.delta, x + 18, cardY + 128);
    });

    // Footer bar
    ctx.fillStyle = theme.textMutedHex;
    ctx.font = '400 16px "DM Sans", sans-serif';
    ctx.fillText(deckTitle.slice(0, 48), 56, 536);
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.anisotropy = maxAnisotropy;
  texture.needsUpdate = true;
  return texture;
}

export const ThreeStageShowcase: React.FC<ThreeStageShowcaseProps> = ({
  deckTitle,
  slides,
  activeSlideIndex,
  theme,
  atmosphere,
}) => {
  const canvasMountRef = useRef<HTMLDivElement | null>(null);
  const [explosionPct, setExplosionPct] = useState<number>(55);
  const [cameraPreset, setCameraPreset] = useState<CameraPresetId>('isometric');
  const [isPlaying, setIsPlaying] = useState<boolean>(true);
  const [isDockCollapsed, setIsDockCollapsed] = useState<boolean>(false);

  // Store mutable state in refs so React UI updates never tear down the WebGLRenderer
  const stateRef = useRef({
    explosionFactor: 0.55,
    currentExplosion: 0.55,
    cameraPreset: 'isometric' as CameraPresetId,
    isPlaying: true,
    pointerX: 0,
    pointerY: 0,
    theme,
    atmosphere,
    slides,
    activeSlideIndex,
    deckTitle,
    texturesDirty: false,
  });

  useEffect(() => {
    stateRef.current.explosionFactor = explosionPct / 100;
  }, [explosionPct]);

  useEffect(() => {
    stateRef.current.cameraPreset = cameraPreset;
  }, [cameraPreset]);

  useEffect(() => {
    stateRef.current.isPlaying = isPlaying;
  }, [isPlaying]);

  useEffect(() => {
    stateRef.current.theme = theme;
    stateRef.current.atmosphere = atmosphere;
    stateRef.current.slides = slides;
    stateRef.current.activeSlideIndex = activeSlideIndex;
    stateRef.current.deckTitle = deckTitle;
    stateRef.current.texturesDirty = true;
  }, [theme, atmosphere, slides, activeSlideIndex, deckTitle]);

  useEffect(() => {
    const container = canvasMountRef.current;
    if (!container) return;

    // 1. Detect software WebGL (SwiftShader / llvmpipe) from GPU renderer string
    const isSoftwareGl = (() => {
      const probeCanvas = document.createElement('canvas');
      const gl = probeCanvas.getContext('webgl2');
      if (!gl) return true;
      const ext = gl.getExtension('WEBGL_debug_renderer_info');
      const param = ext ? ext.UNMASKED_RENDERER_WEBGL : gl.RENDERER;
      const gpu = String(gl.getParameter(param));
      gl.getExtension('WEBGL_lose_context')?.loseContext();
      return /SwiftShader|llvmpipe|softpipe|Software|Basic Render/i.test(gpu);
    })();

    const width = container.clientWidth || 1200;
    const height = container.clientHeight || 380;

    const renderer = new THREE.WebGLRenderer({
      antialias: !isSoftwareGl,
      powerPreference: 'high-performance',
    });
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.12;
    renderer.setPixelRatio(
      isSoftwareGl ? 1 : Math.min(window.devicePixelRatio, 2)
    );
    renderer.setSize(width, height);
    renderer.shadowMap.enabled = !isSoftwareGl;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    container.innerHTML = '';
    container.appendChild(renderer.domElement);

    const scene = new THREE.Scene();
    const initialSky = new THREE.Color(stateRef.current.atmosphere.threeSkyHex);
    scene.background = initialSky;
    scene.fog = new THREE.FogExp2(initialSky.getHex(), 0.065);

    // 2. Studio Environment Map via RoomEnvironment + PMREMGenerator
    const pmremGenerator = new THREE.PMREMGenerator(renderer);
    const envTexture = pmremGenerator.fromScene(
      new RoomEnvironment(),
      0.04
    ).texture;
    scene.environment = envTexture;
    pmremGenerator.dispose();

    const camera = new THREE.PerspectiveCamera(42, width / height, 0.1, 100);
    camera.position.set(4.2, 2.35, 5.4);
    camera.lookAt(0, 0.25, 0);

    // 3. Balanced 3-Point Warm/Cool Studio Lighting Rig
    const hemiLight = new THREE.HemisphereLight(0xdbeafe, 0x1e1b4b, 0.85);
    scene.add(hemiLight);

    const keyLight = new THREE.DirectionalLight(
      stateRef.current.atmosphere.threeKeyLightHex,
      2.4
    );
    keyLight.position.set(5, 7, 6);
    keyLight.castShadow = !isSoftwareGl;
    keyLight.shadow.bias = -0.0005;
    keyLight.shadow.normalBias = 0.02;
    keyLight.shadow.camera.left = -5;
    keyLight.shadow.camera.right = 5;
    keyLight.shadow.camera.top = 5;
    keyLight.shadow.camera.bottom = -5;
    scene.add(keyLight);

    const rimLight = new THREE.DirectionalLight(
      stateRef.current.atmosphere.threeRimLightHex,
      1.8
    );
    rimLight.position.set(-6, 4, -5);
    scene.add(rimLight);

    // 4. Grounding: Floor Grid + Soft Radial Contact Shadow + Beveled Podium Plinth
    const floorGrid = new THREE.GridHelper(18, 24, 0x3b82f6, 0x1e293b);
    floorGrid.position.y = -1.6;
    const gridMat = floorGrid.material as THREE.Material;
    gridMat.transparent = true;
    gridMat.opacity = 0.32;
    gridMat.polygonOffset = true;
    gridMat.polygonOffsetFactor = -1;
    gridMat.polygonOffsetUnits = -1;
    scene.add(floorGrid);

    const contactShadowGeo = new THREE.CircleGeometry(3.4, 32);
    contactShadowGeo.rotateX(-Math.PI / 2);
    const contactShadowMat = new THREE.MeshBasicMaterial({
      color: 0x000000,
      transparent: true,
      opacity: 0.42,
      depthWrite: false,
    });
    const contactShadow = new THREE.Mesh(contactShadowGeo, contactShadowMat);
    contactShadow.position.y = -1.58;
    scene.add(contactShadow);

    // Composite 7-Part Procedural 3D Architectural Presentation Stage Group
    const stageGroup = new THREE.Group();
    scene.add(stageGroup);

    // Part 1: Beveled Architectural Podium Base (ExtrudeGeometry)
    const plinthShape = new THREE.Shape();
    const pw = 2.6;
    const pd = 1.6;
    plinthShape.moveTo(-pw, -pd);
    plinthShape.lineTo(pw, -pd);
    plinthShape.lineTo(pw, pd);
    plinthShape.lineTo(-pw, pd);
    plinthShape.closePath();

    const plinthGeo = new THREE.ExtrudeGeometry(plinthShape, {
      depth: 0.16,
      bevelEnabled: true,
      bevelSegments: 3,
      steps: 1,
      bevelSize: 0.06,
      bevelThickness: 0.05,
    });
    plinthGeo.rotateX(Math.PI / 2);
    const plinthMat = new THREE.MeshStandardMaterial({
      color: 0x1e293b,
      roughness: 0.72,
      metalness: 0.25,
    });
    const plinthMesh = new THREE.Mesh(plinthGeo, plinthMat);
    plinthMesh.position.y = -1.38;
    plinthMesh.receiveShadow = true;
    stageGroup.add(plinthMesh);

    // Part 2: Metallic Accent Trim Ring on Podium
    const baseRingGeo = new THREE.TorusGeometry(2.15, 0.025, 16, 64);
    baseRingGeo.rotateX(Math.PI / 2);
    const accentMetalMat = new THREE.MeshStandardMaterial({
      color: new THREE.Color(stateRef.current.theme.accentHex),
      roughness: 0.18,
      metalness: 0.92,
    });
    const baseRingMesh = new THREE.Mesh(baseRingGeo, accentMetalMat);
    baseRingMesh.position.y = -1.32;
    stageGroup.add(baseRingMesh);

    // Parts 3, 4, 5: Three Cascading 3D Presentation Slide Slabs (Each a composite frame + canvas screen)
    const maxAnisotropy = renderer.capabilities.getMaxAnisotropy();
    const slideFrameGeo = new THREE.BoxGeometry(3.28, 1.88, 0.06);
    const slideScreenGeo = new THREE.PlaneGeometry(3.16, 1.78);
    const frameMaterial = new THREE.MeshStandardMaterial({
      color: 0x334155,
      roughness: 0.28,
      metalness: 0.82,
    });

    const slideCardsGroup = new THREE.Group();
    stageGroup.add(slideCardsGroup);

    const slideCardMeshes: {
      group: THREE.Group;
      screenMat: THREE.MeshStandardMaterial;
    }[] = [];

    for (let i = 0; i < 3; i++) {
      const cardGroup = new THREE.Group();
      const frameMesh = new THREE.Mesh(slideFrameGeo, frameMaterial);
      frameMesh.castShadow = !isSoftwareGl;
      frameMesh.receiveShadow = !isSoftwareGl;
      cardGroup.add(frameMesh);

      const sIdx =
        (stateRef.current.activeSlideIndex + i) %
        stateRef.current.slides.length;
      const tex = createSlideCanvasTexture(
        stateRef.current.slides[sIdx],
        sIdx,
        stateRef.current.slides.length,
        stateRef.current.deckTitle,
        stateRef.current.theme,
        maxAnisotropy
      );

      const screenMat = new THREE.MeshStandardMaterial({
        color: 0xffffff,
        map: tex,
        roughness: 0.22,
        metalness: 0.08,
      });
      const screenMesh = new THREE.Mesh(slideScreenGeo, screenMat);
      screenMesh.position.z = 0.034;
      cardGroup.add(screenMesh);

      slideCardsGroup.add(cardGroup);
      slideCardMeshes.push({ group: cardGroup, screenMat });
    }

    // Part 6 & 7: Kinetic Orbital Telemetry Rings & Precision Faceted Core
    const orbitGroup = new THREE.Group();
    orbitGroup.position.set(0, 0.25, 0);
    stageGroup.add(orbitGroup);

    const outerRingGeo = new THREE.TorusGeometry(2.55, 0.022, 16, 80);
    const outerRingMesh = new THREE.Mesh(outerRingGeo, accentMetalMat);
    outerRingMesh.rotation.x = Math.PI / 3;
    orbitGroup.add(outerRingMesh);

    const innerRingGeo = new THREE.TorusGeometry(2.1, 0.016, 16, 64);
    const silverMetalMat = new THREE.MeshStandardMaterial({
      color: 0xe2e8f0,
      roughness: 0.22,
      metalness: 0.88,
    });
    const innerRingMesh = new THREE.Mesh(innerRingGeo, silverMetalMat);
    innerRingMesh.rotation.y = Math.PI / 4;
    orbitGroup.add(innerRingMesh);

    // Floating Prism Satellite on the side of the stage
    const prismGroup = new THREE.Group();
    prismGroup.position.set(-2.45, 0.65, 0.6);
    const coreGeo = new THREE.IcosahedronGeometry(0.36, 0);
    const coreMat = new THREE.MeshPhysicalMaterial({
      color: new THREE.Color(stateRef.current.theme.accentHex),
      roughness: 0.15,
      metalness: 0.35,
      clearcoat: 1.0,
    });
    const coreMesh = new THREE.Mesh(coreGeo, coreMat);
    prismGroup.add(coreMesh);

    const cageGeo = new THREE.IcosahedronGeometry(0.48, 1);
    const cageMat = new THREE.MeshBasicMaterial({
      color: 0x93c5fd,
      wireframe: true,
      transparent: true,
      opacity: 0.45,
    });
    const cageMesh = new THREE.Mesh(cageGeo, cageMat);
    prismGroup.add(cageMesh);
    stageGroup.add(prismGroup);

    // InstancedMesh of 36 Orbital Data Nodes around the stage
    const nodeCount = 36;
    const nodeGeo = new THREE.OctahedronGeometry(0.065, 0);
    const nodeMat = new THREE.MeshStandardMaterial({
      color: 0xffffff,
      roughness: 0.25,
      metalness: 0.75,
    });
    const nodesInstanced = new THREE.InstancedMesh(
      nodeGeo,
      nodeMat,
      nodeCount
    );
    const nodeOrbits: {
      radius: number;
      angle: number;
      speed: number;
      yBase: number;
      scale: number;
    }[] = [];

    for (let i = 0; i < nodeCount; i++) {
      const angle = (i / nodeCount) * Math.PI * 2;
      const radius = 2.8 + (i % 4) * 0.45;
      const yBase = -0.9 + ((i * 7) % 10) * 0.24;
      const scale = 0.75 + (i % 5) * 0.14;
      nodeOrbits.push({
        radius,
        angle,
        speed: 0.18 + (i % 3) * 0.08,
        yBase,
        scale,
      });

      _dummyPos.set(
        Math.cos(angle) * radius,
        yBase,
        Math.sin(angle) * radius
      );
      _dummyQuat.identity();
      _dummyScale.setScalar(scale);
      _dummyMatrix.compose(_dummyPos, _dummyQuat, _dummyScale);
      nodesInstanced.setMatrixAt(i, _dummyMatrix);

      _tempColor.set(
        i % 2 === 0
          ? stateRef.current.atmosphere.threeKeyLightHex
          : stateRef.current.atmosphere.threeRimLightHex
      );
      nodesInstanced.setColorAt(i, _tempColor);
    }
    nodesInstanced.instanceMatrix.needsUpdate = true;
    if (nodesInstanced.instanceColor) {
      nodesInstanced.instanceColor.needsUpdate = true;
    }
    nodesInstanced.computeBoundingSphere();
    nodesInstanced.frustumCulled = false;
    stageGroup.add(nodesInstanced);

    if (!isSoftwareGl) {
      renderer.compile(scene, camera);
    }

    // Pointer move listener for subtle parallax
    const handlePointerMove = (e: PointerEvent) => {
      const rect = renderer.domElement.getBoundingClientRect();
      if (rect.width <= 0 || rect.height <= 0) return;
      const nx = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      const ny = -((e.clientY - rect.top) / rect.height) * 2 + 1;
      stateRef.current.pointerX = nx * 0.35;
      stateRef.current.pointerY = ny * 0.2;
    };
    renderer.domElement.addEventListener('pointermove', handlePointerMove);

    // Resize handler
    const handleResize = () => {
      if (!container) return;
      const w = container.clientWidth || 1200;
      const h = container.clientHeight || 380;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    window.addEventListener('resize', handleResize);

    // Software-WebGL fenceSync frame pacing helper
    let frameId = 0;
    let isDisposed = false;

    function afterDraw(cb: () => void) {
      const gl = renderer.getContext() as WebGL2RenderingContext;
      if (!gl || typeof gl.fenceSync !== 'function') {
        frameId = window.setTimeout(cb, 80);
        return;
      }
      const sync = gl.fenceSync(gl.SYNC_GPU_COMMANDS_COMPLETE, 0);
      gl.flush();
      const poll = () => {
        if (isDisposed) return;
        const state = sync && gl.getSyncParameter(sync, gl.SYNC_STATUS);
        if (state === gl.UNSIGNALED) {
          frameId = window.setTimeout(poll, 5);
        } else {
          if (sync) gl.deleteSync(sync);
          frameId = window.setTimeout(cb, 80);
        }
      };
      frameId = window.setTimeout(poll, 5);
    }

    const clock = new THREE.Clock();

    function tick() {
      if (isDisposed) return;
      const dt = Math.min(clock.getDelta(), 0.1);
      const elapsed = clock.getElapsedTime();
      const st = stateRef.current;

      // Refresh slide textures & atmosphere colors when state changes
      if (st.texturesDirty) {
        st.texturesDirty = false;
        _tempColor.set(st.atmosphere.threeSkyHex);
        scene.background = _tempColor.clone();
        if (scene.fog instanceof THREE.FogExp2) {
          scene.fog.color.copy(_tempColor);
        }
        keyLight.color.set(st.atmosphere.threeKeyLightHex);
        rimLight.color.set(st.atmosphere.threeRimLightHex);
        accentMetalMat.color.set(st.theme.accentHex);
        coreMat.color.set(st.theme.accentHex);

        slideCardMeshes.forEach((item, idx) => {
          const sIdx = (st.activeSlideIndex + idx) % st.slides.length;
          const oldMap = item.screenMat.map;
          const newMap = createSlideCanvasTexture(
            st.slides[sIdx],
            sIdx,
            st.slides.length,
            st.deckTitle,
            st.theme,
            maxAnisotropy
          );
          item.screenMat.map = newMap;
          item.screenMat.needsUpdate = true;
          oldMap?.dispose();
        });
      }

      // Smooth exponential damping on exploded view factor
      st.currentExplosion = THREE.MathUtils.damp(
        st.currentExplosion,
        st.explosionFactor,
        6,
        dt
      );

      // Position the 3 cascading 3D slides
      for (let i = 0; i < slideCardMeshes.length; i++) {
        const offset = computeSlideLayerOffset(
          i,
          slideCardMeshes.length,
          st.currentExplosion
        );
        const card = slideCardMeshes[i].group;
        card.position.z = offset.zOffset;
        card.position.y =
          0.25 +
          offset.yOffset +
          (st.isPlaying ? Math.sin(elapsed * 1.6 + i * 1.1) * 0.05 : 0);
        card.rotation.y =
          offset.rotationY +
          (st.isPlaying ? Math.sin(elapsed * 0.7 + i) * 0.04 : 0);
      }

      // Animate orbital rings, crystal core, and instanced nodes
      if (st.isPlaying) {
        outerRingMesh.rotation.z += dt * 0.28;
        innerRingMesh.rotation.x += dt * 0.36;
        coreMesh.rotation.y += dt * 0.65;
        coreMesh.rotation.x += dt * 0.35;
        cageMesh.rotation.y -= dt * 0.4;

        for (let i = 0; i < nodeCount; i++) {
          const orb = nodeOrbits[i];
          const a = orb.angle + elapsed * orb.speed;
          _dummyPos.set(
            Math.cos(a) * orb.radius,
            orb.yBase + Math.sin(elapsed * 1.5 + i) * 0.12,
            Math.sin(a) * orb.radius
          );
          _dummyQuat.setFromAxisAngle(
            THREE.Object3D.DEFAULT_UP,
            elapsed + i * 0.5
          );
          _dummyScale.setScalar(orb.scale);
          _dummyMatrix.compose(_dummyPos, _dummyQuat, _dummyScale);
          nodesInstanced.setMatrixAt(i, _dummyMatrix);
        }
        nodesInstanced.instanceMatrix.needsUpdate = true;
      }

      // Smoothly damp camera toward active preset + pointer parallax
      const preset = CAMERA_PRESETS[st.cameraPreset];
      _targetCamPos.set(
        preset.pos[0] + st.pointerX,
        preset.pos[1] + st.pointerY,
        preset.pos[2]
      );
      _targetLookAt.set(preset.look[0], preset.look[1], preset.look[2]);

      camera.position.x = THREE.MathUtils.damp(
        camera.position.x,
        _targetCamPos.x,
        5,
        dt
      );
      camera.position.y = THREE.MathUtils.damp(
        camera.position.y,
        _targetCamPos.y,
        5,
        dt
      );
      camera.position.z = THREE.MathUtils.damp(
        camera.position.z,
        _targetCamPos.z,
        5,
        dt
      );

      _currentLookAt.x = THREE.MathUtils.damp(
        _currentLookAt.x,
        _targetLookAt.x,
        6,
        dt
      );
      _currentLookAt.y = THREE.MathUtils.damp(
        _currentLookAt.y,
        _targetLookAt.y,
        6,
        dt
      );
      _currentLookAt.z = THREE.MathUtils.damp(
        _currentLookAt.z,
        _targetLookAt.z,
        6,
        dt
      );
      camera.lookAt(_currentLookAt);

      renderer.render(scene, camera);

      if (isSoftwareGl) {
        afterDraw(tick);
      } else {
        frameId = requestAnimationFrame(tick);
      }
    }

    tick();

    return () => {
      isDisposed = true;
      cancelAnimationFrame(frameId);
      clearTimeout(frameId);
      window.removeEventListener('resize', handleResize);
      renderer.domElement.removeEventListener('pointermove', handlePointerMove);
      envTexture.dispose();
      plinthGeo.dispose();
      plinthMat.dispose();
      baseRingGeo.dispose();
      accentMetalMat.dispose();
      slideFrameGeo.dispose();
      slideScreenGeo.dispose();
      frameMaterial.dispose();
      slideCardMeshes.forEach((m) => {
        m.screenMat.map?.dispose();
        m.screenMat.dispose();
      });
      outerRingGeo.dispose();
      innerRingGeo.dispose();
      silverMetalMat.dispose();
      coreGeo.dispose();
      coreMat.dispose();
      cageGeo.dispose();
      cageMat.dispose();
      nodeGeo.dispose();
      nodeMat.dispose();
      contactShadowGeo.dispose();
      contactShadowMat.dispose();
      renderer.dispose();
    };
  }, []);

  return (
    <div
      data-testid="three-stage-showcase"
      className="relative w-full h-[360px] sm:h-[400px] border border-slate-800 overflow-hidden bg-slate-950 select-none"
    >
      {/* Isolated WebGL Canvas Mount Ref Container */}
      <div ref={canvasMountRef} className="w-full h-full" />

      {/* Minimal Top-Left Spec Badge (Unobstructed Center Viewport) */}
      <div className="pointer-events-none absolute top-3.5 left-4 z-10 flex items-center gap-2.5 px-3 py-1.5 bg-slate-950/85 border border-slate-800 text-xs text-slate-200">
        <span className="font-semibold text-white">3D Spatial Deck Stage</span>
        <span aria-hidden="true" className="text-slate-500">
          ·
        </span>
        <span className="font-mono tabular-nums text-[11px] text-sky-400">
          {atmosphere.name}
        </span>
        <span aria-hidden="true" className="text-slate-500 hidden sm:inline">
          ·
        </span>
        <span className="font-mono tabular-nums text-[11px] text-slate-400 hidden sm:inline">
          Exploded {explosionPct}%
        </span>
      </div>

      {/* Unified Collapsible Bottom Control Dock (Zero backdrop-filter over WebGL) */}
      <div
        className="absolute bottom-3 left-1/2 -translate-x-1/2 z-10 w-full max-w-[860px] px-3 flex flex-col items-center"
      >
        <button
          type="button"
          onClick={() => setIsDockCollapsed((prev) => !prev)}
          className="px-3 py-1 text-[11px] font-mono text-slate-300 bg-slate-900 border border-b-0 border-slate-700 hover:text-white transition-colors inline-flex items-center gap-1 whitespace-nowrap shrink-0"
        >
          {isDockCollapsed ? (
            <>
              <ChevronUp className="w-3 h-3" aria-hidden="true" />
              Show 3D Stage Controls
            </>
          ) : (
            <>
              <ChevronDown className="w-3 h-3" aria-hidden="true" />
              Hide 3D Stage Controls
            </>
          )}
        </button>

        {!isDockCollapsed && (
          <div className="w-full bg-slate-900/95 border border-slate-700 px-4 py-2.5 flex flex-wrap items-center justify-between gap-4 text-xs text-slate-200">
            {/* Exploded View Depth Slider */}
            <div className="flex items-center gap-2.5">
              <label
                htmlFor="three-exploded-slider"
                className="text-[11px] font-medium text-slate-300 whitespace-nowrap"
              >
                3D Layer Cascade:
              </label>
              <input
                id="three-exploded-slider"
                type="range"
                min={0}
                max={100}
                value={explosionPct}
                onChange={(e) => setExplosionPct(Number(e.target.value))}
                className="w-24 sm:w-28 accent-blue-500 cursor-pointer"
              />
              <span className="font-mono text-[11px] tabular-nums text-sky-400 w-9">
                {explosionPct}%
              </span>
            </div>

            {/* Camera Angle Presets */}
            <div className="flex items-center gap-1">
              {(Object.keys(CAMERA_PRESETS) as CameraPresetId[]).map((key) => {
                const active = cameraPreset === key;
                return (
                  <button
                    key={key}
                    type="button"
                    onClick={() => setCameraPreset(key)}
                    className={`px-2.5 py-1 text-[11px] font-medium rounded transition-colors whitespace-nowrap shrink-0 ${
                      active
                        ? 'bg-blue-600 text-white'
                        : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                    }`}
                  >
                    {CAMERA_PRESETS[key].label}
                  </button>
                );
              })}
            </div>

            {/* Motion Play / Pause & Reset */}
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => setIsPlaying((prev) => !prev)}
                className="px-2.5 py-1 text-[11px] font-medium bg-slate-800 hover:bg-slate-700 text-white rounded transition-colors inline-flex items-center gap-1 whitespace-nowrap shrink-0"
              >
                {isPlaying ? (
                  <>
                    <Pause className="w-3 h-3" aria-hidden="true" />
                    Pause 3D
                  </>
                ) : (
                  <>
                    <Play className="w-3 h-3" aria-hidden="true" />
                    Play 3D
                  </>
                )}
              </button>

              <button
                type="button"
                aria-label="Reset 3D view"
                onClick={() => {
                  setExplosionPct(55);
                  setCameraPreset('isometric');
                  setIsPlaying(true);
                }}
                className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded transition-colors"
              >
                <RotateCcw className="w-3.5 h-3.5" aria-hidden="true" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

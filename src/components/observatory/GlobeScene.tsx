/**
 * GlobeScene — WebGL Earth for the Observatory Network section.
 *
 * Rendered client-side only, lazily imported by ObservatoryNetworkGlobe.
 * Textures: NASA Visible Earth "Blue Marble" (public domain), downsampled and
 * stored as project CDN assets.
 */
import { useEffect, useRef } from "react";
import * as THREE from "three";
import { groundNodes, spaceNode, type NetworkNode } from "@/data/observatory-network";
import dayTex from "@/assets/globe/earth-day-2k.jpg.asset.json";
import nightTex from "@/assets/globe/earth-night-1k.jpg.asset.json";

const EARTH_R = 1;
const ORBIT_A = 2.625;
const ORBIT_E = 0.4857; // perigee ≈ 1.35 R⊕, apogee ≈ 3.9 R⊕ — illustrative, not to scale
const ORBIT_B = ORBIT_A * Math.sqrt(1 - ORBIT_E * ORBIT_E);
const ORBIT_PERIOD = 45; // seconds per visual orbit (time-compressed)
const SPIN_PERIOD = 240; // seconds per full Earth rotation

function latLonToVec3(lat: number, lon: number, r: number) {
  const phi = (90 - lat) * (Math.PI / 180);
  const theta = (lon + 180) * (Math.PI / 180);
  return new THREE.Vector3(
    -r * Math.sin(phi) * Math.cos(theta),
    r * Math.cos(phi),
    r * Math.sin(phi) * Math.sin(theta),
  );
}

/** Earth spin offset that puts the given longitude in front of the camera (+Z). */
function facingRotation(lon: number) {
  const v = latLonToVec3(0, lon, 1);
  return -Math.atan2(v.x, v.z);
}

function orbitPoint(E: number) {
  return new THREE.Vector3(ORBIT_A * (Math.cos(E) - ORBIT_E), 0, ORBIT_B * Math.sin(E));
}

function solveKepler(M: number) {
  let E = M;
  for (let i = 0; i < 6; i++) {
    E = E - (E - ORBIT_E * Math.sin(E) - M) / (1 - ORBIT_E * Math.cos(E));
  }
  return E;
}

export type GlobeSceneProps = {
  selectedId: string | null;
  onSelect: (id: string | null) => void;
  onReady: () => void;
  onError: () => void;
  reducedMotion: boolean;
  active: boolean;
};

export default function GlobeScene({
  selectedId,
  onSelect,
  onReady,
  onError,
  reducedMotion,
  active,
}: GlobeSceneProps) {
  const hostRef = useRef<HTMLDivElement>(null);
  const labelRef = useRef<HTMLDivElement>(null);
  const selectedRef = useRef<string | null>(selectedId);
  const activeRef = useRef(active);
  const onSelectRef = useRef(onSelect);

  selectedRef.current = selectedId;
  activeRef.current = active;
  onSelectRef.current = onSelect;

  useEffect(() => {
    const host = hostRef.current;
    const labelHost = labelRef.current;
    if (!host || !labelHost) return;

    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: "low-power" });
    } catch {
      onError();
      return;
    }
    if (!renderer.getContext()) {
      onError();
      return;
    }

    let disposed = false;
    const disposables: Array<{ dispose: () => void }> = [];
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, maxPixelRatio));
    renderer.setSize(host.clientWidth, host.clientHeight, false);
    renderer.domElement.style.width = "100%";
    renderer.domElement.style.height = "100%";
    renderer.domElement.style.display = "block";
    renderer.domElement.style.touchAction = "pan-y";
    renderer.domElement.setAttribute("aria-hidden", "true");
    host.appendChild(renderer.domElement);

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(38, 1, 0.1, 100);

    /* ---------------- camera orbit state ---------------- */
    let camDist = 5.4;
    let camAz = 0;
    let camPol = Math.PI / 2 - 0.28; // modest northern tilt
    const MIN_D = 3.2;
    const MAX_D = 8.5;

    function applyCamera() {
      camera.position.set(
        camDist * Math.sin(camPol) * Math.sin(camAz),
        camDist * Math.cos(camPol),
        camDist * Math.sin(camPol) * Math.cos(camAz),
      );
      camera.lookAt(0, 0, 0);
    }
    applyCamera();

    /* ---------------- stars ---------------- */
    let seed = 20260729;
    const rnd = () => {
      seed = (seed * 1664525 + 1013904223) % 4294967296;
      return seed / 4294967296;
    };
    const starCount = host.clientWidth < 640 ? 600 : 1100;
    const starPos = new Float32Array(starCount * 3);
    const starCol = new Float32Array(starCount * 3);
    for (let i = 0; i < starCount; i++) {
      const u = rnd() * 2 - 1;
      const t = rnd() * Math.PI * 2;
      const s = Math.sqrt(1 - u * u);
      const r = 40 + rnd() * 20;
      starPos.set([r * s * Math.cos(t), r * u, r * s * Math.sin(t)], i * 3);
      const b = 0.35 + rnd() * 0.65;
      starCol.set([b, b, b * (0.92 + rnd() * 0.08)], i * 3);
    }
    const starGeo = new THREE.BufferGeometry();
    starGeo.setAttribute("position", new THREE.BufferAttribute(starPos, 3));
    starGeo.setAttribute("color", new THREE.BufferAttribute(starCol, 3));
    const starMat = new THREE.PointsMaterial({ size: 0.22, sizeAttenuation: true, vertexColors: true, transparent: true, opacity: 0.85 });
    scene.add(new THREE.Points(starGeo, starMat));
    disposables.push(starGeo, starMat);

    /* ---------------- earth ---------------- */
    const sunDir = new THREE.Vector3(0.35, 0.3, 1.0).normalize();
    const earthGroup = new THREE.Group();
    earthGroup.rotation.y = facingRotation(78);
    scene.add(earthGroup);

    const loader = new THREE.TextureLoader();
    const earthGeo = new THREE.SphereGeometry(EARTH_R, 64, 48);
    const earthUniforms = {
      dayMap: { value: null as THREE.Texture | null },
      nightMap: { value: null as THREE.Texture | null },
      sunDir: { value: sunDir.clone() },
      reveal: { value: 0 },
    };
    const earthMat = new THREE.ShaderMaterial({
      uniforms: earthUniforms,
      transparent: true,
      vertexShader: `
        varying vec2 vUv; varying vec3 vN;
        void main(){ vUv=uv; vN=normalize(mat3(modelMatrix)*normal);
          gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0); }`,
      fragmentShader: `
        uniform sampler2D dayMap; uniform sampler2D nightMap;
        uniform vec3 sunDir; uniform float reveal;
        varying vec2 vUv; varying vec3 vN;
        void main(){
          vec3 day = texture2D(dayMap, vUv).rgb;
          vec3 night = texture2D(nightMap, vUv).rgb;
          float d = dot(normalize(vN), normalize(sunDir));
          float lit = smoothstep(-0.18, 0.22, d);
          vec3 col = mix(night*0.6 + day*0.12, day*(0.75+0.7*max(d,0.0)), lit);
          gl_FragColor = vec4(col, reveal);
        }`,
    });
    const earth = new THREE.Mesh(earthGeo, earthMat);
    earthGroup.add(earth);
    disposables.push(earthGeo, earthMat);

    let texLoaded = 0;
    const finishTex = () => {
      texLoaded++;
      if (texLoaded === 2 && !disposed) onReady();
    };
    const loadTex = (url: string, key: "dayMap" | "nightMap") => {
      loader.load(
        url,
        (t) => {
          if (disposed) {
            t.dispose();
            return;
          }
          t.colorSpace = THREE.SRGBColorSpace;
          t.anisotropy = Math.min(4, renderer.capabilities.getMaxAnisotropy());
          earthUniforms[key].value = t;
          disposables.push(t);
          finishTex();
        },
        undefined,
        () => {
          if (disposed) return;
          // Missing texture must not blank the scene — fall back to a flat marble.
          const c = document.createElement("canvas");
          c.width = c.height = 4;
          const ctx = c.getContext("2d");
          if (ctx) {
            ctx.fillStyle = key === "dayMap" ? "#1b3a5c" : "#000010";
            ctx.fillRect(0, 0, 4, 4);
          }
          const t = new THREE.CanvasTexture(c);
          earthUniforms[key].value = t;
          disposables.push(t);
          finishTex();
        },
      );
    };
    loadTex(dayTex.url, "dayMap");
    loadTex(nightTex.url, "nightMap");

    // Atmospheric rim
    const atmGeo = new THREE.SphereGeometry(EARTH_R * 1.035, 48, 32);
    const atmMat = new THREE.ShaderMaterial({
      transparent: true,
      side: THREE.BackSide,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      uniforms: { reveal: { value: 0 } },
      vertexShader: `varying vec3 vN; varying vec3 vP;
        void main(){ vN=normalize(mat3(modelMatrix)*normal);
          vec4 wp=modelMatrix*vec4(position,1.0); vP=wp.xyz;
          gl_Position=projectionMatrix*viewMatrix*wp; }`,
      fragmentShader: `varying vec3 vN; varying vec3 vP; uniform float reveal;
        void main(){
          vec3 v=normalize(cameraPosition-vP);
          float f=pow(1.0-abs(dot(v,normalize(vN))),3.0);
          gl_FragColor=vec4(vec3(0.32,0.55,0.95)*f*1.25, f*reveal);
        }`,
    });
    scene.add(new THREE.Mesh(atmGeo, atmMat));
    disposables.push(atmGeo, atmMat);

    /* ---------------- ground markers ---------------- */
    type MarkerRec = { node: NetworkNode; group: THREE.Group; core: THREE.Mesh; halo: THREE.Mesh };
    const markers: MarkerRec[] = [];
    const coreGeo = new THREE.SphereGeometry(0.022, 16, 12);
    const haloGeo = new THREE.RingGeometry(0.035, 0.055, 24);
    const beaconGeo = new THREE.CylinderGeometry(0.0035, 0.0035, 0.11, 6);
    disposables.push(coreGeo, haloGeo, beaconGeo);

    groundNodes.forEach((node) => {
      const pos = latLonToVec3(node.lat!, node.lon!, EARTH_R);
      const g = new THREE.Group();
      g.position.copy(pos);
      g.lookAt(pos.clone().multiplyScalar(2));
      const col = new THREE.Color(node.color);

      const coreMat = new THREE.MeshBasicMaterial({ color: col, transparent: true, opacity: 0 });
      const core = new THREE.Mesh(coreGeo, coreMat);
      core.position.z = 0.03;
      g.add(core);

      const haloMat = new THREE.MeshBasicMaterial({
        color: col,
        transparent: true,
        opacity: 0,
        side: THREE.DoubleSide,
        depthWrite: false,
      });
      const halo = new THREE.Mesh(haloGeo, haloMat);
      halo.position.z = 0.004;
      g.add(halo);

      const beaconMat = new THREE.MeshBasicMaterial({ color: col, transparent: true, opacity: 0 });
      const beacon = new THREE.Mesh(beaconGeo, beaconMat);
      beacon.rotation.x = Math.PI / 2;
      beacon.position.z = 0.055;
      g.add(beacon);

      disposables.push(coreMat, haloMat, beaconMat);
      earthGroup.add(g);
      markers.push({ node, group: g, core, halo });
    });

    /* ---------------- TESS orbit + spacecraft ---------------- */
    const orbitGroup = new THREE.Group();
    orbitGroup.rotation.set(0.42, 0.55, 0.22);
    scene.add(orbitGroup);

    const pathPts: THREE.Vector3[] = [];
    for (let i = 0; i <= 240; i++) pathPts.push(orbitPoint((i / 240) * Math.PI * 2));
    const pathGeo = new THREE.BufferGeometry().setFromPoints(pathPts);
    const pathMat = new THREE.LineBasicMaterial({
      color: new THREE.Color(spaceNode.color),
      transparent: true,
      opacity: 0,
      depthWrite: false,
    });
    orbitGroup.add(new THREE.Line(pathGeo, pathMat));
    disposables.push(pathGeo, pathMat);

    const sat = new THREE.Group();
    const satBodyGeo = new THREE.BoxGeometry(0.075, 0.075, 0.1);
    const satBodyMat = new THREE.MeshBasicMaterial({ color: 0xd8d8e4, transparent: true, opacity: 0 });
    sat.add(new THREE.Mesh(satBodyGeo, satBodyMat));
    const panelGeo = new THREE.BoxGeometry(0.16, 0.006, 0.07);
    const panelMat = new THREE.MeshBasicMaterial({ color: 0x3f5fa8, transparent: true, opacity: 0 });
    [-0.12, 0.12].forEach((x) => {
      const p = new THREE.Mesh(panelGeo, panelMat);
      p.position.x = x;
      sat.add(p);
    });
    const glowGeo = new THREE.SphereGeometry(0.1, 12, 10);
    const glowMat = new THREE.MeshBasicMaterial({
      color: new THREE.Color(spaceNode.color),
      transparent: true,
      opacity: 0,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    });
    const satGlow = new THREE.Mesh(glowGeo, glowMat);
    sat.add(satGlow);
    orbitGroup.add(sat);
    disposables.push(satBodyGeo, satBodyMat, panelGeo, panelMat, glowGeo, glowMat);

    /* ---------------- labels (DOM overlay) ---------------- */
    const labelEls = new Map<string, HTMLSpanElement>();
    [...groundNodes, spaceNode].forEach((n) => {
      const el = document.createElement("span");
      el.textContent = n.shortName;
      el.className =
        "pointer-events-none absolute left-0 top-0 whitespace-nowrap rounded-md border px-1.5 py-0.5 text-[10px] font-medium tracking-wide backdrop-blur-sm transition-opacity duration-300";
      el.style.borderColor = `${n.color}55`;
      el.style.background = "oklch(0.12 0.03 265 / 0.72)";
      el.style.color = n.color;
      el.style.opacity = "0";
      el.setAttribute("aria-hidden", "true");
      labelHost.appendChild(el);
      labelEls.set(n.id, el);
    });

    /* ---------------- interaction ---------------- */
    const raycaster = new THREE.Raycaster();
    raycaster.params.Points = { threshold: 0.1 };
    const ptr = new THREE.Vector2();
    let hoverId: string | null = null;
    let dragging = false;
    let didDrag = false;
    let lastInteraction = -Infinity;
    const pointers = new Map<number, { x: number; y: number }>();
    let pinchStart = 0;
    let pinchDist = 0;

    const el = renderer.domElement;

    function pick(cx: number, cy: number) {
      const r = el.getBoundingClientRect();
      ptr.set(((cx - r.left) / r.width) * 2 - 1, -((cy - r.top) / r.height) * 2 + 1);
      raycaster.setFromCamera(ptr, camera);
      const targets: Array<{ id: string; obj: THREE.Object3D }> = markers.map((m) => ({ id: m.node.id, obj: m.core }));
      targets.push({ id: spaceNode.id, obj: satGlow });
      let best: { id: string; d: number } | null = null;
      for (const t of targets) {
        const hits = raycaster.intersectObject(t.obj, true);
        if (hits.length && (!best || hits[0].distance < best.d)) best = { id: t.id, d: hits[0].distance };
      }
      // Screen-space fallback so small markers stay easy to hit (HCT/DOT are close).
      if (!best) {
        const r2 = el.getBoundingClientRect();
        let bestPx: { id: string; d: number } | null = null;
        for (const t of [...markers.map((m) => ({ id: m.node.id, obj: m.core })), { id: spaceNode.id, obj: satGlow }]) {
          const p = t.obj.getWorldPosition(new THREE.Vector3());
          const occluded = t.id !== spaceNode.id && p.clone().sub(camera.position).normalize().dot(p.clone().normalize()) > 0;
          if (occluded) continue;
          p.project(camera);
          const sx = ((p.x + 1) / 2) * r2.width;
          const sy = ((1 - p.y) / 2) * r2.height;
          const d = Math.hypot(sx - (cx - r2.left), sy - (cy - r2.top));
          if (d < 22 && (!bestPx || d < bestPx.d)) bestPx = { id: t.id, d };
        }
        if (bestPx) return bestPx.id;
      }
      return best?.id ?? null;
    }

    const onPointerDown = (e: PointerEvent) => {
      pointers.set(e.pointerId, { x: e.clientX, y: e.clientY });
      if (pointers.size === 2) {
        const [a, b] = [...pointers.values()];
        pinchDist = Math.hypot(a.x - b.x, a.y - b.y);
        pinchStart = camDist;
      }
      dragging = true;
      didDrag = false;
      lastInteraction = performance.now();
      el.setPointerCapture?.(e.pointerId);
    };

    const onPointerMove = (e: PointerEvent) => {
      const prev = pointers.get(e.pointerId);
      if (prev && pointers.size === 2) {
        pointers.set(e.pointerId, { x: e.clientX, y: e.clientY });
        const [a, b] = [...pointers.values()];
        const d = Math.hypot(a.x - b.x, a.y - b.y);
        if (pinchDist > 0) camDist = THREE.MathUtils.clamp(pinchStart * (pinchDist / d), MIN_D, MAX_D);
        lastInteraction = performance.now();
        didDrag = true;
        return;
      }
      if (dragging && prev) {
        const dx = e.clientX - prev.x;
        const dy = e.clientY - prev.y;
        if (Math.abs(dx) + Math.abs(dy) > 3) didDrag = true;
        camAz -= dx * 0.005;
        camPol = THREE.MathUtils.clamp(camPol - dy * 0.005, 0.55, Math.PI - 0.55);
        pointers.set(e.pointerId, { x: e.clientX, y: e.clientY });
        lastInteraction = performance.now();
        return;
      }
      if (e.pointerType === "mouse") {
        const id = pick(e.clientX, e.clientY);
        hoverId = id;
        el.style.cursor = id ? "pointer" : "grab";
      }
    };

    const endPointer = (e: PointerEvent) => {
      const wasDrag = didDrag;
      pointers.delete(e.pointerId);
      if (pointers.size < 2) pinchDist = 0;
      if (pointers.size === 0) dragging = false;
      lastInteraction = performance.now();
      if (!wasDrag && e.type === "pointerup") {
        const id = pick(e.clientX, e.clientY);
        onSelectRef.current(id && id === selectedRef.current ? null : id);
      }
    };

    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      camDist = THREE.MathUtils.clamp(camDist * (1 + Math.sign(e.deltaY) * 0.08), MIN_D, MAX_D);
      lastInteraction = performance.now();
    };

    el.addEventListener("pointerdown", onPointerDown);
    el.addEventListener("pointermove", onPointerMove);
    el.addEventListener("pointerup", endPointer);
    el.addEventListener("pointercancel", endPointer);
    el.addEventListener("pointerleave", endPointer);
    el.addEventListener("wheel", onWheel, { passive: false });
    el.style.cursor = "grab";

    /* ---------------- resize ---------------- */
    const resize = () => {
      const w = host.clientWidth;
      const h = host.clientHeight;
      if (!w || !h) return;
      renderer.setSize(w, h, false);
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
    };
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(host);

    /* ---------------- animation loop ---------------- */
    let lastT = performance.now();
    let raf = 0;
    let reveal = 0;
    let orbitT = reducedMotion ? 0.18 : 0;
    let spin = 0;
    const tmp = new THREE.Vector3();

    const tick = () => {
      raf = requestAnimationFrame(tick);
      const now = performance.now();
      const dt = Math.min((now - lastT) / 1000, 0.05);
      lastT = now;
      if (!activeRef.current || document.hidden) return;

      reveal = Math.min(1, reveal + dt * 0.7);
      earthUniforms.reveal.value = reveal;
      atmMat.uniforms.reveal.value = reveal;

      // Slow auto-rotation, paused while the user interacts.
      const idle = performance.now() - lastInteraction > 3500;
      if (!reducedMotion && idle && reveal > 0.6) spin += (dt / SPIN_PERIOD) * Math.PI * 2;
      earthGroup.rotation.y = facingRotation(78) + spin;

      // Markers: staged reveal + gentle pulse
      const pulse = reducedMotion ? 0.5 : (Math.sin(performance.now() / 1400) + 1) / 2;
      markers.forEach((m, i) => {
        const local = THREE.MathUtils.clamp((reveal - 0.35 - i * 0.08) / 0.3, 0, 1);
        const sel = selectedRef.current === m.node.id;
        const hov = hoverId === m.node.id;
        const emph = sel ? 1 : hov ? 0.8 : 0.55;
        (m.core.material as THREE.MeshBasicMaterial).opacity = local * (0.75 + emph * 0.25);
        (m.halo.material as THREE.MeshBasicMaterial).opacity = local * (0.18 + pulse * 0.18 + (sel ? 0.28 : 0));
        m.halo.scale.setScalar(1 + pulse * 0.28 + (sel ? 0.35 : 0));
        m.core.scale.setScalar(sel ? 1.45 : hov ? 1.25 : 1);
        const beacon = m.group.children[2] as THREE.Mesh;
        (beacon.material as THREE.MeshBasicMaterial).opacity = local * (sel ? 0.55 : 0.22);
      });

      // Orbit + spacecraft
      const orbitReveal = THREE.MathUtils.clamp((reveal - 0.7) / 0.3, 0, 1);
      pathMat.opacity = orbitReveal * 0.4;
      if (!reducedMotion) orbitT = (orbitT + dt / ORBIT_PERIOD) % 1;
      const E = solveKepler(orbitT * Math.PI * 2);
      sat.position.copy(orbitPoint(E));
      sat.lookAt(0, 0, 0);
      const satSel = selectedRef.current === spaceNode.id;
      const satHov = hoverId === spaceNode.id;
      satBodyMat.opacity = orbitReveal;
      panelMat.opacity = orbitReveal;
      glowMat.opacity = orbitReveal * (satSel ? 0.34 : satHov ? 0.24 : 0.12);
      satGlow.scale.setScalar(satSel ? 1.3 : 1);

      // Labels
      const rect = el.getBoundingClientRect();
      const labelTargets: Array<{ id: string; obj: THREE.Object3D; ground: boolean }> = markers.map((m) => ({
        id: m.node.id,
        obj: m.core,
        ground: true,
      }));
      labelTargets.push({ id: spaceNode.id, obj: sat, ground: false });
      const compact = rect.width < 560;
      labelTargets.forEach((t) => {
        const lab = labelEls.get(t.id);
        if (!lab) return;
        t.obj.getWorldPosition(tmp);
        const world = tmp.clone();
        const facing = t.ground
          ? world.clone().normalize().dot(camera.position.clone().sub(world).normalize()) > 0.05
          : true;
        tmp.project(camera);
        const sx = ((tmp.x + 1) / 2) * rect.width;
        const sy = ((1 - tmp.y) / 2) * rect.height;
        lab.style.transform = `translate3d(${Math.round(sx + 10)}px, ${Math.round(sy - 10)}px, 0)`;
        const sel = selectedRef.current === t.id;
        const hov = hoverId === t.id;
        const show = facing && orbitReveal > 0.2 && (sel || hov || !compact);
        lab.style.opacity = show ? (sel || hov ? "1" : "0.72") : "0";
      });

      renderer.render(scene, camera);
    };
    raf = requestAnimationFrame(tick);

    const onContextLost = (e: Event) => {
      e.preventDefault();
      onError();
    };
    el.addEventListener("webglcontextlost", onContextLost);

    return () => {
      disposed = true;
      cancelAnimationFrame(raf);
      ro.disconnect();
      el.removeEventListener("pointerdown", onPointerDown);
      el.removeEventListener("pointermove", onPointerMove);
      el.removeEventListener("pointerup", endPointer);
      el.removeEventListener("pointercancel", endPointer);
      el.removeEventListener("pointerleave", endPointer);
      el.removeEventListener("wheel", onWheel);
      el.removeEventListener("webglcontextlost", onContextLost);
      labelEls.forEach((n) => n.remove());
      disposables.forEach((d) => d.dispose());
      renderer.dispose();
      if (el.parentNode) el.parentNode.removeChild(el);
    };
    // Scene is built once; live values are read through refs.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [reducedMotion]);

  return (
    <div className="absolute inset-0">
      <div ref={hostRef} className="absolute inset-0" />
      <div ref={labelRef} className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden />
    </div>
  );
}

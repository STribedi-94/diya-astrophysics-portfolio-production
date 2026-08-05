/**
 * GlobeScene — WebGL Earth for the Observatory Network section.
 *
 * Rendered client-side only, lazily imported by ObservatoryNetworkGlobe.
 * Textures: NASA Visible Earth "Blue Marble" (public domain), downsampled and
 * stored as project CDN assets.
 */
import { useEffect, useRef } from "react";
import * as THREE from "three";
import { usePerf } from "@/lib/performance";
import { groundNodes, spaceNode } from "@/data/observatory-network";
import { AstraCameraController } from "./astra/camera-controller";
import {
  createEarthSystem,
  EARTH_RADIUS,
} from "./astra/earth-system";
import {
  createObservatorySystem,
  latLonToVec3,
} from "./astra/observatory-system";
import {
  createTessOrbitSystem,
} from "./astra/tess-orbit-system";
import {
  createAstraSunSystem,
} from "./astra/sun-system";
import {
  ASTRA_OVERVIEW_CAMERA,
} from "./astra/composition";


const SPIN_PERIOD = 240; // seconds per full Earth rotation

/** Earth spin offset that puts the given longitude in front of the camera (+Z). */
function facingRotation(lon: number) {
  const v = latLonToVec3(0, lon, 1);
  return -Math.atan2(v.x, v.z);
}

export type AstraInteractionMode =
  | "earth"
  | "scene";

export type GlobeSceneProps = {
  selectedId: string | null;
  onSelect: (id: string | null) => void;
  onReady: () => void;
  onError: () => void;
  reducedMotion: boolean;
  active: boolean;
  interactionMode: AstraInteractionMode;
  restoreSignal: number;
};

export default function GlobeScene({
  selectedId,
  onSelect,
  onReady,
  onError,
  reducedMotion,
  active,
  interactionMode,
  restoreSignal,
}: GlobeSceneProps) {
  const { maxPixelRatio } = usePerf();
  const hostRef = useRef<HTMLDivElement>(null);
  const labelRef = useRef<HTMLDivElement>(null);
  const selectedRef =
    useRef<string | null>(
      selectedId,
    );

  const activeRef =
    useRef(active);

  const onSelectRef =
    useRef(onSelect);

  const interactionModeRef =
    useRef<AstraInteractionMode>(
      interactionMode,
    );

  const restoreSignalRef =
    useRef(restoreSignal);

  selectedRef.current =
    selectedId;

  activeRef.current =
    active;

  onSelectRef.current =
    onSelect;

  interactionModeRef.current =
    interactionMode;

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

    /* ---------------- Project Diya Astra camera controller ---------------- */
    const cameraController = new AstraCameraController(camera, {
      initialDistance:
        ASTRA_OVERVIEW_CAMERA.distance,
      initialAzimuth:
        ASTRA_OVERVIEW_CAMERA.azimuth,
      initialPolar:
        ASTRA_OVERVIEW_CAMERA.polar,
      minDistance:
        ASTRA_OVERVIEW_CAMERA.minDistance,
      maxDistance:
        ASTRA_OVERVIEW_CAMERA.maxDistance,
    });

    /* ---------------- Project Diya Astra Sun system ---------------- */
    const sunSystem = createAstraSunSystem({
      scene,
      camera,
      reducedMotion,
    });

    disposables.push(sunSystem);

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

    /* ---------------- Project Diya Astra Earth system ---------------- */
    const earthSystem = createEarthSystem({
      scene,
      renderer,
      onReady,
      isDisposed: () => disposed,
    });

    const earthGroup = earthSystem.group;
    const earthUniforms = earthSystem.uniforms;
    const atmMat = earthSystem.atmosphereMaterial;

    /*
     * India-first overview orientation.
     *
     * facingRotation(78) aligns India's approximate longitude
     * with the original positive-Z overview camera. The canonical
     * camera azimuth is added so India remains aligned with the
     * actual opening camera direction.
     */
    const overviewEarthRotation =
      facingRotation(78) +
      ASTRA_OVERVIEW_CAMERA.azimuth;

    earthGroup.rotation.y =
      overviewEarthRotation;

    disposables.push(earthSystem);

    /* ---------------- Project Diya Astra Observatory system ---------------- */
    const observatorySystem = createObservatorySystem({
      earthGroup,
      nodes: groundNodes,
      disposables,
    });

    const markers = observatorySystem.markers;

    /* ---------------- Project Diya Astra TESS orbit system ---------------- */
    const tessSystem = createTessOrbitSystem({
      scene,
      node: spaceNode,
      reducedMotion,
    });

    disposables.push(tessSystem);

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
    const pointers = new Map<number, { x: number; y: number }>();
    let pinchStart = 0;
    let pinchDist = 0;

    const el = renderer.domElement;

    function pick(cx: number, cy: number) {
      const r = el.getBoundingClientRect();
      ptr.set(((cx - r.left) / r.width) * 2 - 1, -((cy - r.top) / r.height) * 2 + 1);
      raycaster.setFromCamera(ptr, camera);
      const targets: Array<{ id: string; obj: THREE.Object3D }> = markers.map((m) => ({ id: m.node.id, obj: m.core }));
      targets.push({ id: spaceNode.id, obj: tessSystem.glow });
      let best: { id: string; d: number } | null = null;
      for (const t of targets) {
        const hits = raycaster.intersectObject(t.obj, true);
        if (hits.length && (!best || hits[0].distance < best.d)) best = { id: t.id, d: hits[0].distance };
      }
      // Screen-space fallback so small markers stay easy to hit (HCT/DOT are close).
      if (!best) {
        const r2 = el.getBoundingClientRect();
        let bestPx: { id: string; d: number } | null = null;
        for (const t of [...markers.map((m) => ({ id: m.node.id, obj: m.core })), { id: spaceNode.id, obj: tessSystem.glow }]) {
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
        pinchStart = cameraController.getDistance();
      }
      dragging = true;
      didDrag = false;
      el.setPointerCapture?.(e.pointerId);
    };

    const onPointerMove = (e: PointerEvent) => {
      const prev = pointers.get(e.pointerId);
      if (prev && pointers.size === 2) {
        pointers.set(e.pointerId, { x: e.clientX, y: e.clientY });
        const [a, b] = [...pointers.values()];
        const d = Math.hypot(a.x - b.x, a.y - b.y);
        if (pinchDist > 0) {
          cameraController.zoomToDistance(
            pinchStart * (pinchDist / d),
          );
        }
        didDrag = true;
        return;
      }
      if (
        dragging &&
        prev
      ) {
        const dx =
          e.clientX -
          prev.x;

        const dy =
          e.clientY -
          prev.y;

        if (
          Math.abs(dx) +
            Math.abs(dy) >
          3
        ) {
          didDrag = true;
        }

        if (
          interactionModeRef.current ===
          "earth"
        ) {
          /*
           * Default interaction: rotate Earth itself.
           * Observatory markers are children of earthGroup,
           * so they remain geographically attached.
           */
          /*
           * Direct-manipulation behaviour:
           * Earth follows the user's hand.
           */
          earthDragRotation +=
            dx * 0.006;
        } else {
          /*
           * Explicit Orbit Scene mode:
           * move the camera around the complete system.
           */
          cameraController.orbit(
            dx,
            dy,
          );
        }

        pointers.set(
          e.pointerId,
          {
            x: e.clientX,
            y: e.clientY,
          },
        );

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
      if (!wasDrag && e.type === "pointerup") {
        const id = pick(e.clientX, e.clientY);
        onSelectRef.current(id && id === selectedRef.current ? null : id);
      }
    };

    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      cameraController.zoomByWheel(e.deltaY);
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
    let spin = 0;

    /*
     * Manual Earth rotation is separate from automatic
     * scientific rotation and from whole-scene camera orbit.
     */
    let earthDragRotation = 0;

    let previousRestoreSignal =
      restoreSignalRef.current;

    const tmp =
      new THREE.Vector3();

    const tick = () => {
      raf = requestAnimationFrame(tick);
      const now = performance.now();
      const dt = Math.min((now - lastT) / 1000, 0.05);
      lastT = now;
      if (!activeRef.current || document.hidden) return;

      sunSystem.update({
        elapsedSeconds:
          now / 1000,
        reducedMotion,
      });

      /*
       * Restore requests originate from the visible React
       * control bar and are consumed once inside the scene.
       */
      if (
        restoreSignal !==
        previousRestoreSignal
      ) {
        previousRestoreSignal =
          restoreSignal;

        restoreSignalRef.current =
          restoreSignal;

        cameraController
          .restoreOverview();

        spin = 0;
        earthDragRotation = 0;
        dragging = false;
        didDrag = false;
        pointers.clear();
      }

      reveal =
        Math.min(
          1,
          reveal +
            dt *
              0.7,
        );
      earthUniforms.reveal.value = reveal;
      atmMat.uniforms.reveal.value = reveal;

      /*
       * Essential scientific Earth motion.
       *
       * Performance or reduced-motion mode slows the rotation
       * but never freezes the astronomical system completely.
       * Rotation pauses only during an active Earth drag.
       */
      /*
       * Motion remains restrained, but must be visibly
       * perceptible within the first few seconds.
       */
      /*
       * The rotation must be recognisable as soon as the
       * scene settles, while remaining calm and suitable
       * for an academic visualisation.
       */
      const essentialMotionScale =
        reducedMotion
          ? 0.9
          : 3.0;

      const earthDragActive =
        dragging &&
        interactionModeRef.current ===
          "earth";

      if (
        !earthDragActive &&
        reveal > 0.6
      ) {
        spin +=
          (dt / SPIN_PERIOD) *
          Math.PI *
          2 *
          essentialMotionScale;
      }

      earthGroup.rotation.y =
        overviewEarthRotation +
        earthDragRotation +
        spin;

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
        (m.beacon.material as THREE.MeshBasicMaterial).opacity =
          local * (sel ? 0.55 : 0.22);
      });

      // TESS orbit + spacecraft
      const orbitReveal = THREE.MathUtils.clamp(
        (reveal - 0.7) / 0.3,
        0,
        1,
      );

      tessSystem.update({
        deltaSeconds: dt,
        reveal,
        reducedMotion,
        selected: selectedRef.current === spaceNode.id,
        hovered: hoverId === spaceNode.id,
      });

      // Labels
      const rect = el.getBoundingClientRect();
      const labelTargets: Array<{ id: string; obj: THREE.Object3D; ground: boolean }> = markers.map((m) => ({
        id: m.node.id,
        obj: m.core,
        ground: true,
      }));
      labelTargets.push({ id: spaceNode.id, obj: tessSystem.spacecraft, ground: false });
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
  }, [
    reducedMotion,
    restoreSignal,
  ]);

  return (
    <div className="absolute inset-0">
      <div ref={hostRef} className="absolute inset-0" />
      <div ref={labelRef} className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden />
    </div>
  );
}

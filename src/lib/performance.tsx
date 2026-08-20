/**
 * Adaptive visual-performance governance.
 *
 * One shared authority decides how much cinematic work the site performs.
 * Components never make independent performance decisions — they read the
 * resolved mode from `usePerf()` (or CSS reads `html[data-perf]`).
 *
 * Modes:
 *   cinematic       — full premium effects (capable device, no restrictions)
 *   balanced        — default first paint; full identity, trimmed hidden work
 *   performance     — same layout/content, lightweight rendering
 *   reduced-motion  — no decorative motion, static premium composition
 *
 * The automatic mode starts conservative ("balanced"), then upgrades to
 * "cinematic" only after real runtime responsiveness is measured.
 */
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";

export type PerfPreference = "auto" | "cinematic" | "performance" | "reduced-motion";
export type PerfMode = "cinematic" | "balanced" | "performance" | "reduced-motion";

export const PERF_STORAGE_KEY = "dr-visual-performance";

/** Inline pre-paint script: applies the stored preference before first paint. */
export const PERF_PREPAINT = `(function(){try{var p=localStorage.getItem("${PERF_STORAGE_KEY}")||"auto";var rm=window.matchMedia&&window.matchMedia("(prefers-reduced-motion: reduce)").matches;var m=rm?"reduced-motion":(p==="auto"?"balanced":p);document.documentElement.setAttribute("data-perf",m);}catch(e){document.documentElement.setAttribute("data-perf","balanced")}})();`;

type PerfContextValue = {
  /** Resolved operating mode. */
  mode: PerfMode;
  /** The visitor's stored choice. */
  preference: PerfPreference;
  setPreference: (p: PerfPreference) => void;
  /** Decorative/continuous motion is allowed. */
  allowMotion: boolean;
  /** Expensive layered effects (extra nebulae, heavy blur, particles). */
  allowHeavyEffects: boolean;
  /** WebGL scenes may initialise. */
  allowWebGL: boolean;
  /** Renderer pixel-ratio cap. */
  maxPixelRatio: number;
};

const fallback: PerfContextValue = {
  mode: "balanced",
  preference: "auto",
  setPreference: () => {},
  allowMotion: true,
  allowHeavyEffects: false,
  allowWebGL: true,
  maxPixelRatio: 1.5,
};

const PerfContext = createContext<PerfContextValue>(fallback);

function readPreference(): PerfPreference {
  try {
    const v = localStorage.getItem(PERF_STORAGE_KEY);
    if (v === "auto" || v === "cinematic" || v === "performance" || v === "reduced-motion") return v;
  } catch {
    /* storage unavailable — stay on auto */
  }
  return "auto";
}

/** Conservative capability probe using only optionally-present browser signals. */
function probeCapability(): "weak" | "unknown" | "capable" {
  if (typeof window === "undefined") return "unknown";
  const nav = navigator as Navigator & {
    deviceMemory?: number;
    connection?: { saveData?: boolean; effectiveType?: string };
  };

  if (nav.connection?.saveData) return "weak";
  const eff = nav.connection?.effectiveType;
  if (eff === "slow-2g" || eff === "2g" || eff === "3g") return "weak";
  if (typeof nav.deviceMemory === "number" && nav.deviceMemory > 0 && nav.deviceMemory <= 2) return "weak";
  if (typeof nav.hardwareConcurrency === "number" && nav.hardwareConcurrency > 0 && nav.hardwareConcurrency <= 2)
    return "weak";

  const cores = nav.hardwareConcurrency;
  const mem = nav.deviceMemory;
  if ((typeof cores === "number" && cores >= 6) || (typeof mem === "number" && mem >= 8)) return "capable";
  return "unknown";
}

/**
 * Estimate browser rendering pressure independently from raw hardware power.
 *
 * High-DPI panels and Windows display scaling can make a relatively small
 * CSS viewport expensive to rasterise even on otherwise capable hardware.
 * This signal limits automatic visual upgrades without classifying the
 * computer itself as weak.
 */
function probeRenderPressure(): "normal" | "elevated" | "high" {
  if (typeof window === "undefined") return "normal";

  const width = Math.max(window.innerWidth || 0, 1);
  const height = Math.max(window.innerHeight || 0, 1);
  const dpr = Math.max(window.devicePixelRatio || 1, 1);

  const cssPixels = width * height;
  const physicalPixels = cssPixels * dpr * dpr;

  const shortViewport = height <= 820;
  const compactViewport = width <= 1440;

  if (
    physicalPixels >= 5_000_000 ||
    (dpr >= 1.75 && shortViewport && compactViewport)
  ) {
    return "high";
  }

  if (
    physicalPixels >= 3_000_000 ||
    (dpr >= 1.5 && (shortViewport || compactViewport))
  ) {
    return "elevated";
  }

  return "normal";
}

function detectWebGL(): boolean {
  if (typeof document === "undefined") return true;
  try {
    const canvas = document.createElement("canvas");
    return Boolean(
      canvas.getContext("webgl2") ||
        canvas.getContext("webgl") ||
        canvas.getContext("experimental-webgl"),
    );
  } catch {
    return false;
  }
}

export function PerformanceProvider({ children }: { children: ReactNode }) {
  const [preference, setPreferenceState] = useState<PerfPreference>("auto");
  const [reducedMotion, setReducedMotion] = useState(false);
  // Auto mode starts conservative and is upgraded only after measurement.
  const [autoMode, setAutoMode] = useState<Exclude<PerfMode, "reduced-motion">>("balanced");
  const [webgl, setWebgl] = useState(true);
  const upgraded = useRef(false);

  /* ---- stored preference + reduced-motion tracking ---- */
  useEffect(() => {
    setPreferenceState(readPreference());
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const sync = () => setReducedMotion(mq.matches);
    sync();
    mq.addEventListener("change", sync);
    return () => mq.removeEventListener("change", sync);
  }, []);

  /* ---- capability probe + real responsiveness sampling ---- */
  useEffect(() => {
    setWebgl(detectWebGL());
    const capability = probeCapability();
    const renderPressure = probeRenderPressure();
    if (capability === "weak" || renderPressure === "high") {
      setAutoMode("performance");
      return;
    }

    let raf = 0;
    let frames = 0;
    let start = 0;
    const sample = (t: number) => {
      if (!start) start = t;
      frames += 1;
      if (t - start < 900) {
        raf = requestAnimationFrame(sample);
        return;
      }
      const fps = (frames * 1000) / (t - start);
      upgraded.current = true;
      if (fps < 34) setAutoMode("performance");
      else if (
        fps >= 50 &&
        capability !== "unknown" &&
        renderPressure === "normal"
      )
        setAutoMode("cinematic");
      else setAutoMode("balanced");
    };

    const startSampling = () => {
      raf = requestAnimationFrame(sample);
    };
    const idle = (
      window as Window & { requestIdleCallback?: (cb: () => void, o?: { timeout: number }) => number }
    ).requestIdleCallback;
    const timer = idle ? idle(startSampling, { timeout: 2500 }) : window.setTimeout(startSampling, 1200);

    return () => {
      cancelAnimationFrame(raf);
      window.clearTimeout(timer as number);
    };
  }, []);

  const setPreference = useCallback((p: PerfPreference) => {
    setPreferenceState(p);
    try {
      localStorage.setItem(PERF_STORAGE_KEY, p);
    } catch {
      /* ignore */
    }
  }, []);

  const mode: PerfMode = useMemo(() => {
    if (preference === "reduced-motion" || reducedMotion) return "reduced-motion";
    if (preference === "cinematic") return "cinematic";
    if (preference === "performance") return "performance";
    return autoMode;
  }, [preference, reducedMotion, autoMode]);

  useEffect(() => {
    document.documentElement.setAttribute("data-perf", mode);
  }, [mode]);

  const value = useMemo<PerfContextValue>(
    () => ({
      mode,
      preference,
      setPreference,
      allowMotion: mode !== "reduced-motion",
      allowHeavyEffects: mode === "cinematic",
      allowWebGL: webgl && mode !== "reduced-motion",
      maxPixelRatio: mode === "cinematic" ? 1.75 : mode === "balanced" ? 1.4 : 1,
    }),
    [mode, preference, setPreference, webgl],
  );

  return <PerfContext.Provider value={value}>{children}</PerfContext.Provider>;
}

export function usePerf() {
  return useContext(PerfContext);
}

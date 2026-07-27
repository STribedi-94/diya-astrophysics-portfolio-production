import { useEffect, useState } from "react";

/**
 * Mission Synchronisation — cinematic entry sequence for the Research Chronicle.
 * Client-only, shown once per browser session, and skipped entirely for
 * visitors who prefer reduced motion.
 */
const STEPS = [
  "Establishing uplink to the research archive",
  "Synchronising mission log · 2016 – 2026",
  "Verifying publication and conference records",
  "Chronicle ready",
];

export function MissionSync({ recordCount }: { recordCount: number }) {
  const [visible, setVisible] = useState(false);
  const [step, setStep] = useState(0);

  useEffect(() => {
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const seen = window.sessionStorage.getItem("chronicle-sync") === "done";
    if (reduced || seen) return;

    setVisible(true);
    const timers: Array<ReturnType<typeof setTimeout>> = [];
    STEPS.forEach((_, i) => {
      timers.push(setTimeout(() => setStep(i), i * 620));
    });
    timers.push(
      setTimeout(() => {
        window.sessionStorage.setItem("chronicle-sync", "done");
        setVisible(false);
      }, STEPS.length * 620 + 500),
    );
    return () => timers.forEach(clearTimeout);
  }, []);

  if (!visible) return null;

  const progress = Math.round(((step + 1) / STEPS.length) * 100);

  return (
    <div
      role="status"
      aria-live="polite"
      className="fixed inset-0 z-[60] flex items-center justify-center bg-background/95 backdrop-blur-md anim-fade-in"
    >
      <div className="absolute inset-0 starfield opacity-60" aria-hidden />
      <div className="relative w-full max-w-md px-6 text-center">
        <div className="mx-auto mb-6 h-16 w-16">
          <svg viewBox="0 0 64 64" className="h-16 w-16" aria-hidden>
            <circle cx="32" cy="32" r="26" fill="none" stroke="currentColor" strokeOpacity="0.15" strokeWidth="1" />
            <circle
              cx="32"
              cy="32"
              r="26"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              className="text-primary anim-rotate-slow"
              strokeDasharray="40 120"
              strokeLinecap="round"
            />
            <circle cx="32" cy="32" r="4" className="fill-primary anim-pulse-slow" />
          </svg>
        </div>
        <p className="font-mono text-[10px] uppercase tracking-[0.32em] text-primary/80">
          Research Chronicle
        </p>
        <p className="mt-3 text-sm text-muted-foreground">{STEPS[step]}</p>
        <div className="mt-5 h-px w-full overflow-hidden bg-white/10">
          <div
            className="h-px bg-primary transition-all duration-500"
            style={{ width: `${progress}%` }}
          />
        </div>
        <p className="mt-3 font-mono text-[10px] uppercase tracking-[0.24em] text-muted-foreground">
          {recordCount} verified records · {progress}%
        </p>
        <button
          type="button"
          onClick={() => {
            window.sessionStorage.setItem("chronicle-sync", "done");
            setVisible(false);
          }}
          className="mt-6 rounded-full border border-white/10 px-4 py-1.5 text-[10px] uppercase tracking-[0.24em] text-muted-foreground hover:bg-white/5"
        >
          Skip intro
        </button>
      </div>
    </div>
  );
}

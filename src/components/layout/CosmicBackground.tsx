/**
 * Cosmic Background — global cinematic backdrop.
 * Layers: deep gradient, drifting starfield, faint grid, nebula blooms, vignette.
 * Fixed to viewport so it persists across route transitions.
 *
 * The layer count is governed centrally by the adaptive performance mode:
 * the identity (deep gradient, stars, grid, nebular colour, vignette) is
 * identical in every mode — only the number of expensive blurred blooms and
 * their animation changes.
 */
import { usePerf } from "@/lib/performance";

export function CosmicBackground() {
  const { mode, allowHeavyEffects } = usePerf();
  const light = mode === "performance" || mode === "reduced-motion";
  const pulse = mode === "cinematic" || mode === "balanced" ? "anim-pulse-slow" : "";

  return (
    <div
      aria-hidden
      className="pointer-events-none fixed inset-0 -z-10 overflow-hidden"
    >
      {/* Base deep-space gradient */}
      <div className="absolute inset-0 bg-grad-hero" />

      {/* Distant starfield (slow drift) */}
      <div className={`absolute inset-0 starfield opacity-70 ${light ? "" : "anim-drift"}`} />

      {/* Closer sparse stars — brighter, twinkle */}
      <div className="absolute inset-0 starfield-sparse opacity-90" />

      {/* Faint cosmic grid */}
      <div className="absolute inset-0 grid-cosmic opacity-25" />

      {/* Nebula blooms */}
      <div
        className={`absolute -left-40 top-1/4 h-[560px] w-[560px] rounded-full opacity-40 blur-3xl ${pulse}`}
        style={{
          background:
            "radial-gradient(circle at 40% 40%, oklch(0.55 0.22 300 / 0.6), transparent 70%)",
        }}
      />
      <div
        className={`absolute -right-40 top-1/2 h-[520px] w-[520px] rounded-full opacity-35 blur-3xl ${pulse}`}
        style={{
          animationDelay: "1.5s",
          background:
            "radial-gradient(circle at 60% 40%, oklch(0.65 0.20 28 / 0.5), transparent 70%)",
        }}
      />
      {allowHeavyEffects && (
        <div
          className="absolute bottom-0 left-1/3 h-[420px] w-[420px] rounded-full opacity-30 blur-3xl anim-pulse-slow"
          style={{
            animationDelay: "3s",
            background:
              "radial-gradient(circle at 50% 50%, oklch(0.70 0.13 195 / 0.5), transparent 70%)",
          }}
        />
      )}

      {/* Edge vignette */}
      <div className="absolute inset-0 vignette" />
    </div>
  );
}

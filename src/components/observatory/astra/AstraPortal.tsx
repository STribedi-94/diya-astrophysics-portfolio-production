import { Link } from "@tanstack/react-router";
import { useId } from "react";

import { cn } from "@/lib/utils";
import {
  ASTRA_NETWORK_HASH,
  ASTRA_ROUTE,
  rememberAstraOrigin,
} from "./astra-connectivity";

type AstraPortalProps = {
  compact?: boolean;
  className?: string;
  onNavigate?: () => void;
};

function AstraPortalMark({
  compact = false,
}: {
  compact?: boolean;
}) {
  const uid = useId().replace(/:/g, "");

  const shellGradient = `${uid}-astra-shell`;
  const coreGradient = `${uid}-astra-core`;
  const goldGradient = `${uid}-astra-gold`;
  const blueGradient = `${uid}-astra-blue`;
  const violetGradient = `${uid}-astra-violet`;
  const starGradient = `${uid}-astra-star`;
  const glowFilter = `${uid}-astra-glow`;

  return (
    <svg
      viewBox="0 0 72 72"
      className={cn(
        "shrink-0 overflow-visible",
        compact
          ? "h-8 w-8"
          : "h-[46px] w-[46px]",
      )}
      aria-hidden
      focusable="false"
    >
      <defs>
        <linearGradient
          id={shellGradient}
          x1="10"
          y1="8"
          x2="62"
          y2="64"
          gradientUnits="userSpaceOnUse"
        >
          <stop offset="0" stopColor="#e8f3ff" />
          <stop offset="0.24" stopColor="#70c3ff" />
          <stop offset="0.48" stopColor="#5474ff" />
          <stop offset="0.72" stopColor="#8453ff" />
          <stop offset="1" stopColor="#d65dff" />
        </linearGradient>

        <radialGradient
          id={coreGradient}
          cx="0"
          cy="0"
          r="1"
          gradientTransform="translate(29 25) rotate(48) scale(31)"
          gradientUnits="userSpaceOnUse"
        >
          <stop offset="0" stopColor="#304c8f" />
          <stop offset="0.34" stopColor="#17295f" />
          <stop offset="0.69" stopColor="#0b1232" />
          <stop offset="1" stopColor="#030611" />
        </radialGradient>

        <linearGradient
          id={goldGradient}
          x1="6"
          y1="16"
          x2="67"
          y2="57"
          gradientUnits="userSpaceOnUse"
        >
          <stop offset="0" stopColor="#fff4b5" />
          <stop offset="0.23" stopColor="#ffd34f" />
          <stop offset="0.5" stopColor="#e09b27" />
          <stop offset="0.75" stopColor="#ffc945" />
          <stop offset="1" stopColor="#fff1a7" />
        </linearGradient>

        <linearGradient
          id={blueGradient}
          x1="5"
          y1="56"
          x2="62"
          y2="15"
          gradientUnits="userSpaceOnUse"
        >
          <stop offset="0" stopColor="#3be2ff" />
          <stop offset="0.47" stopColor="#456fff" />
          <stop offset="1" stopColor="#9ddcff" />
        </linearGradient>

        <linearGradient
          id={violetGradient}
          x1="12"
          y1="12"
          x2="64"
          y2="65"
          gradientUnits="userSpaceOnUse"
        >
          <stop offset="0" stopColor="#dab2ff" />
          <stop offset="0.5" stopColor="#714aff" />
          <stop offset="1" stopColor="#e45cff" />
        </linearGradient>

        <radialGradient
          id={starGradient}
          cx="0"
          cy="0"
          r="1"
          gradientTransform="translate(36 36) scale(18)"
          gradientUnits="userSpaceOnUse"
        >
          <stop offset="0" stopColor="#ffffff" />
          <stop offset="0.26" stopColor="#eef5ff" />
          <stop offset="0.57" stopColor="#7ba0ff" />
          <stop
            offset="1"
            stopColor="#7051ff"
            stopOpacity="0"
          />
        </radialGradient>

        <filter
          id={glowFilter}
          x="-100%"
          y="-100%"
          width="300%"
          height="300%"
        >
          <feGaussianBlur
            stdDeviation="2.5"
            result="blur"
          />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      {/* outer atmospheric halo */}
      <circle
        cx="36"
        cy="36"
        r="25"
        fill="none"
        stroke={`url(#${shellGradient})`}
        strokeWidth="1.2"
        opacity="0.24"
        filter={`url(#${glowFilter})`}
      />

      {/* glass core */}
      <circle
        cx="36"
        cy="36"
        r="20.2"
        fill={`url(#${coreGradient})`}
        stroke="rgba(255,255,255,0.24)"
        strokeWidth="1.15"
      />

      <circle
        cx="36"
        cy="36"
        r="17"
        fill="none"
        stroke={`url(#${shellGradient})`}
        strokeWidth="1.1"
        opacity="0.78"
      />

      {/* specular glass highlight */}
      <path
        d="M24.5 29.5C27.8 22.2 35.4 18.7 43.3 21"
        fill="none"
        stroke="rgba(255,255,255,0.64)"
        strokeWidth="1.25"
        strokeLinecap="round"
      />

      {/* orbital tracks */}
      <ellipse
        cx="36"
        cy="36"
        rx="31"
        ry="16"
        fill="none"
        stroke={`url(#${goldGradient})`}
        strokeWidth="1.65"
        transform="rotate(-28 36 36)"
      />

      <ellipse
        cx="36"
        cy="36"
        rx="30"
        ry="15"
        fill="none"
        stroke={`url(#${blueGradient})`}
        strokeWidth="1.25"
        transform="rotate(27 36 36)"
        opacity="0.92"
      />

      <ellipse
        cx="36"
        cy="36"
        rx="27"
        ry="18"
        fill="none"
        stroke={`url(#${violetGradient})`}
        strokeWidth="1.1"
        transform="rotate(67 36 36)"
        opacity="0.9"
      />

      {/* luminous core */}
      <circle
        cx="36"
        cy="36"
        r="13"
        fill={`url(#${starGradient})`}
        opacity="0.52"
      />

      <path
        d="M36 20.5L39 32.9L51.5 36L39 39.1L36 51.5L33 39.1L20.5 36L33 32.9L36 20.5Z"
        fill="#ffffff"
        filter={`url(#${glowFilter})`}
      />

      <path
        d="M36 25L38.1 33.9L47 36L38.1 38.1L36 47L33.9 38.1L25 36L33.9 33.9L36 25Z"
        fill="#dceaff"
      />

      <circle
        cx="36"
        cy="36"
        r="2"
        fill="#ffffff"
      />

      {/* connection nodes */}
      <circle
        cx="20"
        cy="10"
        r="4.1"
        fill={`url(#${goldGradient})`}
        stroke="#fff2b6"
        strokeWidth="0.7"
      />

      <circle
        cx="5.8"
        cy="40"
        r="4.2"
        fill={`url(#${blueGradient})`}
        stroke="#c7ecff"
        strokeWidth="0.7"
      />

      <circle
        cx="57.5"
        cy="59.5"
        r="4.4"
        fill={`url(#${violetGradient})`}
        stroke="#e5c7ff"
        strokeWidth="0.7"
      />

      {/* node reflections */}
      <circle
        cx="18.8"
        cy="8.6"
        r="1.2"
        fill="#ffffff"
        opacity="0.88"
      />
      <circle
        cx="4.7"
        cy="38.7"
        r="1.1"
        fill="#ffffff"
        opacity="0.78"
      />
      <circle
        cx="56.2"
        cy="58"
        r="1.1"
        fill="#ffffff"
        opacity="0.72"
      />
    </svg>
  );
}

export function AstraPortal({
  compact = false,
  className,
  onNavigate,
}: AstraPortalProps) {
  const handleEntry = () => {
    rememberAstraOrigin();
    onNavigate?.();
  };

  return (
    <Link
      to={ASTRA_ROUTE}
      hash={ASTRA_NETWORK_HASH}
      hashScrollIntoView={{
        behavior: "smooth",
        block: "start",
      }}
      onClick={handleEntry}
      aria-label="Enter Diya Astra — explore the Observatory and TESS research network"
      title="Enter Diya Astra"
      className={cn(
        /*
         * IMPORTANT:
         * No card / badge / black background.
         * Astra floats directly inside the website header.
         */
        "group relative inline-flex shrink-0 items-center",
        "bg-transparent",
        "transition-transform duration-300",
        "hover:-translate-y-0.5",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60 focus-visible:ring-offset-4 focus-visible:ring-offset-transparent",
        "motion-reduce:transform-none motion-reduce:transition-none",
        compact
          ? "gap-2"
          : "gap-2.5",
        className,
      )}
    >
      {/* soft logo aura only — no surrounding box */}
      <span
        className={cn(
          "pointer-events-none absolute rounded-full",
          "bg-[radial-gradient(circle,rgba(82,113,255,0.22)_0%,rgba(115,68,255,0.12)_45%,transparent_72%)]",
          "blur-lg transition-opacity duration-300",
          "group-hover:opacity-100",
          compact
            ? "left-0 top-1/2 h-9 w-9 -translate-y-1/2 opacity-55"
            : "left-0 top-1/2 h-12 w-12 -translate-y-1/2 opacity-65",
        )}
        aria-hidden
      />

      <span
        className="relative z-10 flex items-center justify-center transition-transform duration-500 group-hover:scale-[1.07] group-hover:rotate-[3deg] motion-reduce:transform-none"
      >
        <AstraPortalMark
          compact={compact}
        />
      </span>

      {compact ? (
        <span className="relative z-10 whitespace-nowrap font-display text-[11px] font-semibold tracking-[0.15em] text-foreground">
          ASTRA
        </span>
      ) : (
        <span className="relative z-10 flex flex-col justify-center whitespace-nowrap leading-none">
          <span className="flex items-baseline">
            <span className="font-display text-[12px] font-semibold tracking-[0.07em] text-foreground">
              DIYA
            </span>

            <span className="ml-1.5 bg-gradient-to-r from-[#70caff] via-[#7e82ff] to-[#d16aff] bg-clip-text font-display text-[12px] font-semibold tracking-[0.12em] text-transparent">
              ASTRA
            </span>
          </span>

          <span className="mt-1.5 text-[8px] font-semibold uppercase tracking-[0.22em] text-[#f1ba46] transition-colors duration-300 group-hover:text-[#ffd36f]">
            Enter Astra
          </span>
        </span>
      )}

      {/* subtle energy underline */}
      {!compact && (
        <span
          className="pointer-events-none absolute -bottom-1 left-[50px] right-0 h-px origin-left scale-x-0 bg-gradient-to-r from-[#efb64b]/80 via-[#676fff]/70 to-transparent transition-transform duration-300 group-hover:scale-x-100"
          aria-hidden
        />
      )}
    </Link>
  );
}
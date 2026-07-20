/**
 * FacilityMotif — restrained inline SVG motifs for observational facilities.
 * Uses design-token colours; motion respects prefers-reduced-motion via CSS class.
 */
export function FacilityMotif({
  motif,
  className,
}: {
  motif: "orbit" | "wave" | "dome";
  className?: string;
}) {
  if (motif === "orbit") {
    return (
      <svg viewBox="0 0 120 60" aria-hidden className={className}>
        <ellipse
          cx="60"
          cy="30"
          rx="52"
          ry="18"
          fill="none"
          stroke="currentColor"
          strokeOpacity="0.35"
          strokeWidth="0.8"
        />
        <circle cx="60" cy="30" r="4" fill="currentColor" opacity="0.85" />
        <circle r="1.6" fill="currentColor">
          <animateMotion
            dur="9s"
            repeatCount="indefinite"
            path="M 112 30 A 52 18 0 1 1 111.99 30 Z"
          />
        </circle>
      </svg>
    );
  }
  if (motif === "wave") {
    return (
      <svg viewBox="0 0 120 60" aria-hidden className={className}>
        {[0, 1, 2, 3].map((i) => (
          <circle
            key={i}
            cx="60"
            cy="46"
            r={8 + i * 10}
            fill="none"
            stroke="currentColor"
            strokeOpacity={0.5 - i * 0.1}
            strokeWidth="0.8"
          >
            <animate
              attributeName="r"
              values={`${8 + i * 10};${18 + i * 10};${8 + i * 10}`}
              dur="6s"
              begin={`${i * 0.4}s`}
              repeatCount="indefinite"
            />
            <animate
              attributeName="stroke-opacity"
              values={`${0.5 - i * 0.1};0;${0.5 - i * 0.1}`}
              dur="6s"
              begin={`${i * 0.4}s`}
              repeatCount="indefinite"
            />
          </circle>
        ))}
        <circle cx="60" cy="46" r="2.4" fill="currentColor" />
      </svg>
    );
  }
  // dome
  return (
    <svg viewBox="0 0 120 60" aria-hidden className={className}>
      <path
        d="M 20 48 Q 60 6 100 48"
        fill="none"
        stroke="currentColor"
        strokeOpacity="0.5"
        strokeWidth="0.9"
      />
      <line
        x1="60"
        y1="10"
        x2="60"
        y2="48"
        stroke="currentColor"
        strokeOpacity="0.35"
        strokeWidth="0.6"
        strokeDasharray="2 3"
      />
      <line x1="18" y1="48" x2="102" y2="48" stroke="currentColor" strokeOpacity="0.45" strokeWidth="0.9" />
      <circle cx="60" cy="16" r="1.4" fill="currentColor">
        <animate attributeName="opacity" values="0.4;1;0.4" dur="4s" repeatCount="indefinite" />
      </circle>
    </svg>
  );
}

import { cn } from "@/lib/utils";
import { creator } from "@/data/creator";

type Variant = "cosmic" | "mono" | "dark";

/**
 * Minimalist ST monogram: a subtle orbital arc forms the "S", a precise
 * vertical axis forms the "T", and a small luminous star sits at the
 * orbital intersection. Readable down to ~24px.
 */
export function STLogo({
  size = 32,
  variant = "cosmic",
  className,
  title = creator.a11yLabel,
  decorative = false,
}: {
  size?: number;
  variant?: Variant;
  className?: string;
  title?: string;
  decorative?: boolean;
}) {
  const strokeColor =
    variant === "mono"
      ? "currentColor"
      : variant === "dark"
        ? "oklch(0.22 0.05 265)"
        : "oklch(0.86 0.05 90)"; // stellar-gold-ish

  const accentColor =
    variant === "cosmic" ? "oklch(0.72 0.19 25)" : strokeColor; // mdwarf red

  const ariaProps = decorative
    ? { "aria-hidden": true as const, focusable: false as const }
    : { role: "img" as const, "aria-label": title };

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 64 64"
      xmlns="http://www.w3.org/2000/svg"
      className={cn("shrink-0", className)}
      {...ariaProps}
    >
      {!decorative && <title>{title}</title>}
      {/* Outer orbit ring — restrained, only partial */}
      <circle
        cx="32"
        cy="32"
        r="27"
        fill="none"
        stroke={strokeColor}
        strokeOpacity="0.28"
        strokeWidth="1"
        strokeDasharray="80 40"
      />
      {/* S — formed as an orbital S-curve */}
      <path
        d="M42 20 C 30 16, 20 22, 22 30 C 24 36, 40 36, 42 42 C 44 48, 34 52, 22 48"
        fill="none"
        stroke={strokeColor}
        strokeWidth="3"
        strokeLinecap="round"
      />
      {/* T — precise horizontal crossbar + vertical axis */}
      <path
        d="M26 20 H50 M38 20 V50"
        fill="none"
        stroke={strokeColor}
        strokeWidth="3"
        strokeLinecap="round"
      />
      {/* Luminous point at the orbital intersection */}
      <circle cx="50" cy="20" r="2.4" fill={accentColor}>
        <animate
          attributeName="opacity"
          values="0.85;1;0.85"
          dur="3.6s"
          repeatCount="indefinite"
        />
      </circle>
    </svg>
  );
}

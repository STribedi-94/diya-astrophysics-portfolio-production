import { useEffect, useState } from "react";
import QRCodeLib from "qrcode";
import { cn } from "@/lib/utils";

/**
 * Locally generated QR SVG. High error-correction so the tiny centre
 * ST mark can sit on top without breaking scan reliability.
 */
export function QRCode({
  value,
  size = 176,
  className,
  ariaLabel,
}: {
  value: string;
  size?: number;
  className?: string;
  ariaLabel?: string;
}) {
  const [svg, setSvg] = useState<string>("");

  useEffect(() => {
    let cancelled = false;
    QRCodeLib.toString(value, {
      type: "svg",
      errorCorrectionLevel: "H",
      margin: 2,
      color: { dark: "#0b0f24", light: "#ffffff" },
    })
      .then((s) => {
        if (!cancelled) setSvg(s);
      })
      .catch(() => {
        if (!cancelled) setSvg("");
      });
    return () => {
      cancelled = true;
    };
  }, [value]);

  return (
    <div
      className={cn("relative overflow-hidden rounded-xl bg-white p-2", className)}
      style={{ width: size, height: size }}
      role="img"
      aria-label={ariaLabel ?? `QR code to ${value}`}
    >
      {svg ? (
        <div
          className="h-full w-full [&>svg]:h-full [&>svg]:w-full"
          dangerouslySetInnerHTML={{ __html: svg }}
        />
      ) : (
        <div className="h-full w-full animate-pulse bg-neutral-200" />
      )}
    </div>
  );
}

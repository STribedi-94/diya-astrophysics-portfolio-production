/**
 * Spectral Divider — a slim rainbow band spanning UV → radio wavelengths.
 * Use to punctuate sections and reinforce the multi-wavelength motif.
 */
export function SpectralDivider({ label }: { label?: string }) {
  return (
    <div className="container-page my-16 md:my-24">
      <div className="relative flex items-center gap-4">
        <div className="spectral-divider flex-1" />
        {label && (
          <span className="whitespace-nowrap font-mono text-[10px] uppercase tracking-[0.28em] text-muted-foreground">
            {label}
          </span>
        )}
        <div className="spectral-divider flex-1" />
      </div>
    </div>
  );
}

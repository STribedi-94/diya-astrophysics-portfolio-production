export type TessMissionMetric = {
  label: string;
  value: string;
};

export type TessMissionPresentation = {
  eyebrow: string;
  missionRole: string;
  metrics: TessMissionMetric[];
  researchThemes: string[];
  researchConnection: string;
  researchContext: string;
};

/**
 * Lightweight visitor-facing TESS mission presentation.
 *
 * This deliberately contains only mission-level information already
 * established by the Observatory Network / Astra foundation.
 *
 * Sector registries, target registries, publication relationships and
 * mission timelines belong to the later TESS Research System and should
 * extend this module rather than being embedded into the 3D renderer.
 */
export const TESS_MISSION_PRESENTATION: TessMissionPresentation = {
  eyebrow: "NASA Mission",
  missionRole:
    "High-cadence space photometry of bright nearby stars, providing the light curves used to study stellar variability and magnetic activity.",
  metrics: [
    {
      label: "Observatory",
      value: "Space photometry",
    },
    {
      label: "Orbit",
      value: "Highly elliptical high-Earth orbit",
    },
    {
      label: "Period",
      value: "≈ 13.7 days",
    },
    {
      label: "Resonance",
      value: "2:1 lunar resonance",
    },
  ],
  researchThemes: [
    "Stellar flares",
    "Starspots",
    "Rotation",
    "Variability",
  ],
  researchConnection:
    "TESS light curves provide the flare, starspot and rotational-modulation measurements used throughout Diya's active M-dwarf research.",
  researchContext:
    "Within Project Astra, TESS is the space-photometry anchor of a wider multi-wavelength observing network connecting stellar activity studies with ground-based optical and radio facilities.",
};

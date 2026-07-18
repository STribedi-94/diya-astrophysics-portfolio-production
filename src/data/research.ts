export type ResearchArea = {
  id: string;
  slug: string;
  title: string;
  shortTitle: string;
  accent: "aurora" | "electric" | "nebula" | "magenta" | "solar" | "flare" | "teal";
  scientificSummary: string;
  accessibleSummary: string;
  motivation: string;
  question: string;
  methodology: string[];
  facilities: string[];
  status: string;
  future: string;
};

export const researchAreas: ResearchArea[] = [
  {
    id: "mdwarf-magnetic-activity",
    slug: "m-dwarf-magnetic-activity",
    title: "Magnetic Activity of M-dwarf Stars",
    shortTitle: "M-dwarf Magnetic Activity",
    accent: "nebula",
    scientificSummary:
      "Characterising surface magnetic activity in low-mass stars through complementary optical and radio diagnostics.",
    accessibleSummary:
      "Understanding how small, cool stars generate powerful magnetic fields — and what that means for the planets that orbit them.",
    motivation:
      "M-dwarfs host most of the nearby exoplanet population. Their magnetic activity governs the environment those planets experience.",
    question:
      "How do rotation, starspots, flares and magnetic fields in M-dwarfs connect across optical and radio wavelengths?",
    methodology: [
      "Optical photometry",
      "TESS light-curve analysis",
      "Optical spectroscopy",
      "Near-infrared spectroscopy",
      "Low-frequency radio observations",
    ],
    facilities: ["uGMRT", "HCT", "DOT"],
    status: "Ongoing observational programme",
    future:
      "Extended multi-epoch monitoring and coordinated multi-wavelength campaigns of nearby M-dwarf targets.",
  },
  {
    id: "stellar-flares",
    slug: "stellar-flares",
    title: "Stellar Flares & Time-Domain Astronomy",
    shortTitle: "Stellar Flares",
    accent: "flare",
    scientificSummary:
      "Detecting and characterising optical and radio flares on cool stars using high-cadence time-series data.",
    accessibleSummary:
      "Catching sudden bursts of energy released by stars, and asking what powers them.",
    motivation:
      "Flares reveal magnetic reconnection processes and shape the radiation environment of orbiting planets.",
    question: "What are the statistics, energetics and radio counterparts of M-dwarf flares?",
    methodology: [
      "TESS short-cadence photometry",
      "Ground-based optical monitoring",
      "uGMRT radio follow-up",
    ],
    facilities: ["uGMRT", "HCT", "DOT"],
    status: "Ongoing",
    future: "Simultaneous optical–radio flare campaigns.",
  },
  {
    id: "stellar-rotation-spots",
    slug: "stellar-rotation-and-starspots",
    title: "Stellar Rotation & Starspots",
    shortTitle: "Rotation & Starspots",
    accent: "electric",
    scientificSummary:
      "Measuring rotation periods and mapping starspot coverage from photometric modulation.",
    accessibleSummary:
      "Timing the spin of stars and mapping the cool magnetic regions on their surfaces.",
    motivation:
      "Rotation is the primary driver of the stellar dynamo; starspots trace surface magnetic geometry.",
    question:
      "How does rotation set the level and morphology of magnetic activity across the M-dwarf sequence?",
    methodology: ["Photometric period analysis", "Spot modelling", "Long-baseline monitoring"],
    facilities: ["HCT", "DOT"],
    status: "Ongoing",
    future: "Coupled rotation–activity–age studies.",
  },
  {
    id: "radio-astronomy",
    slug: "radio-astronomy-of-cool-stars",
    title: "Radio Astronomy of Cool Stars",
    shortTitle: "Radio Astronomy",
    accent: "aurora",
    scientificSummary:
      "Low-frequency radio observations of M-dwarfs with the upgraded Giant Metrewave Radio Telescope.",
    accessibleSummary:
      "Listening to stars in radio waves to reveal magnetic phenomena invisible at other wavelengths.",
    motivation:
      "Coherent radio emission diagnoses electron beams, magnetic geometry and potentially star–planet interaction.",
    question:
      "Which cool stars show detectable coherent radio emission, and what mechanisms produce it?",
    methodology: [
      "uGMRT band-3 and band-4 observations",
      "Interferometric imaging",
      "Dynamic spectra analysis",
    ],
    facilities: ["uGMRT"],
    status: "Active observing campaigns",
    future: "Expanded target sample and multi-band radio monitoring.",
  },
  {
    id: "spectroscopy",
    slug: "optical-and-near-infrared-spectroscopy",
    title: "Optical & Near-Infrared Spectroscopy",
    shortTitle: "Spectroscopy",
    accent: "magenta",
    scientificSummary:
      "Diagnosing chromospheric activity, magnetic field indicators and stellar parameters through spectra.",
    accessibleSummary:
      "Splitting starlight into a spectrum to reveal temperature, motion and magnetic clues.",
    motivation:
      "Spectral diagnostics complement photometric variability and radio emission for a full activity picture.",
    question:
      "What do chromospheric emission lines and magnetically sensitive features tell us about M-dwarf activity?",
    methodology: [
      "Optical spectroscopy with HCT",
      "Near-infrared spectroscopy",
      "Line-profile analysis",
    ],
    facilities: ["HCT", "DOT"],
    status: "Ongoing",
    future: "High-resolution near-infrared campaigns.",
  },
  {
    id: "habitability",
    slug: "exoplanet-habitability-and-star-planet-interaction",
    title: "Exoplanet Habitability & Star–Planet Interaction",
    shortTitle: "Habitability",
    accent: "teal",
    scientificSummary:
      "Connecting stellar magnetic activity to the radiation and particle environment of planets around M-dwarfs.",
    accessibleSummary:
      "Asking whether small planets around active red stars can remain habitable.",
    motivation:
      "The magnetic environment of the host star may dominate the atmospheric evolution of orbiting worlds.",
    question:
      "How does M-dwarf activity affect habitability, and can we detect magnetic star–planet interaction?",
    methodology: [
      "Multi-wavelength activity characterisation",
      "Search for coherent star–planet signals",
    ],
    facilities: ["uGMRT", "HCT", "DOT"],
    status: "Emerging direction",
    future: "Targeted searches around known M-dwarf planet hosts.",
  },
];

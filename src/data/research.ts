export type ResearchArea = {
  id: string;
  slug: string;
  title: string;
  shortTitle: string;
  accent: "aurora" | "electric" | "nebula" | "magenta" | "solar" | "flare" | "teal";
  motif: "lightcurve" | "spectrum" | "radio" | "starspots" | "magnetic" | "habitable";
  scientificSummary: string;
  accessibleSummary: string;
  motivation: string;
  question: string;
  methodology: string[];
  facilities: string[]; // facility slugs
  targets: string[];
  projects: string[]; // project slugs
  publications: string[]; // publication slugs
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
    motif: "magnetic",
    scientificSummary:
      "Characterising surface magnetic activity in low-mass stars through complementary optical and radio diagnostics.",
    accessibleSummary:
      "Understanding how small, cool stars generate powerful magnetic fields — and what that means for the planets that orbit them.",
    motivation:
      "M-dwarfs host most of the nearby exoplanet population; their magnetic activity governs the environment those planets experience.",
    question:
      "How do rotation, starspots, flares and magnetic fields in M-dwarfs connect across optical and radio wavelengths?",
    methodology: [
      "Optical photometry",
      "TESS light-curve analysis",
      "Optical spectroscopy",
      "Near-infrared spectroscopy",
      "Low-frequency radio observations",
    ],
    facilities: ["ugmrt", "hct", "dot", "tess"],
    targets: ["AD Leo", "Wolf 359", "GJ 1151", "GJ 398", "EV Lac"],
    projects: [
      "gj398-radio-followup",
      "adleo-spectroscopic-monitoring",
      "m-dwarf-radio-survey",
    ],
    publications: [
      "ad-leonis-flares-spectra",
      "wolf-359-starspots-qpp",
      "gj1151-flares-ugmrt",
      "gj-398-flares-radio",
      "understanding-magnetic-activity-mdwarfs-spectroscopy",
    ],
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
    motif: "lightcurve",
    scientificSummary:
      "Detecting and characterising optical and radio flares on cool stars using high-cadence time-series data.",
    accessibleSummary:
      "Catching sudden bursts of energy released by stars, and asking what powers them.",
    motivation:
      "Flares reveal magnetic reconnection processes and shape the radiation environment of orbiting planets.",
    question:
      "What are the statistics, energetics and radio counterparts of M-dwarf and brown-dwarf flares?",
    methodology: [
      "TESS short-cadence photometry",
      "Ground-based optical monitoring",
      "uGMRT radio follow-up",
      "Flare energy statistics",
    ],
    facilities: ["tess", "ugmrt", "hct"],
    targets: ["AD Leo", "Wolf 359", "GJ 398", "MHO 4", "Young Taurus brown dwarfs"],
    projects: [
      "tess-flare-statistics",
      "young-brown-dwarf-superflares",
      "gj398-radio-followup",
    ],
    publications: [
      "ad-leonis-flares-spectra",
      "wolf-359-starspots-qpp",
      "gj-398-flares-radio",
      "tess-young-brown-dwarfs-taurus",
      "young-brown-dwarf-superflares-tess",
    ],
    status: "Ongoing",
    future: "Simultaneous optical–radio flare campaigns.",
  },
  {
    id: "stellar-rotation-spots",
    slug: "stellar-rotation-and-starspots",
    title: "Stellar Rotation & Starspots",
    shortTitle: "Rotation & Starspots",
    accent: "electric",
    motif: "starspots",
    scientificSummary:
      "Measuring rotation periods and mapping starspot coverage from photometric modulation.",
    accessibleSummary:
      "Timing the spin of stars and mapping the cool magnetic regions on their surfaces.",
    motivation:
      "Rotation is the primary driver of the stellar dynamo; starspots trace surface magnetic geometry.",
    question:
      "How does rotation set the level and morphology of magnetic activity across the M-dwarf sequence?",
    methodology: [
      "Photometric period analysis",
      "Spot modelling",
      "Long-baseline monitoring",
    ],
    facilities: ["tess", "hct"],
    targets: ["Wolf 359", "TIC 272272592", "GJ 182", "2MASS J05160212+2214528"],
    projects: ["wolf359-starspot-analysis", "tic272272592-spot-modelling"],
    publications: [
      "wolf-359-starspots-qpp",
      "tic-272272592-starspots",
      "starspot-flares-two-young-mstars",
    ],
    status: "Ongoing",
    future: "Coupled rotation–activity–age studies.",
  },
  {
    id: "radio-astronomy",
    slug: "radio-astronomy-of-cool-stars",
    title: "Radio Astronomy of Cool Stars",
    shortTitle: "Radio Astronomy",
    accent: "aurora",
    motif: "radio",
    scientificSummary:
      "Low-frequency radio observations of M-dwarfs with the upgraded Giant Metrewave Radio Telescope.",
    accessibleSummary:
      "Listening to stars in radio waves to reveal magnetic phenomena invisible at other wavelengths.",
    motivation:
      "Coherent radio emission diagnoses electron beams, magnetic geometry and potentially star–planet interaction.",
    question:
      "Which cool stars show detectable coherent radio emission, and what mechanisms produce it?",
    methodology: [
      "uGMRT Band-3 and Band-4 observations",
      "Interferometric imaging",
      "Dynamic spectra analysis",
    ],
    facilities: ["ugmrt"],
    targets: ["GJ 1151", "GJ 398"],
    projects: ["gj1151-radio-monitoring", "gj398-radio-followup", "m-dwarf-radio-survey"],
    publications: ["gj1151-flares-ugmrt", "gj-398-flares-radio"],
    status: "Active observing campaigns",
    future: "Expanded target sample and multi-band radio monitoring.",
  },
  {
    id: "spectroscopy",
    slug: "optical-and-near-infrared-spectroscopy",
    title: "Optical & Near-Infrared Spectroscopy",
    shortTitle: "Spectroscopy",
    accent: "magenta",
    motif: "spectrum",
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
    facilities: ["hct", "dot"],
    targets: ["AD Leo", "EV Lac", "Stkm2-809"],
    projects: ["adleo-spectroscopic-monitoring", "spectroscopic-monitoring"],
    publications: [
      "ad-leonis-flares-spectra",
      "understanding-magnetic-activity-mdwarfs-spectroscopy",
    ],
    status: "Ongoing",
    future: "High-resolution near-infrared campaigns.",
  },
  {
    id: "habitability",
    slug: "exoplanet-habitability-and-star-planet-interaction",
    title: "Exoplanet Habitability & Star–Planet Interaction",
    shortTitle: "Habitability",
    accent: "teal",
    motif: "habitable",
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
    facilities: ["ugmrt", "hct", "dot", "tess"],
    targets: ["GJ 1151"],
    projects: ["gj1151-radio-monitoring"],
    publications: ["gj1151-flares-ugmrt"],
    status: "Emerging direction",
    future: "Targeted searches around known M-dwarf planet hosts.",
  },
];

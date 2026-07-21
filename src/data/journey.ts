// Academic Journey — verified chronological chapters.
// Sourced from Diya Ram's CV, PhD thesis and About-page data. No unverified facts.

export type JourneyChapter = {
  id: string;
  index: string;
  period: string;
  eyebrow: string;
  title: string;
  institution?: string;
  location?: string;
  supervisor?: string;
  summary: string;
  achievements?: readonly string[];
  milestoneAchievements?: readonly string[];
  development: string;
  significance: string;
  scene:
    | "nursery"
    | "spectroscopy"
    | "gateway"
    | "mdwarf"
    | "thesis"
    | "horizon";
  accent: string;
};


export const journeyChapters: readonly JourneyChapter[] = [
  {
    id: "foundation",
    index: "01",
    period: "2013 – 2016",
    eyebrow: "Chapter One",
    title: "Building the Foundation",
    institution: "Bangabasi Morning College · University of Calcutta",
    location: "Kolkata, India",
    summary:
      "Undergraduate study in Physics established the mathematical, analytical and experimental foundations on which every later stage of Diya's scientific journey was built.",
    achievements: [
      "Bachelor of Science in Physics (Honours)",
      "Ranked first in B.Sc. Physics (2016)",
    ],
    development:
      "Classical mechanics, electrodynamics, mathematical physics, quantum mechanics and laboratory methods — the language required to ask more advanced questions about the physical universe.",
    scene: "nursery",
    accent: "electric",
  },
  {
    id: "astrophysics",
    index: "02",
    period: "2016 – 2018",
    eyebrow: "Chapter Two",
    title: "From Physics to the Stars",
    institution: "St. Xavier's College, Kolkata · University of Calcutta",
    location: "Kolkata, India",
    summary:
      "A Master of Science in Physics with a specialisation in Astrophysics marked the deliberate transition from general physics toward the study of stars, radiation and observational astronomy.",
    achievements: [
      "M.Sc. Physics with Astrophysics specialisation",
      "Indira Gandhi Single Girl Child Scholarship",
    ],
    development:
      "Stellar structure, radiative processes, spectroscopy, astronomical instrumentation and observational methods — shaping the decision to pursue research on magnetically active stars.",
    scene: "spectroscopy",
    accent: "stellar-gold",
  },
  {
    id: "qualifying",
    index: "03",
    period: "June 2019",
    eyebrow: "Chapter Three",
    title: "Crossing into Research",
    institution: "CSIR – UGC National Eligibility Test",
    summary:
      "Qualifying the CSIR–UGC NET with an All-India Rank of 143 opened the pathway into nationally supported full-time research.",
    achievements: [
      "All-India Rank 143",
      "Junior Research Fellowship",
      "Lectureship qualification",
    ],
    development:
      "This national qualification provided the fellowship support and academic eligibility required to begin sustained doctoral research.",
    scene: "gateway",
    accent: "spectral-cyan",
  },
  {
    id: "doctoral",
    index: "04",
    period: "January 2020 – February 2026",
    eyebrow: "Chapter Four",
    title: "Becoming an Observational Astrophysicist",
    institution: "S. N. Bose National Centre for Basic Sciences",
    location: "University of Calcutta",
    supervisor: "Professor Soumen Mondal",
    summary:
      "Doctoral research developed a multi-wavelength observational picture of magnetic activity in nearby M-dwarf stars — combining time-domain photometry, optical and near-infrared spectroscopy, and low-frequency radio observations to investigate flares, starspots, rotational behaviour, chromospheric activity and possible radio signatures of stellar magnetic processes.",
    achievements: [
      "Junior Research Fellow · January 2020 – December 2021",
      "Senior Research Fellow · January 2022 – December 2025",
      "Representative M-dwarf targets: AD Leonis · Wolf 359 · GJ 1151 · GJ 398",
    ],
    development:
      "Stellar variability → rotation and starspots → flares → chromospheric diagnostics → low-frequency radio emission → multi-wavelength interpretation → exoplanet environments and star–planet interaction.",
    scene: "mdwarf",
    accent: "mdwarf",
  },
];

export type FacilityNode = {
  slug: string;
  shortName: string;
  fullName: string;
  wavelength: string;
  role: readonly string[];
  scene: "tess" | "ugmrt" | "hct" | "dot";
  accent: string;
  href: string;
  totalLabel: string;
  totalValue: number;
  totalUnit: string;
};

export const observingConstellation: readonly FacilityNode[] = [
  {
    slug: "tess",
    shortName: "TESS",
    fullName: "Transiting Exoplanet Survey Satellite",
    wavelength: "Space-based optical photometry",
    role: [
      "High-cadence light curves",
      "Flare detection",
      "Rotation and starspot analysis",
    ],
    scene: "tess",
    accent: "spectral-cyan",
    href: "/observations",
    totalLabel: "Space-based monitoring",
    totalValue: 0,
    totalUnit: "",
  },
  {
    slug: "ugmrt",
    shortName: "uGMRT",
    fullName: "upgraded Giant Metrewave Radio Telescope",
    wavelength: "Low-frequency radio · bands 3 & 4",
    role: [
      "Principal-investigator programmes",
      "Search for stellar magnetic radio signatures",
    ],
    scene: "ugmrt",
    accent: "radio-teal",
    href: "/facilities/ugmrt",
    totalLabel: "uGMRT observing hours",
    totalValue: 18,
    totalUnit: "hours",
  },
  {
    slug: "hct",
    shortName: "HCT",
    fullName: "2-m Himalayan Chandra Telescope",
    wavelength: "Optical photometry and time-series spectroscopy",
    role: [
      "Principal-investigator campaigns",
      "Activity-sensitive spectral diagnostics",
    ],
    scene: "hct",
    accent: "stellar-gold",
    href: "/facilities/hct",
    totalLabel: "HCT observing nights",
    totalValue: 14,
    totalUnit: "nights",
  },
  {
    slug: "dot",
    shortName: "DOT",
    fullName: "3.6-m Devasthal Optical Telescope",
    wavelength: "Optical and near-infrared spectroscopy",
    role: [
      "Principal-investigator programmes",
      "Deep spectroscopy for multi-wavelength follow-up",
    ],
    scene: "dot",
    accent: "uv-violet",
    href: "/facilities/dot",
    totalLabel: "DOT observing hours",
    totalValue: 40,
    totalUnit: "hours",
  },
];

export type Method = {
  code: string;
  label: string;
  detail: readonly string[];
  accent: string;
};

export const methodsRibbon: readonly Method[] = [
  {
    code: "01",
    label: "Optical Photometry",
    detail: [
      "Time-series light curves",
      "Stellar flares",
      "Rotation periods",
      "Starspot modulation",
    ],
    accent: "spectral-cyan",
  },
  {
    code: "02",
    label: "Optical Spectroscopy",
    detail: [
      "Hα · Hβ · Ca II H & K",
      "Chromospheric activity",
    ],
    accent: "stellar-gold",
  },
  {
    code: "03",
    label: "Near-Infrared Spectroscopy",
    detail: [
      "Cool stellar atmospheres",
      "Activity-sensitive features",
    ],
    accent: "flare-amber",
  },
  {
    code: "04",
    label: "Low-Frequency Radio Astronomy",
    detail: [
      "uGMRT band-3 & band-4 imaging",
      "Coherent and incoherent emission",
    ],
    accent: "radio-teal",
  },
  {
    code: "05",
    label: "Time-Series Analysis",
    detail: [
      "Periodograms",
      "Flare detection · energetics",
      "Quasi-periodic behaviour",
    ],
    accent: "uv-violet",
  },
  {
    code: "06",
    label: "Multi-Wavelength Synthesis",
    detail: [
      "Photometry · spectroscopy · radio",
      "One coherent physical interpretation",
    ],
    accent: "mdwarf",
  },
];

export const thesisMilestone = {
  eyebrow: "PhD Thesis · Submitted",
  title: "Understanding Stellar Activity in M-dwarfs",
  submitted: "4 February 2026",
  author: "Diya Ram",
  supervisor: "Professor Soumen Mondal",
  institution: "S. N. Bose National Centre for Basic Sciences",
  university: "University of Calcutta",
  programme: "Doctor of Philosophy (Science) in Physics (Experimental)",
  description:
    "The thesis develops a multi-wavelength observational picture of magnetic activity in nearby M-dwarf stars by combining TESS photometry, optical and near-infrared spectroscopy, and low-frequency uGMRT observations.",
  themes: [
    "Flare energetics",
    "Starspot distributions",
    "Rotational variability",
    "Chromospheric diagnostics",
    "Quasi-periodic behaviour",
    "Stellar radio emission",
    "Multi-wavelength magnetic activity",
  ],
  status:
    "PhD thesis submitted. Defence forthcoming. The degree will be awarded upon successful completion of University requirements.",
  targets: ["AD Leonis", "Wolf 359", "GJ 1151", "GJ 398"],
} as const;

export const currentPosition = {
  role: "Bridge Fellow",
  institution: "S. N. Bose National Centre for Basic Sciences",
  department: "Department of Astrophysics and High Energy Physics",
  since: "April 2026",
  narrative:
    "Following the submission of her PhD thesis, Diya continues her research as a Bridge Fellow — extending her work on M-dwarf magnetic activity, multi-wavelength stellar behaviour and the environments of planets orbiting active low-mass stars.",
  directions: [
    "M-dwarf magnetic activity",
    "Stellar flares and variability",
    "Optical and near-infrared spectroscopy",
    "Low-frequency radio observations",
    "Multi-wavelength synthesis",
    "Exoplanet environments",
    "Star–planet interaction",
    "Collaborative observing programmes",
  ],
} as const;

export const chapterNav = [
  { id: "foundation", label: "Foundation" },
  { id: "astrophysics", label: "Astrophysics" },
  { id: "qualifying", label: "Fellowship" },
  { id: "doctoral", label: "Doctoral Research" },
  { id: "observing", label: "Observing" },
  { id: "methods", label: "Wavelengths" },
  { id: "thesis", label: "Thesis" },
  { id: "today", label: "Present" },
] as const;

export const progressLabels = [
  "Curiosity",
  "Physics",
  "Astrophysics",
  "Research",
  "Observation",
  "Discovery",
] as const;

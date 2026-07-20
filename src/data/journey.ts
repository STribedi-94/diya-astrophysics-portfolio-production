// Academic Journey — verified chronological chapters.
// Sourced from Diya Ram's CV, PhD thesis and existing About-page data.
// No unverified dates, marks, institutions or achievements.

export type JourneyChapter = {
  id: string;
  index: string;
  period: string;
  eyebrow: string;
  title: string;
  institution?: string;
  location?: string;
  summary: string;
  achievements?: readonly string[];
  development: string;
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
      "Undergraduate study in Physics established the analytical and mathematical foundation on which every later stage of Diya's scientific journey has been built.",
    achievements: [
      "Bachelor of Science in Physics (Honours)",
      "Ranked first in class, B.Sc. Physics (2016)",
    ],
    development:
      "This stage developed the core physical intuition — classical mechanics, electrodynamics and mathematical methods — required for advanced study in astrophysics.",
    accent: "spectral-cyan",
  },
  {
    id: "astrophysics",
    index: "02",
    period: "2016 – 2018",
    eyebrow: "Chapter Two",
    title: "From Physics to the Stars",
    institution: "St. Xavier's College · University of Calcutta",
    location: "Kolkata, India",
    summary:
      "A Master of Science in Physics with a specialisation in Astrophysics marked the deliberate turn from general physics toward the study of stellar objects.",
    achievements: [
      "M.Sc. Physics with Astrophysics specialisation",
      "Indira Gandhi Single Girl Child Scholarship",
    ],
    development:
      "This stage introduced formal astrophysics — stellar structure, radiative processes and observational techniques — and shaped the decision to pursue research on stars.",
    accent: "aurora",
  },
  {
    id: "qualifying",
    index: "03",
    period: "June 2019",
    eyebrow: "Chapter Three",
    title: "Crossing into Research",
    institution: "CSIR – University Grants Commission National Eligibility Test",
    summary:
      "Qualifying the CSIR–UGC NET with an All-India Rank of 143 opened the pathway into full-time doctoral research and secured national fellowship support.",
    achievements: [
      "CSIR–UGC NET · All India Rank 143",
      "Junior Research Fellowship and Lectureship awards",
    ],
    development:
      "This national qualification enabled entry into a doctoral programme and provided the fellowship support that made sustained research possible.",
    accent: "stellar-gold",
  },
  {
    id: "doctoral",
    index: "04",
    period: "2020 – 2026",
    eyebrow: "Chapter Four",
    title: "Becoming an Observational Astrophysicist",
    institution: "S. N. Bose National Centre for Basic Sciences",
    location: "Kolkata, India · University of Calcutta",
    summary:
      "Doctoral research under Professor Soumen Mondal developed a multi-wavelength observational picture of magnetic activity in nearby M-dwarf stars — tracing flares, starspots, chromospheric diagnostics and possible radio signatures across TESS photometry, ground-based optical spectroscopy and low-frequency radio observations.",
    achievements: [
      "Junior Research Fellow · January 2020 – December 2021",
      "Senior Research Fellow · January 2022 – December 2025",
      "PhD thesis: Understanding Stellar Activity in M-dwarfs",
      "Targets: AD Leonis · Wolf 359 · GJ 1151 · GJ 398",
    ],
    development:
      "Stellar variability → flares and starspots → magnetic activity → multi-wavelength observations → optical, near-infrared and radio interpretation.",
    accent: "mdwarf",
  },
];

export type FacilityNode = {
  slug: string;
  shortName: string;
  fullName: string;
  wavelength: string;
  role: string;
  motif: "orbit" | "wave" | "dome";
  accent: string;
};

export const observingConstellation: readonly FacilityNode[] = [
  {
    slug: "tess",
    shortName: "TESS",
    fullName: "Transiting Exoplanet Survey Satellite",
    wavelength: "Space-based optical photometry",
    role: "High-cadence time-series photometry used to detect flares, measure rotation and study starspot behaviour in nearby M dwarfs.",
    motif: "orbit",
    accent: "spectral-cyan",
  },
  {
    slug: "ugmrt",
    shortName: "uGMRT",
    fullName: "upgraded Giant Metrewave Radio Telescope",
    wavelength: "Low-frequency radio (bands 3 & 4)",
    role: "Principal-investigator radio observations searching for coherent and incoherent stellar magnetic signatures in active M dwarfs.",
    motif: "wave",
    accent: "radio-teal",
  },
  {
    slug: "hct",
    shortName: "HCT",
    fullName: "2-m Himalayan Chandra Telescope",
    wavelength: "Optical photometry and spectroscopy",
    role: "Principal-investigator optical monitoring — time-series spectroscopy of activity-sensitive lines and long-baseline photometric campaigns.",
    motif: "dome",
    accent: "stellar-gold",
  },
  {
    slug: "dot",
    shortName: "DOT",
    fullName: "3.6-m Devasthal Optical Telescope",
    wavelength: "Optical and near-infrared spectroscopy",
    role: "Principal-investigator deep spectroscopy supporting multi-wavelength studies of magnetic activity in low-mass stars.",
    motif: "dome",
    accent: "aurora",
  },
];

export const methodsRibbon: ReadonlyArray<{ label: string; note: string }> = [
  { label: "Optical photometry", note: "Time-series flare and rotation studies" },
  { label: "Optical spectroscopy", note: "Hα, Hβ, Ca II H & K diagnostics" },
  { label: "Near-infrared spectroscopy", note: "Cool-atmosphere line probes" },
  { label: "Low-frequency radio astronomy", note: "uGMRT band-3 / band-4 imaging" },
  { label: "Time-series analysis", note: "Periodograms · flare energetics" },
  { label: "Multi-wavelength synthesis", note: "One coherent physical picture" },
];

export const currentPosition = {
  role: "Bridge Fellow",
  institution: "S. N. Bose National Centre for Basic Sciences",
  department: "Department of Astrophysics and High Energy Physics",
  since: "April 2026",
  thesisStatus:
    "PhD thesis submitted. Defence forthcoming. Degree will be awarded upon successful completion of University requirements.",
} as const;

export const progressLabels = [
  "Curiosity",
  "Physics",
  "Astrophysics",
  "Research",
  "Discovery",
] as const;

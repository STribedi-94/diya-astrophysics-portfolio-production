// Deliberately-empty structured demonstration data for future population.

export type ProjectSummary = {
  id: string;
  slug: string;
  title: string;
  shortTitle: string;
  status: "Active" | "In preparation" | "Planned";
  question: string;
  facilities: string[];
};

export const projects: ProjectSummary[] = [
  {
    id: "mdwarf-radio-survey",
    slug: "m-dwarf-radio-survey",
    title: "Low-frequency radio survey of nearby M-dwarfs",
    shortTitle: "M-dwarf radio survey",
    status: "Active",
    question: "Which nearby M-dwarfs show detectable coherent radio emission at metre wavelengths?",
    facilities: ["uGMRT"],
  },
  {
    id: "tess-flares",
    slug: "tess-flare-statistics",
    title: "Flare statistics from TESS light curves",
    shortTitle: "TESS flare statistics",
    status: "Active",
    question: "How does flare energy scale with spectral type and rotation in the TESS M-dwarf sample?",
    facilities: ["HCT"],
  },
  {
    id: "spectro-monitoring",
    slug: "spectroscopic-monitoring",
    title: "Spectroscopic monitoring of active M-dwarfs",
    shortTitle: "Spectroscopic monitoring",
    status: "In preparation",
    question: "What long-term chromospheric behaviour do our M-dwarf targets exhibit?",
    facilities: ["HCT", "DOT"],
  },
];

export type NewsItem = {
  id: string;
  slug: string;
  title: string;
  date: string;
  category: string;
  summary: string;
};

export const news: NewsItem[] = [
  {
    id: "site-launch",
    slug: "research-universe-launch",
    title: "Research universe launched",
    date: "2026",
    category: "Website",
    summary:
      "The initial foundation of Diya Ram's research website is online. Verified content will be added progressively.",
  },
  {
    id: "ugmrt-cycle",
    slug: "ugmrt-observing-cycle",
    title: "uGMRT observing cycle underway",
    date: "Ongoing",
    category: "Observing",
    summary: "Radio observations of selected M-dwarf targets are ongoing. Details will be added from verified telescope records.",
  },
];

export type Conference = {
  id: string;
  title: string;
  event: string;
  location: string;
  date: string;
  type: string;
};

export const conferences: Conference[] = [
  {
    id: "placeholder",
    title: "Conference presentations will be listed after verification.",
    event: "—",
    location: "—",
    date: "—",
    type: "Placeholder",
  },
];

export type TeachingEntry = {
  id: string;
  title: string;
  type: string;
  role: string;
  description: string;
};

export const teaching: TeachingEntry[] = [
  {
    id: "placeholder",
    title: "Teaching and mentoring activities will be listed after verification.",
    type: "Placeholder",
    role: "—",
    description:
      "Course, level and mentoring information will be populated from verified academic records.",
  },
];

export type GalleryItem = {
  id: string;
  title: string;
  category: string;
  caption: string;
};

export const gallery: GalleryItem[] = [
  { id: "g1", title: "M-dwarf illustration", category: "Illustration", caption: "Artistic representation of a low-mass star." },
  { id: "g2", title: "Radio antenna field", category: "Facility", caption: "Illustration of a radio-astronomy array." },
  { id: "g3", title: "Light curve", category: "Diagram", caption: "Schematic light curve showing rotational modulation and a flare." },
  { id: "g4", title: "Spectral lines", category: "Diagram", caption: "Illustrative spectral-line diagram." },
  { id: "g5", title: "Constellation of research themes", category: "Illustration", caption: "Schematic map of research topics." },
  { id: "g6", title: "Optical dome", category: "Facility", caption: "Illustration of an optical observatory dome." },
];

export type DownloadItem = {
  id: string;
  title: string;
  category: string;
  description: string;
  status: "available" | "pending";
};

export const downloads: DownloadItem[] = [
  {
    id: "cv",
    title: "Curriculum Vitae",
    category: "Academic",
    description: "Full CV of Diya Ram.",
    status: "pending",
  },
  {
    id: "research-statement",
    title: "Research statement",
    category: "Academic",
    description: "Overview of Diya Ram's research programme.",
    status: "pending",
  },
  {
    id: "publication-list",
    title: "Publication list",
    category: "Academic",
    description: "Complete publication list.",
    status: "pending",
  },
];

export type Publication = {
  id: string;
  slug: string;
  title: string;
  authors: string;
  journal: string;
  year: string;
  status: "Published" | "Submitted" | "In preparation" | "Placeholder";
  summary: string;
  featured?: boolean;
};

export const publications: Publication[] = [
  {
    id: "placeholder-1",
    slug: "publication-placeholder-one",
    title: "Publication information will be populated from verified journal and NASA ADS records.",
    authors: "Diya Ram, et al.",
    journal: "—",
    year: "—",
    status: "Placeholder",
    summary:
      "Verified publications will appear here with DOI, NASA ADS, arXiv and journal links.",
    featured: true,
  },
];

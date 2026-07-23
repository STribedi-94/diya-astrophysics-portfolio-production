// Structured content for the site. Verified against uploaded documents,
// publication PDFs and existing website records.

export type ProjectStatus =
  | "Published"
  | "Accepted"
  | "Ongoing"
  | "In preparation";

export type ProjectSummary = {
  id: string;
  slug: string;
  title: string;
  shortTitle: string;
  status: ProjectStatus;
  theme: string;
  question: string;
  motivation: string;
  target: string;
  wavelength: string; // "Radio" | "Optical" | "Optical / NIR" | "Multi-wavelength"
  facilities: string[]; // facility slugs
  methodology: string[];
  outcome: string;
  areas: string[]; // research area slugs
  publications: string[]; // publication slugs (may be empty for ongoing)
};

export const projects: ProjectSummary[] = [
  {
    id: "gj1151-radio-monitoring",
    slug: "gj1151-radio-monitoring",
    title: "Low-frequency radio monitoring of the M-dwarf GJ 1151",
    shortTitle: "GJ 1151 · uGMRT radio",
    status: "Published",
    theme: "Radio Astronomy of Cool Stars",
    question:
      "What constraints do uGMRT observations place on low-frequency radio emission from GJ 1151?",
    motivation:
      "GJ 1151 is a benchmark quiescent M-dwarf whose reported low-frequency radio signal has motivated the search for magnetic star–planet interaction; deeper uGMRT observations test and constrain the emission scenarios.",
    target: "GJ 1151",
    wavelength: "Radio",
    facilities: ["ugmrt"],
    methodology: [
      "uGMRT Band-3 and Band-4 interferometric imaging",
      "Dynamic spectral analysis",
      "Multi-epoch monitoring",
    ],
    outcome:
      "Low-frequency uGMRT observations placing constraints on possible coherent radio emission from GJ 1151.",
    areas: [
      "radio-astronomy-of-cool-stars",
      "m-dwarf-magnetic-activity",
      "exoplanet-habitability-and-star-planet-interaction",
    ],
    publications: ["gj1151-flares-ugmrt"],
  },
  {
    id: "wolf359-starspot-analysis",
    slug: "wolf359-starspot-analysis",
    title: "Starspots and quasi-periodic pulsations on Wolf 359",
    shortTitle: "Wolf 359 · starspots & QPPs",
    status: "Published",
    theme: "Starspots, Rotation & Surface Magnetism",
    question:
      "What do TESS light curves reveal about starspot geometry, rotation and flare QPPs on the nearby M-dwarf Wolf 359?",
    motivation:
      "Wolf 359 (CN Leo) is one of the nearest M-dwarfs and an excellent laboratory for connecting rotational modulation to flare energetics.",
    target: "Wolf 359 (CN Leonis)",
    wavelength: "Optical",
    facilities: ["tess"],
    methodology: [
      "TESS short-cadence photometry",
      "Spot modelling of rotational modulation",
      "Time–frequency analysis of flare QPPs",
    ],
    outcome:
      "Refined rotation period, spot-coverage constraints and detection of quasi-periodic pulsations in stellar flares.",
    areas: [
      "stellar-rotation-and-starspots",
      "stellar-flares",
      "m-dwarf-magnetic-activity",
    ],
    publications: ["wolf-359-starspots-qpp"],
  },
  {
    id: "adleo-spectroscopic-monitoring",
    slug: "adleo-spectroscopic-monitoring",
    title: "Optical spectroscopy and flare monitoring of AD Leonis",
    shortTitle: "AD Leo · optical flares & spectra",
    status: "Published",
    theme: "Optical & Near-Infrared Spectroscopy",
    question:
      "How do chromospheric emission lines respond to optical flares on the active M-dwarf AD Leonis?",
    motivation:
      "AD Leo is an archetypal active M-dwarf; simultaneous photometric and spectroscopic monitoring links flare energetics to chromospheric line variability.",
    target: "AD Leonis",
    wavelength: "Optical / NIR",
    facilities: ["hct"],
    methodology: [
      "HCT medium-resolution optical spectroscopy",
      "Ground-based photometric monitoring",
      "Chromospheric line-profile analysis",
    ],
    outcome:
      "Time-resolved characterisation of Balmer-line and Ca II response during optical flare events.",
    areas: [
      "optical-and-near-infrared-spectroscopy",
      "stellar-flares",
      "m-dwarf-magnetic-activity",
    ],
    publications: ["ad-leonis-flares-spectra"],
  },
  {
    id: "gj398-radio-followup",
    slug: "gj398-radio-followup",
    title: "Optical–radio characterisation of GJ 398",
    shortTitle: "GJ 398 · optical & radio",
    status: "Accepted",
    theme: "Multi-wavelength stellar astrophysics",
    question:
      "What do TESS flare detections and uGMRT radio observations reveal or constrain about the magnetic activity of GJ 398?",
    motivation:
      "Combining TESS optical photometry with uGMRT radio observations constrains the magnetic environment of GJ 398.",
    target: "GJ 398",
    wavelength: "Multi-wavelength",
    facilities: ["tess", "ugmrt"],
    methodology: [
      "TESS light-curve analysis",
      "Flare energy statistics",
      "uGMRT radio follow-up",
    ],
    outcome:
      "Accepted study reporting TESS optical flare detections together with uGMRT radio constraints on the magnetic activity of GJ 398.",
    areas: [
      "m-dwarf-magnetic-activity",
      "stellar-flares",
      "radio-astronomy-of-cool-stars",
    ],
    publications: ["gj-398-flares-radio"],
  },
  {
    id: "m-dwarf-radio-survey",
    slug: "m-dwarf-radio-survey",
    title: "Low-frequency radio survey of nearby M-dwarfs",
    shortTitle: "M-dwarf radio survey",
    status: "Ongoing",
    theme: "Radio Astronomy of Cool Stars",
    question:
      "Which nearby M-dwarfs show detectable low-frequency radio emission at uGMRT metre wavelengths, and what limits can be placed on non-detections?",
    motivation:
      "A systematic survey builds the statistical sample needed to test whether coherent emission traces star–planet interaction or intrinsic stellar magnetic activity.",
    target: "Sample of nearby M-dwarfs",
    wavelength: "Radio",
    facilities: ["ugmrt"],
    methodology: [
      "uGMRT Band-3 / Band-4 targeted observations",
      "Interferometric imaging",
      "Dynamic-spectrum searches for possible coherent bursts",
    ],
    outcome:
      "Ongoing observing programme; results feed into a broader picture of M-dwarf low-frequency radio activity and its constraints.",
    areas: [
      "radio-astronomy-of-cool-stars",
      "m-dwarf-magnetic-activity",
    ],
    publications: [],
  },
  {
    id: "tess-flare-statistics",
    slug: "tess-flare-statistics",
    title: "Flare statistics from TESS light curves",
    shortTitle: "TESS flare statistics",
    status: "Ongoing",
    theme: "Time-domain M-dwarf activity",
    question:
      "How does flare energy scale with spectral type and rotation across the TESS M-dwarf sample?",
    motivation:
      "TESS's high-cadence photometry enables a homogeneous statistical treatment of M-dwarf flare energetics.",
    target: "TESS M-dwarf sample",
    wavelength: "Optical",
    facilities: ["tess"],
    methodology: [
      "Automated flare detection in TESS light curves",
      "Energy calibration",
      "Comparative statistics vs rotation period",
    ],
    outcome:
      "Ongoing analysis; contributes to the broader flare-energy vs stellar-property picture.",
    areas: ["stellar-flares", "stellar-rotation-and-starspots"],
    publications: [],
  },
  {
    id: "spectroscopic-monitoring",
    slug: "spectroscopic-monitoring",
    title: "Spectroscopic monitoring of active M-dwarfs",
    shortTitle: "Spectroscopic monitoring",
    status: "In preparation",
    theme: "Optical & Near-Infrared Spectroscopy",
    question:
      "What long-term chromospheric behaviour do our M-dwarf targets exhibit in optical and near-infrared spectra?",
    motivation:
      "Long-baseline spectroscopy is essential to disentangle rotational, cycle-like and flare-driven variability in M-dwarf chromospheres.",
    target: "Selected active M-dwarfs",
    wavelength: "Optical / NIR",
    facilities: ["hct", "dot"],
    methodology: [
      "HCT medium-resolution spectroscopy",
      "DOT deep spectroscopic follow-up",
      "Chromospheric line diagnostics",
    ],
    outcome:
      "Programme in preparation; will build a multi-epoch spectroscopic dataset.",
    areas: [
      "optical-and-near-infrared-spectroscopy",
      "m-dwarf-magnetic-activity",
    ],
    publications: [],
  },
  {
    id: "tic272272592-spot-modelling",
    slug: "tic272272592-spot-modelling",
    title: "Starspot modelling of TIC 272272592",
    shortTitle: "TIC 272272592 · spot modelling",
    status: "Published",
    theme: "Starspots, Rotation & Surface Magnetism",
    question:
      "What starspot configuration best reproduces the TESS light curve of TIC 272272592?",
    motivation:
      "Modelling individual well-sampled TESS targets tests the assumptions underlying rotational-modulation analyses.",
    target: "TIC 272272592",
    wavelength: "Optical",
    facilities: ["tess"],
    methodology: [
      "TESS photometry",
      "Starspot geometric modelling",
    ],
    outcome:
      "Published starspot characterisation of TIC 272272592 as a collaborative study.",
    areas: ["stellar-rotation-and-starspots"],
    publications: ["tic-272272592-starspots"],
  },
  {
    id: "young-brown-dwarf-superflares",
    slug: "young-brown-dwarf-superflares",
    title: "TESS superflares from young brown dwarfs in Taurus",
    shortTitle: "Young Taurus BDs · superflares",
    status: "Published",
    theme: "Time-domain low-mass astrophysics",
    question:
      "What are the properties of superflares detected on young brown dwarfs in the Taurus star-forming region?",
    motivation:
      "Extending flare studies to the substellar regime probes magnetic activity at very low masses and young ages.",
    target: "Young Taurus brown dwarfs (incl. MHO 4)",
    wavelength: "Optical",
    facilities: ["tess"],
    methodology: [
      "TESS light-curve mining",
      "Superflare energy calibration",
    ],
    outcome:
      "Collaborative published characterisation of superflare activity in young brown dwarfs.",
    areas: ["stellar-flares"],
    publications: [
      "tess-young-brown-dwarfs-taurus",
      "young-brown-dwarf-superflares-tess",
    ],
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
    summary:
      "Radio observations of selected M-dwarf targets are ongoing. Details will be added from verified telescope records.",
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

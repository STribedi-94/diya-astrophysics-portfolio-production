// Structured, single-source content for the About & Research Profile page.
// All values verified against V4 spec and CV. No unverified fields.

export const aboutIdentity = {
  eyebrow: "About & Research Profile",
  name: "Diya Ram",
  primaryTitle: "Observational Astrophysicist",
  role: "Bridge Fellow",
  institution: "S. N. Bose National Centre for Basic Sciences",
  department: "Department of Astrophysics and High Energy Physics",
  position: "Bridge Fellow · S. N. Bose National Centre for Basic Sciences",
  primaryStatement:
    "Investigating the magnetic activity of M-dwarf stars through radio, optical, near-infrared and time-domain observations.",
  supportingStatement:
    "Connecting stellar flares, starspots, chromospheric diagnostics and radio emission with the environments of planets orbiting low-mass stars.",
  thesisTitle: "Understanding Stellar Activity in M-dwarfs",
  thesisSubmitted: "4 February 2026",
  thesisStatus: "Ph.D. thesis submitted",
  researchTags: [
    "M-dwarf Magnetic Activity",
    "Stellar Flares",
    "Starspots",
    "TESS Photometry",
    "Optical Spectroscopy",
    "Near-Infrared Spectroscopy",
    "Radio Astronomy",
    "Exoplanetary Environments",
  ],
} as const;

// Only verified URLs listed. Unverified profiles are intentionally omitted
// (spec §6 — do not show inactive elements or guessed links).
export const profileLinks: Array<{
  label: string;
  url: string;
  ariaLabel: string;
  external?: boolean;
}> = [
  {
    label: "ORCID",
    url: "https://orcid.org/0009-0008-7884-3741",
    ariaLabel: "Diya Ram on ORCID (opens in new tab)",
    external: true,
  },
];

// Verified DOI URLs from the CV.
export const selectedOutputs = [
  {
    title:
      "Magnetic Activities of GJ 1151: Flares in TESS Data and Radio Observation in uGMRT",
    journal: "The Astrophysical Journal",
    year: "2025",
    doi: "https://doi.org/10.3847/1538-4357/ae145a",
    context:
      "A multi-wavelength investigation combining TESS flare analysis with low-frequency uGMRT radio observations.",
    firstAuthor: true,
  },
  {
    title:
      "Magnetic Activities of Wolf 359: Starspot Distribution and Quasiperiodic Pulsation Using TESS Data",
    journal: "The Astrophysical Journal",
    year: "2025",
    doi: "https://doi.org/10.3847/1538-4357/ade9a7",
    context:
      "A time-domain study of starspot behaviour and quasiperiodic signatures using TESS photometry.",
    firstAuthor: true,
  },
  {
    title:
      "Magnetic Activities of AD Leonis: Flares in TESS Data and Optical Spectra",
    journal: "The Astrophysical Journal",
    year: "2025",
    doi: "https://doi.org/10.3847/1538-4357/adabc3",
    context:
      "A combined photometric and optical spectroscopic study of an active nearby M dwarf.",
    firstAuthor: true,
  },
] as const;

export const acceptedManuscript = {
  title:
    "Probing the Magnetic Activity of GJ 398 through TESS Flare Detection and uGMRT Radio Observations",
  status: "Accepted manuscript",
} as const;

// Verified PI facility allocations (spec §15).
export const facilityAllocations = [
  {
    slug: "ugmrt",
    fullName: "upgraded Giant Metrewave Radio Telescope",
    shortName: "uGMRT",
    observatory: "NCRA-TIFR",
    allocation: "18 observing hours",
    allocationDetail: "across multiple cycles",
    proposalCodes: ["43_113", "44_107"],
    context:
      "Low-frequency radio observations provide a complementary probe of magnetic activity and emission processes in active M-dwarf systems.",
    cta: "Explore uGMRT",
    accent: "radio-teal",
  },
  {
    slug: "hct",
    fullName: "2-m Himalayan Chandra Telescope",
    shortName: "HCT",
    observatory: "Indian Astronomical Observatory · IIA",
    allocation: "14 observing nights",
    allocationDetail: "across multiple cycles",
    proposalCodes: [
      "HCT-2021-C3-P38",
      "HCT-2022-C1-P39",
      "HCT-2022-C2-P14",
      "HCT-2022-C3-P41",
      "HCT-2023-C1-P36",
      "HCT-2023-C2-P36",
      "HCT-2023-C3-P28",
    ],
    context:
      "Optical observations and time-series spectroscopy support studies of stellar flares, activity-sensitive spectral lines and changing stellar behaviour.",
    cta: "Explore HCT",
    accent: "spectral-cyan",
  },
  {
    slug: "dot",
    fullName: "3.6-m Devasthal Optical Telescope",
    shortName: "DOT",
    observatory: "ARIES",
    allocation: "40 observing hours",
    allocationDetail: "across multiple cycles",
    proposalCodes: [
      "DOT-2022-C1-P45",
      "DOT-2022-C2-P45",
      "DOT-2023-C1-P31",
      "DOT-2023-C2-P28",
      "DOT-2024-C1-P18",
    ],
    context:
      "Visible and near-infrared spectroscopic capabilities support multi-wavelength studies of magnetically active low-mass stars.",
    cta: "Explore DOT",
    accent: "stellar-gold",
  },
] as const;

// Verified academic trajectory (spec §16).
export const milestones = [
  {
    period: "2016",
    title: "Ranked First in B.Sc. Physics",
    detail: "Bangabasi Morning College, University of Calcutta.",
  },
  {
    period: "2016 – 2018",
    title: "M.Sc. Physics with Specialization in Astrophysics",
    detail: "St. Xavier's College, University of Calcutta.",
  },
  {
    period: "2016 – 2018",
    title: "Indira Gandhi Single Girl Child Scholarship",
    detail: "Awarded through the graduate programme.",
  },
  {
    period: "June 2019",
    title: "CSIR-UGC NET Junior Research Fellowship",
    detail: "All-India Rank 143. Also qualified for Lectureship.",
  },
  {
    period: "Jan 2020 – Dec 2021",
    title: "Junior Research Fellow",
    detail: "S. N. Bose National Centre for Basic Sciences.",
  },
  {
    period: "Jan 2022 – Dec 2025",
    title: "Senior Research Fellow",
    detail: "S. N. Bose National Centre for Basic Sciences.",
  },
  {
    period: "4 February 2026",
    title: "Ph.D. Thesis Submitted",
    detail: "Thesis: Understanding Stellar Activity in M-dwarfs.",
  },
  {
    period: "April 2026 – Present",
    title: "Bridge Fellow",
    detail:
      "Department of Astrophysics and High Energy Physics, S. N. Bose National Centre for Basic Sciences.",
  },
] as const;

// Research snapshot panels (spec §14).
export const snapshotPanels = [
  {
    title: "Scientific Focus",
    items: [
      "Magnetic activity of M-dwarf stars",
      "Stellar flares",
      "Starspots",
      "Rotational variability",
      "Chromospheric activity",
      "Star–planet interaction",
      "Exoplanetary environments",
    ],
  },
  {
    title: "Observational Methods",
    items: [
      "TESS photometry",
      "Optical spectroscopy",
      "Near-infrared spectroscopy",
      "Low-frequency radio observations",
      "Time-series analysis",
      "Multi-wavelength interpretation",
    ],
  },
  {
    title: "Facilities and Mission",
    items: [
      "upgraded Giant Metrewave Radio Telescope",
      "3.6-m Devasthal Optical Telescope",
      "2-m Himalayan Chandra Telescope",
      "Transiting Exoplanet Survey Satellite",
    ],
  },
] as const;

// Computational toolkit — expandable groups (spec §14 · panel 4).
export const toolkitGroups = [
  { label: "Programming", items: ["Python", "C"] },
  { label: "Radio reduction", items: ["CASA", "AIPS"] },
  {
    label: "Astronomy & photometry",
    items: [
      "Astropy",
      "Astroquery",
      "NumPy",
      "Lightkurve",
      "ALTAIPONY",
      "FLARING-SPI",
      "BASSMAN",
    ],
  },
  { label: "Spectroscopic reduction", items: ["IRAF"] },
  { label: "Scientific visualisation", items: ["Matplotlib", "GNUplot", "Xmgrace"] },
  { label: "Technical environment", items: ["Linux", "Windows", "LaTeX"] },
] as const;

// Expertise groups (spec §18).
export const expertiseGroups = [
  {
    title: "Stellar Astrophysics",
    items: [
      "M-dwarf magnetic activity",
      "Stellar flares",
      "Starspots",
      "Rotational modulation",
      "Chromospheric activity",
      "Quasiperiodic signatures",
    ],
  },
  {
    title: "Photometric Analysis",
    items: [
      "TESS light curves",
      "Flare detection",
      "Rotational variability",
      "Starspot analysis",
      "Time-series interpretation",
    ],
  },
  {
    title: "Spectroscopic Analysis",
    items: [
      "Optical spectroscopy",
      "Near-infrared spectroscopy",
      "Time-series spectroscopy",
      "Hα diagnostics",
      "Hβ diagnostics",
      "Ca II H and K diagnostics",
    ],
  },
  {
    title: "Radio Astronomy",
    items: [
      "uGMRT observations",
      "Low-frequency stellar radio studies",
      "CASA",
      "AIPS",
      "Radio-data reduction",
    ],
  },
  {
    title: "Scientific Computing",
    items: [
      "Python",
      "C",
      "Astropy",
      "Astroquery",
      "NumPy",
      "Lightkurve",
      "Matplotlib",
      "Linux",
    ],
  },
  {
    title: "Research Communication",
    items: [
      "Scientific writing",
      "Telescope proposal preparation",
      "Oral presentations",
      "Poster presentations",
      "Peer review",
      "Undergraduate teaching",
      "Student supervision",
    ],
  },
] as const;

// Research directions (spec §19).
export const researchDirections = [
  {
    title: "Magnetic Activity of M-dwarf Stars",
    description:
      "Investigating how low-mass stars produce and sustain magnetic phenomena observed through spots, flares, emission lines and radio signatures.",
    tags: ["Multi-wavelength", "M-dwarfs"],
    to: "/research",
  },
  {
    title: "Stellar Flares and Time-Domain Behaviour",
    description:
      "Characterizing flare activity, temporal evolution and short-timescale signatures using photometric and spectroscopic observations.",
    tags: ["TESS", "Time-domain"],
    to: "/research",
  },
  {
    title: "Starspots and Rotational Variability",
    description:
      "Using rotational modulation in stellar light curves to study surface inhomogeneities and changing spot distributions.",
    tags: ["Photometry", "Rotation"],
    to: "/research",
  },
  {
    title: "Chromospheric Spectral Diagnostics",
    description:
      "Examining activity-sensitive optical and near-infrared lines to trace the response of stellar atmospheres to magnetic processes.",
    tags: ["Hα · Hβ", "Ca II H & K"],
    to: "/research",
  },
  {
    title: "Low-Frequency Stellar Radio Emission",
    description:
      "Using uGMRT observations to investigate radio emission associated with magnetic activity in nearby low-mass stars.",
    tags: ["uGMRT", "Radio"],
    to: "/research",
  },
  {
    title: "Stellar Activity and Planetary Environments",
    description:
      "Exploring how magnetic activity and energetic events from M-dwarf hosts may influence exoplanet atmospheres, habitability and evolution.",
    tags: ["Star–Planet", "Habitability"],
    to: "/research",
  },
] as const;

// Research activity indicators (spec §21) — verified values only.
export const activityIndicators = [
  { value: "6", label: "Journal publications listed" },
  { value: "3", label: "First-author journal publications listed" },
  { value: "2", label: "Conference proceedings" },
  { value: "1", label: "Accepted first-author manuscript listed separately" },
  { value: "3", label: "Principal Investigator facilities" },
  { value: "14 nights", label: "Awarded on HCT" },
  { value: "18 hours", label: "Awarded on uGMRT" },
  { value: "40 hours", label: "Awarded on DOT" },
  { value: "2", label: "Master's-level students supervised or co-supervised" },
  { value: "1", label: "Manuscript peer-review service listed" },
] as const;

// Professional contributions (spec §22).
export const contributions = [
  {
    title: "Teaching",
    body:
      "Guest Lecturer in Physics at Bangabasi Morning College from July 2018 to December 2019. Taught Classical Mechanics, Elasticity, Viscosity, Surface Tension, and undergraduate physics laboratory instruction.",
  },
  {
    title: "Academic Assessment",
    body:
      "External Examiner for undergraduate practical physics examinations; university examination answer-script evaluation.",
  },
  {
    title: "Peer Review",
    body:
      "Reviewed a manuscript for an American Astronomical Society journal in 2025.",
  },
  {
    title: "Conference Service",
    body:
      "Local Organising Committee member for Star Formation Studies in India, hosted by S. N. Bose National Centre for Basic Sciences in January 2024.",
  },
  {
    title: "Student Mentorship",
    body:
      "Supervised or co-supervised two Master's-level summer research students in 2026.",
  },
] as const;

// Audience pathways (spec §24) — all links map to existing routes.
export const audiencePathways = [
  {
    title: "For Researchers",
    description:
      "Review publications, research themes and active scientific projects.",
    links: [
      { label: "Publications", to: "/publications" },
      { label: "Research Areas", to: "/research" },
      { label: "Projects", to: "/projects" },
    ],
  },
  {
    title: "For Collaborators",
    description:
      "Explore observational facilities, methods and collaboration interests.",
    links: [
      { label: "Facilities", to: "/facilities" },
      { label: "Observations", to: "/observations" },
      { label: "Contact", to: "/contact" },
    ],
  },
  {
    title: "For Students",
    description:
      "Follow Diya's academic journey, teaching experience and research development.",
    links: [
      { label: "Academic Journey", to: "/academic-journey" },
      { label: "Teaching", to: "/teaching" },
      { label: "Downloads", to: "/downloads" },
    ],
  },
  {
    title: "For General Visitors",
    description:
      "Discover the science of M-dwarfs, magnetic activity and multi-wavelength astronomy.",
    links: [
      { label: "Research Universe", to: "/research-universe" },
      { label: "Gallery", to: "/gallery" },
      { label: "News", to: "/news" },
    ],
  },
] as const;

// Assets marked as unresolved per spec §35 — for the implementation summary.
export const unresolvedAssets = [
  "Verified portrait photograph of Diya Ram (WhatsApp Image 2026-07-19 at 21.30.29.jpeg was referenced but not uploaded).",
  "Official uGMRT / NCRA-TIFR photograph (using labelled fallback tile).",
  "Official HCT / IIA photograph (using labelled fallback tile).",
  "Official DOT / ARIES photograph (using labelled fallback tile).",
  "Verified NASA ADS, Google Scholar, ResearchGate, LinkedIn and institutional profile URLs (only ORCID is currently verified).",
  "Public professional email address for collaboration CTA.",
] as const;

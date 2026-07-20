// Structured, single-source content for the About & Research Profile page.
// All values verified against Diya Ram's CV (Research_Statement_4_CV-Diya.pdf)
// and PhD thesis (Understanding Stellar Activity in M-dwarfs, 2026). No unverified fields.

import ugmrtImg from "@/assets/facility-ugmrt.jpg";
import hctImg from "@/assets/facility-hct.jpg";
import dotImg from "@/assets/facility-dot.jpg";
import cvAsset from "@/assets/diya-ram-cv.pdf.asset.json";

export const cvDownloadUrl = cvAsset.url;

export const aboutIdentity = {
  eyebrow: "About & Research Profile",
  name: "Diya Ram",
  primaryTitle: "Observational Astrophysicist",
  role: "Bridge Fellow",
  institution: "S. N. Bose National Centre for Basic Sciences",
  department: "Department of Astrophysics and High Energy Physics",
  position:
    "Bridge Fellow · Observational Stellar Astrophysics · S. N. Bose National Centre for Basic Sciences",
  headline:
    "Scientist, observer and storyteller of magnetically active small stars",
  primaryStatement:
    "Diya studies the magnetic behaviour of M-dwarf stars using time-domain photometry, optical and near-infrared spectroscopy, and low-frequency radio observations.",
  supportingStatement:
    "Her work connects stellar flares, starspots, chromospheric diagnostics and radio emission with the environments of planets orbiting low-mass stars.",
  thesisTitle: "Understanding Stellar Activity in M-dwarfs",
  thesisSubmitted: "4 February 2026",
  thesisStatus:
    "PhD thesis submitted. Defence forthcoming. Degree will be awarded upon successful completion of University requirements.",
  researchTags: [
    "M-dwarf Magnetic Activity",
    "Stellar Flares",
    "Starspots",
    "TESS Photometry",
    "Optical Spectroscopy",
    "Radio Astronomy",
    "Star–Planet Interaction",
  ],
} as const;

// --- Biography (composed for the About page, verified against CV) --------
export const biography = [
  "Diya Ram is an observational astrophysicist whose research explores the magnetic behaviour of M-dwarf stars and the environments they create around orbiting planets. Her work combines time-domain photometry, optical and near-infrared spectroscopy, and low-frequency radio observations to investigate stellar flares, starspots, chromospheric activity, rotational variability and the physical processes associated with stellar magnetic fields.",
  "She completed her Bachelor of Science in Physics at Bangabasi Morning College, University of Calcutta, where she ranked first in her class, and subsequently earned a Master of Science in Physics with a specialization in Astrophysics from St. Xavier's College, Kolkata. In 2019, she qualified the CSIR–UGC National Eligibility Test with an All-India Rank of 143 and received both the Junior Research Fellowship and Lectureship awards.",
  "Diya began her doctoral research in 2020 at the S. N. Bose National Centre for Basic Sciences under the supervision of Professor Soumen Mondal. Her PhD developed a multi-wavelength view of magnetic activity in nearby M dwarfs by bringing together observations from the Transiting Exoplanet Survey Satellite, optical spectroscopic facilities and the upgraded Giant Metrewave Radio Telescope. Through this work she has examined flare energetics, starspot distributions, chromospheric diagnostics, quasi-periodic behaviour and possible radio signatures associated with magnetic processes.",
  "Her observational programme has included competitively awarded telescope time as Principal Investigator on the 2-m Himalayan Chandra Telescope, the 3.6-m Devasthal Optical Telescope and the upgraded Giant Metrewave Radio Telescope. Alongside her research, she has contributed to undergraduate teaching, student supervision, professional peer review and scientific-event organisation.",
  "Following the submission of her PhD thesis in February 2026, Diya joined the S. N. Bose National Centre for Basic Sciences as a Bridge Fellow. Her current scientific direction focuses on developing a more complete understanding of how magnetic activity evolves across M-dwarf systems and how stellar radiation, energetic events and magnetic environments may influence exoplanet atmospheres, habitability and star–planet interactions.",
] as const;

export const credentialRail = [
  { label: "Current role", value: "Bridge Fellow" },
  { label: "Institution", value: "S. N. Bose National Centre for Basic Sciences" },
  { label: "Research field", value: "Observational stellar astrophysics" },
  { label: "PhD supervisor", value: "Prof. Soumen Mondal" },
  { label: "Thesis submitted", value: "4 February 2026" },
  { label: "National fellowship", value: "CSIR–UGC NET JRF (AIR 143, 2019)" },
  { label: "Primary facilities", value: "TESS · uGMRT · HCT · DOT" },
] as const;

// Verified researcher profiles. Used across About, Contact, Footer and
// the Person JSON-LD sameAs array.
export const profileLinks: Array<{
  label: string;
  url: string;
  ariaLabel: string;
  external?: boolean;
}> = [
  {
    label: "ORCID",
    url: "https://orcid.org/0009-0008-7884-3741",
    ariaLabel: "View Diya Ram on ORCID (opens in new tab)",
    external: true,
  },
  {
    label: "NASA ADS",
    url: "https://ui.adsabs.harvard.edu/search/filter_database_fq_database=AND&filter_database_fq_database=((database%3Aastronomy%20OR%20database%3Aphysics))&filter_database_fq_database=database%3A%22astronomy%22&fq=%7B!type%3Daqp%20v%3D%24fq_database%7D&fq_database=(((database%3Aastronomy%20OR%20database%3Aphysics))%20AND%20database%3A%22astronomy%22)&p_=0&q=%20author%3A%22ram%2Cdiya%22&sort=date%20desc%2C%20bibcode%20desc",
    ariaLabel: "View Diya Ram publications on NASA ADS (opens in new tab)",
    external: true,
  },
  {
    label: "Google Scholar",
    url: "https://scholar.google.com/scholar?hl=en&as_sdt=0%2C5&q=Diya+Ram&btnG=",
    ariaLabel: "View Diya Ram on Google Scholar (opens in new tab)",
    external: true,
  },
  {
    label: "ResearchGate",
    url: "https://www.researchgate.net/profile/Diya-Ram-2",
    ariaLabel: "View Diya Ram on ResearchGate (opens in new tab)",
    external: true,
  },
  {
    label: "LinkedIn",
    url: "https://www.linkedin.com/in/diya-ram-638854172/",
    ariaLabel: "View Diya Ram on LinkedIn (opens in new tab)",
    external: true,
  },
];

export const profileSameAs = [
  "https://orcid.org/0009-0008-7884-3741",
  "https://ui.adsabs.harvard.edu/search/q=author%3A%22ram%2Cdiya%22&sort=date%20desc",
  "https://scholar.google.com/scholar?q=Diya+Ram",
  "https://www.researchgate.net/profile/Diya-Ram-2",
  "https://www.linkedin.com/in/diya-ram-638854172/",
];

// --- Six principal research themes, mapped to existing research routes ---
export const researchThemes = [
  {
    slug: "m-dwarf-magnetic-activity",
    title: "M-dwarf Magnetic Activity",
    summary:
      "Characterising how low-mass stars generate and sustain magnetic phenomena visible across spots, flares, chromospheric lines and radio signatures.",
    method: "Multi-wavelength observations",
    accent: "mdwarf",
  },
  {
    slug: "stellar-flares",
    title: "Stellar Flares and Flare Energetics",
    summary:
      "Detecting flares, estimating their energies and probing the magnetic reconnection processes that power them.",
    method: "TESS photometry · optical spectroscopy",
    accent: "solar",
  },
  {
    slug: "stellar-rotation-and-starspots",
    title: "Rotation and Starspot Evolution",
    summary:
      "Using rotational modulation in stellar light curves to trace surface inhomogeneities and how spot configurations change over time.",
    method: "Photometric periodograms · BASSMAN spot modelling",
    accent: "aurora",
  },
  {
    slug: "optical-and-near-infrared-spectroscopy",
    title: "Chromospheric Spectral Diagnostics",
    summary:
      "Reading activity-sensitive optical and near-infrared lines — Hα, Hβ, Ca II H & K — to trace how stellar atmospheres respond to magnetic processes.",
    method: "Time-series spectroscopy",
    accent: "spectral-cyan",
  },
  {
    slug: "radio-astronomy-of-cool-stars",
    title: "Low-Frequency Stellar Radio Emission",
    summary:
      "Using uGMRT observations to investigate coherent and incoherent radio emission associated with magnetic activity in nearby M dwarfs.",
    method: "uGMRT band-3 / band-4 imaging",
    accent: "radio-teal",
  },
  {
    slug: "exoplanet-habitability-and-star-planet-interaction",
    title: "Exoplanet Environments & Star–Planet Interaction",
    summary:
      "Exploring how magnetic activity, flares and radio signatures from M-dwarf hosts may shape planetary atmospheres and habitability.",
    method: "Cross-domain synthesis",
    accent: "uv-violet",
  },
] as const;

// --- Current scientific questions (spec §5) ------------------------------
export const currentQuestions = [
  "How do flare rates and energies vary across active M dwarfs?",
  "How do starspot configurations evolve over multiple rotational cycles?",
  "Which optical spectral diagnostics best trace quiescent and flaring activity?",
  "What radio-emission mechanisms operate in magnetically active M dwarfs?",
  "How can photometric, spectroscopic and radio observations be combined into one coherent picture?",
  "How might magnetic activity alter the interpretation of exoplanet environments?",
] as const;

// --- Toolkit grouped by category, verified from CV -----------------------
export const toolkitGroups = [
  { label: "Programming", items: ["Python", "C"] },
  {
    label: "Scientific Python & query tools",
    items: ["Astropy", "Astroquery", "NumPy", "Lightkurve", "Matplotlib"],
  },
  {
    label: "Photometric & flare analysis",
    items: ["ALTAIPONY", "FLARING-SPI", "BASSMAN"],
  },
  {
    label: "Optical & radio data reduction",
    items: ["IRAF", "AIPS", "CASA"],
  },
  {
    label: "Scientific plotting & writing",
    items: ["GNUplot", "Xmgrace", "LaTeX"],
  },
  { label: "Operating environments", items: ["Linux", "Windows"] },
] as const;

// --- Verified PI facility allocations with local artistic imagery --------
export const facilityAllocations = [
  {
    slug: "ugmrt",
    fullName: "upgraded Giant Metrewave Radio Telescope",
    shortName: "uGMRT",
    observatory: "NCRA-TIFR",
    location: "Khodad, Pune, India",
    allocation: "18 observing hours",
    allocationDetail: "across multiple cycles",
    proposalCodes: ["43_113", "44_107"],
    role: "Low-frequency radio observations of coherent and incoherent stellar magnetic activity, and searches for radio signatures potentially linked to star–planet interaction.",
    image: ugmrtImg,
    imageCredit: "Artistic visualisation · Diya Ram Portfolio",
    officialUrl: "https://www.ncra.tifr.res.in/ncra/gmrt",
    cta: "Explore uGMRT",
    accent: "radio-teal",
  },
  {
    slug: "hct",
    fullName: "2-m Himalayan Chandra Telescope",
    shortName: "HCT",
    observatory: "Indian Astronomical Observatory · IIA",
    location: "Hanle, Ladakh, India",
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
    role: "Optical photometry and time-series spectroscopy of stellar flares, activity-sensitive spectral lines and long-baseline monitoring of magnetically active M dwarfs.",
    image: hctImg,
    imageCredit: "Artistic visualisation · Diya Ram Portfolio",
    officialUrl: "https://www.iiap.res.in/centers/iao/",
    cta: "Explore HCT",
    accent: "spectral-cyan",
  },
  {
    slug: "dot",
    fullName: "3.6-m Devasthal Optical Telescope",
    shortName: "DOT",
    observatory: "ARIES",
    location: "Devasthal, Uttarakhand, India",
    allocation: "40 observing hours",
    allocationDetail: "across multiple cycles",
    proposalCodes: [
      "DOT-2022-C1-P45",
      "DOT-2022-C2-P45",
      "DOT-2023-C1-P31",
      "DOT-2023-C2-P28",
      "DOT-2024-C1-P18",
    ],
    role: "Deep optical and near-infrared spectroscopy supporting multi-wavelength studies of magnetically active low-mass stars.",
    image: dotImg,
    imageCredit: "Artistic visualisation · Diya Ram Portfolio",
    officialUrl: "https://www.aries.res.in/facilities/astronomical-telescopes/360cm-telescope",
    cta: "Explore DOT",
    accent: "stellar-gold",
  },
] as const;

// --- PhD thesis spotlight (verified from thesis PDF) ---------------------
export const thesis = {
  title: "Understanding Stellar Activity in M-dwarfs",
  degree: "Doctor of Philosophy (Science) in Physics (Experimental)",
  author: "Diya Ram",
  institution: "S. N. Bose National Centre for Basic Sciences",
  university: "University of Calcutta",
  department: "Department of Physics",
  supervisor: "Prof. Soumen Mondal",
  submitted: "4 February 2026",
  status:
    "PhD thesis submitted. Defence forthcoming. Degree will be awarded upon successful completion of University requirements.",
  overview:
    "The thesis develops a multi-wavelength observational picture of magnetic activity in nearby M-dwarf stars. It brings together time-domain photometry from the Transiting Exoplanet Survey Satellite, optical spectroscopy from ground-based facilities and low-frequency radio observations with the upgraded Giant Metrewave Radio Telescope to study flare energetics, starspot distributions, chromospheric diagnostics and possible radio signatures associated with stellar magnetic processes.",
  themes: [
    "Photometric flare detection and energy estimation",
    "Rotation periods and starspot distribution modelling",
    "Chromospheric line diagnostics",
    "Estimation of magnetic fields from flare events",
    "Low-frequency radio observations and non-detections",
    "Implications for planetary environments around active M dwarfs",
  ],
  targets: ["AD Leonis", "Wolf 359", "GJ 1151", "GJ 398"],
  facilities: ["TESS", "2-m HCT (HFOSC)", "3.6-m DOT", "uGMRT"],
  chapters: [
    "Introduction to M-dwarfs, magnetic fields and stellar activity",
    "Instruments and observational methods",
    "Magnetic activities of AD Leonis — flares in TESS and optical spectra",
    "Magnetic activities of Wolf 359 — starspot distribution and quasi-periodic pulsation",
    "Magnetic activities of GJ 1151 — TESS flares and uGMRT radio observations",
    "Probing the magnetic activity of GJ 398 with TESS and uGMRT",
    "Thesis summary and scope for future work",
  ],
} as const;

// --- Verified academic trajectory ---------------------------------------
export const milestones = [
  {
    period: "2013 – 2016",
    title: "B.Sc. Physics · Ranked First",
    detail:
      "Bangabasi Morning College, University of Calcutta. First rank in B.Sc. Physics (2016).",
  },
  {
    period: "2016 – 2018",
    title: "M.Sc. Physics with Astrophysics Specialization",
    detail:
      "St. Xavier's College, University of Calcutta. Awarded the Indira Gandhi Single Girl Child Scholarship.",
  },
  {
    period: "June 2019",
    title: "CSIR–UGC NET · JRF + Lectureship",
    detail: "All-India Rank 143 in the CSIR-UGC NET; JRF and Lectureship awards.",
  },
  {
    period: "Jan 2020 – Dec 2021",
    title: "Junior Research Fellow",
    detail: "S. N. Bose National Centre for Basic Sciences, Kolkata.",
  },
  {
    period: "Jan 2022 – Dec 2025",
    title: "Senior Research Fellow",
    detail: "S. N. Bose National Centre for Basic Sciences, Kolkata.",
  },
  {
    period: "4 February 2026",
    title: "PhD Thesis Submitted",
    detail:
      "Understanding Stellar Activity in M-dwarfs. Supervisor: Prof. Soumen Mondal.",
  },
  {
    period: "April 2026 – Present",
    title: "Bridge Fellow",
    detail:
      "Department of Astrophysics and High Energy Physics, S. N. Bose National Centre for Basic Sciences.",
  },
] as const;

// --- Selected scholarly contributions (verified from CV) -----------------
export const selectedOutputs = [
  {
    title:
      "Magnetic Activities of GJ 1151: Flares in TESS Data and Radio Observation in uGMRT",
    journal: "The Astrophysical Journal",
    year: "2025",
    volume: "994, 120",
    doi: "https://doi.org/10.3847/1538-4357/ae145a",
    role: "First author",
    context:
      "Multi-wavelength study combining TESS flare analysis with uGMRT radio observations of GJ 1151.",
  },
  {
    title:
      "Magnetic Activities of Wolf 359: Starspot Distribution and Quasiperiodic Pulsation Using TESS Data",
    journal: "The Astrophysical Journal",
    year: "2025",
    volume: "988, 257",
    doi: "https://doi.org/10.3847/1538-4357/ade9a7",
    role: "First author",
    context:
      "Time-domain study of starspot behaviour and quasi-periodic signatures in Wolf 359 using TESS photometry.",
  },
  {
    title:
      "Magnetic Activities of AD Leonis: Flares in TESS Data and Optical Spectra",
    journal: "The Astrophysical Journal",
    year: "2025",
    volume: "980, 196",
    doi: "https://doi.org/10.3847/1538-4357/adabc3",
    role: "First author",
    context:
      "Combined photometric and optical spectroscopic study of the nearby active M dwarf AD Leonis.",
  },
  {
    title:
      "Understanding the Magnetic Activity of M Dwarfs: Optical and Near-Infrared Spectroscopic Studies",
    journal: "Conference Proceedings",
    year: "2024",
    volume: "Vol. 93, pp. 358–369",
    doi: "https://doi.org/10.25518/0037-9565.11717",
    role: "First author · Proceedings",
    context:
      "Proceedings contribution summarising optical and near-infrared spectroscopic studies of M-dwarf activity.",
  },
] as const;

export const acceptedManuscript = {
  title:
    "Probing the Magnetic Activity of GJ 398 through TESS Flare Detection and uGMRT Radio Observations",
  status: "Accepted manuscript · The Astrophysical Journal",
  note: "Final DOI will be linked once the article is released.",
} as const;

// --- Shared statistics (derived where possible) --------------------------
export const activityIndicators = [
  { value: "6", label: "Journal publications" },
  { value: "3", label: "First-author journal publications" },
  { value: "2", label: "Conference proceedings" },
  { value: "1", label: "Accepted first-author manuscript" },
  { value: "3", label: "PI facilities" },
  { value: "14 nights", label: "HCT observing time (PI)" },
  { value: "18 hours", label: "uGMRT observing time (PI)" },
  { value: "40 hours", label: "DOT observing time (PI)" },
  { value: "2", label: "Master's students mentored" },
  { value: "1", label: "AAS journal manuscript review" },
] as const;

// --- Teaching, mentorship and professional service (verified from CV) ----
export const contributions = [
  {
    title: "Teaching",
    body:
      "Guest Lecturer in Physics at Bangabasi Morning College (July 2018 – December 2019). Taught Classical Mechanics to B.Sc. (Honours) students and Elasticity, Viscosity and Surface Tension to B.Sc. (Pass) students. Delivered theory lectures and undergraduate physics laboratory instruction.",
  },
  {
    title: "Academic Assessment",
    body:
      "Served as External Examiner for B.Sc. Physics Practical Examinations and evaluated undergraduate university examination answer scripts in Physics.",
  },
  {
    title: "Peer Review",
    body:
      "Reviewed a manuscript for an American Astronomical Society journal in 2025 on the magnetic activity of ultracool dwarfs in the LAMOST DR11 sample.",
  },
  {
    title: "Conference Organisation",
    body:
      "Local Organising Committee member for Star Formation Studies in India, S. N. Bose National Centre for Basic Sciences, 8–11 January 2024.",
  },
  {
    title: "Student Mentorship",
    body:
      "Supervised two Master's-level Summer Research Programme projects in 2026 — Rishav De (formerly M.Sc., IIT Bombay) and Sristi Ganguly (formerly M.Sc., St. Xavier's College, Kolkata).",
  },
  {
    title: "Recent Talks",
    body:
      "Oral presentations at Bose Fest 2023 and Bose Fest 2025; poster presentations at the 21st National Space Science Symposium (2024) and the 3rd BINA Workshop (2023).",
  },
] as const;

// --- Audience pathways (kept for closing navigation) ---------------------
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

// --- Snapshot panels retained but slightly refined -----------------------
export const snapshotPanels = [
  {
    title: "Scientific Focus",
    items: [
      "M-dwarf magnetic activity",
      "Stellar flares and energetics",
      "Starspots and rotational variability",
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
    title: "Facilities & Missions",
    items: [
      "upgraded Giant Metrewave Radio Telescope",
      "3.6-m Devasthal Optical Telescope",
      "2-m Himalayan Chandra Telescope",
      "Transiting Exoplanet Survey Satellite",
    ],
  },
] as const;

// Kept for backward-compat — expertise groups reuse toolkit / theme data.
export const expertiseGroups = [
  {
    title: "Stellar Astrophysics",
    items: [
      "M-dwarf magnetic activity",
      "Stellar flares",
      "Starspots",
      "Rotational modulation",
      "Chromospheric activity",
      "Quasi-periodic signatures",
    ],
  },
  {
    title: "Photometric Analysis",
    items: [
      "TESS light curves",
      "Flare detection",
      "Rotational variability",
      "Starspot modelling",
      "Time-series interpretation",
    ],
  },
  {
    title: "Spectroscopic Analysis",
    items: [
      "Optical spectroscopy",
      "Near-infrared spectroscopy",
      "Time-series spectroscopy",
      "Hα · Hβ diagnostics",
      "Ca II H & K diagnostics",
    ],
  },
  {
    title: "Radio Astronomy",
    items: [
      "uGMRT observations",
      "Low-frequency stellar radio studies",
      "CASA · AIPS reduction",
      "Interferometric imaging",
    ],
  },
  {
    title: "Scientific Computing",
    items: ["Python", "C", "Astropy", "NumPy", "Lightkurve", "Matplotlib", "Linux"],
  },
  {
    title: "Research Communication",
    items: [
      "Scientific writing",
      "Telescope proposal preparation",
      "Oral & poster presentations",
      "Peer review",
      "Undergraduate teaching",
    ],
  },
] as const;

// --- Table of contents anchors -------------------------------------------
export const aboutSections = [
  { id: "profile", label: "Profile" },
  { id: "biography", label: "Biography" },
  { id: "research", label: "Research" },
  { id: "questions", label: "Questions" },
  { id: "methods", label: "Methods" },
  { id: "facilities", label: "Facilities" },
  { id: "thesis", label: "Thesis" },
  { id: "journey", label: "Journey" },
  { id: "publications", label: "Publications" },
  { id: "teaching", label: "Teaching" },
  { id: "collaboration", label: "Collaboration" },
] as const;

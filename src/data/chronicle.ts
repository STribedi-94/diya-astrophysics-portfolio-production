// Research Chronicle — a living scientific mission log.
// SINGLE SOURCE OF TRUTH for the News & Updates page.
//
// Every record below is derived from already-verified project data:
//   • src/data/publications-archive.ts  (bibliography, DOIs, ADS links, PDFs)
//   • src/data/conferences.ts           (events, exact dates, venues)
//   • src/data/gallery.ts               (photographic archive + captions/dates)
//   • src/data/about.ts                 (profile, thesis, service, teaching)
//   • src/data/journey.ts               (career phases)
//
// No dates, results, awards, appointments or collaborations are invented.
// Where a verified exact date does not exist, the record is marked `undated`
// and excluded from the chronological timeline rather than given a fake date.

import {
  publicationsArchive,
  formatPlainCitation,
  formatBibtex,
  type PublicationRecord,
} from "./publications-archive";
import { conferenceRecords, type ConferenceRecord } from "./conferences";
import { gallery } from "./gallery";
import { aboutIdentity } from "./about";

import thumbGj1151 from "@/assets/thumbs/gj1151-first-page.jpg.asset.json";
import thumbWolf359 from "@/assets/thumbs/wolf359-first-page.jpg.asset.json";
import thumbAdleo from "@/assets/thumbs/adleo-first-page.jpg.asset.json";
import thumbGj398 from "@/assets/thumbs/gj398-first-page.jpg.asset.json";
import thumbProcSpectro from "@/assets/thumbs/proc-mdwarf-spectro-first-page.jpg.asset.json";
import thumbTic from "@/assets/thumbs/tic272272592-first-page.jpg.asset.json";
import thumbTwoYoung from "@/assets/thumbs/two-young-mstars-first-page.jpg.asset.json";
import thumbTaurus from "@/assets/thumbs/taurus-brown-dwarfs-first-page.jpg.asset.json";
import thumbProcBd from "@/assets/thumbs/proc-young-bd-superflares-first-page.jpg.asset.json";

/* ------------------------------------------------------------------ types */

export type ChronicleCategory =
  | "Publications"
  | "Observations"
  | "Conferences"
  | "Thesis & Academic Milestones"
  | "Teaching & Mentoring"
  | "Peer Review"
  | "Awards & Recognition"
  | "Career"
  | "Upcoming Missions";

export type ChronicleStatus =
  | "Published"
  | "Accepted"
  | "Completed"
  | "Active"
  | "In Progress"
  | "Confirmed"
  | "Long-Term Vision";

export type SourceLabel =
  | "Verified Publication Record"
  | "Verified Institutional Milestone"
  | "Verified Conference Record"
  | "Public Academic Record"
  | "Personal Research Archive";

export type RelatedLink = {
  to: string;
  params?: Record<string, string>;
  label: string;
};

export type ChronicleRecord = {
  id: string;
  slug: string;
  title: string;
  shortTitle: string;
  category: ChronicleCategory;
  status: ChronicleStatus;
  /** ISO date used only for ordering; precision is described by `datePrecision`. */
  eventDate: string;
  dateLabel: string;
  datePrecision: "day" | "month" | "year" | "range" | "none";
  /** True when no verified exact date exists — excluded from the timeline. */
  undated?: boolean;
  year?: number;
  summary: string;
  fullStory?: string[];
  plainLanguageSummary?: string;
  whyItMatters?: string;
  institution?: string;
  facility?: string[];
  location?: string;
  researchTheme?: string[];
  collaborators?: string[];
  tags: string[];
  image?: string;
  imageAlt?: string;
  imageCredit?: string;
  imageOrientation?: "landscape" | "portrait";
  officialExternalLink?: { label: string; url: string };
  doi?: string;
  doiUrl?: string;
  adsUrl?: string;
  accessStatus?: string;
  sourceLabel: SourceLabel;
  related: RelatedLink[];
  featured?: boolean;
  milestoneOfYear?: boolean;
  sortPriority?: number;
  publicationId?: string;
  conferenceId?: string;
  galleryId?: string;
  /** Chronicle ids this record is scientifically connected to. */
  connections?: string[];
};

/* --------------------------------------------------------------- helpers */

const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

function monthIndex(name: string): number {
  const i = MONTHS.findIndex((m) => m.toLowerCase() === name.trim().toLowerCase());
  return i < 0 ? 0 : i;
}

function iso(year: number, month = 0, day = 1): string {
  return `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
}

/** Parses verified CV date strings such as "26 February – 1 March 2024". */
function parseEventDate(dateStr: string, fallbackYear: number): string {
  const yearMatch = dateStr.match(/(\d{4})/);
  const year = yearMatch ? Number(yearMatch[1]) : fallbackYear;
  const dayMatch = dateStr.match(/(\d{1,2})\s*[–\-—]?\s*/);
  const monthMatch = dateStr.match(
    /(January|February|March|April|May|June|July|August|September|October|November|December)/,
  );
  const day = dayMatch ? Math.min(Number(dayMatch[1]), 31) : 1;
  return iso(year, monthMatch ? monthIndex(monthMatch[1]) : 0, day);
}

const galleryById = new Map(gallery.map((g) => [g.id, g]));

function galleryImage(id?: string) {
  if (!id) return {};
  const g = galleryById.get(id);
  if (!g) return {};
  return {
    image: g.src,
    imageAlt: g.alt,
    imageOrientation: g.orientation,
    imageCredit: "Personal research archive — Diya Ram.",
    galleryId: g.id,
  };
}

const PUB_THUMB: Record<string, string> = {
  gj1151: thumbGj1151.url,
  wolf359: thumbWolf359.url,
  adleo: thumbAdleo.url,
  gj398: thumbGj398.url,
  "proc-mdwarf-spectro": thumbProcSpectro.url,
  tic272272592: thumbTic.url,
  "two-young-mstars": thumbTwoYoung.url,
  "taurus-brown-dwarfs": thumbTaurus.url,
  "proc-young-bd-superflares": thumbProcBd.url,
};

/** Verified, cautiously-worded significance notes for major publications. */
const PUB_WHY: Record<string, string> = {
  gj1151:
    "GJ 1151 had previously been considered optically inactive. Detecting flares in TESS photometry while placing a deep limit on its low-frequency radio emission tightens the observational constraints used when testing star–planet interaction scenarios around quiet M dwarfs.",
  wolf359:
    "Wolf 359 is one of the nearest stars to the Sun, so its flare and starspot behaviour is directly relevant to the radiation environment of any planet around a very low-mass star. The first detection of quasi-periodic pulsations on this star adds a rare data point for flare-loop physics beyond the Sun.",
  adleo:
    "Combining TESS photometry with optical spectroscopy links flare energetics to chromospheric line behaviour on a benchmark active M dwarf, strengthening the methodology used across the wider thesis programme.",
  gj398:
    "Extending the TESS-plus-uGMRT approach to a further M-dwarf target broadens the small sample of low-mass stars with simultaneous optical flare statistics and low-frequency radio constraints.",
  "proc-mdwarf-spectro":
    "Publishing the spectroscopic methodology as a proceedings contribution makes the activity-diagnostic approach available to the wider stellar-activity community.",
};

/* -------------------------------------------------- publication records */

function publicationToRecord(p: PublicationRecord): ChronicleRecord {
  const isFirst = p.role === "First Author";
  const hasMonth = Boolean(p.month);
  const status: ChronicleStatus = p.status === "Accepted" ? "Accepted" : "Published";

  const related: RelatedLink[] = [
    { to: "/publications/$slug", params: { slug: p.slug }, label: "Open publication record" },
    { to: "/downloads", label: "Open in the Research Vault" },
    { to: "/research", label: "Explore research themes" },
  ];
  if (p.instruments.some((i) => i.includes("uGMRT") || i.includes("HCT") || i.includes("DOT"))) {
    related.push({ to: "/observations", label: "See the observing programme" });
  }

  return {
    id: `pub-${p.id}`,
    slug: `${p.slug}-published`,
    title: p.title,
    shortTitle: p.targets[0] ? `${p.targets[0]} — ${p.type === "Proceeding" ? "proceedings" : "journal paper"}` : p.title,
    category: "Publications",
    status,
    eventDate: iso(p.year, hasMonth ? monthIndex(p.month) : 0, 1),
    dateLabel: hasMonth ? `${p.month} ${p.year}` : String(p.year),
    datePrecision: hasMonth ? "month" : "year",
    year: p.year,
    summary: p.shortSummary,
    fullStory: p.abstract ? [p.abstract] : undefined,
    plainLanguageSummary: p.keyFindings?.[0],
    whyItMatters: PUB_WHY[p.id],
    institution: "S. N. Bose National Centre for Basic Sciences",
    facility: p.instruments,
    researchTheme: p.themes,
    collaborators: p.authors.filter((a) => a !== "Diya Ram"),
    tags: [
      isFirst ? "First author" : `Co-author (position ${p.diyaAuthorPosition})`,
      p.journal,
      ...p.targets,
    ],
    image: PUB_THUMB[p.id],
    imageAlt: `First page of the paper “${p.title}”.`,
    imageOrientation: "portrait",
    imageCredit: "Author manuscript first page.",
    doi: p.doi || undefined,
    doiUrl: p.doiUrl || undefined,
    adsUrl: p.adsUrl,
    accessStatus: p.pdfUrl ? "Preview and download available" : "Official publisher access",
    officialExternalLink: p.doiUrl
      ? { label: "Publisher record (DOI)", url: p.doiUrl }
      : p.adsUrl
        ? { label: "NASA ADS record", url: p.adsUrl }
        : undefined,
    sourceLabel: "Verified Publication Record",
    related,
    featured: p.featured && isFirst,
    publicationId: p.id,
    sortPriority: isFirst ? 2 : 1,
  };
}

const publicationChronicle = publicationsArchive.map(publicationToRecord);

/* --------------------------------------------------- conference records */

function conferenceToRecord(c: ConferenceRecord): ChronicleRecord {
  const gid = c.galleryIds?.[0];
  const related: RelatedLink[] = [
    { to: "/conferences", label: "Open conference archive" },
  ];
  if (gid) related.push({ to: "/gallery", label: "View gallery record" });
  if (c.relatedPublicationSlug) {
    related.push({
      to: "/publications/$slug",
      params: { slug: c.relatedPublicationSlug },
      label: "Related publication",
    });
  }
  if (c.relatedAreaSlug) {
    related.push({ to: "/research/$slug", params: { slug: c.relatedAreaSlug }, label: "Research theme" });
  }

  const headline =
    c.title ??
    `${c.type} — ${c.event}`;

  return {
    id: `conf-${c.id}`,
    slug: `${c.id}-${c.type.toLowerCase().replace(/\s+/g, "-")}`,
    title: headline,
    shortTitle: `${c.event} · ${c.type}`,
    category: "Conferences",
    status: "Completed",
    eventDate: parseEventDate(c.date, c.year),
    dateLabel: c.date,
    datePrecision: /\d{1,2}\s*[–\-—]\s*\d{1,2}/.test(c.date) || c.date.includes("–") ? "range" : "day",
    year: c.year,
    summary:
      c.summary ??
      `${c.type} at ${c.event}, organised by ${c.organiser}${c.location ? `, ${c.location}` : ""}.`,
    institution: c.organiser,
    location: c.location,
    researchTheme: c.topic ? [c.topic] : undefined,
    facility: c.relatedFacilitySlug ? [c.relatedFacilitySlug.toUpperCase()] : undefined,
    tags: [c.type, c.scope, c.event],
    ...galleryImage(gid),
    sourceLabel: "Verified Conference Record",
    related,
    featured: c.featured,
    conferenceId: c.id,
    sortPriority: c.type === "Oral Presentation" || c.type === "Poster Presentation" ? 2 : 1,
  };
}

const conferenceChronicle = conferenceRecords.map(conferenceToRecord);

/* ------------------------------------ thesis, career, teaching, service */

const manualChronicle: ChronicleRecord[] = [
  /* ---------------------------- thesis & academic milestones ---------- */
  {
    id: "thesis-hardcopy",
    slug: "thesis-hard-copy-submission",
    title: "Final hard-copy thesis submitted to the University of Calcutta",
    shortTitle: "Hard-copy thesis submission",
    category: "Thesis & Academic Milestones",
    status: "Completed",
    eventDate: "2026-07-09",
    dateLabel: "9 July 2026",
    datePrecision: "day",
    year: 2026,
    summary:
      "The final hard copy of the doctoral thesis was submitted to the University of Calcutta, completing the formal submission requirements ahead of thesis evaluation and defence.",
    fullStory: [
      "Following the submission of the thesis “Understanding Stellar Activity in M-dwarfs” in February 2026, the final bound hard copy was submitted to the Ph.D. Section of the University of Calcutta on 9 July 2026.",
      "This step closes the formal submission stage of the doctorate. The thesis now proceeds through examination, after which the defence is scheduled by the University.",
    ],
    whyItMatters:
      "Completing hard-copy submission moves the doctorate from research and writing into the formal evaluation stage, and marks the end of six years of multi-wavelength observational work on M-dwarf magnetic activity.",
    institution: "University of Calcutta",
    location: "Kolkata, India",
    researchTheme: ["M-dwarf Magnetic Activity"],
    tags: ["Thesis", "Doctoral milestone", "University of Calcutta"],
    ...galleryImage("phd-thesis-hardcopy"),
    accessStatus: "Thesis document not publicly released — metadata only",
    sourceLabel: "Verified Institutional Milestone",
    related: [
      { to: "/academic-journey", label: "Open academic journey" },
      { to: "/gallery", label: "View milestone photograph" },
      { to: "/downloads", label: "Thesis record in the Research Vault" },
    ],
    featured: true,
    milestoneOfYear: true,
    sortPriority: 3,
    connections: ["thesis-submitted", "pub-gj398"],
  },
  {
    id: "thesis-submitted",
    slug: "doctoral-thesis-submitted",
    title: "Doctoral thesis “Understanding Stellar Activity in M-dwarfs” submitted",
    shortTitle: "Thesis submitted",
    category: "Thesis & Academic Milestones",
    status: "Completed",
    eventDate: "2026-02-04",
    dateLabel: aboutIdentity.thesisSubmitted,
    datePrecision: "day",
    year: 2026,
    summary:
      "The doctoral thesis was submitted to the University of Calcutta, drawing together TESS photometry, optical and near-infrared spectroscopy and low-frequency radio observations of nearby M dwarfs.",
    fullStory: [
      "The thesis develops a multi-wavelength observational picture of magnetic activity in nearby M-dwarf stars, combining time-domain photometry from TESS, optical and near-infrared spectroscopy from the Himalayan Chandra Telescope and the Devasthal Optical Telescope, and low-frequency radio observations with the upgraded Giant Metrewave Radio Telescope.",
      aboutIdentity.thesisStatus,
    ],
    whyItMatters:
      "The thesis consolidates several first-author studies into one coherent argument about how flares, starspots, chromospheric diagnostics and radio emission relate on low-mass stars.",
    institution: `${aboutIdentity.institution} · ${aboutIdentity.department}`,
    location: "Kolkata, India",
    researchTheme: ["M-dwarf Magnetic Activity", "Stellar Flares", "Starspots", "Radio Astronomy"],
    facility: ["TESS", "uGMRT", "HCT", "DOT"],
    tags: ["Thesis", "Doctoral milestone", "Multi-wavelength"],
    accessStatus: "Thesis document not publicly released — metadata only",
    sourceLabel: "Verified Institutional Milestone",
    related: [
      { to: "/academic-journey", label: "Open academic journey" },
      { to: "/publications", label: "Thesis publications" },
      { to: "/observations", label: "Observing programme" },
    ],
    featured: true,
    sortPriority: 3,
    connections: ["pub-gj1151", "pub-wolf359", "pub-adleo", "bridge-fellow"],
  },
  {
    id: "thesis-5000",
    slug: "5000-word-thesis-presentation",
    title: "5000-word thesis submission presentation delivered",
    shortTitle: "5000-word thesis presentation",
    category: "Thesis & Academic Milestones",
    status: "Completed",
    eventDate: "2025-08-29",
    dateLabel: "29 August 2025",
    datePrecision: "day",
    year: 2025,
    summary:
      "The 5000-word thesis submission presentation was delivered at the S. N. Bose National Centre for Basic Sciences — a required doctoral checkpoint before final thesis submission.",
    whyItMatters:
      "This institutional checkpoint confirmed that the doctoral research programme was complete enough to proceed to full thesis writing and submission.",
    institution: aboutIdentity.institution,
    location: "Kolkata, India",
    tags: ["Thesis", "Doctoral milestone", "Presentation"],
    ...galleryImage("phd-thesis-5000"),
    sourceLabel: "Verified Institutional Milestone",
    related: [
      { to: "/academic-journey", label: "Open academic journey" },
      { to: "/gallery", label: "View milestone photograph" },
    ],
    sortPriority: 2,
    connections: ["thesis-submitted"],
  },

  /* --------------------------------------------------------- career ---- */
  {
    id: "bridge-fellow",
    slug: "bridge-fellow-appointment",
    title: "Appointed Bridge Fellow at the S. N. Bose National Centre for Basic Sciences",
    shortTitle: "Bridge Fellow appointment",
    category: "Career",
    status: "Active",
    eventDate: "2026-02-05",
    dateLabel: "February 2026",
    datePrecision: "month",
    year: 2026,
    summary:
      "Following thesis submission, Diya continued at the S. N. Bose National Centre for Basic Sciences as a Bridge Fellow in observational stellar astrophysics.",
    whyItMatters:
      "The fellowship provides continuity between doctoral research and the next research position, allowing the M-dwarf activity programme to continue without interruption.",
    institution: aboutIdentity.institution,
    location: "Kolkata, India",
    researchTheme: ["M-dwarf Magnetic Activity", "Star–Planet Interaction"],
    tags: ["Career", "Fellowship", "Observational astrophysics"],
    sourceLabel: "Public Academic Record",
    related: [
      { to: "/about", label: "About & research profile" },
      { to: "/research", label: "Current research themes" },
      { to: "/contact", label: "Contact for collaboration" },
    ],
    featured: true,
    sortPriority: 3,
    connections: ["thesis-submitted"],
  },
  {
    id: "srf",
    slug: "senior-research-fellow",
    title: "Promoted to Senior Research Fellow",
    shortTitle: "Senior Research Fellow",
    category: "Career",
    status: "Completed",
    eventDate: "2022-01-01",
    dateLabel: "January 2022 – December 2025",
    datePrecision: "range",
    year: 2022,
    summary:
      "Continued doctoral research as a Senior Research Fellow at the S. N. Bose National Centre for Basic Sciences, leading principal-investigator observing programmes across optical and radio facilities.",
    institution: aboutIdentity.institution,
    tags: ["Career", "Fellowship"],
    sourceLabel: "Public Academic Record",
    related: [
      { to: "/academic-journey", label: "Academic journey" },
      { to: "/observations", label: "Observing programme" },
    ],
    sortPriority: 1,
  },
  {
    id: "jrf",
    slug: "doctoral-research-begins",
    title: "Doctoral research begins as Junior Research Fellow",
    shortTitle: "Doctoral research begins",
    category: "Career",
    status: "Completed",
    eventDate: "2020-01-01",
    dateLabel: "January 2020 – December 2021",
    datePrecision: "range",
    year: 2020,
    summary:
      "Doctoral research on M-dwarf magnetic activity began at the S. N. Bose National Centre for Basic Sciences under the supervision of Professor Soumen Mondal.",
    institution: aboutIdentity.institution,
    collaborators: ["Prof. Soumen Mondal"],
    tags: ["Career", "Fellowship", "Doctoral research"],
    sourceLabel: "Public Academic Record",
    related: [{ to: "/academic-journey", label: "Academic journey" }],
    milestoneOfYear: true,
    sortPriority: 2,
  },

  /* --------------------------------------------- awards & recognition -- */
  {
    id: "csir-net",
    slug: "csir-ugc-net-jrf",
    title: "Qualified CSIR–UGC NET with All-India Rank 143 (JRF and Lectureship)",
    shortTitle: "CSIR–UGC NET · AIR 143",
    category: "Awards & Recognition",
    status: "Completed",
    eventDate: "2019-06-01",
    dateLabel: "June 2019",
    datePrecision: "month",
    year: 2019,
    summary:
      "Qualifying the CSIR–UGC National Eligibility Test with an All-India Rank of 143 secured both the Junior Research Fellowship and Lectureship awards.",
    whyItMatters:
      "The national fellowship provided the funding and eligibility required to begin full-time doctoral research.",
    institution: "Council of Scientific & Industrial Research – UGC",
    tags: ["Award", "National fellowship", "AIR 143"],
    sourceLabel: "Public Academic Record",
    related: [{ to: "/academic-journey", label: "Academic journey" }],
    milestoneOfYear: true,
    sortPriority: 2,
  },
  {
    id: "bsc-rank",
    slug: "bsc-physics-first-rank",
    title: "Ranked first in B.Sc. Physics (Honours)",
    shortTitle: "First rank, B.Sc. Physics",
    category: "Awards & Recognition",
    status: "Completed",
    eventDate: "2016-06-01",
    dateLabel: "2016",
    datePrecision: "year",
    year: 2016,
    summary:
      "Completed the Bachelor of Science in Physics (Honours) at Bangabasi Morning College, University of Calcutta, ranked first in the class.",
    institution: "Bangabasi Morning College · University of Calcutta",
    tags: ["Award", "Undergraduate"],
    ...galleryImage("bsc-light-lab"),
    sourceLabel: "Public Academic Record",
    related: [{ to: "/academic-journey", label: "Academic journey" }],
    sortPriority: 1,
  },
  {
    id: "msc-astrophysics",
    slug: "msc-physics-astrophysics",
    title: "M.Sc. Physics with Astrophysics specialisation completed",
    shortTitle: "M.Sc. Astrophysics",
    category: "Awards & Recognition",
    status: "Completed",
    eventDate: "2018-06-01",
    dateLabel: "2018",
    datePrecision: "year",
    year: 2018,
    summary:
      "Completed the Master of Science in Physics with a specialisation in Astrophysics at St. Xavier's College, Kolkata, supported by the Indira Gandhi Single Girl Child Scholarship.",
    institution: "St. Xavier's College, Kolkata · University of Calcutta",
    tags: ["Master's", "Scholarship", "Astrophysics"],
    ...galleryImage("msc-moon"),
    sourceLabel: "Public Academic Record",
    related: [{ to: "/academic-journey", label: "Academic journey" }],
    sortPriority: 1,
  },

  /* --------------------------------------------- teaching & mentoring -- */
  {
    id: "mentorship-2026",
    slug: "summer-research-mentorship",
    title: "Supervised two Master's-level Summer Research Programme projects",
    shortTitle: "Summer research mentorship",
    category: "Teaching & Mentoring",
    status: "Completed",
    eventDate: "2026-01-01",
    dateLabel: "2026",
    datePrecision: "year",
    year: 2026,
    summary:
      "Mentored Rishav De (formerly M.Sc., IIT Bombay) and Sristi Ganguly (formerly M.Sc., St. Xavier's College, Kolkata) through Master's-level Summer Research Programme projects.",
    whyItMatters:
      "Supervising early-career researchers passes on the observational and data-analysis methods developed during the doctoral programme.",
    institution: aboutIdentity.institution,
    tags: ["Mentoring", "Summer Research Programme"],
    sourceLabel: "Public Academic Record",
    related: [{ to: "/teaching", label: "Teaching & mentoring" }],
    sortPriority: 2,
  },
  {
    id: "guest-lecturer",
    slug: "guest-lecturer-physics",
    title: "Guest Lecturer in Physics, Bangabasi Morning College",
    shortTitle: "Guest lectureship",
    category: "Teaching & Mentoring",
    status: "Completed",
    eventDate: "2018-07-01",
    dateLabel: "July 2018 – December 2019",
    datePrecision: "range",
    year: 2018,
    summary:
      "Taught Classical Mechanics to B.Sc. (Honours) students and Elasticity, Viscosity and Surface Tension to B.Sc. (Pass) students, including undergraduate laboratory instruction.",
    institution: "Bangabasi Morning College",
    location: "Kolkata, India",
    tags: ["Teaching", "Undergraduate physics"],
    ...galleryImage("bsc-study"),
    sourceLabel: "Public Academic Record",
    related: [{ to: "/teaching", label: "Teaching & mentoring" }],
    sortPriority: 1,
  },

  /* ------------------------------------------------------- peer review - */
  {
    id: "peer-review-2025",
    slug: "aas-journal-manuscript-review",
    title: "Reviewed a manuscript for an American Astronomical Society journal",
    shortTitle: "AAS journal peer review",
    category: "Peer Review",
    status: "Completed",
    eventDate: "2025-01-01",
    dateLabel: "2025",
    datePrecision: "year",
    year: 2025,
    summary:
      "Served as referee for an AAS journal manuscript on the magnetic activity of ultracool dwarfs in the LAMOST DR11 sample. No confidential review content is published here.",
    whyItMatters:
      "Refereeing is part of the scientific service that keeps published stellar-activity results reliable, and reflects recognised expertise in the field.",
    tags: ["Peer review", "Scientific service"],
    accessStatus: "Referee reports and manuscript details remain confidential",
    sourceLabel: "Public Academic Record",
    related: [{ to: "/teaching", label: "Academic service" }],
    sortPriority: 2,
  },

  /* ------------------------------------------- observing programme ----- */
  {
    id: "obs-ugmrt",
    slug: "ugmrt-observing-programme",
    title: "Principal-investigator radio programme on the uGMRT",
    shortTitle: "uGMRT PI programme",
    category: "Observations",
    status: "Active",
    eventDate: "2025-12-31",
    dateLabel: "Doctoral and current observing programme",
    datePrecision: "none",
    undated: true,
    summary:
      "18 hours of competitively awarded uGMRT time as Principal Investigator, used to search for and constrain low-frequency radio emission from nearby M dwarfs.",
    whyItMatters:
      "Low-frequency radio limits are one of the few direct probes of magnetic star–planet interaction, and they anchor the radio component of the multi-wavelength programme.",
    institution: "NCRA-TIFR",
    facility: ["uGMRT"],
    researchTheme: ["Radio Astronomy of Cool Stars"],
    tags: ["Observing", "Radio", "Principal Investigator"],
    sourceLabel: "Public Academic Record",
    related: [
      { to: "/facilities/$slug", params: { slug: "ugmrt" }, label: "uGMRT facility" },
      { to: "/observations", label: "Observing programme" },
      { to: "/publications/$slug", params: { slug: "gj1151-flares-ugmrt" }, label: "Resulting publication" },
    ],
    sortPriority: 2,
    connections: ["pub-gj1151", "pub-gj398"],
  },
  {
    id: "obs-hct",
    slug: "hct-observing-programme",
    title: "Principal-investigator spectroscopic campaign on the 2-m Himalayan Chandra Telescope",
    shortTitle: "HCT PI campaign",
    category: "Observations",
    status: "Active",
    eventDate: "2025-12-30",
    dateLabel: "Doctoral and current observing programme",
    datePrecision: "none",
    undated: true,
    summary:
      "14 nights of competitively awarded HCT time as Principal Investigator for optical photometry and time-series spectroscopy of active M dwarfs.",
    institution: "Indian Astronomical Observatory (IIA)",
    facility: ["HCT"],
    researchTheme: ["Optical & Near-Infrared Spectroscopy"],
    tags: ["Observing", "Optical spectroscopy", "Principal Investigator"],
    sourceLabel: "Public Academic Record",
    related: [
      { to: "/facilities/$slug", params: { slug: "hct" }, label: "HCT facility" },
      { to: "/observations", label: "Observing programme" },
      { to: "/publications/$slug", params: { slug: "ad-leonis-flares-spectra" }, label: "Resulting publication" },
    ],
    sortPriority: 2,
    connections: ["pub-adleo"],
  },
  {
    id: "obs-dot",
    slug: "dot-observing-programme",
    title: "Principal-investigator programme on the 3.6-m Devasthal Optical Telescope",
    shortTitle: "DOT PI programme",
    category: "Observations",
    status: "Active",
    eventDate: "2025-12-29",
    dateLabel: "Doctoral and current observing programme",
    datePrecision: "none",
    undated: true,
    summary:
      "40 hours of competitively awarded DOT time as Principal Investigator for deep optical and near-infrared spectroscopy of faint M-dwarf targets.",
    institution: "ARIES",
    facility: ["DOT"],
    researchTheme: ["Optical & Near-Infrared Spectroscopy"],
    tags: ["Observing", "Near-infrared spectroscopy", "Principal Investigator"],
    ...galleryImage("dot-observing-team"),
    sourceLabel: "Public Academic Record",
    related: [
      { to: "/facilities/$slug", params: { slug: "dot" }, label: "DOT facility" },
      { to: "/observations", label: "Observing programme" },
      { to: "/gallery", label: "Facility photographs" },
    ],
    sortPriority: 2,
  },

  /* ------------------------------------------------- upcoming missions - */
  {
    id: "upcoming-defence",
    slug: "doctoral-thesis-defence",
    title: "Doctoral thesis defence",
    shortTitle: "Thesis defence",
    category: "Upcoming Missions",
    status: "In Progress",
    eventDate: "2027-01-01",
    dateLabel: "Date to be scheduled by the University of Calcutta",
    datePrecision: "none",
    undated: true,
    summary:
      "The submitted thesis is under examination. The defence will be scheduled by the University of Calcutta; no date has been announced publicly.",
    institution: "University of Calcutta",
    tags: ["Thesis", "Defence", "Awaiting schedule"],
    sourceLabel: "Verified Institutional Milestone",
    related: [{ to: "/academic-journey", label: "Academic journey" }],
    sortPriority: 3,
    connections: ["thesis-hardcopy"],
  },
  {
    id: "upcoming-gj398-doi",
    slug: "gj-398-final-publication",
    title: "GJ 398 manuscript release in The Astrophysical Journal",
    shortTitle: "GJ 398 final release",
    category: "Upcoming Missions",
    status: "Accepted",
    eventDate: "2026-12-31",
    dateLabel: "Accepted — final DOI pending release",
    datePrecision: "none",
    undated: true,
    summary:
      "“Probing the Magnetic Activity of GJ 398 through TESS Flare Detection and uGMRT Radio Observations” has been accepted by The Astrophysical Journal. The DOI will be linked once the article is released.",
    facility: ["TESS", "uGMRT"],
    researchTheme: ["M-dwarf Magnetic Activity", "Radio Astronomy"],
    tags: ["Accepted manuscript", "The Astrophysical Journal"],
    image: thumbGj398.url,
    imageAlt: "First page of the accepted GJ 398 manuscript.",
    imageOrientation: "portrait",
    sourceLabel: "Verified Publication Record",
    related: [
      { to: "/publications/$slug", params: { slug: "gj-398-flares-radio" }, label: "Publication record" },
      { to: "/downloads", label: "Manuscript in the Research Vault" },
    ],
    sortPriority: 3,
    connections: ["pub-gj398", "obs-ugmrt"],
  },
  {
    id: "upcoming-programme",
    slug: "continuing-m-dwarf-programme",
    title: "Continuing multi-wavelength M-dwarf activity programme",
    shortTitle: "Continuing research programme",
    category: "Upcoming Missions",
    status: "Long-Term Vision",
    eventDate: "2027-06-01",
    dateLabel: "Ongoing research direction",
    datePrecision: "none",
    undated: true,
    summary:
      "Current scientific direction: understanding how magnetic activity evolves across M-dwarf systems, and how stellar radiation, energetic events and magnetic environments may influence exoplanet atmospheres, habitability and star–planet interaction.",
    institution: aboutIdentity.institution,
    facility: ["TESS", "uGMRT", "HCT", "DOT"],
    researchTheme: ["M-dwarf Magnetic Activity", "Star–Planet Interaction"],
    tags: ["Research direction", "Long-term"],
    sourceLabel: "Public Academic Record",
    related: [
      { to: "/research", label: "Research themes" },
      { to: "/contact", label: "Collaborate" },
    ],
    sortPriority: 2,
  },
];

/* -------------------------------------------------------- full archive */

function byDateDesc(a: ChronicleRecord, b: ChronicleRecord) {
  if (a.eventDate === b.eventDate) return (b.sortPriority ?? 0) - (a.sortPriority ?? 0);
  return a.eventDate < b.eventDate ? 1 : -1;
}

export const chronicleRecords: ChronicleRecord[] = [
  ...publicationChronicle,
  ...conferenceChronicle,
  ...manualChronicle,
].sort(byDateDesc);

export const chronicleBySlug = new Map(chronicleRecords.map((r) => [r.slug, r]));
export const chronicleById = new Map(chronicleRecords.map((r) => [r.id, r]));

/** Records with verified dates, used by the timeline and transmissions. */
export const datedRecords = chronicleRecords.filter((r) => !r.undated);

export const upcomingRecords = chronicleRecords.filter(
  (r) => r.category === "Upcoming Missions",
);

export const latestRecord = datedRecords[0];

export const featuredRecord =
  datedRecords.find((r) => r.featured) ?? datedRecords[0];

export const latestTransmissions = datedRecords
  .filter((r) => r.id !== featuredRecord.id)
  .slice(0, 5);

/* ------------------------------------------------------------- facets */

export const chronicleCategories = Array.from(
  new Set(chronicleRecords.map((r) => r.category)),
).sort() as ChronicleCategory[];

export const chronicleStatuses = Array.from(
  new Set(chronicleRecords.map((r) => r.status)),
) as ChronicleStatus[];

export const chronicleYears = Array.from(
  new Set(datedRecords.map((r) => r.year).filter((y): y is number => typeof y === "number")),
).sort((a, b) => b - a);

export const chronicleInstitutions = Array.from(
  new Set(chronicleRecords.map((r) => r.institution).filter(Boolean)),
).sort() as string[];

export const chronicleFacilities = Array.from(
  new Set(
    chronicleRecords
      .flatMap((r) => r.facility ?? [])
      .map((f) => f.split(" (")[0])
      .filter(Boolean),
  ),
).sort();

/* --------------------------------------------------------- statistics */

const firstAuthorCount = publicationsArchive.filter((p) => p.role === "First Author").length;
const collaborativeCount = publicationsArchive.length - firstAuthorCount;
const presentationCount = conferenceRecords.filter(
  (c) => c.type === "Oral Presentation" || c.type === "Poster Presentation",
).length;

export const chronicleStats = {
  totalRecords: chronicleRecords.length,
  yearsDocumented: chronicleYears.length,
  firstAuthorPublications: firstAuthorCount,
  collaborativePublications: collaborativeCount,
  totalPublications: publicationsArchive.length,
  presentations: presentationCount,
  conferenceEvents: conferenceRecords.length,
  observingProgrammes: 3,
  facilities: 4,
  menteesSupervised: 2,
  peerReviews: 1,
  earliestYear: Math.min(...chronicleYears),
  latestYear: Math.max(...chronicleYears),
  latestDate: latestRecord?.dateLabel ?? "",
  latestTitle: latestRecord?.title ?? "",
};

/** Verified metrics used by the Research Impact snapshot. */
export const impactMetrics = [
  { label: "First-author journal papers & proceedings", value: firstAuthorCount, max: publicationsArchive.length },
  { label: "Collaborative publications", value: collaborativeCount, max: publicationsArchive.length },
  { label: "Conference talks & posters", value: presentationCount, max: conferenceRecords.length },
  { label: "Principal-investigator facilities", value: 3, max: 4 },
  { label: "Master's students mentored", value: 2, max: 4 },
  { label: "Journal manuscripts refereed", value: 1, max: 4 },
];

/* ------------------------------------------------------ career phases */

export type CareerPhase = {
  id: string;
  label: string;
  note: string;
  from: number;
  to: number;
};

export const careerPhases: CareerPhase[] = [
  { id: "undergraduate", label: "Undergraduate Foundation", note: "Physics training at Bangabasi Morning College, University of Calcutta.", from: 2013, to: 2016 },
  { id: "masters", label: "Master's Training", note: "M.Sc. Physics with Astrophysics specialisation, St. Xavier's College, Kolkata.", from: 2016, to: 2018 },
  { id: "gateway", label: "Entry into Research", note: "CSIR–UGC NET qualification and the transition to full-time research.", from: 2019, to: 2019 },
  { id: "doctoral", label: "Doctoral Research", note: "Multi-wavelength study of M-dwarf magnetic activity at S. N. Bose National Centre for Basic Sciences.", from: 2020, to: 2025 },
  { id: "completion", label: "Thesis Completion & Bridge Fellowship", note: "Thesis submission, hard-copy submission and continuation as Bridge Fellow.", from: 2026, to: 2026 },
];

export function phaseForYear(year: number): CareerPhase | undefined {
  return careerPhases.find((p) => year >= p.from && year <= p.to);
}

/* ------------------------------------------------ current mission status */

export type MissionStatusModule = {
  id: string;
  label: string;
  title: string;
  description: string;
  date: string;
  status: ChronicleStatus;
  link: RelatedLink;
};

export const missionStatus: MissionStatusModule[] = [
  {
    id: "role",
    label: "Current academic role",
    title: `${aboutIdentity.role} · ${aboutIdentity.institution}`,
    description: aboutIdentity.primaryStatement,
    date: "February 2026 — present",
    status: "Active",
    link: { to: "/about", label: "About & research profile" },
  },
  {
    id: "focus",
    label: "Active research focus",
    title: "Magnetic activity of M-dwarf stars across optical, spectroscopic and radio wavelengths",
    description:
      "Connecting flares, starspots, chromospheric diagnostics and low-frequency radio emission with the environments of planets around low-mass stars.",
    date: "Ongoing",
    status: "Active",
    link: { to: "/research", label: "Research themes" },
  },
  {
    id: "latest-paper",
    label: "Latest publication",
    title: publicationChronicle[0]?.title ?? "",
    description: publicationChronicle[0]?.summary ?? "",
    date: publicationChronicle[0]?.dateLabel ?? "",
    status: "Published",
    link: { to: "/publications", label: "All publications" },
  },
  {
    id: "accepted",
    label: "Manuscript in press",
    title: "Probing the Magnetic Activity of GJ 398 through TESS Flare Detection and uGMRT Radio Observations",
    description: "Accepted by The Astrophysical Journal. The final DOI will be linked once the article is released.",
    date: "Accepted",
    status: "Accepted",
    link: { to: "/publications/$slug", params: { slug: "gj-398-flares-radio" }, label: "Publication record" },
  },
  {
    id: "thesis",
    label: "Latest thesis milestone",
    title: "Final hard-copy thesis submitted to the University of Calcutta",
    description: "Formal submission requirements complete; the thesis is under examination ahead of the defence.",
    date: "9 July 2026",
    status: "Completed",
    link: { to: "/academic-journey", label: "Academic journey" },
  },
  {
    id: "observing",
    label: "Observing programme",
    title: "Principal investigator on uGMRT, HCT and DOT programmes",
    description:
      "18 hours of uGMRT time, 14 nights on the Himalayan Chandra Telescope and 40 hours on the Devasthal Optical Telescope, awarded competitively as PI.",
    date: "Doctoral and current programme",
    status: "Active",
    link: { to: "/observations", label: "Observing programme" },
  },
];

/* --------------------------------------------------------- pulse strip */

export const researchPulse = datedRecords.slice(0, 10).map((r) => ({
  id: r.id,
  slug: r.slug,
  label:
    r.category === "Publications"
      ? "Paper published"
      : r.category === "Conferences"
        ? "Presentation delivered"
        : r.category === "Thesis & Academic Milestones"
          ? "Thesis milestone completed"
          : r.category === "Peer Review"
            ? "Journal review completed"
            : r.category === "Teaching & Mentoring"
              ? "Mentoring completed"
              : r.category === "Career"
                ? "Career milestone"
                : "Archive record",
  title: r.shortTitle,
  date: r.dateLabel,
  status: r.status,
}));

/* --------------------------------------------------- signal to discovery */

export const signalToDiscovery = [
  {
    id: "observation",
    stage: "Observation",
    description:
      "Competitively awarded time on TESS archives, the uGMRT, HCT and DOT supplies photometry, spectra and radio visibilities of nearby M dwarfs.",
    record: "obs-ugmrt",
    link: { to: "/observations", label: "Observing programme" } as RelatedLink,
  },
  {
    id: "reduction",
    stage: "Data Reduction",
    description:
      "Short-cadence light curves, interferometric images and spectra are calibrated and cleaned before any activity measurement is attempted.",
    record: "obs-hct",
    link: { to: "/facilities", label: "Facilities & instruments" } as RelatedLink,
  },
  {
    id: "analysis",
    stage: "Scientific Analysis",
    description:
      "Flare energetics, starspot modelling, quasi-periodic pulsation searches and chromospheric diagnostics turn reduced data into physical measurements.",
    record: "pub-wolf359",
    link: { to: "/research", label: "Research themes" } as RelatedLink,
  },
  {
    id: "presentation",
    stage: "Conference Presentation",
    description:
      "Results are first tested with the community — for example the AD Leonis poster at the 21st National Space Science Symposium in 2024.",
    record: "conf-nsss-2024",
    link: { to: "/conferences", label: "Conference archive" } as RelatedLink,
  },
  {
    id: "publication",
    stage: "Publication",
    description:
      "Refereed papers in The Astrophysical Journal and conference proceedings place the results on the permanent scientific record.",
    record: "pub-gj1151",
    link: { to: "/publications", label: "Publications" } as RelatedLink,
  },
  {
    id: "question",
    stage: "New Research Question",
    description:
      "Each result reshapes the next proposal — radio non-detections on GJ 1151 motivated the deeper TESS-plus-uGMRT study of GJ 398.",
    record: "upcoming-gj398-doi",
    link: { to: "/projects", label: "Research projects" } as RelatedLink,
  },
];

/* -------------------------------------------------- milestone of the year */

export const milestoneOfYear = chronicleRecords.filter((r) => r.milestoneOfYear);

/* --------------------------------------------------------- year summaries */

export type YearSummary = {
  year: number;
  records: ChronicleRecord[];
  publications: number;
  presentations: number;
  milestones: number;
  headline: string;
};

export const yearSummaries: YearSummary[] = chronicleYears.map((year) => {
  const records = datedRecords.filter((r) => r.year === year);
  const publications = records.filter((r) => r.category === "Publications").length;
  const presentations = records.filter((r) => r.category === "Conferences").length;
  const milestones = records.filter(
    (r) => r.category === "Thesis & Academic Milestones" || r.category === "Career" || r.category === "Awards & Recognition",
  ).length;
  const lead = records.find((r) => r.milestoneOfYear) ?? records[0];
  return {
    year,
    records,
    publications,
    presentations,
    milestones,
    headline: lead?.shortTitle ?? "",
  };
});

/* -------------------------------------------------------- glossary terms */

export const glossary: Record<string, string> = {
  "M dwarf":
    "A small, cool, long-lived star with less than about half the mass of the Sun. M dwarfs are the most common stars in the Galaxy and frequently host rocky planets.",
  "M-dwarf":
    "A small, cool, long-lived star with less than about half the mass of the Sun. M dwarfs are the most common stars in the Galaxy and frequently host rocky planets.",
  "stellar flare":
    "A sudden brightening caused by the release of magnetic energy in a star's atmosphere, observable as a rapid rise and slower decay in brightness.",
  TESS: "NASA's Transiting Exoplanet Survey Satellite, which records high-cadence optical light curves used here for flare and starspot studies.",
  uGMRT:
    "The upgraded Giant Metrewave Radio Telescope in India, used for sensitive low-frequency radio observations of cool stars.",
  multiwavelength:
    "Combining observations taken at different wavelengths — here optical, near-infrared and radio — to build one physical picture of a star.",
  "quasi-periodic pulsations":
    "Repeating intensity variations within a flare, thought to trace plasma motion or repeated magnetic reconnection.",
  starspots:
    "Cooler, magnetically dominated regions on a stellar surface, detected here through periodic dimming as the star rotates.",
};

/* ------------------------------------------------------------- citations */

export function chronicleCitation(record: ChronicleRecord): string | undefined {
  if (!record.publicationId) return undefined;
  const p = publicationsArchive.find((x) => x.id === record.publicationId);
  return p ? formatPlainCitation(p) : undefined;
}

export function chronicleBibtex(record: ChronicleRecord): string | undefined {
  if (!record.publicationId) return undefined;
  const p = publicationsArchive.find((x) => x.id === record.publicationId);
  if (!p || !p.doi) return undefined;
  return formatBibtex(p);
}

/* -------------------------------------------------- constellation layout */

export type ConstellationNode = {
  id: string;
  slug: string;
  label: string;
  category: ChronicleCategory;
  x: number; // 0–100
  y: number; // 0–100
};

const NODE_IDS: Array<[string, number, number]> = [
  ["csir-net", 8, 78],
  ["jrf", 20, 88],
  ["conf-asi-2022", 16, 44],
  ["conf-bose-fest-2023", 30, 26],
  ["pub-proc-mdwarf-spectro", 42, 14],
  ["obs-hct", 34, 60],
  ["obs-ugmrt", 46, 74],
  ["pub-adleo", 52, 44],
  ["conf-nsss-2024", 40, 34],
  ["pub-wolf359", 64, 30],
  ["pub-gj1151", 72, 54],
  ["thesis-5000", 62, 82],
  ["thesis-submitted", 80, 74],
  ["thesis-hardcopy", 90, 60],
  ["bridge-fellow", 92, 38],
  ["upcoming-gj398-doi", 84, 18],
];

export const constellationNodes: ConstellationNode[] = NODE_IDS.flatMap(([id, x, y]) => {
  const r = chronicleById.get(id);
  if (!r) return [];
  return [{ id, slug: r.slug, label: r.shortTitle, category: r.category, x, y }];
});

/** Verified relationships only — observation → paper, paper → talk, etc. */
export const constellationEdges: Array<[string, string, string]> = [
  ["obs-hct", "pub-adleo", "HCT spectra used in the AD Leonis study"],
  ["obs-ugmrt", "pub-gj1151", "uGMRT radio limits reported for GJ 1151"],
  ["obs-ugmrt", "upcoming-gj398-doi", "uGMRT observations of GJ 398"],
  ["pub-adleo", "conf-nsss-2024", "AD Leonis results presented as a poster"],
  ["conf-asi-2022", "pub-proc-mdwarf-spectro", "ASI poster developed into a proceedings paper"],
  ["conf-bose-fest-2023", "pub-proc-mdwarf-spectro", "Oral presentation of the spectroscopic study"],
  ["pub-wolf359", "thesis-submitted", "Chapter of the doctoral thesis"],
  ["pub-gj1151", "thesis-submitted", "Chapter of the doctoral thesis"],
  ["pub-adleo", "thesis-submitted", "Chapter of the doctoral thesis"],
  ["thesis-5000", "thesis-submitted", "Institutional checkpoint before submission"],
  ["thesis-submitted", "thesis-hardcopy", "Final hard-copy submission"],
  ["thesis-hardcopy", "bridge-fellow", "Continuation as Bridge Fellow"],
  ["csir-net", "jrf", "Fellowship enabling doctoral research"],
  ["jrf", "obs-hct", "Doctoral observing programme begins"],
].filter(([a, b]) => chronicleById.has(a) && chronicleById.has(b)) as Array<[string, string, string]>;

/* ------------------------------------------------------------ navigation */

export function neighbours(slug: string) {
  const index = chronicleRecords.findIndex((r) => r.slug === slug);
  return {
    previous: index > 0 ? chronicleRecords[index - 1] : undefined,
    next: index >= 0 && index < chronicleRecords.length - 1 ? chronicleRecords[index + 1] : undefined,
  };
}

// The Stellar Research Vault — unified archive model for the Downloads page.
// Every record here is derived from already-verified project data:
//   • src/data/publications-archive.ts  (bibliographic metadata, DOIs, abstracts)
//   • src/data/about.ts                 (profile, thesis metadata)
//   • src/data/gallery.ts               (presentation & facility imagery)
// File sizes, page counts and thumbnails were measured from the real files.
// No counts, metrics or metadata are invented; unavailable fields are omitted.

import {
  publicationsArchive,
  formatPlainCitation,
  formatBibtex,
  type PublicationRecord,
} from "./publications-archive";
import { gallery, type GalleryRecord } from "./gallery";
import { aboutIdentity } from "./about";
import { documentService } from "@/services/documents";
import { imageService } from "@/services/images";

function requireDocument(recordId: string) {
  const managedDocument = documentService.getDocument(recordId);

  if (!managedDocument) {
    throw new Error(`Missing AMP document mapping for "${recordId}".`);
  }

  return managedDocument;
}

const cvDocument = requireDocument("cv");

const cvAsset = {
  url: cvDocument.documentUrl,
  created_at: "2026-02-04T00:00:00.000Z",
  size: 246883,
};

/* ------------------------------------------------------------------ types */

export type RecordType =
  | "cv"
  | "first-author"
  | "collaborative"
  | "thesis"
  | "poster"
  | "presentation"
  | "image";

export type AccessStatus =
  | "public-download"
  | "preview-download"
  | "preview-only"
  | "external"
  | "metadata-only";

export type FileKind = "PDF" | "JPEG";

export type ArchiveRecord = {
  id: string;
  slug: string;
  title: string;
  type: RecordType;
  access: AccessStatus;
  /** Human summary shown on the dossier card. */
  summary: string;
  abstract?: string;
  authors?: string[];
  authorshipLabel?: string;
  venue?: string; // journal, event or institution
  year?: number;
  date?: string;
  doi?: string;
  doiUrl?: string;
  adsUrl?: string;
  fileUrl?: string;
  /** Human-readable filename used for the download attribute. */
  downloadName?: string;
  fileKind?: FileKind;
  fileSize?: number; // bytes — measured, never estimated
  pageCount?: number;
  thumbnail?: string;
  thumbnailAlt?: string;
  themes: string[];
  facilities: string[];
  wavelength?: string;
  related: Array<{ to: string; label: string; hash?: string }>;
  credit?: string;
  featured?: boolean;
  publicationId?: string;
  galleryId?: string;
  sortDate: number; // for chronological ordering
};

/* ------------------------------------------------------- measured metadata */

const PDF_META: Record<string, { size: number; pages: number }> = {
  gj1151: { size: 2491329, pages: 9 },
  wolf359: { size: 65891134, pages: 21 },
  adleo: { size: 2285425, pages: 13 },
  gj398: { size: 11316791, pages: 16 },
  "proc-mdwarf-spectro": { size: 1361630, pages: 12 },
  tic272272592: { size: 54960883, pages: 26 },
  "two-young-mstars": { size: 26022186, pages: 22 },
  "taurus-brown-dwarfs": { size: 2340193, pages: 12 },
  "proc-young-bd-superflares": { size: 2970737, pages: 11 },
};

/** Wavelength domain inferred strictly from the verified instrument list. */
function wavelengthOf(p: PublicationRecord): string | undefined {
  const hasRadio = p.instruments.some((i) => i.includes("uGMRT"));
  const hasOptical = p.instruments.some(
    (i) => i.includes("TESS") || i.includes("HCT") || i.includes("DOT"),
  );
  if (hasRadio && hasOptical) return "Optical + Radio";
  if (hasRadio) return "Radio";
  if (hasOptical) return "Optical / Near-infrared";
  return undefined;
}

export function formatBytes(bytes?: number): string | undefined {
  if (!bytes) return undefined;
  if (bytes >= 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  return `${Math.round(bytes / 1024)} KB`;
}

/* ---------------------------------------------------- publication records */

const publicationRecords: ArchiveRecord[] = publicationsArchive.map((p) => {
  const meta = PDF_META[p.id];
  const managedDocument = documentService.getByPublicationId(p.id);
  const isFirst = p.role === "First Author";
  const venue =
    p.type === "Proceeding"
      ? `${p.journal}${p.volume ? `, vol. ${p.volume}` : ""}${p.pages ? `, pp. ${p.pages}` : ""}`
      : `${p.journal}${p.volume ? `, ${p.volume}` : ""}${p.issue ? `(${p.issue})` : ""}${
          p.articleNumber ? `, ${p.articleNumber}` : ""
        }`;

  const related: ArchiveRecord["related"] = [
    { to: "/publications/$slug", label: "Publication record", hash: p.slug },
    { to: "/research", label: "Research themes" },
  ];
  if (p.instruments.some((i) => i.includes("uGMRT") || i.includes("DOT") || i.includes("HCT"))) {
    related.push({ to: "/facilities", label: "Observing facilities" });
  }
  if (p.type === "Proceeding") {
    related.push({ to: "/conferences", label: "Conference archive" });
  }

  return {
    id: `pub-${p.id}`,
    slug: p.slug,
    title: p.title,
    type: isFirst ? "first-author" : "collaborative",
    access: managedDocument?.access ?? (p.pdfUrl ? "preview-download" : "external"),
    summary: p.shortSummary,
    abstract: p.abstract,
    authors: p.authors,
    authorshipLabel: isFirst
      ? "First author"
      : `Co-author (position ${p.diyaAuthorPosition} of ${p.authors.length})`,
    venue,
    year: p.year,
    date: p.month ? `${p.month} ${p.year}` : String(p.year),
    doi: p.doi || undefined,
    doiUrl: p.doiUrl || undefined,
    adsUrl: p.adsUrl,
    fileUrl:
      managedDocument?.access === "metadata-only"
        ? undefined
        : managedDocument?.documentUrl ?? p.pdfUrl,
    downloadName: managedDocument?.downloadName,
    fileKind: "PDF" as const,
    fileSize: meta?.size,
    pageCount: meta?.pages,
    thumbnail: managedDocument?.thumbnailUrl,
    thumbnailAlt: `First page of the paper “${p.title}”.`,
    themes: p.themes,
    facilities: p.instruments,
    wavelength: wavelengthOf(p),
    related,
    featured: p.featured,
    publicationId: p.id,
    sortDate: p.year,
  } satisfies ArchiveRecord;
});

/* --------------------------------------------------------------- CV record */

export const cvRecord: ArchiveRecord = {
  id: "cv",
  slug: "curriculum-vitae",
  title: "Curriculum Vitae — Diya Ram",
  type: "cv",
  access: cvDocument.access,
  summary:
    "Complete academic record: education, doctoral research, competitively awarded telescope time, publications, presentations, teaching and scientific service.",
  authors: ["Diya Ram"],
  venue: aboutIdentity.institution,
  date: new Date(cvAsset.created_at).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }),
  year: new Date(cvAsset.created_at).getFullYear(),
  fileUrl: cvAsset.url,
  downloadName: cvDocument.downloadName,
  fileKind: "PDF",
  fileSize: cvAsset.size,
  pageCount: 5,
  thumbnail: cvDocument.thumbnailUrl,
  thumbnailAlt: "First page of Diya Ram's curriculum vitae.",
  themes: ["Academic profile"],
  facilities: ["TESS", "uGMRT", "HCT", "DOT"],
  related: [
    { to: "/about", label: "About & research profile" },
    { to: "/academic-journey", label: "Academic journey" },
    { to: "/teaching", label: "Teaching & mentoring" },
    { to: "/contact", label: "Contact" },
  ],
  featured: true,
  sortDate: new Date(cvAsset.created_at).getFullYear(),
};

/* ----------------------------------------------------------- thesis record */

export const thesisRecord: ArchiveRecord = {
  id: "thesis",
  slug: "doctoral-thesis",
  title: aboutIdentity.thesisTitle,
  type: "thesis",
  access: "metadata-only",
  summary:
    "Doctoral thesis submitted to the University of Calcutta, developing a multi-wavelength view of magnetic activity in nearby M dwarfs through TESS photometry, optical and near-infrared spectroscopy, and low-frequency radio observations.",
  authors: ["Diya Ram"],
  venue: `${aboutIdentity.institution} · ${aboutIdentity.department}`,
  date: aboutIdentity.thesisSubmitted,
  year: 2026,
  themes: [
    "M-dwarf Magnetic Activity",
    "Stellar Flares",
    "Starspots",
    "Chromospheric Diagnostics",
    "Radio Astronomy",
  ],
  facilities: ["TESS", "uGMRT", "HCT (HFOSC)", "DOT (TANSPEC)"],
  wavelength: "Optical + Near-infrared + Radio",
  thumbnail: imageService.getRequiredImage("thesis-m-dwarf-magnetic-activity").imageUrl,
  thumbnailAlt:
    "Scientific visualisation of magnetic activity in the M-dwarf stars studied in Diya Ram's doctoral thesis",
  related: [
    { to: "/academic-journey", label: "Academic journey" },
    { to: "/publications", label: "Thesis publications" },
    { to: "/observations", label: "Observing programme" },
    { to: "/gallery", label: "Thesis milestones" },
  ],
  featured: true,
  sortDate: 2026,
};

/* ------------------------------------- presentation & poster image records */

const presentationGalleryIds = new Set(["oral", "poster"]);

function galleryToRecord(g: GalleryRecord, type: RecordType): ArchiveRecord {
  return {
    id: `img-${g.id}`,
    slug: g.id,
    title: g.title,
    type,
    access: "preview-download",
    summary: g.shortCaption,
    abstract: g.caption,
    venue: g.event ?? g.institution,
    year: g.year,
    date: g.date,
    fileUrl: g.src,
    downloadName: g.filename,
    fileKind: "JPEG",
    thumbnail: g.src,
    thumbnailAlt: g.alt,
    themes: g.topic ? [g.topic, ...g.tags.slice(0, 3)] : g.tags.slice(0, 4),
    facilities: g.facility ? [g.facility] : [],
    related: [
      { to: "/gallery", label: "Scientific Gallery" },
      ...(g.category === "facility"
        ? [{ to: "/facilities", label: "Research facilities" }]
        : [{ to: "/conferences", label: "Conference archive" }]),
    ],
    credit: "Photograph — Diya Ram personal research archive.",
    galleryId: g.id,
    featured: g.featured,
    sortDate: g.year ?? 0,
  };
}

export const presentationRecords: ArchiveRecord[] = gallery
  .filter((g) => presentationGalleryIds.has(g.category))
  .map((g) => galleryToRecord(g, g.category === "poster" ? "poster" : "presentation"));

/** Curated, download-appropriate research imagery (facilities & milestones). */
export const visualRecords: ArchiveRecord[] = gallery
  .filter((g) => g.category === "facility" || g.category === "milestone")
  .map((g) => galleryToRecord(g, "image"));

/* ---------------------------------------------------------- full repository */

export const archiveRecords: ArchiveRecord[] = [
  cvRecord,
  thesisRecord,
  ...publicationRecords,
  ...presentationRecords,
  ...visualRecords,
];

export const firstAuthorRecords = publicationRecords.filter((r) => r.type === "first-author");
export const collaborativeRecords = publicationRecords.filter((r) => r.type === "collaborative");
export const posterRecords = presentationRecords.filter((r) => r.type === "poster");
export const talkRecords = presentationRecords.filter((r) => r.type === "presentation");

export const featuredRecords: ArchiveRecord[] = [
  cvRecord,
  thesisRecord,
  firstAuthorRecords.find((r) => r.publicationId === "gj398") ?? firstAuthorRecords[0],
  firstAuthorRecords.find((r) => r.publicationId === "wolf359") ?? firstAuthorRecords[1],
  collaborativeRecords[0],
  posterRecords[0],
].filter(Boolean) as ArchiveRecord[];

/* ------------------------------------------------------------------- facets */

export const RECORD_TYPE_LABEL: Record<RecordType, string> = {
  cv: "Curriculum Vitae",
  "first-author": "First-author paper",
  collaborative: "Collaborative paper",
  thesis: "Doctoral thesis",
  poster: "Poster",
  presentation: "Presentation",
  image: "Research image",
};

export const ACCESS_LABEL: Record<AccessStatus, string> = {
  "public-download": "Public download",
  "preview-download": "Preview & download",
  "preview-only": "Preview only",
  external: "Official external access",
  "metadata-only": "Metadata only",
};

export const archiveTypes = (Object.keys(RECORD_TYPE_LABEL) as RecordType[]).filter((t) =>
  archiveRecords.some((r) => r.type === t),
);

export const archiveYears = Array.from(
  new Set(archiveRecords.map((r) => r.year).filter((y): y is number => typeof y === "number")),
).sort((a, b) => b - a);

export const archiveThemes = Array.from(
  new Set(publicationRecords.flatMap((r) => r.themes)),
).sort();

export const archiveFacilities = Array.from(
  new Set(
    publicationRecords
      .flatMap((r) => r.facilities)
      .map((f) => f.split(" (")[0])
      .filter(Boolean),
  ),
).sort();

export const archiveAccessLevels = Array.from(
  new Set(archiveRecords.map((r) => r.access)),
) as AccessStatus[];

export const archiveFormats = Array.from(
  new Set(archiveRecords.map((r) => r.fileKind).filter(Boolean)),
) as FileKind[];

/* -------------------------------------------------------------- statistics */

export const archiveStats = {
  totalRecords: archiveRecords.length,
  downloadable: archiveRecords.filter((r) => Boolean(r.fileUrl)).length,
  firstAuthor: firstAuthorRecords.length,
  collaborative: collaborativeRecords.length,
  posters: posterRecords.length,
  presentations: talkRecords.length,
  images: visualRecords.length,
  categories: archiveTypes.length,
  years: archiveYears.length,
  yearRange: { min: Math.min(...archiveYears), max: Math.max(...archiveYears) },
  formats: archiveFormats.length,
  documentPages: [cvRecord, ...publicationRecords].reduce((n, r) => n + (r.pageCount ?? 0), 0),
  lastUpdated: cvRecord.date,
};

/* --------------------------------------------------------------- citations */

export function citationFor(record: ArchiveRecord): string | undefined {
  if (record.type === "thesis") {
    return `Ram, D. (2026). ${thesisRecord.title} [Doctoral thesis, University of Calcutta]. Research carried out at the ${aboutIdentity.institution}. Submitted ${aboutIdentity.thesisSubmitted}.`;
  }
  if (!record.publicationId) return undefined;
  const p = publicationsArchive.find((x) => x.id === record.publicationId);
  return p ? formatPlainCitation(p) : undefined;
}

export function bibtexFor(record: ArchiveRecord): string | undefined {
  if (!record.publicationId) return undefined;
  const p = publicationsArchive.find((x) => x.id === record.publicationId);
  if (!p || !p.doi) return undefined;
  return formatBibtex(p);
}

/* ------------------------------------------------------- curated pathways */

export type Pathway = {
  id: string;
  label: string;
  description: string;
  match: (r: ArchiveRecord) => boolean;
  route: { to: string; label: string };
};

export const pathways: Pathway[] = [
  {
    id: "m-dwarf",
    label: "Explore M-dwarf research",
    description: "Every record concerned with magnetic activity in low-mass stars.",
    match: (r) => r.themes.some((t) => t.toLowerCase().includes("m-dwarf")),
    route: { to: "/research", label: "Research themes" },
  },
  {
    id: "doctoral",
    label: "Follow the doctoral journey",
    description: "Thesis, thesis-linked papers and submission milestones.",
    match: (r) =>
      r.type === "thesis" ||
      r.type === "first-author" ||
      (r.type === "image" && r.slug.startsWith("phd")),
    route: { to: "/academic-journey", label: "Academic journey" },
  },
  {
    id: "tess-ugmrt",
    label: "Trace TESS to uGMRT",
    description: "Multi-wavelength studies combining optical photometry and radio observations.",
    match: (r) => r.facilities.some((f) => f.includes("uGMRT")),
    route: { to: "/observations", label: "Observing programme" },
  },
  {
    id: "conference-to-publication",
    label: "Conference to publication",
    description: "Presented science and the papers and proceedings it became.",
    match: (r) => r.type === "poster" || r.type === "presentation" || r.slug.includes("proceeding") || r.venue?.includes("Bulletin") === true,
    route: { to: "/conferences", label: "Conferences & presentations" },
  },
  {
    id: "optical-radio",
    label: "Optical and radio observations",
    description: "Facility records and observational documents from DOT, DFOT, HCT and uGMRT.",
    match: (r) =>
      r.type === "image" ||
      r.facilities.some((f) => f.includes("DOT") || f.includes("HCT") || f.includes("uGMRT")),
    route: { to: "/facilities", label: "Research facilities" },
  },
];

/* ------------------------------------------------------------ image credit */

export const heroImageCredit = {
  object: "Hubble Ultra Deep Field",
  mission: "NASA/ESA Hubble Space Telescope",
  institution: "NASA, ESA and the Space Telescope Science Institute (STScI)",
  credit:
    "NASA, ESA, S. Beckwith (STScI) and the Hubble Ultra Deep Field Team — public-domain NASA/ESA imagery.",
  sourceUrl: "https://science.nasa.gov/mission/hubble/science/hubble-deep-fields/",
};

// Verified Conferences, Presentations & Scientific Meetings.
// All records cross-referenced against Diya Ram's CV
// (Research_Statement_4_CV-Diya-3.pdf) and existing Scientific Gallery data.
// Do NOT invent events, dates, venues or classifications.

import { gallery } from "./gallery";

export type ConferenceType =
  | "Oral Presentation"
  | "Poster Presentation"
  | "Workshop"
  | "Participation"
  | "Online Participation"
  | "Local Organising Committee";

export type ConferenceScope = "National" | "International" | "Institutional" | "Online";

export type ConferenceRecord = {
  id: string;                          // stable slug/anchor
  title?: string;                      // presentation title, if any
  type: ConferenceType;
  event: string;                       // full event name
  acronym?: string;
  organiser: string;
  venue?: string;
  city?: string;
  country?: string;
  location: string;                    // display string
  scope: ConferenceScope;
  year: number;
  date: string;                        // exact date/range from CV
  topic?: string;
  summary?: string;
  coAuthors?: string[];
  relatedPublicationSlug?: string;
  relatedProjectSlug?: string;
  relatedFacilitySlug?: string;
  relatedAreaSlug?: string;
  galleryIds?: string[];               // Gallery record ids for image reuse
  thesisConnection?: boolean;
  featured?: boolean;
  role?: string;                       // e.g. "Presenter", "LOC Member"
};

export const conferenceRecords: ConferenceRecord[] = [
  // ---------- 2025 ----------
  {
    id: "bose-fest-2025",
    title: "Correlation between stellar flare duration and flare energy in AD Leonis and Wolf 359; starspot modelling with the BASSMAN framework",
    type: "Oral Presentation",
    event: "Bose Fest 2025",
    acronym: "Bose Fest",
    organiser: "S. N. Bose National Centre for Basic Sciences (SNBNCBS)",
    venue: "S. N. Bose National Centre for Basic Sciences",
    city: "Kolkata",
    country: "India",
    location: "Kolkata, India",
    scope: "National",
    year: 2025,
    date: "10–13 March 2025",
    topic: "Stellar flares · Starspots",
    summary:
      "Two oral presentations at Bose Fest 2025: the first on the flare duration–energy correlation in AD Leonis and Wolf 359 based on TESS light-curve analysis; the second on starspot modelling of magnetically active M dwarfs using the BASSMAN framework.",
    coAuthors: ["Soumen Mondal", "Samrat Ghosh", "Rajib Kumbhakar"],
    relatedPublicationSlug: "wolf-359-starspots-qpp",
    relatedProjectSlug: "wolf359-starspot-analysis",
    relatedFacilitySlug: "tess",
    relatedAreaSlug: "stellar-flares",
    galleryIds: ["bosefest-2025-flare", "bosefest-2025-starspots"],
    thesisConnection: true,
    featured: true,
    role: "Presenter",
  },
  {
    id: "bose-workshop-2025",
    type: "Online Participation",
    event:
      "One-day Online Meeting on Bhaskaracharya Observatory for the Search of Exoplanets (BOSE) — Towards the Discovery of Earth-Twins",
    acronym: "BOSE",
    organiser: "Bhaskaracharya Observatory for the Search of Exoplanets",
    location: "Online",
    scope: "Online",
    year: 2025,
    date: "9 December 2025",
    topic: "Exoplanet detection",
    role: "Online Participant",
  },

  // ---------- 2024 ----------
  {
    id: "nsss-2024",
    title: "Stellar Activity and Probable Star–Planet Interaction in AD Leonis",
    type: "Poster Presentation",
    event: "21st National Space Science Symposium",
    acronym: "NSSS 2024",
    organiser: "Goa University (with the Indian Space Research Organisation)",
    venue: "Goa University",
    city: "Goa",
    country: "India",
    location: "Goa, India",
    scope: "National",
    year: 2024,
    date: "26 February – 1 March 2024",
    topic: "AD Leonis · Star–planet interaction",
    summary:
      "Poster presentation on multi-wavelength investigations of magnetically active M-dwarf stars, focusing on the probable star–planet interaction signature in AD Leonis.",
    coAuthors: ["Soumen Mondal", "Dushmanta Patra", "Samrat Ghosh", "Rajib Kumbhakar"],
    relatedPublicationSlug: "ad-leonis-flares-spectra",
    relatedProjectSlug: "adleo-spectroscopic-monitoring",
    relatedFacilitySlug: "tess",
    relatedAreaSlug: "exoplanet-habitability-and-star-planet-interaction",
    galleryIds: ["nsss-2024-poster", "nsss-2024-participation"],
    thesisConnection: true,
    featured: true,
    role: "Presenter",
  },
  {
    id: "bose-fest-2024",
    title: "Stellar Activity and Probable Star–Planet Interaction in AD Leonis",
    type: "Poster Presentation",
    event: "Bose Fest 2024",
    acronym: "Bose Fest",
    organiser: "S. N. Bose National Centre for Basic Sciences (SNBNCBS)",
    venue: "S. N. Bose National Centre for Basic Sciences",
    city: "Kolkata",
    country: "India",
    location: "Kolkata, India",
    scope: "National",
    year: 2024,
    date: "28–30 July 2024",
    topic: "AD Leonis · Multi-wavelength",
    summary:
      "Poster on multi-wavelength investigations of magnetically active M-dwarf stars — focused on AD Leonis.",
    coAuthors: ["Soumen Mondal", "Dushmanta Patra", "Samrat Ghosh", "Rajib Kumbhakar"],
    relatedPublicationSlug: "ad-leonis-flares-spectra",
    relatedProjectSlug: "adleo-spectroscopic-monitoring",
    relatedFacilitySlug: "hct",
    relatedAreaSlug: "m-dwarf-magnetic-activity",
    galleryIds: ["bosefest-2024-poster-adleo"],
    thesisConnection: true,
    featured: true,
    role: "Presenter",
  },
  {
    id: "star-formation-2024",
    type: "Local Organising Committee",
    event: "Star Formation Studies in India",
    organiser: "S. N. Bose National Centre for Basic Sciences",
    venue: "S. N. Bose National Centre for Basic Sciences",
    city: "Kolkata",
    country: "India",
    location: "Kolkata, India",
    scope: "National",
    year: 2024,
    date: "8–11 January 2024",
    topic: "Star formation",
    summary:
      "Served as Local Organising Committee (LOC) member for the Star Formation Studies in India conference, contributing to the organisation of a national scientific meeting on star formation research.",
    galleryIds: ["starformation-2024-team", "starformation-2024-supervisor"],
    role: "LOC Member",
    featured: true,
  },

  // ---------- 2023 ----------
  {
    id: "bose-fest-2023",
    title:
      "Magnetic Activity of M-dwarfs — Optical Spectroscopy, Observational Facilities and Scientific Motivation",
    type: "Oral Presentation",
    event: "Bose Fest 2023",
    acronym: "Bose Fest",
    organiser: "S. N. Bose National Centre for Basic Sciences (SNBNCBS)",
    venue: "S. N. Bose National Centre for Basic Sciences",
    city: "Kolkata",
    country: "India",
    location: "Kolkata, India",
    scope: "National",
    year: 2023,
    date: "28–30 July 2023",
    topic: "M-dwarf spectroscopy · Observational facilities",
    summary:
      "Oral presentation at Bose Fest 2023 introducing the scientific motivation for M-dwarf research, the fundamental properties of M-dwarf stars, the Hanle/Leh-Chandra Telescope and the 1.3-m Devasthal Optical Telescope, and preliminary optical spectroscopic results from DOT/TANSPEC.",
    coAuthors: ["Soumen Mondal", "Santosh Joshi", "Dushmanta Patra", "Samrat Ghosh", "Rajib Kumbhakar"],
    relatedPublicationSlug: "understanding-magnetic-activity-mdwarfs-spectroscopy",
    relatedProjectSlug: "adleo-spectroscopic-monitoring",
    relatedFacilitySlug: "hct",
    relatedAreaSlug: "optical-and-near-infrared-spectroscopy",
    galleryIds: [
      "bosefest-2023-oral-01",
      "bosefest-2023-oral-02",
      "bosefest-2023-oral-03",
      "bosefest-2023-facilities-01",
      "bosefest-2023-facilities-02",
    ],
    thesisConnection: true,
    featured: true,
    role: "Presenter",
  },
  {
    id: "sagan-workshop-2023",
    type: "Online Participation",
    event:
      "Sagan Exoplanet Summer Hybrid Workshop — Characterizing Exoplanet Atmospheres: The Next Twenty Years",
    acronym: "Sagan Workshop",
    organiser: "NASA Exoplanet Science Institute",
    location: "Online (NExScI, USA)",
    scope: "Online",
    year: 2023,
    date: "24–28 July 2023",
    topic: "Exoplanet atmospheres",
    role: "Online Participant",
  },
  {
    id: "bina-2023",
    type: "Poster Presentation",
    event: "3rd BINA Workshop — Scientific Potential of the Indo-Belgian Cooperation",
    acronym: "BINA",
    organiser: "Belgo-Indian Network for Astronomy & Astrophysics (BINA)",
    venue: "Graphic Era Hill University",
    city: "Bhimtal",
    country: "India",
    location: "Bhimtal, India",
    scope: "International",
    year: 2023,
    date: "22–24 March 2023",
    topic: "Indo-Belgian astronomical cooperation",
    summary:
      "Poster presentation at the 3rd BINA Workshop on the scientific potential of the Indo-Belgian cooperation in astronomy and astrophysics.",
    galleryIds: ["bina"],
    role: "Presenter",
  },

  // ---------- 2022 ----------
  {
    id: "gaia-symposium-2022",
    type: "Online Participation",
    event: "Gaia Symposium: DR3 And Beyond",
    acronym: "Gaia DR3",
    organiser: "Indian Institute of Astrophysics (IIA), Bangalore",
    location: "Online (IIA Bangalore, India)",
    scope: "Online",
    year: 2022,
    date: "11–15 July 2022",
    topic: "Gaia Data Release 3",
    role: "Online Participant",
  },
  {
    id: "bose-fest-2022",
    type: "Poster Presentation",
    event: "Bose Fest 2022",
    acronym: "Bose Fest",
    organiser: "S. N. Bose National Centre for Basic Sciences (SNBNCBS)",
    venue: "S. N. Bose National Centre for Basic Sciences",
    city: "Kolkata",
    country: "India",
    location: "Kolkata, India",
    scope: "National",
    year: 2022,
    date: "27–29 April 2022",
    topic: "M-dwarf magnetic activity",
    summary:
      "Poster contribution to the institutional annual Bose Fest. Detailed presentation title and abstract are not preserved in the verified archive; information currently unavailable in the verified archive.",
    thesisConnection: true,
    role: "Presenter",
  },

  {
    id: "asi-2022",
    title: "Magnetic Activity of M-dwarfs: Optical and Near-Infrared Spectroscopic Studies",
    type: "Poster Presentation",
    event: "40th Annual Meeting of the Astronomical Society of India",
    acronym: "ASI 2022",
    organiser: "Astronomical Society of India (ASI)",
    venue: "IIT Roorkee & ARIES Nainital",
    city: "Roorkee",
    country: "India",
    location: "IIT Roorkee, India",
    scope: "National",
    year: 2022,
    date: "25–29 March 2022",
    topic: "M-dwarf optical & NIR spectroscopy",
    summary:
      "Poster presentation at the 40th Annual Meeting of the Astronomical Society of India, hosted jointly by IIT Roorkee and ARIES Nainital, highlighting optical and near-infrared spectroscopic investigations of magnetically active M-dwarf stars.",
    coAuthors: ["Soumen Mondal", "Santosh Joshi", "Dushmanta Patra", "Samrat Ghosh", "Rajib Kumbhakar"],
    relatedPublicationSlug: "understanding-magnetic-activity-mdwarfs-spectroscopy",
    relatedProjectSlug: "adleo-spectroscopic-monitoring",
    relatedFacilitySlug: "dot",
    relatedAreaSlug: "optical-and-near-infrared-spectroscopy",
    galleryIds: ["asi-2022-poster", "asi-2022-group"],
    thesisConnection: true,
    featured: true,
    role: "Presenter",
  },
  {
    id: "asi-2022-ws2",
    type: "Workshop",
    event: "Machine Learning in Astronomy (WS2) — 40th Annual Meeting of the ASI",
    acronym: "ASI WS2",
    organiser: "Astronomical Society of India (ASI)",
    venue: "IIT Roorkee & ARIES Nainital",
    city: "Roorkee",
    country: "India",
    location: "IIT Roorkee, India",
    scope: "National",
    year: 2022,
    date: "25–29 March 2022",
    topic: "Machine learning in astronomy",
    summary:
      "Workshop on Machine Learning in Astronomy held alongside the 40th ASI Annual Meeting.",
    role: "Participant",
  },
  {
    id: "nsss-2022",
    type: "Participation",
    event: "20th National Space Science Symposium",
    acronym: "NSSS 2022",
    organiser: "Indian Institute of Science Education and Research, Kolkata (IISER Kolkata)",
    venue: "IISER Kolkata",
    city: "Kolkata",
    country: "India",
    location: "IISER Kolkata, India",
    scope: "National",
    year: 2022,
    date: "31 January – 4 February 2022",
    topic: "Space science",
    role: "Participant",
  },

  // ---------- 2021 ----------
  {
    id: "tess-science-2021",
    type: "Online Participation",
    event: "TESS Science Conference II",
    acronym: "TSC II",
    organiser: "Massachusetts Institute of Technology (MIT)",
    location: "Online (MIT, USA)",
    scope: "Online",
    year: 2021,
    date: "2–6 August 2021",
    topic: "TESS science",
    relatedFacilitySlug: "tess",
    role: "Online Participant",
  },
];

// ---------- helpers ----------

export const conferenceYears = Array.from(
  new Set(conferenceRecords.map((c) => c.year)),
).sort((a, b) => b - a);

export const conferenceTypes = Array.from(
  new Set(conferenceRecords.map((c) => c.type)),
);

export const conferenceScopes = Array.from(
  new Set(conferenceRecords.map((c) => c.scope)),
);

export const conferenceLocations = Array.from(
  new Set(conferenceRecords.map((c) => c.location)),
).sort();

export const conferenceInstitutions = Array.from(
  new Set(conferenceRecords.map((c) => c.organiser)),
).sort();

export const conferenceStats = {
  total: conferenceRecords.length,
  oral: conferenceRecords.filter((c) => c.type === "Oral Presentation").length,
  poster: conferenceRecords.filter((c) => c.type === "Poster Presentation").length,
  workshops: conferenceRecords.filter((c) => c.type === "Workshop").length,
  online: conferenceRecords.filter((c) => c.type === "Online Participation").length,
  organiser: conferenceRecords.filter((c) => c.type === "Local Organising Committee").length,
  years: conferenceYears.length,
  institutions: conferenceInstitutions.length,
  locations: conferenceLocations.length,
  featured: conferenceRecords.filter((c) => c.featured).length,
};

export function galleryForConference(rec: ConferenceRecord) {
  if (!rec.galleryIds) return [];
  const map = new Map(gallery.map((g) => [g.id, g] as const));
  return rec.galleryIds.map((id) => map.get(id)).filter(Boolean) as typeof gallery;
}

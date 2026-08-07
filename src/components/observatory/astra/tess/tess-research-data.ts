export type TessResearchTarget = {
  id: string;
  name: string;
  category: "M dwarf" | "Brown dwarf" | "Target sample";
  researchFocus: string;
  sectorIds: number[];
  projectSlugs: string[];
  publicationSlugs: string[];
};

export type TessSectorRecord = {
  id: number;
  label: string;
  targetIds: string[];
  publicationSlugs: string[];
  evidence: string;
};

export type TessTimelineRecord = {
  id: string;
  year: number;
  label: string;
  publicationSlugs: string[];
};

/**
 * Verified TESS research relationships assembled only from the current
 * Production scientific records.
 *
 * Important:
 * - A sector is attached to a target only where the existing publication
 *   record explicitly states that relationship.
 * - Targets whose current records do not expose a sector number keep an
 *   empty `sectorIds` array.
 * - This is a scientific relationship registry, not a live TESS catalogue.
 */
export const TESS_RESEARCH_TARGETS: TessResearchTarget[] = [
  {
    id: "gj1151",
    name: "GJ 1151",
    category: "M dwarf",
    researchFocus: "Flares, starspots and radio constraints",
    sectorIds: [48],
    projectSlugs: ["gj1151-radio-monitoring"],
    publicationSlugs: ["gj1151-flares-ugmrt"],
  },
  {
    id: "wolf359",
    name: "Wolf 359",
    category: "M dwarf",
    researchFocus: "Starspots, rotation, flares and quasi-periodic pulsations",
    sectorIds: [45, 46, 72],
    projectSlugs: ["wolf359-starspot-analysis"],
    publicationSlugs: ["wolf-359-starspots-qpp"],
  },
  {
    id: "ad-leonis",
    name: "AD Leonis",
    category: "M dwarf",
    researchFocus: "Flares, rotation and optical spectroscopy",
    sectorIds: [],
    projectSlugs: ["adleo-spectroscopic-monitoring"],
    publicationSlugs: ["ad-leonis-flares-spectra"],
  },
  {
    id: "gj398",
    name: "GJ 398",
    category: "M dwarf",
    researchFocus: "Flare energetics and uGMRT radio follow-up",
    sectorIds: [],
    projectSlugs: ["gj398-radio-followup"],
    publicationSlugs: ["gj-398-flares-radio"],
  },
  {
    id: "tic272272592",
    name: "TIC 272272592",
    category: "M dwarf",
    researchFocus: "Multiyear starspot evolution and flare temperatures",
    sectorIds: [14, 15, 41, 54, 55],
    projectSlugs: ["tic272272592-spot-modelling"],
    publicationSlugs: ["tic-272272592-starspots"],
  },
  {
    id: "gj182",
    name: "GJ 182",
    category: "M dwarf",
    researchFocus: "Starspot distribution and flare-frequency statistics",
    sectorIds: [5, 32],
    projectSlugs: [],
    publicationSlugs: ["starspot-flares-two-young-mstars"],
  },
  {
    id: "2mass-j05160212",
    name: "2MASS J05160212+2214528",
    category: "M dwarf",
    researchFocus: "Starspot modelling in a young low-mass star",
    sectorIds: [],
    projectSlugs: [],
    publicationSlugs: ["starspot-flares-two-young-mstars"],
  },
  {
    id: "mho4",
    name: "MHO 4",
    category: "Brown dwarf",
    researchFocus: "Rotation and superflare activity",
    sectorIds: [43, 44],
    projectSlugs: ["young-brown-dwarf-superflares"],
    publicationSlugs: [
      "tess-young-brown-dwarfs-taurus",
      "young-brown-dwarf-superflares-tess",
    ],
  },
  {
    id: "taurus-brown-dwarfs",
    name: "Young Taurus brown dwarfs",
    category: "Target sample",
    researchFocus: "Photometric variability, rotation and superflares",
    sectorIds: [43, 44],
    projectSlugs: ["young-brown-dwarf-superflares"],
    publicationSlugs: ["tess-young-brown-dwarfs-taurus"],
  },
  {
    id: "ev-lac",
    name: "EV Lac",
    category: "M dwarf",
    researchFocus: "Spectroscopic activity and TESS superflares",
    sectorIds: [57],
    projectSlugs: [],
    publicationSlugs: ["understanding-magnetic-activity-mdwarfs-spectroscopy"],
  },
  {
    id: "stkm2-809",
    name: "Stkm2-809",
    category: "M dwarf",
    researchFocus: "Optical/NIR spectroscopic magnetic-activity diagnostics",
    sectorIds: [],
    projectSlugs: [],
    publicationSlugs: ["understanding-magnetic-activity-mdwarfs-spectroscopy"],
  },
];

export const TESS_SECTORS: TessSectorRecord[] = [
  {
    id: 5,
    label: "Sector 5",
    targetIds: ["gj182"],
    publicationSlugs: ["starspot-flares-two-young-mstars"],
    evidence: "GJ 182 flare-frequency analysis.",
  },
  {
    id: 14,
    label: "Sector 14",
    targetIds: ["tic272272592"],
    publicationSlugs: ["tic-272272592-starspots"],
    evidence: "Multiyear TIC 272272592 starspot analysis.",
  },
  {
    id: 15,
    label: "Sector 15",
    targetIds: ["tic272272592"],
    publicationSlugs: ["tic-272272592-starspots"],
    evidence: "Multiyear TIC 272272592 starspot analysis.",
  },
  {
    id: 32,
    label: "Sector 32",
    targetIds: ["gj182"],
    publicationSlugs: ["starspot-flares-two-young-mstars"],
    evidence: "GJ 182 flare-frequency analysis.",
  },
  {
    id: 41,
    label: "Sector 41",
    targetIds: ["tic272272592"],
    publicationSlugs: ["tic-272272592-starspots"],
    evidence: "Multiyear TIC 272272592 starspot analysis.",
  },
  {
    id: 43,
    label: "Sector 43",
    targetIds: ["mho4", "taurus-brown-dwarfs"],
    publicationSlugs: [
      "tess-young-brown-dwarfs-taurus",
      "young-brown-dwarf-superflares-tess",
    ],
    evidence: "Young Taurus brown-dwarf variability and MHO 4 superflares.",
  },
  {
    id: 44,
    label: "Sector 44",
    targetIds: ["mho4", "taurus-brown-dwarfs"],
    publicationSlugs: [
      "tess-young-brown-dwarfs-taurus",
      "young-brown-dwarf-superflares-tess",
    ],
    evidence: "Young Taurus brown-dwarf variability and MHO 4 superflares.",
  },
  {
    id: 45,
    label: "Sector 45",
    targetIds: ["wolf359"],
    publicationSlugs: ["wolf-359-starspots-qpp"],
    evidence: "Wolf 359 flare and starspot analysis.",
  },
  {
    id: 46,
    label: "Sector 46",
    targetIds: ["wolf359"],
    publicationSlugs: ["wolf-359-starspots-qpp"],
    evidence: "Wolf 359 flare and starspot analysis.",
  },
  {
    id: 48,
    label: "Sector 48",
    targetIds: ["gj1151"],
    publicationSlugs: ["gj1151-flares-ugmrt"],
    evidence: "GJ 1151 flare detections.",
  },
  {
    id: 54,
    label: "Sector 54",
    targetIds: ["tic272272592"],
    publicationSlugs: ["tic-272272592-starspots"],
    evidence: "Multiyear TIC 272272592 starspot analysis.",
  },
  {
    id: 55,
    label: "Sector 55",
    targetIds: ["tic272272592"],
    publicationSlugs: ["tic-272272592-starspots"],
    evidence: "Multiyear TIC 272272592 starspot analysis.",
  },
  {
    id: 57,
    label: "Sector 57",
    targetIds: ["ev-lac"],
    publicationSlugs: ["understanding-magnetic-activity-mdwarfs-spectroscopy"],
    evidence: "EV Lac superflare reported in the spectroscopic study.",
  },
  {
    id: 72,
    label: "Sector 72",
    targetIds: ["wolf359"],
    publicationSlugs: ["wolf-359-starspots-qpp"],
    evidence: "Wolf 359 flare and starspot analysis.",
  },
];

export const TESS_RESEARCH_TIMELINE: TessTimelineRecord[] = [
  {
    id: "2023-taurus",
    year: 2023,
    label: "Young Taurus brown-dwarf variability",
    publicationSlugs: ["tess-young-brown-dwarfs-taurus"],
  },
  {
    id: "2024-mho4",
    year: 2024,
    label: "MHO 4 rotational variability and superflares",
    publicationSlugs: ["young-brown-dwarf-superflares-tess"],
  },
  {
    id: "2024-spectroscopy",
    year: 2024,
    label: "TESS superflares linked with optical/NIR spectroscopy",
    publicationSlugs: ["understanding-magnetic-activity-mdwarfs-spectroscopy"],
  },
  {
    id: "2025-adleo",
    year: 2025,
    label: "AD Leonis flare and spectroscopy study",
    publicationSlugs: ["ad-leonis-flares-spectra"],
  },
  {
    id: "2025-young-mstars",
    year: 2025,
    label: "Young M-dwarf starspot and flare analysis",
    publicationSlugs: ["starspot-flares-two-young-mstars"],
  },
  {
    id: "2025-wolf359",
    year: 2025,
    label: "Wolf 359 starspots and quasi-periodic pulsations",
    publicationSlugs: ["wolf-359-starspots-qpp"],
  },
  {
    id: "2025-gj1151",
    year: 2025,
    label: "GJ 1151 TESS flares with uGMRT constraints",
    publicationSlugs: ["gj1151-flares-ugmrt"],
  },
  {
    id: "2025-tic272272592",
    year: 2025,
    label: "Multiyear TESS starspot evolution of TIC 272272592",
    publicationSlugs: ["tic-272272592-starspots"],
  },
  {
    id: "2026-gj398",
    year: 2026,
    label: "GJ 398 TESS flare detection with uGMRT follow-up",
    publicationSlugs: ["gj-398-flares-radio"],
  },
];

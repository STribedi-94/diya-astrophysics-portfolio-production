import fs from "node:fs";
import path from "node:path";

const root = process.cwd();

const hctRoot = path.join(
  root,
  "asset-preparation",
  "observatories",
  "hct"
);

const finalManifestPath = path.join(
  hctRoot,
  "manifests",
  "hct-final-assets.json"
);

const implementationJsonPath = path.join(
  hctRoot,
  "manifests",
  "hct-implementation-ready.json"
);

const implementationTextPath = path.join(
  hctRoot,
  "manifests",
  "hct-implementation-ready.txt"
);

const reportPath = path.join(
  hctRoot,
  "hct-implementation-ready-report.txt"
);

function fail(message) {
  console.error("");
  console.error(`ERROR: ${message}`);
  console.error("");
  process.exit(1);
}

if (!fs.existsSync(finalManifestPath)) {
  fail(
    `HCT final manifest not found:\n${finalManifestPath}`
  );
}

const finalManifest = JSON.parse(
  fs.readFileSync(finalManifestPath, "utf8")
);

if (
  !Array.isArray(finalManifest.records) ||
  finalManifest.records.length !== 9
) {
  fail(
    `Expected 9 HCT records, found ${
      finalManifest.records?.length ?? 0
    }.`
  );
}

/*
============================================================
FINAL HCT V1 PUBLIC SELECTION

We deliberately reduce the broad candidate pool.

Only assets needed for the actual v1 cinematic / Gallery experience
are selected for public-delivery derivatives.

Everything else remains available as reconstruction/reference material.
============================================================
*/

const selectedNewAssets = [
  {
    file:
      "hct-hanle-mountain-road-landscape-01.jpg",

    role:
      "HANLE_ENVIRONMENT_INTRODUCTION",

    section:
      "HCT_CINEMATIC_JOURNEY",

    order: 1,

    gallerySelected: true,

    usage:
      "Opening environmental context for the high-altitude Hanle journey"
  },

  {
    file:
      "hct-hanle-observatory-plateau-day-01.jpg",

    role:
      "OBSERVATORY_SITE_ESTABLISHING",

    section:
      "HCT_CINEMATIC_JOURNEY",

    order: 2,

    gallerySelected: true,

    usage:
      "Transition from regional Hanle terrain to the Indian Astronomical Observatory site"
  },

  {
    file:
      "hct-hanle-observatory-approach-road-01.jpg",

    role:
      "HCT_PHYSICAL_APPROACH",

    section:
      "HCT_CINEMATIC_JOURNEY",

    order: 3,

    gallerySelected: false,

    usage:
      "Arrival sequence leading toward the HCT facility"
  },

  {
    file:
      "hct-himalayan-chandra-telescope-hero-day-01.webp",

    role:
      "PRIMARY_HCT_REVEAL",

    section:
      "HCT_CINEMATIC_JOURNEY",

    order: 4,

    gallerySelected: true,

    usage:
      "Primary visual identity and telescope reveal"
  },

  {
    file:
      "hct-himalayan-chandra-telescope-overview-day-02.jpg",

    role:
      "SECONDARY_HCT_OVERVIEW",

    section:
      "HCT_CINEMATIC_JOURNEY",

    order: 5,

    gallerySelected: true,

    usage:
      "Facility overview before instrumentation and scientific-workflow overlays"
  },

  {
    file:
      "hct-hanle-dark-sky-milky-way-01.webp",

    role:
      "HANLE_DARK_SKY_TRANSITION",

    section:
      "HCT_CINEMATIC_JOURNEY",

    order: 6,

    gallerySelected: true,

    usage:
      "Closing dark-sky / astronomical-observing transition",

    provenanceRule:
      "Present as illustrative dark-sky context unless documentary provenance is established"
  }
];

/*
============================================================
REFERENCE-ONLY / SUPPORT ASSETS

These remain available to implementation developers for geometry,
site understanding, infrastructure, and visual reconstruction.
============================================================
*/

const referenceOnlyFiles = [
  "hct-dome-communications-infrastructure-day-01.jpg",
  "hct-dome-rocky-terrain-low-angle-01.jpg",
  "hct-facility-dome-close-day-01.jpg"
];

/*
============================================================
VERIFY SELECTION
============================================================
*/

const preparedNames = new Set(
  finalManifest.records.map(
    (record) => record.preparedFile
  )
);

for (const item of selectedNewAssets) {
  if (!preparedNames.has(item.file)) {
    fail(
      `Selected HCT asset not present in final manifest:\n${item.file}`
    );
  }
}

for (const file of referenceOnlyFiles) {
  if (!preparedNames.has(file)) {
    fail(
      `Reference-only HCT asset not present:\n${file}`
    );
  }
}

const selectedSet = new Set(
  selectedNewAssets.map((item) => item.file)
);

const referenceSet = new Set(
  referenceOnlyFiles
);

if (
  selectedSet.size +
    referenceSet.size !==
  9
) {
  fail(
    "Selected + reference-only HCT asset count does not equal 9."
  );
}

for (const file of selectedSet) {
  if (referenceSet.has(file)) {
    fail(
      `HCT asset appears in both selected and reference-only sets:\n${file}`
    );
  }
}

/*
============================================================
LOCK CINEMATIC STORY

Scientific overlays are inserted into the journey but are NOT
photographic assets.
============================================================
*/

const cinematicSequence = [
  {
    order: 1,
    type: "REAL_IMAGE",
    asset:
      "hct-hanle-mountain-road-landscape-01.jpg",

    stage:
      "Hanle High-Altitude Landscape"
  },

  {
    order: 2,
    type: "REAL_IMAGE",
    asset:
      "hct-hanle-observatory-plateau-day-01.jpg",

    stage:
      "Indian Astronomical Observatory Site"
  },

  {
    order: 3,
    type: "REAL_IMAGE",
    asset:
      "hct-hanle-observatory-approach-road-01.jpg",

    stage:
      "Approaching the Himalayan Chandra Telescope"
  },

  {
    order: 4,
    type: "REAL_IMAGE",
    asset:
      "hct-himalayan-chandra-telescope-hero-day-01.webp",

    stage:
      "2.01-m HCT Reveal"
  },

  {
    order: 5,
    type: "REAL_IMAGE",
    asset:
      "hct-himalayan-chandra-telescope-overview-day-02.jpg",

    stage:
      "Facility Overview"
  },

  {
    order: 6,
    type: "SCIENTIFIC_LAYER",

    stage:
      "Telescope Specifications",

    content: [
      "2.01-m aperture",
      "Ritchey-Chretien optics",
      "Cassegrain focus",
      "High-altitude Hanle observing site"
    ]
  },

  {
    order: 7,
    type: "SCIENTIFIC_LAYER",

    stage:
      "HFOSC Instrument",

    content: [
      "Hanle Faint Object Spectrograph and Camera",
      "Optical imaging and spectroscopy",
      "Grism 7",
      "Grism 8",
      "350-900 nm instrument range"
    ]
  },

  {
    order: 8,
    type: "SCIENTIFIC_LAYER",

    stage:
      "Diya's Observational Setup",

    content: [
      "Time-series optical spectroscopy",
      "M-dwarf magnetic activity",
      "Chromospheric flare diagnostics"
    ]
  },

  {
    order: 9,
    type: "PIPELINE_LAYER",

    stage:
      "Optical Reduction Pipeline",

    content: [
      "Bias frames",
      "ZEROCOMBINE",
      "CCDPROC",
      "COSMICRAYS",
      "APALL",
      "Fe-Ar wavelength calibration",
      "IDENTIFY",
      "REFSPEC",
      "DISPCOR",
      "STANDARD",
      "SENSFUNC",
      "CALIBRATE",
      "SCOMBINE",
      "WSPECTEXT"
    ]
  },

  {
    order: 10,
    type: "ANALYSIS_LAYER",

    stage:
      "Spectroscopic Analysis",

    content: [
      "Specutils",
      "Equivalent-width measurements",
      "DER SNR",
      "Monte Carlo uncertainty estimation"
    ]
  },

  {
    order: 11,
    type: "SCIENCE_LAYER",

    stage:
      "Chromospheric Activity",

    content: [
      "Ca II H",
      "Ca II K",
      "H-alpha",
      "H-beta",
      "H-gamma",
      "H-delta"
    ]
  },

  {
    order: 12,
    type: "RESEARCH_CONNECTION",

    stage:
      "Diya's HCT Research",

    content: [
      "AD Leo",
      "Optical flare spectroscopy",
      "Magnetic and chromospheric activity"
    ]
  },

  {
    order: 13,
    type: "REAL_IMAGE",

    asset:
      "hct-hanle-dark-sky-milky-way-01.webp",

    stage:
      "Hanle Dark-Sky Closing",

    provenanceRule:
      "Illustrative dark-sky context; do not claim documentary provenance"
  }
];

/*
============================================================
LOCK GALLERY STORY
============================================================
*/

const galleryStory = [
  {
    order: 1,

    asset:
      "hct-himalayan-chandra-telescope-hero-day-01.webp",

    role:
      "Primary HCT facility portrait"
  },

  {
    order: 2,

    asset:
      "hct-hanle-mountain-road-landscape-01.jpg",

    role:
      "High-altitude Hanle environment"
  },

  {
    order: 3,

    asset:
      "hct-hanle-observatory-plateau-day-01.jpg",

    role:
      "Indian Astronomical Observatory site context"
  },

  {
    order: 4,

    asset:
      "hct-himalayan-chandra-telescope-overview-day-02.jpg",

    role:
      "Secondary HCT facility overview"
  },

  {
    order: 5,

    asset:
      "hct-hanle-dark-sky-milky-way-01.webp",

    role:
      "Illustrative dark-sky context",

    provenanceWarning:
      true
  }
];

/*
============================================================
SCIENTIFIC IMPLEMENTATION CONTRACT
============================================================
*/

const scientificImplementation = {
  telescope: {
    name:
      "2.01-m Himalayan Chandra Telescope",

    site:
      "Indian Astronomical Observatory, Hanle, Ladakh"
  },

  instrument: {
    name:
      "HFOSC",

    expanded:
      "Hanle Faint Object Spectrograph and Camera",

    diyaConfiguration: [
      "Grism 7",
      "Grism 8",
      "Optical spectroscopy"
    ]
  },

  reductionPipeline: {
    software:
      "IRAF",

    steps: [
      "ZEROCOMBINE",
      "CCDPROC",
      "COSMICRAYS",
      "APALL",
      "IDENTIFY",
      "REFSPEC",
      "DISPCOR",
      "STANDARD",
      "SENSFUNC",
      "CALIBRATE",
      "SCOMBINE",
      "WSPECTEXT"
    ]
  },

  analysis: [
    "Specutils",
    "Equivalent-width measurement",
    "DER SNR",
    "Monte Carlo uncertainty analysis"
  ],

  spectralDiagnostics: [
    "Ca II H",
    "Ca II K",
    "H-alpha",
    "H-beta",
    "H-gamma",
    "H-delta"
  ],

  researchTargets: [
    "AD Leo"
  ],

  implementationRules: [
    "Use this manifest as the authoritative HCT v1 asset plan.",
    "Do not reopen HCT image-selection planning during implementation chats.",
    "Do not label generic facility photographs as photographs of HFOSC.",
    "Do not represent the foreground communication dish as HCT science instrumentation.",
    "Scientific instrumentation and pipeline content must appear as a separate sourced visualization layer.",
    "Keep illustrative dark-sky imagery clearly distinguished from documentary facility photography."
  ]
};

/*
============================================================
UPDATE RECORD STATES
============================================================
*/

const lockedRecords =
  finalManifest.records.map(
    (record) => {
      const selection =
        selectedNewAssets.find(
          (item) =>
            item.file ===
            record.preparedFile
        );

      if (selection) {
        return {
          ...record,

          implementationState:
            "SELECTED_FOR_HCT_V1",

          productionSelected:
            true,

          implementationRole:
            selection.role,

          implementationSection:
            selection.section,

          implementationOrder:
            selection.order,

          gallerySelected:
            selection.gallerySelected,

          optimizationState:
            "REQUIRED",

          finalSelectionLocked:
            true
        };
      }

      return {
        ...record,

        implementationState:
          "REFERENCE_ONLY",

        productionSelected:
          false,

        implementationRole:
          "RECONSTRUCTION_REFERENCE",

        implementationSection:
          null,

        implementationOrder:
          null,

        gallerySelected:
          false,

        optimizationState:
          "NOT_REQUIRED_FOR_V1_PUBLIC_DELIVERY",

        finalSelectionLocked:
          true
      };
    }
  );

/*
============================================================
BUILD IMPLEMENTATION MANIFEST
============================================================
*/

const implementationManifest = {
  schemaVersion: 1,

  project:
    "Diya Astrophysics Portfolio",

  system:
    "Project Astra",

  observatory:
    "HCT / Hanle",

  status: {
    implementationAssetPlanningComplete:
      true,

    majorAssetClassificationDecisionsRemaining:
      false,

    sourceOriginalsProtected:
      true,

    preparedAssetCount:
      9,

    selectedNewV1Assets:
      selectedNewAssets.length,

    referenceOnlyAssets:
      referenceOnlyFiles.length,

    galleryStoryAssets:
      galleryStory.length,

    cinematicSequenceLocked:
      true,

    galleryStoryLocked:
      true,

    scientificPipelineLocked:
      true,

    webOptimizationStillRequired:
      true
  },

  selectedNewAssets,

  referenceOnlyFiles,

  cinematicSequence,

  galleryStory,

  scientificImplementation,

  existingFacilityAsset:
    finalManifest.existingProductionAudit
      ?.existingFacilityAsset ?? null,

  records:
    lockedRecords
};

fs.writeFileSync(
  implementationJsonPath,
  JSON.stringify(
    implementationManifest,
    null,
    2
  ),
  "utf8"
);

/*
============================================================
TEXT IMPLEMENTATION MANIFEST
============================================================
*/

let text = "";

text +=
  "============================================================\n";

text +=
  "DIYA ASTRA - HCT IMPLEMENTATION READY LOCK\n";

text +=
  "============================================================\n\n";

text +=
  "HCT ASSET PLANNING REMAINING: NO\n";

text +=
  "HCT SCIENTIFIC-STORY PLANNING REMAINING: NO\n";

text +=
  "SOURCE ORIGINALS PROTECTED: YES\n\n";

text +=
  `TOTAL PREPARED ASSETS: 9\n`;

text +=
  `SELECTED NEW HCT V1 ASSETS: ${selectedNewAssets.length}\n`;

text +=
  `REFERENCE-ONLY ASSETS: ${referenceOnlyFiles.length}\n`;

text +=
  `GALLERY STORY ASSETS: ${galleryStory.length}\n\n`;

text +=
  "============================================================\n";

text +=
  "SELECTED NEW HCT V1 ASSETS\n";

text +=
  "============================================================\n\n";

for (const item of selectedNewAssets) {
  text +=
    `${item.order}. ${item.file}\n`;

  text +=
    `   ROLE: ${item.role}\n`;

  text +=
    `   GALLERY: ${
      item.gallerySelected
        ? "YES"
        : "NO"
    }\n`;

  text +=
    `   USE: ${item.usage}\n\n`;
}

text +=
  "============================================================\n";

text +=
  "REFERENCE-ONLY ASSETS\n";

text +=
  "============================================================\n\n";

for (const file of referenceOnlyFiles) {
  text += `${file}\n`;
}

text += "\n";

text +=
  "============================================================\n";

text +=
  "SCIENTIFIC STORY\n";

text +=
  "============================================================\n\n";

text +=
  "Hanle\n";

text +=
  "-> 2.01-m HCT\n";

text +=
  "-> HFOSC\n";

text +=
  "-> Grism 7 / Grism 8\n";

text +=
  "-> optical spectroscopy\n";

text +=
  "-> IRAF reduction\n";

text +=
  "-> Specutils / equivalent width\n";

text +=
  "-> DER SNR\n";

text +=
  "-> Monte Carlo uncertainty analysis\n";

text +=
  "-> chromospheric diagnostics\n";

text +=
  "-> AD Leo magnetic-activity science\n\n";

text +=
  "============================================================\n";

text +=
  "HCT IMPLEMENTATION ASSET PLAN LOCKED\n";

text +=
  "============================================================\n";

fs.writeFileSync(
  implementationTextPath,
  text,
  "utf8"
);

/*
============================================================
REPORT
============================================================
*/

let report = "";

report +=
  "============================================================\n";

report +=
  "DIYA ASTRA - HCT IMPLEMENTATION READY REPORT\n";

report +=
  "============================================================\n\n";

report +=
  "Prepared HCT assets: 9\n";

report +=
  `Selected new HCT v1 assets: ${selectedNewAssets.length}\n`;

report +=
  `Reference-only assets: ${referenceOnlyFiles.length}\n`;

report +=
  `Gallery assets selected: ${galleryStory.length}\n\n`;

report +=
  "Cinematic sequence locked: YES\n";

report +=
  "Gallery story locked: YES\n";

report +=
  "HFOSC instrumentation layer locked: YES\n";

report +=
  "IRAF pipeline locked: YES\n";

report +=
  "Analysis methodology locked: YES\n\n";

report +=
  "Major HCT asset decisions remaining: NO\n";

report +=
  "Source originals modified: NO\n\n";

report +=
  "NEXT:\n";

report +=
  "Generate optimized production derivatives for the 6 selected HCT v1 assets.\n\n";

report +=
  "============================================================\n";

report +=
  "HCT PREPARATION STAGE 4 COMPLETE\n";

report +=
  "============================================================\n";

fs.writeFileSync(
  reportPath,
  report,
  "utf8"
);

console.log("");
console.log(
  "=============================================="
);

console.log(
  "DIYA ASTRA - HCT PREPARATION STAGE 4 COMPLETE"
);

console.log(
  "=============================================="
);

console.log("");

console.log(
  "Total prepared assets          : 9"
);

console.log(
  `Selected new HCT v1 assets    : ${selectedNewAssets.length}`
);

console.log(
  `Reference-only assets         : ${referenceOnlyFiles.length}`
);

console.log(
  `Gallery story assets          : ${galleryStory.length}`
);

console.log("");

console.log(
  "Cinematic sequence locked      : YES"
);

console.log(
  "Gallery story locked           : YES"
);

console.log(
  "Scientific pipeline locked     : YES"
);

console.log(
  "Major asset decisions remaining: NO"
);

console.log(
  "Source originals modified      : NO"
);

console.log("");

console.log(
  "Implementation JSON:"
);

console.log(
  implementationJsonPath
);

console.log("");

console.log(
  "Implementation text:"
);

console.log(
  implementationTextPath
);

console.log("");

console.log(
  "Report:"
);

console.log(
  reportPath
);

console.log("");
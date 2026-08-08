import fs from "node:fs";
import path from "node:path";

const root = process.cwd();

const ugmrtRoot = path.join(
  root,
  "asset-preparation",
  "observatories",
  "ugmrt"
);

const manifestDir = path.join(
  ugmrtRoot,
  "manifests"
);

const finalManifestPath = path.join(
  manifestDir,
  "ugmrt-final-assets.json"
);

const implementationJsonPath = path.join(
  manifestDir,
  "ugmrt-implementation-ready.json"
);

const implementationTextPath = path.join(
  manifestDir,
  "ugmrt-implementation-ready.txt"
);

const reportPath = path.join(
  ugmrtRoot,
  "ugmrt-implementation-ready-report.txt"
);

function fail(message) {
  console.error("");
  console.error(`ERROR: ${message}`);
  console.error("");
  process.exit(1);
}

if (!fs.existsSync(finalManifestPath)) {
  fail(
    `uGMRT final manifest missing:\n${finalManifestPath}`
  );
}

const finalManifest = JSON.parse(
  fs.readFileSync(
    finalManifestPath,
    "utf8"
  )
);

if (
  !Array.isArray(finalManifest.records) ||
  finalManifest.records.length !== 6
) {
  fail(
    `Expected 6 uGMRT records, found ${
      finalManifest.records?.length ?? 0
    }.`
  );
}

/*
============================================================
FINAL uGMRT V1 SELECTION
============================================================
*/

const selectedAssets = [
  {
    file:
      "ugmrt-array-water-reflection-day-01.jpg",

    provenance:
      "OFFICIAL_NCRA_GMRT",

    role:
      "ARRAY_ENVIRONMENT_HERO",

    order: 1,

    gallerySelected: true,

    usage:
      "Primary wide-array environmental establishing image"
  },

  {
    file:
      "ugmrt-single-antenna-road-approach-day-01.jpg",

    provenance:
      "USER_SUPPLIED",

    role:
      "SINGLE_ANTENNA_APPROACH",

    order: 2,

    gallerySelected: false,

    usage:
      "Physical approach toward an individual 45-m antenna"
  },

  {
    file:
      "ugmrt-three-antennas-blue-twilight-01.jpg",

    provenance:
      "OFFICIAL_NCRA_GMRT",

    role:
      "PRIMARY_ANTENNA_REVEAL",

    order: 3,

    gallerySelected: true,

    usage:
      "Primary structural/cinematic antenna reveal"
  },

  {
    file:
      "ugmrt-multiple-antennas-landscape-day-01.jpg",

    provenance:
      "USER_SUPPLIED",

    role:
      "INTERFEROMETRIC_ARRAY_CONTEXT",

    order: 4,

    gallerySelected: true,

    usage:
      "Multi-antenna interferometric-array context"
  }
];

const referenceOnly = [
  "ugmrt-antenna-through-fields-day-01.jpg",
  "ugmrt-multiple-antennas-secondary-day-01.jpg"
];

/*
============================================================
VERIFY SELECTION
============================================================
*/

const available = new Set(
  finalManifest.records.map(
    (record) => record.preparedFile
  )
);

for (const selected of selectedAssets) {
  if (!available.has(selected.file)) {
    fail(
      `Selected uGMRT asset missing:\n${selected.file}`
    );
  }
}

for (const file of referenceOnly) {
  if (!available.has(file)) {
    fail(
      `Reference-only uGMRT asset missing:\n${file}`
    );
  }
}

if (
  selectedAssets.length +
  referenceOnly.length !== 6
) {
  fail(
    "Selected and reference-only asset totals do not equal 6."
  );
}

const selectedSet = new Set(
  selectedAssets.map(
    (item) => item.file
  )
);

for (const file of referenceOnly) {
  if (selectedSet.has(file)) {
    fail(
      `Asset exists in both selected and reference-only sets:\n${file}`
    );
  }
}

/*
============================================================
LOCK FINAL CINEMATIC JOURNEY
============================================================
*/

const cinematicSequence = [
  {
    order: 1,
    type: "REAL_IMAGE",

    asset:
      "ugmrt-array-water-reflection-day-01.jpg",

    stage:
      "uGMRT Array Environment"
  },

  {
    order: 2,
    type: "SCIENTIFIC_LAYER",

    stage:
      "Interferometer Architecture",

    content: [
      "30 fully steerable antennas",
      "45-m antenna diameter",
      "Compact central array",
      "Three Y-shaped arms",
      "Maximum baseline approximately 25 km"
    ]
  },

  {
    order: 3,
    type: "REAL_IMAGE",

    asset:
      "ugmrt-single-antenna-road-approach-day-01.jpg",

    stage:
      "Approaching a 45-m Antenna"
  },

  {
    order: 4,
    type: "REAL_IMAGE",

    asset:
      "ugmrt-three-antennas-blue-twilight-01.jpg",

    stage:
      "Antenna Structural Reveal"
  },

  {
    order: 5,
    type: "SIGNAL_LAYER",

    stage:
      "Radio Signal Reception",

    content: [
      "Parabolic reflector",
      "Feed and receiver chain",
      "Broadband radio-frequency signal",
      "Signal transport toward central processing"
    ]
  },

  {
    order: 6,
    type: "PROCEDURAL_VISUALIZATION",

    stage:
      "GMRT Wideband Backend",

    shortName:
      "GWB",

    content: [
      "Digitized antenna signals",
      "Wideband digital processing",
      "Interferometric correlation",
      "Visibility generation"
    ],

    rule:
      "Create as sourced procedural visualization during Project Astra implementation."
  },

  {
    order: 7,
    type: "DATA_LAYER",

    stage:
      "Raw Interferometric Visibilities",

    content: [
      "Time-frequency visibility data",
      "Radio-frequency interference",
      "Calibrator and target observations"
    ]
  },

  {
    order: 8,
    type: "PIPELINE_LAYER",

    stage:
      "Common Reduction Workflow",

    content: [
      "RFI flagging",
      "Flux calibration",
      "Bandpass calibration",
      "Delay calibration",
      "Complex gain calibration",
      "Wide-field imaging",
      "Self-calibration"
    ]
  },

  {
    order: 9,
    type: "PIPELINE_SPLIT",

    stage:
      "Independent AIPS + CASA Verification",

    AIPS: [
      "Bad-data / closure inspection",
      "Flux-scale calibration",
      "Phase self-calibration",
      "Amplitude + phase self-calibration",
      "IMAGR",
      "Final radio image"
    ],

    CASA: [
      "FLAGDATA",
      "SETJY",
      "GAINCAL",
      "BANDPASS",
      "FLUXSCALE",
      "APPLYCAL",
      "MSTRANSFORM",
      "TCLEAN",
      "Self-calibration"
    ],

    scientificReason:
      "Independent reduction paths strengthen reliability, especially for marginal detections and non-detections."
  },

  {
    order: 10,
    type: "REAL_IMAGE",

    asset:
      "ugmrt-multiple-antennas-landscape-day-01.jpg",

    stage:
      "Array Science Context"
  },

  {
    order: 11,
    type: "RESEARCH_CONNECTION",

    stage:
      "Diya's Radio Astronomy Research",

    content: [
      "GJ 1151",
      "GJ 398",
      "AD Leo",
      "Radio magnetic activity",
      "Coherent-emission searches",
      "Star-planet interaction constraints"
    ]
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
      "ugmrt-array-water-reflection-day-01.jpg",

    provenance:
      "OFFICIAL_NCRA_GMRT",

    role:
      "Wide uGMRT array environment"
  },

  {
    order: 2,

    asset:
      "ugmrt-three-antennas-blue-twilight-01.jpg",

    provenance:
      "OFFICIAL_NCRA_GMRT",

    role:
      "45-m antenna structural portrait"
  },

  {
    order: 3,

    asset:
      "ugmrt-multiple-antennas-landscape-day-01.jpg",

    provenance:
      "USER_SUPPLIED",

    role:
      "Interferometric multi-antenna context"
  }
];

/*
============================================================
SCIENTIFIC IMPLEMENTATION CONTRACT
============================================================
*/

const scientificImplementation = {
  facility:
    "upgraded Giant Metrewave Radio Telescope",

  shortName:
    "uGMRT",

  institution:
    "National Centre for Radio Astrophysics, TIFR",

  array: {
    numberOfAntennas:
      30,

    antennaDiameter:
      "45 m",

    layout:
      "Compact central array plus three Y-shaped arms",

    maximumBaseline:
      "approximately 25 km"
  },

  backend: {
    name:
      "GMRT Wideband Backend",

    shortName:
      "GWB",

    presentation:
      "Procedural scientific visualization",

    purpose: [
      "Wideband digital processing",
      "Correlation",
      "Visibility generation"
    ]
  },

  diyaPipeline: {
    commonSteps: [
      "RFI flagging",
      "Flux calibration",
      "Bandpass calibration",
      "Delay calibration",
      "Complex gain calibration",
      "Wide-field imaging",
      "Self-calibration"
    ],

    AIPS: [
      "Flagging and bad-data inspection",
      "Flux-scale calibration",
      "Phase self-calibration",
      "Amplitude + phase self-calibration",
      "IMAGR"
    ],

    CASA: [
      "FLAGDATA",
      "SETJY",
      "GAINCAL",
      "BANDPASS",
      "FLUXSCALE",
      "APPLYCAL",
      "MSTRANSFORM",
      "TCLEAN",
      "Self-calibration"
    ]
  },

  researchConnections: [
    "GJ 1151",
    "GJ 398",
    "AD Leo"
  ],

  implementationRules: [
    "Use this manifest as the authoritative uGMRT Astra v1 asset plan.",
    "Do not reopen uGMRT image-selection planning during implementation.",
    "Preserve OFFICIAL_NCRA_GMRT provenance.",
    "Do not portray an antenna photograph as GWB hardware.",
    "Construct the GWB layer procedurally from sourced technical information.",
    "Keep AIPS and CASA as explicit independent reduction branches.",
    "Existing src/assets/facility-ugmrt.jpg remains reusable for existing facility UI where required.",
    "Publication PDFs, previews and thumbnails are research-document assets and must not be treated as duplicate facility imagery."
  ]
};

/*
============================================================
LOCK RECORD STATES
============================================================
*/

const lockedRecords =
  finalManifest.records.map(
    (record) => {
      const selected =
        selectedAssets.find(
          (item) =>
            item.file ===
            record.preparedFile
        );

      if (selected) {
        return {
          ...record,

          implementationState:
            "SELECTED_FOR_UGMRT_V1",

          productionSelected:
            true,

          implementationRole:
            selected.role,

          implementationOrder:
            selected.order,

          gallerySelected:
            selected.gallerySelected,

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
FINAL IMPLEMENTATION MANIFEST
============================================================
*/

const implementationManifest = {
  schemaVersion: 1,

  project:
    "Diya Astrophysics Portfolio",

  system:
    "Project Astra",

  observatory:
    "uGMRT",

  status: {
    implementationAssetPlanningComplete:
      true,

    majorAssetClassificationDecisionsRemaining:
      false,

    sourceOriginalsProtected:
      true,

    totalPreparedAssets:
      6,

    selectedNewV1Assets:
      4,

    referenceOnlyAssets:
      2,

    galleryStoryAssets:
      3,

    cinematicSequenceLocked:
      true,

    scientificPipelineLocked:
      true,

    GWBVisualizationLocked:
      true,

    webOptimizationStillRequired:
      true
  },

  selectedAssets,

  referenceOnly,

  cinematicSequence,

  galleryStory,

  scientificImplementation,

  existingFacilityAsset:
    finalManifest.existingFacilityAsset,

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
TEXT MANIFEST
============================================================
*/

let text = "";

text +=
  "============================================================\n";

text +=
  "DIYA ASTRA - uGMRT IMPLEMENTATION READY LOCK\n";

text +=
  "============================================================\n\n";

text +=
  "MAJOR uGMRT ASSET DECISIONS REMAINING: NO\n";

text +=
  "SCIENTIFIC STORY DECISIONS REMAINING: NO\n";

text +=
  "SOURCE ORIGINALS PROTECTED: YES\n\n";

text +=
  "TOTAL PREPARED ASSETS: 6\n";

text +=
  "SELECTED NEW V1 ASSETS: 4\n";

text +=
  "REFERENCE-ONLY ASSETS: 2\n";

text +=
  "GALLERY STORY ASSETS: 3\n\n";

text +=
  "SELECTED ASSETS\n";

text +=
  "------------------------------------------------------------\n";

for (const item of selectedAssets) {
  text +=
    `${item.order}. ${item.file}\n`;

  text +=
    `   ${item.role}\n`;

  text +=
    `   Provenance: ${item.provenance}\n`;

  text +=
    `   Gallery: ${
      item.gallerySelected
        ? "YES"
        : "NO"
    }\n\n`;
}

text +=
  "SCIENTIFIC JOURNEY\n";

text +=
  "------------------------------------------------------------\n";

text +=
  "ARRAY ENVIRONMENT\n";

text +=
  "-> 30 x 45-m ANTENNAS\n";

text +=
  "-> RECEIVER / SIGNAL CHAIN\n";

text +=
  "-> GWB\n";

text +=
  "-> CORRELATION / VISIBILITIES\n";

text +=
  "-> AIPS + CASA\n";

text +=
  "-> RFI FLAGGING / CALIBRATION / IMAGING / SELF-CAL\n";

text +=
  "-> GJ 1151 / GJ 398 / AD LEO\n\n";

text +=
  "============================================================\n";

text +=
  "uGMRT IMPLEMENTATION PLAN LOCKED\n";

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
  "DIYA ASTRA - uGMRT IMPLEMENTATION READY REPORT\n";

report +=
  "============================================================\n\n";

report +=
  "Total prepared assets: 6\n";

report +=
  "Selected new uGMRT v1 assets: 4\n";

report +=
  "Reference-only assets: 2\n";

report +=
  "Gallery story assets: 3\n\n";

report +=
  "Cinematic sequence locked: YES\n";

report +=
  "Gallery story locked: YES\n";

report +=
  "GWB procedural layer locked: YES\n";

report +=
  "AIPS + CASA pipeline locked: YES\n";

report +=
  "Research connections locked: YES\n\n";

report +=
  "Major uGMRT asset decisions remaining: NO\n";

report +=
  "Source originals modified: NO\n\n";

report +=
  "NEXT:\n";

report +=
  "Generate final production derivatives for the 4 selected uGMRT v1 assets.\n\n";

report +=
  "============================================================\n";

report +=
  "uGMRT PREPARATION STAGE 3 COMPLETE\n";

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
  "DIYA ASTRA - uGMRT PREPARATION STAGE 3 COMPLETE"
);

console.log(
  "=============================================="
);

console.log("");

console.log(
  "Total prepared assets          : 6"
);

console.log(
  "Selected new uGMRT v1 assets   : 4"
);

console.log(
  "Reference-only assets          : 2"
);

console.log(
  "Gallery story assets           : 3"
);

console.log("");

console.log(
  "Cinematic sequence locked      : YES"
);

console.log(
  "GWB procedural layer locked    : YES"
);

console.log(
  "AIPS + CASA pipeline locked    : YES"
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
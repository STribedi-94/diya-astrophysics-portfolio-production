import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";

const root = process.cwd();

const ugmrtRoot = path.join(
  root,
  "asset-preparation",
  "observatories",
  "ugmrt"
);

const preparedDir = path.join(
  ugmrtRoot,
  "prepared",
  "images"
);

const manifestDir = path.join(
  ugmrtRoot,
  "manifests"
);

const sourceManifestPath = path.join(
  manifestDir,
  "ugmrt-assets.json"
);

const finalJsonPath = path.join(
  manifestDir,
  "ugmrt-final-assets.json"
);

const finalTextPath = path.join(
  manifestDir,
  "ugmrt-final-assets.txt"
);

const reportPath = path.join(
  ugmrtRoot,
  "ugmrt-final-classification-report.txt"
);

const existingFacilityPath = path.join(
  root,
  "src",
  "assets",
  "facility-ugmrt.jpg"
);

function fail(message) {
  console.error("");
  console.error(`ERROR: ${message}`);
  console.error("");
  process.exit(1);
}

function sha256(filePath) {
  const hash = crypto.createHash("sha256");
  hash.update(fs.readFileSync(filePath));
  return hash.digest("hex");
}

if (!fs.existsSync(sourceManifestPath)) {
  fail(
    `uGMRT preparation manifest missing:\n${sourceManifestPath}`
  );
}

const sourceManifest = JSON.parse(
  fs.readFileSync(sourceManifestPath, "utf8")
);

if (
  !Array.isArray(sourceManifest.records) ||
  sourceManifest.records.length !== 6
) {
  fail(
    `Expected 6 prepared uGMRT records, found ${
      sourceManifest.records?.length ?? 0
    }.`
  );
}

/*
============================================================
FINAL IMAGE CLASSIFICATION
============================================================
*/

const classification = {
  "ugmrt-antenna-through-fields-day-01.jpg": {
    class: "REFERENCE_ONLY",
    productionSelected: false,
    gallerySelected: false,
    reconstructionReference: true,

    role:
      "Low-resolution rural antenna/environment reference"
  },

  "ugmrt-single-antenna-road-approach-day-01.jpg": {
    class: "PUBLIC_CINEMATIC",
    productionSelected: true,
    gallerySelected: false,
    reconstructionReference: true,

    role:
      "Physical approach toward an individual 45-m antenna"
  },

  "ugmrt-multiple-antennas-landscape-day-01.jpg": {
    class: "PUBLIC_CINEMATIC_AND_GALLERY",
    productionSelected: true,
    gallerySelected: true,
    reconstructionReference: true,

    role:
      "User-supplied multi-antenna array view"
  },

  "ugmrt-multiple-antennas-secondary-day-01.jpg": {
    class: "REFERENCE_ONLY",
    productionSelected: false,
    gallerySelected: false,
    reconstructionReference: true,

    role:
      "Secondary multi-antenna reconstruction reference"
  },

  "ugmrt-three-antennas-blue-twilight-01.jpg": {
    class: "PRIMARY_PUBLIC_HERO",
    productionSelected: true,
    gallerySelected: true,
    reconstructionReference: true,

    role:
      "Primary official antenna structural/cinematic reveal"
  },

  "ugmrt-array-water-reflection-day-01.jpg": {
    class: "PRIMARY_PUBLIC_ENVIRONMENT",
    productionSelected: true,
    gallerySelected: true,
    reconstructionReference: true,

    role:
      "Primary official wide-array environmental image"
  }
};

/*
============================================================
VERIFY ALL SIX PREPARED ASSETS
============================================================
*/

for (const record of sourceManifest.records) {
  if (!classification[record.preparedFile]) {
    fail(
      `Missing final classification:\n${record.preparedFile}`
    );
  }

  const preparedPath = path.join(
    preparedDir,
    record.preparedFile
  );

  if (!fs.existsSync(preparedPath)) {
    fail(
      `Prepared image missing:\n${record.preparedFile}`
    );
  }

  if (
    sha256(preparedPath) !==
    record.preparedSha256
  ) {
    fail(
      `Prepared image integrity mismatch:\n${record.preparedFile}`
    );
  }
}

/*
============================================================
EXISTING FACILITY ASSET
============================================================
*/

const existingFacilityAsset = {
  path: "src/assets/facility-ugmrt.jpg",

  exists:
    fs.existsSync(existingFacilityPath),

  decision:
    "KEEP_AND_REUSE_FOR_EXISTING_UI_WHERE_REQUIRED",

  replacementRequiredNow:
    false,

  role:
    "Existing website facility thumbnail / legacy facility representation",

  ...(fs.existsSync(existingFacilityPath)
    ? {
        bytes:
          fs.statSync(existingFacilityPath).size,

        sha256:
          sha256(existingFacilityPath)
      }
    : {})
};

/*
============================================================
LOCK CINEMATIC JOURNEY
============================================================
*/

const cinematicSequence = [
  {
    order: 1,
    type: "REAL_IMAGE",

    asset:
      "ugmrt-array-water-reflection-day-01.jpg",

    stage:
      "uGMRT Array Environment",

    role:
      "Wide interferometer-scale establishing view"
  },

  {
    order: 2,
    type: "SCIENTIFIC_LAYER",

    stage:
      "Array Architecture",

    content: [
      "30 fully steerable antennas",
      "45-m diameter each",
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
    type: "SCIENTIFIC_LAYER",

    stage:
      "Receiving Radio Emission",

    content: [
      "Parabolic reflector",
      "Feed / receiver chain",
      "Broadband uGMRT signal acquisition",
      "Radio-frequency astronomical signal"
    ]
  },

  {
    order: 6,
    type: "PROCEDURAL_VISUALIZATION",

    stage:
      "GMRT Wideband Backend",

    content: [
      "Digitized antenna signals",
      "Wideband backend processing",
      "Interferometric correlation",
      "Visibility generation"
    ],

    implementationRule:
      "Construct a scientifically sourced Astra visualization; do not substitute a generic antenna photograph for GWB hardware."
  },

  {
    order: 7,
    type: "PIPELINE_LAYER",

    stage:
      "Diya's Radio Reduction Workflow",

    content: [
      "Raw uGMRT visibilities",
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
    order: 8,
    type: "PIPELINE_SPLIT",

    stage:
      "Independent AIPS + CASA Verification",

    branches: {
      AIPS: [
        "Flagging / bad-data inspection",
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
      ]
    }
  },

  {
    order: 9,
    type: "REAL_IMAGE",

    asset:
      "ugmrt-multiple-antennas-landscape-day-01.jpg",

    stage:
      "Interferometric Array Context"
  },

  {
    order: 10,
    type: "SCIENCE_LAYER",

    stage:
      "Diya's M-dwarf Radio Science",

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
      "Wide uGMRT array/environment portrait"
  },

  {
    order: 2,

    asset:
      "ugmrt-three-antennas-blue-twilight-01.jpg",

    provenance:
      "OFFICIAL_NCRA_GMRT",

    role:
      "45-m antenna structural/cinematic portrait"
  },

  {
    order: 3,

    asset:
      "ugmrt-multiple-antennas-landscape-day-01.jpg",

    provenance:
      "USER_SUPPLIED",

    role:
      "Multi-antenna array context"
  }
];

/*
============================================================
SCIENTIFIC IMPLEMENTATION CONTRACT
============================================================
*/

const scientificIntegration = {
  facility:
    "upgraded Giant Metrewave Radio Telescope",

  shortName:
    "uGMRT",

  institution:
    "National Centre for Radio Astrophysics, TIFR",

  array: {
    antennas: 30,

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

    role: [
      "Wideband digital processing",
      "Interferometric correlation",
      "Visibility generation"
    ],

    implementation:
      "Procedural scientific visualization"
  },

  diyaReduction: {
    pipelines: [
      "AIPS",
      "CASA"
    ],

    coreWorkflow: [
      "RFI flagging",
      "Flux calibration",
      "Bandpass calibration",
      "Delay calibration",
      "Gain calibration",
      "Wide-field imaging",
      "Self-calibration",
      "Final radio image"
    ]
  },

  researchConnections: [
    "GJ 1151",
    "GJ 398",
    "AD Leo"
  ],

  implementationRules: [
    "Do not describe generic antenna photographs as photographs of GWB hardware.",
    "Do not reopen image-selection planning during Project Astra implementation.",
    "Preserve provenance of official NCRA/GMRT imagery.",
    "Keep radio-backend visualization distinct from documentary antenna photography.",
    "Use the AIPS and CASA branches as an explicit dual-pipeline verification story."
  ]
};

/*
============================================================
BUILD FINAL RECORDS
============================================================
*/

const finalRecords =
  sourceManifest.records.map(
    (record) => ({
      ...record,

      finalClassification:
        classification[record.preparedFile],

      finalClassificationLocked:
        true
    })
  );

const selectedCount =
  finalRecords.filter(
    (record) =>
      record.finalClassification
        .productionSelected
  ).length;

const referenceOnlyCount =
  finalRecords.filter(
    (record) =>
      !record.finalClassification
        .productionSelected
  ).length;

const galleryCount =
  finalRecords.filter(
    (record) =>
      record.finalClassification
        .gallerySelected
  ).length;

const reconstructionCount =
  finalRecords.filter(
    (record) =>
      record.finalClassification
        .reconstructionReference
  ).length;

/*
============================================================
FINAL MANIFEST
============================================================
*/

const finalManifest = {
  schemaVersion: 1,

  project:
    "Diya Astrophysics Portfolio",

  system:
    "Project Astra",

  observatory:
    "uGMRT",

  status: {
    finalClassificationComplete:
      true,

    sourceOriginalsProtected:
      true,

    orientationCorrectionRequired:
      false,

    selectedNewV1Assets:
      selectedCount,

    referenceOnlyAssets:
      referenceOnlyCount,

    galleryStoryAssets:
      galleryCount,

    cinematicSequenceLocked:
      true,

    scientificStoryLocked:
      true,

    implementationReadyLockStillRequired:
      true,

    productionDerivativesStillRequired:
      true
  },

  existingFacilityAsset,

  cinematicSequence,

  galleryStory,

  scientificIntegration,

  records:
    finalRecords
};

fs.writeFileSync(
  finalJsonPath,
  JSON.stringify(
    finalManifest,
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
  "DIYA ASTRA - uGMRT FINAL CLASSIFICATION\n";

text +=
  "============================================================\n\n";

text +=
  `TOTAL PREPARED ASSETS      : ${finalRecords.length}\n`;

text +=
  `SELECTED NEW V1 ASSETS     : ${selectedCount}\n`;

text +=
  `REFERENCE-ONLY ASSETS      : ${referenceOnlyCount}\n`;

text +=
  `GALLERY STORY ASSETS       : ${galleryCount}\n`;

text +=
  `RECONSTRUCTION REFERENCES  : ${reconstructionCount}\n\n`;

text +=
  "EXISTING FACILITY ASSET:\n";

text +=
  `${existingFacilityAsset.path}\n`;

text +=
  `Decision: ${existingFacilityAsset.decision}\n\n`;

text +=
  "CINEMATIC STORY:\n";

text +=
  "ARRAY ENVIRONMENT\n";

text +=
  "-> ARRAY ARCHITECTURE\n";

text +=
  "-> 45-m ANTENNA\n";

text +=
  "-> RECEIVER / SIGNAL CHAIN\n";

text +=
  "-> GWB\n";

text +=
  "-> CORRELATION / VISIBILITIES\n";

text +=
  "-> AIPS + CASA\n";

text +=
  "-> CALIBRATION / IMAGING / SELF-CAL\n";

text +=
  "-> GJ 1151 / GJ 398 / AD Leo\n\n";

text +=
  "SOURCE ORIGINALS MODIFIED: NO\n";

text +=
  "ORIENTATION CORRECTION REQUIRED: NO\n\n";

text +=
  "============================================================\n";

text +=
  "uGMRT FINAL CLASSIFICATION COMPLETE\n";

text +=
  "============================================================\n";

fs.writeFileSync(
  finalTextPath,
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
  "DIYA ASTRA - uGMRT FINAL CLASSIFICATION REPORT\n";

report +=
  "============================================================\n\n";

report +=
  `Prepared assets          : ${finalRecords.length}\n`;

report +=
  `Selected new V1 assets   : ${selectedCount}\n`;

report +=
  `Reference-only assets    : ${referenceOnlyCount}\n`;

report +=
  `Gallery story assets     : ${galleryCount}\n`;

report +=
  `Reconstruction refs      : ${reconstructionCount}\n\n`;

report +=
  `Existing facility mapped : ${
    existingFacilityAsset.exists ? 1 : 0
  }\n\n`;

report +=
  "Orientation normalization required: NO\n";

report +=
  "Source originals modified: NO\n\n";

report +=
  "Cinematic sequence locked: YES\n";

report +=
  "Gallery story locked: YES\n";

report +=
  "GWB scientific layer locked: YES\n";

report +=
  "AIPS + CASA pipeline locked: YES\n";

report +=
  "Research connections locked: YES\n\n";

report +=
  "NEXT:\n";

report +=
  "Implementation-ready lock, then optimized production derivatives.\n\n";

report +=
  "============================================================\n";

report +=
  "uGMRT FINAL CLASSIFICATION COMPLETE\n";

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
  "DIYA ASTRA - uGMRT FINAL CLASSIFICATION COMPLETE"
);

console.log(
  "=============================================="
);

console.log("");

console.log(
  `Prepared assets          : ${finalRecords.length}`
);

console.log(
  `Selected new V1 assets   : ${selectedCount}`
);

console.log(
  `Reference-only assets    : ${referenceOnlyCount}`
);

console.log(
  `Gallery story assets     : ${galleryCount}`
);

console.log(
  `Reconstruction refs      : ${reconstructionCount}`
);

console.log("");

console.log(
  `Existing facility mapped : ${
    existingFacilityAsset.exists ? 1 : 0
  }`
);

console.log("");

console.log(
  "Cinematic sequence locked: YES"
);

console.log(
  "GWB scientific layer locked: YES"
);

console.log(
  "AIPS + CASA pipeline locked: YES"
);

console.log("");

console.log(
  "Source originals modified: NO"
);

console.log("");

console.log(
  "Final JSON manifest:"
);

console.log(finalJsonPath);

console.log("");

console.log(
  "Final text manifest:"
);

console.log(finalTextPath);

console.log("");

console.log("Report:");

console.log(reportPath);

console.log("");
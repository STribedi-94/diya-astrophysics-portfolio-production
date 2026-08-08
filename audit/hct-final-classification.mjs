import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";

const root = process.cwd();

const hctRoot = path.join(
  root,
  "asset-preparation",
  "observatories",
  "hct"
);

const preparedDir = path.join(
  hctRoot,
  "prepared",
  "images"
);

const manifestDir = path.join(
  hctRoot,
  "manifests"
);

const sourceManifestPath = path.join(
  manifestDir,
  "hct-assets.json"
);

const finalJsonPath = path.join(
  manifestDir,
  "hct-final-assets.json"
);

const finalTextPath = path.join(
  manifestDir,
  "hct-final-assets.txt"
);

const reportPath = path.join(
  hctRoot,
  "hct-final-classification-report.txt"
);

const existingFacilityPath = path.join(
  root,
  "src",
  "assets",
  "facility-hct.jpg"
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

function relative(filePath) {
  return path
    .relative(root, filePath)
    .replaceAll("\\", "/");
}

/*
============================================================
VERIFY STAGE-1 MANIFEST
============================================================
*/

if (!fs.existsSync(sourceManifestPath)) {
  fail(
    `HCT Stage-1 manifest not found:\n${sourceManifestPath}`
  );
}

const stage1 = JSON.parse(
  fs.readFileSync(sourceManifestPath, "utf8")
);

if (
  !Array.isArray(stage1.records) ||
  stage1.records.length !== 9
) {
  fail(
    `Expected 9 HCT Stage-1 records, found ${
      stage1.records?.length ?? 0
    }.`
  );
}

/*
============================================================
FINAL ASSET CLASSIFICATION

IMPORTANT:
This stage CLASSIFIES only.
It does not migrate anything into public/.
It does not modify any source image.
============================================================
*/

const classification = {
  "hct-hanle-observatory-plateau-day-01.jpg": {
    finalClass: "PUBLIC_CINEMATIC_AND_GALLERY",
    cinematicPriority: 2,
    galleryPriority: 3,
    reconstructionReference: true,

    lockedRole:
      "Hanle observatory plateau establishing view",

    sequenceRole:
      "site-establishing",

    narrative:
      "Introduces the remote high-altitude observatory environment before the HCT approach."
  },

  "hct-dome-communications-infrastructure-day-01.jpg": {
    finalClass: "REFERENCE_AND_CINEMATIC_SUPPORT",
    cinematicPriority: 6,
    galleryPriority: null,
    reconstructionReference: true,

    lockedRole:
      "HCT facility and communications infrastructure detail",

    sequenceRole:
      "facility-infrastructure",

    narrative:
      "Provides close structural and remote-observatory infrastructure context after the main telescope reveal."
  },

  "hct-hanle-dark-sky-milky-way-01.webp": {
    finalClass: "PUBLIC_CINEMATIC_AND_GALLERY",
    cinematicPriority: 8,
    galleryPriority: 4,
    reconstructionReference: false,

    lockedRole:
      "Illustrative Hanle dark-sky transition",

    sequenceRole:
      "night-transition",

    narrative:
      "Closes or transitions the facility story from daylight instrumentation into the astronomical observing environment.",

    provenanceWarning:
      "Treat as illustrative/promotional or composite imagery unless documentary provenance is established. Do not describe as a literal documentary exposure of the HCT observing site."
  },

  "hct-himalayan-chandra-telescope-hero-day-01.webp": {
    finalClass: "PRIMARY_PUBLIC_HERO",
    cinematicPriority: 4,
    galleryPriority: 1,
    reconstructionReference: true,

    lockedRole:
      "Primary Himalayan Chandra Telescope hero image",

    sequenceRole:
      "primary-hct-reveal",

    narrative:
      "Primary visual identity of the HCT within the Hanle landscape."
  },

  "hct-hanle-observatory-approach-road-01.jpg": {
    finalClass: "PUBLIC_CINEMATIC",
    cinematicPriority: 3,
    galleryPriority: null,
    reconstructionReference: true,

    lockedRole:
      "Approach road toward the observatory",

    sequenceRole:
      "physical-approach",

    narrative:
      "Creates spatial continuity between the Hanle landscape and the telescope reveal."
  },

  "hct-dome-rocky-terrain-low-angle-01.jpg": {
    finalClass: "REFERENCE_ONLY",
    cinematicPriority: null,
    galleryPriority: null,
    reconstructionReference: true,

    lockedRole:
      "Low-angle HCT dome reconstruction reference",

    sequenceRole:
      "reference-only",

    narrative:
      "Useful for terrain, dome scale and structural reconstruction; not required as a primary public image."
  },

  "hct-hanle-mountain-road-landscape-01.jpg": {
    finalClass: "PUBLIC_CINEMATIC_AND_GALLERY",
    cinematicPriority: 1,
    galleryPriority: 2,
    reconstructionReference: true,

    lockedRole:
      "Hanle high-altitude landscape introduction",

    sequenceRole:
      "regional-environment",

    narrative:
      "Begins the physical journey through the Ladakh/Hanle observing environment."
  },

  "hct-facility-dome-close-day-01.jpg": {
    finalClass: "REFERENCE_ONLY",
    cinematicPriority: null,
    galleryPriority: null,
    reconstructionReference: true,

    lockedRole:
      "Close HCT structural reconstruction reference",

    sequenceRole:
      "reference-only",

    narrative:
      "Supports reconstruction of the HCT building and dome geometry."
  },

  "hct-himalayan-chandra-telescope-overview-day-02.jpg": {
    finalClass: "PUBLIC_CINEMATIC_AND_GALLERY",
    cinematicPriority: 5,
    galleryPriority: 5,
    reconstructionReference: true,

    lockedRole:
      "Secondary HCT facility overview",

    sequenceRole:
      "secondary-hct-overview",

    narrative:
      "Provides a broader facility view before entering the scientific instrumentation and data-analysis story."
  }
};

/*
============================================================
VERIFY CLASSIFICATION COVERAGE
============================================================
*/

for (const record of stage1.records) {
  if (!classification[record.preparedFile]) {
    fail(
      `No final classification found for:\n${record.preparedFile}`
    );
  }

  const preparedPath = path.join(
    preparedDir,
    record.preparedFile
  );

  if (!fs.existsSync(preparedPath)) {
    fail(
      `Prepared HCT image missing:\n${record.preparedFile}`
    );
  }

  if (
    sha256(preparedPath) !==
    record.sha256
  ) {
    fail(
      `Prepared asset integrity mismatch:\n${record.preparedFile}`
    );
  }
}

/*
============================================================
BUILD FINAL RECORDS
============================================================
*/

const finalRecords = stage1.records.map(
  (record) => ({
    ...record,

    finalClassification:
      classification[record.preparedFile],

    classificationLocked: true
  })
);

/*
============================================================
CINEMATIC SEQUENCE

The scientific overlays between image stages are intentional.
The instrumentation layer does NOT pretend that generic facility
photos depict HFOSC.
============================================================
*/

const cinematicSequence = [
  {
    order: 1,
    type: "real-image",
    asset:
      "hct-hanle-mountain-road-landscape-01.jpg",
    stage:
      "Hanle High-Altitude Environment"
  },

  {
    order: 2,
    type: "real-image",
    asset:
      "hct-hanle-observatory-plateau-day-01.jpg",
    stage:
      "Indian Astronomical Observatory Site"
  },

  {
    order: 3,
    type: "real-image",
    asset:
      "hct-hanle-observatory-approach-road-01.jpg",
    stage:
      "Approaching HCT"
  },

  {
    order: 4,
    type: "real-image",
    asset:
      "hct-himalayan-chandra-telescope-hero-day-01.webp",
    stage:
      "2.01-m Himalayan Chandra Telescope Reveal"
  },

  {
    order: 5,
    type: "real-image",
    asset:
      "hct-himalayan-chandra-telescope-overview-day-02.jpg",
    stage:
      "Facility Overview"
  },

  {
    order: 6,
    type: "real-image",
    asset:
      "hct-dome-communications-infrastructure-day-01.jpg",
    stage:
      "Observatory Infrastructure"
  },

  {
    order: 7,
    type: "scientific-overlay",
    stage:
      "HFOSC Instrumentation",

    content: [
      "Hanle Faint Object Spectrograph and Camera",
      "Optical imaging and spectroscopy",
      "Grism 7",
      "Grism 8",
      "350-900 nm instrument context"
    ]
  },

  {
    order: 8,
    type: "scientific-overlay",
    stage:
      "Diya's Spectroscopic Observation",

    content: [
      "M-dwarf optical spectroscopy",
      "HCT / HFOSC",
      "Chromospheric activity diagnostics"
    ]
  },

  {
    order: 9,
    type: "scientific-overlay",
    stage:
      "Reduction Pipeline",

    content: [
      "Bias subtraction",
      "Cosmic-ray removal",
      "1-D spectral extraction",
      "Fe-Ar wavelength calibration",
      "Spectrophotometric flux calibration",
      "Spectrum combination",
      "IRAF"
    ]
  },

  {
    order: 10,
    type: "scientific-overlay",
    stage:
      "Diya's Analysis",

    content: [
      "Specutils",
      "Equivalent-width measurements",
      "DER SNR",
      "Monte Carlo uncertainty estimation"
    ]
  },

  {
    order: 11,
    type: "scientific-overlay",
    stage:
      "Chromospheric Diagnostics",

    content: [
      "Ca II H & K",
      "H-alpha",
      "H-beta",
      "H-gamma",
      "H-delta"
    ]
  },

  {
    order: 12,
    type: "scientific-result",
    stage:
      "Research Connection",

    content: [
      "AD Leo",
      "Time-series optical spectroscopy",
      "Flare and magnetic-activity diagnostics"
    ]
  },

  {
    order: 13,
    type: "real-image",
    asset:
      "hct-hanle-dark-sky-milky-way-01.webp",
    stage:
      "Hanle Dark-Sky Transition",

    displayRule:
      "Illustrative dark-sky context; do not imply documentary provenance."
  }
];

/*
============================================================
GALLERY STORY

Keep Gallery compact.
It should complement, not duplicate, the cinematic tour.
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
      "Hanle high-altitude environment"
  },

  {
    order: 3,
    asset:
      "hct-hanle-observatory-plateau-day-01.jpg",

    role:
      "Observatory-site context"
  },

  {
    order: 4,
    asset:
      "hct-hanle-dark-sky-milky-way-01.webp",

    role:
      "Illustrative dark-sky context",

    provenanceWarning: true
  },

  {
    order: 5,
    asset:
      "hct-himalayan-chandra-telescope-overview-day-02.jpg",

    role:
      "Secondary facility overview"
  }
];

/*
============================================================
EXISTING FACILITY ASSET
============================================================
*/

let existingFacilityAsset = {
  expectedPath:
    "src/assets/facility-hct.jpg",

  exists:
    fs.existsSync(existingFacilityPath),

  role:
    "Existing website HCT facility asset",

  decision:
    "REUSE_IF_CURRENT_UI_REQUIRES_EXISTING_FACILITY_THUMBNAIL",

  replacementRequiredNow:
    false,

  publicMigrationRequiredNow:
    false
};

if (existingFacilityAsset.exists) {
  existingFacilityAsset = {
    ...existingFacilityAsset,
    bytes:
      fs.statSync(existingFacilityPath).size,

    sha256:
      sha256(existingFacilityPath)
  };
}

/*
============================================================
FINAL SCIENTIFIC INTEGRATION LOCK
============================================================
*/

const scientificIntegration = {
  facility:
    "Indian Astronomical Observatory, Hanle",

  telescope:
    "2.01-m Himalayan Chandra Telescope",

  instrument:
    "HFOSC - Hanle Faint Object Spectrograph and Camera",

  diyaUsage: {
    mode:
      "Optical spectroscopy",

    grisms: [
      "Grism 7",
      "Grism 8"
    ],

    analysisContext: [
      "IRAF",
      "Specutils",
      "DER SNR",
      "Monte Carlo equivalent-width uncertainty analysis"
    ],

    diagnostics: [
      "Ca II K",
      "Ca II H",
      "H-alpha",
      "H-beta",
      "H-gamma",
      "H-delta"
    ],

    researchConnection: [
      "AD Leo",
      "Chromospheric magnetic activity",
      "Optical flare spectroscopy"
    ]
  },

  presentationRules: [
    "Do not label generic HCT exterior photographs as HFOSC photographs.",
    "Do not imply that the communications dish visible in an exterior image is the science instrument.",
    "Present HFOSC, grisms and reduction steps as scientifically sourced overlays or diagrams.",
    "Keep real-site imagery and constructed scientific visualization visually distinguishable.",
    "Dark-sky composite/illustrative imagery must not be described as documentary unless provenance is later established."
  ]
};

/*
============================================================
COUNTS
============================================================
*/

const publicCandidates = finalRecords.filter(
  (record) =>
    record.finalClassification.finalClass.includes(
      "PUBLIC"
    )
).length;

const galleryCandidates =
  galleryStory.length;

const reconstructionReferences =
  finalRecords.filter(
    (record) =>
      record.finalClassification
        .reconstructionReference
  ).length;

const referenceOnly =
  finalRecords.filter(
    (record) =>
      record.finalClassification.finalClass ===
      "REFERENCE_ONLY"
  ).length;

const cinematicRealImages =
  cinematicSequence.filter(
    (item) => item.type === "real-image"
  ).length;

/*
============================================================
FINAL JSON MANIFEST
============================================================
*/

const finalManifest = {
  project:
    "Diya Astrophysics Portfolio",

  system:
    "Project Astra",

  observatory:
    "Himalayan Chandra Telescope / Hanle",

  stage:
    "HCT Final Classification",

  status:
    "FINAL_CLASSIFICATION_COMPLETE",

  orientationStatus: {
    visuallyReviewed: 9,
    correctionsRequired: 0,
    transformationsPerformed: 0,
    sourceOriginalsModified: false
  },

  existingProductionAudit: {
    srcMatches: 1,
    publicMatches: 0,
    existingFacilityAsset
  },

  counts: {
    totalPreparedAssets:
      finalRecords.length,

    publicCandidates,

    galleryCandidates,

    reconstructionReferences,

    referenceOnly,

    cinematicRealImages
  },

  cinematicSequence,

  galleryStory,

  scientificIntegration,

  records: finalRecords,

  nextStage: {
    implementationReadyLockRequired:
      true,

    productionDerivativeGenerationRequired:
      true,

    publicMigrationPerformed:
      false
  }
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
  "DIYA ASTRA - HCT FINAL ASSET CLASSIFICATION\n";

text +=
  "============================================================\n\n";

text +=
  `Prepared assets           : ${finalRecords.length}\n`;

text +=
  `Public candidates         : ${publicCandidates}\n`;

text +=
  `Gallery story assets      : ${galleryCandidates}\n`;

text +=
  `Reconstruction references : ${reconstructionReferences}\n`;

text +=
  `Reference-only assets     : ${referenceOnly}\n`;

text +=
  `Cinematic real images     : ${cinematicRealImages}\n\n`;

text +=
  "ORIENTATION CORRECTIONS REQUIRED: NO\n";

text +=
  "SOURCE ORIGINALS MODIFIED: NO\n\n";

text +=
  "============================================================\n";

text +=
  "LOCKED CINEMATIC SEQUENCE\n";

text +=
  "============================================================\n\n";

for (const item of cinematicSequence) {
  text +=
    `${String(item.order).padStart(2, "0")}. ${item.stage}\n`;

  if (item.asset) {
    text += `    ASSET: ${item.asset}\n`;
  }

  if (item.content) {
    for (const content of item.content) {
      text += `    - ${content}\n`;
    }
  }

  text += "\n";
}

text +=
  "============================================================\n";

text +=
  "LOCKED GALLERY STORY\n";

text +=
  "============================================================\n\n";

for (const item of galleryStory) {
  text +=
    `${item.order}. ${item.asset}\n`;

  text +=
    `   ${item.role}\n\n`;
}

text +=
  "============================================================\n";

text +=
  "SCIENTIFIC STORY LOCK\n";

text +=
  "============================================================\n\n";

text +=
  "HCT -> HFOSC -> Grism 7 / Grism 8\n";

text +=
  "-> optical spectroscopy\n";

text +=
  "-> IRAF reduction\n";

text +=
  "-> Specutils / EW\n";

text +=
  "-> DER SNR\n";

text +=
  "-> Monte Carlo uncertainty analysis\n";

text +=
  "-> chromospheric diagnostics\n";

text +=
  "-> AD Leo / magnetic activity science\n\n";

text +=
  "============================================================\n";

text +=
  "END OF HCT FINAL CLASSIFICATION\n";

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
  "DIYA ASTRA - HCT FINAL CLASSIFICATION REPORT\n";

report +=
  "============================================================\n\n";

report +=
  `Prepared assets          : ${finalRecords.length}\n`;

report +=
  `Reconstruction refs      : ${reconstructionReferences}\n`;

report +=
  `Cinematic real images    : ${cinematicRealImages}\n`;

report +=
  `Public candidates        : ${publicCandidates}\n`;

report +=
  `Gallery candidates       : ${galleryCandidates}\n`;

report +=
  `Reference-only assets    : ${referenceOnly}\n\n`;

report +=
  `Existing facility mapped : ${
    existingFacilityAsset.exists ? 1 : 0
  }\n`;

report +=
  "Existing public matches  : 0\n\n";

report +=
  "Orientation normalization required: NO\n";

report +=
  "Source originals modified: NO\n";

report +=
  "Public migration performed: NO\n\n";

report +=
  "Cinematic sequence defined: YES\n";

report +=
  "Gallery story defined: YES\n";

report +=
  "HFOSC scientific layer defined: YES\n";

report +=
  "IRAF/analysis pipeline defined: YES\n\n";

report +=
  "NEXT:\n";

report +=
  "Implementation-ready lock followed by optimized production derivatives.\n\n";

report +=
  "============================================================\n";

report +=
  "HCT FINAL CLASSIFICATION COMPLETE\n";

report +=
  "============================================================\n";

fs.writeFileSync(
  reportPath,
  report,
  "utf8"
);

/*
============================================================
TERMINAL
============================================================
*/

console.log("");
console.log(
  "=============================================="
);

console.log(
  "DIYA ASTRA - HCT FINAL CLASSIFICATION COMPLETE"
);

console.log(
  "=============================================="
);

console.log("");

console.log(
  `Prepared assets          : ${finalRecords.length}`
);

console.log(
  `Reconstruction refs      : ${reconstructionReferences}`
);

console.log(
  `Cinematic real images    : ${cinematicRealImages}`
);

console.log(
  `Public candidates        : ${publicCandidates}`
);

console.log(
  `Gallery candidates       : ${galleryCandidates}`
);

console.log(
  `Reference-only assets    : ${referenceOnly}`
);

console.log("");

console.log(
  `Existing facility mapped : ${
    existingFacilityAsset.exists ? 1 : 0
  }`
);

console.log("");

console.log(
  "Cinematic sequence defined: YES"
);

console.log(
  "Gallery story defined     : YES"
);

console.log(
  "Scientific pipeline locked: YES"
);

console.log("");

console.log(
  "Source originals modified : NO"
);

console.log(
  "Public migration performed: NO"
);

console.log("");

console.log("Final JSON manifest:");
console.log(finalJsonPath);

console.log("");

console.log("Final text manifest:");
console.log(finalTextPath);

console.log("");

console.log("Report:");
console.log(reportPath);

console.log("");
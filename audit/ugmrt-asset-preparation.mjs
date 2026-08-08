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

const userDir = path.join(
  ugmrtRoot,
  "source",
  "user-originals"
);

const officialDir = path.join(
  ugmrtRoot,
  "source",
  "official-web"
);

const preparedDir = path.join(
  ugmrtRoot,
  "prepared",
  "images"
);

const manifestsDir = path.join(
  ugmrtRoot,
  "manifests"
);

const jsonManifestPath = path.join(
  manifestsDir,
  "ugmrt-assets.json"
);

const textManifestPath = path.join(
  manifestsDir,
  "ugmrt-assets.txt"
);

const reportPath = path.join(
  ugmrtRoot,
  "ugmrt-preparation-report.txt"
);

fs.mkdirSync(preparedDir, { recursive: true });
fs.mkdirSync(manifestsDir, { recursive: true });

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
LOCKED SEMANTIC MAPPING
============================================================
*/

const assets = [
  {
    provenance: "USER_SUPPLIED",
    sourceFile: "GMRT_antenna_through_the_fields.jpg",
    preparedFile: "ugmrt-antenna-through-fields-day-01.jpg",

    role: "ENVIRONMENTAL_ANTENNA_REFERENCE",

    reconstructionReference: true,
    cinematicCandidate: false,
    publicCandidate: false,
    galleryCandidate: false,

    notes:
      "Low-resolution environmental reference showing a GMRT antenna within surrounding fields."
  },

  {
    provenance: "USER_SUPPLIED",
    sourceFile: "gmrt.jpg",
    preparedFile: "ugmrt-single-antenna-road-approach-day-01.jpg",

    role: "SINGLE_ANTENNA_APPROACH",

    reconstructionReference: true,
    cinematicCandidate: true,
    publicCandidate: true,
    galleryCandidate: false,

    notes:
      "Useful close physical approach view of an individual GMRT antenna."
  },

  {
    provenance: "USER_SUPPLIED",
    sourceFile: "gmrt12.jpg",
    preparedFile: "ugmrt-multiple-antennas-landscape-day-01.jpg",

    role: "MULTI_ANTENNA_ARRAY_VIEW",

    reconstructionReference: true,
    cinematicCandidate: true,
    publicCandidate: true,
    galleryCandidate: true,

    notes:
      "Strong user-supplied multi-antenna view suitable for array-scale visual storytelling."
  },

  {
    provenance: "USER_SUPPLIED",
    sourceFile: "images.jpg",
    preparedFile: "ugmrt-multiple-antennas-secondary-day-01.jpg",

    role: "SECONDARY_ARRAY_REFERENCE",

    reconstructionReference: true,
    cinematicCandidate: true,
    publicCandidate: false,
    galleryCandidate: false,

    notes:
      "Secondary multi-antenna reference retained primarily for reconstruction and visual comparison."
  },

  {
    provenance: "OFFICIAL_NCRA_GMRT",
    sourceFile: "blue-sky2-h.jpg",
    preparedFile: "ugmrt-three-antennas-blue-twilight-01.jpg",

    role: "PRIMARY_ANTENNA_CINEMATIC_REVEAL",

    reconstructionReference: true,
    cinematicCandidate: true,
    publicCandidate: true,
    galleryCandidate: true,

    notes:
      "Official GMRT/NCRA supplementary photograph selected as the primary structural/cinematic antenna reveal."
  },

  {
    provenance: "OFFICIAL_NCRA_GMRT",
    sourceFile: "gmrt_lake.jpg",
    preparedFile: "ugmrt-array-water-reflection-day-01.jpg",

    role: "PRIMARY_ARRAY_ENVIRONMENT",

    reconstructionReference: true,
    cinematicCandidate: true,
    publicCandidate: true,
    galleryCandidate: true,

    notes:
      "Official GMRT/NCRA supplementary environmental photograph showing antenna reflection and multiple-array context."
  }
];

/*
============================================================
VERIFY SOURCE FOUNDATION
============================================================
*/

if (assets.length !== 6) {
  fail(
    `Expected 6 semantic records, found ${assets.length}.`
  );
}

const preparedNameSet = new Set();

for (const asset of assets) {
  if (preparedNameSet.has(asset.preparedFile)) {
    fail(
      `Duplicate prepared filename:\n${asset.preparedFile}`
    );
  }

  preparedNameSet.add(asset.preparedFile);
}

const records = [];

for (const asset of assets) {
  const sourceDir =
    asset.provenance === "USER_SUPPLIED"
      ? userDir
      : officialDir;

  const sourcePath = path.join(
    sourceDir,
    asset.sourceFile
  );

  const preparedPath = path.join(
    preparedDir,
    asset.preparedFile
  );

  if (!fs.existsSync(sourcePath)) {
    fail(
      `Required source image missing:\n${sourcePath}`
    );
  }

  const sourceHashBefore = sha256(sourcePath);

  /*
  ============================================================
  NON-DESTRUCTIVE PREPARATION

  Copy source bytes exactly.
  Semantic filename is applied ONLY to prepared derivative.
  ============================================================
  */

  fs.copyFileSync(
    sourcePath,
    preparedPath
  );

  const sourceHashAfter = sha256(sourcePath);
  const preparedHash = sha256(preparedPath);

  if (sourceHashBefore !== sourceHashAfter) {
    fail(
      `Source integrity changed unexpectedly:\n${asset.sourceFile}`
    );
  }

  if (sourceHashBefore !== preparedHash) {
    fail(
      `Prepared copy failed byte-integrity verification:\n${asset.preparedFile}`
    );
  }

  const sourceStat = fs.statSync(sourcePath);
  const preparedStat = fs.statSync(preparedPath);

  records.push({
    ...asset,

    sourcePath: relative(sourcePath),
    preparedPath: relative(preparedPath),

    sourceBytes: sourceStat.size,
    preparedBytes: preparedStat.size,

    sourceSha256: sourceHashBefore,
    preparedSha256: preparedHash,

    byteIdenticalPreparedCopy: true,

    sourceOriginalModified: false,

    preparationState:
      "SEMANTIC_COPY_VERIFIED"
  });
}

/*
============================================================
COUNTS
============================================================
*/

const userCount = records.filter(
  (record) =>
    record.provenance === "USER_SUPPLIED"
).length;

const officialCount = records.filter(
  (record) =>
    record.provenance === "OFFICIAL_NCRA_GMRT"
).length;

const reconstructionCount = records.filter(
  (record) =>
    record.reconstructionReference
).length;

const cinematicCount = records.filter(
  (record) =>
    record.cinematicCandidate
).length;

const publicCount = records.filter(
  (record) =>
    record.publicCandidate
).length;

const galleryCount = records.filter(
  (record) =>
    record.galleryCandidate
).length;

/*
============================================================
SCIENTIFIC STORY CONTRACT
============================================================
*/

const scientificStory = {
  facility: "upgraded Giant Metrewave Radio Telescope",

  shortName: "uGMRT",

  institution:
    "National Centre for Radio Astrophysics, TIFR",

  arrayArchitecture: [
    "30 fully steerable antennas",
    "45-m diameter antennas",
    "Hybrid compact central array plus three-arm configuration",
    "Maximum interferometric baseline approximately 25 km"
  ],

  astraVisualFlow: [
    "Array environment",
    "45-m antenna structure",
    "Radio signal reception",
    "Receiver / signal chain",
    "GMRT Wideband Backend",
    "Correlation and visibility generation",
    "Calibration and imaging",
    "Scientific analysis"
  ],

  backendVisualizationPolicy:
    "Create a sourced procedural GWB/backend visualization during Project Astra implementation instead of depending on a copied backend hardware photograph.",

  diyaResearchLayer: {
    category:
      "Radio observations of magnetically active M-dwarfs",

    reductionEnvironment: [
      "AIPS",
      "CASA"
    ],

    workflow: [
      "RFI flagging",
      "Calibration",
      "Imaging",
      "Self-calibration",
      "Flux-density / source analysis"
    ],

    researchConnections: [
      "GJ 1151",
      "GJ 398",
      "AD Leo"
    ]
  }
};

/*
============================================================
JSON MANIFEST
============================================================
*/

const manifest = {
  schemaVersion: 1,

  project:
    "Diya Astrophysics Portfolio",

  system:
    "Project Astra",

  observatory:
    "uGMRT",

  sourceFoundation: {
    totalImages: records.length,
    userSuppliedImages: userCount,
    officialNcraGmrtImages: officialCount,

    sourceOriginalsModified: false,

    semanticPreparedCopiesCreated: true,

    byteIntegrityVerified: true
  },

  classificationSummary: {
    reconstructionReferences:
      reconstructionCount,

    cinematicCandidates:
      cinematicCount,

    publicCandidates:
      publicCount,

    galleryCandidates:
      galleryCount
  },

  scientificStory,

  records
};

fs.writeFileSync(
  jsonManifestPath,
  JSON.stringify(
    manifest,
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
  "DIYA ASTRA - uGMRT PREPARED ASSET MANIFEST\n";

text +=
  "============================================================\n\n";

text +=
  `TOTAL PREPARED ASSETS: ${records.length}\n`;

text +=
  `USER-SUPPLIED: ${userCount}\n`;

text +=
  `OFFICIAL NCRA/GMRT: ${officialCount}\n`;

text +=
  `RECONSTRUCTION REFERENCES: ${reconstructionCount}\n`;

text +=
  `CINEMATIC CANDIDATES: ${cinematicCount}\n`;

text +=
  `PUBLIC CANDIDATES: ${publicCount}\n`;

text +=
  `GALLERY CANDIDATES: ${galleryCount}\n\n`;

for (const record of records) {
  text +=
    "------------------------------------------------------------\n";

  text +=
    `SOURCE FILE   : ${record.sourceFile}\n`;

  text +=
    `PREPARED FILE : ${record.preparedFile}\n`;

  text +=
    `PROVENANCE    : ${record.provenance}\n`;

  text +=
    `ROLE          : ${record.role}\n`;

  text +=
    `SOURCE SHA256 : ${record.sourceSha256}\n`;

  text +=
    `PREPARED SHA  : ${record.preparedSha256}\n`;

  text +=
    `BYTE IDENTICAL: YES\n`;

  text +=
    `SOURCE MODIFIED: NO\n`;

  text +=
    `NOTES         : ${record.notes}\n\n`;
}

text +=
  "============================================================\n";

text +=
  "uGMRT SCIENTIFIC STORY FOUNDATION\n";

text +=
  "============================================================\n\n";

text +=
  "ARRAY\n";

text +=
  "-> 45-m ANTENNAS\n";

text +=
  "-> RECEIVER / SIGNAL CHAIN\n";

text +=
  "-> GWB\n";

text +=
  "-> CORRELATION / VISIBILITIES\n";

text +=
  "-> CALIBRATION\n";

text +=
  "-> IMAGING / SELF-CALIBRATION\n";

text +=
  "-> SCIENTIFIC ANALYSIS\n\n";

text +=
  "BACKEND POLICY:\n";

text +=
  "Use a sourced procedural GWB visualization during Astra implementation.\n";

text +=
  "Do not require a copied backend hardware photograph.\n\n";

text +=
  "============================================================\n";

text +=
  "uGMRT PREPARATION STAGE 1 COMPLETE\n";

text +=
  "============================================================\n";

fs.writeFileSync(
  textManifestPath,
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
  "DIYA ASTRA - uGMRT PREPARATION REPORT\n";

report +=
  "============================================================\n\n";

report +=
  `Source images verified : ${records.length}\n`;

report +=
  `Prepared copies created: ${records.length}\n\n`;

report +=
  `User-supplied          : ${userCount}\n`;

report +=
  `Official NCRA/GMRT     : ${officialCount}\n\n`;

report +=
  `Reconstruction refs    : ${reconstructionCount}\n`;

report +=
  `Cinematic candidates   : ${cinematicCount}\n`;

report +=
  `Public candidates      : ${publicCount}\n`;

report +=
  `Gallery candidates     : ${galleryCount}\n\n`;

report +=
  "Original files modified: NO\n";

report +=
  "SHA-256 integrity check: PASSED\n";

report +=
  "Semantic prepared names: YES\n";

report +=
  "Provenance preserved   : YES\n\n";

report +=
  "Prepared directory:\n";

report +=
  `${preparedDir}\n\n`;

report +=
  "NEXT:\n";

report +=
  "Audit existing uGMRT/GMRT production assets, then lock final cinematic and Gallery classification.\n\n";

report +=
  "============================================================\n";

report +=
  "uGMRT PREPARATION STAGE 1 COMPLETE\n";

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
  "DIYA ASTRA - uGMRT PREPARATION STAGE 1 COMPLETE"
);

console.log(
  "=============================================="
);

console.log("");

console.log(
  `Source images verified : ${records.length}`
);

console.log(
  `Prepared copies created: ${records.length}`
);

console.log("");

console.log(
  `User-supplied          : ${userCount}`
);

console.log(
  `Official NCRA/GMRT     : ${officialCount}`
);

console.log("");

console.log(
  `Reconstruction refs    : ${reconstructionCount}`
);

console.log(
  `Cinematic candidates   : ${cinematicCount}`
);

console.log(
  `Public candidates      : ${publicCount}`
);

console.log(
  `Gallery candidates     : ${galleryCount}`
);

console.log("");

console.log(
  "Original files modified: NO"
);

console.log(
  "SHA-256 integrity check: PASSED"
);

console.log("");

console.log(
  "Prepared images:"
);

console.log(preparedDir);

console.log("");

console.log(
  "JSON manifest:"
);

console.log(jsonManifestPath);

console.log("");

console.log(
  "Text manifest:"
);

console.log(textManifestPath);

console.log("");

console.log(
  "Preparation report:"
);

console.log(reportPath);

console.log("");
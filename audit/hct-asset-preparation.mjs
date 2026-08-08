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

const sourceDir = path.join(
  hctRoot,
  "source",
  "images"
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

const jsonManifestPath = path.join(
  manifestDir,
  "hct-assets.json"
);

const textManifestPath = path.join(
  manifestDir,
  "hct-assets.txt"
);

const reportPath = path.join(
  hctRoot,
  "hct-preparation-report.txt"
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

function ensureDir(dir) {
  fs.mkdirSync(dir, { recursive: true });
}

/*
============================================================
LOCKED VISUAL CLASSIFICATION
Derived from HCT/Hanle contact-sheet inspection.

IMPORTANT:
- Source originals are NEVER renamed.
- Source originals are NEVER modified.
- Semantic filenames apply only to prepared copies.
============================================================
*/

const assetPlan = [
  {
    source: "1667467205.jpeg",
    prepared: "hct-hanle-observatory-plateau-day-01.jpg",

    subject:
      "Wide rocky Hanle observatory plateau with multiple observatory structures",

    category: "site-environment",

    primaryRole:
      "hanle-site-establishing-shot",

    cinematicUse:
      "Wide environmental introduction before approaching HCT",

    scientificUse:
      "Hanle high-altitude observatory-site context",

    documentaryClass:
      "documentary-site-reference",

    publicCandidate: true,
    galleryCandidate: true,
    reconstructionReference: true,

    notes:
      "Strong daylight establishing image with rocky high-altitude terrain."
  },

  {
    source: "dome image.jpg",
    prepared: "hct-dome-communications-infrastructure-day-01.jpg",

    subject:
      "Close HCT dome and facility structure with foreground communication dish",

    category: "facility-infrastructure",

    primaryRole:
      "hct-infrastructure-close-view",

    cinematicUse:
      "Facility approach and infrastructure detail",

    scientificUse:
      "HCT facility and remote-observatory infrastructure context",

    documentaryClass:
      "documentary-facility-reference",

    publicCandidate: true,
    galleryCandidate: false,
    reconstructionReference: true,

    notes:
      "Useful structural reference; foreground dish should not be presented as HFOSC instrumentation."
  },

  {
    source: "Hanle-dark-sky-reserve.webp",
    prepared: "hct-hanle-dark-sky-milky-way-01.webp",

    subject:
      "Milky Way / dark-sky composition above Hanle observatory structures",

    category: "dark-sky-context",

    primaryRole:
      "hanle-night-transition",

    cinematicUse:
      "Day-to-night or dark-sky cinematic transition",

    scientificUse:
      "Illustrative dark-sky observing-environment context",

    documentaryClass:
      "illustrative-or-composite-reference",

    publicCandidate: true,
    galleryCandidate: true,
    reconstructionReference: false,

    notes:
      "Treat as illustrative/promotional dark-sky imagery unless provenance later establishes documentary status."
  },

  {
    source:
      "Himalayan-Chandra-Telescope-dome-at-Indian-Astronomical-Observatory-during-daytime.webp",

    prepared:
      "hct-himalayan-chandra-telescope-hero-day-01.webp",

    subject:
      "Himalayan Chandra Telescope dome in broad Ladakh mountain landscape",

    category: "facility-hero",

    primaryRole:
      "primary-hct-hero",

    cinematicUse:
      "Primary HCT reveal during Hanle cinematic tour",

    scientificUse:
      "Primary visual identity for the 2.01-m Himalayan Chandra Telescope",

    documentaryClass:
      "documentary-facility-reference",

    publicCandidate: true,
    galleryCandidate: true,
    reconstructionReference: true,

    notes:
      "Strongest primary HCT facility image in current source set."
  },

  {
    source: "images (1)_road.jpg",
    prepared: "hct-hanle-observatory-approach-road-01.jpg",

    subject:
      "Road approaching observatory structures across Hanle landscape",

    category: "site-approach",

    primaryRole:
      "observatory-arrival-shot",

    cinematicUse:
      "Approach-road transition before HCT reveal",

    scientificUse:
      "Physical site and observatory-access context",

    documentaryClass:
      "documentary-site-reference",

    publicCandidate: true,
    galleryCandidate: false,
    reconstructionReference: true,

    notes:
      "Useful for creating geographic continuity in the cinematic tour."
  },

  {
    source: "images (1).jpg",
    prepared: "hct-dome-rocky-terrain-low-angle-01.jpg",

    subject:
      "HCT dome viewed from below across rocky foreground",

    category: "facility-secondary",

    primaryRole:
      "terrain-to-dome-reveal",

    cinematicUse:
      "Secondary low-angle telescope reveal",

    scientificUse:
      "HCT dome and local terrain reference",

    documentaryClass:
      "documentary-facility-reference",

    publicCandidate: false,
    galleryCandidate: false,
    reconstructionReference: true,

    notes:
      "Better suited to reconstruction/reference than primary public presentation."
  },

  {
    source: "images (2).jpg",
    prepared: "hct-hanle-mountain-road-landscape-01.jpg",

    subject:
      "Hanle mountain road and broad high-altitude landscape",

    category: "site-environment",

    primaryRole:
      "hanle-landscape-context",

    cinematicUse:
      "Environmental travel/approach sequence",

    scientificUse:
      "High-altitude Ladakh observing-site environment",

    documentaryClass:
      "documentary-site-reference",

    publicCandidate: true,
    galleryCandidate: true,
    reconstructionReference: true,

    notes:
      "Useful broad environmental context rather than telescope-specific detail."
  },

  {
    source: "images.jpg",
    prepared: "hct-facility-dome-close-day-01.jpg",

    subject:
      "Close frontal/side view of HCT building and dome",

    category: "facility-detail",

    primaryRole:
      "hct-structural-detail",

    cinematicUse:
      "Close facility inspection after primary reveal",

    scientificUse:
      "HCT dome/building reconstruction reference",

    documentaryClass:
      "documentary-facility-reference",

    publicCandidate: false,
    galleryCandidate: false,
    reconstructionReference: true,

    notes:
      "Strong structural reference but lower presentation quality than primary hero views."
  },

  {
    source: "indian-astronomical-observator.jpg",
    prepared: "hct-himalayan-chandra-telescope-overview-day-02.jpg",

    subject:
      "Wide frontal HCT facility view with access road and surrounding mountains",

    category: "facility-hero",

    primaryRole:
      "secondary-hct-hero",

    cinematicUse:
      "Secondary facility overview / transition into instrumentation story",

    scientificUse:
      "HCT facility overview in Hanle environment",

    documentaryClass:
      "documentary-facility-reference",

    publicCandidate: true,
    galleryCandidate: true,
    reconstructionReference: true,

    notes:
      "Strong secondary HCT overview complementing the primary hero image."
  }
];

/*
============================================================
VERIFY DIRECTORIES
============================================================
*/

if (!fs.existsSync(sourceDir)) {
  fail(`HCT source directory not found:\n${sourceDir}`);
}

ensureDir(preparedDir);
ensureDir(manifestDir);

/*
============================================================
VERIFY EXACT SOURCE SET
============================================================
*/

const allowedExtensions = new Set([
  ".jpg",
  ".jpeg",
  ".png",
  ".webp",
  ".tif",
  ".tiff"
]);

const actualSourceFiles = fs
  .readdirSync(sourceDir)
  .filter((name) =>
    allowedExtensions.has(
      path.extname(name).toLowerCase()
    )
  )
  .sort((a, b) =>
    a.localeCompare(b, undefined, {
      numeric: true,
      sensitivity: "base"
    })
  );

if (actualSourceFiles.length !== 9) {
  fail(
    `Expected exactly 9 HCT source images, found ${actualSourceFiles.length}.`
  );
}

for (const asset of assetPlan) {
  const sourcePath = path.join(
    sourceDir,
    asset.source
  );

  if (!fs.existsSync(sourcePath)) {
    fail(
      `Expected source image missing:\n${asset.source}`
    );
  }
}

/*
============================================================
PROTECT AGAINST ACCIDENTAL SEMANTIC NAME COLLISIONS
============================================================
*/

const semanticNames = assetPlan.map(
  (asset) => asset.prepared.toLowerCase()
);

if (
  new Set(semanticNames).size !==
  semanticNames.length
) {
  fail(
    "Duplicate semantic prepared filenames detected in asset plan."
  );
}

/*
============================================================
CREATE PREPARED COPIES
============================================================
*/

const records = [];

for (let i = 0; i < assetPlan.length; i++) {
  const asset = assetPlan[i];

  const sourcePath = path.join(
    sourceDir,
    asset.source
  );

  const preparedPath = path.join(
    preparedDir,
    asset.prepared
  );

  const sourceHashBefore = sha256(sourcePath);
  const sourceStat = fs.statSync(sourcePath);

  /*
  Copy only.

  No source rename.
  No source modification.
  No image recompression.
  No orientation manipulation.
  */

  fs.copyFileSync(
    sourcePath,
    preparedPath
  );

  const sourceHashAfter = sha256(sourcePath);
  const preparedHash = sha256(preparedPath);
  const preparedStat = fs.statSync(preparedPath);

  if (sourceHashBefore !== sourceHashAfter) {
    fail(
      `Source integrity changed unexpectedly:\n${asset.source}`
    );
  }

  if (sourceHashBefore !== preparedHash) {
    fail(
      `Prepared copy failed SHA-256 integrity verification:\n${asset.source}`
    );
  }

  records.push({
    id: `HCT-${String(i + 1).padStart(2, "0")}`,

    sourceFile: asset.source,
    preparedFile: asset.prepared,

    sourcePath: relative(sourcePath),
    preparedPath: relative(preparedPath),

    sourceExtension:
      path.extname(asset.source).toLowerCase(),

    preparedExtension:
      path.extname(asset.prepared).toLowerCase(),

    sourceBytes: sourceStat.size,
    preparedBytes: preparedStat.size,

    sha256: sourceHashBefore,

    integrityVerified: true,

    sourceModified: false,

    visualClassification: {
      subject: asset.subject,
      category: asset.category,
      primaryRole: asset.primaryRole,
      cinematicUse: asset.cinematicUse,
      scientificUse: asset.scientificUse,
      documentaryClass:
        asset.documentaryClass,
      notes: asset.notes
    },

    preliminarySelection: {
      publicCandidate:
        asset.publicCandidate,

      galleryCandidate:
        asset.galleryCandidate,

      reconstructionReference:
        asset.reconstructionReference
    },

    implementationStatus:
      "PREPARED_REFERENCE_ONLY",

    finalSelectionLocked:
      false
  });
}

/*
============================================================
VERIFY PREPARED DIRECTORY
============================================================
*/

const preparedFiles = fs
  .readdirSync(preparedDir)
  .filter((name) =>
    allowedExtensions.has(
      path.extname(name).toLowerCase()
    )
  )
  .sort();

if (preparedFiles.length !== 9) {
  fail(
    `Expected 9 prepared HCT images, found ${preparedFiles.length}.`
  );
}

/*
============================================================
BUILD JSON MANIFEST
============================================================
*/

const manifest = {
  project:
    "Diya Astrophysics Portfolio",

  system:
    "Project Astra",

  observatory:
    "Himalayan Chandra Telescope / Hanle",

  stage:
    "HCT Asset Preparation Stage 1",

  status:
    "PREPARED_AND_INTEGRITY_VERIFIED",

  sourceProtection: {
    originalCount: 9,
    originalsRenamed: false,
    originalsModified: false,
    originalsMoved: false,
    recompressionPerformed: false
  },

  preparation: {
    preparedCount: records.length,
    semanticNamingApplied:
      true,
    byteIdenticalCopies:
      true,
    sha256IntegrityVerified:
      true,
    finalImplementationSelectionLocked:
      false
  },

  scientificContext: {
    telescope:
      "2.01-m Himalayan Chandra Telescope",

    site:
      "Indian Astronomical Observatory, Hanle, Ladakh",

    instrument:
      "HFOSC",

    instrumentExpanded:
      "Hanle Faint Object Spectrograph and Camera",

    observingModesRelevantToDiya: [
      "Optical spectroscopy",
      "Grism 7",
      "Grism 8"
    ],

    reductionAndAnalysisContext: [
      "IRAF",
      "Specutils",
      "DER SNR",
      "Monte Carlo equivalent-width uncertainty analysis"
    ],

    integrationRule:
      "Facility photographs provide real site/telescope context. HFOSC, grisms, spectra and reduction pipeline must be presented as a separate scientifically sourced information layer and must not be falsely attributed to objects visible in generic facility photographs."
  },

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
BUILD TEXT MANIFEST
============================================================
*/

let text = "";

text +=
  "============================================================\n";

text +=
  "DIYA ASTRA - HCT / HANLE PREPARED ASSET MANIFEST\n";

text +=
  "============================================================\n\n";

text +=
  `TOTAL SOURCE IMAGES   : ${actualSourceFiles.length}\n`;

text +=
  `TOTAL PREPARED COPIES : ${records.length}\n`;

text +=
  "SOURCE ORIGINALS MODIFIED: NO\n";

text +=
  "SHA-256 INTEGRITY CHECK   : PASSED\n";

text +=
  "FINAL IMPLEMENTATION LOCK : NOT YET\n\n";

for (const record of records) {
  text +=
    "------------------------------------------------------------\n";

  text += `${record.id}\n\n`;

  text +=
    `SOURCE:\n${record.sourceFile}\n\n`;

  text +=
    `PREPARED:\n${record.preparedFile}\n\n`;

  text +=
    `CATEGORY:\n${record.visualClassification.category}\n\n`;

  text +=
    `SUBJECT:\n${record.visualClassification.subject}\n\n`;

  text +=
    `PRIMARY ROLE:\n${record.visualClassification.primaryRole}\n\n`;

  text +=
    `CINEMATIC USE:\n${record.visualClassification.cinematicUse}\n\n`;

  text +=
    `SCIENTIFIC USE:\n${record.visualClassification.scientificUse}\n\n`;

  text +=
    `DOCUMENTARY CLASS:\n${record.visualClassification.documentaryClass}\n\n`;

  text +=
    `PUBLIC CANDIDATE: ${
      record.preliminarySelection.publicCandidate
        ? "YES"
        : "NO"
    }\n`;

  text +=
    `GALLERY CANDIDATE: ${
      record.preliminarySelection.galleryCandidate
        ? "YES"
        : "NO"
    }\n`;

  text +=
    `RECONSTRUCTION REFERENCE: ${
      record.preliminarySelection.reconstructionReference
        ? "YES"
        : "NO"
    }\n\n`;

  text +=
    `SHA-256:\n${record.sha256}\n\n`;

  text +=
    `NOTES:\n${record.visualClassification.notes}\n\n`;
}

text +=
  "============================================================\n";

text +=
  "END OF HCT PREPARED ASSET MANIFEST\n";

text +=
  "============================================================\n";

fs.writeFileSync(
  textManifestPath,
  text,
  "utf8"
);

/*
============================================================
PREPARATION REPORT
============================================================
*/

const publicCandidates =
  records.filter(
    (record) =>
      record.preliminarySelection.publicCandidate
  ).length;

const galleryCandidates =
  records.filter(
    (record) =>
      record.preliminarySelection.galleryCandidate
  ).length;

const reconstructionReferences =
  records.filter(
    (record) =>
      record.preliminarySelection.reconstructionReference
  ).length;

const illustrativeAssets =
  records.filter(
    (record) =>
      record.visualClassification.documentaryClass ===
      "illustrative-or-composite-reference"
  ).length;

let report = "";

report +=
  "============================================================\n";

report +=
  "DIYA ASTRA - HCT PREPARATION STAGE 1 REPORT\n";

report +=
  "============================================================\n\n";

report +=
  `Source images verified       : ${records.length}\n`;

report +=
  `Prepared copies created      : ${records.length}\n`;

report +=
  `Public candidates            : ${publicCandidates}\n`;

report +=
  `Gallery candidates           : ${galleryCandidates}\n`;

report +=
  `Reconstruction references    : ${reconstructionReferences}\n`;

report +=
  `Illustrative/composite refs  : ${illustrativeAssets}\n\n`;

report +=
  "Original files modified      : NO\n";

report +=
  "Original files renamed       : NO\n";

report +=
  "Original files moved         : NO\n";

report +=
  "Prepared copies recompressed : NO\n";

report +=
  "SHA-256 integrity check      : PASSED\n\n";

report +=
  "IMPORTANT SCIENTIFIC RULE:\n";

report +=
  "HCT facility photographs must not be presented as photographs\n";

report +=
  "of HFOSC, Grism 7, Grism 8 or Diya's reduction pipeline unless\n";

report +=
  "a future asset explicitly depicts that instrumentation.\n\n";

report +=
  "HFOSC / IRAF / Specutils / DER SNR / Monte Carlo information\n";

report +=
  "will be integrated as a separate scientifically sourced layer.\n\n";

report +=
  "NEXT:\n";

report +=
  "Orientation/technical normalization check, existing-production\n";

report +=
  "asset audit, final classification, implementation lock and\n";

report +=
  "optimized production derivatives.\n\n";

report +=
  "============================================================\n";

report +=
  "HCT PREPARATION STAGE 1 COMPLETE\n";

report +=
  "============================================================\n";

fs.writeFileSync(
  reportPath,
  report,
  "utf8"
);

/*
============================================================
TERMINAL OUTPUT
============================================================
*/

console.log("");
console.log(
  "=============================================="
);

console.log(
  "DIYA ASTRA - HCT PREPARATION STAGE 1 COMPLETE"
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
  `Public candidates      : ${publicCandidates}`
);

console.log(
  `Gallery candidates     : ${galleryCandidates}`
);

console.log(
  `Reconstruction refs    : ${reconstructionReferences}`
);

console.log("");

console.log(
  "Original files modified: NO"
);

console.log(
  "SHA-256 integrity check: PASSED"
);

console.log("");

console.log("Prepared images:");
console.log(preparedDir);

console.log("");

console.log("JSON manifest:");
console.log(jsonManifestPath);

console.log("");

console.log("Text manifest:");
console.log(textManifestPath);

console.log("");

console.log("Preparation report:");
console.log(reportPath);

console.log("");
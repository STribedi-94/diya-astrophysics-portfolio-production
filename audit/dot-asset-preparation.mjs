import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";

const root = process.cwd();

const dotRoot = path.join(
  root,
  "asset-preparation",
  "observatories",
  "dot"
);

const sourceDir = path.join(dotRoot, "source-originals");
const preparedDir = path.join(dotRoot, "prepared");
const preparedImagesDir = path.join(preparedDir, "images");
const manifestsDir = path.join(dotRoot, "manifests");

const manifestJsonPath = path.join(
  manifestsDir,
  "dot-assets.json"
);

const manifestTextPath = path.join(
  manifestsDir,
  "dot-assets.txt"
);

const reportPath = path.join(
  dotRoot,
  "dot-preparation-report.txt"
);

const assets = [
  {
    source: "IMG_20221119_110751.jpg",
    target: "dot-site-approach-visit-01.jpg",
    priority: "medium",
    roles: ["site", "approach-road", "vegetation", "visit-story"],
    orientation: 1,
    publicCandidate: true
  },
  {
    source: "IMG_20221119_113343.jpg",
    target: "dot-visit-mountain-overlook-01.jpg",
    priority: "medium",
    roles: ["visit-story", "terrain", "mountain-overlook"],
    orientation: 1,
    publicCandidate: true
  },
  {
    source: "IMG_20221119_113413.jpg",
    target: "dot-visit-mountain-overlook-02.jpg",
    priority: "high",
    roles: ["visit-story", "terrain", "mountain-overlook"],
    orientation: 1,
    publicCandidate: true
  },
  {
    source: "IMG_20221119_114544.jpg",
    target: "dot-terrain-forested-ridges-day-01.jpg",
    priority: "very-high",
    roles: [
      "terrain",
      "forested-ridges",
      "atmospheric-depth",
      "cinematic-reference"
    ],
    orientation: 1,
    publicCandidate: false
  },
  {
    source: "IMG_20221119_130336.jpg",
    target: "dot-terrain-forested-ridges-day-02.jpg",
    priority: "high",
    roles: [
      "terrain",
      "forest",
      "ridge-depth",
      "cinematic-reference"
    ],
    orientation: 3,
    publicCandidate: false
  },
  {
    source: "IMG_20221119_170857.jpg",
    target: "dot-lighting-sunset-ridges-01.jpg",
    priority: "very-high",
    roles: [
      "lighting",
      "sunset",
      "terrain",
      "cinematic-reference"
    ],
    orientation: 1,
    publicCandidate: true
  },
  {
    source: "IMG_20221119_170911.jpg",
    target: "dot-lighting-sunset-ridges-02.jpg",
    priority: "medium",
    roles: ["lighting", "sunset", "terrain"],
    orientation: 1,
    publicCandidate: false
  },
  {
    source: "IMG_20221119_170915.jpg",
    target: "dot-lighting-sunset-ridges-03.jpg",
    priority: "high",
    roles: [
      "lighting",
      "sunset-to-dusk",
      "terrain",
      "cinematic-reference"
    ],
    orientation: 1,
    publicCandidate: false
  },
  {
    source: "IMG_20221119_174144.jpg",
    target: "dot-lighting-blue-hour-site-01.jpg",
    priority: "medium",
    roles: ["lighting", "blue-hour", "site"],
    orientation: 1,
    publicCandidate: false
  },
  {
    source: "IMG_20221119_174204.jpg",
    target: "dot-lighting-twilight-ridges-01.jpg",
    priority: "very-high",
    roles: [
      "lighting",
      "twilight",
      "terrain",
      "mountain-silhouette",
      "cinematic-reference"
    ],
    orientation: 1,
    publicCandidate: true
  },
  {
    source: "IMG_20221119_174240.jpg",
    target: "dot-site-dusk-detail-01.jpg",
    priority: "medium",
    roles: ["site", "dusk", "architectural-detail"],
    orientation: 1,
    publicCandidate: false
  },
  {
    source: "IMG_20221119_174248.jpg",
    target: "dot-facility-dome-blue-hour-01.jpg",
    priority: "very-high",
    roles: [
      "facility",
      "dome",
      "blue-hour",
      "cinematic-reference",
      "gallery-candidate"
    ],
    orientation: 1,
    publicCandidate: true
  },
  {
    source: "IMG_20221119_174252.jpg",
    target: "dot-facility-blue-hour-02.jpg",
    priority: "high",
    roles: [
      "facility",
      "dome",
      "blue-hour",
      "cinematic-reference"
    ],
    orientation: 1,
    publicCandidate: true
  },
  {
    source: "IMG_20221119_174255.jpg",
    target: "dot-site-blue-hour-layout-01.jpg",
    priority: "medium",
    roles: ["site", "support-building", "blue-hour"],
    orientation: 1,
    publicCandidate: false
  },
  {
    source: "IMG_20221119_174449.jpg",
    target: "dot-site-entrance-dusk-01.jpg",
    priority: "medium",
    roles: ["site", "entrance", "dusk", "architectural-detail"],
    orientation: 6,
    publicCandidate: false
  },
  {
    source: "IMG_20221119_175833.jpg",
    target: "dot-lighting-night-ridges-01.jpg",
    priority: "medium",
    roles: ["lighting", "night", "terrain"],
    orientation: 1,
    publicCandidate: false
  },
  {
    source: "IMG_20230510_115704.jpg",
    target: "dot-site-road-forest-day-01.jpg",
    priority: "very-high",
    roles: [
      "site",
      "road",
      "forest",
      "terrain",
      "cinematic-reference"
    ],
    orientation: 1,
    publicCandidate: false
  },
  {
    source: "IMG_20230510_122540.jpg",
    target: "dot-terrain-ridge-depth-day-03.jpg",
    priority: "very-high",
    roles: [
      "terrain",
      "ridge-depth",
      "forest",
      "atmospheric-depth",
      "cinematic-reference"
    ],
    orientation: 1,
    publicCandidate: false
  },
  {
    source: "IMG_20230510_122550.jpg",
    target: "dot-terrain-ridge-depth-day-04.jpg",
    priority: "very-high",
    roles: [
      "terrain",
      "ridge-depth",
      "vegetation",
      "cinematic-reference"
    ],
    orientation: 1,
    publicCandidate: false
  },
  {
    source: "IMG_20230510_122600.jpg",
    target: "dot-site-approach-visit-02.jpg",
    priority: "medium",
    roles: ["site", "facility-approach", "visit-story"],
    orientation: 1,
    publicCandidate: false
  },
  {
    source: "IMG_20230510_122603.jpg",
    target: "dot-site-approach-visit-03.jpg",
    priority: "high",
    roles: [
      "site",
      "facility-approach",
      "visit-story",
      "gallery-candidate"
    ],
    orientation: 1,
    publicCandidate: true
  },
  {
    source: "IMG_20230510_122955.jpg",
    target: "dot-facility-exterior-day-01.jpg",
    priority: "critical",
    roles: [
      "facility",
      "daylight",
      "geometry-reference",
      "cinematic-reference"
    ],
    orientation: 1,
    publicCandidate: true
  },
  {
    source: "IMG_20230510_122959.jpg",
    target: "dot-facility-exterior-day-02.jpg",
    priority: "critical",
    roles: [
      "facility",
      "daylight",
      "geometry-reference",
      "site-relationship",
      "cinematic-reference"
    ],
    orientation: 1,
    publicCandidate: true
  },
  {
    source: "IMG_20230510_123718.jpg",
    target: "dot-terrain-valley-ridges-day-01.jpg",
    priority: "high",
    roles: [
      "terrain",
      "valley",
      "ridge-depth",
      "regional-context"
    ],
    orientation: 1,
    publicCandidate: false
  },
  {
    source: "IMG_20230510_124917.jpg",
    target: "dot-terrain-panoramic-ridges-day-01.jpg",
    priority: "very-high",
    roles: [
      "terrain",
      "panorama",
      "ridge-depth",
      "atmospheric-depth",
      "cinematic-reference"
    ],
    orientation: 1,
    publicCandidate: true
  },
  {
    source: "IMG_20230510_175908.jpg",
    target: "dot-lighting-golden-hour-ridges-01.jpg",
    priority: "very-high",
    roles: [
      "lighting",
      "golden-hour",
      "terrain",
      "vegetation",
      "cinematic-reference"
    ],
    orientation: 1,
    publicCandidate: true
  },
  {
    source: "IMG_20230510_175916.jpg",
    target: "dot-lighting-golden-hour-ridges-02.jpg",
    priority: "very-high",
    roles: [
      "lighting",
      "golden-hour",
      "terrain",
      "cinematic-reference",
      "gallery-candidate"
    ],
    orientation: 1,
    publicCandidate: true
  }
];

function sha256(filePath) {
  const hash = crypto.createHash("sha256");
  hash.update(fs.readFileSync(filePath));
  return hash.digest("hex");
}

function ensureDir(dir) {
  fs.mkdirSync(dir, { recursive: true });
}

function fail(message) {
  console.error(`ERROR: ${message}`);
  process.exit(1);
}

if (!fs.existsSync(sourceDir)) {
  fail(`Source directory does not exist:\n${sourceDir}`);
}

const sourceFiles = fs
  .readdirSync(sourceDir)
  .filter((name) =>
    /\.(jpg|jpeg|png|webp|tif|tiff)$/i.test(name)
  )
  .sort();

if (sourceFiles.length !== 27) {
  fail(
    `Expected 27 source images but found ${sourceFiles.length}.`
  );
}

const expectedSources = assets
  .map((asset) => asset.source)
  .sort();

const missing = expectedSources.filter(
  (name) => !sourceFiles.includes(name)
);

const unexpected = sourceFiles.filter(
  (name) => !expectedSources.includes(name)
);

if (missing.length > 0) {
  fail(`Missing source images:\n${missing.join("\n")}`);
}

if (unexpected.length > 0) {
  fail(`Unexpected source images:\n${unexpected.join("\n")}`);
}

ensureDir(preparedDir);
ensureDir(preparedImagesDir);
ensureDir(manifestsDir);

const manifest = {
  observatory: {
    id: "dot",
    shortName: "DOT",
    fullName: "3.6-m Devasthal Optical Telescope",
    site: "Devasthal Observatory",
    environmentIdentity: "Forested Himalayan",
    preparationMode: "non-destructive",
    originalCount: 27
  },

  policy: {
    originalsUntouched: true,
    preparedImagesAreCopies: true,
    publicCandidateDoesNotEqualApprovedPublicAsset: true,
    provenanceReviewRequiredBeforePublicUse: true,
    imageOptimizationDeferred: true,
    orientationNormalizationDeferred: true
  },

  notes: {
    orientation3:
      "IMG_20221119_130336.jpg carries EXIF orientation 3 and requires normalized derivative generation before final production use.",
    orientation6:
      "IMG_20221119_174449.jpg carries EXIF orientation 6 and requires normalized derivative generation before final production use."
  },

  assets: []
};

let textManifest = "";
let report = "";

textManifest +=
  "============================================================\n";
textManifest +=
  "DIYA ASTRA - DOT ASSET MANIFEST\n";
textManifest +=
  "============================================================\n\n";

report +=
  "============================================================\n";
report +=
  "DIYA ASTRA - DOT PREPARATION REPORT\n";
report +=
  "============================================================\n\n";

report += `Production Root:\n${root}\n\n`;
report += `DOT Root:\n${dotRoot}\n\n`;
report += `Source Directory:\n${sourceDir}\n\n`;
report += `Prepared Directory:\n${preparedImagesDir}\n\n`;

let copied = 0;

for (const [index, asset] of assets.entries()) {
  const sourcePath = path.join(
    sourceDir,
    asset.source
  );

  const targetPath = path.join(
    preparedImagesDir,
    asset.target
  );

  if (!fs.existsSync(sourcePath)) {
    fail(`Source disappeared during preparation: ${asset.source}`);
  }

  /*
   * IMPORTANT:
   * This is intentionally a byte-for-byte COPY.
   *
   * We do NOT rotate, crop, recompress, recolor,
   * resize, or overwrite the archival original.
   *
   * Orientation-normalized and optimized derivatives
   * will be generated in the next controlled stage.
   */
  fs.copyFileSync(sourcePath, targetPath);

  const sourceStat = fs.statSync(sourcePath);
  const targetStat = fs.statSync(targetPath);

  const sourceHash = sha256(sourcePath);
  const targetHash = sha256(targetPath);

  if (sourceHash !== targetHash) {
    fail(
      `Integrity verification failed for ${asset.source}`
    );
  }

  copied += 1;

  const record = {
    id: `dot-${String(index + 1).padStart(2, "0")}`,
    sourceFile: asset.source,
    preparedFile: asset.target,

    sourceRelativePath: path
      .relative(root, sourcePath)
      .replaceAll("\\", "/"),

    preparedRelativePath: path
      .relative(root, targetPath)
      .replaceAll("\\", "/"),

    priority: asset.priority,
    roles: asset.roles,

    exifOrientation: asset.orientation,

    requiresOrientationNormalization:
      asset.orientation !== 1,

    publicCandidate: asset.publicCandidate,

    publicApproved: false,

    sourceBytes: sourceStat.size,
    preparedBytes: targetStat.size,

    sha256: sourceHash,

    integrityVerified: sourceHash === targetHash
  };

  manifest.assets.push(record);

  textManifest +=
    `${String(index + 1).padStart(2, "0")}. ${asset.target}\n`;

  textManifest +=
    `    Source: ${asset.source}\n`;

  textManifest +=
    `    Priority: ${asset.priority}\n`;

  textManifest +=
    `    Roles: ${asset.roles.join(", ")}\n`;

  textManifest +=
    `    EXIF orientation: ${asset.orientation}\n`;

  textManifest +=
    `    Orientation normalization required: ${
      asset.orientation !== 1 ? "YES" : "NO"
    }\n`;

  textManifest +=
    `    Public candidate: ${
      asset.publicCandidate ? "YES" : "NO"
    }\n`;

  textManifest +=
    `    Public approved: NO\n`;

  textManifest +=
    `    SHA-256: ${sourceHash}\n\n`;
}

fs.writeFileSync(
  manifestJsonPath,
  JSON.stringify(manifest, null, 2),
  "utf8"
);

fs.writeFileSync(
  manifestTextPath,
  textManifest,
  "utf8"
);

report += `Expected source images: 27\n`;
report += `Verified source images: ${sourceFiles.length}\n`;
report += `Prepared copies created: ${copied}\n\n`;

report +=
  "SOURCE ORIGINAL MODIFICATION:\nNONE\n\n";

report +=
  "BYTE-FOR-BYTE COPY INTEGRITY:\nVERIFIED USING SHA-256\n\n";

report +=
  "ORIENTATION NORMALIZATION REQUIRED LATER:\n";

for (const asset of assets.filter(
  (item) => item.orientation !== 1
)) {
  report +=
    `${asset.source} -> EXIF orientation ${asset.orientation}\n`;
}

report += "\n";

report +=
  "PUBLIC ASSET APPROVAL:\nNOT YET PERFORMED\n\n";

report +=
  "IMAGE OPTIMIZATION:\nNOT YET PERFORMED\n\n";

report +=
  "FINAL PRODUCTION ASSET MIGRATION:\nNOT YET PERFORMED\n\n";

report +=
  "============================================================\n";
report +=
  "DOT PREPARATION STAGE 1 COMPLETE\n";
report +=
  "============================================================\n";

fs.writeFileSync(
  reportPath,
  report,
  "utf8"
);

console.log("");
console.log("==============================================");
console.log("DIYA ASTRA - DOT PREPARATION STAGE 1 COMPLETE");
console.log("==============================================");
console.log("");
console.log(`Source images verified : ${sourceFiles.length}`);
console.log(`Prepared copies created: ${copied}`);
console.log("");
console.log("Original files modified: NO");
console.log("SHA-256 integrity check: PASSED");
console.log("");
console.log("Prepared images:");
console.log(preparedImagesDir);
console.log("");
console.log("JSON manifest:");
console.log(manifestJsonPath);
console.log("");
console.log("Text manifest:");
console.log(manifestTextPath);
console.log("");
console.log("Preparation report:");
console.log(reportPath);
console.log("");
console.log(
  "Orientation normalization still required for 2 prepared images."
);
console.log("");
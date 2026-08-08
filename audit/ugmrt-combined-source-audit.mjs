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

const outputPath = path.join(
  ugmrtRoot,
  "ugmrt-combined-source-audit.txt"
);

const imageExtensions = new Set([
  ".jpg",
  ".jpeg",
  ".png",
  ".webp",
  ".tif",
  ".tiff"
]);

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

function formatBytes(bytes) {
  if (bytes < 1024) return `${bytes} B`;

  if (bytes < 1024 * 1024) {
    return `${(bytes / 1024).toFixed(2)} KB`;
  }

  return `${(bytes / 1024 / 1024).toFixed(2)} MB`;
}

function relative(filePath) {
  return path
    .relative(root, filePath)
    .replaceAll("\\", "/");
}

function scanDirectory(dir, provenance) {
  if (!fs.existsSync(dir)) {
    fail(`Source directory missing:\n${dir}`);
  }

  const entries = fs.readdirSync(
    dir,
    { withFileTypes: true }
  );

  const files = entries
    .filter((entry) => entry.isFile())
    .map((entry) => entry.name)
    .sort((a, b) =>
      a.localeCompare(b, undefined, {
        numeric: true,
        sensitivity: "base"
      })
    );

  return files.map((file) => {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);
    const ext = path.extname(file).toLowerCase();

    return {
      provenance,
      file,
      fullPath,
      relativePath: relative(fullPath),
      extension: ext,
      isImage: imageExtensions.has(ext),
      bytes: stat.size,
      humanSize: formatBytes(stat.size),
      sha256: sha256(fullPath)
    };
  });
}

const userRecords = scanDirectory(
  userDir,
  "USER_SUPPLIED"
);

const officialRecords = scanDirectory(
  officialDir,
  "OFFICIAL_NCRA_GMRT"
);

const allRecords = [
  ...userRecords,
  ...officialRecords
];

const imageRecords = allRecords.filter(
  (record) => record.isImage
);

const nonImageRecords = allRecords.filter(
  (record) => !record.isImage
);

const totalBytes = imageRecords.reduce(
  (sum, record) => sum + record.bytes,
  0
);

/*
============================================================
EXPECTED SOURCE FOUNDATION
============================================================
*/

const expectedUserImages = 4;
const expectedOfficialImages = 2;
const expectedTotalImages = 6;

const userImageCount = userRecords.filter(
  (record) => record.isImage
).length;

const officialImageCount = officialRecords.filter(
  (record) => record.isImage
).length;

if (userImageCount !== expectedUserImages) {
  fail(
    `Expected ${expectedUserImages} user-supplied images, found ${userImageCount}.`
  );
}

if (officialImageCount !== expectedOfficialImages) {
  fail(
    `Expected ${expectedOfficialImages} official images, found ${officialImageCount}.`
  );
}

if (imageRecords.length !== expectedTotalImages) {
  fail(
    `Expected ${expectedTotalImages} total uGMRT images, found ${imageRecords.length}.`
  );
}

/*
============================================================
DUPLICATE CHECK
============================================================
*/

const hashGroups = new Map();

for (const record of imageRecords) {
  if (!hashGroups.has(record.sha256)) {
    hashGroups.set(
      record.sha256,
      []
    );
  }

  hashGroups
    .get(record.sha256)
    .push(record);
}

const duplicateGroups = [
  ...hashGroups.values()
].filter((group) => group.length > 1);

/*
============================================================
REPORT
============================================================
*/

let report = "";

report +=
  "============================================================\n";

report +=
  "DIYA ASTRA - uGMRT COMBINED SOURCE AUDIT\n";

report +=
  "============================================================\n\n";

report += `PRODUCTION ROOT:\n${root}\n\n`;

report +=
  "============================================================\n";

report +=
  "SOURCE FOUNDATION SUMMARY\n";

report +=
  "============================================================\n\n";

report +=
  `User-supplied images      : ${userImageCount}\n`;

report +=
  `Official NCRA/GMRT images : ${officialImageCount}\n`;

report +=
  `Combined image count      : ${imageRecords.length}\n`;

report +=
  `Non-image files           : ${nonImageRecords.length}\n`;

report +=
  `Duplicate groups          : ${duplicateGroups.length}\n`;

report +=
  `Combined image size       : ${formatBytes(totalBytes)}\n\n`;

report +=
  "============================================================\n";

report +=
  "USER-SUPPLIED ORIGINALS\n";

report +=
  "============================================================\n\n";

userRecords.forEach((record, index) => {
  report +=
    `${String(index + 1).padStart(2, "0")}. ${record.file}\n`;

  report +=
    `TYPE       : ${record.isImage ? "IMAGE" : "NON-IMAGE"}\n`;

  report +=
    `SIZE       : ${record.humanSize} (${record.bytes} bytes)\n`;

  report +=
    `SHA-256    : ${record.sha256}\n`;

  report +=
    `PROVENANCE : USER_SUPPLIED\n`;

  report +=
    `PATH       : ${record.relativePath}\n\n`;
});

report +=
  "============================================================\n";

report +=
  "OFFICIAL NCRA / GMRT SUPPLEMENTARY SOURCES\n";

report +=
  "============================================================\n\n";

officialRecords.forEach((record, index) => {
  report +=
    `${String(index + 1).padStart(2, "0")}. ${record.file}\n`;

  report +=
    `TYPE       : ${record.isImage ? "IMAGE" : "NON-IMAGE"}\n`;

  report +=
    `SIZE       : ${record.humanSize} (${record.bytes} bytes)\n`;

  report +=
    `SHA-256    : ${record.sha256}\n`;

  report +=
    `PROVENANCE : OFFICIAL_NCRA_GMRT\n`;

  report +=
    `PATH       : ${record.relativePath}\n\n`;
});

report +=
  "============================================================\n";

report +=
  "BYTE-IDENTICAL DUPLICATE CHECK\n";

report +=
  "============================================================\n\n";

if (duplicateGroups.length === 0) {
  report +=
    "No byte-identical duplicates detected across the combined source set.\n";
} else {
  duplicateGroups.forEach(
    (group, index) => {
      report +=
        `Duplicate group ${index + 1}:\n`;

      for (const record of group) {
        report +=
          `  [${record.provenance}] ${record.file}\n`;
      }

      report += "\n";
    }
  );
}

report += "\n";

report +=
  "============================================================\n";

report +=
  "PROVENANCE / SOURCE POLICY\n";

report +=
  "============================================================\n\n";

report +=
  "USER_SUPPLIED:\n";

report +=
  "Images supplied directly for the Diya portfolio project.\n\n";

report +=
  "OFFICIAL_NCRA_GMRT:\n";

report +=
  "Supplementary reference imagery selected from the official\n";

report +=
  "GMRT / NCRA-TIFR photo-gallery resources.\n\n";

report +=
  "The two provenance classes remain separately traceable even\n";

report +=
  "after semantic prepared derivatives are created.\n\n";

report +=
  "============================================================\n";

report +=
  "SOURCE PROTECTION STATUS\n";

report +=
  "============================================================\n\n";

report +=
  "Source images modified : NO\n";

report +=
  "Source images renamed  : NO\n";

report +=
  "Source images moved    : NO\n";

report +=
  "Source images converted: NO\n\n";

report +=
  "============================================================\n";

report +=
  "uGMRT COMBINED SOURCE FOUNDATION VERIFIED\n";

report +=
  "============================================================\n";

fs.writeFileSync(
  outputPath,
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
  "DIYA ASTRA - uGMRT COMBINED SOURCE AUDIT COMPLETE"
);

console.log(
  "=============================================="
);

console.log("");

console.log(
  `User-supplied images : ${userImageCount}`
);

console.log(
  `Official GMRT images : ${officialImageCount}`
);

console.log(
  `Combined images      : ${imageRecords.length}`
);

console.log(
  `Non-image files      : ${nonImageRecords.length}`
);

console.log(
  `Duplicate groups     : ${duplicateGroups.length}`
);

console.log(
  `Combined image size  : ${formatBytes(totalBytes)}`
);

console.log("");

console.log(
  "Source images modified: NO"
);

console.log("");

console.log(
  "Audit file:"
);

console.log(outputPath);

console.log("");
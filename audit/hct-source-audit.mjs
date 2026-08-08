import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";

const root = process.cwd();

const sourceDir = path.join(
  root,
  "asset-preparation",
  "observatories",
  "hct",
  "source",
  "images"
);

const hctRoot = path.join(
  root,
  "asset-preparation",
  "observatories",
  "hct"
);

const outputPath = path.join(
  hctRoot,
  "hct-source-audit.txt"
);

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

if (!fs.existsSync(sourceDir)) {
  console.error("");
  console.error("ERROR: HCT source directory not found:");
  console.error(sourceDir);
  console.error("");
  process.exit(1);
}

const allEntries = fs.readdirSync(
  sourceDir,
  { withFileTypes: true }
);

const files = allEntries
  .filter((entry) => entry.isFile())
  .map((entry) => entry.name)
  .sort((a, b) =>
    a.localeCompare(b, undefined, {
      numeric: true,
      sensitivity: "base"
    })
  );

const imageExtensions = new Set([
  ".jpg",
  ".jpeg",
  ".png",
  ".webp",
  ".tif",
  ".tiff"
]);

const imageFiles = files.filter((file) =>
  imageExtensions.has(
    path.extname(file).toLowerCase()
  )
);

const nonImageFiles = files.filter(
  (file) => !imageFiles.includes(file)
);

let totalBytes = 0;

const records = imageFiles.map(
  (file, index) => {
    const fullPath = path.join(
      sourceDir,
      file
    );

    const stat = fs.statSync(fullPath);

    totalBytes += stat.size;

    return {
      number: index + 1,
      file,
      extension:
        path.extname(file).toLowerCase(),
      bytes: stat.size,
      humanSize: formatBytes(stat.size),
      sha256: sha256(fullPath),
      relativePath: path
        .relative(root, fullPath)
        .replaceAll("\\", "/")
    };
  }
);

const duplicateHashes = new Map();

for (const record of records) {
  if (!duplicateHashes.has(record.sha256)) {
    duplicateHashes.set(
      record.sha256,
      []
    );
  }

  duplicateHashes
    .get(record.sha256)
    .push(record.file);
}

const duplicateGroups = [
  ...duplicateHashes.values()
].filter((group) => group.length > 1);

let report = "";

report +=
  "============================================================\n";

report +=
  "DIYA ASTRA - HCT / HANLE SOURCE ASSET AUDIT\n";

report +=
  "============================================================\n\n";

report += "PRODUCTION ROOT:\n";
report += `${root}\n\n`;

report += "SOURCE DIRECTORY:\n";
report += `${sourceDir}\n\n`;

report +=
  "------------------------------------------------------------\n";

report += "SOURCE SUMMARY\n";

report +=
  "------------------------------------------------------------\n\n";

report +=
  `Total files in source folder : ${files.length}\n`;

report +=
  `Recognized image files       : ${imageFiles.length}\n`;

report +=
  `Non-image files              : ${nonImageFiles.length}\n`;

report +=
  `Total image bytes            : ${totalBytes}\n`;

report +=
  `Total image size             : ${formatBytes(totalBytes)}\n`;

report +=
  `Exact duplicate groups       : ${duplicateGroups.length}\n\n`;

report +=
  "============================================================\n";

report +=
  "SOURCE IMAGE INVENTORY\n";

report +=
  "============================================================\n\n";

for (const record of records) {
  report +=
    `${String(record.number).padStart(2, "0")}. ${record.file}\n`;

  report +=
    `Extension : ${record.extension}\n`;

  report +=
    `Size      : ${record.humanSize} (${record.bytes} bytes)\n`;

  report +=
    `SHA-256   : ${record.sha256}\n`;

  report +=
    `Path      : ${record.relativePath}\n`;

  report += "\n";
}

report +=
  "============================================================\n";

report +=
  "EXACT DUPLICATE CHECK\n";

report +=
  "============================================================\n\n";

if (duplicateGroups.length === 0) {
  report +=
    "No byte-identical duplicate source images detected.\n";
} else {
  duplicateGroups.forEach(
    (group, index) => {
      report +=
        `Duplicate group ${index + 1}:\n`;

      for (const file of group) {
        report += `  ${file}\n`;
      }

      report += "\n";
    }
  );
}

report += "\n";

report +=
  "============================================================\n";

report +=
  "NON-IMAGE FILE CHECK\n";

report +=
  "============================================================\n\n";

if (nonImageFiles.length === 0) {
  report +=
    "No non-image files detected in source folder.\n";
} else {
  for (const file of nonImageFiles) {
    report += `${file}\n`;
  }
}

report += "\n";

report +=
  "============================================================\n";

report +=
  "SOURCE PROTECTION STATUS\n";

report +=
  "============================================================\n\n";

report +=
  "This audit is READ-ONLY.\n";

report +=
  "Source images modified: NO\n";

report +=
  "Source images renamed : NO\n";

report +=
  "Source images moved   : NO\n";

report +=
  "Prepared copies made  : NO\n\n";

report +=
  "============================================================\n";

report +=
  "HCT SOURCE AUDIT COMPLETE\n";

report +=
  "============================================================\n";

fs.writeFileSync(
  outputPath,
  report,
  "utf8"
);

console.log("");
console.log(
  "=============================================="
);

console.log(
  "DIYA ASTRA - HCT SOURCE AUDIT COMPLETE"
);

console.log(
  "=============================================="
);

console.log("");

console.log(
  `Total files       : ${files.length}`
);

console.log(
  `Image files       : ${imageFiles.length}`
);

console.log(
  `Non-image files   : ${nonImageFiles.length}`
);

console.log(
  `Duplicate groups  : ${duplicateGroups.length}`
);

console.log(
  `Total image size  : ${formatBytes(totalBytes)}`
);

console.log("");

console.log(
  "Source images modified: NO"
);

console.log("");

console.log("Audit file:");
console.log(outputPath);
console.log("");
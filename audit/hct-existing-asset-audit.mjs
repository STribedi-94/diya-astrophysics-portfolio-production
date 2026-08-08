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

const outputPath = path.join(
  hctRoot,
  "hct-existing-asset-audit.txt"
);

const srcRoot = path.join(root, "src");
const publicRoot = path.join(root, "public");

const searchTerms = [
  "hct",
  "hanle",
  "himalayan",
  "chandra",
  "iao",
  "hfosc"
];

function sha256(filePath) {
  const hash = crypto.createHash("sha256");
  hash.update(fs.readFileSync(filePath));
  return hash.digest("hex");
}

function walk(dir, results = []) {
  if (!fs.existsSync(dir)) return results;

  for (const entry of fs.readdirSync(dir, {
    withFileTypes: true
  })) {
    const fullPath = path.join(dir, entry.name);

    if (entry.isDirectory()) {
      walk(fullPath, results);
    } else {
      results.push(fullPath);
    }
  }

  return results;
}

function relative(filePath) {
  return path
    .relative(root, filePath)
    .replaceAll("\\", "/");
}

function matchesTerms(filePath) {
  const lower = relative(filePath).toLowerCase();

  return searchTerms.some(
    (term) => lower.includes(term)
  );
}

const srcFiles = walk(srcRoot);
const publicFiles = walk(publicRoot);

const srcMatches = srcFiles
  .filter(matchesTerms)
  .sort();

const publicMatches = publicFiles
  .filter(matchesTerms)
  .sort();

const preparedDir = path.join(
  hctRoot,
  "prepared",
  "images"
);

const preparedFiles =
  fs.existsSync(preparedDir)
    ? fs
        .readdirSync(preparedDir)
        .filter((name) =>
          /\.(jpg|jpeg|png|webp|tif|tiff)$/i.test(name)
        )
        .sort()
    : [];

let report = "";

report +=
  "============================================================\n";

report +=
  "DIYA ASTRA - EXISTING HCT / HANLE ASSET AUDIT\n";

report +=
  "============================================================\n\n";

report += "PRODUCTION ROOT:\n";
report += `${root}\n\n`;

report +=
  "============================================================\n";

report +=
  "TECHNICAL / ORIENTATION STATUS\n";

report +=
  "============================================================\n\n";

report +=
  "Prepared source images visually reviewed: 9\n";

report +=
  "Visually incorrect orientation detected: NO\n";

report +=
  "Orientation transformation required now: NO\n";

report +=
  "Source originals modified: NO\n\n";

report +=
  "============================================================\n";

report +=
  "SRC MATCHES\n";

report +=
  "============================================================\n\n";

report +=
  `MATCH COUNT: ${srcMatches.length}\n\n`;

for (const file of srcMatches) {
  const stat = fs.statSync(file);

  report += `${relative(file)}\n`;
  report += `SIZE BYTES: ${stat.size}\n`;
  report += `SHA-256: ${sha256(file)}\n`;

  if (
    path.extname(file).toLowerCase() === ".json"
  ) {
    try {
      const json = JSON.parse(
        fs.readFileSync(file, "utf8")
      );

      report += "JSON CONTENT:\n";
      report += JSON.stringify(json, null, 2);
      report += "\n";
    } catch {
      report +=
        "JSON CONTENT: Could not parse as JSON.\n";
    }
  }

  report +=
    "\n------------------------------------------------------------\n\n";
}

report +=
  "============================================================\n";

report +=
  "PUBLIC MATCHES\n";

report +=
  "============================================================\n\n";

report +=
  `MATCH COUNT: ${publicMatches.length}\n\n`;

for (const file of publicMatches) {
  const stat = fs.statSync(file);

  report += `${relative(file)}\n`;
  report += `SIZE BYTES: ${stat.size}\n`;
  report += `SHA-256: ${sha256(file)}\n\n`;
}

report +=
  "============================================================\n";

report +=
  "HCT PREPARED ASSET INVENTORY\n";

report +=
  "============================================================\n\n";

report +=
  `PREPARED IMAGE COUNT: ${preparedFiles.length}\n\n`;

for (const file of preparedFiles) {
  report += `${file}\n`;
}

report += "\n";

report +=
  "============================================================\n";

report +=
  "SCIENTIFIC INTEGRATION LOCK\n";

report +=
  "============================================================\n\n";

report +=
  "Telescope:\n";

report +=
  "2.01-m Himalayan Chandra Telescope (HCT)\n\n";

report +=
  "Instrument:\n";

report +=
  "HFOSC - Hanle Faint Object Spectrograph and Camera\n\n";

report +=
  "Diya observing configuration:\n";

report +=
  "Optical spectroscopy; Grism 7 and Grism 8\n\n";

report +=
  "Analysis/reduction layer:\n";

report +=
  "IRAF; Specutils; DER SNR; Monte Carlo EW uncertainty analysis\n\n";

report +=
  "Important rule:\n";

report +=
  "Generic facility photographs must NOT be represented as photographs\n";

report +=
  "of HFOSC or the spectroscopic reduction pipeline.\n\n";

report +=
  "============================================================\n";

report +=
  "END OF HCT EXISTING-ASSET AUDIT\n";

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
  "DIYA ASTRA - HCT EXISTING ASSET AUDIT COMPLETE"
);

console.log(
  "=============================================="
);

console.log("");

console.log(
  `SRC matches            : ${srcMatches.length}`
);

console.log(
  `PUBLIC matches         : ${publicMatches.length}`
);

console.log(
  `Prepared HCT images    : ${preparedFiles.length}`
);

console.log("");

console.log(
  "Orientation correction : NOT REQUIRED"
);

console.log(
  "Source originals modified: NO"
);

console.log("");

console.log("Output:");
console.log(outputPath);
console.log("");
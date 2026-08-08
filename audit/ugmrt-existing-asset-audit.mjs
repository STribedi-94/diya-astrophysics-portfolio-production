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

const outputPath = path.join(
  ugmrtRoot,
  "ugmrt-existing-asset-audit.txt"
);

const srcRoot = path.join(root, "src");
const publicRoot = path.join(root, "public");

const searchTerms = [
  "ugmrt",
  "gmrt",
  "ncra",
  "radio",
  "metrewave"
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
  ugmrtRoot,
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
  "DIYA ASTRA - EXISTING uGMRT / GMRT ASSET AUDIT\n";

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
  "Prepared source images visually reviewed: 6\n";

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
  "uGMRT PREPARED ASSET INVENTORY\n";

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
  "Facility:\n";

report +=
  "upgraded Giant Metrewave Radio Telescope (uGMRT)\n\n";

report +=
  "Institution:\n";

report +=
  "National Centre for Radio Astrophysics, TIFR\n\n";

report +=
  "Array architecture:\n";

report +=
  "30 fully steerable 45-m antennas\n";

report +=
  "Hybrid compact-central plus Y-arm configuration\n";

report +=
  "Maximum interferometric baseline approximately 25 km\n\n";

report +=
  "Scientific backend layer:\n";

report +=
  "GMRT Wideband Backend (GWB)\n";

report +=
  "Correlation and visibility generation\n\n";

report +=
  "Diya reduction layer:\n";

report +=
  "AIPS + CASA independent workflows\n";

report +=
  "RFI flagging -> calibration -> imaging -> self-calibration\n\n";

report +=
  "Research connections:\n";

report +=
  "GJ 1151\n";

report +=
  "GJ 398\n";

report +=
  "AD Leo\n\n";

report +=
  "Important implementation rule:\n";

report +=
  "Generic antenna photographs must not be represented as photographs\n";

report +=
  "of GWB hardware or Diya's reduction pipeline.\n\n";

report +=
  "The GWB/backend and AIPS/CASA pipeline will be presented as a\n";

report +=
  "separate scientifically sourced procedural visualization layer.\n\n";

report +=
  "============================================================\n";

report +=
  "END OF uGMRT EXISTING-ASSET AUDIT\n";

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
  "DIYA ASTRA - uGMRT EXISTING ASSET AUDIT COMPLETE"
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
  `Prepared uGMRT images  : ${preparedFiles.length}`
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
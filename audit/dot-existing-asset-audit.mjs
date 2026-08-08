import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";

const root = process.cwd();

const outputPath = path.join(
  root,
  "asset-preparation",
  "observatories",
  "dot",
  "dot-existing-asset-audit.txt"
);

const srcAssets = path.join(root, "src", "assets");
const publicAssets = path.join(root, "public", "assets");

const knownRelevant = [
  "facility-dot.jpg",
  "gallery/research_facility_aries_devasthal_dfot_13m_visit_01.jpg.asset.json",
  "gallery/research_facility_aries_devasthal_dot_36m_observing_team_03.jpg.asset.json",
  "gallery/research_facility_aries_devasthal_dot_36m_visit_02.jpg.asset.json"
];

const searchTerms = [
  "devasthal",
  "aries",
  "dot",
  "dfot"
];

function sha256(filePath) {
  const hash = crypto.createHash("sha256");
  hash.update(fs.readFileSync(filePath));
  return hash.digest("hex");
}

function walk(dir, results = []) {
  if (!fs.existsSync(dir)) return results;

  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);

    if (entry.isDirectory()) {
      walk(full, results);
    } else {
      results.push(full);
    }
  }

  return results;
}

function relative(filePath) {
  return path.relative(root, filePath).replaceAll("\\", "/");
}

let report = "";

report += "============================================================\n";
report += "DIYA ASTRA - EXISTING DOT / DEVASTHAL ASSET AUDIT\n";
report += "============================================================\n\n";

report += `PRODUCTION ROOT:\n${root}\n\n`;

report += "============================================================\n";
report += "KNOWN RELEVANT SRC ASSETS\n";
report += "============================================================\n\n";

for (const item of knownRelevant) {
  const fullPath = path.join(srcAssets, ...item.split("/"));

  report += `PATH: ${relative(fullPath)}\n`;
  report += `EXISTS: ${fs.existsSync(fullPath) ? "YES" : "NO"}\n`;

  if (fs.existsSync(fullPath)) {
    const stat = fs.statSync(fullPath);

    report += `SIZE BYTES: ${stat.size}\n`;
    report += `SHA-256: ${sha256(fullPath)}\n`;

    if (fullPath.endsWith(".asset.json")) {
      try {
        const json = JSON.parse(fs.readFileSync(fullPath, "utf8"));

        report += "JSON CONTENT:\n";
        report += JSON.stringify(json, null, 2);
        report += "\n";
      } catch (error) {
        report += `JSON PARSE ERROR: ${error.message}\n`;
      }
    }
  }

  report += "\n------------------------------------------------------------\n\n";
}

report += "============================================================\n";
report += "ALL DOT / DEVASTHAL / ARIES / DFOT MATCHES IN SRC ASSETS\n";
report += "============================================================\n\n";

const srcFiles = walk(srcAssets);

const srcMatches = srcFiles
  .filter((file) => {
    const lower = relative(file).toLowerCase();
    return searchTerms.some((term) => lower.includes(term));
  })
  .sort();

report += `MATCH COUNT: ${srcMatches.length}\n\n`;

for (const file of srcMatches) {
  report += `${relative(file)}\n`;
}

report += "\n";

report += "============================================================\n";
report += "ALL DOT / DEVASTHAL / ARIES / DFOT MATCHES IN PUBLIC ASSETS\n";
report += "============================================================\n\n";

const publicFiles = walk(publicAssets);

const publicMatches = publicFiles
  .filter((file) => {
    const lower = relative(file).toLowerCase();
    return searchTerms.some((term) => lower.includes(term));
  })
  .sort();

report += `MATCH COUNT: ${publicMatches.length}\n\n`;

for (const file of publicMatches) {
  const stat = fs.statSync(file);

  report += `${relative(file)}\n`;
  report += `  SIZE BYTES: ${stat.size}\n`;
  report += `  SHA-256: ${sha256(file)}\n\n`;
}

report += "============================================================\n";
report += "DOT PREPARED ASSET STATUS\n";
report += "============================================================\n\n";

const dotPrepared = path.join(
  root,
  "asset-preparation",
  "observatories",
  "dot",
  "prepared",
  "images"
);

if (fs.existsSync(dotPrepared)) {
  const preparedFiles = fs
    .readdirSync(dotPrepared)
    .filter((name) => /\.(jpg|jpeg|png|webp)$/i.test(name))
    .sort();

  report += `PREPARED IMAGE COUNT: ${preparedFiles.length}\n\n`;

  for (const file of preparedFiles) {
    report += `${file}\n`;
  }
} else {
  report += "Prepared DOT directory not found.\n";
}

report += "\n\n============================================================\n";
report += "END OF EXISTING DOT ASSET AUDIT\n";
report += "============================================================\n";

fs.writeFileSync(outputPath, report, "utf8");

console.log("");
console.log("==============================================");
console.log("DIYA ASTRA - EXISTING DOT ASSET AUDIT COMPLETE");
console.log("==============================================");
console.log("");
console.log(`SRC matches   : ${srcMatches.length}`);
console.log(`PUBLIC matches: ${publicMatches.length}`);
console.log("");
console.log("Output:");
console.log(outputPath);
console.log("");
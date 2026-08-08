import fs from "node:fs";
import path from "node:path";

const root = process.cwd();

const ugmrtRoot = path.join(
  root,
  "asset-preparation",
  "observatories",
  "ugmrt"
);

const outputPath = path.join(
  ugmrtRoot,
  "ugmrt-official-source-register.txt"
);

const officialDir = path.join(
  ugmrtRoot,
  "source",
  "official-web"
);

fs.mkdirSync(
  officialDir,
  { recursive: true }
);

let report = "";

report +=
  "============================================================\n";

report +=
  "DIYA ASTRA - uGMRT OFFICIAL SUPPLEMENTARY SOURCE REGISTER\n";

report +=
  "============================================================\n\n";

report +=
  "AUTHORITATIVE SOURCE DOMAIN:\n";

report +=
  "gmrt.ncra.tifr.res.in\n\n";

report +=
  "INSTITUTION:\n";

report +=
  "National Centre for Radio Astrophysics (NCRA-TIFR)\n\n";

report +=
  "FACILITY:\n";

report +=
  "Giant Metrewave Radio Telescope / upgraded GMRT\n\n";

report +=
  "============================================================\n";

report +=
  "SUPPLEMENTARY ASSET PLAN\n";

report +=
  "============================================================\n\n";

report +=
  "OFFICIAL-01\n";

report +=
  "Required visual class: WIDE ARRAY / MULTIPLE ANTENNAS\n";

report +=
  "Purpose: interferometer scale, central/arm-array context,\n";

report +=
  "cinematic environmental establishment.\n\n";

report +=
  "OFFICIAL-02\n";

report +=
  "Required visual class: INDIVIDUAL 45-M ANTENNA STRUCTURE\n";

report +=
  "Purpose: mesh reflector, support structure, feed geometry,\n";

report +=
  "procedural reconstruction reference.\n\n";

report +=
  "OFFICIAL-03\n";

report +=
  "Required visual class: RECEIVER / BACKEND / TECHNICAL SYSTEM\n";

report +=
  "Purpose: scientific transition from received radio signal\n";

report +=
  "to receiver chain, backend processing and interferometric data.\n\n";

report +=
  "============================================================\n";

report +=
  "LOCKED FACILITY FACTS FOR ASTRA\n";

report +=
  "============================================================\n\n";

report +=
  "30 fully steerable parabolic antennas\n";

report +=
  "45-m diameter each\n";

report +=
  "Hybrid compact-central + Y-arm configuration\n";

report +=
  "Maximum interferometric baseline approximately 25 km\n";

report +=
  "uGMRT broadband receiver system\n";

report +=
  "GMRT Wideband Backend (GWB)\n\n";

report +=
  "DIYA SCIENTIFIC LAYER:\n";

report +=
  "uGMRT / GMRT radio observations of active M-dwarfs\n";

report +=
  "AIPS + CASA independent reduction workflows\n";

report +=
  "RFI flagging -> calibration -> imaging -> self-calibration\n";

report +=
  "GJ 1151 / GJ 398 / AD Leo research connections\n\n";

report +=
  "============================================================\n";

report +=
  "SOURCE GOVERNANCE\n";

report +=
  "============================================================\n\n";

report +=
  "1. Prefer official NCRA/GMRT material.\n";

report +=
  "2. Preserve downloaded official files unchanged in source/official-web.\n";

report +=
  "3. Record original URL/source page before semantic preparation.\n";

report +=
  "4. Do not imply that a generic equipment photograph depicts the GWB\n";

report +=
  "   unless the authoritative source explicitly identifies it as such.\n";

report +=
  "5. Scientific diagrams may be recreated for Astra rather than copied\n";

report +=
  "   directly if copyright/provenance is not suitable for public delivery.\n\n";

report +=
  "============================================================\n";

report +=
  "OFFICIAL SUPPLEMENTARY SOURCE REGISTER READY\n";

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
  "DIYA ASTRA - uGMRT OFFICIAL SOURCE REGISTER READY"
);

console.log(
  "=============================================="
);

console.log("");

console.log(
  "User-supplied source set : 4 images"
);

console.log(
  "Official supplementary target: 3 assets"
);

console.log(
  "Expected combined source set : ~7 assets"
);

console.log("");

console.log(
  "Official source directory:"
);

console.log(
  officialDir
);

console.log("");

console.log(
  "Register:"
);

console.log(
  outputPath
);

console.log("");
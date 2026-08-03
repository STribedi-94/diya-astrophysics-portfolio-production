/**
 * One-time About portrait migration utility.
 *
 * Replaces the Lovable portrait .asset.json import in src/routes/about.tsx
 * with the AMP Image Service while preserving all About page content,
 * metadata and presentation.
 */

import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";

const aboutFile = path.resolve(
  "src/routes/about.tsx",
);

let source = await readFile(
  aboutFile,
  "utf8",
);

const lovableImport =
  'import diyaPortrait from "@/assets/diya-ram-portrait.png.asset.json";';

const imageServiceImport =
  'import { imageService } from "@/services/images";';

const occurrences =
  source.split("diyaPortrait.url").length - 1;

if (!source.includes(lovableImport)) {
  throw new Error(
    "Expected About portrait .asset.json import was not found.",
  );
}

if (occurrences !== 3) {
  throw new Error(
    `Expected 3 diyaPortrait.url references but found ${occurrences}.`,
  );
}

source = source.replace(
  lovableImport,
  imageServiceImport,
);

source = source.replaceAll(
  "diyaPortrait.url",
  'imageService.getRequiredImage("portrait-primary").imageUrl',
);

if (
  source.includes(".asset.json") ||
  source.includes("diyaPortrait.url")
) {
  throw new Error(
    "About portrait migration left old Lovable references.",
  );
}

await writeFile(
  aboutFile,
  source,
  "utf8",
);

console.log("About portrait AMP migration completed.");
console.log("Lovable imports removed: 1");
console.log("Image Service lookups added: 3");
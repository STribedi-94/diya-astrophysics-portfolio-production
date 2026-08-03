/**
 * One-time Downloads hero migration utility.
 *
 * Replaces the Lovable Hubble hero .asset.json import in
 * src/routes/downloads.tsx with the AMP Image Service.
 */

import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";

const downloadsFile = path.resolve(
  "src/routes/downloads.tsx",
);

let source = await readFile(
  downloadsFile,
  "utf8",
);

const lovableImport =
  'import heroImage from "@/assets/hubble-ultra-deep-field.jpg.asset.json";';

const imageServiceImport =
  'import { imageService } from "@/services/images";';

const usageCount =
  source.split("heroImage.url").length - 1;

if (!source.includes(lovableImport)) {
  throw new Error(
    "Expected Downloads Hubble .asset.json import was not found.",
  );
}

if (usageCount !== 1) {
  throw new Error(
    `Expected 1 heroImage.url reference but found ${usageCount}.`,
  );
}

source = source.replace(
  lovableImport,
  imageServiceImport,
);

source = source.replace(
  "heroImage.url",
  'imageService.getRequiredImage("hubble-hero").imageUrl',
);

if (
  source.includes(
    'hubble-ultra-deep-field.jpg.asset.json',
  ) ||
  source.includes("heroImage.url")
) {
  throw new Error(
    "Downloads hero migration left old Lovable references.",
  );
}

await writeFile(
  downloadsFile,
  source,
  "utf8",
);

console.log(
  "Downloads Hubble hero AMP migration completed.",
);
console.log("Lovable imports removed: 1");
console.log("Image Service lookups added: 1");
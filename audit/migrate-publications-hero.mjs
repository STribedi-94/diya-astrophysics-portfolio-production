/**
 * One-time Publications hero migration utility.
 *
 * Replaces the Lovable Hubble hero .asset.json import in
 * src/routes/publications.index.tsx with the AMP Image Service.
 */

import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";

const publicationsFile = path.resolve(
  "src/routes/publications.index.tsx",
);

let source = await readFile(
  publicationsFile,
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
    "Expected Publications Hubble .asset.json import was not found.",
  );
}

if (usageCount !== 4) {
  throw new Error(
    `Expected 4 heroImage.url references but found ${usageCount}.`,
  );
}

source = source.replace(
  lovableImport,
  imageServiceImport,
);

source = source.replaceAll(
  "heroImage.url",
  'imageService.getRequiredImage("hubble-hero").imageUrl',
);

if (
  source.includes(
    "hubble-ultra-deep-field.jpg.asset.json",
  ) ||
  source.includes("heroImage.url")
) {
  throw new Error(
    "Publications hero migration left old Lovable references.",
  );
}

await writeFile(
  publicationsFile,
  source,
  "utf8",
);

console.log(
  "Publications Hubble hero AMP migration completed.",
);
console.log("Lovable imports removed: 1");
console.log("Image Service lookups added: 4");
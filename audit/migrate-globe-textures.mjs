/**
 * One-time Globe texture migration utility.
 *
 * Replaces Lovable Earth day/night .asset.json imports in
 * src/components/observatory/GlobeScene.tsx with the AMP Image Service.
 */

import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";

const globeFile = path.resolve(
  "src/components/observatory/GlobeScene.tsx",
);

let source = await readFile(
  globeFile,
  "utf8",
);

const dayImport =
  'import dayTex from "@/assets/globe/earth-day-2k.jpg.asset.json";';

const nightImport =
  'import nightTex from "@/assets/globe/earth-night-1k.jpg.asset.json";';

const imageServiceImport =
  'import { imageService } from "@/services/images";';

if (!source.includes(dayImport)) {
  throw new Error(
    "Expected Earth day texture .asset.json import was not found.",
  );
}

if (!source.includes(nightImport)) {
  throw new Error(
    "Expected Earth night texture .asset.json import was not found.",
  );
}

if ((source.split("dayTex.url").length - 1) !== 1) {
  throw new Error(
    "Expected exactly one dayTex.url reference.",
  );
}

if ((source.split("nightTex.url").length - 1) !== 1) {
  throw new Error(
    "Expected exactly one nightTex.url reference.",
  );
}

source = source.replace(
  dayImport,
  imageServiceImport,
);

source = source.replace(
  nightImport,
  "",
);

source = source.replace(
  "dayTex.url",
  'imageService.getRequiredImage("earth-day-texture").imageUrl',
);

source = source.replace(
  "nightTex.url",
  'imageService.getRequiredImage("earth-night-texture").imageUrl',
);

if (
  source.includes(".asset.json") ||
  source.includes("dayTex.url") ||
  source.includes("nightTex.url")
) {
  throw new Error(
    "Globe texture migration left old Lovable references.",
  );
}

await writeFile(
  globeFile,
  source,
  "utf8",
);

console.log(
  "Globe texture AMP migration completed.",
);
console.log("Lovable imports removed: 2");
console.log("Image Service lookups added: 2");
/**
 * One-time Gallery migration utility.
 *
 * Replaces Lovable .asset.json imports in src/data/gallery.ts with
 * strict Image Service lookups. Scientific and presentation metadata
 * remain unchanged.
 */

import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";

const galleryFile = path.resolve(
  "src/data/gallery.ts",
);

const replacements = new Map([
  ["a01.url", 'imageService.getRequiredImage("bsc-study").imageUrl'],
  ["a02.url", 'imageService.getRequiredImage("bsc-light-lab").imageUrl'],
  ["a03.url", 'imageService.getRequiredImage("msc-sports").imageUrl'],
  ["a04.url", 'imageService.getRequiredImage("msc-moon").imageUrl'],
  ["a05.url", 'imageService.getRequiredImage("msc-xavotsav").imageUrl'],
  ["a06.url", 'imageService.getRequiredImage("phd-thesis-5000").imageUrl'],
  ["a07.url", 'imageService.getRequiredImage("phd-thesis-hardcopy").imageUrl'],

  ["c08.url", 'imageService.getRequiredImage("teachers-day-cake").imageUrl'],
  ["c09.url", 'imageService.getRequiredImage("teachers-day-faculty").imageUrl'],
  ["c10.url", 'imageService.getRequiredImage("teachers-day-group").imageUrl'],
  ["c11.url", 'imageService.getRequiredImage("teachers-day-outdoor").imageUrl'],

  ["cf12.url", 'imageService.getRequiredImage("asi-2022-group").imageUrl'],
  ["cf13.url", 'imageService.getRequiredImage("asi-2022-poster").imageUrl'],
  ["cf14.url", 'imageService.getRequiredImage("bina").imageUrl'],
  ["cf15.url", 'imageService.getRequiredImage("bosefest-2023-facilities-01").imageUrl'],
  ["cf16.url", 'imageService.getRequiredImage("bosefest-2023-facilities-02").imageUrl'],
  ["cf17.url", 'imageService.getRequiredImage("bosefest-2023-oral-01").imageUrl'],
  ["cf18.url", 'imageService.getRequiredImage("bosefest-2023-oral-02").imageUrl'],
  ["cf19.url", 'imageService.getRequiredImage("bosefest-2023-oral-03").imageUrl'],
  ["cf20.url", 'imageService.getRequiredImage("bosefest-2024-poster-adleo").imageUrl'],
  ["cf21.url", 'imageService.getRequiredImage("bosefest-2025-flare").imageUrl'],
  ["cf22.url", 'imageService.getRequiredImage("bosefest-2025-starspots").imageUrl'],
  ["cf23.url", 'imageService.getRequiredImage("nsss-2024-poster").imageUrl'],
  ["cf24.url", 'imageService.getRequiredImage("nsss-2024-participation").imageUrl'],
  ["cf25.url", 'imageService.getRequiredImage("starformation-2024-team").imageUrl'],
  ["cf26.url", 'imageService.getRequiredImage("starformation-2024-supervisor").imageUrl'],

  ["r27.url", 'imageService.getRequiredImage("dfot-visit").imageUrl'],
  ["r28.url", 'imageService.getRequiredImage("dot-observing-team").imageUrl'],
  ["r29.url", 'imageService.getRequiredImage("dot-visit").imageUrl'],
]);

let source = await readFile(galleryFile, "utf8");

const lovableImports =
  source.match(
    /^import\s+\w+\s+from\s+["'][^"']+\.asset\.json["'];\r?\n/gm,
  ) ?? [];

if (lovableImports.length !== 29) {
  throw new Error(
    `Expected 29 Gallery .asset.json imports but found ${lovableImports.length}.`,
  );
}

source = source.replace(
  /^import\s+\w+\s+from\s+["'][^"']+\.asset\.json["'];\r?\n/gm,
  "",
);

if (!source.includes('import { imageService } from "@/services/images";')) {
  source = source.replace(
    "export type GalleryCategory",
    'import { imageService } from "@/services/images";\n\nexport type GalleryCategory',
  );
}

for (const [oldExpression, newExpression] of replacements) {
  const occurrences = source.split(oldExpression).length - 1;

  if (occurrences !== 1) {
    throw new Error(
      `Expected one occurrence of ${oldExpression}, found ${occurrences}.`,
    );
  }

  source = source.replace(
    oldExpression,
    newExpression,
  );
}

const remainingLovableReferences =
  source.match(/\.asset\.json|(?:a0[1-7]|c(?:0[8-9]|1[0-1])|cf(?:1[2-9]|2[0-6])|r2[7-9])\.url/g);

if (remainingLovableReferences) {
  throw new Error(
    `Gallery migration left old references: ${remainingLovableReferences.join(", ")}`,
  );
}

await writeFile(
  galleryFile,
  source,
  "utf8",
);

console.log("Gallery Image AMP migration completed.");
console.log(`Lovable imports removed: ${lovableImports.length}`);
console.log(`Image Service lookups added: ${replacements.size}`);
import fs from "node:fs/promises";
import path from "node:path";

const PROJECT_ROOT = process.cwd();

const OBSERVATORIES = [
  "dot",
  "hct",
  "ugmrt",
];

async function assertDirectory(directoryPath) {
  const stat = await fs.stat(directoryPath);

  if (!stat.isDirectory()) {
    throw new Error(`Expected directory: ${directoryPath}`);
  }
}

async function copyObservatoryAssets(observatoryId) {
  const sourceDirectory = path.join(
    PROJECT_ROOT,
    "asset-preparation",
    "observatories",
    observatoryId,
    "production-ready",
    "images",
  );

  const destinationDirectory = path.join(
    PROJECT_ROOT,
    "public",
    "assets",
    "images",
    "observatories",
    observatoryId,
  );

  await assertDirectory(sourceDirectory);

  await fs.mkdir(
    destinationDirectory,
    {
      recursive: true,
    },
  );

  await fs.cp(
    sourceDirectory,
    destinationDirectory,
    {
      recursive: true,
      force: true,
    },
  );

  const largeDirectory = path.join(
    destinationDirectory,
    "large",
  );

  const standardDirectory = path.join(
    destinationDirectory,
    "standard",
  );

  const largeFiles =
    await fs.readdir(
      largeDirectory,
    );

  const standardFiles =
    await fs.readdir(
      standardDirectory,
    );

  if (
    largeFiles.length === 0 ||
    standardFiles.length === 0
  ) {
    throw new Error(
      `${observatoryId}: copied derivative directory is unexpectedly empty.`,
    );
  }

  return {
    observatoryId,
    largeFiles:
      largeFiles.length,
    standardFiles:
      standardFiles.length,
    destinationDirectory,
  };
}

const results = [];

for (
  const observatoryId of
  OBSERVATORIES
) {
  results.push(
    await copyObservatoryAssets(
      observatoryId,
    ),
  );
}

console.log("");
console.log("================================================");
console.log("DIYA ASTRA - OBSERVATORY PUBLIC ASSETS READY");
console.log("================================================");
console.log("");

for (
  const result of
  results
) {
  console.log(
    `${result.observatoryId.toUpperCase()}: ${result.largeFiles} large + ${result.standardFiles} standard`,
  );

  console.log(
    `  ${result.destinationDirectory}`,
  );
}

console.log("");
console.log("Source originals modified: NO");
console.log("Production-ready derivatives modified: NO");
console.log("Public copies created/updated: YES");
console.log("");
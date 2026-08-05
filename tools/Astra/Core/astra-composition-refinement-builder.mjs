import fs from "node:fs";
import path from "node:path";
import process from "node:process";
import { fileURLToPath } from "node:url";

const currentFile =
  fileURLToPath(import.meta.url);

const repositoryRoot =
  path.resolve(
    path.dirname(currentFile),
    "..",
    "..",
    "..",
  );

const globePath =
  path.join(
    repositoryRoot,
    "src",
    "components",
    "observatory",
    "GlobeScene.tsx",
  );

const compositionPath =
  path.join(
    repositoryRoot,
    "src",
    "components",
    "observatory",
    "astra",
    "composition.ts",
  );

const tessPath =
  path.join(
    repositoryRoot,
    "src",
    "components",
    "observatory",
    "astra",
    "tess-orbit-system.ts",
  );

const backupDirectory =
  path.join(
    repositoryRoot,
    ".astra-backup",
  );

function fail(message) {
  console.error(
    `\n[Astra Composition Refinement] ERROR: ${message}\n`,
  );

  process.exit(1);
}

function log(message) {
  console.log(
    `[Astra Composition Refinement] ${message}`,
  );
}

function normalizeLineEndings(text) {
  return text.replace(/\r\n/g, "\n");
}

function replaceExactlyOnce(
  source,
  searchValue,
  replacement,
  description,
) {
  const firstIndex =
    source.indexOf(searchValue);

  if (firstIndex === -1) {
    fail(
      `Could not find expected source block: ${description}`,
    );
  }

  const secondIndex =
    source.indexOf(
      searchValue,
      firstIndex +
        searchValue.length,
    );

  if (secondIndex !== -1) {
    fail(
      `Expected exactly one source block for: ${description}`,
    );
  }

  return source.replace(
    searchValue,
    replacement,
  );
}

function replaceRegexExactlyOnce(
  source,
  pattern,
  replacement,
  description,
) {
  const matches = [
    ...source.matchAll(pattern),
  ];

  if (matches.length !== 1) {
    fail(
      `Expected exactly one match for ${description}, found ${matches.length}.`,
    );
  }

  return source.replace(
    pattern,
    replacement,
  );
}

function createTimestamp() {
  return new Date()
    .toISOString()
    .replace(/[:.]/g, "-");
}

function createBackup(
  source,
  label,
  timestamp,
) {
  fs.mkdirSync(
    backupDirectory,
    {
      recursive: true,
    },
  );

  const backupPath =
    path.join(
      backupDirectory,
      `${label}.${timestamp}`,
    );

  fs.writeFileSync(
    backupPath,
    source,
    "utf8",
  );

  log(
    `Backup created:\n${backupPath}`,
  );
}

function verifyRequiredFiles() {
  for (
    const requiredFile
    of [
      globePath,
      compositionPath,
      tessPath,
    ]
  ) {
    if (
      !fs.existsSync(
        requiredFile,
      )
    ) {
      fail(
        `Required file was not found:\n${requiredFile}`,
      );
    }
  }
}

function updateComposition(source) {
  return replaceRegexExactlyOnce(
    source,
    /    distance: 5\.05,\n    azimuth: -2\.54,\n    polar: 1\.35,/g,
    `    /*
     * Refined cinematic opening:
     *
     * - Earth retains its increased prominence;
     * - India remains immediately identifiable;
     * - the fixed world-space Sun is projected inside
     *   the initial camera frame beyond Earth's limb;
     * - negative space remains available for the Moon.
     */
    distance: 5.05,
    azimuth: -2.54,
    polar: 1.72,`,
    "canonical Sun-visible overview composition",
  );
}

function updateGlobeScene(source) {
  let updatedSource =
    source;

  updatedSource =
    replaceExactlyOnce(
      updatedSource,
      `          earthDragRotation -=
            dx * 0.006;`,
      `          /*
           * Direct-manipulation behaviour:
           * Earth follows the user's hand.
           */
          earthDragRotation +=
            dx * 0.006;`,
      "Earth drag direction correction",
    );

  updatedSource =
    replaceExactlyOnce(
      updatedSource,
      `      const essentialMotionScale =
        reducedMotion
          ? 0.28
          : 1;`,
      `      /*
       * Motion remains restrained, but must be visibly
       * perceptible within the first few seconds.
       */
      const essentialMotionScale =
        reducedMotion
          ? 0.65
          : 2.2;`,
      "recognisable Earth auto-rotation speed",
    );

  return updatedSource;
}

function updateTessSystem(source) {
  return replaceRegexExactlyOnce(
    source,
    /  const initialProgress = 0\.34;/g,
    `  /*
   * Refined opening phase keeps TESS away from both
   * the visible Sun and the India-first Earth region.
   */
  const initialProgress = 0.58;`,
    "clean TESS opening phase",
  );
}

function validateResult(
  globeSource,
  compositionSource,
  tessSource,
) {
  const requiredGlobeFragments = [
    "earthDragRotation +=",
    "? 0.65",
    ": 2.2",
  ];

  for (
    const fragment
    of requiredGlobeFragments
  ) {
    if (
      !globeSource.includes(
        fragment,
      )
    ) {
      fail(
        `GlobeScene validation failed. Missing fragment: ${fragment}`,
      );
    }
  }

    const forbiddenGlobeFragments = [
    "earthDragRotation -=",
    `const essentialMotionScale =
        reducedMotion
          ? 0.28
          : 1;`,
    ];

  for (
    const fragment
    of forbiddenGlobeFragments
  ) {
    if (
      globeSource.includes(
        fragment,
      )
    ) {
      fail(
        `GlobeScene validation failed. Legacy fragment remains: ${fragment}`,
      );
    }
  }

  const requiredCompositionFragments = [
    "distance: 5.05",
    "azimuth: -2.54",
    "polar: 1.72",
  ];

  for (
    const fragment
    of requiredCompositionFragments
  ) {
    if (
      !compositionSource.includes(
        fragment,
      )
    ) {
      fail(
        `Composition validation failed. Missing fragment: ${fragment}`,
      );
    }
  }

  if (
    !tessSource.includes(
      "const initialProgress = 0.58;",
    )
  ) {
    fail(
      "TESS opening-phase validation failed.",
    );
  }
}

function main() {
  log(
    "Starting Project Astra Phase 4.2.1 composition refinement.",
  );

  verifyRequiredFiles();

  const rawGlobeSource =
    fs.readFileSync(
      globePath,
      "utf8",
    );

  const rawCompositionSource =
    fs.readFileSync(
      compositionPath,
      "utf8",
    );

  const rawTessSource =
    fs.readFileSync(
      tessPath,
      "utf8",
    );

  const updatedGlobeSource =
    updateGlobeScene(
      normalizeLineEndings(
        rawGlobeSource,
      ),
    );

  const updatedCompositionSource =
    updateComposition(
      normalizeLineEndings(
        rawCompositionSource,
      ),
    );

  const updatedTessSource =
    updateTessSystem(
      normalizeLineEndings(
        rawTessSource,
      ),
    );

  validateResult(
    updatedGlobeSource,
    updatedCompositionSource,
    updatedTessSource,
  );

  const timestamp =
    createTimestamp();

  createBackup(
    rawGlobeSource,
    "GlobeScene.before-composition-refinement.tsx",
    timestamp,
  );

  createBackup(
    rawCompositionSource,
    "composition.before-cinematic-refinement.ts",
    timestamp,
  );

  createBackup(
    rawTessSource,
    "tess-orbit-system.before-phase-refinement.ts",
    timestamp,
  );

  fs.writeFileSync(
    globePath,
    updatedGlobeSource,
    "utf8",
  );

  fs.writeFileSync(
    compositionPath,
    updatedCompositionSource,
    "utf8",
  );

  fs.writeFileSync(
    tessPath,
    updatedTessSource,
    "utf8",
  );

  log(
    "Phase 4.2.1 composition refinement completed successfully.",
  );

  log(
    `Updated:\n${globePath}`,
  );

  log(
    `Updated:\n${compositionPath}`,
  );

  log(
    `Updated:\n${tessPath}`,
  );

  log(
    "No Git operation was performed.",
  );
}

main();
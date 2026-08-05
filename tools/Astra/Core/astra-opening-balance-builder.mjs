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
    `\n[Astra Opening Balance] ERROR: ${message}\n`,
  );

  process.exit(1);
}

function log(message) {
  console.log(
    `[Astra Opening Balance] ${message}`,
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
  const requiredFiles = [
    globePath,
    compositionPath,
    tessPath,
  ];

  for (
    const requiredFile
    of requiredFiles
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
    /    distance: 5\.05,\n    azimuth: -2\.54,\n    polar: 1\.72,/g,
    `    /*
     * Final Phase 4.2 opening-balance calibration.
     *
     * The camera is moved slightly closer and nearer to
     * Earth's equatorial plane. This keeps the fixed Sun
     * inside the frame while presenting India farther from
     * the northern limb and at a more readable scale.
     */
    distance: 4.85,
    azimuth: -2.54,
    polar: 1.60,`,
    "India-Sun opening balance",
  );
}

function updateGlobeScene(source) {
  return replaceExactlyOnce(
    source,
    `      const essentialMotionScale =
        reducedMotion
          ? 0.65
          : 2.2;`,
    `      /*
       * The rotation must be recognisable as soon as the
       * scene settles, while remaining calm and suitable
       * for an academic visualisation.
       */
      const essentialMotionScale =
        reducedMotion
          ? 0.9
          : 3.0;`,
    "final Earth rotation speed",
  );
}

function updateTessSystem(source) {
  return replaceRegexExactlyOnce(
    source,
    /  const initialProgress = 0\.58;/g,
    `  /*
   * Opening visibility phase.
   *
   * TESS begins in a clearly readable region of the orbit,
   * away from India, the Sun and the interaction controls,
   * so visitors immediately recognise the spacecraft.
   */
  const initialProgress = 0.82;`,
    "TESS opening visibility phase",
  );
}

function validateResult(
  globeSource,
  compositionSource,
  tessSource,
) {
  const requiredGlobeFragments = [
    "? 0.9",
    ": 3.0",
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

  const forbiddenGlobeBlock =
    `const essentialMotionScale =
        reducedMotion
          ? 0.65
          : 2.2;`;

  if (
    globeSource.includes(
      forbiddenGlobeBlock,
    )
  ) {
    fail(
      "GlobeScene validation failed. Previous motion calibration remains.",
    );
  }

  const requiredCompositionFragments = [
    "distance: 4.85",
    "azimuth: -2.54",
    "polar: 1.60",
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
      "const initialProgress = 0.82;",
    )
  ) {
    fail(
      "TESS opening visibility validation failed.",
    );
  }

  const forbiddenCompositionFragments = [
    "distance: 5.05",
    "polar: 1.72",
  ];

  for (
    const fragment
    of forbiddenCompositionFragments
  ) {
    if (
      compositionSource.includes(
        fragment,
      )
    ) {
      fail(
        `Composition validation failed. Previous fragment remains: ${fragment}`,
      );
    }
  }
}

function main() {
  log(
    "Starting Project Astra Phase 4.2.2 opening-balance refinement.",
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
    "GlobeScene.before-opening-balance.tsx",
    timestamp,
  );

  createBackup(
    rawCompositionSource,
    "composition.before-opening-balance.ts",
    timestamp,
  );

  createBackup(
    rawTessSource,
    "tess-orbit-system.before-opening-balance.ts",
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
    "Phase 4.2.2 opening-balance refinement completed successfully.",
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
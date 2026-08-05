import fs from "node:fs";
import path from "node:path";
import process from "node:process";
import { fileURLToPath } from "node:url";

const CURRENT_FILE = fileURLToPath(import.meta.url);
const CURRENT_DIRECTORY = path.dirname(CURRENT_FILE);

const REPOSITORY_ROOT = path.resolve(
  CURRENT_DIRECTORY,
  "..",
  "..",
  "..",
);

const GLOBE_SCENE_PATH = path.join(
  REPOSITORY_ROOT,
  "src",
  "components",
  "observatory",
  "GlobeScene.tsx",
);

const TESS_SYSTEM_PATH = path.join(
  REPOSITORY_ROOT,
  "src",
  "components",
  "observatory",
  "astra",
  "tess-orbit-system.ts",
);

const SUN_SYSTEM_PATH = path.join(
  REPOSITORY_ROOT,
  "src",
  "components",
  "observatory",
  "astra",
  "sun-system.ts",
);

const BACKUP_DIRECTORY = path.join(
  REPOSITORY_ROOT,
  ".astra-backup",
);

function fail(message) {
  console.error(
    `\n[Astra Sun Builder] ERROR: ${message}\n`,
  );

  process.exit(1);
}

function log(message) {
  console.log(
    `[Astra Sun Builder] ${message}`,
  );
}

function normalizeLineEndings(text) {
  return text.replace(/\r\n/g, "\n");
}

function createTimestamp() {
  return new Date()
    .toISOString()
    .replace(/[:.]/g, "-");
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
      `Expected exactly one regex match for ${description}, found ${matches.length}.`,
    );
  }

  return source.replace(
    pattern,
    replacement,
  );
}

function verifyRequiredFiles() {
  const requiredFiles = [
    GLOBE_SCENE_PATH,
    TESS_SYSTEM_PATH,
    SUN_SYSTEM_PATH,
  ];

  for (const requiredFile of requiredFiles) {
    if (!fs.existsSync(requiredFile)) {
      fail(
        `Required file was not found:\n${requiredFile}`,
      );
    }
  }
}

function createBackup(
  sourcePath,
  originalSource,
  label,
  timestamp,
) {
  fs.mkdirSync(
    BACKUP_DIRECTORY,
    {
      recursive: true,
    },
  );

  const backupPath = path.join(
    BACKUP_DIRECTORY,
    `${label}.${timestamp}`,
  );

  fs.writeFileSync(
    backupPath,
    originalSource,
    "utf8",
  );

  log(
    `Backup created:\n${backupPath}`,
  );
}

function validateStartingState(
  globeSource,
  tessSource,
) {
  if (
    globeSource.includes(
      'from "./astra/sun-system";',
    )
  ) {
    fail(
      "GlobeScene already imports the Sun System. The builder will not run twice.",
    );
  }

  if (
    !globeSource.includes(
      'from "./astra/tess-orbit-system";',
    )
  ) {
    fail(
      "Expected TESS Orbit System integration was not found in GlobeScene.",
    );
  }

  if (
    !globeSource.includes(
      "const tessSystem = createTessOrbitSystem({",
    )
  ) {
    fail(
      "Expected TESS Orbit System construction was not found.",
    );
  }

  if (
    !globeSource.includes(
      "const tick = () => {",
    )
  ) {
    fail(
      "GlobeScene animation loop was not found.",
    );
  }

  if (
    !tessSource.includes(
      "const sunLight =",
    )
  ) {
    fail(
      "The temporary TESS directional light was not found.",
    );
  }

  if (
    !tessSource.includes(
      "const earthshineLight =",
    )
  ) {
    fail(
      "The temporary TESS Earthshine light was not found.",
    );
  }
}

function integrateSunIntoGlobe(
  source,
) {
  let updatedSource = source;

  const tessImport = `import {
  createTessOrbitSystem,
} from "./astra/tess-orbit-system";`;

  const expandedImports = `import {
  createTessOrbitSystem,
} from "./astra/tess-orbit-system";
import {
  createAstraSunSystem,
} from "./astra/sun-system";`;

  updatedSource =
    replaceExactlyOnce(
      updatedSource,
      tessImport,
      expandedImports,
      "Sun System import insertion",
    );

  const cameraControllerBlock = `    const cameraController = new AstraCameraController(camera, {
      initialDistance: 5.4,
      initialAzimuth: 0,
      initialPolar: Math.PI / 2 - 0.28,
      minDistance: 3.2,
      maxDistance: 8.5,
    });`;

  const cameraAndSunBlock = `    const cameraController = new AstraCameraController(camera, {
      initialDistance: 5.4,
      initialAzimuth: 0,
      initialPolar: Math.PI / 2 - 0.28,
      minDistance: 3.2,
      maxDistance: 8.5,
    });

    /* ---------------- Project Diya Astra Sun system ---------------- */
    const sunSystem = createAstraSunSystem({
      scene,
      camera,
      reducedMotion,
    });

    disposables.push(sunSystem);`;

  updatedSource =
    replaceExactlyOnce(
      updatedSource,
      cameraControllerBlock,
      cameraAndSunBlock,
      "Sun System scene construction",
    );

  const tickTimingBlock = `      const now = performance.now();
      const dt = Math.min((now - lastT) / 1000, 0.05);
      lastT = now;
      if (!activeRef.current || document.hidden) return;`;

  const tickTimingWithSun = `      const now = performance.now();
      const dt = Math.min((now - lastT) / 1000, 0.05);
      lastT = now;
      if (!activeRef.current || document.hidden) return;

      sunSystem.update({
        elapsedSeconds: now / 1000,
        reducedMotion,
      });`;

  updatedSource =
    replaceExactlyOnce(
      updatedSource,
      tickTimingBlock,
      tickTimingWithSun,
      "Sun System animation update",
    );

  return updatedSource;
}

function removeTemporaryTessLights(
  source,
) {
  let updatedSource = source;

  updatedSource =
    replaceExactlyOnce(
      updatedSource,
      `import { ASTRA_SUN_DIRECTION } from "./earth-system";\n`,
      "",
      "temporary TESS Sun-direction import",
    );

    const temporaryLightingPattern =
    /  \/\*\n   \* Shared Project Diya Astra lighting\.[\s\S]*?  scene\.add\(earthshineLight\);\n\n/g;

  updatedSource =
    replaceRegexExactlyOnce(
      updatedSource,
      temporaryLightingPattern,
      "",
      "temporary TESS lighting block",
    );

  updatedSource =
    replaceExactlyOnce(
      updatedSource,
      `      scene.remove(sunLight);
      scene.remove(sunLight.target);
      scene.remove(earthshineLight);
`,
      "",
      "temporary TESS lighting disposal",
    );

  return updatedSource;
}

function validateResult(
  globeSource,
  tessSource,
) {
  const requiredGlobeFragments = [
    'from "./astra/sun-system";',
    "const sunSystem = createAstraSunSystem({",
    "disposables.push(sunSystem);",
    "sunSystem.update({",
    "elapsedSeconds: now / 1000,",
  ];

  for (
    const fragment
    of requiredGlobeFragments
  ) {
    if (
      !globeSource.includes(fragment)
    ) {
      fail(
        `Final GlobeScene validation failed. Missing fragment: ${fragment}`,
      );
    }
  }

  const forbiddenTessFragments = [
    "ASTRA_SUN_DIRECTION",
    "const sunLight =",
    "const earthshineLight =",
    "scene.add(earthshineLight)",
    "scene.remove(sunLight)",
  ];

  for (
    const fragment
    of forbiddenTessFragments
  ) {
    if (
      tessSource.includes(fragment)
    ) {
      fail(
        `Final TESS validation failed. Temporary lighting fragment remains: ${fragment}`,
      );
    }
  }

  const sunImportCount =
    globeSource.match(
      /from "\.\/astra\/sun-system";/g,
    )?.length ?? 0;

  if (sunImportCount !== 1) {
    fail(
      `Expected exactly one Sun System import, found ${sunImportCount}.`,
    );
  }

  const sunConstructionCount =
    globeSource.match(
      /createAstraSunSystem\(\{/g,
    )?.length ?? 0;

  if (
    sunConstructionCount !== 1
  ) {
    fail(
      `Expected exactly one Sun System construction, found ${sunConstructionCount}.`,
    );
  }
}

function main() {
  log(
    "Starting shared Sun System integration.",
  );

  verifyRequiredFiles();

  const rawGlobeSource =
    fs.readFileSync(
      GLOBE_SCENE_PATH,
      "utf8",
    );

  const rawTessSource =
    fs.readFileSync(
      TESS_SYSTEM_PATH,
      "utf8",
    );

  const normalizedGlobeSource =
    normalizeLineEndings(
      rawGlobeSource,
    );

  const normalizedTessSource =
    normalizeLineEndings(
      rawTessSource,
    );

  validateStartingState(
    normalizedGlobeSource,
    normalizedTessSource,
  );

  const updatedGlobeSource =
    integrateSunIntoGlobe(
      normalizedGlobeSource,
    );

  const updatedTessSource =
    removeTemporaryTessLights(
      normalizedTessSource,
    );

  validateResult(
    updatedGlobeSource,
    updatedTessSource,
  );

  const timestamp =
    createTimestamp();

  createBackup(
    GLOBE_SCENE_PATH,
    rawGlobeSource,
    `GlobeScene.before-sun-system.${timestamp}.tsx`,
    "",
  );

  createBackup(
    TESS_SYSTEM_PATH,
    rawTessSource,
    `tess-orbit-system.before-shared-sun.${timestamp}.ts`,
    "",
  );

  fs.writeFileSync(
    GLOBE_SCENE_PATH,
    updatedGlobeSource,
    "utf8",
  );

  fs.writeFileSync(
    TESS_SYSTEM_PATH,
    updatedTessSource,
    "utf8",
  );

  log(
    "Shared Sun System integration completed successfully.",
  );

  log(
    `Updated GlobeScene:\n${GLOBE_SCENE_PATH}`,
  );

  log(
    `Updated TESS System:\n${TESS_SYSTEM_PATH}`,
  );

  log(
    "No Git operation was performed.",
  );
}

main();
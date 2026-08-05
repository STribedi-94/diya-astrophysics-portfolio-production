import fs from "node:fs";
import path from "node:path";
import process from "node:process";
import { fileURLToPath } from "node:url";

const currentFile = fileURLToPath(import.meta.url);

const repositoryRoot = path.resolve(
  path.dirname(currentFile),
  "..",
  "..",
  "..",
);

const globePath = path.join(
  repositoryRoot,
  "src",
  "components",
  "observatory",
  "GlobeScene.tsx",
);

const cameraPath = path.join(
  repositoryRoot,
  "src",
  "components",
  "observatory",
  "astra",
  "camera-controller.ts",
);

const compositionPath = path.join(
  repositoryRoot,
  "src",
  "components",
  "observatory",
  "astra",
  "composition.ts",
);

const backupDirectory = path.join(
  repositoryRoot,
  ".astra-backup",
);

function fail(message) {
  console.error(
    `\n[Astra Composition Builder] ERROR: ${message}\n`,
  );

  process.exit(1);
}

function log(message) {
  console.log(
    `[Astra Composition Builder] ${message}`,
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
      firstIndex + searchValue.length,
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

function createTimestamp() {
  return new Date()
    .toISOString()
    .replace(/[:.]/g, "-");
}

function createBackup(
  sourcePath,
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

  const backupPath = path.join(
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
    cameraPath,
  ];

  for (const requiredFile of requiredFiles) {
    if (!fs.existsSync(requiredFile)) {
      fail(
        `Required file was not found:\n${requiredFile}`,
      );
    }
  }

  if (fs.existsSync(compositionPath)) {
    fail(
      "composition.ts already exists. The builder will not run twice.",
    );
  }
}

function createCompositionSource() {
  return `import * as THREE from "three";

/**
 * Canonical Project Astra overview composition.
 *
 * This object is the single authoritative source for:
 *
 * - initial Observatory framing;
 * - Restore Overview;
 * - future Moon-ready scene composition;
 * - future guided camera transitions.
 *
 * Earth remains centred at the world origin.
 * The camera is positioned so India is presented in the opening view
 * while the fixed world-space Sun remains visible beyond Earth's limb.
 */
export const ASTRA_OVERVIEW_CAMERA =
  Object.freeze({
    distance: 5.8,
    azimuth: -2.54,
    polar: 1.79,
    minDistance: 3.2,
    maxDistance: 8.5,
  });

/**
 * The canonical overview target currently remains Earth-centred.
 *
 * This function intentionally returns a new vector so camera systems
 * never share or mutate one global THREE.Vector3 instance.
 */
export function createAstraOverviewTarget() {
  return new THREE.Vector3(
    0,
    0,
    0,
  );
}
`;
}

function updateGlobeScene(source) {
  let updatedSource = source;

  const sunImport = `import {
  createAstraSunSystem,
} from "./astra/sun-system";`;

  const sunAndCompositionImports = `import {
  createAstraSunSystem,
} from "./astra/sun-system";
import {
  ASTRA_OVERVIEW_CAMERA,
} from "./astra/composition";`;

  updatedSource =
    replaceExactlyOnce(
      updatedSource,
      sunImport,
      sunAndCompositionImports,
      "Composition Engine import insertion",
    );

  const currentCameraBlock = `    const cameraController = new AstraCameraController(camera, {
      initialDistance: 5.4,
      // Phase 4.1: frame the fixed world-space Sun beyond Earth's limb.
      initialAzimuth: -2.64,
      initialPolar: 1.79,
      minDistance: 3.2,
      maxDistance: 8.5,
    });`;

  const canonicalCameraBlock = `    const cameraController = new AstraCameraController(camera, {
      initialDistance:
        ASTRA_OVERVIEW_CAMERA.distance,
      initialAzimuth:
        ASTRA_OVERVIEW_CAMERA.azimuth,
      initialPolar:
        ASTRA_OVERVIEW_CAMERA.polar,
      minDistance:
        ASTRA_OVERVIEW_CAMERA.minDistance,
      maxDistance:
        ASTRA_OVERVIEW_CAMERA.maxDistance,
    });`;

  updatedSource =
    replaceExactlyOnce(
      updatedSource,
      currentCameraBlock,
      canonicalCameraBlock,
      "canonical overview camera construction",
    );

  const currentEarthOrientation = `    earthGroup.rotation.y =
      facingRotation(78);`;

  const canonicalEarthOrientation = `    /*
     * India-first overview orientation.
     *
     * facingRotation(78) aligns India's approximate longitude
     * with the original positive-Z overview camera. The canonical
     * camera azimuth is added so India remains aligned with the
     * actual opening camera direction.
     */
    const overviewEarthRotation =
      facingRotation(78) +
      ASTRA_OVERVIEW_CAMERA.azimuth;

    earthGroup.rotation.y =
      overviewEarthRotation;`;

  updatedSource =
    replaceExactlyOnce(
      updatedSource,
      currentEarthOrientation,
      canonicalEarthOrientation,
      "India-first Earth orientation",
    );

  updatedSource =
    replaceExactlyOnce(
      updatedSource,
      `    let lastInteraction = -Infinity;\n`,
      "",
      "legacy interaction timer declaration",
    );

  updatedSource =
    updatedSource.replace(
      /^\s*lastInteraction = performance\.now\(\);\r?\n/gm,
      "",
    );

  const currentRotationBlock = `      // Slow auto-rotation, paused while the user interacts.
      const idle = performance.now() - lastInteraction > 3500;
      if (!reducedMotion && idle && reveal > 0.6) spin += (dt / SPIN_PERIOD) * Math.PI * 2;
      earthGroup.rotation.y = facingRotation(78) + spin;`;

  const deterministicRotationBlock = `      /*
       * Continuous Earth rotation.
       *
       * Hover, selection, pointer movement and wheel zoom must not
       * stop the planet. Rotation pauses only while the user is
       * actively dragging the scene.
       */
      if (
        !reducedMotion &&
        !dragging &&
        reveal > 0.6
      ) {
        spin +=
          (dt / SPIN_PERIOD) *
          Math.PI *
          2;
      }

      earthGroup.rotation.y =
        overviewEarthRotation +
        spin;`;

  updatedSource =
    replaceExactlyOnce(
      updatedSource,
      currentRotationBlock,
      deterministicRotationBlock,
      "deterministic Earth rotation behaviour",
    );

  return updatedSource;
}

function updateCameraController(source) {
  let updatedSource = source;

  updatedSource =
    replaceExactlyOnce(
      updatedSource,
      `import * as THREE from "three";`,
      `import * as THREE from "three";

import {
  ASTRA_OVERVIEW_CAMERA,
  createAstraOverviewTarget,
} from "./composition";`,
      "Composition Engine camera import",
    );

  const currentConstructorDefaults = `    this.distance = options.initialDistance ?? 5.4;
    this.azimuth = options.initialAzimuth ?? 0;
    this.polar = options.initialPolar ?? Math.PI / 2 - 0.28;
    this.minDistance = options.minDistance ?? 3.2;
    this.maxDistance = options.maxDistance ?? 8.5;`;

  const canonicalConstructorDefaults = `    this.distance =
      options.initialDistance ??
      ASTRA_OVERVIEW_CAMERA.distance;

    this.azimuth =
      options.initialAzimuth ??
      ASTRA_OVERVIEW_CAMERA.azimuth;

    this.polar =
      options.initialPolar ??
      ASTRA_OVERVIEW_CAMERA.polar;

    this.minDistance =
      options.minDistance ??
      ASTRA_OVERVIEW_CAMERA.minDistance;

    this.maxDistance =
      options.maxDistance ??
      ASTRA_OVERVIEW_CAMERA.maxDistance;`;

  updatedSource =
    replaceExactlyOnce(
      updatedSource,
      currentConstructorDefaults,
      canonicalConstructorDefaults,
      "canonical camera defaults",
    );

  const currentRestoreBlock = `    this.distance = 5.4;
      // Phase 4.1: restore the premium Earth-Sun overview composition.
    this.azimuth = -2.64;
    this.polar = 1.79;
    this.target.set(0, 0, 0);`;

  const canonicalRestoreBlock = `    this.distance =
      ASTRA_OVERVIEW_CAMERA.distance;

    this.azimuth =
      ASTRA_OVERVIEW_CAMERA.azimuth;

    this.polar =
      ASTRA_OVERVIEW_CAMERA.polar;

    this.target.copy(
      createAstraOverviewTarget(),
    );`;

  updatedSource =
    replaceExactlyOnce(
      updatedSource,
      currentRestoreBlock,
      canonicalRestoreBlock,
      "canonical Restore Overview pose",
    );

  return updatedSource;
}

function validateResult(
  globeSource,
  cameraSource,
  compositionSource,
) {
  const requiredGlobeFragments = [
    'from "./astra/composition";',
    "ASTRA_OVERVIEW_CAMERA.distance",
    "const overviewEarthRotation",
    "facingRotation(78) +",
    "!dragging &&",
    "overviewEarthRotation +",
  ];

  for (const fragment of requiredGlobeFragments) {
    if (!globeSource.includes(fragment)) {
      fail(
        `Final GlobeScene validation failed. Missing fragment: ${fragment}`,
      );
    }
  }

  const forbiddenGlobeFragments = [
    "lastInteraction",
    "const idle =",
    "initialAzimuth: -2.64",
    "earthGroup.rotation.y = facingRotation(78) + spin",
  ];

  for (const fragment of forbiddenGlobeFragments) {
    if (globeSource.includes(fragment)) {
      fail(
        `Final GlobeScene validation failed. Legacy fragment remains: ${fragment}`,
      );
    }
  }

  const requiredCameraFragments = [
    'from "./composition";',
    "ASTRA_OVERVIEW_CAMERA.distance",
    "ASTRA_OVERVIEW_CAMERA.azimuth",
    "ASTRA_OVERVIEW_CAMERA.polar",
    "createAstraOverviewTarget()",
  ];

  for (const fragment of requiredCameraFragments) {
    if (!cameraSource.includes(fragment)) {
      fail(
        `Final Camera Controller validation failed. Missing fragment: ${fragment}`,
      );
    }
  }

  const requiredCompositionFragments = [
    "export const ASTRA_OVERVIEW_CAMERA",
    "distance: 5.8",
    "azimuth: -2.54",
    "polar: 1.79",
    "createAstraOverviewTarget",
  ];

  for (const fragment of requiredCompositionFragments) {
    if (!compositionSource.includes(fragment)) {
      fail(
        `Final Composition Engine validation failed. Missing fragment: ${fragment}`,
      );
    }
  }

  const compositionImportCount =
    globeSource.match(
      /from "\.\/astra\/composition";/g,
    )?.length ?? 0;

  if (compositionImportCount !== 1) {
    fail(
      `Expected exactly one GlobeScene Composition Engine import, found ${compositionImportCount}.`,
    );
  }

  const cameraCompositionImportCount =
    cameraSource.match(
      /from "\.\/composition";/g,
    )?.length ?? 0;

  if (cameraCompositionImportCount !== 1) {
    fail(
      `Expected exactly one Camera Controller Composition Engine import, found ${cameraCompositionImportCount}.`,
    );
  }
}

function main() {
  log(
    "Starting Project Astra Composition Engine v1.0 foundation.",
  );

  verifyRequiredFiles();

  const rawGlobeSource =
    fs.readFileSync(
      globePath,
      "utf8",
    );

  const rawCameraSource =
    fs.readFileSync(
      cameraPath,
      "utf8",
    );

  const normalizedGlobeSource =
    normalizeLineEndings(
      rawGlobeSource,
    );

  const normalizedCameraSource =
    normalizeLineEndings(
      rawCameraSource,
    );

  const compositionSource =
    createCompositionSource();

  const updatedGlobeSource =
    updateGlobeScene(
      normalizedGlobeSource,
    );

  const updatedCameraSource =
    updateCameraController(
      normalizedCameraSource,
    );

  validateResult(
    updatedGlobeSource,
    updatedCameraSource,
    compositionSource,
  );

  const timestamp =
    createTimestamp();

  createBackup(
    globePath,
    rawGlobeSource,
    "GlobeScene.before-composition-engine.tsx",
    timestamp,
  );

  createBackup(
    cameraPath,
    rawCameraSource,
    "camera-controller.before-composition-engine.ts",
    timestamp,
  );

  fs.writeFileSync(
    compositionPath,
    compositionSource,
    "utf8",
  );

  fs.writeFileSync(
    globePath,
    updatedGlobeSource,
    "utf8",
  );

  fs.writeFileSync(
    cameraPath,
    updatedCameraSource,
    "utf8",
  );

  log(
    "Composition Engine v1.0 foundation applied successfully.",
  );

  log(
    `Created:\n${compositionPath}`,
  );

  log(
    `Updated:\n${globePath}`,
  );

  log(
    `Updated:\n${cameraPath}`,
  );

  log(
    "No Git operation was performed.",
  );
}

main();
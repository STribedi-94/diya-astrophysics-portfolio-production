import fs from "node:fs";
import path from "node:path";
import process from "node:process";
import { fileURLToPath } from "node:url";

const currentFile = fileURLToPath(import.meta.url);
const repositoryRoot = path.resolve(path.dirname(currentFile), "..", "..", "..");

const globePath = path.join(
  repositoryRoot,
  "src",
  "components",
  "observatory",
  "GlobeScene.tsx",
);

const controllerPath = path.join(
  repositoryRoot,
  "src",
  "components",
  "observatory",
  "astra",
  "camera-controller.ts",
);

const backupDirectory = path.join(repositoryRoot, ".astra-backup");

const INITIAL_AZIMUTH = -2.64;
const INITIAL_POLAR = 1.79;

function fail(message) {
  console.error(`\n[Astra Premium Sun Builder] ERROR: ${message}\n`);
  process.exit(1);
}

function log(message) {
  console.log(`[Astra Premium Sun Builder] ${message}`);
}

function replaceExactlyOnce(source, searchValue, replacement, description) {
  const firstIndex = source.indexOf(searchValue);

  if (firstIndex === -1) {
    fail(`Could not find expected source block: ${description}`);
  }

  if (source.indexOf(searchValue, firstIndex + searchValue.length) !== -1) {
    fail(`Expected exactly one source block for: ${description}`);
  }

  return source.replace(searchValue, replacement);
}

function createBackup(sourcePath, source, label) {
  fs.mkdirSync(backupDirectory, { recursive: true });

  const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
  const backupPath = path.join(backupDirectory, `${label}.${timestamp}`);

  fs.writeFileSync(backupPath, source, "utf8");
  log(`Backup created:\n${backupPath}`);
}

function main() {
  log("Starting Project Astra Phase 4.1 overview-composition upgrade.");

  if (!fs.existsSync(globePath) || !fs.existsSync(controllerPath)) {
    fail("Required Observatory source files were not found.");
  }

  const rawGlobe = fs.readFileSync(globePath, "utf8");
  const rawController = fs.readFileSync(controllerPath, "utf8");

  const globe = rawGlobe.replace(/\r\n/g, "\n");
  const controller = rawController.replace(/\r\n/g, "\n");

  const updatedGlobe = replaceExactlyOnce(
    globe,
    `     initialAzimuth: 0,
      initialPolar: Math.PI / 2 - 0.28,`,
    `     // Phase 4.1: frame the fixed world-space Sun beyond Earth's limb.
      initialAzimuth: ${INITIAL_AZIMUTH},
      initialPolar: ${INITIAL_POLAR},`,
    "initial Observatory overview composition",
  );

  const updatedController = replaceExactlyOnce(
    controller,
    `   this.azimuth = 0;
    this.polar = Math.PI / 2 - 0.28;`,
    `     // Phase 4.1: restore the premium Earth-Sun overview composition.
    this.azimuth = ${INITIAL_AZIMUTH};
    this.polar = ${INITIAL_POLAR};`,
    "restoreOverview camera composition",
  );

  const requiredGlobeFragments = [
    `initialAzimuth: ${INITIAL_AZIMUTH},`,
    `initialPolar: ${INITIAL_POLAR},`,
  ];

  const requiredControllerFragments = [
    `this.azimuth = ${INITIAL_AZIMUTH};`,
    `this.polar = ${INITIAL_POLAR};`,
  ];

  for (const fragment of requiredGlobeFragments) {
    if (!updatedGlobe.includes(fragment)) {
      fail(`GlobeScene validation failed: ${fragment}`);
    }
  }

  for (const fragment of requiredControllerFragments) {
    if (!updatedController.includes(fragment)) {
      fail(`Camera Controller validation failed: ${fragment}`);
    }
  }

  createBackup(globePath, rawGlobe, "GlobeScene.before-premium-sun.tsx");
  createBackup(
    controllerPath,
    rawController,
    "camera-controller.before-premium-sun.ts",
  );

  fs.writeFileSync(globePath, updatedGlobe, "utf8");
  fs.writeFileSync(controllerPath, updatedController, "utf8");

  log("Premium Earth-Sun overview composition applied successfully.");
  log(`Updated:\n${globePath}`);
  log(`Updated:\n${controllerPath}`);
  log("No Git operation was performed.");
}

main();

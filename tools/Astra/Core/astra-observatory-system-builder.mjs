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

const OBSERVATORY_SYSTEM_PATH = path.join(
  REPOSITORY_ROOT,
  "src",
  "components",
  "observatory",
  "astra",
  "observatory-system.ts",
);

const BACKUP_DIRECTORY = path.join(
  REPOSITORY_ROOT,
  ".astra-backup",
);

function fail(message) {
  console.error(`\n[Astra Observatory Builder] ERROR: ${message}\n`);
  process.exit(1);
}

function log(message) {
  console.log(`[Astra Observatory Builder] ${message}`);
}

function normalizeLineEndings(text) {
  return text.replace(/\r\n/g, "\n");
}

function createTimestamp() {
  return new Date()
    .toISOString()
    .replace(/[:.]/g, "-");
}

function replaceExactlyOnce(source, searchValue, replacement, description) {
  const firstIndex = source.indexOf(searchValue);

  if (firstIndex === -1) {
    fail(`Could not find expected source block: ${description}`);
  }

  const secondIndex = source.indexOf(
    searchValue,
    firstIndex + searchValue.length,
  );

  if (secondIndex !== -1) {
    fail(`Expected exactly one source block for: ${description}`);
  }

  return source.replace(searchValue, replacement);
}

function verifyRequiredFiles() {
  if (!fs.existsSync(GLOBE_SCENE_PATH)) {
    fail(`GlobeScene.tsx was not found at:\n${GLOBE_SCENE_PATH}`);
  }

  if (!fs.existsSync(OBSERVATORY_SYSTEM_PATH)) {
    fail(
      `observatory-system.ts was not found at:\n${OBSERVATORY_SYSTEM_PATH}`,
    );
  }
}

function createBackup(originalSource) {
  fs.mkdirSync(BACKUP_DIRECTORY, {
    recursive: true,
  });

  const backupPath = path.join(
    BACKUP_DIRECTORY,
    `GlobeScene.before-observatory-system.${createTimestamp()}.tsx`,
  );

  fs.writeFileSync(
    backupPath,
    originalSource,
    "utf8",
  );

  log(`Backup created:\n${backupPath}`);
}

function validateStartingState(source) {
  if (
    source.includes(
      'from "./astra/observatory-system"',
    )
  ) {
    fail(
      "GlobeScene already imports the Observatory System. The builder will not run twice.",
    );
  }

  if (
    !source.includes(
      'import { AstraCameraController } from "./astra/camera-controller";',
    )
  ) {
    fail(
      "Expected AstraCameraController import was not found.",
    );
  }

  if (
    !source.includes(
      'from "./astra/earth-system";',
    )
  ) {
    fail(
      "Expected Astra Earth System import was not found.",
    );
  }

  if (
    !source.includes(
      "/* ---------------- ground markers ---------------- */",
    )
  ) {
    fail(
      "The existing ground-marker section was not found.",
    );
  }

  if (
    !source.includes(
      "function latLonToVec3(",
    )
  ) {
    fail(
      "The existing latLonToVec3 helper was not found.",
    );
  }
}

function integrateObservatorySystem(source) {
  let updatedSource = source;

  const earthImport = `import {
  createEarthSystem,
  EARTH_RADIUS,
} from "./astra/earth-system";`;

  const expandedImports = `import {
  createEarthSystem,
  EARTH_RADIUS,
} from "./astra/earth-system";
import {
  createObservatorySystem,
  latLonToVec3,
} from "./astra/observatory-system";`;

  updatedSource = replaceExactlyOnce(
    updatedSource,
    earthImport,
    expandedImports,
    "Observatory System import insertion",
  );

  const inlineCoordinateHelper = `function latLonToVec3(lat: number, lon: number, r: number) {
  const phi = (90 - lat) * (Math.PI / 180);
  const theta = (lon + 180) * (Math.PI / 180);
  return new THREE.Vector3(
    -r * Math.sin(phi) * Math.cos(theta),
    r * Math.cos(phi),
    r * Math.sin(phi) * Math.sin(theta),
  );
}

`;

  updatedSource = replaceExactlyOnce(
    updatedSource,
    inlineCoordinateHelper,
    "",
    "inline latitude/longitude helper removal",
  );

  const existingMarkerSection = `    /* ---------------- ground markers ---------------- */
    type MarkerRec = { node: NetworkNode; group: THREE.Group; core: THREE.Mesh; halo: THREE.Mesh };
    const markers: MarkerRec[] = [];
    const coreGeo = new THREE.SphereGeometry(0.022, 16, 12);
    const haloGeo = new THREE.RingGeometry(0.035, 0.055, 24);
    const beaconGeo = new THREE.CylinderGeometry(0.0035, 0.0035, 0.11, 6);
    disposables.push(coreGeo, haloGeo, beaconGeo);

    groundNodes.forEach((node) => {
      const pos = latLonToVec3(node.lat!, node.lon!, EARTH_RADIUS);
      const g = new THREE.Group();
      g.position.copy(pos);
      g.lookAt(pos.clone().multiplyScalar(2));
      const col = new THREE.Color(node.color);

      const coreMat = new THREE.MeshBasicMaterial({ color: col, transparent: true, opacity: 0 });
      const core = new THREE.Mesh(coreGeo, coreMat);
      core.position.z = 0.03;
      g.add(core);

      const haloMat = new THREE.MeshBasicMaterial({
        color: col,
        transparent: true,
        opacity: 0,
        side: THREE.DoubleSide,
        depthWrite: false,
      });
      const halo = new THREE.Mesh(haloGeo, haloMat);
      halo.position.z = 0.004;
      g.add(halo);

      const beaconMat = new THREE.MeshBasicMaterial({ color: col, transparent: true, opacity: 0 });
      const beacon = new THREE.Mesh(beaconGeo, beaconMat);
      beacon.rotation.x = Math.PI / 2;
      beacon.position.z = 0.055;
      g.add(beacon);

      disposables.push(coreMat, haloMat, beaconMat);
      earthGroup.add(g);
      markers.push({ node, group: g, core, halo });
    });

`;

  const modularMarkerSection = `    /* ---------------- Project Diya Astra Observatory system ---------------- */
    const observatorySystem = createObservatorySystem({
      earthGroup,
      nodes: groundNodes,
      disposables,
    });

    const markers = observatorySystem.markers;

`;

  updatedSource = replaceExactlyOnce(
    updatedSource,
    existingMarkerSection,
    modularMarkerSection,
    "inline observatory-marker construction",
  );

  const existingBeaconUpdate = `        const beacon = m.group.children[2] as THREE.Mesh;
        (beacon.material as THREE.MeshBasicMaterial).opacity = local * (sel ? 0.55 : 0.22);`;

  const modularBeaconUpdate = `        (m.beacon.material as THREE.MeshBasicMaterial).opacity =
          local * (sel ? 0.55 : 0.22);`;

  updatedSource = replaceExactlyOnce(
    updatedSource,
    existingBeaconUpdate,
    modularBeaconUpdate,
    "beacon animation ownership update",
  );

  return updatedSource;
}

function validateResult(source) {
  const requiredFragments = [
    'from "./astra/observatory-system";',
    "createObservatorySystem({",
    "const markers = observatorySystem.markers;",
    "m.beacon.material",
  ];

  for (const fragment of requiredFragments) {
    if (!source.includes(fragment)) {
      fail(`Final validation failed. Missing fragment: ${fragment}`);
    }
  }

  const forbiddenFragments = [
    "type MarkerRec =",
    "const coreGeo = new THREE.SphereGeometry",
    "const haloGeo = new THREE.RingGeometry",
    "const beaconGeo = new THREE.CylinderGeometry",
    "m.group.children[2]",
  ];

  for (const fragment of forbiddenFragments) {
    if (source.includes(fragment)) {
      fail(
        `Final validation failed. Legacy fragment remains: ${fragment}`,
      );
    }
  }

  const latLonDefinitionCount =
    source.match(/function latLonToVec3\s*\(/g)?.length ?? 0;

  if (latLonDefinitionCount !== 0) {
    fail(
      "Final validation failed. The inline latLonToVec3 definition remains.",
    );
  }
}

function main() {
  log("Starting Observatory System integration.");

  verifyRequiredFiles();

  const rawSource = fs.readFileSync(
    GLOBE_SCENE_PATH,
    "utf8",
  );

  const normalizedSource =
    normalizeLineEndings(rawSource);

  validateStartingState(normalizedSource);

  const updatedSource =
    integrateObservatorySystem(normalizedSource);

  validateResult(updatedSource);

  createBackup(rawSource);

  fs.writeFileSync(
    GLOBE_SCENE_PATH,
    updatedSource,
    "utf8",
  );

  log("GlobeScene integration completed successfully.");
  log(`Updated file:\n${GLOBE_SCENE_PATH}`);
  log("No Git operation was performed.");
}

main();
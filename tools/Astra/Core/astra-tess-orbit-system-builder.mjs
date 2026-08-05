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

const BACKUP_DIRECTORY = path.join(
  REPOSITORY_ROOT,
  ".astra-backup",
);

function fail(message) {
  console.error(`\n[Astra TESS Builder] ERROR: ${message}\n`);
  process.exit(1);
}

function log(message) {
  console.log(`[Astra TESS Builder] ${message}`);
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

  if (!fs.existsSync(TESS_SYSTEM_PATH)) {
    fail(`tess-orbit-system.ts was not found at:\n${TESS_SYSTEM_PATH}`);
  }
}

function createBackup(originalSource) {
  fs.mkdirSync(BACKUP_DIRECTORY, {
    recursive: true,
  });

  const backupPath = path.join(
    BACKUP_DIRECTORY,
    `GlobeScene.before-tess-system.${createTimestamp()}.tsx`,
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
      'from "./astra/tess-orbit-system"',
    )
  ) {
    fail(
      "GlobeScene already imports the TESS Orbit System. The builder will not run twice.",
    );
  }

  if (
    !source.includes(
      'from "./astra/observatory-system";',
    )
  ) {
    fail(
      "Expected Observatory System integration was not found.",
    );
  }

  if (
    !source.includes(
      "/* ---------------- TESS orbit + spacecraft ---------------- */",
    )
  ) {
    fail(
      "The existing inline TESS orbit section was not found.",
    );
  }

  if (!source.includes("function solveKepler(")) {
    fail(
      "The existing inline Kepler solver was not found.",
    );
  }

  if (!source.includes("function orbitPoint(")) {
    fail(
      "The existing inline orbitPoint helper was not found.",
    );
  }
}

function integrateTessSystem(source) {
  let updatedSource = source;

  const existingDataImport =
    'import { groundNodes, spaceNode, type NetworkNode } from "@/data/observatory-network";';

  const updatedDataImport =
    'import { groundNodes, spaceNode } from "@/data/observatory-network";';

  updatedSource = replaceExactlyOnce(
    updatedSource,
    existingDataImport,
    updatedDataImport,
    "unused NetworkNode type removal",
  );

  const observatoryImport = `import {
  createObservatorySystem,
  latLonToVec3,
} from "./astra/observatory-system";`;

  const expandedImports = `import {
  createObservatorySystem,
  latLonToVec3,
} from "./astra/observatory-system";
import {
  createTessOrbitSystem,
} from "./astra/tess-orbit-system";`;

  updatedSource = replaceExactlyOnce(
    updatedSource,
    observatoryImport,
    expandedImports,
    "TESS Orbit System import insertion",
  );

  const oldOrbitConstants = `const ORBIT_A = 2.625;
const ORBIT_E = 0.4857; // perigee ≈ 1.35 R⊕, apogee ≈ 3.9 R⊕ — illustrative, not to scale
const ORBIT_B = ORBIT_A * Math.sqrt(1 - ORBIT_E * ORBIT_E);
const ORBIT_PERIOD = 45; // seconds per visual orbit (time-compressed)
const SPIN_PERIOD = 240; // seconds per full Earth rotation`;

  const retainedSpinConstant =
    "const SPIN_PERIOD = 240; // seconds per full Earth rotation";

  updatedSource = replaceExactlyOnce(
    updatedSource,
    oldOrbitConstants,
    retainedSpinConstant,
    "inline TESS orbit constants removal",
  );

  const inlineOrbitHelpers = `function orbitPoint(E: number) {
  return new THREE.Vector3(ORBIT_A * (Math.cos(E) - ORBIT_E), 0, ORBIT_B * Math.sin(E));
}

function solveKepler(M: number) {
  let E = M;
  for (let i = 0; i < 6; i++) {
    E = E - (E - ORBIT_E * Math.sin(E) - M) / (1 - ORBIT_E * Math.cos(E));
  }
  return E;
}

`;

  updatedSource = replaceExactlyOnce(
    updatedSource,
    inlineOrbitHelpers,
    "",
    "inline TESS mathematical helpers removal",
  );

  const existingTessSection = `    /* ---------------- TESS orbit + spacecraft ---------------- */
    const orbitGroup = new THREE.Group();
    orbitGroup.rotation.set(0.42, 0.55, 0.22);
    scene.add(orbitGroup);

    const pathPts: THREE.Vector3[] = [];
    for (let i = 0; i <= 240; i++) pathPts.push(orbitPoint((i / 240) * Math.PI * 2));
    const pathGeo = new THREE.BufferGeometry().setFromPoints(pathPts);
    const pathMat = new THREE.LineBasicMaterial({
      color: new THREE.Color(spaceNode.color),
      transparent: true,
      opacity: 0,
      depthWrite: false,
    });
    orbitGroup.add(new THREE.Line(pathGeo, pathMat));
    disposables.push(pathGeo, pathMat);

    const sat = new THREE.Group();
    const satBodyGeo = new THREE.BoxGeometry(0.075, 0.075, 0.1);
    const satBodyMat = new THREE.MeshBasicMaterial({ color: 0xd8d8e4, transparent: true, opacity: 0 });
    sat.add(new THREE.Mesh(satBodyGeo, satBodyMat));
    const panelGeo = new THREE.BoxGeometry(0.16, 0.006, 0.07);
    const panelMat = new THREE.MeshBasicMaterial({ color: 0x3f5fa8, transparent: true, opacity: 0 });
    [-0.12, 0.12].forEach((x) => {
      const p = new THREE.Mesh(panelGeo, panelMat);
      p.position.x = x;
      sat.add(p);
    });
    const glowGeo = new THREE.SphereGeometry(0.1, 12, 10);
    const glowMat = new THREE.MeshBasicMaterial({
      color: new THREE.Color(spaceNode.color),
      transparent: true,
      opacity: 0,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    });
    const satGlow = new THREE.Mesh(glowGeo, glowMat);
    sat.add(satGlow);
    orbitGroup.add(sat);
    disposables.push(satBodyGeo, satBodyMat, panelGeo, panelMat, glowGeo, glowMat);

`;

  const modularTessSection = `    /* ---------------- Project Diya Astra TESS orbit system ---------------- */
    const tessSystem = createTessOrbitSystem({
      scene,
      node: spaceNode,
      reducedMotion,
    });

    disposables.push(tessSystem);

`;

  updatedSource = replaceExactlyOnce(
    updatedSource,
    existingTessSection,
    modularTessSection,
    "inline TESS orbit and spacecraft construction",
  );

  updatedSource = replaceExactlyOnce(
    updatedSource,
    "targets.push({ id: spaceNode.id, obj: satGlow });",
    "targets.push({ id: spaceNode.id, obj: tessSystem.glow });",
    "TESS raycasting target",
  );

  updatedSource = replaceExactlyOnce(
    updatedSource,
    "{ id: spaceNode.id, obj: satGlow }",
    "{ id: spaceNode.id, obj: tessSystem.glow }",
    "TESS screen-space picking target",
  );

  updatedSource = replaceExactlyOnce(
    updatedSource,
    "    let orbitT = reducedMotion ? 0.18 : 0;\n",
    "",
    "inline TESS orbit-progress state",
  );

  const existingAnimationBlock = `      // Orbit + spacecraft
      const orbitReveal = THREE.MathUtils.clamp((reveal - 0.7) / 0.3, 0, 1);
      pathMat.opacity = orbitReveal * 0.4;
      if (!reducedMotion) orbitT = (orbitT + dt / ORBIT_PERIOD) % 1;
      const E = solveKepler(orbitT * Math.PI * 2);
      sat.position.copy(orbitPoint(E));
      sat.lookAt(0, 0, 0);
      const satSel = selectedRef.current === spaceNode.id;
      const satHov = hoverId === spaceNode.id;
      satBodyMat.opacity = orbitReveal;
      panelMat.opacity = orbitReveal;
      glowMat.opacity = orbitReveal * (satSel ? 0.34 : satHov ? 0.24 : 0.12);
      satGlow.scale.setScalar(satSel ? 1.3 : 1);`;

  const modularAnimationBlock = `      // TESS orbit + spacecraft
      const orbitReveal = THREE.MathUtils.clamp(
        (reveal - 0.7) / 0.3,
        0,
        1,
      );

      tessSystem.update({
        deltaSeconds: dt,
        reveal,
        reducedMotion,
        selected: selectedRef.current === spaceNode.id,
        hovered: hoverId === spaceNode.id,
      });`;

  updatedSource = replaceExactlyOnce(
    updatedSource,
    existingAnimationBlock,
    modularAnimationBlock,
    "inline TESS animation logic",
  );

  updatedSource = replaceExactlyOnce(
    updatedSource,
    "labelTargets.push({ id: spaceNode.id, obj: sat, ground: false });",
    "labelTargets.push({ id: spaceNode.id, obj: tessSystem.spacecraft, ground: false });",
    "TESS label anchor",
  );

  return updatedSource;
}

function validateResult(source) {
  const requiredFragments = [
    'from "./astra/tess-orbit-system";',
    "createTessOrbitSystem({",
    "disposables.push(tessSystem);",
    "tessSystem.update({",
    "tessSystem.glow",
    "tessSystem.spacecraft",
  ];

  for (const fragment of requiredFragments) {
    if (!source.includes(fragment)) {
      fail(`Final validation failed. Missing fragment: ${fragment}`);
    }
  }

  const forbiddenFragments = [
    "const ORBIT_A =",
    "const ORBIT_E =",
    "const ORBIT_B =",
    "const ORBIT_PERIOD =",
    "function orbitPoint(",
    "function solveKepler(",
    "const orbitGroup = new THREE.Group()",
    "const sat = new THREE.Group()",
    "const satGlow =",
    "let orbitT =",
    "pathMat.opacity",
    "satBodyMat.opacity",
    "panelMat.opacity",
    "glowMat.opacity",
  ];

  for (const fragment of forbiddenFragments) {
    if (source.includes(fragment)) {
      fail(
        `Final validation failed. Legacy TESS fragment remains: ${fragment}`,
      );
    }
  }

  const tessImportCount =
    source.match(
      /from "\.\/astra\/tess-orbit-system";/g,
    )?.length ?? 0;

  if (tessImportCount !== 1) {
    fail(
      `Expected exactly one TESS Orbit System import, found ${tessImportCount}.`,
    );
  }
}

function main() {
  log("Starting TESS Orbit System integration.");

  verifyRequiredFiles();

  const rawSource = fs.readFileSync(
    GLOBE_SCENE_PATH,
    "utf8",
  );

  const normalizedSource =
    normalizeLineEndings(rawSource);

  validateStartingState(normalizedSource);

  const updatedSource =
    integrateTessSystem(normalizedSource);

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
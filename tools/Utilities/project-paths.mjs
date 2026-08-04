import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const EXPECTED_PACKAGE_NAME = "tanstack_start_ts";

const REQUIRED_REPOSITORY_PATHS = [
  "package.json",
  "src",
  "src/components",
  "src/components/observatory",
  "src/data",
];

function isDirectory(targetPath) {
  try {
    return fs.statSync(targetPath).isDirectory();
  } catch {
    return false;
  }
}

function isFile(targetPath) {
  try {
    return fs.statSync(targetPath).isFile();
  } catch {
    return false;
  }
}

function readJson(jsonPath) {
  try {
    return JSON.parse(fs.readFileSync(jsonPath, "utf8"));
  } catch (error) {
    throw new Error(
      [
        `Unable to read JSON file:`,
        jsonPath,
        "",
        error instanceof Error ? error.message : String(error),
      ].join("\n"),
    );
  }
}

function looksLikeDiyaProductionRepository(candidateRoot) {
  const packagePath = path.join(candidateRoot, "package.json");

  if (!isFile(packagePath)) {
    return false;
  }

  const packageJson = readJson(packagePath);

  if (packageJson.name !== EXPECTED_PACKAGE_NAME) {
    return false;
  }

  return REQUIRED_REPOSITORY_PATHS.every((relativePath) => {
    const absolutePath = path.join(candidateRoot, relativePath);

    return relativePath.includes(".")
      ? isFile(absolutePath)
      : isDirectory(absolutePath);
  });
}

function walkUpForRepository(startPath) {
  let currentPath = path.resolve(startPath);

  while (true) {
    if (looksLikeDiyaProductionRepository(currentPath)) {
      return currentPath;
    }

    const parentPath = path.dirname(currentPath);

    if (parentPath === currentPath) {
      return null;
    }

    currentPath = parentPath;
  }
}

function getScriptDirectory(metaUrl = import.meta.url) {
  return path.dirname(fileURLToPath(metaUrl));
}

export function findRepositoryRoot(options = {}) {
  const {
    startPaths = [
      process.cwd(),
      getScriptDirectory(),
      path.resolve(getScriptDirectory(), "..", "..", ".."),
    ],
  } = options;

  for (const startPath of startPaths) {
    if (!startPath) continue;

    const repositoryRoot = walkUpForRepository(startPath);

    if (repositoryRoot) {
      return repositoryRoot;
    }
  }

  throw new Error(
    [
      "Diya Production repository could not be located.",
      "",
      "Run the tool from inside this repository:",
      "E:\\Diya Portfolio Website\\02 - Production\\",
      "diya-astrophysics-portfolio-production\\",
      "diya-astrophysics-portfolio-production",
      "",
      "The repository must contain package.json and",
      "src/components/observatory.",
    ].join("\n"),
  );
}

export function verifyRepositoryRoot(repositoryRoot) {
  const resolvedRoot = path.resolve(repositoryRoot);

  if (!looksLikeDiyaProductionRepository(resolvedRoot)) {
    throw new Error(
      [
        "The supplied path is not the expected Diya Production repository:",
        resolvedRoot,
      ].join("\n"),
    );
  }

  return resolvedRoot;
}

export function createProjectPaths(
  repositoryRoot = findRepositoryRoot(),
) {
  const root = verifyRepositoryRoot(repositoryRoot);

  const resolveFromRoot = (...segments) =>
    path.join(root, ...segments);

  return Object.freeze({
    root,

    packageJson: resolveFromRoot("package.json"),
    src: resolveFromRoot("src"),
    public: resolveFromRoot("public"),
    audit: resolveFromRoot("audit"),

    components: resolveFromRoot("src", "components"),

    observatoryComponents: resolveFromRoot(
      "src",
      "components",
      "observatory",
    ),

    astraComponents: resolveFromRoot(
      "src",
      "components",
      "observatory",
      "astra",
    ),

    data: resolveFromRoot("src", "data"),
    services: resolveFromRoot("src", "services"),
    config: resolveFromRoot("src", "config"),
    generated: resolveFromRoot("src", "generated"),

    globeScene: resolveFromRoot(
      "src",
      "components",
      "observatory",
      "GlobeScene.tsx",
    ),

    observatoryNetworkGlobe: resolveFromRoot(
      "src",
      "components",
      "observatory",
      "ObservatoryNetworkGlobe.tsx",
    ),

    observatoryNetworkData: resolveFromRoot(
      "src",
      "data",
      "observatory-network.ts",
    ),

    toolBackups: resolveFromRoot(".astra-backup"),
    toolReports: resolveFromRoot(".astra-reports"),

    resolveFromRoot,
  });
}

export function printRepositorySummary(
  projectPaths = createProjectPaths(),
) {
  const packageJson = readJson(projectPaths.packageJson);

  console.log("Diya Production repository verified.");
  console.log(`Repository root: ${projectPaths.root}`);
  console.log(`Package name:    ${packageJson.name}`);
  console.log(`GlobeScene:      ${projectPaths.globeScene}`);
}

export const projectPaths = createProjectPaths();

// ------------------------------------------------------------
// Execute when run directly
// ------------------------------------------------------------

import { pathToFileURL } from "node:url";

if (import.meta.url === pathToFileURL(process.argv[1]).href) {
  printRepositorySummary();
}
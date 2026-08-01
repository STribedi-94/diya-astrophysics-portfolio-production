import { readdir, stat, writeFile } from "node:fs/promises";
import path from "node:path";

import { ASSET_MANIFEST } from "./modules/asset-manifest.mjs";
import { copyFileSafe, ensureDirectory, pathExists } from "./modules/file-utils.mjs";
import { PATHS } from "./modules/paths.mjs";

const startedAt = new Date();

const results = {
  startedAt: startedAt.toISOString(),
  completedAt: null,
  sourceRoot: PATHS.workingAssets,
  destinationRoot: PATHS.publicAssets,
  totals: {
    manifestEntries: ASSET_MANIFEST.length,
    sourceFiles: 0,
    copied: 0,
    skipped: 0,
    failed: 0,
    missingSourceFolders: 0,
  },
  copied: [],
  skipped: [],
  failed: [],
  missingSourceFolders: [],
};

async function listFilesRecursive(directoryPath) {
  const entries = await readdir(directoryPath, { withFileTypes: true });
  const files = [];

  for (const entry of entries) {
    const fullPath = path.join(directoryPath, entry.name);

    if (entry.isDirectory()) {
      files.push(...(await listFilesRecursive(fullPath)));
    } else if (entry.isFile()) {
      files.push(fullPath);
    }
  }

  return files;
}

async function filesMatch(sourcePath, destinationPath) {
  if (!(await pathExists(destinationPath))) {
    return false;
  }

  const [sourceStats, destinationStats] = await Promise.all([
    stat(sourcePath),
    stat(destinationPath),
  ]);

  return sourceStats.size === destinationStats.size;
}

async function processManifestEntry(entry) {
  const sourceFolder = path.join(PATHS.workingAssets, entry.source);
  const destinationFolder = path.join(PATHS.publicAssets, entry.destination);

  if (!(await pathExists(sourceFolder))) {
    results.totals.missingSourceFolders += 1;
    results.missingSourceFolders.push({
      category: entry.category,
      sourceFolder,
      destinationFolder,
    });

    console.warn(`Missing source folder: ${sourceFolder}`);
    return;
  }

  await ensureDirectory(destinationFolder);

  const sourceFiles = await listFilesRecursive(sourceFolder);
  results.totals.sourceFiles += sourceFiles.length;

  for (const sourcePath of sourceFiles) {
    const relativePath = path.relative(sourceFolder, sourcePath);
    const destinationPath = path.join(destinationFolder, relativePath);

    try {
      if (await filesMatch(sourcePath, destinationPath)) {
        results.totals.skipped += 1;
        results.skipped.push({
          sourcePath,
          destinationPath,
          reason: "Destination exists with matching file size",
        });

        console.log(`Skipped: ${relativePath}`);
        continue;
      }

      await copyFileSafe(sourcePath, destinationPath);

      const sourceStats = await stat(sourcePath);

      results.totals.copied += 1;
      results.copied.push({
        sourcePath,
        destinationPath,
        size: sourceStats.size,
      });

      console.log(`Copied: ${relativePath}`);
    } catch (error) {
      results.totals.failed += 1;
      results.failed.push({
        sourcePath,
        destinationPath,
        error: error instanceof Error ? error.message : String(error),
      });

      console.error(`Failed: ${relativePath}`);
    }
  }
}

function createTextReport() {
  const lines = [
    "DIYA WEBSITE ASSET COPY REPORT",
    "==============================",
    "",
    `Started: ${results.startedAt}`,
    `Completed: ${results.completedAt}`,
    `Source root: ${results.sourceRoot}`,
    `Destination root: ${results.destinationRoot}`,
    "",
    "SUMMARY",
    "-------",
    `Manifest entries: ${results.totals.manifestEntries}`,
    `Source files: ${results.totals.sourceFiles}`,
    `Copied: ${results.totals.copied}`,
    `Skipped: ${results.totals.skipped}`,
    `Failed: ${results.totals.failed}`,
    `Missing source folders: ${results.totals.missingSourceFolders}`,
    "",
  ];

  if (results.missingSourceFolders.length > 0) {
    lines.push("MISSING SOURCE FOLDERS", "----------------------");

    for (const item of results.missingSourceFolders) {
      lines.push(`- ${item.sourceFolder}`);
    }

    lines.push("");
  }

  if (results.failed.length > 0) {
    lines.push("FAILED FILES", "------------");

    for (const item of results.failed) {
      lines.push(`- ${item.sourcePath}`);
      lines.push(`  Error: ${item.error}`);
    }

    lines.push("");
  }

  if (results.copied.length > 0) {
    lines.push("COPIED FILES", "------------");

    for (const item of results.copied) {
      lines.push(`- ${item.sourcePath}`);
      lines.push(`  To: ${item.destinationPath}`);
      lines.push(`  Size: ${item.size} bytes`);
    }

    lines.push("");
  }

  return `${lines.join("\n")}\n`;
}

async function writeReports() {
  await ensureDirectory(PATHS.auditReports);

  const jsonPath = path.join(PATHS.auditReports, "asset-copy-report.json");
  const textPath = path.join(PATHS.auditReports, "asset-copy-report.txt");

  await Promise.all([
    writeFile(jsonPath, JSON.stringify(results, null, 2), "utf8"),
    writeFile(textPath, createTextReport(), "utf8"),
  ]);

  return { jsonPath, textPath };
}

async function main() {
  console.log("Starting asset migration...");
  console.log(`Source: ${PATHS.workingAssets}`);
  console.log(`Destination: ${PATHS.publicAssets}`);
  console.log("");

  for (const entry of ASSET_MANIFEST) {
    console.log(`Processing: ${entry.source}`);
    await processManifestEntry(entry);
  }

  results.completedAt = new Date().toISOString();

  const reportPaths = await writeReports();

  console.log("");
  console.log("Asset migration complete.");
  console.log(`Copied: ${results.totals.copied}`);
  console.log(`Skipped: ${results.totals.skipped}`);
  console.log(`Failed: ${results.totals.failed}`);
  console.log(`Missing source folders: ${results.totals.missingSourceFolders}`);
  console.log(`Text report: ${reportPaths.textPath}`);
  console.log(`JSON report: ${reportPaths.jsonPath}`);

  if (results.totals.failed > 0) {
    process.exitCode = 1;
  }
}

main().catch((error) => {
  console.error("Asset migration stopped unexpectedly.");
  console.error(error);
  process.exitCode = 1;
});
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const currentFile = fileURLToPath(import.meta.url);
const auditDirectory = path.dirname(currentFile);
const projectRoot = path.resolve(auditDirectory, "..");

const reportDirectory = path.resolve(
  projectRoot,
  "..",
  "..",
  "05 - Documents",
  "Asset Audit",
);

const ignoredDirectories = new Set([
  ".git",
  "node_modules",
  "dist",
  "build",
  ".vite",
  ".cache",
]);

const assetExtensions = new Set([
  ".jpg",
  ".jpeg",
  ".png",
  ".webp",
  ".gif",
  ".svg",
  ".avif",
  ".ico",
  ".pdf",
  ".mp4",
  ".webm",
  ".mov",
  ".mp3",
  ".wav",
  ".woff",
  ".woff2",
  ".ttf",
  ".otf",
]);

const sourceExtensions = new Set([
  ".js",
  ".jsx",
  ".mjs",
  ".cjs",
  ".ts",
  ".tsx",
  ".css",
  ".scss",
  ".html",
  ".json",
  ".md",
]);

const assetFiles = [];
const assetMetadataFiles = [];
const externalAssetReferences = [];
const lovableAssetReferences = [];

function normalizePath(filePath) {
  return filePath.split(path.sep).join("/");
}

function escapeCsv(value) {
  const text = String(value ?? "");
  return `"${text.replaceAll('"', '""')}"`;
}

function walkDirectory(directory) {
  const entries = fs.readdirSync(directory, {
    withFileTypes: true,
  });

  for (const entry of entries) {
    if (entry.isDirectory() && ignoredDirectories.has(entry.name)) {
      continue;
    }

    const absolutePath = path.join(directory, entry.name);

    if (entry.isDirectory()) {
      walkDirectory(absolutePath);
      continue;
    }

    inspectFile(absolutePath);
  }
}

function inspectFile(absolutePath) {
  const relativePath = normalizePath(
    path.relative(projectRoot, absolutePath),
  );

  const lowerName = absolutePath.toLowerCase();
  const extension = path.extname(lowerName);

  if (lowerName.endsWith(".asset.json")) {
    const stats = fs.statSync(absolutePath);

    assetMetadataFiles.push({
      path: relativePath,
      filename: path.basename(absolutePath),
      sizeBytes: stats.size,
    });
  }

  if (assetExtensions.has(extension)) {
    const stats = fs.statSync(absolutePath);

    assetFiles.push({
      path: relativePath,
      filename: path.basename(absolutePath),
      extension,
      sizeBytes: stats.size,
      sizeKilobytes: Number((stats.size / 1024).toFixed(2)),
    });
  }

  if (!sourceExtensions.has(extension)) {
    return;
  }

  let content;

  try {
    content = fs.readFileSync(absolutePath, "utf8");
  } catch {
    return;
  }

  const lines = content.split(/\r?\n/);

  lines.forEach((line, index) => {
    const urls = line.match(/https?:\/\/[^\s"'`)<>{}]+/g) ?? [];

    for (const url of urls) {
      const record = {
        sourceFile: relativePath,
        line: index + 1,
        url,
      };

      externalAssetReferences.push(record);

      if (
        url.includes("/__l5e/assets-v1/") ||
        url.toLowerCase().includes("lovable")
      ) {
        lovableAssetReferences.push(record);
      }
    }
  });
}

function writeReports() {
  fs.mkdirSync(reportDirectory, {
    recursive: true,
  });

  assetFiles.sort((a, b) => a.path.localeCompare(b.path));
  assetMetadataFiles.sort((a, b) => a.path.localeCompare(b.path));
  externalAssetReferences.sort((a, b) =>
    a.sourceFile.localeCompare(b.sourceFile),
  );
  lovableAssetReferences.sort((a, b) =>
    a.sourceFile.localeCompare(b.sourceFile),
  );

  const summary = {
    generatedAt: new Date().toISOString(),
    projectRoot: normalizePath(projectRoot),
    totals: {
      physicalAssetFiles: assetFiles.length,
      assetMetadataFiles: assetMetadataFiles.length,
      externalUrlReferences: externalAssetReferences.length,
      lovableAssetReferences: lovableAssetReferences.length,
    },
  };

  fs.writeFileSync(
    path.join(reportDirectory, "asset-audit-summary.json"),
    JSON.stringify(summary, null, 2),
  );

  fs.writeFileSync(
    path.join(reportDirectory, "physical-assets.json"),
    JSON.stringify(assetFiles, null, 2),
  );

  fs.writeFileSync(
    path.join(reportDirectory, "asset-metadata-files.json"),
    JSON.stringify(assetMetadataFiles, null, 2),
  );

  fs.writeFileSync(
    path.join(reportDirectory, "external-asset-references.json"),
    JSON.stringify(externalAssetReferences, null, 2),
  );

  fs.writeFileSync(
    path.join(reportDirectory, "lovable-asset-references.json"),
    JSON.stringify(lovableAssetReferences, null, 2),
  );

  const csvHeader =
    "Path,Filename,Extension,Size Bytes,Size Kilobytes\n";

  const csvRows = assetFiles
    .map((asset) =>
      [
        escapeCsv(asset.path),
        escapeCsv(asset.filename),
        escapeCsv(asset.extension),
        asset.sizeBytes,
        asset.sizeKilobytes,
      ].join(","),
    )
    .join("\n");

  fs.writeFileSync(
    path.join(reportDirectory, "physical-assets.csv"),
    csvHeader + csvRows,
  );

  const readableReport = [
    "DIYA WEBSITE ASSET AUDIT",
    "========================",
    "",
    `Generated: ${summary.generatedAt}`,
    `Project: ${summary.projectRoot}`,
    "",
    "SUMMARY",
    "-------",
    `Physical asset files: ${summary.totals.physicalAssetFiles}`,
    `Lovable .asset.json files: ${summary.totals.assetMetadataFiles}`,
    `External URL references: ${summary.totals.externalUrlReferences}`,
    `Lovable asset URL references: ${summary.totals.lovableAssetReferences}`,
    "",
    "This audit is read-only. No website files were modified.",
    "",
  ].join("\n");

  fs.writeFileSync(
    path.join(reportDirectory, "asset-audit-report.txt"),
    readableReport,
  );

  console.log("");
  console.log("Asset audit completed successfully.");
  console.log(`Reports saved to: ${reportDirectory}`);
  console.log("");
  console.log(`Physical assets: ${assetFiles.length}`);
  console.log(`.asset.json files: ${assetMetadataFiles.length}`);
  console.log(`External URLs: ${externalAssetReferences.length}`);
  console.log(`Lovable URLs: ${lovableAssetReferences.length}`);
  console.log("");
}

try {
  console.log("Scanning the Diya website project...");
  walkDirectory(projectRoot);
  writeReports();
} catch (error) {
  console.error("");
  console.error("Asset audit failed.");
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
}
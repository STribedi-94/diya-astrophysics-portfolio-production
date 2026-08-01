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

const metadataRecords = [];
const sourceFiles = [];

function normalizePath(filePath) {
  return filePath.split(path.sep).join("/");
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

  const extension = path.extname(absolutePath).toLowerCase();

  if (absolutePath.toLowerCase().endsWith(".asset.json")) {
    metadataRecords.push(readMetadataFile(absolutePath, relativePath));
  }

  if (sourceExtensions.has(extension)) {
    try {
      sourceFiles.push({
        path: relativePath,
        content: fs.readFileSync(absolutePath, "utf8"),
      });
    } catch {
      // Ignore unreadable source files.
    }
  }
}

function readMetadataFile(absolutePath, relativePath) {
  const baseRecord = {
    metadataPath: relativePath,
    metadataFilename: path.basename(absolutePath),
    expectedAssetName: path
      .basename(absolutePath)
      .replace(/\.asset\.json$/i, ""),
    parsedSuccessfully: false,
    metadata: null,
    referencedBy: [],
  };

  try {
    const rawContent = fs.readFileSync(absolutePath, "utf8");
    const parsedContent = JSON.parse(rawContent);

    return {
      ...baseRecord,
      parsedSuccessfully: true,
      metadata: parsedContent,
    };
  } catch (error) {
    return {
      ...baseRecord,
      parseError:
        error instanceof Error ? error.message : String(error),
    };
  }
}

function findReferences() {
  for (const record of metadataRecords) {
    const searchTerms = new Set([
      record.metadataPath,
      record.metadataFilename,
      record.expectedAssetName,
    ]);

    for (const sourceFile of sourceFiles) {
      const lines = sourceFile.content.split(/\r?\n/);

      lines.forEach((line, index) => {
        const matchedTerms = [...searchTerms].filter(
          (term) => term && line.includes(term),
        );

        if (matchedTerms.length > 0) {
          record.referencedBy.push({
            sourceFile: sourceFile.path,
            line: index + 1,
            matchedTerms,
            preview: line.trim(),
          });
        }
      });
    }
  }
}

function flattenMetadata(value, prefix = "") {
  const result = [];

  if (
    value === null ||
    typeof value === "string" ||
    typeof value === "number" ||
    typeof value === "boolean"
  ) {
    result.push({
      key: prefix || "value",
      value,
    });

    return result;
  }

  if (Array.isArray(value)) {
    value.forEach((item, index) => {
      result.push(
        ...flattenMetadata(
          item,
          prefix ? `${prefix}[${index}]` : `[${index}]`,
        ),
      );
    });

    return result;
  }

  if (typeof value === "object") {
    for (const [key, nestedValue] of Object.entries(value)) {
      const nestedPrefix = prefix ? `${prefix}.${key}` : key;
      result.push(...flattenMetadata(nestedValue, nestedPrefix));
    }
  }

  return result;
}

function extractUsefulMetadata(metadata) {
  if (!metadata || typeof metadata !== "object") {
    return [];
  }

  return flattenMetadata(metadata).filter((entry) => {
    const key = entry.key.toLowerCase();
    const value = String(entry.value ?? "").toLowerCase();

    return (
      key.includes("url") ||
      key.includes("src") ||
      key.includes("path") ||
      key.includes("name") ||
      key.includes("mime") ||
      key.includes("type") ||
      key.includes("width") ||
      key.includes("height") ||
      key.includes("size") ||
      value.includes("/__l5e/assets-v1/") ||
      value.startsWith("http")
    );
  });
}

function writeReports() {
  fs.mkdirSync(reportDirectory, {
    recursive: true,
  });

  metadataRecords.sort((a, b) =>
    a.metadataPath.localeCompare(b.metadataPath),
  );

  const detailedRecords = metadataRecords.map((record) => ({
    ...record,
    usefulMetadata: extractUsefulMetadata(record.metadata),
    referenceCount: record.referencedBy.length,
  }));

  const summary = {
    generatedAt: new Date().toISOString(),
    projectRoot: normalizePath(projectRoot),
    totals: {
      metadataFiles: detailedRecords.length,
      parsedSuccessfully: detailedRecords.filter(
        (record) => record.parsedSuccessfully,
      ).length,
      parseFailures: detailedRecords.filter(
        (record) => !record.parsedSuccessfully,
      ).length,
      metadataFilesWithReferences: detailedRecords.filter(
        (record) => record.referenceCount > 0,
      ).length,
      metadataFilesWithoutReferences: detailedRecords.filter(
        (record) => record.referenceCount === 0,
      ).length,
    },
  };

  fs.writeFileSync(
    path.join(reportDirectory, "asset-map-summary.json"),
    JSON.stringify(summary, null, 2),
  );

  fs.writeFileSync(
    path.join(reportDirectory, "asset-map-detailed.json"),
    JSON.stringify(detailedRecords, null, 2),
  );

  const readableLines = [
    "DIYA WEBSITE ASSET MAP",
    "======================",
    "",
    `Generated: ${summary.generatedAt}`,
    `Project: ${summary.projectRoot}`,
    "",
    "SUMMARY",
    "-------",
    `Metadata files: ${summary.totals.metadataFiles}`,
    `Parsed successfully: ${summary.totals.parsedSuccessfully}`,
    `Parse failures: ${summary.totals.parseFailures}`,
    `Metadata files referenced in source: ${summary.totals.metadataFilesWithReferences}`,
    `Metadata files without detected references: ${summary.totals.metadataFilesWithoutReferences}`,
    "",
    "ASSET METADATA FILES",
    "--------------------",
    "",
  ];

  for (const record of detailedRecords) {
    readableLines.push(`Metadata: ${record.metadataPath}`);
    readableLines.push(
      `Expected asset name: ${record.expectedAssetName}`,
    );
    readableLines.push(
      `Parsed: ${record.parsedSuccessfully ? "Yes" : "No"}`,
    );
    readableLines.push(`Detected references: ${record.referenceCount}`);

    if (record.usefulMetadata.length > 0) {
      readableLines.push("Useful metadata:");

      for (const entry of record.usefulMetadata) {
        readableLines.push(`  ${entry.key}: ${entry.value}`);
      }
    } else {
      readableLines.push("Useful metadata: None detected");
    }

    if (record.referencedBy.length > 0) {
      readableLines.push("Referenced by:");

      for (const reference of record.referencedBy) {
        readableLines.push(
          `  ${reference.sourceFile}:${reference.line}`,
        );
        readableLines.push(`    ${reference.preview}`);
      }
    } else {
      readableLines.push("Referenced by: No direct text match detected");
    }

    readableLines.push("");
  }

  fs.writeFileSync(
    path.join(reportDirectory, "asset-map-report.txt"),
    readableLines.join("\n"),
  );

  console.log("");
  console.log("Asset mapping completed successfully.");
  console.log(`Reports saved to: ${reportDirectory}`);
  console.log("");
  console.log(`Metadata files: ${summary.totals.metadataFiles}`);
  console.log(
    `Parsed successfully: ${summary.totals.parsedSuccessfully}`,
  );
  console.log(`Parse failures: ${summary.totals.parseFailures}`);
  console.log(
    `Referenced metadata files: ${summary.totals.metadataFilesWithReferences}`,
  );
  console.log(
    `Unreferenced metadata files: ${summary.totals.metadataFilesWithoutReferences}`,
  );
  console.log("");
}

try {
  console.log("Mapping Lovable asset metadata...");
  walkDirectory(projectRoot);
  findReferences();
  writeReports();
} catch (error) {
  console.error("");
  console.error("Asset mapping failed.");
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
}
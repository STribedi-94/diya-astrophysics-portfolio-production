import { readdir } from "node:fs/promises";
import path from "node:path";

const ASSET_JSON_SUFFIX = ".asset.json";

async function listFilesRecursive(directoryPath) {
  const entries = await readdir(directoryPath, { withFileTypes: true });
  const files = [];

  for (const entry of entries) {
    const fullPath = path.join(directoryPath, entry.name);

    if (entry.isDirectory()) {
      files.push(...(await listFilesRecursive(fullPath)));
      continue;
    }

    if (entry.isFile()) {
      files.push(fullPath);
    }
  }

  return files;
}

function normalizeFilename(filename) {
  return filename
    .toLowerCase()
    .replace(/\.pdf\.pdf$/i, ".pdf")
    .replace(/\.jpg\.jpg$/i, ".jpg")
    .replace(/\.jpeg\.jpeg$/i, ".jpeg")
    .replace(/\.png\.png$/i, ".png")
    .replace(/\.txt\.txt$/i, ".txt")
    .replace(/[^a-z0-9.]+/g, "");
}

function expectedAssetFilename(importPath) {
  const metadataFilename = path.basename(importPath);

  if (!metadataFilename.endsWith(ASSET_JSON_SUFFIX)) {
    return null;
  }

  return metadataFilename.slice(0, -ASSET_JSON_SUFFIX.length);
}

function toPublicUrl(publicAssetsRoot, filePath) {
  const relativePath = path
    .relative(publicAssetsRoot, filePath)
    .split(path.sep)
    .join("/");

  return `/assets/${relativePath}`;
}

export async function createAssetIndex(publicAssetsRoot) {
  const files = await listFilesRecursive(publicAssetsRoot);

  return files.map((filePath) => ({
    filePath,
    filename: path.basename(filePath),
    normalizedFilename: normalizeFilename(path.basename(filePath)),
    publicUrl: toPublicUrl(publicAssetsRoot, filePath),
  }));
}

export function resolveAssetImport(importPath, assetIndex) {
  const expectedFilename = expectedAssetFilename(importPath);

  if (!expectedFilename) {
    return {
      status: "invalid",
      importPath,
      expectedFilename: null,
      candidates: [],
    };
  }

  const normalizedExpected = normalizeFilename(expectedFilename);

  const exactCandidates = assetIndex.filter(
    (asset) => asset.normalizedFilename === normalizedExpected
  );

  if (exactCandidates.length === 1) {
    return {
      status: "resolved",
      importPath,
      expectedFilename,
      match: exactCandidates[0],
      candidates: exactCandidates,
    };
  }

  if (exactCandidates.length > 1) {
    return {
      status: "ambiguous",
      importPath,
      expectedFilename,
      match: null,
      candidates: exactCandidates,
    };
  }

  return {
    status: "unresolved",
    importPath,
    expectedFilename,
    match: null,
    candidates: [],
  };
}

export function resolveScanResults(scanResults, assetIndex) {
  const files = scanResults.files.map((file) => ({
    ...file,
    imports: file.imports.map((assetImport) => ({
      ...assetImport,
      resolution: resolveAssetImport(assetImport.importPath, assetIndex),
    })),
  }));

  const allResolutions = files.flatMap((file) =>
    file.imports.map((assetImport) => assetImport.resolution)
  );

  return {
    ...scanResults,
    files,
    totals: {
      imports: allResolutions.length,
      resolved: allResolutions.filter((item) => item.status === "resolved")
        .length,
      ambiguous: allResolutions.filter((item) => item.status === "ambiguous")
        .length,
      unresolved: allResolutions.filter((item) => item.status === "unresolved")
        .length,
      invalid: allResolutions.filter((item) => item.status === "invalid")
        .length,
    },
  };
}
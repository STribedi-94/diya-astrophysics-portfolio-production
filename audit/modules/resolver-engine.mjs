import path from "node:path";

import {
  findKnowledgeBaseAsset,
  validateAssetKnowledgeBase,
} from "./asset-knowledge-base.mjs";

import { resolveAssetImport } from "./asset-resolver.mjs";

const ASSET_JSON_SUFFIX = ".asset.json";

function getExpectedFilename(importPath) {
  const metadataFilename = path.basename(importPath);

  if (!metadataFilename.endsWith(ASSET_JSON_SUFFIX)) {
    return null;
  }

  return metadataFilename.slice(0, -ASSET_JSON_SUFFIX.length);
}

function createKnowledgeBaseMatch(knowledgeBaseAsset, assetIndex) {
  const indexedAsset =
    assetIndex.find(
      (asset) => asset.publicUrl === knowledgeBaseAsset.localPublicUrl
    ) ?? null;

  return {
    filePath: indexedAsset?.filePath ?? null,
    filename:
      indexedAsset?.filename ?? knowledgeBaseAsset.canonicalFilename,
    normalizedFilename: indexedAsset?.normalizedFilename ?? null,
    publicUrl: knowledgeBaseAsset.localPublicUrl,
    knowledgeBaseId: knowledgeBaseAsset.id,
    type: knowledgeBaseAsset.type,
    category: knowledgeBaseAsset.category,
    cloudflareR2Key: knowledgeBaseAsset.cloudflareR2Key,
    migrationStatus: knowledgeBaseAsset.migrationStatus,
  };
}

export function resolveAssetWithEngine(importPath, assetIndex) {
  const expectedFilename = getExpectedFilename(importPath);

  if (!expectedFilename) {
    return {
      status: "invalid",
      method: "none",
      importPath,
      expectedFilename: null,
      match: null,
      candidates: [],
      knowledgeBase: null,
    };
  }

  const knowledgeBaseResult = findKnowledgeBaseAsset(expectedFilename);

  if (knowledgeBaseResult.status === "resolved") {
    const knowledgeBaseAsset = knowledgeBaseResult.asset;
    const match = createKnowledgeBaseMatch(
      knowledgeBaseAsset,
      assetIndex
    );

    return {
      status: "resolved",
      method: "knowledge-base",
      importPath,
      expectedFilename,
      match,
      candidates: [match],
      knowledgeBase: knowledgeBaseAsset,
    };
  }

  if (knowledgeBaseResult.status === "ambiguous") {
    return {
      status: "ambiguous",
      method: "knowledge-base",
      importPath,
      expectedFilename,
      match: null,
      candidates: knowledgeBaseResult.matches.map((asset) =>
        createKnowledgeBaseMatch(asset, assetIndex)
      ),
      knowledgeBase: null,
    };
  }

  const genericResult = resolveAssetImport(importPath, assetIndex);

  return {
    ...genericResult,
    method:
      genericResult.status === "resolved"
        ? "filename"
        : "unresolved",
    knowledgeBase: null,
  };
}

export function resolveScanResultsWithEngine(
  scanResults,
  assetIndex
) {
  const validation = validateAssetKnowledgeBase();

  if (!validation.valid) {
    throw new Error(
      `Asset Knowledge Base validation failed:\n${validation.errors.join(
        "\n"
      )}`
    );
  }

  const files = scanResults.files.map((file) => ({
    ...file,
    imports: file.imports.map((assetImport) => ({
      ...assetImport,
      resolution: resolveAssetWithEngine(
        assetImport.importPath,
        assetIndex
      ),
    })),
  }));

  const allResolutions = files.flatMap((file) =>
    file.imports.map((assetImport) => assetImport.resolution)
  );

  return {
    ...scanResults,
    files,
    knowledgeBaseValidation: validation,
    totals: {
      imports: allResolutions.length,
      resolved: allResolutions.filter(
        (item) => item.status === "resolved"
      ).length,
      resolvedByKnowledgeBase: allResolutions.filter(
        (item) =>
          item.status === "resolved" &&
          item.method === "knowledge-base"
      ).length,
      resolvedByFilename: allResolutions.filter(
        (item) =>
          item.status === "resolved" &&
          item.method === "filename"
      ).length,
      ambiguous: allResolutions.filter(
        (item) => item.status === "ambiguous"
      ).length,
      unresolved: allResolutions.filter(
        (item) => item.status === "unresolved"
      ).length,
      invalid: allResolutions.filter(
        (item) => item.status === "invalid"
      ).length,
    },
  };
}
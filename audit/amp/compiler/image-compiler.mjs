/**
 * AMP Image Compiler
 *
 * Validates the authoritative Image AMP records, verifies lifecycle and
 * physical-file consistency, rejects duplicate identities, and returns one
 * deterministic image registry.
 *
 * Active records must have physical source files.
 * Draft records may represent verified assets whose physical migration is
 * still pending.
 */

import { access } from "node:fs/promises";
import path from "node:path";

import { isAssetRecord } from "../contracts/asset-record.mjs";
import { isValidAssetId } from "../identity/asset-id.mjs";
import { imageRecords } from "../images/index.mjs";

async function fileExists(filePath) {
  try {
    await access(filePath);
    return true;
  } catch {
    return false;
  }
}

function resolvePhysicalSourcePath(sourceKey) {
  return path.resolve(
    "public",
    "assets",
    ...sourceKey.split("/"),
  );
}

function validateImageRecordShape(record) {
  if (!isAssetRecord(record)) {
    throw new TypeError(
      `Image does not satisfy the AMP Asset Record contract: ${record?.id ?? "unknown"}`,
    );
  }

  if (record.type !== "image") {
    throw new TypeError(
      `Image AMP record must use type "image": ${record.id}`,
    );
  }

  if (!isValidAssetId(record.id)) {
    throw new TypeError(
      `Image has an invalid AMP Asset ID: ${record.id}`,
    );
  }

  if (
    typeof record.source?.key !== "string" ||
    record.source.key.trim() === ""
  ) {
    throw new TypeError(
      `Image record has no valid source key: ${record.id}`,
    );
  }

  if (
    typeof record.website?.recordId !== "string" ||
    record.website.recordId.trim() === ""
  ) {
    throw new TypeError(
      `Image record has no valid website recordId: ${record.id}`,
    );
  }

  if (
    record.status !== "active" &&
    record.status !== "draft" &&
    record.status !== "deprecated"
  ) {
    throw new TypeError(
      `Image record has an unsupported lifecycle status: ${record.id}`,
    );
  }
}

async function validatePhysicalSource(record) {
  const sourcePath =
    resolvePhysicalSourcePath(record.source.key);

  const exists = await fileExists(sourcePath);

  if (record.status === "active" && !exists) {
    throw new Error(
      `Active Image AMP asset is missing its physical source: ${record.id} -> ${record.source.key}`,
    );
  }

  return {
    exists,
    sourcePath,
  };
}

export async function compileImageRegistry() {
  const compiledRecords = [];
  const assetIds = new Set();
  const websiteRecordIds = new Set();
  const sourceKeys = new Set();

  for (const record of imageRecords) {
    validateImageRecordShape(record);

    if (assetIds.has(record.id)) {
      throw new Error(
        `Duplicate compiled Image AMP Asset ID: ${record.id}`,
      );
    }

    if (websiteRecordIds.has(record.website.recordId)) {
      throw new Error(
        `Duplicate compiled image website recordId: ${record.website.recordId}`,
      );
    }

    if (sourceKeys.has(record.source.key)) {
      throw new Error(
        `Duplicate compiled image source key: ${record.source.key}`,
      );
    }

    await validatePhysicalSource(record);

    assetIds.add(record.id);
    websiteRecordIds.add(record.website.recordId);
    sourceKeys.add(record.source.key);
    compiledRecords.push(record);
  }

  return compiledRecords.sort((left, right) =>
    left.id.localeCompare(right.id),
  );
}
/**
 * AMP Document Compiler
 *
 * Discovers every configured PDF, derives its source and derivative keys,
 * applies verified website mappings, validates the resulting AMP records,
 * and returns one deterministic registry.
 */

import { access } from "node:fs/promises";
import path from "node:path";

import {
  createAssetRecord,
  isAssetRecord,
} from "../contracts/asset-record.mjs";
import { isValidAssetId } from "../identity/asset-id.mjs";
import { DOCUMENT_GROUPS } from "../../modules/document-groups.mjs";
import {
  getDocumentWebsiteMapping,
  validateDocumentWebsiteMappings,
} from "../../modules/document-website-mappings.mjs";
import { findPdfFiles } from "../../modules/document-scanner.mjs";
import { createDocumentJob } from "../../modules/document-job.mjs";

function toPosixPath(value) {
  return value.split(path.sep).join("/");
}

function createSlug(value) {
  return value
    .replace(/(?:\.pdf)+$/gi, "")
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function createAssetId(group, pdfPath) {
  if (group.id === "cv") {
    return "document-cv-primary";
  }

  if (group.id === "thesis") {
    return "document-thesis-primary";
  }

  const slug = createSlug(path.basename(pdfPath));

  return `document-${group.id}-${slug}`;
}

async function fileExists(filePath) {
  try {
    await access(filePath);
    return true;
  } catch {
    return false;
  }
}

async function compileDocumentRecord(group, pdfPath) {
  const job = createDocumentJob(
    group.category,
    pdfPath,
    group.thumbnailDirectory,
    group.previewDirectory,
  );

  const sourceFileName = path.basename(pdfPath);
  const websiteMapping =
    getDocumentWebsiteMapping(sourceFileName);

  if (!websiteMapping) {
    throw new Error(
      `No verified website mapping exists for document: ${sourceFileName}`,
    );
  }

  const record = Object.assign(
    createAssetRecord(),
    {
      id: createAssetId(group, pdfPath),
      type: "document",
      category: group.category,
      status: "active",

      source: {
        key: toPosixPath(
          path.join(
            group.documentKeyPrefix,
            sourceFileName,
          ),
        ),
        fileName: sourceFileName,
      },

      derivatives: {
        thumbnail: {
          key: job.thumbnailKey,
        },
        preview: {
          key: job.previewKey,
        },
      },

      website: {
        recordId: websiteMapping.recordId,
        access: websiteMapping.access,
        downloadName: websiteMapping.downloadName,
      },

      metadata: {
        groupId: group.id,
        recordKind: group.recordKind,
        authorship: group.authorship ?? null,
      },

      processing: {
        processor: "document",
        sourceBaseName: job.baseName,
      },

      cloud: {},

      relationships: {
        publicationId:
          websiteMapping.publicationId,
      },
    },
  );

  if (!isAssetRecord(record)) {
    throw new TypeError(
      `Compiled document does not satisfy the AMP contract: ${pdfPath}`,
    );
  }

  if (!isValidAssetId(record.id)) {
    throw new TypeError(
      `Compiled document has an invalid Asset ID: ${record.id}`,
    );
  }

  const sourceExists = await fileExists(pdfPath);
  const thumbnailExists = await fileExists(
    job.thumbnailPath,
  );
  const previewExists = await fileExists(
    job.previewPath,
  );

  if (
    !sourceExists ||
    !thumbnailExists ||
    !previewExists
  ) {
    const missing = [];

    if (!sourceExists) {
      missing.push("source");
    }

    if (!thumbnailExists) {
      missing.push("thumbnail");
    }

    if (!previewExists) {
      missing.push("preview");
    }

    throw new Error(
      `Missing ${missing.join(", ")} for AMP asset ${record.id}`,
    );
  }

  return record;
}

export async function compileDocumentRegistry() {
  const mappingValidation =
    validateDocumentWebsiteMappings();

  if (!mappingValidation.valid) {
    throw new Error(
      [
        "Document website mapping validation failed.",
        ...mappingValidation.errors,
      ].join("\n"),
    );
  }

  const records = [];
  const assetIds = new Set();
  const recordIds = new Set();

  for (const group of DOCUMENT_GROUPS) {
    const pdfFiles = await findPdfFiles(
      group.documentDirectory,
    );

    for (const pdfPath of pdfFiles) {
      const record = await compileDocumentRecord(
        group,
        pdfPath,
      );

      if (assetIds.has(record.id)) {
        throw new Error(
          `Duplicate compiled AMP Asset ID: ${record.id}`,
        );
      }

      if (recordIds.has(record.website.recordId)) {
        throw new Error(
          `Duplicate compiled website recordId: ${record.website.recordId}`,
        );
      }

      assetIds.add(record.id);
      recordIds.add(record.website.recordId);
      records.push(record);
    }
  }

  if (
    records.length !== mappingValidation.mappings
  ) {
    throw new Error(
      `Compiled ${records.length} documents, but ${mappingValidation.mappings} verified website mappings exist.`,
    );
  }

  return records.sort((left, right) =>
    left.id.localeCompare(right.id),
  );
}
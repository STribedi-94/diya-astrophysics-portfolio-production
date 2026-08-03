/**
 * AMP Document Compiler
 *
 * Discovers every configured PDF, derives its source and derivative keys,
 * validates the resulting AMP records, and returns one deterministic registry.
 */

import { access } from "node:fs/promises";
import path from "node:path";

import { createAssetRecord, isAssetRecord } from "../contracts/asset-record.mjs";
import { isValidAssetId } from "../identity/asset-id.mjs";
import { DOCUMENT_GROUPS } from "../../modules/document-groups.mjs";
import { findPdfFiles } from "../../modules/document-scanner.mjs";
import { createDocumentJob } from "../../modules/document-job.mjs";

function toPosixPath(value) {
    return value.split(path.sep).join("/");
}

function removeRepeatedPdfExtensions(fileName) {
    return fileName.replace(/(?:\.pdf)+$/i, ".pdf");
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
        group.previewDirectory
    );

    const sourceFileName = path.basename(pdfPath);
    const downloadName = removeRepeatedPdfExtensions(sourceFileName);

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
                        sourceFileName
                    )
                ),
                fileName: sourceFileName
            },

            derivatives: {
                thumbnail: {
                    key: job.thumbnailKey
                },
                preview: {
                    key: job.previewKey
                }
            },

            website: {
                recordId: null,
                access: "preview-download",
                downloadName
            },

            metadata: {
                groupId: group.id,
                recordKind: group.recordKind,
                authorship: group.authorship ?? null
            },

            processing: {
                processor: "document",
                sourceBaseName: job.baseName
            },

            cloud: {},

            relationships: {
                publicationId: null
            }
        }
    );

    if (!isAssetRecord(record)) {
        throw new TypeError(
            `Compiled document does not satisfy the AMP contract: ${pdfPath}`
        );
    }

    if (!isValidAssetId(record.id)) {
        throw new TypeError(
            `Compiled document has an invalid Asset ID: ${record.id}`
        );
    }

    const sourceExists = await fileExists(pdfPath);
    const thumbnailExists = await fileExists(job.thumbnailPath);
    const previewExists = await fileExists(job.previewPath);

    if (!sourceExists || !thumbnailExists || !previewExists) {
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
            `Missing ${missing.join(", ")} for AMP asset ${record.id}`
        );
    }

    return record;
}

export async function compileDocumentRegistry() {
    const records = [];
    const assetIds = new Set();

    for (const group of DOCUMENT_GROUPS) {
        const pdfFiles = await findPdfFiles(
            group.documentDirectory
        );

        for (const pdfPath of pdfFiles) {
            const record = await compileDocumentRecord(
                group,
                pdfPath
            );

            if (assetIds.has(record.id)) {
                throw new Error(
                    `Duplicate compiled AMP Asset ID: ${record.id}`
                );
            }

            assetIds.add(record.id);
            records.push(record);
        }
    }

    return records.sort(
        (left, right) => left.id.localeCompare(right.id)
    );
}
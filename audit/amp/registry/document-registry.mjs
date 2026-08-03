/**
 * AMP Document Registry
 *
 * Provides document-specific registration and lookup functions
 * while using the central AMP Asset Registry as the authoritative
 * collection for all managed assets.
 *
 * This module does not yet contain real document records.
 */

import {
    getAssetRegistry,
    registerAsset
} from "./asset-registry.mjs";

export function registerDocument(documentRecord) {
    if (
        !documentRecord ||
        documentRecord.type !== "document"
    ) {
        throw new TypeError(
            'AMP document records must use type "document".'
        );
    }

    registerAsset(documentRecord);
}

export function getDocumentRegistry() {
    return getAssetRegistry().filter(
        (assetRecord) => assetRecord.type === "document"
    );
}

export function findDocumentById(assetId) {
    return (
        getDocumentRegistry().find(
            (documentRecord) => documentRecord.id === assetId
        ) ?? null
    );
}
/**
 * AMP Image Registry
 *
 * Provides image-specific registration and lookup functions
 * while using the central AMP Asset Registry as the authoritative
 * collection for all managed assets.
 */

import {
    getAssetRegistry,
    registerAsset
} from "./asset-registry.mjs";

export function registerImage(imageRecord) {
    if (
        !imageRecord ||
        imageRecord.type !== "image"
    ) {
        throw new TypeError(
            'AMP image records must use type "image".'
        );
    }

    registerAsset(imageRecord);
}

export function getImageRegistry() {
    return getAssetRegistry().filter(
        (assetRecord) => assetRecord.type === "image"
    );
}

export function findImageById(assetId) {
    return (
        getImageRegistry().find(
            (imageRecord) => imageRecord.id === assetId
        ) ?? null
    );
}

export function findImageByWebsiteRecordId(recordId) {
    return (
        getImageRegistry().find(
            (imageRecord) =>
                imageRecord.website?.recordId === recordId
        ) ?? null
    );
}
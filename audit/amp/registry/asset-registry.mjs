/**
 * AMP Asset Registry
 *
 * Central collection for AMP-managed asset records.
 * Asset records are validated before registration.
 */

import { isAssetRecord } from "../contracts/asset-record.mjs";
import { isValidAssetId } from "../identity/asset-id.mjs";

const assetRegistry = [];

export function getAssetRegistry() {
    return assetRegistry;
}

export function registerAsset(assetRecord) {
    if (!isAssetRecord(assetRecord)) {
        throw new TypeError(
            "AMP asset record does not satisfy the required contract."
        );
    }

    if (!isValidAssetId(assetRecord.id)) {
        throw new TypeError(
            "AMP asset record must contain a valid Asset ID."
        );
    }

    const alreadyExists = assetRegistry.some(
        (asset) => asset.id === assetRecord.id
    );

    if (alreadyExists) {
        throw new Error(
            `Duplicate AMP Asset ID: ${assetRecord.id}`
        );
    }

    assetRegistry.push(assetRecord);
}

export function clearAssetRegistry() {
    assetRegistry.length = 0;
}
/**
 * AMP Asset Registry
 *
 * Central collection for AMP-managed asset records.
 * Asset records will be added incrementally as each
 * asset class is integrated into the platform.
 */

const assetRegistry = [];

export function getAssetRegistry() {
    return assetRegistry;
}

export function registerAsset(assetRecord) {
    assetRegistry.push(assetRecord);
}

export function clearAssetRegistry() {
    assetRegistry.length = 0;
}
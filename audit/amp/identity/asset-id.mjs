/**
 * AMP Asset ID utilities
 *
 * Defines validation rules for stable AMP Asset IDs.
 */

export const ASSET_ID_PATTERN =
    /^[a-z][a-z0-9-]*$/;

export function isValidAssetId(id) {
    return (
        typeof id === "string" &&
        ASSET_ID_PATTERN.test(id)
    );
}
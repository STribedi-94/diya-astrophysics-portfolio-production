/**
 * AMP Asset Record Contract
 *
 * Defines the canonical engineering structure for every asset managed
 * by the Diya Asset Management Platform.
 *
 * This module contains no real website asset records.
 */

export const ASSET_TYPES = [
    "document",
    "image"
];

export const ASSET_STATUSES = [
    "active",
    "draft",
    "deprecated"
];

export function createAssetRecord() {
    return {
        id: "",
        type: "",
        category: "",
        status: "active",

        source: {},

        derivatives: {},

        website: {},

        metadata: {},

        processing: {},

        cloud: {},

        relationships: {}
    };
}

export function isAssetRecord(value) {
    return Boolean(
        value &&
        typeof value === "object" &&
        !Array.isArray(value) &&
        typeof value.id === "string" &&
        typeof value.type === "string" &&
        typeof value.category === "string" &&
        typeof value.status === "string" &&
        value.source &&
        typeof value.source === "object" &&
        !Array.isArray(value.source) &&
        value.derivatives &&
        typeof value.derivatives === "object" &&
        !Array.isArray(value.derivatives) &&
        value.website &&
        typeof value.website === "object" &&
        !Array.isArray(value.website) &&
        value.metadata &&
        typeof value.metadata === "object" &&
        !Array.isArray(value.metadata) &&
        value.processing &&
        typeof value.processing === "object" &&
        !Array.isArray(value.processing) &&
        value.cloud &&
        typeof value.cloud === "object" &&
        !Array.isArray(value.cloud) &&
        value.relationships &&
        typeof value.relationships === "object" &&
        !Array.isArray(value.relationships)
    );
}
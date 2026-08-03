/**
 * AMP Asset Record Contract
 *
 * Defines the canonical engineering schema for every asset managed
 * by the Diya Asset Management Platform (AMP).
 *
 * This file defines structure only.
 * It does not contain actual website assets.
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

export const createAssetRecord = () => ({
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
});
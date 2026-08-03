/**
 * AMP Globe Image Records
 *
 * Contains authoritative engineering records for Observatory globe textures.
 */

import { createAssetRecord } from "../contracts/asset-record.mjs";

export const earthDayTextureImageRecord = Object.assign(
    createAssetRecord(),
    {
        id: "image-globe-earth-day",
        type: "image",
        category: "globe-texture",
        status: "active",

        source: {
            key: "images/globe/earth-day-2k.jpg",
            fileName: "earth-day-2k.jpg",
            mimeType: "image/jpeg"
        },

        derivatives: {},

        website: {
            recordId: "earth-day-texture"
        },

        metadata: {},

        processing: {
            processor: "image",
            profile: "globe-texture"
        },

        cloud: {},

        relationships: {
            consumers: ["observatory-globe"]
        }
    }
);

export const earthNightTextureImageRecord = Object.assign(
    createAssetRecord(),
    {
        id: "image-globe-earth-night",
        type: "image",
        category: "globe-texture",
        status: "active",

        source: {
            key: "images/globe/earth-night-1k.jpg",
            fileName: "earth-night-1k.jpg",
            mimeType: "image/jpeg"
        },

        derivatives: {},

        website: {
            recordId: "earth-night-texture"
        },

        metadata: {},

        processing: {
            processor: "image",
            profile: "globe-texture"
        },

        cloud: {},

        relationships: {
            consumers: ["observatory-globe"]
        }
    }
);

export const globeImageRecords = [
    earthDayTextureImageRecord,
    earthNightTextureImageRecord
];

export const globeImageRecordCount =
    globeImageRecords.length;
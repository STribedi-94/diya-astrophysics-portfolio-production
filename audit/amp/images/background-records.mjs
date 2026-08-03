/**
 * AMP Background Image Records
 *
 * Contains authoritative engineering records for shared background
 * and hero images.
 */

import { createAssetRecord } from "../contracts/asset-record.mjs";

export const hubbleHeroImageRecord = Object.assign(
    createAssetRecord(),
    {
        id: "image-background-hubble-hero",
        type: "image",
        category: "background",
        status: "active",

        source: {
            key: "images/backgrounds/hubble-ultra-deep-field.jpg",
            fileName: "hubble-ultra-deep-field.jpg",
            mimeType: "image/jpeg"
        },

        derivatives: {},

        website: {
            recordId: "hubble-hero"
        },

        metadata: {},

        processing: {
            processor: "image",
            profile: "hero-background"
        },

        cloud: {},

        relationships: {
            consumers: [
                "publications",
                "downloads"
            ]
        }
    }
);

export const backgroundImageRecords = [
    hubbleHeroImageRecord
];

export const backgroundImageRecordCount =
    backgroundImageRecords.length;
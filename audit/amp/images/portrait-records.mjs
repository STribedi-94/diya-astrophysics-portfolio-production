/**
 * AMP Portrait Image Records
 *
 * Contains authoritative engineering records for portrait images.
 *
 * Biography, page copy and alt text remain owned by the About route.
 */

import { createAssetRecord } from "../contracts/asset-record.mjs";

export const primaryPortraitImageRecord = Object.assign(
    createAssetRecord(),
    {
        id: "image-portrait-primary",
        type: "image",
        category: "portrait",
        status: "active",

        source: {
            key: "images/portrait/original/potrait-original-image.jpeg",
            fileName: "potrait-original-image.jpeg",
            mimeType: "image/jpeg"
        },

        derivatives: {},

        website: {
            recordId: "portrait-primary"
        },

        metadata: {},

        processing: {
            processor: "image",
            profile: "portrait-original"
        },

        cloud: {},

        relationships: {
            consumers: ["about"]
        }
    }
);

export const portraitImageRecords = [
    primaryPortraitImageRecord
];

export const portraitImageRecordCount =
    portraitImageRecords.length;
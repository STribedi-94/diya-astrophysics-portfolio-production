/**
 * AMP Managed Image Records
 *
 * Contains authoritative engineering records for reusable website visuals
 * that do not belong exclusively to Gallery, portrait, background or globe
 * asset families.
 *
 * Pages consume these images by stable website record ID through imageService.
 */

import { createAssetRecord } from "../contracts/asset-record.mjs";

export const thesisMagneticActivityVisualImageRecord = Object.assign(
    createAssetRecord(),
    {
        id: "image-managed-thesis-m-dwarf-magnetic-activity",
        type: "image",
        category: "managed-visual",
        status: "active",

        source: {
            key: "images/thesis/diya-thesis-m-dwarf-magnetic-activity-visual.png",
            fileName: "diya-thesis-m-dwarf-magnetic-activity-visual.png",
            mimeType: "image/png"
        },

        derivatives: {},

        website: {
            recordId: "thesis-m-dwarf-magnetic-activity"
        },

        metadata: {
            role: "doctoral-thesis-scientific-visual"
        },

        processing: {
            processor: "image",
            profile: "managed-original"
        },

        cloud: {},

        relationships: {
            consumers: [
                "academic-journey",
                "downloads",
                "scientific-mission-log"
            ]
        }
    }
);

export const managedImageRecords = [
    thesisMagneticActivityVisualImageRecord
];

export const managedImageRecordCount =
    managedImageRecords.length;
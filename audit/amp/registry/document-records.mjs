/**
 * AMP Document Records
 *
 * Contains the authoritative engineering records for document assets
 * managed by the Diya Asset Management Platform.
 */

import { createAssetRecord } from "../contracts/asset-record.mjs";

export const cvDocumentRecord = Object.assign(
    createAssetRecord(),
    {
        id: "document-cv-primary",
        type: "document",
        category: "cv",
        status: "active",

        source: {
            key: "documents/cv/diya-ram-cv.pdf"
        },

        derivatives: {
            thumbnail: {
                key: "thumbnails/cv/diya-ram-cv.webp"
            },
            preview: {
                key: "previews/cv/diya-ram-cv.jpg"
            }
        },

        website: {
            recordId: "cv",
            access: "preview-download",
            downloadName: "diya-ram-cv.pdf"
        },

        metadata: {},

        processing: {
            processor: "document"
        },

        cloud: {},

        relationships: {
            publicationId: null
        }
    }
);
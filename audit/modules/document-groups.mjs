/**
 * Document Asset Group Configuration
 *
 * Defines the authoritative mapping between document source directories,
 * logical AMP categories, and generated derivative directories.
 *
 * Both the Document Asset Engine and the AMP Document Compiler must consume
 * this configuration so discovery and registry generation remain consistent.
 */

import path from "node:path";
import { PATHS } from "./paths.mjs";

export const DOCUMENT_GROUPS = [
    {
        id: "cv",
        label: "CV",
        category: "cv",
        recordKind: "cv",
        documentDirectory: path.join(
            PATHS.documents,
            "cv"
        ),
        documentKeyPrefix: "documents/cv",
        thumbnailDirectory: path.join(
            PATHS.thumbnails,
            "cv"
        ),
        previewDirectory: path.join(
            PATHS.previews,
            "cv"
        )
    },

    {
        id: "thesis",
        label: "Thesis",
        category: "thesis",
        recordKind: "thesis",
        documentDirectory: path.join(
            PATHS.documents,
            "thesis"
        ),
        documentKeyPrefix: "documents/thesis",
        thumbnailDirectory: path.join(
            PATHS.thumbnails,
            "thesis"
        ),
        previewDirectory: path.join(
            PATHS.previews,
            "thesis"
        )
    },

    {
        id: "first-author-papers",
        label: "First-author Papers",
        category: "first-author",
        recordKind: "paper",
        authorship: "first-author",
        documentDirectory: path.join(
            PATHS.documents,
            "first-author"
        ),
        documentKeyPrefix: "documents/first-author",
        thumbnailDirectory: path.join(
            PATHS.thumbnails,
            "first-author"
        ),
        previewDirectory: path.join(
            PATHS.previews,
            "first-author"
        )
    },

    {
        id: "collaborative-papers",
        label: "Collaborative Papers",
        category: "collaborative",
        recordKind: "paper",
        authorship: "collaborative",
        documentDirectory: path.join(
            PATHS.documents,
            "collaborative"
        ),
        documentKeyPrefix: "documents/collaborative",
        thumbnailDirectory: path.join(
            PATHS.thumbnails,
            "collaborative"
        ),
        previewDirectory: path.join(
            PATHS.previews,
            "collaborative"
        )
    },

    {
        id: "collaborative-proceedings",
        label: "Collaborative Proceedings",
        category: "proceedings",
        recordKind: "proceeding",
        authorship: "collaborative",
        documentDirectory: path.join(
            PATHS.documents,
            "proceedings",
            "collaborative"
        ),
        documentKeyPrefix:
            "documents/proceedings/collaborative",
        thumbnailDirectory: path.join(
            PATHS.thumbnails,
            "proceedings"
        ),
        previewDirectory: path.join(
            PATHS.previews,
            "proceedings"
        )
    },

    {
        id: "first-author-proceedings",
        label: "First-author Proceedings",
        category: "proceedings",
        recordKind: "proceeding",
        authorship: "first-author",
        documentDirectory: path.join(
            PATHS.documents,
            "proceedings",
            "first-author"
        ),
        documentKeyPrefix:
            "documents/proceedings/first-author",
        thumbnailDirectory: path.join(
            PATHS.thumbnails,
            "proceedings"
        ),
        previewDirectory: path.join(
            PATHS.previews,
            "proceedings"
        )
    }
];
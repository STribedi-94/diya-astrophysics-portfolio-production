/**
 * AMP Image Registry Entry Point
 *
 * Aggregates every Image AMP module into a single engineering collection.
 */

import {
    galleryImageRecords
} from "./gallery-records.mjs";

import {
    portraitImageRecords
} from "./portrait-records.mjs";

import {
    backgroundImageRecords
} from "./background-records.mjs";

import {
    globeImageRecords
} from "./globe-records.mjs";
import {
    managedImageRecords
} from "./managed-records.mjs";
import {
    managerAddedImageRecords
} from "./manager-added-records.mjs";

export const imageRecords = [
    ...galleryImageRecords,
    ...portraitImageRecords,
    ...backgroundImageRecords,
    ...globeImageRecords,
    ...managedImageRecords,
    ...managerAddedImageRecords
];

export const imageRecordCount =
    imageRecords.length;

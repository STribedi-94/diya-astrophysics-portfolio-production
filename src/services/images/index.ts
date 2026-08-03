/**
 * Image Service
 *
 * Browser-facing integration boundary between the React application
 * and the Asset Management Platform (AMP).
 *
 * React components consume resolved image assets through this service
 * rather than reading AMP engineering records directly.
 */

import { assetUrl } from "@/config/assets";
import { imageRecords } from "@/generated/amp/image-records.generated";

export interface ImageAsset {
  /** Stable AMP engineering identity. */
  assetId: string;

  /** Website-facing record identity. */
  recordId: string;

  /** Asset lifecycle state. */
  status: "active" | "draft" | "deprecated";

  /** Public image URL. */
  imageUrl: string;
}

type GeneratedImageRecord =
  (typeof imageRecords)[number];

function toImageAsset(
  record: GeneratedImageRecord,
): ImageAsset {
  return {
    assetId: record.id,
    recordId: record.website.recordId,
    status: record.status,
    imageUrl: assetUrl(record.source.key),
  };
}

const resolvedImages = Object.freeze(
  imageRecords.map(toImageAsset),
);

const imagesByRecordId = new Map(
  resolvedImages.map((image) => [
    image.recordId,
    image,
  ]),
);

const imagesByAssetId = new Map(
  resolvedImages.map((image) => [
    image.assetId,
    image,
  ]),
);

export interface ImageService {
  getImage(
    recordId: string,
  ): ImageAsset | undefined;

  getRequiredImage(
    recordId: string,
  ): ImageAsset;

  getByAssetId(
    assetId: string,
  ): ImageAsset | undefined;

  getAll(): readonly ImageAsset[];
}

export const imageService: ImageService = {
  getImage(recordId) {
    return imagesByRecordId.get(recordId);
  },

  getRequiredImage(recordId) {
    const image = imagesByRecordId.get(recordId);

    if (!image) {
      throw new Error(
        `No AMP-managed image exists for website record: ${recordId}`,
      );
    }

    if (image.status !== "active") {
      throw new Error(
        `AMP-managed image is not active: ${recordId} (${image.status})`,
      );
    }

    return image;
  },

  getByAssetId(assetId) {
    return imagesByAssetId.get(assetId);
  },

  getAll() {
    return resolvedImages;
  },
};
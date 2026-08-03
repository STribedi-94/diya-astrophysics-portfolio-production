/**
 * Document Service
 *
 * Browser-facing integration boundary between the React application
 * and the Asset Management Platform (AMP).
 *
 * React components and data modules consume resolved document assets
 * through this service rather than reading AMP engineering records
 * directly.
 */

import { assetUrl } from "@/config/assets";
import { documentRecords } from "@/generated/amp/document-records.generated";

export type DocumentAccess =
  | "public-download"
  | "preview-download"
  | "preview-only"
  | "external"
  | "metadata-only";

export interface DocumentAsset {
  /** Stable AMP engineering identity. */
  assetId: string;

  /** Website or scientific record identity. */
  recordId: string;

  /** Related publication identity, when applicable. */
  publicationId?: string;

  /** Resolved public URL of the source PDF. */
  documentUrl: string;

  /** Resolved document thumbnail URL. */
  thumbnailUrl?: string;

  /** Resolved document preview URL. */
  previewUrl?: string;

  /** Browser download filename. */
  downloadName?: string;

  /** Approved website access state. */
  access: DocumentAccess;
}

type GeneratedDocumentRecord =
  (typeof documentRecords)[number];

function resolveOptionalAssetKey(
  key: string | undefined,
): string | undefined {
  return key ? assetUrl(key) : undefined;
}

function toDocumentAsset(
  record: GeneratedDocumentRecord,
): DocumentAsset {
  return {
    assetId: record.id,
    recordId: record.website.recordId,
    publicationId:
      record.relationships.publicationId ?? undefined,
    documentUrl: assetUrl(record.source.key),
    thumbnailUrl: resolveOptionalAssetKey(
      record.derivatives.thumbnail?.key,
    ),
    previewUrl: resolveOptionalAssetKey(
      record.derivatives.preview?.key,
    ),
    downloadName:
      record.website.downloadName ?? undefined,
    access: record.website.access,
  };
}

const resolvedDocuments = Object.freeze(
  documentRecords.map(toDocumentAsset),
);

const documentsByRecordId = new Map(
  resolvedDocuments.map((document) => [
    document.recordId,
    document,
  ]),
);

const documentsByAssetId = new Map(
  resolvedDocuments.map((document) => [
    document.assetId,
    document,
  ]),
);

const documentsByPublicationId = new Map(
  resolvedDocuments
    .filter(
      (
        document,
      ): document is DocumentAsset & {
        publicationId: string;
      } => Boolean(document.publicationId),
    )
    .map((document) => [
      document.publicationId,
      document,
    ]),
);

export interface DocumentService {
  /**
   * Primary lookup used by website records such as
   * "cv", "thesis", "gj1151" and "wolf359".
   */
  getDocument(
    recordId: string,
  ): DocumentAsset | undefined;

  /**
   * Lookup by scientific publication identity.
   */
  getByPublicationId(
    publicationId: string,
  ): DocumentAsset | undefined;

  /**
   * Engineering lookup by stable AMP Asset ID.
   */
  getByAssetId(
    assetId: string,
  ): DocumentAsset | undefined;

  /**
   * Returns every resolved AMP-managed document.
   */
  getAll(): readonly DocumentAsset[];
}

export const documentService: DocumentService = {
  getDocument(recordId) {
    return documentsByRecordId.get(recordId);
  },

  getByPublicationId(publicationId) {
    return documentsByPublicationId.get(publicationId);
  },

  getByAssetId(assetId) {
    return documentsByAssetId.get(assetId);
  },

  getAll() {
    return resolvedDocuments;
  },
};
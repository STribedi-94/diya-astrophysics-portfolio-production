import { imageRecords } from "../images/index.mjs";
import { documentRecords } from "../generated/document-records.generated.mjs";
import { findPublicationTarget } from "./publication-store.mjs";

export function discoverAssetTarget(targetType, targetId) {
  if (targetType === "image") {
    const record = imageRecords.find((candidate) => candidate.id === targetId || candidate.website?.recordId === targetId);
    return record ? { exists: true, targetType, targetId, assetId: record.id, record } : { exists: false, targetType, targetId, assetId: null, record: null };
  }

  if (targetType === "document") {
    const record = documentRecords.find((candidate) => candidate.id === targetId || candidate.website?.recordId === targetId || candidate.relationships?.publicationId === targetId);
    return record ? { exists: true, targetType, targetId, assetId: record.id, record } : { exists: false, targetType, targetId, assetId: null, record: null };
  }

  if (targetType === "publication") {
    return findPublicationTarget(targetId);
  }

  throw new Error(`Unsupported discovery target type: ${targetType}`);
}

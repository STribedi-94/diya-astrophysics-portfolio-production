import path from "node:path";

export function resolveManagedDestination(target) {
  if (!target?.record) {
    throw new Error("Cannot resolve a managed destination without an AMP target record.");
  }

  const sourceKey = target.record.source?.key;

  if (!sourceKey || typeof sourceKey !== "string") {
    throw new Error(`AMP target has no valid source key: ${target.assetId ?? target.targetId}`);
  }

  const destinationFile = path.resolve("public", "assets", ...sourceKey.split("/"));

  return Object.freeze({
    assetId: target.assetId,
    sourceKey,
    destinationFile,
  });
}

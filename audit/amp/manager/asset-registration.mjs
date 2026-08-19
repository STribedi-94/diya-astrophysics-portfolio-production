import path from "node:path";

const IMAGE_EXTENSIONS = new Set([".jpg", ".jpeg", ".png", ".webp"]);
const DOCUMENT_EXTENSIONS = new Set([".pdf"]);

function normalizeKey(value) {
  return value.split("\\").join("/").replace(/^\/+/, "");
}

export function createAssetRegistrationPlan(plan) {
  if (plan.operation !== "add") {
    throw new Error("Asset registration planning is only valid for add operations.");
  }

  if (!["image", "document"].includes(plan.targetType)) {
    throw new Error(`Asset registration is unsupported for ${plan.targetType}.`);
  }

  const manifest = plan.manifest;
  const sourceFile = manifest.source?.file;
  const sourceKey = manifest.source?.key;

  if (!sourceFile || !sourceKey) {
    throw new Error("New managed assets require both source.file and source.key.");
  }

  const extension = path.extname(sourceFile).toLowerCase();
  const allowed = plan.targetType === "image" ? IMAGE_EXTENSIONS : DOCUMENT_EXTENSIONS;

  if (!allowed.has(extension)) {
    throw new Error(`Unsupported ${plan.targetType} source extension: ${extension || "(none)"}`);
  }

  const normalizedKey = normalizeKey(sourceKey);
  const keyExtension = path.extname(normalizedKey).toLowerCase();

  if (keyExtension !== extension) {
    throw new Error(`source.file extension ${extension} does not match source.key extension ${keyExtension || "(none)"}.`);
  }

  return Object.freeze({
    targetType: plan.targetType,
    recordId: plan.targetId,
    assetId: `${plan.targetType}-managed-${plan.targetId}`,
    sourceFile: path.resolve(sourceFile),
    sourceKey: normalizedKey,
    destinationFile: path.resolve("public", "assets", ...normalizedKey.split("/")),
    status: "active",
  });
}

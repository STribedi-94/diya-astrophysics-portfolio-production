import path from "node:path";

const IMAGE_EXTENSIONS = new Set([".jpg", ".jpeg", ".png", ".webp"]);
const DOCUMENT_EXTENSIONS = new Set([".pdf"]);

function requireSourceFile(operation) {
  const sourceFile = operation.source?.file;

  if (!sourceFile || typeof sourceFile !== "string") {
    throw new Error(`${operation.operation} ${operation.targetType} operation requires source.file.`);
  }

  return path.resolve(sourceFile);
}

export function buildAdapterPlan(plan, target) {
  const operation = plan.manifest;

  if (plan.targetType === "image") {
    if (["add", "replace"].includes(plan.operation)) {
      const sourceFile = requireSourceFile(operation);
      const extension = path.extname(sourceFile).toLowerCase();

      if (!IMAGE_EXTENSIONS.has(extension)) {
        throw new Error(`Unsupported image extension: ${extension || "(none)"}`);
      }

      return Object.freeze({
        adapter: "image",
        action: plan.operation,
        sourceFile,
        extension,
        targetAssetId: target.assetId,
        requiresPhysicalSource: true,
        requiresRegistryCompilation: true,
        requiresTypeScriptCheck: true,
      });
    }

    return Object.freeze({
      adapter: "image",
      action: plan.operation,
      sourceFile: null,
      targetAssetId: target.assetId,
      requiresPhysicalSource: false,
      requiresRegistryCompilation: true,
      requiresTypeScriptCheck: true,
    });
  }

  if (plan.targetType === "document") {
    if (["add", "replace"].includes(plan.operation)) {
      const sourceFile = requireSourceFile(operation);
      const extension = path.extname(sourceFile).toLowerCase();

      if (!DOCUMENT_EXTENSIONS.has(extension)) {
        throw new Error(`Unsupported document extension: ${extension || "(none)"}`);
      }

      return Object.freeze({
        adapter: "document",
        action: plan.operation,
        sourceFile,
        extension,
        targetAssetId: target.assetId,
        requiresPhysicalSource: true,
        requiresDerivativeGeneration: true,
        requiresRegistryCompilation: true,
        requiresTypeScriptCheck: true,
      });
    }

    return Object.freeze({
      adapter: "document",
      action: plan.operation,
      sourceFile: null,
      targetAssetId: target.assetId,
      requiresPhysicalSource: false,
      requiresDerivativeGeneration: false,
      requiresRegistryCompilation: true,
      requiresTypeScriptCheck: true,
    });
  }

  if (plan.targetType === "publication") {
    if (plan.operation === "replace") {
      throw new Error("Publication metadata cannot use replace. Use update-metadata.");
    }

    if (plan.operation === "update-metadata" && Object.keys(operation.changes ?? {}).length === 0) {
      throw new Error("Publication update-metadata requires at least one explicit change.");
    }

    return Object.freeze({
      adapter: "publication",
      action: plan.operation,
      sourceFile: null,
      targetAssetId: null,
      explicitChanges: Object.freeze({ ...(operation.changes ?? {}) }),
      requiresPhysicalSource: false,
      requiresRegistryCompilation: false,
      requiresTypeScriptCheck: true,
    });
  }

  throw new Error(`No adapter for target type: ${plan.targetType}`);
}

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
function imageMimeType(extension) {
  if (extension === ".png") return "image/png";
  if (extension === ".jpg" || extension === ".jpeg") return "image/jpeg";
  if (extension === ".webp") return "image/webp";

  throw new Error(
    `Unsupported managed image MIME extension: ${extension}`,
  );
}

export function createManagedImageAddRecord(registration, manifest = {}) {
  if (registration.targetType !== "image") {
    throw new Error(
      "Managed image record creation requires an image registration plan.",
    );
  }

  const extension =
    path.extname(registration.sourceKey).toLowerCase();

  return Object.freeze({
    id: registration.assetId,
    type: "image",
    category:
      manifest.changes?.category ??
      "managed-visual",
    status: "active",

    source: {
      key: registration.sourceKey,
      fileName:
        path.basename(registration.sourceKey),
      mimeType:
        imageMimeType(extension),
    },

    derivatives: {},

    website: {
      recordId: registration.recordId,
    },

    metadata: {
      ...(manifest.changes?.metadata ?? {}),
    },

    processing: {
      processor: "image",
      profile: "managed-original",
    },

    cloud: {},

    relationships: {
      ...(manifest.changes?.relationships ?? {}),
    },
  });
}
export function createManagedDocumentAddRecord(registration, manifest = {}) {
  const targetId =
    manifest.targetId ??
    manifest.target?.id ??
    manifest.recordId ??
    registration.targetId;

  if (!targetId) {
    throw new Error(
      "Managed document ADD requires a targetId.",
    );
  }

  const normalizedId =
    String(targetId)
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");

  if (!normalizedId) {
    throw new Error(
      "Managed document ADD targetId is invalid.",
    );
  }

  const sourceKey =
    manifest.sourceKey ??
    manifest.r2Key ??
    manifest.source?.key ??
    registration.objectKey;

  if (!sourceKey) {
    throw new Error(
      "Managed document ADD requires a source/R2 key.",
    );
  }

  const fileName =
    manifest.fileName ??
    manifest.source?.fileName ??
    path.basename(registration.destinationFile);

  const thumbnailKey =
    manifest.thumbnailKey ??
    manifest.derivatives?.thumbnail?.key ??
    sourceKey
      .replace(/^documents\//, "thumbnails/")
      .replace(/\.pdf$/i, ".webp");

  const previewKey =
    manifest.previewKey ??
    manifest.derivatives?.preview?.key ??
    sourceKey
      .replace(/^documents\//, "previews/")
      .replace(/\.pdf$/i, ".jpg");

  return {
    id: `document-managed-${normalizedId}`,
    type: "document",
    category: "managed-document",
    status: "active",

    source: {
      key: sourceKey,
      fileName,
      mimeType: "application/pdf",
    },

    derivatives: {
      thumbnail: {
        key: thumbnailKey,
      },
      preview: {
        key: previewKey,
      },
    },

    website: {
      recordId:
        manifest.website?.recordId ??
        normalizedId,

      access:
        manifest.website?.access ??
        "preview-download",

      downloadName:
        manifest.website?.downloadName ??
        fileName,
    },

    metadata: {
      groupId:
        manifest.metadata?.groupId ??
        "manager-added",

      recordKind:
        manifest.metadata?.recordKind ??
        "managed-document",

      authorship:
        manifest.metadata?.authorship ??
        null,
    },

    processing: {
      processor: "document",
      sourceBaseName:
        path.basename(fileName, path.extname(fileName)),
    },

    cloud: {},

    relationships: {
      publicationId:
        manifest.relationships?.publicationId ??
        null,
    },
  };
}

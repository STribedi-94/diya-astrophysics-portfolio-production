export const ASSET_KNOWLEDGE_BASE = [
  {
    id: "wolf359-first-author-paper",
    type: "document",
    category: "first-author-paper",

    canonicalFilename:
      "Magnetic Activities of Wolf 359 Starspot Distribution and Quasiperiodic Pulsation Using TESS Data.pdf",

    aliases: [
      "wolf359-2025.pdf",
      "Magnetic Activities of Wolf 359 Starspot Distribution and Quasiperiodic Pulsation Using TESS Data.pdf",
    ],

    localPublicUrl:
      "/assets/documents/first-author/Magnetic Activities of Wolf 359 Starspot Distribution and Quasiperiodic Pulsation Using TESS Data.pdf",

    cloudflareR2Key:
      "documents/first-author/Magnetic Activities of Wolf 359 Starspot Distribution and Quasiperiodic Pulsation Using TESS Data.pdf",

    migrationStatus: "local-ready",
    notes: "Exceptional mapping from shortened Lovable filename.",
  },

  {
    id: "gj398-first-author-paper",
    type: "document",
    category: "first-author-paper",

    canonicalFilename:
      "Probing the Magnetic Activity of GJ 398 through TESS Flare Detection and uGMRT Radio Observations.pdf",

    aliases: [
      "gj398-2026.pdf",
      "Probing the Magnetic Activity of GJ 398 through TESS Flare Detection and uGMRT Radio Observations.pdf",
    ],

    localPublicUrl:
      "/assets/documents/first-author/Probing the Magnetic Activity of GJ 398 through TESS Flare Detection and uGMRT Radio Observations.pdf",

    cloudflareR2Key:
      "documents/first-author/Probing the Magnetic Activity of GJ 398 through TESS Flare Detection and uGMRT Radio Observations.pdf",

    migrationStatus: "local-ready",
    notes: "Exceptional mapping from shortened Lovable filename.",
  },

  {
    id: "diya-ram-primary-portrait",
    type: "image",
    category: "portrait",

    canonicalFilename: "potrait-original-image.jpeg",

    aliases: [
      "diya-ram-portrait.png",
      "potrait-original-image.jpeg",
    ],

    localPublicUrl:
      "/assets/images/portrait/original/potrait-original-image.jpeg",

    cloudflareR2Key:
      "images/portrait/original/potrait-original-image.jpeg",

    migrationStatus: "local-ready",
    notes:
      "Preserves the current physical filename, including its original spelling.",
  },
];

export function normalizeKnowledgeBaseFilename(filename) {
  return filename
    .toLowerCase()
    .replace(/\.pdf\.pdf$/i, ".pdf")
    .replace(/\.jpg\.jpg$/i, ".jpg")
    .replace(/\.jpeg\.jpeg$/i, ".jpeg")
    .replace(/\.png\.png$/i, ".png")
    .replace(/\.txt\.txt$/i, ".txt")
    .replace(/[^a-z0-9.]+/g, "");
}

export function findKnowledgeBaseAsset(filename) {
  const normalizedFilename = normalizeKnowledgeBaseFilename(filename);

  const matches = ASSET_KNOWLEDGE_BASE.filter((asset) =>
    asset.aliases.some(
      (alias) =>
        normalizeKnowledgeBaseFilename(alias) === normalizedFilename
    )
  );

  if (matches.length === 1) {
    return {
      status: "resolved",
      asset: matches[0],
      matches,
    };
  }

  if (matches.length > 1) {
    return {
      status: "ambiguous",
      asset: null,
      matches,
    };
  }

  return {
    status: "unresolved",
    asset: null,
    matches: [],
  };
}

export function validateAssetKnowledgeBase() {
  const errors = [];
  const ids = new Set();
  const normalizedAliases = new Map();

  for (const asset of ASSET_KNOWLEDGE_BASE) {
    if (!asset.id) {
      errors.push("Knowledge-base entry is missing an id.");
    } else if (ids.has(asset.id)) {
      errors.push(`Duplicate knowledge-base id: ${asset.id}`);
    } else {
      ids.add(asset.id);
    }

    if (!Array.isArray(asset.aliases) || asset.aliases.length === 0) {
      errors.push(`Asset ${asset.id ?? "(unknown)"} has no aliases.`);
      continue;
    }

    for (const alias of asset.aliases) {
      const normalizedAlias = normalizeKnowledgeBaseFilename(alias);
      const existingAssetId = normalizedAliases.get(normalizedAlias);

      if (existingAssetId && existingAssetId !== asset.id) {
        errors.push(
          `Alias "${alias}" is shared by ${existingAssetId} and ${asset.id}.`
        );
      } else {
        normalizedAliases.set(normalizedAlias, asset.id);
      }
    }
  }

  return {
    valid: errors.length === 0,
    entries: ASSET_KNOWLEDGE_BASE.length,
    errors,
  };
}
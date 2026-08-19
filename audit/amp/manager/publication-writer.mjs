import { readFile, writeFile } from "node:fs/promises";

function escapeString(value) {
  return JSON.stringify(String(value));
}

function fieldPattern(field) {
  return new RegExp(`^(\\s*)${field}:\\s*.*,$`, "m");
}

export async function updatePublicationMetadata(record, changes) {
  if (!record?.filePath || !record?.block) {
    throw new Error("Publication mutation requires a discovered publication record.");
  }

  const allowedFields = new Set(["status", "doi", "journal", "volume", "pages", "year"]);
  const requestedFields = Object.keys(changes ?? {});

  if (requestedFields.length === 0) {
    throw new Error("No publication metadata changes were requested.");
  }

  for (const field of requestedFields) {
    if (!allowedFields.has(field)) {
      throw new Error(`Publication field is not manager-writable: ${field}`);
    }
  }

  let updatedBlock = record.block;

  for (const field of requestedFields) {
    const pattern = fieldPattern(field);
    const matches = updatedBlock.match(new RegExp(pattern.source, "gm")) ?? [];

    if (matches.length !== 1) {
      throw new Error(`Expected exactly one ${field} field in publication ${record.publicationId}; found ${matches.length}.`);
    }

    const value = changes[field];
    const serialized = typeof value === "number" ? String(value) : escapeString(value);
    updatedBlock = updatedBlock.replace(pattern, `$1${field}: ${serialized},`);
  }

  const fullSource = (await readFile(record.filePath, "utf8")).replace(/^\\uFEFF/, "");
  const occurrences = fullSource.split(record.block).length - 1;

  if (occurrences !== 1) {
    throw new Error(`Publication source block identity is no longer unique for ${record.publicationId}.`);
  }

  const updatedSource = fullSource.replace(record.block, updatedBlock);
  await writeFile(record.filePath, updatedSource, "utf8");

  return Object.freeze({
    filePath: record.filePath,
    publicationId: record.publicationId,
    changedFields: Object.freeze([...requestedFields]),
  });
}

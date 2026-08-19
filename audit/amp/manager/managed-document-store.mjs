import {
  readFile,
  writeFile,
} from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const moduleDirectory =
  path.dirname(fileURLToPath(import.meta.url));

const storePath =
  path.resolve(
    moduleDirectory,
    "..",
    "documents",
    "manager-added-records.json",
  );

async function readRecords() {
  const source =
    await readFile(storePath, "utf8");

  const parsed =
    JSON.parse(source.replace(/^\uFEFF/, ""));

  if (!Array.isArray(parsed)) {
    throw new TypeError(
      "Managed document store must contain a JSON array.",
    );
  }

  return parsed;
}

async function writeRecords(records) {
  await writeFile(
    storePath,
    `${JSON.stringify(records, null, 2)}\n`,
    "utf8",
  );
}

function validateRecord(record) {
  if (
    !record ||
    typeof record !== "object" ||
    Array.isArray(record)
  ) {
    throw new TypeError(
      "Managed document record must be an object.",
    );
  }

  if (
    !record.id ||
    !record.website?.recordId ||
    !record.source?.key
  ) {
    throw new Error(
      "New managed document requires id, website.recordId and source.key.",
    );
  }
}

export async function addManagedDocumentRecord(
  record,
) {
  validateRecord(record);

  const records = await readRecords();

  if (
    records.some(
      (item) => item.id === record.id,
    )
  ) {
    throw new Error(
      `Duplicate managed document id: ${record.id}`,
    );
  }

  if (
    records.some(
      (item) =>
        item.website?.recordId ===
        record.website.recordId,
    )
  ) {
    throw new Error(
      `Duplicate managed document website recordId: ${record.website.recordId}`,
    );
  }

  if (
    records.some(
      (item) =>
        item.source?.key === record.source.key,
    )
  ) {
    throw new Error(
      `Duplicate managed document source key: ${record.source.key}`,
    );
  }

  const publicationId =
    record.relationships?.publicationId ?? null;

  if (
    publicationId &&
    records.some(
      (item) =>
        item.relationships?.publicationId ===
        publicationId,
    )
  ) {
    throw new Error(
      `Duplicate managed document publicationId: ${publicationId}`,
    );
  }

  records.push(record);
  await writeRecords(records);

  return Object.freeze({
    added: true,
    record,
  });
}

export async function removeManagedDocumentRecord(
  recordId,
) {
  const records = await readRecords();

  const nextRecords =
    records.filter(
      (record) => record.id !== recordId,
    );

  if (nextRecords.length === records.length) {
    return Object.freeze({
      removed: false,
      recordId,
    });
  }

  await writeRecords(nextRecords);

  return Object.freeze({
    removed: true,
    recordId,
  });
}

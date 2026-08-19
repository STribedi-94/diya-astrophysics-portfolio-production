import { mkdir, readFile, rename, rm, writeFile } from "node:fs/promises";
import path from "node:path";
import { isAssetRecord } from "../contracts/asset-record.mjs";

const DEFAULT_STORE = path.resolve(
  "audit/amp/images/manager-added-records.json",
);

async function readStore(storeFile) {
  const source = await readFile(storeFile, "utf8");
  const records = JSON.parse(source);

  if (!Array.isArray(records)) {
    throw new TypeError(
      "Manager-added image store must contain an array.",
    );
  }

  return records;
}

async function writeStoreAtomic(storeFile, records) {
  await mkdir(path.dirname(storeFile), { recursive: true });

  const tempFile =
    `${storeFile}.tmp-${process.pid}-${Date.now()}`;

  try {
    await writeFile(
      tempFile,
      `${JSON.stringify(records, null, 2)}\n`,
      "utf8",
    );

    await rename(tempFile, storeFile);
  } finally {
    await rm(tempFile, { force: true });
  }
}

function validateNewRecord(record) {
  if (!isAssetRecord(record)) {
    throw new TypeError(
      "New managed image does not satisfy the AMP asset contract.",
    );
  }

  if (record.type !== "image") {
    throw new TypeError(
      "New managed image record must use type image.",
    );
  }

  if (!record.id || !record.website?.recordId || !record.source?.key) {
    throw new Error(
      "New managed image requires id, website.recordId and source.key.",
    );
  }
}

export async function addManagedImageRecord(
  record,
  { storeFile = DEFAULT_STORE } = {},
) {
  validateNewRecord(record);

  const records = await readStore(storeFile);

  if (records.some((item) => item.id === record.id)) {
    throw new Error(`Duplicate managed image Asset ID: ${record.id}`);
  }

  if (records.some((item) => item.website?.recordId === record.website.recordId)) {
    throw new Error(
      `Duplicate managed image website recordId: ${record.website.recordId}`,
    );
  }

  if (records.some((item) => item.source?.key === record.source.key)) {
    throw new Error(
      `Duplicate managed image source key: ${record.source.key}`,
    );
  }

  const updated = [...records, record];
  await writeStoreAtomic(storeFile, updated);

  return Object.freeze({
    added: true,
    record,
    count: updated.length,
    storeFile,
  });
}

export async function removeManagedImageRecord(
  assetId,
  { storeFile = DEFAULT_STORE } = {},
) {
  const records = await readStore(storeFile);
  const updated = records.filter((item) => item.id !== assetId);

  if (updated.length === records.length) {
    return Object.freeze({
      removed: false,
      assetId,
      count: records.length,
      storeFile,
    });
  }

  await writeStoreAtomic(storeFile, updated);

  return Object.freeze({
    removed: true,
    assetId,
    count: updated.length,
    storeFile,
  });
}

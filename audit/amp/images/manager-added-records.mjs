import { readFileSync } from "node:fs";
import path from "node:path";
import { isAssetRecord } from "../contracts/asset-record.mjs";

const STORE_FILE = path.resolve(
  "audit/amp/images/manager-added-records.json",
);

function loadManagerAddedImageRecords() {
  const source = readFileSync(STORE_FILE, "utf8");
  const records = JSON.parse(source);

  if (!Array.isArray(records)) {
    throw new TypeError(
      "Manager-added image store must contain an array.",
    );
  }

  for (const record of records) {
    if (!isAssetRecord(record)) {
      throw new TypeError(
        `Invalid manager-added image record: ${record?.id ?? "unknown"}`,
      );
    }
  }

  return records;
}

export const managerAddedImageRecords =
  Object.freeze(loadManagerAddedImageRecords());

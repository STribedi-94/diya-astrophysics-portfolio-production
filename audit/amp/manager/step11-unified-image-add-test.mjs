import {
  mkdtemp,
  readFile,
  rm,
  stat,
  writeFile,
} from "node:fs/promises";

import { createHash } from "node:crypto";
import os from "node:os";
import path from "node:path";

import {
  createAssetRecord,
} from "../contracts/asset-record.mjs";

import {
  addManagedImageRecord,
  removeManagedImageRecord,
} from "./managed-image-store.mjs";

import {
  executeManagedImageAddWithR2Transaction,
} from "./orchestrator.mjs";

import {
  cleanupR2Snapshot,
  createR2Snapshot,
  deleteR2Object,
} from "./r2-sync.mjs";

const SUCCESS_KEY =
  "__qa/universal-manager-step11f-unified-add-success.png";

const ROLLBACK_KEY =
  "__qa/universal-manager-step11f-unified-add-rollback.png";

function sha256(bytes) {
  return createHash("sha256")
    .update(bytes)
    .digest("hex")
    .toUpperCase();
}

async function exists(file) {
  try {
    await stat(file);
    return true;
  } catch (error) {
    if (error?.code === "ENOENT") return false;
    throw error;
  }
}

function recordFor(key, id) {
  return Object.assign(
    createAssetRecord(),
    {
      id: `image-managed-${id}`,
      type: "image",
      category: "managed-visual",
      status: "active",
      source: {
        key,
        fileName: path.basename(key),
        mimeType: "image/png",
      },
      derivatives: {},
      website: { recordId: id },
      metadata: { role: "qa" },
      processing: {
        processor: "image",
        profile: "managed-original",
      },
      cloud: {},
      relationships: {},
    },
  );
}

async function verifyRemote(key, expectedHash) {
  const snapshot = await createR2Snapshot({ objectKey: key });
  try {
    if (snapshot.sha256 !== expectedHash) {
      throw new Error(`Remote SHA mismatch for ${key}`);
    }
  } finally {
    await cleanupR2Snapshot(snapshot);
  }
}

async function main() {
  const root = await mkdtemp(
    path.join(os.tmpdir(), "diya-step11f-"),
  );

  const sourceFile = path.join(root, "source.png");
  const storeFile = path.join(root, "manager-added-records.json");
  const successDestination = path.join(root, "success.png");
  const rollbackDestination = path.join(root, "rollback.png");

  const bytes = Buffer.from(
    "89504e470d0a1a0a0000000d49484452000000010000000108060000001f15c489",
    "hex",
  );

  await writeFile(sourceFile, bytes);
  await writeFile(storeFile, "[]\n", "utf8");

  const expectedHash = sha256(bytes);

  const registerRecord = (record) =>
    addManagedImageRecord(record, { storeFile });

  const removeRecord = (assetId) =>
    removeManagedImageRecord(assetId, { storeFile });

  const successRecord = recordFor(
    SUCCESS_KEY,
    "step11f-success",
  );

  const success =
    await executeManagedImageAddWithR2Transaction({
      operationId: "step11f-success",
      sourceFile,
      destinationFile: successDestination,
      record: successRecord,
      registerRecord,
      removeRecord,
      validateLocal: async () => {
        if (!(await exists(successDestination))) {
          throw new Error("Local success destination missing.");
        }
      },
      r2: { objectKey: SUCCESS_KEY },
    });

  if (!success.committed || success.rolledBack) {
    throw new Error("Unified successful ADD did not commit.");
  }

  await verifyRemote(SUCCESS_KEY, expectedHash);

  const successRecords = JSON.parse(
    await readFile(storeFile, "utf8"),
  );

  if (
    successRecords.length !== 1 ||
    successRecords[0].id !== successRecord.id
  ) {
    throw new Error("Successful authoritative record missing.");
  }

  console.log("Unified image ADD successful commit: PASS");
  console.log("Unified R2 SHA verification: PASS");

  await deleteR2Object({ objectKey: SUCCESS_KEY });
  await removeManagedImageRecord(successRecord.id, { storeFile });
  await rm(successDestination, { force: true });

  const rollbackRecord = recordFor(
    ROLLBACK_KEY,
    "step11f-rollback",
  );

  let rollbackObserved = false;

  try {
    await executeManagedImageAddWithR2Transaction({
      operationId: "step11f-rollback",
      sourceFile,
      destinationFile: rollbackDestination,
      record: rollbackRecord,
      registerRecord,
      removeRecord,
      validateLocal: async () => {
        if (!(await exists(rollbackDestination))) {
          throw new Error("Rollback destination missing before R2 phase.");
        }
      },
      r2: {
        objectKey: ROLLBACK_KEY,
        validate: async () => {
          throw new Error(
            "INTENTIONAL STEP 11F REMOTE POST-WRITE FAILURE",
          );
        },
      },
    });
  } catch (error) {
    rollbackObserved =
      error?.rolledBack === true &&
      error?.rollbackFailed === false;

    if (!rollbackObserved) {
      throw error;
    }
  }

  if (!rollbackObserved) {
    throw new Error("Unified rollback was not observed.");
  }

  if (await exists(rollbackDestination)) {
    throw new Error("Unified rollback left local file behind.");
  }

  const rollbackRecords = JSON.parse(
    await readFile(storeFile, "utf8"),
  );

  if (rollbackRecords.length !== 0) {
    throw new Error("Unified rollback left record behind.");
  }

  let remoteStillExists = true;

  try {
    const snapshot = await createR2Snapshot({
      objectKey: ROLLBACK_KEY,
    });
    await cleanupR2Snapshot(snapshot);
  } catch {
    remoteStillExists = false;
  }

  if (remoteStillExists) {
    throw new Error("Unified rollback left R2 object behind.");
  }

  console.log("Intentional unified ADD failure observed: PASS");
  console.log("Local new-file rollback: PASS");
  console.log("Authoritative-record rollback: PASS");
  console.log("New R2 object rollback deletion: PASS");

  await rm(root, { recursive: true, force: true });

  console.log("Disposable QA cleanup: PASS");
}

main().catch((error) => {
  console.error(
    error instanceof Error ? error.stack : String(error),
  );
  process.exitCode = 1;
});

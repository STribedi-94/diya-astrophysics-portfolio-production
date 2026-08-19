import {
  mkdtemp,
  readFile,
  rm,
  stat,
  writeFile,
} from "node:fs/promises";
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
  executeManagedImageAddTransaction,
} from "./orchestrator.mjs";

async function exists(file) {
  try {
    await stat(file);
    return true;
  } catch (error) {
    if (error?.code === "ENOENT") return false;
    throw error;
  }
}

function createQaRecord() {
  return Object.assign(
    createAssetRecord(),
    {
      id: "image-managed-step11d-qa",
      type: "image",
      category: "managed-visual",
      status: "active",
      source: {
        key: "images/__qa/step11d-add.png",
        fileName: "step11d-add.png",
        mimeType: "image/png",
      },
      derivatives: {},
      website: {
        recordId: "step11d-qa",
      },
      metadata: {
        role: "qa",
      },
      processing: {
        processor: "image",
        profile: "managed-original",
      },
      cloud: {},
      relationships: {},
    },
  );
}

async function main() {
  const root = await mkdtemp(
    path.join(
      os.tmpdir(),
      "diya-step11d-",
    ),
  );

  const sourceFile =
    path.join(root, "source.png");

  const destinationFile =
    path.join(
      root,
      "public",
      "assets",
      "images",
      "__qa",
      "step11d-add.png",
    );

  const storeFile =
    path.join(
      root,
      "manager-added-records.json",
    );

  await writeFile(
    sourceFile,
    Buffer.from(
      "89504e470d0a1a0a0000000d49484452",
      "hex",
    ),
  );

  await writeFile(
    storeFile,
    "[]\n",
    "utf8",
  );

  const record = createQaRecord();

  const callbacks = {
    registerRecord: (item) =>
      addManagedImageRecord(
        item,
        { storeFile },
      ),

    removeRecord: (assetId) =>
      removeManagedImageRecord(
        assetId,
        { storeFile },
      ),
  };

  const committed =
    await executeManagedImageAddTransaction({
      operationId: "step11d-commit",
      sourceFile,
      destinationFile,
      record,
      ...callbacks,
      validateLocal: async () => {
        if (!(await exists(destinationFile))) {
          throw new Error(
            "QA destination was not created.",
          );
        }

        const records =
          JSON.parse(
            await readFile(
              storeFile,
              "utf8",
            ),
          );

        if (
          records.length !== 1 ||
          records[0].id !== record.id
        ) {
          throw new Error(
            "QA authoritative registration missing.",
          );
        }
      },
    });

  if (!committed.committed) {
    throw new Error(
      "Successful ADD did not commit.",
    );
  }

  console.log(
    "Local ADD successful commit: PASS",
  );

  await removeManagedImageRecord(
    record.id,
    { storeFile },
  );

  await rm(
    destinationFile,
    { force: true },
  );

  let failureObserved = false;

  try {
    await executeManagedImageAddTransaction({
      operationId: "step11d-rollback",
      sourceFile,
      destinationFile,
      record,
      ...callbacks,
      validateLocal: async () => {
        throw new Error(
          "Intentional Step 11D validation failure.",
        );
      },
    });
  } catch (error) {
    if (error?.rolledBack === true) {
      failureObserved = true;
    } else {
      throw error;
    }
  }

  if (!failureObserved) {
    throw new Error(
      "Intentional ADD failure was not observed.",
    );
  }

  if (await exists(destinationFile)) {
    throw new Error(
      "ADD rollback left destination file behind.",
    );
  }

  const finalRecords =
    JSON.parse(
      await readFile(
        storeFile,
        "utf8",
      ),
    );

  if (finalRecords.length !== 0) {
    throw new Error(
      "ADD rollback left authoritative record behind.",
    );
  }

  console.log(
    "Intentional ADD failure observed: PASS",
  );

  console.log(
    "Destination rollback: PASS",
  );

  console.log(
    "Authoritative record rollback: PASS",
  );

  await rm(
    root,
    {
      recursive: true,
      force: true,
    },
  );

  console.log(
    "Disposable QA cleanup: PASS",
  );
}

main().catch((error) => {
  console.error(
    error instanceof Error
      ? error.stack
      : String(error),
  );

  process.exitCode = 1;
});
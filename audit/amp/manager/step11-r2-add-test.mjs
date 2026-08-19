import {
  mkdtemp,
  rm,
  writeFile,
} from "node:fs/promises";

import {
  createHash,
} from "node:crypto";

import os from "node:os";
import path from "node:path";

import {
  cleanupR2Snapshot,
  createR2Snapshot,
  deleteR2Object,
  executeR2AddWithRollback,
} from "./r2-sync.mjs";

const SUCCESS_KEY =
  "__qa/universal-manager-step11e-add-success.txt";

const ROLLBACK_KEY =
  "__qa/universal-manager-step11e-add-rollback.txt";

function sha256(bytes) {
  return createHash("sha256")
    .update(bytes)
    .digest("hex")
    .toUpperCase();
}

async function verifyRemote(objectKey, expectedHash) {
  const snapshot =
    await createR2Snapshot({
      objectKey,
    });

  try {
    if (snapshot.sha256 !== expectedHash) {
      throw new Error(
        `Remote SHA mismatch for ${objectKey}`,
      );
    }
  } finally {
    await cleanupR2Snapshot(snapshot);
  }
}

async function main() {
  const tempRoot =
    await mkdtemp(
      path.join(
        os.tmpdir(),
        "diya-step11e-",
      ),
    );

  const localFile =
    path.join(
      tempRoot,
      "qa.txt",
    );

  const bytes =
    Buffer.from(
      "DIYA-STEP11E-NEW-R2-OBJECT",
      "utf8",
    );

  await writeFile(
    localFile,
    bytes,
  );

  const expectedHash =
    sha256(bytes);

  console.log("");
  console.log("Diya Universal Manager - Step 11E");
  console.log("=================================");
  console.log(`Expected SHA: ${expectedHash}`);

  let successCreated = false;

  try {
    const success =
      await executeR2AddWithRollback({
        localFile,
        objectKey: SUCCESS_KEY,
      });

    if (
      !success.committed ||
      success.rolledBack ||
      !success.verified
    ) {
      throw new Error(
        "Successful R2 ADD did not commit cleanly.",
      );
    }

    successCreated = true;

    await verifyRemote(
      SUCCESS_KEY,
      expectedHash,
    );

    console.log(
      "New R2 object successful ADD: PASS",
    );
    console.log(
      "New R2 object SHA verification: PASS",
    );
  } finally {
    if (successCreated) {
      await deleteR2Object({
        objectKey: SUCCESS_KEY,
      });

      console.log(
        "Successful QA object cleanup: PASS",
      );
    }
  }

  let rollbackObserved = false;

  try {
    await executeR2AddWithRollback({
      localFile,
      objectKey: ROLLBACK_KEY,
      validate: async () => {
        throw new Error(
          "INTENTIONAL STEP 11E POST-WRITE FAILURE",
        );
      },
    });
  } catch (error) {
    rollbackObserved =
      error?.rolledBack === true &&
      error?.rollbackFailed === false &&
      error?.deletedOnRollback === true;

    if (!rollbackObserved) {
      throw error;
    }
  }

  if (!rollbackObserved) {
    throw new Error(
      "R2 ADD rollback was not observed.",
    );
  }

  console.log(
    "Intentional R2 ADD failure observed: PASS",
  );
  console.log(
    "Automatic new-object R2 deletion: PASS",
  );

  await rm(
    tempRoot,
    {
      recursive: true,
      force: true,
    },
  );

  console.log(
    "Local QA cleanup: PASS",
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
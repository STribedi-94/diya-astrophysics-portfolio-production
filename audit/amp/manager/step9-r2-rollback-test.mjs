import {
  mkdtemp,
  readFile,
  rm,
  writeFile,
} from "node:fs/promises";

import { createHash } from "node:crypto";
import os from "node:os";
import path from "node:path";

import {
  cleanupR2Snapshot,
  createR2Snapshot,
  deleteR2Object,
  executeR2ReplacementWithRollback,
  syncAndVerifyR2Object,
} from "./r2-sync.mjs";

const QA_KEY =
  "__qa/universal-manager-step9d-rollback-test.txt";

const CONTENT_TYPE =
  "text/plain; charset=utf-8";

function sha256(bytes) {
  return createHash("sha256")
    .update(bytes)
    .digest("hex")
    .toUpperCase();
}

async function main() {
  console.log("");
  console.log("Diya Universal Manager - Step 9D");
  console.log("================================");
  console.log("Mode: DISPOSABLE QA REMOTE ROLLBACK TEST");
  console.log(`QA key: ${QA_KEY}`);

  const tempRoot = await mkdtemp(
    path.join(
      os.tmpdir(),
      "diya-step9d-",
    ),
  );

  const originalFile = path.join(
    tempRoot,
    "original.txt",
  );

  const replacementFile = path.join(
    tempRoot,
    "replacement.txt",
  );

  const originalBytes = Buffer.from(
    "DIYA-STEP9D-ORIGINAL-CONTENT",
    "utf8",
  );

  const replacementBytes = Buffer.from(
    "DIYA-STEP9D-REPLACEMENT-CONTENT",
    "utf8",
  );

  await writeFile(
    originalFile,
    originalBytes,
  );

  await writeFile(
    replacementFile,
    replacementBytes,
  );

  const originalHash =
    sha256(originalBytes);

  const replacementHash =
    sha256(replacementBytes);

  console.log(`Original SHA   : ${originalHash}`);
  console.log(`Replacement SHA: ${replacementHash}`);

  if (originalHash === replacementHash) {
    throw new Error(
      "QA original and replacement hashes unexpectedly match.",
    );
  }

  let qaObjectCreated = false;

  try {
    console.log("");
    console.log("Seeding disposable QA object...");

    const seed = await syncAndVerifyR2Object({
      localFile: originalFile,
      objectKey: QA_KEY,
    });

    if (!seed.verified) {
      throw new Error(
        "QA seed object was not verified.",
      );
    }

    qaObjectCreated = true;

    console.log("QA seed PUT + GET verification: PASS");

    const before = await createR2Snapshot({
      objectKey: QA_KEY,
    });

    try {
      if (before.sha256 !== originalHash) {
        throw new Error(
          "QA pre-transaction remote hash mismatch.",
        );
      }

      console.log("QA original remote snapshot: PASS");
    } finally {
      await cleanupR2Snapshot(before);
    }

    let rollbackObserved = false;

    try {
      await executeR2ReplacementWithRollback({
        localFile: replacementFile,
        objectKey: QA_KEY,
        contentType: CONTENT_TYPE,
        validate: async () => {
          throw new Error(
            "INTENTIONAL STEP 9D POST-WRITE FAILURE",
          );
        },
      });
    } catch (error) {
      rollbackObserved =
        error?.rolledBack === true &&
        error?.rollbackFailed === false;

      if (!rollbackObserved) {
        throw error;
      }

      console.log("");
      console.log("Intentional failure observed: PASS");
      console.log("Automatic rollback signal: PASS");
    }

    if (!rollbackObserved) {
      throw new Error(
        "Automatic rollback was not observed.",
      );
    }

    const after = await createR2Snapshot({
      objectKey: QA_KEY,
    });

    try {
      console.log(`Restored SHA   : ${after.sha256}`);

      if (after.sha256 !== originalHash) {
        throw new Error(
          "Automatic rollback did not restore original remote bytes.",
        );
      }

      const restoredBytes =
        await readFile(after.snapshotFile);

      if (
        Buffer.compare(
          restoredBytes,
          originalBytes,
        ) !== 0
      ) {
        throw new Error(
          "Restored remote bytes differ from the original QA object.",
        );
      }

      console.log("Restored SHA identity: PASS");
      console.log("Restored byte identity: PASS");
      console.log("AUTOMATIC REMOTE ROLLBACK: PASS");
    } finally {
      await cleanupR2Snapshot(after);
    }
  } finally {
    if (qaObjectCreated) {
      console.log("");
      console.log("Deleting disposable QA object...");

      await deleteR2Object({
        objectKey: QA_KEY,
      });

      console.log("QA object delete: PASS");
    }

    await rm(
      tempRoot,
      {
        recursive: true,
        force: true,
      },
    );

    console.log("Local QA cleanup: PASS");
  }

  console.log("");
  console.log("Production thesis object touched: NO");
  console.log("STEP 9D: PASS");
}

main().catch((error) => {
  console.error("");
  console.error("STEP 9D FAILED");

  console.error(
    error instanceof Error
      ? error.stack
      : String(error),
  );

  process.exitCode = 1;
});
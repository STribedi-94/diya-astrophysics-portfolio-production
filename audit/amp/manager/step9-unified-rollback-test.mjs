import {
  mkdtemp,
  readFile,
  rm,
  writeFile,
} from "node:fs/promises";

import {
  createHash,
} from "node:crypto";

import os from "node:os";
import path from "node:path";

import {
  executeManagedReplacementTransaction,
} from "./orchestrator.mjs";

import {
  cleanupR2Snapshot,
  createR2Snapshot,
  deleteR2Object,
  syncAndVerifyR2Object,
} from "./r2-sync.mjs";

const QA_KEY =
  "__qa/universal-manager-step9e-unified-rollback.txt";

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
  console.log("Diya Universal Manager - Step 9E");
  console.log("================================");
  console.log(
    "Mode: UNIFIED LOCAL + REMOTE ROLLBACK TEST",
  );
  console.log(`QA key: ${QA_KEY}`);

  const tempRoot = await mkdtemp(
    path.join(
      os.tmpdir(),
      "diya-step9e-",
    ),
  );

  const destinationFile = path.join(
    tempRoot,
    "managed-local.txt",
  );

  const replacementFile = path.join(
    tempRoot,
    "replacement.txt",
  );

  const originalBytes = Buffer.from(
    "DIYA-STEP9E-ORIGINAL-CONTENT",
    "utf8",
  );

  const replacementBytes = Buffer.from(
    "DIYA-STEP9E-REPLACEMENT-CONTENT",
    "utf8",
  );

  await writeFile(
    destinationFile,
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
    console.log(
      "Seeding disposable remote QA object...",
    );

    const seed =
      await syncAndVerifyR2Object({
        localFile: destinationFile,
        objectKey: QA_KEY,
      });

    if (!seed.verified) {
      throw new Error(
        "Remote QA seed was not verified.",
      );
    }

    qaObjectCreated = true;

    console.log(
      "Remote QA seed verification: PASS",
    );

    let rollbackObserved = false;

    try {
      await executeManagedReplacementTransaction({
        operationId:
          "step9e-unified-rollback",
        sourceFile: replacementFile,
        destinationFile,
        validateLocal: async () => {
          const localBytes =
            await readFile(destinationFile);

          if (
            sha256(localBytes) !==
            replacementHash
          ) {
            throw new Error(
              "Local replacement validation failed.",
            );
          }

          console.log(
            "Local replacement before remote phase: PASS",
          );
        },
        r2: {
          objectKey: QA_KEY,
          contentType: CONTENT_TYPE,
          validate: async () => {
            throw new Error(
              "INTENTIONAL STEP 9E REMOTE POST-WRITE FAILURE",
            );
          },
        },
      });
    } catch (error) {
      rollbackObserved =
        error?.rolledBack === true &&
        error?.localRolledBack === true &&
        error?.localRollbackFailed === false &&
        error?.remoteRolledBack === true &&
        error?.remoteRollbackFailed !== true;

      if (!rollbackObserved) {
        throw error;
      }

      console.log("");
      console.log(
        "Intentional unified failure observed: PASS",
      );

      console.log(
        "Local rollback signal: PASS",
      );

      console.log(
        "Remote rollback signal: PASS",
      );
    }

    if (!rollbackObserved) {
      throw new Error(
        "Unified rollback was not observed.",
      );
    }

    const localAfter =
      await readFile(destinationFile);

    const localAfterHash =
      sha256(localAfter);

    console.log(
      `Local restored SHA : ${localAfterHash}`,
    );

    if (localAfterHash !== originalHash) {
      throw new Error(
        "Local rollback did not restore original bytes.",
      );
    }

    if (
      Buffer.compare(
        localAfter,
        originalBytes,
      ) !== 0
    ) {
      throw new Error(
        "Local restored bytes differ from original.",
      );
    }

    console.log(
      "Local restored byte identity: PASS",
    );

    const remoteAfter =
      await createR2Snapshot({
        objectKey: QA_KEY,
      });

    try {
      console.log(
        `Remote restored SHA: ${remoteAfter.sha256}`,
      );

      if (
        remoteAfter.sha256 !== originalHash
      ) {
        throw new Error(
          "Remote rollback did not restore original SHA.",
        );
      }

      const remoteBytes =
        await readFile(
          remoteAfter.snapshotFile,
        );

      if (
        Buffer.compare(
          remoteBytes,
          originalBytes,
        ) !== 0
      ) {
        throw new Error(
          "Remote restored bytes differ from original.",
        );
      }

      console.log(
        "Remote restored byte identity: PASS",
      );
    } finally {
      await cleanupR2Snapshot(
        remoteAfter,
      );
    }

    console.log("");
    console.log(
      "UNIFIED LOCAL + REMOTE ROLLBACK: PASS",
    );
  } finally {
    if (qaObjectCreated) {
      console.log("");
      console.log(
        "Deleting disposable remote QA object...",
      );

      await deleteR2Object({
        objectKey: QA_KEY,
      });

      console.log(
        "Remote QA cleanup: PASS",
      );
    }

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

  console.log("");
  console.log(
    "Production thesis object touched: NO",
  );

  console.log(
    "STEP 9E: PASS",
  );
}

main().catch((error) => {
  console.error("");
  console.error("STEP 9E FAILED");

  console.error(
    error instanceof Error
      ? error.stack
      : String(error),
  );

  process.exitCode = 1;
});
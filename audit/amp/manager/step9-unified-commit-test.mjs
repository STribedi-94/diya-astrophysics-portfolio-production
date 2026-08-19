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
  "__qa/universal-manager-step9f-unified-commit.txt";

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
  console.log("Diya Universal Manager - Step 9F");
  console.log("================================");
  console.log(
    "Mode: UNIFIED LOCAL + REMOTE SUCCESSFUL COMMIT TEST",
  );
  console.log(`QA key: ${QA_KEY}`);

  const tempRoot = await mkdtemp(
    path.join(
      os.tmpdir(),
      "diya-step9f-",
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
    "DIYA-STEP9F-ORIGINAL-CONTENT",
    "utf8",
  );

  const replacementBytes = Buffer.from(
    "DIYA-STEP9F-REPLACEMENT-CONTENT",
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

    const result =
      await executeManagedReplacementTransaction({
        operationId:
          "step9f-unified-commit",

        sourceFile:
          replacementFile,

        destinationFile,

        validateLocal: async () => {
          const localBytes =
            await readFile(destinationFile);

          const localHash =
            sha256(localBytes);

          if (localHash !== replacementHash) {
            throw new Error(
              "Local replacement validation failed.",
            );
          }

          console.log(
            "Local replacement validation: PASS",
          );
        },

        r2: {
          objectKey: QA_KEY,
          contentType: CONTENT_TYPE,

          validate: async (remoteResult) => {
            if (
              remoteResult?.verified !== true ||
              remoteResult?.sha256 !== replacementHash
            ) {
              throw new Error(
                "Remote replacement validation failed.",
              );
            }

            console.log(
              "Remote replacement validation: PASS",
            );
          },
        },
      });

    if (
      result.committed !== true ||
      result.rolledBack !== false ||
      result.localRolledBack !== false ||
      result.remoteRolledBack !== false
    ) {
      throw new Error(
        "Unified transaction did not report a clean commit.",
      );
    }

    console.log("");
    console.log(
      "Unified transaction commit signal: PASS",
    );

    const localAfter =
      await readFile(destinationFile);

    const localAfterHash =
      sha256(localAfter);

    console.log(
      `Local committed SHA : ${localAfterHash}`,
    );

    if (localAfterHash !== replacementHash) {
      throw new Error(
        "Committed local SHA does not match replacement SHA.",
      );
    }

    if (
      Buffer.compare(
        localAfter,
        replacementBytes,
      ) !== 0
    ) {
      throw new Error(
        "Committed local bytes differ from replacement bytes.",
      );
    }

    console.log(
      "Local committed byte identity: PASS",
    );

    const remoteAfter =
      await createR2Snapshot({
        objectKey: QA_KEY,
      });

    try {
      console.log(
        `Remote committed SHA: ${remoteAfter.sha256}`,
      );

      if (
        remoteAfter.sha256 !== replacementHash
      ) {
        throw new Error(
          "Committed remote SHA does not match replacement SHA.",
        );
      }

      const remoteBytes =
        await readFile(
          remoteAfter.snapshotFile,
        );

      if (
        Buffer.compare(
          remoteBytes,
          replacementBytes,
        ) !== 0
      ) {
        throw new Error(
          "Committed remote bytes differ from replacement bytes.",
        );
      }

      console.log(
        "Remote committed byte identity: PASS",
      );
    } finally {
      await cleanupR2Snapshot(
        remoteAfter,
      );
    }

    console.log("");
    console.log(
      "UNIFIED LOCAL + REMOTE COMMIT: PASS",
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
    "Production thesis/CV/publications touched: NO",
  );

  console.log(
    "STEP 9F: PASS",
  );
}

main().catch((error) => {
  console.error("");
  console.error("STEP 9F FAILED");

  console.error(
    error instanceof Error
      ? error.stack
      : String(error),
  );

  process.exitCode = 1;
});
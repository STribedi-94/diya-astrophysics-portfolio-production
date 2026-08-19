import { createHash } from "node:crypto";
import { readFile, stat } from "node:fs/promises";
import path from "node:path";

import {
  cleanupR2Snapshot,
  createR2Snapshot,
  restoreR2Snapshot,
} from "./r2-sync.mjs";

const LOCAL_FILE = path.resolve(
  "public",
  "assets",
  "images",
  "thesis",
  "diya-thesis-m-dwarf-magnetic-activity-visual.png",
);

const OBJECT_KEY =
  "images/thesis/diya-thesis-m-dwarf-magnetic-activity-visual.png";

const CONTENT_TYPE = "image/png";

function sha256(buffer) {
  return createHash("sha256")
    .update(buffer)
    .digest("hex")
    .toUpperCase();
}

async function main() {
  console.log("");
  console.log("Diya Universal Manager - Step 9C");
  console.log("================================");
  console.log("Mode: BYTE-IDENTICAL REMOTE RESTORE TEST");

  const localBytes = await readFile(LOCAL_FILE);
  const localStat = await stat(LOCAL_FILE);
  const localHash = sha256(localBytes);

  const originalSnapshot = await createR2Snapshot({
    objectKey: OBJECT_KEY,
  });

  try {
    if (originalSnapshot.size !== localStat.size) {
      throw new Error(
        "Pre-test local/remote size mismatch.",
      );
    }

    if (originalSnapshot.sha256 !== localHash) {
      throw new Error(
        "Pre-test local/remote SHA-256 mismatch.",
      );
    }

    console.log(`Original remote size: ${originalSnapshot.size}`);
    console.log(`Original remote SHA : ${originalSnapshot.sha256}`);
    console.log("Pre-test integrity: PASS");

    const restored = await restoreR2Snapshot({
      snapshot: originalSnapshot,
      contentType: CONTENT_TYPE,
    });

    if (!restored.restored || !restored.verified) {
      throw new Error(
        "Remote restore did not report successful verification.",
      );
    }

    if (restored.size !== originalSnapshot.size) {
      throw new Error(
        "Restored object size differs from original snapshot.",
      );
    }

    if (restored.sha256 !== originalSnapshot.sha256) {
      throw new Error(
        "Restored object SHA-256 differs from original snapshot.",
      );
    }

    console.log("");
    console.log(`Restored remote size: ${restored.size}`);
    console.log(`Restored remote SHA : ${restored.sha256}`);
    console.log("Remote restore PUT: PASS");
    console.log("Post-restore GET verification: PASS");
    console.log("Byte identity preserved: PASS");
  } finally {
    await cleanupR2Snapshot(originalSnapshot);
  }

  console.log("Original snapshot cleanup: PASS");
  console.log("STEP 9C: PASS");
}

main().catch((error) => {
  console.error("");
  console.error("STEP 9C FAILED");
  console.error(
    error instanceof Error
      ? error.stack
      : String(error),
  );

  process.exitCode = 1;
});
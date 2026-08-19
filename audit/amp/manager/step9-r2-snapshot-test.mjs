import { createHash } from "node:crypto";
import { readFile, stat } from "node:fs/promises";
import path from "node:path";

import {
  cleanupR2Snapshot,
  createR2Snapshot,
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

function sha256(buffer) {
  return createHash("sha256")
    .update(buffer)
    .digest("hex")
    .toUpperCase();
}

async function main() {
  console.log("");
  console.log("Diya Universal Manager - Step 9B");
  console.log("================================");
  console.log("Mode: READ-ONLY R2 SNAPSHOT TEST");

  const localBytes = await readFile(LOCAL_FILE);
  const localStat = await stat(LOCAL_FILE);
  const localHash = sha256(localBytes);

  const snapshot = await createR2Snapshot({
    objectKey: OBJECT_KEY,
  });

  try {
    console.log(`Local size : ${localStat.size}`);
    console.log(`Remote size: ${snapshot.size}`);

    console.log("");
    console.log(`Local SHA  : ${localHash}`);
    console.log(`Remote SHA : ${snapshot.sha256}`);

    if (snapshot.verifiedRead !== true) {
      throw new Error(
        "Snapshot did not report verifiedRead=true.",
      );
    }

    if (snapshot.size !== localStat.size) {
      throw new Error(
        "Local and remote snapshot sizes do not match.",
      );
    }

    if (snapshot.sha256 !== localHash) {
      throw new Error(
        "Local and remote snapshot SHA-256 values do not match.",
      );
    }

    console.log("");
    console.log("R2 snapshot GET: PASS");
    console.log("Local/remote byte identity: PASS");
    console.log("Remote mutation performed: NONE");
  } finally {
    await cleanupR2Snapshot(snapshot);
  }

  console.log("Snapshot cleanup: PASS");
  console.log("STEP 9B: PASS");
}

main().catch((error) => {
  console.error("");
  console.error("STEP 9B FAILED");
  console.error(
    error instanceof Error
      ? error.stack
      : String(error),
  );

  process.exitCode = 1;
});
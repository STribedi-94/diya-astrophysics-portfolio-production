import { mkdtemp, rm, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { deleteR2Object, executeR2AddWithRollback, syncAndVerifyR2Object } from "./r2-sync.mjs";

const KEY = "__qa/universal-manager-step11g-collision.txt";

async function main() {
  const root = await mkdtemp(path.join(os.tmpdir(), "diya-step11g-"));
  const original = path.join(root, "original.txt");
  const replacement = path.join(root, "replacement.txt");
  await writeFile(original, "ORIGINAL-R2-COLLISION-CONTENT", "utf8");
  await writeFile(replacement, "REPLACEMENT-MUST-NOT-BE-WRITTEN", "utf8");
  let created = false;
  try {
    await syncAndVerifyR2Object({ localFile: original, objectKey: KEY });
    created = true;
    let rejected = false;
    try {
      await executeR2AddWithRollback({ localFile: replacement, objectKey: KEY });
    } catch (error) {
      rejected = String(error?.message ?? error).includes("R2 ADD collision");
      if (!rejected) throw error;
    }
    if (!rejected) throw new Error("Existing R2 key was not rejected.");
    console.log("Existing R2 key collision rejection: PASS");
    console.log("Existing remote object overwrite prevented: PASS");
  } finally {
    if (created) await deleteR2Object({ objectKey: KEY });
    await rm(root, { recursive: true, force: true });
  }
  console.log("Disposable QA cleanup: PASS");
}

main().catch((error) => {
  console.error(error instanceof Error ? error.stack : String(error));
  process.exitCode = 1;
});

import { mkdir, readFile, rm, writeFile } from "node:fs/promises";
import path from "node:path";
import { executeReplacementTransaction } from "./orchestrator.mjs";

const root = path.resolve(".amp-manager-step4-test");
const source = path.join(root, "replacement.txt");
const destination = path.join(root, "managed.txt");

async function reset() {
  await rm(root, { recursive: true, force: true });
  await mkdir(root, { recursive: true });
  await writeFile(source, "NEW-CONTENT", "utf8");
  await writeFile(destination, "ORIGINAL-CONTENT", "utf8");
}

async function readDestination() {
  return readFile(destination, "utf8");
}

async function main() {
  await reset();

  const success = await executeReplacementTransaction({
    operationId: "step4-success",
    sourceFile: source,
    destinationFile: destination,
    validate: async () => {
      const value = await readDestination();
      if (value !== "NEW-CONTENT") throw new Error("Successful-write validation failed.");
    },
  });

  if (!success.committed || success.rolledBack) {
    throw new Error("Successful transaction did not commit correctly.");
  }

  if ((await readDestination()) !== "NEW-CONTENT") {
    throw new Error("Successful transaction content mismatch.");
  }

  console.log("Commit test: PASS");

  await reset();
  let rollbackObserved = false;

  try {
    await executeReplacementTransaction({
      operationId: "step4-rollback",
      sourceFile: source,
      destinationFile: destination,
      validate: async () => {
        throw new Error("INTENTIONAL VALIDATION FAILURE");
      },
    });
  } catch (error) {
    rollbackObserved = error?.rolledBack === true;
  }

  if (!rollbackObserved) {
    throw new Error("Rollback signal was not observed.");
  }

  if ((await readDestination()) !== "ORIGINAL-CONTENT") {
    throw new Error("Rollback failed to restore original content.");
  }

  console.log("Rollback test: PASS");
  console.log("Original restoration: PASS");

  await rm(root, { recursive: true, force: true });
  await rm(path.resolve(".amp-manager-transactions"), { recursive: true, force: true });

  console.log("Temporary test cleanup: PASS");
}

main().catch((error) => {
  console.error(error instanceof Error ? error.stack : String(error));
  process.exitCode = 1;
});

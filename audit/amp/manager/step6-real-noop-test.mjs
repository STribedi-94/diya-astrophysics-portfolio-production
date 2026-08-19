import { copyFile, mkdir, readFile, rm } from "node:fs/promises";
import path from "node:path";
import { createHash } from "node:crypto";
import { discoverAssetTarget } from "./target-discovery.mjs";
import { resolveManagedDestination } from "./destination-resolver.mjs";
import { executeReplacementTransaction } from "./orchestrator.mjs";
import { validateManagedWrite } from "./validation-pipeline.mjs";

async function sha256(filePath) {
  const bytes = await readFile(filePath);
  return createHash("sha256").update(bytes).digest("hex").toUpperCase();
}

async function main() {
  const target = discoverAssetTarget("image", "thesis-m-dwarf-magnetic-activity");
  if (!target.exists) throw new Error("Canonical thesis image target not found.");

  const resolved = resolveManagedDestination(target);
  const sandbox = path.resolve(".amp-manager-step6-test");
  const sourceCopy = path.join(sandbox, "byte-identical-source.png");

  await rm(sandbox, { recursive: true, force: true });
  await mkdir(sandbox, { recursive: true });

  const originalHash = await sha256(resolved.destinationFile);
  await copyFile(resolved.destinationFile, sourceCopy);

  const sourceHash = await sha256(sourceCopy);
  if (sourceHash !== originalHash) throw new Error("Temporary source copy hash mismatch.");

  const adapterPlan = Object.freeze({
    adapter: "image",
    action: "replace",
    sourceFile: sourceCopy,
    targetAssetId: target.assetId,
    requiresPhysicalSource: true,
    requiresRegistryCompilation: true,
    requiresTypeScriptCheck: true,
  });

  const result = await executeReplacementTransaction({
    operationId: "step6-real-noop-thesis-image",
    sourceFile: sourceCopy,
    destinationFile: resolved.destinationFile,
    validate: async () => {
      const writtenHash = await sha256(resolved.destinationFile);
      if (writtenHash !== originalHash) throw new Error("No-op replacement changed asset bytes.");
      await validateManagedWrite(adapterPlan);
      const validatedHash = await sha256(resolved.destinationFile);
      if (validatedHash !== originalHash) throw new Error("Validation pipeline changed asset bytes.");
    },
  });

  if (!result.committed || result.rolledBack) throw new Error("Real no-op transaction did not commit correctly.");

  const finalHash = await sha256(resolved.destinationFile);
  if (finalHash !== originalHash) throw new Error("Final production asset hash differs from original.");

  console.log(`Original SHA-256: ${originalHash}`);
  console.log(`Final SHA-256:    ${finalHash}`);
  console.log("Byte identity: PASS");
  console.log("Real managed destination transaction: PASS");
  console.log("Image registry validation: PASS");
  console.log("TypeScript validation: PASS");

  await rm(sandbox, { recursive: true, force: true });
  await rm(path.resolve(".amp-manager-transactions"), { recursive: true, force: true });
  console.log("Temporary cleanup: PASS");
}

main().catch((error) => {
  console.error(error instanceof Error ? error.stack : String(error));
  process.exitCode = 1;
});

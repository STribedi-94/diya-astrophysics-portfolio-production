import { readFile } from "node:fs/promises";
import path from "node:path";
import { createManagementPlan } from "./planner.mjs";
import { inspectManagementTarget } from "./inspector.mjs";
import { buildAdapterPlan } from "./adapters.mjs";
import { validateAdapterPlan } from "./post-validation.mjs";
import { resolveManagedDestination } from "./destination-resolver.mjs";
import { executeReplacementTransaction } from "./orchestrator.mjs";
import { validateManagedWrite } from "./validation-pipeline.mjs";

async function main() {
  const manifestArgument = process.argv.slice(2).find((argument) => !argument.startsWith("--"));

  if (!manifestArgument) {
    throw new Error("Usage: node audit/amp/manager/cli.mjs <operation.json> [--apply]");
  }

  const apply = process.argv.includes("--apply");
  const manifestPath = path.resolve(manifestArgument);
  const manifestSource = (await readFile(manifestPath, "utf8")).replace(/^\uFEFF/, "");
  const operation = JSON.parse(manifestSource);
  const plan = createManagementPlan(operation);
  const target = inspectManagementTarget(plan);
  const adapterPlan = buildAdapterPlan(plan, target);
  const validation = await validateAdapterPlan(adapterPlan);

  console.log("\nDiya AMP Universal Manager");
  console.log("==========================");
  console.log(`Operation: ${plan.operation}`);
  console.log(`Target:    ${plan.targetType}:${plan.targetId}`);
  console.log(`Mode:      ${apply ? "APPLY REQUESTED" : "DRY RUN"}`);
  console.log(`Adapter:   ${adapterPlan.adapter}`);
  console.log(`R2 sync:   ${plan.syncR2 ? "requested" : "no"}`);
  console.log(`Existing target: ${target.exists === null ? "external metadata target" : target.exists ? "yes" : "no"}`);

  if (target.assetId) {
    console.log(`AMP Asset ID: ${target.assetId}`);
  }

  if (adapterPlan.sourceFile) {
    console.log(`Source: ${adapterPlan.sourceFile}`);
  }

  if (plan.publicationStatusChange) {
    console.log(`Publication status change explicitly requested: ${plan.requestedStatus}`);
  } else {
    console.log("Publication status change: none");
  }

  console.log(`Source validation: ${validation.sourceValidated ? "passed" : "not required"}`);
  console.log(`Derivative generation: ${validation.derivativeGenerationRequired ? "required" : "not required"}`);
  console.log(`Registry compilation: ${validation.registryCompilationRequired ? "required" : "not required"}`);
  console.log(`TypeScript check: ${validation.typeScriptCheckRequired ? "required" : "not required"}`);

  if (!apply) {
    console.log("\nAdapter planning and validation succeeded. No managed content was modified.");
    return;
  }

  if (plan.syncR2) {
    throw new Error("R2 synchronization remains locked until transactional remote synchronization is installed.");
  }

  if (plan.operation !== "replace" || !["image", "document"].includes(plan.targetType)) {
    throw new Error(`Apply is not yet enabled for ${plan.operation} ${plan.targetType}. Existing image/document replacement is the only unlocked mutation.`);
  }

  if (!target.exists || !target.record) {
    throw new Error("Replacement requires an existing authoritative AMP target.");
  }

  const destination = resolveManagedDestination(target);

  console.log(`Destination: ${destination.destinationFile}`);
  console.log("Transactional replacement: STARTING");

  const result = await executeReplacementTransaction({
    operationId: plan.operationId,
    sourceFile: adapterPlan.sourceFile,
    destinationFile: destination.destinationFile,
    validate: async () => {
      await validateManagedWrite(adapterPlan);
    },
  });

  if (!result.committed || result.rolledBack) {
    throw new Error("Replacement transaction did not commit successfully.");
  }

  console.log("Transactional replacement: COMMITTED");
  console.log("Post-write validation: PASSED");
  console.log("R2 synchronization: NOT REQUESTED");
  console.log("\nManaged replacement completed successfully.");
}

main().catch((error) => {
  console.error("\nUniversal Manager failed.");
  console.error(error instanceof Error ? error.message : String(error));
  process.exitCode = 1;
});

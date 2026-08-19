import { access } from "node:fs/promises";

async function assertReadable(filePath) {
  try {
    await access(filePath);
  } catch {
    throw new Error(`Requested source file does not exist or is not readable: ${filePath}`);
  }
}

export async function validateAdapterPlan(adapterPlan) {
  if (adapterPlan.requiresPhysicalSource) {
    await assertReadable(adapterPlan.sourceFile);
  }

  return Object.freeze({
    valid: true,
    adapter: adapterPlan.adapter,
    action: adapterPlan.action,
    sourceValidated: adapterPlan.requiresPhysicalSource,
    derivativeGenerationRequired: adapterPlan.requiresDerivativeGeneration === true,
    registryCompilationRequired: adapterPlan.requiresRegistryCompilation === true,
    typeScriptCheckRequired: adapterPlan.requiresTypeScriptCheck === true,
  });
}

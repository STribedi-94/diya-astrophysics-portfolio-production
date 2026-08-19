import { spawn } from "node:child_process";

function run(command, args) {
  return new Promise((resolve, reject) => {
    const executable =
      process.platform === "win32" && command === "npx"
        ? "npx.cmd"
        : command;

    const child = spawn(executable, args, {
      cwd: process.cwd(),
      stdio: "inherit",
      shell: false,
    });

    child.on("error", reject);
    child.on("exit", (code) => {
      if (code === 0) resolve();
      else reject(new Error(`${executable} ${args.join(" ")} exited with code ${code}`));
    });
  });
}

export async function validateManagedWrite(adapterPlan) {
  if (adapterPlan.requiresDerivativeGeneration) {
    await run("node", ["audit/generate-documents.mjs"]);
  }

  if (adapterPlan.requiresRegistryCompilation) {
    if (adapterPlan.adapter === "image") {
      await run("node", ["audit/compile-image-registry.mjs"]);
    }

    if (adapterPlan.adapter === "document") {
      await run("node", ["audit/compile-document-registry.mjs"]);
    }
  }

  if (adapterPlan.requiresTypeScriptCheck) {
    await run("npx", ["tsc", "--noEmit"]);
  }

  return Object.freeze({ valid: true });
}

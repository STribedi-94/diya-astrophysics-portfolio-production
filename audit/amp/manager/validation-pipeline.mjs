import { spawn } from "node:child_process";

function run(command, args) {
  return new Promise((resolve, reject) => {
    const isWindowsNpx =
      process.platform === "win32" && command === "npx";

    const executable = isWindowsNpx
      ? process.env.ComSpec || "cmd.exe"
      : command;

    const childArgs = isWindowsNpx
      ? ["/d", "/s", "/c", "npx.cmd", ...args]
      : args;

    const child = spawn(executable, childArgs, {
      cwd: process.cwd(),
      stdio: "inherit",
      shell: false,
    });

    child.on("error", reject);
    child.on("exit", (code) => {
      if (code === 0) {
        resolve();
        return;
      }

      reject(
        new Error(
          `${executable} ${childArgs.join(" ")} exited with code ${code}`,
        ),
      );
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

export async function validateManagedDocumentAdd() {
  await run("node", ["audit/compile-document-registry.mjs"]);
  await run("npx", ["tsc", "--noEmit"]);
  return Object.freeze({ valid: true });
}

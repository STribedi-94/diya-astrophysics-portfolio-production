import { createHash } from "node:crypto";
import { mkdtemp, readFile, rm } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { spawn } from "node:child_process";

const DEFAULT_BUCKET = "astro-diya-assets";

function contentType(filePath) {
  const extension = path.extname(filePath).toLowerCase();
  return ({ ".jpg":"image/jpeg", ".jpeg":"image/jpeg", ".png":"image/png", ".webp":"image/webp", ".pdf":"application/pdf", ".glb":"model/gltf-binary", ".json":"application/json; charset=utf-8", ".txt":"text/plain; charset=utf-8" })[extension] ?? "application/octet-stream";
}

async function hashFile(filePath) {
  return createHash("sha256").update(await readFile(filePath)).digest("hex").toUpperCase();
}

function runWrangler(args) {
  return new Promise((resolve, reject) => {
    const executable = process.platform === "win32" ? "npx.cmd" : "npx";
    const child = spawn(executable, ["wrangler", ...args], { cwd: process.cwd(), stdio: "inherit", shell: false });
    child.on("error", reject);
    child.on("exit", (code) => code === 0 ? resolve() : reject(new Error(`Wrangler exited with code ${code}`)));
  });
}

export function describeR2Sync(localFile, objectKey, bucket = DEFAULT_BUCKET) {
  return Object.freeze({ localFile:path.resolve(localFile), objectKey, bucket, contentType:contentType(localFile) });
}

export async function syncAndVerifyR2Object({ localFile, objectKey, bucket = DEFAULT_BUCKET }) {
  const source = path.resolve(localFile);
  const expectedHash = await hashFile(source);
  const tempRoot = await mkdtemp(path.join(os.tmpdir(), "diya-r2-verify-"));
  const verificationFile = path.join(tempRoot, "remote-object");

  try {
    await runWrangler(["r2","object","put",`${bucket}/${objectKey}`,"--file",source,"--content-type",contentType(source),"--remote"]);
    await runWrangler(["r2","object","get",`${bucket}/${objectKey}`,"--file",verificationFile,"--remote"]);
    const remoteHash = await hashFile(verificationFile);
    if (remoteHash !== expectedHash) throw new Error(`R2 integrity mismatch for ${objectKey}`);
    return Object.freeze({ verified:true, bucket, objectKey, sha256:expectedHash });
  } finally {
    await rm(tempRoot, { recursive:true, force:true });
  }
}

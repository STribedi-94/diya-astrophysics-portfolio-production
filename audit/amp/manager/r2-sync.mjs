import { createHash } from "node:crypto";
import { mkdtemp, readFile, rm, stat } from "node:fs/promises";
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
    const isWindows = process.platform === "win32";

    const executable = isWindows
      ? process.env.ComSpec || "cmd.exe"
      : "npx";

    const childArgs = isWindows
      ? ["/d", "/s", "/c", "npx.cmd", "wrangler", ...args]
      : ["wrangler", ...args];

    const child = spawn(
      executable,
      childArgs,
      {
        cwd: process.cwd(),
        stdio: "inherit",
        shell: false,
      },
    );

    child.on("error", reject);

    child.on("exit", (code) => {
      if (code === 0) {
        resolve();
        return;
      }

      reject(new Error(`Wrangler exited with code ${code}`));
    });
  });
}

export function describeR2Sync(localFile, objectKey, bucket = DEFAULT_BUCKET) {
  return Object.freeze({ localFile:path.resolve(localFile), objectKey, bucket, contentType:contentType(localFile) });
}

export async function createR2Snapshot({
  objectKey,
  bucket = DEFAULT_BUCKET,
}) {
  if (!objectKey || typeof objectKey !== "string") {
    throw new Error("R2 snapshot requires a non-empty objectKey.");
  }

  const tempRoot = await mkdtemp(
    path.join(os.tmpdir(), "diya-r2-snapshot-"),
  );

  const snapshotFile = path.join(
    tempRoot,
    "remote-object",
  );

  try {
    await runWrangler([
      "r2",
      "object",
      "get",
      `${bucket}/${objectKey}`,
      "--file",
      snapshotFile,
      "--remote",
    ]);

    const snapshotStat = await stat(snapshotFile);
    const sha256 = await hashFile(snapshotFile);

    return Object.freeze({
      bucket,
      objectKey,
      snapshotFile,
      tempRoot,
      size: snapshotStat.size,
      sha256,
      verifiedRead: true,
    });
  } catch (error) {
    await rm(
      tempRoot,
      {
        recursive: true,
        force: true,
      },
    );

    throw new Error(
      `Could not snapshot R2 object ${bucket}/${objectKey}: ${
        error instanceof Error ? error.message : String(error)
      }`,
    );
  }
}

export async function cleanupR2Snapshot(snapshot) {
  if (!snapshot?.tempRoot) {
    return;
  }

  await rm(
    snapshot.tempRoot,
    {
      recursive: true,
      force: true,
    },
  );
}
export async function restoreR2Snapshot({
  snapshot,
  contentType: restoreContentType,
}) {
  if (
    !snapshot?.verifiedRead ||
    !snapshot?.snapshotFile ||
    !snapshot?.objectKey ||
    !snapshot?.bucket
  ) {
    throw new Error(
      "R2 restore requires a valid verified snapshot.",
    );
  }

  if (
    !restoreContentType ||
    typeof restoreContentType !== "string"
  ) {
    throw new Error(
      "R2 restore requires the original content type.",
    );
  }

  await runWrangler([
    "r2",
    "object",
    "put",
    `${snapshot.bucket}/${snapshot.objectKey}`,
    "--file",
    snapshot.snapshotFile,
    "--content-type",
    restoreContentType,
    "--remote",
  ]);

  const verification = await createR2Snapshot({
    objectKey: snapshot.objectKey,
    bucket: snapshot.bucket,
  });

  try {
    if (verification.size !== snapshot.size) {
      throw new Error(
        `Restored R2 size mismatch for ${snapshot.objectKey}`,
      );
    }

    if (verification.sha256 !== snapshot.sha256) {
      throw new Error(
        `Restored R2 SHA-256 mismatch for ${snapshot.objectKey}`,
      );
    }

    return Object.freeze({
      restored: true,
      verified: true,
      bucket: snapshot.bucket,
      objectKey: snapshot.objectKey,
      size: verification.size,
      sha256: verification.sha256,
    });
  } finally {
    await cleanupR2Snapshot(verification);
  }
}
export async function deleteR2Object({
  objectKey,
  bucket = DEFAULT_BUCKET,
}) {
  if (!objectKey || typeof objectKey !== "string") {
    throw new Error(
      "R2 delete requires a non-empty objectKey.",
    );
  }

  await runWrangler([
    "r2",
    "object",
    "delete",
    `${bucket}/${objectKey}`,
    "--remote",
  ]);

  return Object.freeze({
    deleted: true,
    bucket,
    objectKey,
  });
}

export async function executeR2ReplacementWithRollback({
  localFile,
  objectKey,
  contentType: restoreContentType,
  bucket = DEFAULT_BUCKET,
  validate,
}) {
  if (!localFile || typeof localFile !== "string") {
    throw new Error(
      "R2 replacement transaction requires localFile.",
    );
  }

  if (!objectKey || typeof objectKey !== "string") {
    throw new Error(
      "R2 replacement transaction requires objectKey.",
    );
  }

  if (
    !restoreContentType ||
    typeof restoreContentType !== "string"
  ) {
    throw new Error(
      "R2 replacement transaction requires the original content type.",
    );
  }

  const snapshot = await createR2Snapshot({
    objectKey,
    bucket,
  });

  try {
    const writeResult = await syncAndVerifyR2Object({
      localFile,
      objectKey,
      bucket,
    });

    if (typeof validate === "function") {
      await validate(writeResult);
    }

    return Object.freeze({
      committed: true,
      rolledBack: false,
      verified: writeResult.verified === true,
      bucket,
      objectKey,
      sha256: writeResult.sha256,
    });
  } catch (error) {
    let restoreResult;

    try {
      restoreResult = await restoreR2Snapshot({
        snapshot,
        contentType: restoreContentType,
      });
    } catch (restoreError) {
      throw Object.assign(
        new Error(
          `R2 transaction failed and automatic remote rollback also failed. Original error: ${
            error instanceof Error ? error.message : String(error)
          }. Rollback error: ${
            restoreError instanceof Error
              ? restoreError.message
              : String(restoreError)
          }`,
        ),
        {
          rolledBack: false,
          rollbackFailed: true,
        },
      );
    }

    throw Object.assign(
      new Error(
        `R2 transaction failed and original remote object was restored: ${
          error instanceof Error ? error.message : String(error)
        }`,
      ),
      {
        rolledBack: true,
        rollbackFailed: false,
        restoreResult,
      },
    );
  } finally {
    await cleanupR2Snapshot(snapshot);
  }
}
export async function assertR2ObjectDoesNotExist({
  objectKey,
  bucket = DEFAULT_BUCKET,
}) {
  if (!objectKey || typeof objectKey !== "string") {
    throw new Error(
      "R2 existence check requires objectKey.",
    );
  }

  let snapshot = null;

  try {
    snapshot = await createR2Snapshot({
      objectKey,
      bucket,
    });
  } catch {
    return Object.freeze({
      exists: false,
      bucket,
      objectKey,
    });
  }

  try {
    throw new Error(
      `R2 ADD collision: remote object already exists: ${bucket}/${objectKey}`,
    );
  } finally {
    await cleanupR2Snapshot(snapshot);
  }
}
export async function executeR2AddWithRollback({
  localFile,
  objectKey,
  bucket = DEFAULT_BUCKET,
  validate,
}) {
  if (!localFile || typeof localFile !== "string") {
    throw new Error(
      "R2 ADD requires localFile.",
    );
  }

  if (!objectKey || typeof objectKey !== "string") {
    throw new Error(
      "R2 ADD requires objectKey.",
    );
  }

  await assertR2ObjectDoesNotExist({ objectKey, bucket });

  let remoteCreated = false;

  try {
    const result = await syncAndVerifyR2Object({
      localFile,
      objectKey,
      bucket,
    });

    remoteCreated = true;

    if (typeof validate === "function") {
      await validate(result);
    }

    return Object.freeze({
      committed: true,
      rolledBack: false,
      deletedOnRollback: false,
      verified: result.verified === true,
      bucket,
      objectKey,
      sha256: result.sha256,
    });
  } catch (error) {
    let deleteError = null;

    if (remoteCreated) {
      try {
        await deleteR2Object({
          objectKey,
          bucket,
        });
      } catch (rollbackError) {
        deleteError = rollbackError;
      }
    }

    if (deleteError) {
      throw Object.assign(
        new Error(
          `R2 ADD failed and remote cleanup also failed. Original error: ${
            error instanceof Error
              ? error.message
              : String(error)
          }. Cleanup error: ${
            deleteError instanceof Error
              ? deleteError.message
              : String(deleteError)
          }`,
        ),
        {
          rolledBack: false,
          rollbackFailed: true,
        },
      );
    }

    throw Object.assign(
      new Error(
        `R2 ADD failed and new remote object was removed: ${
          error instanceof Error
            ? error.message
            : String(error)
        }`,
      ),
      {
        rolledBack: true,
        rollbackFailed: false,
        deletedOnRollback: remoteCreated,
      },
    );
  }
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

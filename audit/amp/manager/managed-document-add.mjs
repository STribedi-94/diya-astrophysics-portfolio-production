import { copyFile, mkdir, rm, stat } from "node:fs/promises";
import path from "node:path";
import { generateManagedDocumentDerivatives } from "./managed-document-derivatives.mjs";
import { executeR2AddWithRollback } from "./r2-sync.mjs";

async function exists(filePath) {
  try {
    await stat(filePath);
    return true;
  } catch (error) {
    if (error?.code === "ENOENT") return false;
    throw error;
  }
}

export async function executeManagedDocumentAddTransaction({
  sourceFile,
  destinationFile,
  thumbnailFile,
  previewFile,
  record,
  registerRecord,
  removeRecord,
  validateLocal,
  r2 = null,
}) {
  if (
    typeof registerRecord !== "function" ||
    typeof removeRecord !== "function"
  ) {
    throw new Error(
      "Managed document ADD requires registration and removal callbacks.",
    );
  }

  for (const candidate of [
    destinationFile,
    thumbnailFile,
    previewFile,
  ]) {
    if (await exists(candidate)) {
      throw new Error(
        `Managed document ADD destination already exists: ${candidate}`,
      );
    }
  }

  let pdfCreated = false;
  let derivativesCreated = false;
  let recordRegistered = false;

  try {
    await mkdir(
      path.dirname(destinationFile),
      { recursive: true },
    );

    await copyFile(
      sourceFile,
      destinationFile,
    );

    pdfCreated = true;

    const derivativeResult =
      await generateManagedDocumentDerivatives({
        pdfFile: destinationFile,
        thumbnailFile,
        previewFile,
      });

    if (
      !derivativeResult.committed ||
      derivativeResult.rolledBack
    ) {
      throw new Error(
        "Targeted document derivative transaction did not commit.",
      );
    }

    derivativesCreated = true;

    await registerRecord(record);
    recordRegistered = true;

    if (typeof validateLocal === "function") {
      await validateLocal({
        destinationFile,
        thumbnailFile,
        previewFile,
        record,
      });
    }

    let remoteResult = null;

    if (r2?.objectKey) {
      remoteResult =
        await executeR2AddWithRollback({
          localFile: destinationFile,
          objectKey: r2.objectKey,
          bucket: r2.bucket,
          validate: r2.validate,
        });

      if (
        !remoteResult.committed ||
        remoteResult.rolledBack
      ) {
        throw new Error(
          "Managed document R2 ADD did not commit successfully.",
        );
      }
    }

    return Object.freeze({
      committed: true,
      rolledBack: false,
      pdfCreated: true,
      derivativesCreated: true,
      recordRegistered: true,
      remoteResult,
    });
  } catch (error) {
    let rollbackError = null;

    if (recordRegistered) {
      try {
        await removeRecord(record.id);
      } catch (recordError) {
        rollbackError = recordError;
      }
    }

    if (derivativesCreated) {
      try {
        await rm(previewFile, { force: true });
        await rm(thumbnailFile, { force: true });
      } catch (derivativeError) {
        rollbackError ??= derivativeError;
      }
    }

    if (pdfCreated) {
      try {
        await rm(destinationFile, { force: true });
      } catch (pdfError) {
        rollbackError ??= pdfError;
      }
    }

    if (rollbackError) {
      throw Object.assign(
        new Error(
          `Managed document ADD failed and rollback also failed. Original error: ${
            error instanceof Error ? error.message : String(error)
          }. Rollback error: ${
            rollbackError instanceof Error ? rollbackError.message : String(rollbackError)
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
        `Managed document ADD failed and was rolled back: ${
          error instanceof Error ? error.message : String(error)
        }`,
      ),
      {
        rolledBack: true,
        rollbackFailed: false,
      },
    );
  }
}

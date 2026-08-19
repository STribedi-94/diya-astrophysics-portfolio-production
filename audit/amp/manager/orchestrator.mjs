import {
  createTransaction,
  backupFile,
  rollbackTransaction,
  removeTransaction,
} from "./transaction.mjs";

import {
  writeReplacementFile,
} from "./writers.mjs";

import {
  executeR2ReplacementWithRollback,
} from "./r2-sync.mjs";

import { executeR2AddWithRollback } from "./r2-sync.mjs";

export async function executeReplacementTransaction({
  operationId,
  sourceFile,
  destinationFile,
  validate,
}) {
  const transaction =
    await createTransaction(operationId);

  try {
    await backupFile(
      transaction,
      destinationFile,
    );

    const writeResult =
      await writeReplacementFile(
        sourceFile,
        destinationFile,
      );

    if (typeof validate === "function") {
      await validate(writeResult);
    }

    await removeTransaction(transaction);

    return Object.freeze({
      committed: true,
      rolledBack: false,
      writeResult,
    });
  } catch (error) {
    await rollbackTransaction(transaction);
    await removeTransaction(transaction);

    throw Object.assign(
      new Error(
        `Transaction failed and was rolled back: ${
          error instanceof Error
            ? error.message
            : String(error)
        }`,
      ),
      {
        rolledBack: true,
      },
    );
  }
}

export async function executeManagedReplacementTransaction({
  operationId,
  sourceFile,
  destinationFile,
  validateLocal,
  r2,
}) {
  if (!r2?.objectKey) {
    throw new Error(
      "Unified managed replacement requires r2.objectKey.",
    );
  }

  if (!r2?.contentType) {
    throw new Error(
      "Unified managed replacement requires r2.contentType.",
    );
  }

  const transaction =
    await createTransaction(operationId);

  let remoteResult = null;

  try {
    await backupFile(
      transaction,
      destinationFile,
    );

    const writeResult =
      await writeReplacementFile(
        sourceFile,
        destinationFile,
      );

    if (typeof validateLocal === "function") {
      await validateLocal(writeResult);
    }

    remoteResult =
      await executeR2ReplacementWithRollback({
        localFile: destinationFile,
        objectKey: r2.objectKey,
        contentType: r2.contentType,
        bucket: r2.bucket,
        validate: r2.validate,
      });

    if (
      !remoteResult.committed ||
      remoteResult.rolledBack
    ) {
      throw new Error(
        "Remote R2 replacement did not commit successfully.",
      );
    }

    await removeTransaction(transaction);

    return Object.freeze({
      committed: true,
      rolledBack: false,
      localRolledBack: false,
      remoteRolledBack: false,
      writeResult,
      remoteResult,
    });
  } catch (error) {
    let localRollbackError = null;

    try {
      await rollbackTransaction(transaction);
    } catch (rollbackError) {
      localRollbackError = rollbackError;
    }

    await removeTransaction(transaction);

    if (localRollbackError) {
      throw Object.assign(
        new Error(
          `Unified managed replacement failed and local rollback also failed. Original error: ${
            error instanceof Error
              ? error.message
              : String(error)
          }. Local rollback error: ${
            localRollbackError instanceof Error
              ? localRollbackError.message
              : String(localRollbackError)
          }`,
        ),
        {
          rolledBack: false,
          localRollbackFailed: true,
          remoteRolledBack:
            error?.rolledBack === true,
        },
      );
    }

    throw Object.assign(
      new Error(
        `Unified managed replacement failed and local content was restored: ${
          error instanceof Error
            ? error.message
            : String(error)
        }`,
      ),
      {
        rolledBack: true,
        localRolledBack: true,
        localRollbackFailed: false,
        remoteRolledBack:
          error?.rolledBack === true,
        remoteRollbackFailed:
          error?.rollbackFailed === true,
      },
    );
  }
}
export async function executeManagedImageAddTransaction({
  operationId,
  sourceFile,
  destinationFile,
  record,
  registerRecord,
  removeRecord,
  validateLocal,
}) {
  if (
    typeof registerRecord !== "function" ||
    typeof removeRecord !== "function"
  ) {
    throw new Error(
      "Managed image ADD requires registration and removal callbacks.",
    );
  }

  let destinationCreated = false;
  let recordRegistered = false;

  try {
    const { mkdir, copyFile, stat, rm } =
      await import("node:fs/promises");
    const path =
      await import("node:path");

    try {
      await stat(destinationFile);
      throw new Error(
        `ADD destination already exists: ${destinationFile}`,
      );
    } catch (error) {
      if (error?.code !== "ENOENT") {
        throw error;
      }
    }

    await mkdir(
      path.dirname(destinationFile),
      { recursive: true },
    );

    await copyFile(
      sourceFile,
      destinationFile,
    );

    destinationCreated = true;

    await registerRecord(record);
    recordRegistered = true;

    if (typeof validateLocal === "function") {
      await validateLocal({
        operationId,
        destinationFile,
        record,
      });
    }

    return Object.freeze({
      committed: true,
      rolledBack: false,
      destinationCreated: true,
      recordRegistered: true,
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

    if (destinationCreated) {
      try {
        const { rm } =
          await import("node:fs/promises");

        await rm(
          destinationFile,
          { force: true },
        );
      } catch (fileError) {
        rollbackError ??= fileError;
      }
    }

    if (rollbackError) {
      throw Object.assign(
        new Error(
          `Managed image ADD failed and rollback also failed. Original error: ${
            error instanceof Error
              ? error.message
              : String(error)
          }. Rollback error: ${
            rollbackError instanceof Error
              ? rollbackError.message
              : String(rollbackError)
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
        `Managed image ADD failed and was rolled back: ${
          error instanceof Error
            ? error.message
            : String(error)
        }`,
      ),
      {
        rolledBack: true,
        rollbackFailed: false,
      },
    );
  }
}

export async function executeManagedImageAddWithR2Transaction({
  operationId,
  sourceFile,
  destinationFile,
  record,
  registerRecord,
  removeRecord,
  validateLocal,
  r2,
}) {
  if (!r2?.objectKey) {
    throw new Error(
      "Unified image ADD requires r2.objectKey.",
    );
  }

  let remoteResult = null;

  const localResult =
    await executeManagedImageAddTransaction({
      operationId,
      sourceFile,
      destinationFile,
      record,
      registerRecord,
      removeRecord,
      validateLocal: async (context) => {
        if (typeof validateLocal === "function") {
          await validateLocal(context);
        }

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
            "New R2 object did not commit successfully.",
          );
        }
      },
    });

  return Object.freeze({
    committed: true,
    rolledBack: false,
    localResult,
    remoteResult,
  });
}

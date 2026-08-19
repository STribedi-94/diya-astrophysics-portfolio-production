import { mkdir, rm, cp, stat } from "node:fs/promises";
import path from "node:path";

const TRANSACTION_ROOT = path.resolve(".amp-manager-transactions");

export async function createTransaction(operationId) {
  const safeId = operationId.replace(
    /[^a-zA-Z0-9._-]/g,
    "-",
  );

  const transactionPath = path.join(
    TRANSACTION_ROOT,
    safeId,
  );

  await rm(
    transactionPath,
    {
      recursive: true,
      force: true,
    },
  );

  await mkdir(
    transactionPath,
    {
      recursive: true,
    },
  );

  return {
    operationId,
    transactionPath,
    backups: [],
  };
}

export async function backupFile(
  transaction,
  filePath,
) {
  const absoluteSource = path.resolve(filePath);

  await stat(absoluteSource);

  const backupIndex =
    transaction.backups.length;

  const safeBaseName = path
    .basename(absoluteSource)
    .replace(
      /[^a-zA-Z0-9._-]/g,
      "-",
    );

  const backupName =
    `${String(backupIndex).padStart(4, "0")}-${safeBaseName}`;

  const backupPath = path.join(
    transaction.transactionPath,
    "backup",
    backupName,
  );

  await mkdir(
    path.dirname(backupPath),
    {
      recursive: true,
    },
  );

  await cp(
    absoluteSource,
    backupPath,
  );

  transaction.backups.push({
    source: absoluteSource,
    backup: backupPath,
  });

  return backupPath;
}

export async function rollbackTransaction(
  transaction,
) {
  for (
    const item of [...transaction.backups].reverse()
  ) {
    await mkdir(
      path.dirname(item.source),
      {
        recursive: true,
      },
    );

    await cp(
      item.backup,
      item.source,
    );
  }
}

export async function removeTransaction(
  transaction,
) {
  await rm(
    transaction.transactionPath,
    {
      recursive: true,
      force: true,
    },
  );
}
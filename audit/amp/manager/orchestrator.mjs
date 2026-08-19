import { createTransaction, backupFile, rollbackTransaction, removeTransaction } from "./transaction.mjs";
import { writeReplacementFile } from "./writers.mjs";

export async function executeReplacementTransaction({ operationId, sourceFile, destinationFile, validate }) {
  const transaction = await createTransaction(operationId);

  try {
    await backupFile(transaction, destinationFile);

    const writeResult = await writeReplacementFile(
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
      new Error(`Transaction failed and was rolled back: ${error instanceof Error ? error.message : String(error)}`),
      { rolledBack: true },
    );
  }
}

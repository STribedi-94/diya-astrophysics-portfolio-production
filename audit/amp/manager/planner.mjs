import { validateManagementOperation } from "./operation-contract.mjs";

export function createManagementPlan(operation) {
  const validation = validateManagementOperation(operation);

  if (!validation.valid) {
    throw new Error([
      "Universal Manager operation validation failed.",
      ...validation.errors,
    ].join("\n"));
  }

  const publicationStatusChange =
    operation.targetType === "publication" &&
    Object.prototype.hasOwnProperty.call(operation.changes ?? {}, "status");

  return Object.freeze({
    operationId: operation.operationId,
    operation: operation.operation,
    targetType: operation.targetType,
    targetId: operation.targetId,
    dryRun: true,
    publicationStatusChange,
    requestedStatus: publicationStatusChange ? operation.changes.status : null,
    syncR2: operation.options?.syncR2 === true,
    manifest: operation,
  });
}

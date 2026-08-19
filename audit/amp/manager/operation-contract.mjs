export const MANAGER_OPERATION_TYPES = Object.freeze(["add", "replace", "update-metadata", "deprecate"]);
export const MANAGER_TARGET_TYPES = Object.freeze(["image", "document", "publication"]);

export function createManagementOperation(input = {}) {
  return {
    version: 1,
    operationId: input.operationId ?? "",
    operation: input.operation ?? "",
    targetType: input.targetType ?? "",
    targetId: input.targetId ?? "",
    source: input.source ?? null,
    changes: input.changes ?? {},
    options: { syncR2: false, ...input.options },
  };
}

export function validateManagementOperation(value) {
  const errors = [];

  if (!value || typeof value !== "object" || Array.isArray(value)) {
    errors.push("Operation must be an object.");
  }

  if (!value?.operationId || typeof value.operationId !== "string") {
    errors.push("operationId is required.");
  }

  if (!MANAGER_OPERATION_TYPES.includes(value?.operation)) {
    errors.push(`Unsupported operation: ${value?.operation ?? ""}`);
  }

  if (!MANAGER_TARGET_TYPES.includes(value?.targetType)) {
    errors.push(`Unsupported targetType: ${value?.targetType ?? ""}`);
  }

  if (!value?.targetId || typeof value.targetId !== "string") {
    errors.push("targetId is required.");
  }

  if (
    value?.targetType === "publication" &&
    value?.changes &&
    Object.prototype.hasOwnProperty.call(value.changes, "status") &&
    !["Published", "Accepted", "Proceeding"].includes(value.changes.status)
  ) {
    errors.push(`Unsupported publication status: ${value.changes.status}`);
  }

  return { valid: errors.length === 0, errors };
}

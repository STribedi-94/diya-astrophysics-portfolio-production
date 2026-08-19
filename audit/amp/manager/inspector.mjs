import { discoverAssetTarget } from "./target-discovery.mjs";

export function inspectManagementTarget(plan) {
  const discovery = discoverAssetTarget(plan.targetType, plan.targetId);

  if (plan.operation === "add" && discovery.exists === true) {
    throw new Error(`Cannot add existing ${plan.targetType} target: ${plan.targetId}`);
  }

  if (plan.operation !== "add" && discovery.exists === false) {
    throw new Error(`Cannot ${plan.operation} missing ${plan.targetType} target: ${plan.targetId}`);
  }

  return Object.freeze({ ...discovery, operation: plan.operation, safeToPlan: true });
}

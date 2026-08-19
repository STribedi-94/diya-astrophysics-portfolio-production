import { readFile } from "node:fs/promises";
import path from "node:path";

import { createManagementPlan } from "./planner.mjs";
import { inspectManagementTarget } from "./inspector.mjs";
import { buildAdapterPlan } from "./adapters.mjs";
import { validateAdapterPlan } from "./post-validation.mjs";
import { resolveManagedDestination } from "./destination-resolver.mjs";

import {
  executeManagedReplacementTransaction,
  executeReplacementTransaction,
} from "./orchestrator.mjs";

import {
  validateManagedWrite,
  validateManagedDocumentAdd,
} from "./validation-pipeline.mjs";

import {
  createAssetRegistrationPlan,
  createManagedImageAddRecord,
  createManagedDocumentAddRecord,
} from "./asset-registration.mjs";

import {
  addManagedImageRecord,
  removeManagedImageRecord,
} from "./managed-image-store.mjs";
import {
  addManagedDocumentRecord,
  removeManagedDocumentRecord,
} from "./managed-document-store.mjs";

import {
  executeManagedDocumentAddTransaction,
} from "./managed-document-add.mjs";

import {
  executeManagedImageAddWithR2Transaction,
  executeManagedImageAddTransaction,
} from "./orchestrator.mjs";

async function main() {
  const manifestArgument =
    process.argv
      .slice(2)
      .find(
        (argument) =>
          !argument.startsWith("--"),
      );

  if (!manifestArgument) {
    throw new Error(
      "Usage: node audit/amp/manager/cli.mjs <operation.json> [--apply]",
    );
  }

  const apply =
    process.argv.includes("--apply");

  const manifestPath =
    path.resolve(manifestArgument);

  const manifestSource =
    (
      await readFile(
        manifestPath,
        "utf8",
      )
    ).replace(/^\uFEFF/, "");

  const operation =
    JSON.parse(manifestSource);

  const plan =
    createManagementPlan(operation);

  const target =
    inspectManagementTarget(plan);

  const adapterPlan =
    buildAdapterPlan(
      plan,
      target,
    );

  const validation =
    await validateAdapterPlan(
      adapterPlan,
    );

  console.log("");
  console.log("Diya AMP Universal Manager");
  console.log("==========================");

  console.log(
    `Operation: ${plan.operation}`,
  );

  console.log(
    `Target:    ${plan.targetType}:${plan.targetId}`,
  );

  console.log(
    `Mode:      ${apply ? "APPLY REQUESTED" : "DRY RUN"}`,
  );

  console.log(
    `Adapter:   ${adapterPlan.adapter}`,
  );

  console.log(
    `R2 sync:   ${plan.syncR2 ? "requested" : "no"}`,
  );

  console.log(
    `Existing target: ${
      target.exists === null
        ? "external metadata target"
        : target.exists
          ? "yes"
          : "no"
    }`,
  );

  if (target.assetId) {
    console.log(
      `AMP Asset ID: ${target.assetId}`,
    );
  }

  if (adapterPlan.sourceFile) {
    console.log(
      `Source: ${adapterPlan.sourceFile}`,
    );
  }

  if (plan.publicationStatusChange) {
    console.log(
      `Publication status change explicitly requested: ${plan.requestedStatus}`,
    );
  } else {
    console.log(
      "Publication status change: none",
    );
  }

  console.log(
    `Source validation: ${
      validation.sourceValidated
        ? "passed"
        : "not required"
    }`,
  );

  console.log(
    `Derivative generation: ${
      validation.derivativeGenerationRequired
        ? "required"
        : "not required"
    }`,
  );

  console.log(
    `Registry compilation: ${
      validation.registryCompilationRequired
        ? "required"
        : "not required"
    }`,
  );

  console.log(
    `TypeScript check: ${
      validation.typeScriptCheckRequired
        ? "required"
        : "not required"
    }`,
  );

  if (!apply) {
    console.log("");
    console.log(
      "Adapter planning and validation succeeded. No managed content was modified.",
    );
    return;
  }

  if (
    plan.operation === "add" &&
    plan.targetType === "image"
  ) {
    if (target.exists) {
      throw new Error(
        "Image ADD requires a target that does not already exist.",
      );
    }

    const registration =
      createAssetRegistrationPlan(plan);

    const record =
      createManagedImageAddRecord(
        registration,
        plan.manifest,
      );

    console.log(
      `New AMP Asset ID: ${record.id}`,
    );

    console.log(
      `Destination: ${registration.destinationFile}`,
    );

    console.log(
      `R2 object: ${record.source.key}`,
    );

    console.log(
      `R2 MIME:   ${record.source.mimeType}`,
    );

    console.log(
      "Transactional image ADD: STARTING",
    );

    let result;

    const common = {
      operationId:
        plan.operationId,

      sourceFile:
        registration.sourceFile,

      destinationFile:
        registration.destinationFile,

      record,

      registerRecord:
        addManagedImageRecord,

      removeRecord:
        removeManagedImageRecord,

      validateLocal: async () => {
        await validateManagedWrite(
          adapterPlan,
        );
      },
    };

    if (plan.syncR2) {
      result =
        await executeManagedImageAddWithR2Transaction({
          ...common,
          r2: {
            objectKey:
              record.source.key,
          },
        });
    } else {
      result =
        await executeManagedImageAddTransaction(
          common,
        );
    }

    if (
      !result.committed ||
      result.rolledBack
    ) {
      throw new Error(
        "Managed image ADD did not commit successfully.",
      );
    }

    console.log(
      "Transactional image ADD: COMMITTED",
    );

    console.log(
      "Post-write validation: PASSED",
    );

    console.log(
      `R2 synchronization: ${
        plan.syncR2
          ? "COMMITTED + VERIFIED"
          : "NOT REQUESTED"
      }`,
    );

    console.log("");
    console.log(
      "Managed image ADD completed successfully.",
    );

    return;
  }

  if (
    plan.operation === "add" &&
    plan.targetType === "document"
  ) {
    if (target.exists) {
      throw new Error(
        "Document ADD requires a target that does not already exist.",
      );
    }

    const registration =
      createAssetRegistrationPlan(plan);

    const record =
      createManagedDocumentAddRecord(
        registration,
        plan.manifest,
      );

    const publicRoot =
      path.resolve("public", "assets");

    const thumbnailFile =
      path.resolve(
        publicRoot,
        record.derivatives.thumbnail.key,
      );

    const previewFile =
      path.resolve(
        publicRoot,
        record.derivatives.preview.key,
      );

    console.log(
      `New AMP Asset ID: ${record.id}`,
    );

    console.log(
      `Destination: ${registration.destinationFile}`,
    );

    console.log(
      `Thumbnail:   ${thumbnailFile}`,
    );

    console.log(
      `Preview:     ${previewFile}`,
    );

    console.log(
      `R2 object:   ${record.source.key}`,
    );

    console.log(
      "R2 MIME:     application/pdf",
    );

    console.log(
      "Transactional document ADD: STARTING",
    );

    const result =
      await executeManagedDocumentAddTransaction({
        sourceFile:
          registration.sourceFile,

        destinationFile:
          registration.destinationFile,

        thumbnailFile,
        previewFile,

        record,

        registerRecord:
          addManagedDocumentRecord,

        removeRecord:
          removeManagedDocumentRecord,

        validateLocal: async () => {
          await validateManagedDocumentAdd();
        },

        r2:
          plan.syncR2
            ? {
                objectKey:
                  record.source.key,
              }
            : null,
      });

    if (
      !result.committed ||
      result.rolledBack
    ) {
      throw new Error(
        "Managed document ADD did not commit successfully.",
      );
    }

    console.log(
      "Transactional document ADD: COMMITTED",
    );

    console.log(
      "PDF derivative generation: PASSED",
    );

    console.log(
      "Post-write validation: PASSED",
    );

    console.log(
      `R2 synchronization: ${
        plan.syncR2
          ? "COMMITTED + VERIFIED"
          : "NOT REQUESTED"
      }`,
    );

    console.log("");

    console.log(
      "Managed document ADD completed successfully.",
    );

    return;
  }

  if (
    plan.operation !== "replace" ||
    !["image", "document"].includes(
      plan.targetType,
    )
  ) {
    throw new Error(
      `Apply is not yet enabled for ${plan.operation} ${plan.targetType}. Image/PDF ADD plus existing image/document replacement are the only unlocked mutations.`,
    );
  }

  if (
    !target.exists ||
    !target.record
  ) {
    throw new Error(
      "Replacement requires an existing authoritative AMP target.",
    );
  }

  const destination =
    resolveManagedDestination(target);

  console.log(
    `Destination: ${destination.destinationFile}`,
  );

  console.log(
    "Transactional replacement: STARTING",
  );

  let result;

  if (plan.syncR2) {
    const objectKey =
      target.record.source?.key;

    const mimeType =
      target.record.source?.mimeType;

    if (
      !objectKey ||
      typeof objectKey !== "string"
    ) {
      throw new Error(
        "R2 synchronization requires an authoritative source.key.",
      );
    }

    if (
      !mimeType ||
      typeof mimeType !== "string"
    ) {
      throw new Error(
        "R2 synchronization requires an authoritative source.mimeType.",
      );
    }

    console.log(
      `R2 object: ${objectKey}`,
    );

    console.log(
      `R2 MIME:   ${mimeType}`,
    );

    result =
      await executeManagedReplacementTransaction({
        operationId:
          plan.operationId,

        sourceFile:
          adapterPlan.sourceFile,

        destinationFile:
          destination.destinationFile,

        validateLocal: async () => {
          await validateManagedWrite(
            adapterPlan,
          );
        },

        r2: {
          objectKey,
          contentType: mimeType,
        },
      });
  } else {
    result =
      await executeReplacementTransaction({
        operationId:
          plan.operationId,

        sourceFile:
          adapterPlan.sourceFile,

        destinationFile:
          destination.destinationFile,

        validate: async () => {
          await validateManagedWrite(
            adapterPlan,
          );
        },
      });
  }

  if (
    !result.committed ||
    result.rolledBack
  ) {
    throw new Error(
      "Replacement transaction did not commit successfully.",
    );
  }

  console.log(
    "Transactional replacement: COMMITTED",
  );

  console.log(
    "Post-write validation: PASSED",
  );

  console.log(
    `R2 synchronization: ${
      plan.syncR2
        ? "COMMITTED + VERIFIED"
        : "NOT REQUESTED"
    }`,
  );

  console.log("");
  console.log(
    "Managed replacement completed successfully.",
  );
}

main().catch((error) => {
  console.error("");
  console.error(
    "Universal Manager failed.",
  );

  console.error(
    error instanceof Error
      ? error.message
      : String(error),
  );

  process.exitCode = 1;
});

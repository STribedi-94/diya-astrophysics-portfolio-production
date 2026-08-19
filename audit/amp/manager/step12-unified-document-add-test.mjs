import { rm, stat } from "node:fs/promises";
import path from "node:path";
import { addManagedDocumentRecord, removeManagedDocumentRecord } from "./managed-document-store.mjs";
import { executeManagedDocumentAddTransaction } from "./managed-document-add.mjs";
import { validateManagedDocumentAdd } from "./validation-pipeline.mjs";
import { cleanupR2Snapshot, createR2Snapshot, deleteR2Object } from "./r2-sync.mjs";

const sourceFile = path.resolve(
  "public/assets/documents/cv/diya-ram-cv.pdf",
);

const destinationFile = path.resolve(
  "public/assets/documents/__qa/step12f-unified-add.pdf",
);

const thumbnailFile = path.resolve(
  "public/assets/thumbnails/__qa/step12f-unified-add.webp",
);

const previewFile = path.resolve(
  "public/assets/previews/__qa/step12f-unified-add.jpg",
);

const objectKey =
  "__qa/universal-manager-step12f-unified-document-add.pdf";

const record = {
  id: "document-managed-step12f-qa",
  type: "document",
  category: "managed-document",
  status: "active",
  source: {
    key: "documents/__qa/step12f-unified-add.pdf",
    fileName: "step12f-unified-add.pdf",
    mimeType: "application/pdf",
  },
  derivatives: {
    thumbnail: {
      key: "thumbnails/__qa/step12f-unified-add.webp",
    },
    preview: {
      key: "previews/__qa/step12f-unified-add.jpg",
    },
  },
  website: {
    recordId: "step12f-unified-document-qa",
    access: "preview-download",
    downloadName: "step12f-unified-add.pdf",
  },
  metadata: {
    groupId: "manager-added",
    recordKind: "qa",
    authorship: null,
  },
  processing: {
    processor: "document",
    sourceBaseName: "step12f-unified-add",
  },
  cloud: {},
  relationships: {
    publicationId: null,
  },
};

async function exists(filePath) {
  try {
    await stat(filePath);
    return true;
  } catch (error) {
    if (error?.code === "ENOENT") return false;
    throw error;
  }
}

async function main() {
  for (const filePath of [
    destinationFile,
    thumbnailFile,
    previewFile,
  ]) {
    await rm(filePath, { force: true });
  }

  await removeManagedDocumentRecord(record.id);

  console.log("");
  console.log("Diya Universal Manager - Step 12F");
  console.log("=================================");

  const result =
    await executeManagedDocumentAddTransaction({
      sourceFile,
      destinationFile,
      thumbnailFile,
      previewFile,
      record,
      registerRecord: addManagedDocumentRecord,
      removeRecord: removeManagedDocumentRecord,
      validateLocal: validateManagedDocumentAdd,
      r2: { objectKey },
    });

  if (!result.committed || result.rolledBack) {
    throw new Error(
      "Unified document ADD did not commit.",
    );
  }

  if (
    !(await exists(destinationFile)) ||
    !(await exists(thumbnailFile)) ||
    !(await exists(previewFile))
  ) {
    throw new Error(
      "Unified document ADD did not create all local outputs.",
    );
  }

  const snapshot =
    await createR2Snapshot({ objectKey });

  try {
    const localInfo = await stat(destinationFile);

    if (snapshot.size !== localInfo.size) {
      throw new Error(
        "Unified document ADD R2 size mismatch.",
      );
    }
  } finally {
    await cleanupR2Snapshot(snapshot);
  }

  console.log("Unified PDF local creation: PASS");
  console.log("Unified PDF targeted derivatives: PASS");
  console.log("Unified PDF authoritative registration: PASS");
  console.log("Unified PDF registry + TypeScript validation: PASS");
  console.log("Unified PDF R2 creation + verification: PASS");

  await deleteR2Object({ objectKey });
  await removeManagedDocumentRecord(record.id);
  await rm(previewFile, { force: true });
  await rm(thumbnailFile, { force: true });
  await rm(destinationFile, { force: true });

  await validateManagedDocumentAdd();

  console.log("Disposable unified PDF cleanup: PASS");
  console.log("Production document registry restoration: PASS");
}

main().catch((error) => {
  console.error(
    error instanceof Error ? error.stack : String(error),
  );
  process.exitCode = 1;
});

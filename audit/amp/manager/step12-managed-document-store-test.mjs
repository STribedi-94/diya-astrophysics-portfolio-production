import {
  addManagedDocumentRecord,
  removeManagedDocumentRecord,
} from "./managed-document-store.mjs";

const qaRecord = {
  id: "document-managed-step12-qa",
  type: "document",
  category: "first-author",
  status: "active",

  source: {
    key: "documents/first-author/step12-qa.pdf",
    fileName: "step12-qa.pdf",
    mimeType: "application/pdf",
  },

  derivatives: {
    thumbnail: {
      key: "thumbnails/first-author/step12-qa.webp",
    },
    preview: {
      key: "previews/first-author/step12-qa.jpg",
    },
  },

  website: {
    recordId: "step12-qa",
    access: "preview-download",
    downloadName: "step12-qa.pdf",
  },

  metadata: {},

  processing: {
    processor: "document",
    profile: "managed-pdf",
  },

  cloud: {},

  relationships: {
    publicationId: "step12-qa-publication",
  },
};

const added =
  await addManagedDocumentRecord(qaRecord);

if (!added.added) {
  throw new Error(
    "Managed PDF disposable ADD did not commit.",
  );
}

let duplicateRejected = false;

try {
  await addManagedDocumentRecord(qaRecord);
} catch {
  duplicateRejected = true;
}

if (!duplicateRejected) {
  throw new Error(
    "Duplicate managed PDF record was not rejected.",
  );
}

const removed =
  await removeManagedDocumentRecord(
    qaRecord.id,
  );

if (!removed.removed) {
  throw new Error(
    "Managed PDF disposable cleanup failed.",
  );
}

console.log(
  "Managed PDF record ADD: PASS",
);
console.log(
  "Duplicate managed PDF rejection: PASS",
);
console.log(
  "Managed PDF record removal: PASS",
);

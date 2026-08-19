import { mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { createAssetRecord } from "../contracts/asset-record.mjs";
import { addManagedImageRecord, removeManagedImageRecord } from "./managed-image-store.mjs";

async function main() {
  const root = await mkdtemp(path.join(os.tmpdir(), "diya-step11-store-"));
  const storeFile = path.join(root, "manager-added-records.json");
  await writeFile(storeFile, "[]\n", "utf8");

  const record = Object.assign(createAssetRecord(), {
    id: "image-managed-step11-qa",
    type: "image",
    category: "managed-visual",
    status: "active",
    source: {
      key: "images/qa/step11-qa.png",
      fileName: "step11-qa.png",
      mimeType: "image/png",
    },
    derivatives: {},
    website: { recordId: "step11-qa" },
    metadata: { role: "qa" },
    processing: { processor: "image", profile: "managed-original" },
    cloud: {},
    relationships: {},
  });

  const added = await addManagedImageRecord(record, { storeFile });
  if (!added.added || added.count !== 1) throw new Error("ADD test failed.");

  let duplicateRejected = false;
  try {
    await addManagedImageRecord(record, { storeFile });
  } catch {
    duplicateRejected = true;
  }
  if (!duplicateRejected) throw new Error("Duplicate rejection failed.");

  const removed = await removeManagedImageRecord(record.id, { storeFile });
  if (!removed.removed || removed.count !== 0) throw new Error("REMOVE test failed.");

  const finalRecords = JSON.parse(await readFile(storeFile, "utf8"));
  if (finalRecords.length !== 0) throw new Error("Sandbox store did not return to empty.");

  await rm(root, { recursive: true, force: true });

  console.log("Managed image ADD store: PASS");
  console.log("Duplicate rejection: PASS");
  console.log("Managed image REMOVE rollback primitive: PASS");
  console.log("Sandbox cleanup: PASS");
}

main().catch((error) => {
  console.error(error instanceof Error ? error.stack : String(error));
  process.exitCode = 1;
});

import { mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { updatePublicationMetadata } from "./publication-writer.mjs";
import { createAssetRegistrationPlan } from "./asset-registration.mjs";

async function main() {
  const root = await mkdtemp(path.join(os.tmpdir(), "diya-manager-step8-"));
  const publicationFile = path.join(root, "publications.ts");
  const original = `export const records = [
  {
    id: "test-paper",
    status: "Accepted",
    doi: "",
    journal: "Test Journal",
    volume: "",
    pages: "",
    year: 2026,
  },
];
`;
  await writeFile(publicationFile, original, "utf8");
  const block = [
    '  {',
    '    id: "test-paper",',
    '    status: "Accepted",',
    '    doi: "",',
    '    journal: "Test Journal",',
    '    volume: "",',
    '    pages: "",',
    '    year: 2026,',
    '  },',
  ].join("\n");

  await updatePublicationMetadata({ publicationId:"test-paper", filePath:publicationFile, block }, { doi:"10.1234/example", status:"Published" });
  const updated = await readFile(publicationFile, "utf8");
  if (!updated.includes('doi: "10.1234/example",')) throw new Error("DOI update test failed.");
  if (!updated.includes('status: "Published",')) throw new Error("Status update test failed.");
  if (!updated.includes('journal: "Test Journal",')) throw new Error("Unrequested metadata changed.");
  console.log("Publication explicit-field writer: PASS");
  console.log("Unrequested-field preservation: PASS");

  let rejection = false;
  try { await updatePublicationMetadata({ publicationId:"test-paper", filePath:publicationFile, block:updated.slice(updated.indexOf("  {"), updated.indexOf("  },") + 4) }, { title:"Forbidden" }); } catch { rejection = true; }
  if (!rejection) throw new Error("Unsupported publication field was not rejected.");
  console.log("Unsupported-field rejection: PASS");

  const plan = { operation:"add", targetType:"image", targetId:"future-test-image", manifest:{ source:{ file:"incoming/future-test-image.png", key:"images/future/future-test-image.png" } } };
  const registration = createAssetRegistrationPlan(plan);
  if (registration.assetId !== "image-managed-future-test-image") throw new Error("Asset ID planning failed.");
  if (registration.sourceKey !== "images/future/future-test-image.png") throw new Error("Source-key planning failed.");
  console.log("New-asset registration planning: PASS");
  console.log("Stable managed Asset ID planning: PASS");

  await rm(root, { recursive:true, force:true });
  console.log("Temporary sandbox cleanup: PASS");
}

main().catch((error) => { console.error(error instanceof Error ? error.stack : String(error)); process.exitCode=1; });

import { discoverAssetTarget } from "./target-discovery.mjs";
import { describeR2Sync } from "./r2-sync.mjs";

const publication = discoverAssetTarget("publication", "gj398");
if (!publication.exists) throw new Error("GJ 398 publication discovery failed.");
if (!publication.record.block.includes('status: "Accepted"')) throw new Error("GJ 398 accepted status not found in discovered block.");
if (!publication.record.block.includes('doi: ""')) throw new Error("GJ 398 blank DOI state not found.");
console.log(`Publication discovery: PASS (${publication.targetId})`);
console.log(`Publication lines: ${publication.record.startLine}-${publication.record.endLine}`);

const image = discoverAssetTarget("image", "thesis-m-dwarf-magnetic-activity");
if (!image.exists) throw new Error("Thesis image discovery failed.");
const sync = describeR2Sync("public/assets/images/thesis/diya-thesis-m-dwarf-magnetic-activity-visual.png", image.record.source.key);
console.log(`R2 bucket: ${sync.bucket}`);
console.log(`R2 key: ${sync.objectKey}`);
console.log(`Content type: ${sync.contentType}`);
console.log("Targeted R2 planning: PASS");
console.log("R2 mutation during test: NONE");

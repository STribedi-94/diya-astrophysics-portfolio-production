import { imageRecords } from "../images/index.mjs";
import { discoverAssetTarget } from "./target-discovery.mjs";
import { resolveManagedDestination } from "./destination-resolver.mjs";

const target = discoverAssetTarget("image", "thesis-m-dwarf-magnetic-activity");

if (!target.exists) {
  throw new Error("Canonical thesis image was not discovered.");
}

const resolved = resolveManagedDestination(target);
const expectedRecord = imageRecords.find((record) =>
  record.website?.recordId === "thesis-m-dwarf-magnetic-activity"
);

if (!expectedRecord) {
  throw new Error("Expected thesis AMP record is missing.");
}

if (resolved.sourceKey !== expectedRecord.source.key) {
  throw new Error("Resolved source key does not match authoritative AMP record.");
}

console.log(`Asset ID:    ${resolved.assetId}`);
console.log(`R2/source:   ${resolved.sourceKey}`);
console.log(`Destination: ${resolved.destinationFile}`);
console.log("Destination resolution: PASS");

import { readFileSync } from "node:fs";
import path from "node:path";

const PUBLICATION_FILE = path.resolve("src/data/publications-archive.ts");

export function findPublicationTarget(publicationId) {
  const source = readFileSync(PUBLICATION_FILE, "utf8").replace(/^\uFEFF/, "");
  const lines = source.split(/\r?\n/);
  const idLine = `id: ${JSON.stringify(publicationId)},`;
  const matches = lines.map((line, index) => ({ line, index })).filter(({ line }) => line.trim() === idLine);

  if (matches.length === 0) {
    return { exists: false, targetType: "publication", targetId: publicationId, assetId: null, record: null };
  }

  if (matches.length !== 1) {
    throw new Error(`Duplicate publication ID detected: ${publicationId}`);
  }

  const idIndex = matches[0].index;
  let start = -1;
  let end = -1;

  for (let index = idIndex; index >= 0; index -= 1) {
    if (/^  \{\s*$/.test(lines[index])) { start = index; break; }
  }

  for (let index = idIndex; index < lines.length; index += 1) {
    if (/^  \},?\s*$/.test(lines[index])) { end = index; break; }
  }

  if (start < 0 || end < 0 || end <= start) {
    throw new Error(`Could not determine publication block boundaries for ${publicationId}`);
  }

  return {
    exists: true,
    targetType: "publication",
    targetId: publicationId,
    assetId: null,
    record: {
      publicationId,
      filePath: PUBLICATION_FILE,
      startLine: start + 1,
      endLine: end + 1,
      block: lines.slice(start, end + 1).join("\n"),
    },
  };
}

import { readdir } from "node:fs/promises";
import path from "node:path";

export async function findPdfFiles(directory) {
  const entries = await readdir(directory, { withFileTypes: true });

  return entries
    .filter(
      (entry) => entry.isFile() && path.extname(entry.name).toLowerCase() === ".pdf"
    )
    .map((entry) => path.join(directory, entry.name))
    .sort();
}
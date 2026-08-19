import { copyFile, mkdir } from "node:fs/promises";
import path from "node:path";

export async function writeReplacementFile(sourceFile, destinationFile) {
  const source = path.resolve(sourceFile);
  const destination = path.resolve(destinationFile);

  if (source === destination) {
    throw new Error("Replacement source and destination must be different files.");
  }

  await mkdir(path.dirname(destination), { recursive: true });
  await copyFile(source, destination);

  return Object.freeze({
    source,
    destination,
    written: true,
  });
}

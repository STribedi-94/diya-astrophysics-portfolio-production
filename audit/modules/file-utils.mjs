import { copyFile, mkdir, stat } from "node:fs/promises";
import path from "node:path";

/**
 * Returns true when a file or folder exists.
 */
export async function pathExists(targetPath) {
  try {
    await stat(targetPath);
    return true;
  } catch (error) {
    if (error?.code === "ENOENT") {
      return false;
    }

    throw error;
  }
}

/**
 * Creates a folder and any missing parent folders.
 */
export async function ensureDirectory(directoryPath) {
  await mkdir(directoryPath, { recursive: true });
}

/**
 * Safely copies one file and creates the destination folder when required.
 */
export async function copyFileSafe(sourcePath, destinationPath) {
  const sourceExists = await pathExists(sourcePath);

  if (!sourceExists) {
    throw new Error(`Source file does not exist: ${sourcePath}`);
  }

  await ensureDirectory(path.dirname(destinationPath));
  await copyFile(sourcePath, destinationPath);

  return {
    sourcePath,
    destinationPath,
  };
}
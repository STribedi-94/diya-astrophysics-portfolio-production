import { access, mkdir, stat, writeFile } from "node:fs/promises";
import path from "node:path";
import { constants as fsConstants } from "node:fs";
import { DOCUMENT_CONFIG } from "./document-config.mjs";

async function fileExists(filePath) {
  try {
    await access(filePath, fsConstants.F_OK);
    return true;
  } catch {
    return false;
  }
}

async function writeOutput(filePath, imageOutput, overwrite) {
  const exists = await fileExists(filePath);

  if (exists && !overwrite) {
    const existingStats = await stat(filePath);

    return {
      status: "skipped",
      path: filePath,
      byteLength: existingStats.size,
    };
  }

  await mkdir(path.dirname(filePath), { recursive: true });
  await writeFile(filePath, imageOutput.buffer);

  const writtenStats = await stat(filePath);

  if (writtenStats.size < 1) {
    throw new Error(`Generated output is empty: ${filePath}`);
  }

  return {
    status: exists ? "overwritten" : "created",
    path: filePath,
    byteLength: writtenStats.size,
  };
}

export async function writeDocumentImages(
  job,
  images,
  options = {}
) {
  if (!job?.thumbnailPath || !job?.previewPath) {
    throw new TypeError(
      "A document job with thumbnail and preview paths is required."
    );
  }

  if (!images?.thumbnail?.buffer || !images?.preview?.buffer) {
    throw new TypeError(
      "Generated thumbnail and preview image buffers are required."
    );
  }

  const overwrite =
    options.overwrite ?? DOCUMENT_CONFIG.overwrite;

  if (typeof overwrite !== "boolean") {
    throw new TypeError(
      `Invalid overwrite option: ${overwrite}`
    );
  }

  const [thumbnail, preview] = await Promise.all([
    writeOutput(
      job.thumbnailPath,
      images.thumbnail,
      overwrite
    ),
    writeOutput(
      job.previewPath,
      images.preview,
      overwrite
    ),
  ]);

  return {
    thumbnail,
    preview,
  };
}
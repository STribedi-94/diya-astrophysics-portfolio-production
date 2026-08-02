import { access, stat } from "node:fs/promises";
import { constants as fsConstants } from "node:fs";

async function validateFile(filePath) {
  await access(filePath, fsConstants.F_OK);

  const info = await stat(filePath);

  if (!info.isFile()) {
    throw new Error(`${filePath} is not a file.`);
  }

  if (info.size < 1) {
    throw new Error(`${filePath} is empty.`);
  }

  return {
    path: filePath,
    byteLength: info.size,
  };
}

export async function validateDocumentOutputs(job) {
  const [thumbnail, preview] = await Promise.all([
    validateFile(job.thumbnailPath),
    validateFile(job.previewPath),
  ]);

  return {
    thumbnail,
    preview,
    valid: true,
  };
}
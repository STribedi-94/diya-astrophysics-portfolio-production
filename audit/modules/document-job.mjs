import path from "node:path";
import {
  getThumbnailName,
  getPreviewName,
  getThumbnailKey,
  getPreviewKey,
} from "./document-utils.mjs";

export function createDocumentJob(category, pdfPath, thumbnailDirectory, previewDirectory) {
  const baseName = path.basename(pdfPath, path.extname(pdfPath));

  return {
    category,
    baseName,

    pdfPath,

    thumbnailPath: path.join(
      thumbnailDirectory,
      getThumbnailName(pdfPath)
    ),

    previewPath: path.join(
      previewDirectory,
      getPreviewName(pdfPath)
    ),

    thumbnailKey: getThumbnailKey(category, pdfPath),

    previewKey: getPreviewKey(category, pdfPath),
  };
}
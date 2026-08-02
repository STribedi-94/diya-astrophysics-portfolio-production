import path from "node:path";
import { DOCUMENT_CONFIG } from "./document-config.mjs";

export function getThumbnailName(pdfPath) {
  return (
    path.basename(pdfPath, path.extname(pdfPath)) +
    DOCUMENT_CONFIG.thumbnail.extension
  );
}

export function getPreviewName(pdfPath) {
  return (
    path.basename(pdfPath, path.extname(pdfPath)) +
    DOCUMENT_CONFIG.preview.extension
  );
}

export function getThumbnailKey(category, pdfPath) {
  return `thumbnails/${category}/${getThumbnailName(pdfPath)}`;
}

export function getPreviewKey(category, pdfPath) {
  return `previews/${category}/${getPreviewName(pdfPath)}`;
}
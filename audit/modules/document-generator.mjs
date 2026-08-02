import path from "node:path";
import { findPdfFiles } from "./document-scanner.mjs";
import { createDocumentJob } from "./document-job.mjs";
import { renderPdfPage } from "./document-renderer.mjs";
import { createDocumentImages } from "./document-image.mjs";
import { writeDocumentImages } from "./document-writer.mjs";
import { validateDocumentOutputs } from "./document-validator.mjs";
import { DOCUMENT_CONFIG } from "./document-config.mjs";

export async function generateDocuments({
  category,
  documentDirectory,
  thumbnailDirectory,
  previewDirectory,
  overwrite = DOCUMENT_CONFIG.overwrite,
}) {
  if (
    !category ||
    !documentDirectory ||
    !thumbnailDirectory ||
    !previewDirectory
  ) {
    throw new TypeError(
      "Category and all document output directories are required."
    );
  }

  const pdfFiles = await findPdfFiles(documentDirectory);
  const results = [];

  for (const pdfPath of pdfFiles) {
    const job = createDocumentJob(
      category,
      pdfPath,
      thumbnailDirectory,
      previewDirectory
    );

    try {
      const renderedPage = await renderPdfPage(pdfPath, {
       pageNumber: DOCUMENT_CONFIG.thumbnail.page,
       mode: "thumbnail",
       targetWidth: DOCUMENT_CONFIG.thumbnail.width,
       renderScale: DOCUMENT_CONFIG.thumbnail.renderScale,
     });

      const images = await createDocumentImages(renderedPage);

      const writeResult = await writeDocumentImages(job, images, {
        overwrite,
      });

      const validation = await validateDocumentOutputs(job);

      results.push({
        status: "success",
        job,
        source: images.source,
        images: {
          thumbnail: {
            width: images.thumbnail.width,
            height: images.thumbnail.height,
            byteLength: images.thumbnail.byteLength,
          },
          preview: {
            width: images.preview.width,
            height: images.preview.height,
            byteLength: images.preview.byteLength,
          },
        },
        writeResult,
        validation,
      });
    } catch (error) {
      results.push({
        status: "failed",
        job,
        error:
          error instanceof Error
            ? error.message
            : String(error),
      });
    }
  }

  return {
    category,
    directory: path.resolve(documentDirectory),
    discovered: pdfFiles.length,
    succeeded: results.filter(
      (result) => result.status === "success"
    ).length,
    failed: results.filter(
      (result) => result.status === "failed"
    ).length,
    results,
  };
}
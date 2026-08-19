import { rm, stat } from "node:fs/promises";
import { renderPdfPage } from "../../modules/document-renderer.mjs";
import { createDocumentImages } from "../../modules/document-image.mjs";
import { writeDocumentImages } from "../../modules/document-writer.mjs";
import { validateDocumentOutputs } from "../../modules/document-validator.mjs";
import { DOCUMENT_CONFIG } from "../../modules/document-config.mjs";

async function exists(filePath) {
  try {
    await stat(filePath);
    return true;
  } catch (error) {
    if (error?.code === "ENOENT") return false;
    throw error;
  }
}

export async function generateManagedDocumentDerivatives({
  pdfFile,
  thumbnailFile,
  previewFile,
  validate,
}) {
  if (!pdfFile || !thumbnailFile || !previewFile) {
    throw new Error(
      "Targeted document derivative generation requires pdfFile, thumbnailFile and previewFile.",
    );
  }

  if (await exists(thumbnailFile)) {
    throw new Error(
      `Thumbnail ADD destination already exists: ${thumbnailFile}`,
    );
  }

  if (await exists(previewFile)) {
    throw new Error(
      `Preview ADD destination already exists: ${previewFile}`,
    );
  }

  let thumbnailCreated = false;
  let previewCreated = false;

  try {
    const renderedPage =
      await renderPdfPage(pdfFile, {
        pageNumber: DOCUMENT_CONFIG.thumbnail.page,
        mode: "thumbnail",
        targetWidth: DOCUMENT_CONFIG.thumbnail.width,
        renderScale: DOCUMENT_CONFIG.thumbnail.renderScale,
      });

    const images =
      await createDocumentImages(renderedPage);

    const job = {
      pdfPath: pdfFile,
      thumbnailPath: thumbnailFile,
      previewPath: previewFile,
    };

    const writeResult =
      await writeDocumentImages(job, images, {
        overwrite: false,
      });

    thumbnailCreated =
      writeResult.thumbnail.status === "created";

    previewCreated =
      writeResult.preview.status === "created";

    if (!thumbnailCreated || !previewCreated) {
      throw new Error(
        "Targeted derivative ADD did not create both outputs.",
      );
    }

    const validation =
      await validateDocumentOutputs(job);

    if (!validation.valid) {
      throw new Error(
        "Targeted document derivatives failed validation.",
      );
    }

    if (typeof validate === "function") {
      await validate({
        job,
        images,
        writeResult,
        validation,
      });
    }

    return Object.freeze({
      committed: true,
      rolledBack: false,
      thumbnailFile,
      previewFile,
      thumbnailBytes: validation.thumbnail.byteLength,
      previewBytes: validation.preview.byteLength,
    });
  } catch (error) {
    if (previewCreated) {
      await rm(previewFile, { force: true });
    }

    if (thumbnailCreated) {
      await rm(thumbnailFile, { force: true });
    }

    throw Object.assign(
      new Error(
        `Targeted document derivative generation failed and was rolled back: ${
          error instanceof Error
            ? error.message
            : String(error)
        }`,
      ),
      {
        rolledBack: true,
      },
    );
  }
}

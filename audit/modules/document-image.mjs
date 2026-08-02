import { createCanvas } from "@napi-rs/canvas";
import { DOCUMENT_CONFIG } from "./document-config.mjs";

function validateTargetWidth(width) {
  if (!Number.isInteger(width) || width < 1) {
    throw new TypeError(`Invalid output width: ${width}`);
  }
}

function validateQuality(quality) {
  if (!Number.isInteger(quality) || quality < 0 || quality > 100) {
    throw new TypeError(`Invalid image quality: ${quality}`);
  }
}

function resizeCanvas(sourceCanvas, targetWidth) {
  validateTargetWidth(targetWidth);

  const sourceWidth = sourceCanvas.width;
  const sourceHeight = sourceCanvas.height;

  if (sourceWidth < 1 || sourceHeight < 1) {
    throw new RangeError(
      `Invalid source canvas dimensions: ${sourceWidth} × ${sourceHeight}`
    );
  }

  const targetHeight = Math.max(
    1,
    Math.round((sourceHeight / sourceWidth) * targetWidth)
  );

  const outputCanvas = createCanvas(targetWidth, targetHeight);
  const context = outputCanvas.getContext("2d");

  context.save();
  context.fillStyle = "#ffffff";
  context.fillRect(0, 0, targetWidth, targetHeight);
  context.imageSmoothingEnabled = true;
  context.imageSmoothingQuality = "high";
  context.drawImage(
    sourceCanvas,
    0,
    0,
    sourceWidth,
    sourceHeight,
    0,
    0,
    targetWidth,
    targetHeight
  );
  context.restore();

  return outputCanvas;
}

async function createImageOutput(sourceCanvas, config) {
  validateQuality(config.quality);

  const canvas = resizeCanvas(sourceCanvas, config.width);
  const buffer = await canvas.encode(config.format, config.quality);

  if (!buffer || buffer.length === 0) {
    throw new Error(`Failed to encode ${config.format} image output.`);
  }

  return {
    buffer,
    format: config.format,
    extension: config.extension,
    width: canvas.width,
    height: canvas.height,
    byteLength: buffer.length,
  };
}

export async function createDocumentImages(renderedPage) {
  if (!renderedPage?.canvas) {
    throw new TypeError("A rendered PDF canvas is required.");
  }

  const [thumbnail, preview] = await Promise.all([
    createImageOutput(
      renderedPage.canvas,
      DOCUMENT_CONFIG.thumbnail
    ),
    createImageOutput(
      renderedPage.canvas,
      DOCUMENT_CONFIG.preview
    ),
  ]);

  return {
    thumbnail,
    preview,
    source: {
      width: renderedPage.width,
      height: renderedPage.height,
      pageNumber: renderedPage.pageNumber,
      pageCount: renderedPage.pageCount,
      dpi: renderedPage.dpi,
    },
  };
}
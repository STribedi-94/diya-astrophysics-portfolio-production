import { readFile } from "node:fs/promises";
import { createCanvas } from "@napi-rs/canvas";
import { getDocument } from "pdfjs-dist/legacy/build/pdf.mjs";

const PDF_POINTS_PER_INCH = 72;

function calculateRenderScale(dpi) {
  if (!Number.isFinite(dpi) || dpi <= 0) {
    throw new TypeError(`Invalid rendering DPI: ${dpi}`);
  }

  return dpi / PDF_POINTS_PER_INCH;
}

function calculateTargetWidthScale(page, targetWidth) {
  if (!Number.isInteger(targetWidth) || targetWidth < 1) {
    throw new TypeError(`Invalid target width: ${targetWidth}`);
  }

  const baseViewport = page.getViewport({ scale: 1 });

  if (baseViewport.width <= 0) {
    throw new RangeError(
      `Invalid PDF page width: ${baseViewport.width}`
    );
  }

  return targetWidth / baseViewport.width;
}

export async function renderPdfPage(pdfPath, options = {}) {
  const {
    pageNumber = 1,
    dpi,
    mode = "preview",
    targetWidth = null,
    renderScale = 1,
  } = options;

  if (!Number.isInteger(pageNumber) || pageNumber < 1) {
    throw new TypeError(`Invalid PDF page number: ${pageNumber}`);
  }

  if (mode !== "thumbnail" && mode !== "preview") {
    throw new TypeError(`Invalid render mode: ${mode}`);
  }

  if (mode === "thumbnail") {
    if (!Number.isInteger(targetWidth) || targetWidth < 1) {
      throw new TypeError(`Invalid target width: ${targetWidth}`);
    }

    if (!Number.isFinite(renderScale) || renderScale < 1) {
      throw new TypeError(`Invalid render scale: ${renderScale}`);
    }
  } else if (!Number.isFinite(dpi) || dpi <= 0) {
    throw new TypeError(`Invalid rendering DPI: ${dpi}`);
  }

  const pdfBuffer = await readFile(pdfPath);

  const loadingTask = getDocument({
    data: new Uint8Array(pdfBuffer),
    useSystemFonts: true,
    isEvalSupported: false,
  });

  let pdfDocument;

  try {
    pdfDocument = await loadingTask.promise;

    if (pageNumber > pdfDocument.numPages) {
      throw new RangeError(
        `Requested page ${pageNumber}, but the PDF has only ${pdfDocument.numPages} page(s).`
      );
    }

    const page = await pdfDocument.getPage(pageNumber);

    const effectiveTargetWidth =
      mode === "thumbnail"
        ? Math.round(targetWidth * renderScale)
        : targetWidth;

    const scale =
      mode === "thumbnail"
        ? calculateTargetWidthScale(page, effectiveTargetWidth)
        : calculateRenderScale(dpi);

    const viewport = page.getViewport({ scale });

    const width = Math.ceil(viewport.width);
    const height = Math.ceil(viewport.height);

    const canvas = createCanvas(width, height);
    const canvasContext = canvas.getContext("2d");

    canvasContext.save();
    canvasContext.fillStyle = "#ffffff";
    canvasContext.fillRect(0, 0, width, height);
    canvasContext.restore();

    const renderTask = page.render({
      canvas,
      canvasContext,
      viewport,
      intent: "display",
    });

    await renderTask.promise;
    page.cleanup();

    return {
      canvas,
      width,
      height,
      pageNumber,
      pageCount: pdfDocument.numPages,
      dpi: mode === "thumbnail" ? null : dpi,
      mode,
      targetWidth: mode === "thumbnail" ? targetWidth : null,
      renderScale: mode === "thumbnail" ? renderScale : null,
    };
  } finally {
    try {
      if (pdfDocument?.cleanup) {
        await pdfDocument.cleanup();
      }

      if (loadingTask?.destroy) {
        await loadingTask.destroy();
      }
    } catch {
      // Ignore cleanup errors.
    }
  }
}
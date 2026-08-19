import {
  cp,
  mkdtemp,
  rm,
  stat,
} from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { generateManagedDocumentDerivatives } from "./managed-document-derivatives.mjs";

async function exists(filePath) {
  try {
    await stat(filePath);
    return true;
  } catch (error) {
    if (error?.code === "ENOENT") return false;
    throw error;
  }
}

async function main() {
  const root =
    await mkdtemp(
      path.join(os.tmpdir(), "diya-step12e-"),
    );

  const source = path.resolve(
    "public/assets/documents/cv/diya-ram-cv.pdf",
  );

  const pdf = path.join(root, "qa-document.pdf");
  const thumbnail = path.join(root, "qa-document.webp");
  const preview = path.join(root, "qa-document.jpg");

  await cp(source, pdf);

  const success =
    await generateManagedDocumentDerivatives({
      pdfFile: pdf,
      thumbnailFile: thumbnail,
      previewFile: preview,
    });

  if (!success.committed || success.rolledBack) {
    throw new Error(
      "Successful targeted derivative transaction did not commit.",
    );
  }

  const thumbInfo = await stat(thumbnail);
  const previewInfo = await stat(preview);

  if (thumbInfo.size < 1 || previewInfo.size < 1) {
    throw new Error(
      "Generated derivative is empty.",
    );
  }

  console.log("Targeted thumbnail generation: PASS");
  console.log("Targeted preview generation: PASS");
  console.log("Targeted derivative validation: PASS");

  await rm(thumbnail, { force: true });
  await rm(preview, { force: true });

  let rollbackObserved = false;

  try {
    await generateManagedDocumentDerivatives({
      pdfFile: pdf,
      thumbnailFile: thumbnail,
      previewFile: preview,
      validate: async () => {
        throw new Error(
          "INTENTIONAL STEP 12E POST-GENERATION FAILURE",
        );
      },
    });
  } catch (error) {
    rollbackObserved = error?.rolledBack === true;
    if (!rollbackObserved) throw error;
  }

  if (!rollbackObserved) {
    throw new Error(
      "Intentional derivative rollback was not observed.",
    );
  }

  if (await exists(thumbnail)) {
    throw new Error(
      "Rollback left thumbnail behind.",
    );
  }

  if (await exists(preview)) {
    throw new Error(
      "Rollback left preview behind.",
    );
  }

  console.log("Intentional derivative failure observed: PASS");
  console.log("Thumbnail rollback deletion: PASS");
  console.log("Preview rollback deletion: PASS");

  await rm(root, { recursive: true, force: true });

  console.log("Disposable QA cleanup: PASS");
}

main().catch((error) => {
  console.error(
    error instanceof Error ? error.stack : String(error),
  );
  process.exitCode = 1;
});

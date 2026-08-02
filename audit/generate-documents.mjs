import path from "node:path";
import { PATHS } from "./modules/paths.mjs";
import { generateDocuments } from "./modules/document-generator.mjs";

const DOCUMENT_GROUPS = [
  {
    label: "CV",
    category: "cv",
    documentDirectory: path.join(PATHS.documents, "cv"),
    thumbnailDirectory: path.join(PATHS.thumbnails, "cv"),
    previewDirectory: path.join(PATHS.previews, "cv"),
  },
  {
    label: "Thesis",
    category: "thesis",
    documentDirectory: path.join(PATHS.documents, "thesis"),
    thumbnailDirectory: path.join(PATHS.thumbnails, "thesis"),
    previewDirectory: path.join(PATHS.previews, "thesis"),
  },
  {
    label: "First-author Papers",
    category: "first-author",
    documentDirectory: path.join(PATHS.documents, "first-author"),
    thumbnailDirectory: path.join(PATHS.thumbnails, "first-author"),
    previewDirectory: path.join(PATHS.previews, "first-author"),
  },
  {
    label: "Collaborative Papers",
    category: "collaborative",
    documentDirectory: path.join(PATHS.documents, "collaborative"),
    thumbnailDirectory: path.join(PATHS.thumbnails, "collaborative"),
    previewDirectory: path.join(PATHS.previews, "collaborative"),
  },
  {
    label: "Collaborative Proceedings",
    category: "proceedings",
    documentDirectory: path.join(
      PATHS.documents,
      "proceedings",
      "collaborative"
    ),
    thumbnailDirectory: path.join(PATHS.thumbnails, "proceedings"),
    previewDirectory: path.join(PATHS.previews, "proceedings"),
  },
  {
    label: "First-author Proceedings",
    category: "proceedings",
    documentDirectory: path.join(
      PATHS.documents,
      "proceedings",
      "first-author"
    ),
    thumbnailDirectory: path.join(PATHS.thumbnails, "proceedings"),
    previewDirectory: path.join(PATHS.previews, "proceedings"),
  },
];

function printReport(group, report) {
  console.log(`\n${group.label}`);
  console.log("-".repeat(group.label.length));
  console.log(`PDFs discovered: ${report.discovered}`);
  console.log(`Succeeded:       ${report.succeeded}`);
  console.log(`Failed:          ${report.failed}`);

  if (report.discovered === 0) {
    console.log("No PDF files found in this category.");
    return;
  }

  for (const result of report.results) {
    console.log(`\n${result.job.baseName}`);

    if (result.status === "failed") {
      console.error("  Status: failed");
      console.error(`  Error:  ${result.error}`);
      continue;
    }

    console.log("  Status:    success");
    console.log(`  Thumbnail: ${result.job.thumbnailPath}`);
    console.log(`  Preview:   ${result.job.previewPath}`);
    console.log(
      `  Page:      ${result.source.pageNumber}/${result.source.pageCount}`
    );

    console.log(
      `  Thumbnail size: ${result.images.thumbnail.width} × ${result.images.thumbnail.height}`
    );

    console.log(
      `  Preview size:   ${result.images.preview.width} × ${result.images.preview.height}`
    );

    console.log(
      `  Thumbnail write: ${result.writeResult.thumbnail.status}`
    );

    console.log(
      `  Preview write:   ${result.writeResult.preview.status}`
    );
  }
}

async function main() {
  const force = process.argv.includes("--force");

  const totals = {
    discovered: 0,
    succeeded: 0,
    failed: 0,
  };

  console.log("\nDocument Asset Engine");
  console.log("=====================");
  console.log(`Overwrite existing outputs: ${force ? "yes" : "no"}`);

  for (const group of DOCUMENT_GROUPS) {
    try {
      const report = await generateDocuments({
        category: group.category,
        documentDirectory: group.documentDirectory,
        thumbnailDirectory: group.thumbnailDirectory,
        previewDirectory: group.previewDirectory,
        overwrite: force,
      });

      totals.discovered += report.discovered;
      totals.succeeded += report.succeeded;
      totals.failed += report.failed;

      printReport(group, report);
    } catch (error) {
      totals.failed += 1;

      console.error(`\n${group.label}`);
      console.error("-".repeat(group.label.length));
      console.error("Category processing failed.");
      console.error(
        error instanceof Error ? error.message : String(error)
      );
    }
  }

  console.log("\nOverall Summary");
  console.log("===============");
  console.log(`PDFs discovered: ${totals.discovered}`);
  console.log(`Succeeded:       ${totals.succeeded}`);
  console.log(`Failed:          ${totals.failed}`);

  if (totals.failed > 0) {
    process.exitCode = 1;
  }
}

main().catch((error) => {
  console.error("\nDocument generation failed.");
  console.error(
    error instanceof Error ? error.stack : error
  );
  process.exitCode = 1;
});
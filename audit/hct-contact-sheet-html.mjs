import fs from "node:fs";
import path from "node:path";

const root = process.cwd();

const sourceDir = path.join(
  root,
  "asset-preparation",
  "observatories",
  "hct",
  "source",
  "images"
);

const hctRoot = path.join(
  root,
  "asset-preparation",
  "observatories",
  "hct"
);

const outputPath = path.join(
  hctRoot,
  "hct-contact-sheet.html"
);

if (!fs.existsSync(sourceDir)) {
  console.error("ERROR: HCT source folder not found:");
  console.error(sourceDir);
  process.exit(1);
}

const allowed = new Set([
  ".jpg",
  ".jpeg",
  ".png",
  ".webp",
  ".tif",
  ".tiff"
]);

const files = fs
  .readdirSync(sourceDir)
  .filter((name) =>
    allowed.has(path.extname(name).toLowerCase())
  )
  .sort((a, b) =>
    a.localeCompare(b, undefined, {
      numeric: true,
      sensitivity: "base"
    })
  );

if (files.length !== 9) {
  console.error(
    `ERROR: Expected 9 images, found ${files.length}.`
  );
  process.exit(1);
}

function escapeHtml(value) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

const cards = files
  .map((file, index) => {
    const relativeImage =
      "./source/images/" +
      encodeURIComponent(file);

    return `
      <article class="card">
        <div class="image-box">
          <img
            src="${relativeImage}"
            alt="${escapeHtml(file)}"
          >
        </div>

        <div class="caption">
          <span class="number">
            ${String(index + 1).padStart(2, "0")}
          </span>

          <span class="filename">
            ${escapeHtml(file)}
          </span>
        </div>
      </article>
    `;
  })
  .join("\n");

const html = `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta
  name="viewport"
  content="width=device-width, initial-scale=1"
>

<title>Diya Astra - HCT Hanle Contact Sheet</title>

<style>
  * {
    box-sizing: border-box;
  }

  body {
    margin: 0;
    padding: 32px;
    background: #101318;
    color: #ffffff;
    font-family:
      Arial,
      Helvetica,
      sans-serif;
  }

  h1 {
    margin: 0 0 8px;
    font-size: 28px;
  }

  .subtitle {
    margin-bottom: 28px;
    color: #b8c2cf;
    font-size: 15px;
  }

  .grid {
    display: grid;
    grid-template-columns:
      repeat(3, minmax(0, 1fr));
    gap: 18px;
  }

  .card {
    overflow: hidden;
    border: 1px solid #303845;
    border-radius: 10px;
    background: #181d24;
  }

  .image-box {
    display: flex;
    align-items: center;
    justify-content: center;
    height: 360px;
    padding: 8px;
    background: #050608;
  }

  img {
    display: block;
    max-width: 100%;
    max-height: 100%;
    object-fit: contain;
  }

  .caption {
    display: flex;
    gap: 12px;
    align-items: flex-start;
    min-height: 66px;
    padding: 13px;
  }

  .number {
    font-size: 19px;
    font-weight: 700;
    color: #8bd5ff;
  }

  .filename {
    overflow-wrap: anywhere;
    font-size: 14px;
    line-height: 1.35;
  }

  @media (max-width: 1000px) {
    .grid {
      grid-template-columns:
        repeat(2, minmax(0, 1fr));
    }
  }
</style>
</head>

<body>

<h1>HCT / Hanle — Source Contact Sheet</h1>

<div class="subtitle">
  9 untouched source images • Diya Astra Observatory Asset Preparation
</div>

<main class="grid">
${cards}
</main>

</body>
</html>
`;

fs.writeFileSync(
  outputPath,
  html,
  "utf8"
);

console.log("");
console.log("==============================================");
console.log("DIYA ASTRA - HCT CONTACT SHEET READY");
console.log("==============================================");
console.log("");
console.log(`Images mapped : ${files.length}`);
console.log("Originals modified: NO");
console.log("");
console.log("Open this file in Chrome or Edge:");
console.log(outputPath);
console.log("");
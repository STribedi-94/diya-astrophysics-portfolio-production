import fs from "node:fs";
import path from "node:path";
import { execFileSync } from "node:child_process";

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
  "hct-contact-sheet.jpg"
);

const tempPs1 = path.join(
  hctRoot,
  ".hct-contact-sheet-temp.ps1"
);

if (!fs.existsSync(sourceDir)) {
  console.error(`ERROR: Source directory not found:\n${sourceDir}`);
  process.exit(1);
}

const imageExtensions = new Set([
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
    imageExtensions.has(path.extname(name).toLowerCase())
  )
  .sort((a, b) =>
    a.localeCompare(b, undefined, {
      numeric: true,
      sensitivity: "base"
    })
  );

if (files.length !== 9) {
  console.error(
    `ERROR: Expected 9 HCT images, found ${files.length}.`
  );
  process.exit(1);
}

const psFiles = files.map((file, index) => ({
  number: index + 1,
  file,
  fullPath: path.join(sourceDir, file)
}));

const escaped = (s) => s.replaceAll("'", "''");

let ps = `
Add-Type -AssemblyName System.Drawing

$canvasWidth = 1800
$cellWidth = 600
$cellHeight = 500
$labelHeight = 85
$rows = 3
$cols = 3
$canvasHeight = $rows * $cellHeight

$bitmap = New-Object System.Drawing.Bitmap(
  $canvasWidth,
  $canvasHeight,
  [System.Drawing.Imaging.PixelFormat]::Format24bppRgb
)

$graphics = [System.Drawing.Graphics]::FromImage($bitmap)

try {
  $graphics.Clear([System.Drawing.Color]::White)

  $fontTitle = New-Object System.Drawing.Font(
    "Arial",
    20,
    [System.Drawing.FontStyle]::Bold
  )

  $fontLabel = New-Object System.Drawing.Font(
    "Arial",
    13,
    [System.Drawing.FontStyle]::Regular
  )

  $brushBlack = [System.Drawing.Brushes]::Black
  $penGray = New-Object System.Drawing.Pen(
    [System.Drawing.Color]::LightGray,
    2
  )

  function Draw-ImageCell {
    param(
      [string]$ImagePath,
      [int]$Index,
      [string]$Label,
      [int]$CellX,
      [int]$CellY
    )

    $imageAreaHeight = $cellHeight - $labelHeight

    $graphics.DrawRectangle(
      $penGray,
      $CellX,
      $CellY,
      $cellWidth - 1,
      $cellHeight - 1
    )

    $img = [System.Drawing.Image]::FromFile($ImagePath)

    try {
      $scaleX = $cellWidth / $img.Width
      $scaleY = $imageAreaHeight / $img.Height
      $scale = [Math]::Min($scaleX, $scaleY)

      $drawWidth = [int][Math]::Round($img.Width * $scale)
      $drawHeight = [int][Math]::Round($img.Height * $scale)

      $drawX = $CellX + [int](($cellWidth - $drawWidth) / 2)
      $drawY = $CellY + [int](($imageAreaHeight - $drawHeight) / 2)

      $graphics.DrawImage(
        $img,
        $drawX,
        $drawY,
        $drawWidth,
        $drawHeight
      )
    }
    finally {
      $img.Dispose()
    }

    $labelY = $CellY + $imageAreaHeight + 8

    $numberText = ("{0:D2}" -f $Index) + "."

    $graphics.DrawString(
      $numberText,
      $fontTitle,
      $brushBlack,
      $CellX + 12,
      $labelY
    )

    $labelRect = New-Object System.Drawing.RectangleF(
      ($CellX + 70),
      $labelY,
      ($cellWidth - 82),
      ($labelHeight - 12)
    )

    $graphics.DrawString(
      $Label,
      $fontLabel,
      $brushBlack,
      $labelRect
    )
  }
`;

psFiles.forEach((item, i) => {
  const row = Math.floor(i / 3);
  const col = i % 3;

  const x = col * 600;
  const y = row * 500;

  ps += `
  Draw-ImageCell `
    + `-ImagePath '${escaped(item.fullPath)}' `
    + `-Index ${item.number} `
    + `-Label '${escaped(item.file)}' `
    + `-CellX ${x} `
    + `-CellY ${y}
`;
});

ps += `
  $jpegCodec =
    [System.Drawing.Imaging.ImageCodecInfo]::GetImageEncoders() |
    Where-Object { $_.MimeType -eq "image/jpeg" } |
    Select-Object -First 1

  $encoder = [System.Drawing.Imaging.Encoder]::Quality
  $encoderParams =
    New-Object System.Drawing.Imaging.EncoderParameters(1)

  $encoderParams.Param[0] =
    New-Object System.Drawing.Imaging.EncoderParameter(
      $encoder,
      [long]92
    )

  $bitmap.Save(
    '${escaped(outputPath)}',
    $jpegCodec,
    $encoderParams
  )

  $encoderParams.Dispose()
  $penGray.Dispose()
  $fontTitle.Dispose()
  $fontLabel.Dispose()
}
finally {
  $graphics.Dispose()
  $bitmap.Dispose()
}
`;

fs.writeFileSync(tempPs1, ps, "utf8");

try {
  execFileSync(
    "powershell.exe",
    [
      "-NoProfile",
      "-ExecutionPolicy",
      "Bypass",
      "-File",
      tempPs1
    ],
    { stdio: "inherit" }
  );
} catch {
  if (fs.existsSync(tempPs1)) {
    fs.unlinkSync(tempPs1);
  }

  console.error("ERROR: HCT contact-sheet generation failed.");
  process.exit(1);
}

if (fs.existsSync(tempPs1)) {
  fs.unlinkSync(tempPs1);
}

if (!fs.existsSync(outputPath)) {
  console.error("ERROR: Contact sheet was not created.");
  process.exit(1);
}

console.log("");
console.log("==============================================");
console.log("DIYA ASTRA - HCT CONTACT SHEET COMPLETE");
console.log("==============================================");
console.log("");
console.log("Images included : 9");
console.log("");
console.log("Output:");
console.log(outputPath);
console.log("");
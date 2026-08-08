import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";
import { execFileSync } from "node:child_process";

const root = process.cwd();

const dotRoot = path.join(
  root,
  "asset-preparation",
  "observatories",
  "dot"
);

const preparedDir = path.join(
  dotRoot,
  "prepared",
  "images"
);

const productionReadyDir = path.join(
  dotRoot,
  "production-ready",
  "images"
);

const largeDir = path.join(
  productionReadyDir,
  "large"
);

const standardDir = path.join(
  productionReadyDir,
  "standard"
);

const manifestPath = path.join(
  dotRoot,
  "manifests",
  "dot-implementation-ready.json"
);

const outputManifestPath = path.join(
  dotRoot,
  "manifests",
  "dot-production-ready.json"
);

const reportPath = path.join(
  dotRoot,
  "dot-production-derivatives-report.txt"
);

const tempPs1 = path.join(
  dotRoot,
  ".dot-production-derivatives-temp.ps1"
);

function fail(message) {
  console.error("");
  console.error(`ERROR: ${message}`);
  console.error("");
  process.exit(1);
}

function ensureDir(dir) {
  fs.mkdirSync(dir, { recursive: true });
}

function sha256(filePath) {
  const hash = crypto.createHash("sha256");
  hash.update(fs.readFileSync(filePath));
  return hash.digest("hex");
}

function relative(filePath) {
  return path
    .relative(root, filePath)
    .replaceAll("\\", "/");
}

if (!fs.existsSync(manifestPath)) {
  fail(`Implementation-ready manifest not found:\n${manifestPath}`);
}

const manifest = JSON.parse(
  fs.readFileSync(manifestPath, "utf8")
);

if (
  !Array.isArray(manifest.selectedNewAssets) ||
  manifest.selectedNewAssets.length !== 8
) {
  fail(
    `Expected 8 selected DOT assets, found ${
      manifest.selectedNewAssets?.length ?? 0
    }.`
  );
}

ensureDir(productionReadyDir);
ensureDir(largeDir);
ensureDir(standardDir);

/*
============================================================
PRODUCTION DERIVATIVE POLICY

LARGE
Maximum long edge: 1920 px
JPEG quality: 90

STANDARD
Maximum long edge: 1280 px
JPEG quality: 88

Rules:
- source-originals untouched
- prepared reference images untouched
- no upscaling
- aspect ratio preserved
- metadata not relied upon
- final files remain outside public/assets for now
============================================================
*/

const jobs = [];

for (const selected of manifest.selectedNewAssets) {
  const sourcePath = path.join(
    preparedDir,
    selected.file
  );

  if (!fs.existsSync(sourcePath)) {
    fail(`Selected prepared image missing: ${selected.file}`);
  }

  jobs.push({
    input: sourcePath,
    output: path.join(largeDir, selected.file),
    maxEdge: 1920,
    quality: 90,
    variant: "large"
  });

  jobs.push({
    input: sourcePath,
    output: path.join(standardDir, selected.file),
    maxEdge: 1280,
    quality: 88,
    variant: "standard"
  });
}

let ps = `
Add-Type -AssemblyName System.Drawing

function Export-OptimizedJpeg {
    param(
        [string]$InputPath,
        [string]$OutputPath,
        [int]$MaxEdge,
        [long]$Quality
    )

    $source = [System.Drawing.Image]::FromFile($InputPath)

    try {
        $srcWidth = $source.Width
        $srcHeight = $source.Height

        $longEdge = [Math]::Max($srcWidth, $srcHeight)

        if ($longEdge -gt $MaxEdge) {
            $scale = $MaxEdge / $longEdge
        }
        else {
            $scale = 1.0
        }

        $newWidth = [Math]::Max(
            1,
            [int][Math]::Round($srcWidth * $scale)
        )

        $newHeight = [Math]::Max(
            1,
            [int][Math]::Round($srcHeight * $scale)
        )

        $bitmap = New-Object System.Drawing.Bitmap(
            $newWidth,
            $newHeight,
            [System.Drawing.Imaging.PixelFormat]::Format24bppRgb
        )

        try {
            $bitmap.SetResolution(
                $source.HorizontalResolution,
                $source.VerticalResolution
            )

            $graphics = [System.Drawing.Graphics]::FromImage($bitmap)

            try {
                $graphics.CompositingMode =
                    [System.Drawing.Drawing2D.CompositingMode]::SourceCopy

                $graphics.CompositingQuality =
                    [System.Drawing.Drawing2D.CompositingQuality]::HighQuality

                $graphics.InterpolationMode =
                    [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic

                $graphics.SmoothingMode =
                    [System.Drawing.Drawing2D.SmoothingMode]::HighQuality

                $graphics.PixelOffsetMode =
                    [System.Drawing.Drawing2D.PixelOffsetMode]::HighQuality

                $graphics.DrawImage(
                    $source,
                    0,
                    0,
                    $newWidth,
                    $newHeight
                )
            }
            finally {
                $graphics.Dispose()
            }

            $jpegCodec =
                [System.Drawing.Imaging.ImageCodecInfo]::GetImageEncoders() |
                Where-Object { $_.MimeType -eq "image/jpeg" } |
                Select-Object -First 1

            $encoder =
                [System.Drawing.Imaging.Encoder]::Quality

            $encoderParams =
                New-Object System.Drawing.Imaging.EncoderParameters(1)

            $encoderParams.Param[0] =
                New-Object System.Drawing.Imaging.EncoderParameter(
                    $encoder,
                    $Quality
                )

            $bitmap.Save(
                $OutputPath,
                $jpegCodec,
                $encoderParams
            )

            $encoderParams.Dispose()
        }
        finally {
            $bitmap.Dispose()
        }
    }
    finally {
        $source.Dispose()
    }
}
`;

for (const job of jobs) {
  const input = job.input.replaceAll("'", "''");
  const output = job.output.replaceAll("'", "''");

  ps += `
Export-OptimizedJpeg `
    + `-InputPath '${input}' `
    + `-OutputPath '${output}' `
    + `-MaxEdge ${job.maxEdge} `
    + `-Quality ${job.quality}
`;
}

fs.writeFileSync(
  tempPs1,
  ps,
  "utf8"
);

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
    {
      stdio: "inherit"
    }
  );
} catch {
  if (fs.existsSync(tempPs1)) {
    fs.unlinkSync(tempPs1);
  }

  fail("DOT production derivative generation failed.");
}

if (fs.existsSync(tempPs1)) {
  fs.unlinkSync(tempPs1);
}

/*
============================================================
VERIFY ALL 16 OUTPUTS
============================================================
*/

const derivatives = [];

for (const job of jobs) {
  if (!fs.existsSync(job.output)) {
    fail(`Missing generated derivative:\n${job.output}`);
  }

  const stat = fs.statSync(job.output);

  if (stat.size <= 0) {
    fail(`Generated derivative is empty:\n${job.output}`);
  }

  derivatives.push({
    sourceFile: path.basename(job.input),
    variant: job.variant,
    maxLongEdge: job.maxEdge,
    jpegQuality: job.quality,
    relativePath: relative(job.output),
    bytes: stat.size,
    sha256: sha256(job.output)
  });
}

if (derivatives.length !== 16) {
  fail(
    `Expected 16 derivatives but verified ${derivatives.length}.`
  );
}

/*
============================================================
BUILD FINAL IMPLEMENTATION ASSET RECORDS
============================================================
*/

const selectedAssets = manifest.selectedNewAssets.map(
  (selected) => {
    const matching = derivatives.filter(
      (item) => item.sourceFile === selected.file
    );

    return {
      ...selected,

      productionState: "PRODUCTION_DERIVATIVES_READY",

      derivatives: {
        large: matching.find(
          (item) => item.variant === "large"
        ),
        standard: matching.find(
          (item) => item.variant === "standard"
        )
      },

      implementationRecommendation: {
        desktopCinematic: "large",
        fullscreenCinematic: "large",
        galleryDesktop: "standard",
        galleryTablet: "standard",
        mobile: "standard"
      }
    };
  }
);

const finalManifest = {
  ...manifest,

  status: {
    ...manifest.status,

    implementationAssetPlanningComplete: true,

    majorAssetClassificationDecisionsRemaining: false,

    webOptimizationCompleted: true,

    productionDerivativesGenerated: true,

    productionDerivativeCount: 16,

    selectedNewPublicAssets: 8,

    productionMigrationStillRequired: false,

    publicDirectoryMigrationDeferredToImplementation: true
  },

  productionDerivativePolicy: {
    format: "JPEG",

    variants: {
      large: {
        maxLongEdge: 1920,
        quality: 90
      },

      standard: {
        maxLongEdge: 1280,
        quality: 88
      }
    },

    preserveAspectRatio: true,
    noUpscaling: true,
    sourceOriginalsModified: false,
    preparedReferencesModified: false
  },

  selectedNewAssets: selectedAssets,

  productionDerivatives: derivatives
};

fs.writeFileSync(
  outputManifestPath,
  JSON.stringify(finalManifest, null, 2),
  "utf8"
);

/*
============================================================
REPORT
============================================================
*/

const totalBytes = derivatives.reduce(
  (sum, item) => sum + item.bytes,
  0
);

const largeCount = derivatives.filter(
  (item) => item.variant === "large"
).length;

const standardCount = derivatives.filter(
  (item) => item.variant === "standard"
).length;

let report = "";

report +=
  "============================================================\n";

report +=
  "DIYA ASTRA - DOT PRODUCTION DERIVATIVES REPORT\n";

report +=
  "============================================================\n\n";

report +=
  "SELECTED NEW DOT V1 ASSETS:\n8\n\n";

report +=
  `LARGE DERIVATIVES CREATED:\n${largeCount}\n\n`;

report +=
  `STANDARD DERIVATIVES CREATED:\n${standardCount}\n\n`;

report +=
  `TOTAL DERIVATIVES:\n${derivatives.length}\n\n`;

report +=
  `TOTAL DERIVATIVE BYTES:\n${totalBytes}\n\n`;

report +=
  "SOURCE ORIGINALS MODIFIED:\nNO\n\n";

report +=
  "PREPARED REFERENCE IMAGES MODIFIED:\nNO\n\n";

report +=
  "ASPECT RATIO PRESERVED:\nYES\n\n";

report +=
  "UPSCALING USED:\nNO\n\n";

report +=
  "LARGE POLICY:\n";

report +=
  "Maximum long edge = 1920 px\n";

report +=
  "JPEG quality = 90\n\n";

report +=
  "STANDARD POLICY:\n";

report +=
  "Maximum long edge = 1280 px\n";

report +=
  "JPEG quality = 88\n\n";

report +=
  "IMPLEMENTATION ASSET PLANNING REMAINING:\nNO\n\n";

report +=
  "DOT IMAGE SELECTION PLANNING REMAINING:\nNO\n\n";

report +=
  "FINAL PUBLIC/ASTRA CODE INTEGRATION:\n";

report +=
  "TO BE EXECUTED DURING THE PLANNED IMPLEMENTATION CHAT\n";

report +=
  "USING THIS LOCKED MANIFEST WITHOUT REPLANNING.\n\n";

report +=
  "============================================================\n";

report +=
  "DOT PREPARATION STAGE 5 COMPLETE\n";

report +=
  "DOT ASSET FOUNDATION IMPLEMENTATION-READY\n";

report +=
  "============================================================\n";

fs.writeFileSync(
  reportPath,
  report,
  "utf8"
);

console.log("");
console.log(
  "=============================================="
);

console.log(
  "DIYA ASTRA - DOT PREPARATION STAGE 5 COMPLETE"
);

console.log(
  "=============================================="
);

console.log("");

console.log(
  "Selected new DOT V1 assets : 8"
);

console.log(
  `Large derivatives          : ${largeCount}`
);

console.log(
  `Standard derivatives       : ${standardCount}`
);

console.log(
  `Total derivatives verified : ${derivatives.length}`
);

console.log("");

console.log(
  "Source originals modified  : NO"
);

console.log(
  "Prepared references modified: NO"
);

console.log(
  "Major asset planning remaining: NO"
);

console.log("");

console.log(
  "Production-ready directory:"
);

console.log(
  productionReadyDir
);

console.log("");

console.log(
  "Final production manifest:"
);

console.log(
  outputManifestPath
);

console.log("");

console.log(
  "Report:"
);

console.log(
  reportPath
);

console.log("");
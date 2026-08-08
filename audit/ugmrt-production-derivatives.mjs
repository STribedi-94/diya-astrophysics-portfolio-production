import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";
import { execFileSync } from "node:child_process";

const root = process.cwd();

const ugmrtRoot = path.join(
  root,
  "asset-preparation",
  "observatories",
  "ugmrt"
);

const preparedDir = path.join(
  ugmrtRoot,
  "prepared",
  "images"
);

const productionRoot = path.join(
  ugmrtRoot,
  "production-ready",
  "images"
);

const largeDir = path.join(
  productionRoot,
  "large"
);

const standardDir = path.join(
  productionRoot,
  "standard"
);

const manifestPath = path.join(
  ugmrtRoot,
  "manifests",
  "ugmrt-implementation-ready.json"
);

const finalManifestPath = path.join(
  ugmrtRoot,
  "manifests",
  "ugmrt-production-ready.json"
);

const reportPath = path.join(
  ugmrtRoot,
  "ugmrt-production-derivatives-report.txt"
);

const tempPs1 = path.join(
  ugmrtRoot,
  ".ugmrt-production-derivatives-temp.ps1"
);

function fail(message) {
  console.error("");
  console.error(`ERROR: ${message}`);
  console.error("");
  process.exit(1);
}

function ensureDir(dir) {
  fs.mkdirSync(dir, {
    recursive: true
  });
}

function sha256(filePath) {
  const hash = crypto.createHash("sha256");

  hash.update(
    fs.readFileSync(filePath)
  );

  return hash.digest("hex");
}

function relative(filePath) {
  return path
    .relative(root, filePath)
    .replaceAll("\\", "/");
}

function escapedPs(value) {
  return value.replaceAll("'", "''");
}

/*
============================================================
LOAD LOCKED IMPLEMENTATION MANIFEST
============================================================
*/

if (!fs.existsSync(manifestPath)) {
  fail(
    `uGMRT implementation manifest missing:\n${manifestPath}`
  );
}

const manifest = JSON.parse(
  fs.readFileSync(
    manifestPath,
    "utf8"
  )
);

if (
  !Array.isArray(manifest.selectedAssets) ||
  manifest.selectedAssets.length !== 4
) {
  fail(
    `Expected 4 selected uGMRT assets, found ${
      manifest.selectedAssets?.length ?? 0
    }.`
  );
}

ensureDir(largeDir);
ensureDir(standardDir);

/*
============================================================
DERIVATIVE POLICY

LARGE
Maximum long edge: 1920 px
JPEG quality: 90

STANDARD
Maximum long edge: 1280 px
JPEG quality: 88

Rules:
- aspect ratio preserved
- no upscaling
- originals untouched
- prepared references untouched
============================================================
*/

const jobs = [];

for (const selected of manifest.selectedAssets) {
  const sourcePath = path.join(
    preparedDir,
    selected.file
  );

  if (!fs.existsSync(sourcePath)) {
    fail(
      `Selected prepared asset missing:\n${selected.file}`
    );
  }

  const ext = path
    .extname(selected.file)
    .toLowerCase();

  if (
    ext !== ".jpg" &&
    ext !== ".jpeg"
  ) {
    fail(
      `Unexpected non-JPEG selected uGMRT asset:\n${selected.file}`
    );
  }

  jobs.push({
    source: sourcePath,

    output: path.join(
      largeDir,
      selected.file
    ),

    variant: "large",

    maxEdge: 1920,

    quality: 90
  });

  jobs.push({
    source: sourcePath,

    output: path.join(
      standardDir,
      selected.file
    ),

    variant: "standard",

    maxEdge: 1280,

    quality: 88
  });
}

/*
============================================================
POWERSHELL / SYSTEM.DRAWING JPEG PROCESSOR
============================================================
*/

let ps = `
Add-Type -AssemblyName System.Drawing

function Export-UgmrtJpeg {
    param(
        [string]$InputPath,
        [string]$OutputPath,
        [int]$MaxEdge,
        [long]$Quality
    )

    $source =
        [System.Drawing.Image]::FromFile(
            $InputPath
        )

    try {

        $srcWidth =
            $source.Width

        $srcHeight =
            $source.Height

        $longEdge =
            [Math]::Max(
                $srcWidth,
                $srcHeight
            )

        if (
            $longEdge -gt $MaxEdge
        ) {
            $scale =
                $MaxEdge /
                $longEdge
        }
        else {
            $scale = 1.0
        }

        $newWidth =
            [Math]::Max(
                1,
                [int][Math]::Round(
                    $srcWidth *
                    $scale
                )
            )

        $newHeight =
            [Math]::Max(
                1,
                [int][Math]::Round(
                    $srcHeight *
                    $scale
                )
            )

        $bitmap =
            New-Object System.Drawing.Bitmap(
                $newWidth,
                $newHeight,
                [System.Drawing.Imaging.PixelFormat]::Format24bppRgb
            )

        try {

            $graphics =
                [System.Drawing.Graphics]::FromImage(
                    $bitmap
                )

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

            $codec =
                [System.Drawing.Imaging.ImageCodecInfo]::GetImageEncoders() |
                Where-Object {
                    $_.MimeType -eq "image/jpeg"
                } |
                Select-Object -First 1

            $encoder =
                [System.Drawing.Imaging.Encoder]::Quality

            $params =
                New-Object System.Drawing.Imaging.EncoderParameters(1)

            $params.Param[0] =
                New-Object System.Drawing.Imaging.EncoderParameter(
                    $encoder,
                    $Quality
                )

            $bitmap.Save(
                $OutputPath,
                $codec,
                $params
            )

            $params.Dispose()
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
  ps += `
Export-UgmrtJpeg `
    + `-InputPath '${escapedPs(job.source)}' `
    + `-OutputPath '${escapedPs(job.output)}' `
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
}
catch {
  if (fs.existsSync(tempPs1)) {
    fs.unlinkSync(tempPs1);
  }

  fail(
    "uGMRT production derivative generation failed."
  );
}

if (fs.existsSync(tempPs1)) {
  fs.unlinkSync(tempPs1);
}

/*
============================================================
VERIFY ALL 8 DELIVERY FILES
============================================================
*/

const derivatives = [];

for (const job of jobs) {
  if (!fs.existsSync(job.output)) {
    fail(
      `Derivative missing:\n${job.output}`
    );
  }

  const stat =
    fs.statSync(job.output);

  if (stat.size <= 0) {
    fail(
      `Derivative is empty:\n${job.output}`
    );
  }

  derivatives.push({
    sourceFile:
      path.basename(job.source),

    variant:
      job.variant,

    format:
      "JPEG",

    maxLongEdge:
      job.maxEdge,

    quality:
      job.quality,

    relativePath:
      relative(job.output),

    bytes:
      stat.size,

    sha256:
      sha256(job.output),

    transformation:
      "RESIZED_OR_REENCODED_JPEG"
  });
}

if (derivatives.length !== 8) {
  fail(
    `Expected 8 uGMRT derivatives, found ${derivatives.length}.`
  );
}

const largeCount =
  derivatives.filter(
    (record) =>
      record.variant === "large"
  ).length;

const standardCount =
  derivatives.filter(
    (record) =>
      record.variant === "standard"
  ).length;

if (
  largeCount !== 4 ||
  standardCount !== 4
) {
  fail(
    `Incorrect variant counts: large=${largeCount}, standard=${standardCount}`
  );
}

/*
============================================================
MAP DERIVATIVES TO SELECTED ASSETS
============================================================
*/

const productionAssets =
  manifest.selectedAssets.map(
    (selected) => {

      const large =
        derivatives.find(
          (record) =>
            record.sourceFile ===
              selected.file &&
            record.variant ===
              "large"
        );

      const standard =
        derivatives.find(
          (record) =>
            record.sourceFile ===
              selected.file &&
            record.variant ===
              "standard"
        );

      if (!large || !standard) {
        fail(
          `Incomplete derivative mapping:\n${selected.file}`
        );
      }

      return {
        ...selected,

        productionState:
          "READY_FOR_IMPLEMENTATION",

        derivatives: {
          large,
          standard
        },

        recommendedDelivery: {
          cinematicDesktop:
            "large",

          fullscreen:
            "large",

          galleryDesktop:
            "standard",

          tablet:
            "standard",

          mobile:
            "standard"
        }
      };
    }
  );

/*
============================================================
FINAL PRODUCTION MANIFEST
============================================================
*/

const totalBytes =
  derivatives.reduce(
    (sum, record) =>
      sum + record.bytes,
    0
  );

const finalManifest = {
  ...manifest,

  status: {
    ...manifest.status,

    implementationAssetPlanningComplete:
      true,

    majorAssetClassificationDecisionsRemaining:
      false,

    webOptimizationStillRequired:
      false,

    productionDerivativesGenerated:
      true,

    productionDerivativeCount:
      8,

    selectedNewV1Assets:
      4,

    referenceOnlyAssets:
      2,

    ugmrtAssetFoundationReady:
      true
  },

  derivativePolicy: {
    format:
      "JPEG",

    large: {
      maxLongEdge:
        1920,

      quality:
        90
    },

    standard: {
      maxLongEdge:
        1280,

      quality:
        88
    },

    preserveAspectRatio:
      true,

    noUpscaling:
      true,

    sourceOriginalsModified:
      false,

    preparedReferencesModified:
      false
  },

  productionAssets,

  productionDerivatives:
    derivatives
};

fs.writeFileSync(
  finalManifestPath,
  JSON.stringify(
    finalManifest,
    null,
    2
  ),
  "utf8"
);

/*
============================================================
FINAL REPORT
============================================================
*/

let report = "";

report +=
  "============================================================\n";

report +=
  "DIYA ASTRA - uGMRT PRODUCTION DERIVATIVES REPORT\n";

report +=
  "============================================================\n\n";

report +=
  "SELECTED NEW uGMRT V1 ASSETS:\n4\n\n";

report +=
  `LARGE DERIVATIVES:\n${largeCount}\n\n`;

report +=
  `STANDARD DERIVATIVES:\n${standardCount}\n\n`;

report +=
  `TOTAL DERIVATIVES:\n${derivatives.length}\n\n`;

report +=
  `TOTAL DERIVATIVE BYTES:\n${totalBytes}\n\n`;

report +=
  "SOURCE ORIGINALS MODIFIED:\nNO\n\n";

report +=
  "PREPARED REFERENCES MODIFIED:\nNO\n\n";

report +=
  "ASPECT RATIO PRESERVED:\nYES\n\n";

report +=
  "UPSCALING USED:\nNO\n\n";

report +=
  "CINEMATIC SEQUENCE LOCKED:\nYES\n\n";

report +=
  "GALLERY STORY LOCKED:\nYES\n\n";

report +=
  "GWB PROCEDURAL VISUALIZATION PLAN LOCKED:\nYES\n\n";

report +=
  "AIPS + CASA PIPELINE LOCKED:\nYES\n\n";

report +=
  "MAJOR uGMRT ASSET DECISIONS REMAINING:\nNO\n\n";

report +=
  "FINAL ASTRA CODE INTEGRATION:\n";

report +=
  "PERFORM DURING IMPLEMENTATION USING LOCKED MANIFEST.\n";

report +=
  "DO NOT REOPEN IMAGE-SELECTION PLANNING.\n\n";

report +=
  "============================================================\n";

report +=
  "uGMRT PREPARATION STAGE 4 COMPLETE\n";

report +=
  "uGMRT ASSET FOUNDATION IMPLEMENTATION-READY\n";

report +=
  "============================================================\n";

fs.writeFileSync(
  reportPath,
  report,
  "utf8"
);

/*
============================================================
TERMINAL
============================================================
*/

console.log("");

console.log(
  "=============================================="
);

console.log(
  "DIYA ASTRA - uGMRT PREPARATION STAGE 4 COMPLETE"
);

console.log(
  "=============================================="
);

console.log("");

console.log(
  "Selected new uGMRT v1 assets : 4"
);

console.log(
  `Large derivatives            : ${largeCount}`
);

console.log(
  `Standard derivatives         : ${standardCount}`
);

console.log(
  `Total derivatives verified   : ${derivatives.length}`
);

console.log("");

console.log(
  "Source originals modified    : NO"
);

console.log(
  "Prepared references modified : NO"
);

console.log(
  "Major asset planning remaining: NO"
);

console.log("");

console.log(
  "Production-ready directory:"
);

console.log(
  productionRoot
);

console.log("");

console.log(
  "Final production manifest:"
);

console.log(
  finalManifestPath
);

console.log("");

console.log(
  "Report:"
);

console.log(
  reportPath
);

console.log("");
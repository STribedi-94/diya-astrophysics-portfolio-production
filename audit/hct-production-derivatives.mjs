import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";
import { execFileSync } from "node:child_process";

const root = process.cwd();

const hctRoot = path.join(
  root,
  "asset-preparation",
  "observatories",
  "hct"
);

const preparedDir = path.join(
  hctRoot,
  "prepared",
  "images"
);

const productionRoot = path.join(
  hctRoot,
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
  hctRoot,
  "manifests",
  "hct-implementation-ready.json"
);

const finalManifestPath = path.join(
  hctRoot,
  "manifests",
  "hct-production-ready.json"
);

const reportPath = path.join(
  hctRoot,
  "hct-production-derivatives-report.txt"
);

const tempPs1 = path.join(
  hctRoot,
  ".hct-production-derivatives-temp.ps1"
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
  const hash =
    crypto.createHash("sha256");

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
LOAD IMPLEMENTATION LOCK
============================================================
*/

if (!fs.existsSync(manifestPath)) {
  fail(
    `HCT implementation-ready manifest missing:\n${manifestPath}`
  );
}

const manifest = JSON.parse(
  fs.readFileSync(
    manifestPath,
    "utf8"
  )
);

if (
  !Array.isArray(
    manifest.selectedNewAssets
  ) ||
  manifest.selectedNewAssets.length !== 6
) {
  fail(
    `Expected 6 selected HCT assets, found ${
      manifest.selectedNewAssets?.length ?? 0
    }.`
  );
}

ensureDir(productionRoot);
ensureDir(largeDir);
ensureDir(standardDir);

/*
============================================================
DERIVATIVE POLICY

JPEG:
  LARGE
    max long edge = 1920
    quality = 90

  STANDARD
    max long edge = 1280
    quality = 88

WEBP:
  Existing optimized WebP assets are preserved byte-for-byte.

Reason:
  Windows System.Drawing cannot reliably decode WebP.
  We will not introduce a new package or silently convert them.

This means the WebP large and standard files may be identical.
============================================================
*/

const jpegJobs = [];
const passthroughJobs = [];

for (
  const selected
  of manifest.selectedNewAssets
) {
  const sourcePath = path.join(
    preparedDir,
    selected.file
  );

  if (!fs.existsSync(sourcePath)) {
    fail(
      `Selected HCT source missing:\n${selected.file}`
    );
  }

  const ext =
    path.extname(
      selected.file
    ).toLowerCase();

  if (
    ext === ".jpg" ||
    ext === ".jpeg"
  ) {
    jpegJobs.push({
      source: sourcePath,

      output: path.join(
        largeDir,
        selected.file
      ),

      variant: "large",

      maxEdge: 1920,

      quality: 90
    });

    jpegJobs.push({
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
  else if (ext === ".webp") {
    passthroughJobs.push({
      source: sourcePath,

      output: path.join(
        largeDir,
        selected.file
      ),

      variant: "large"
    });

    passthroughJobs.push({
      source: sourcePath,

      output: path.join(
        standardDir,
        selected.file
      ),

      variant: "standard"
    });
  }
  else {
    fail(
      `Unsupported selected HCT format:\n${selected.file}`
    );
  }
}

/*
============================================================
JPEG OPTIMIZATION
============================================================
*/

if (jpegJobs.length > 0) {

  let ps = `
Add-Type -AssemblyName System.Drawing

function Export-HctJpeg {
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

            $jpegCodec =
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
                $jpegCodec,
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

  for (const job of jpegJobs) {

    ps += `
Export-HctJpeg `
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
    if (
      fs.existsSync(tempPs1)
    ) {
      fs.unlinkSync(tempPs1);
    }

    fail(
      "HCT JPEG derivative generation failed."
    );
  }

  if (
    fs.existsSync(tempPs1)
  ) {
    fs.unlinkSync(tempPs1);
  }
}

/*
============================================================
WEBP PASS-THROUGH

Create delivery copies without recompression.
============================================================
*/

for (
  const job
  of passthroughJobs
) {
  fs.copyFileSync(
    job.source,
    job.output
  );

  if (
    sha256(job.source) !==
    sha256(job.output)
  ) {
    fail(
      `WebP pass-through integrity failure:\n${path.basename(job.source)}`
    );
  }
}

/*
============================================================
VERIFY ALL DERIVATIVES
============================================================
*/

const derivativeRecords = [];

function verifyDerivative({
  source,
  output,
  variant,
  transformation,
  maxEdge = null,
  quality = null
}) {

  if (
    !fs.existsSync(output)
  ) {
    fail(
      `Expected derivative missing:\n${output}`
    );
  }

  const stat =
    fs.statSync(output);

  if (
    stat.size <= 0
  ) {
    fail(
      `Empty derivative generated:\n${output}`
    );
  }

  derivativeRecords.push({
    sourceFile:
      path.basename(source),

    variant,

    format:
      path
        .extname(output)
        .replace(".", "")
        .toUpperCase(),

    transformation,

    maxLongEdge:
      maxEdge,

    jpegQuality:
      quality,

    relativePath:
      relative(output),

    bytes:
      stat.size,

    sha256:
      sha256(output)
  });
}

for (
  const job
  of jpegJobs
) {
  verifyDerivative({
    source: job.source,

    output: job.output,

    variant:
      job.variant,

    transformation:
      "JPEG_RESIZED_OR_REENCODED",

    maxEdge:
      job.maxEdge,

    quality:
      job.quality
  });
}

for (
  const job
  of passthroughJobs
) {
  verifyDerivative({
    source: job.source,

    output: job.output,

    variant:
      job.variant,

    transformation:
      "WEBP_BYTE_IDENTICAL_PASSTHROUGH"
  });
}

if (
  derivativeRecords.length !== 12
) {
  fail(
    `Expected 12 HCT delivery derivatives, verified ${derivativeRecords.length}.`
  );
}

/*
============================================================
VERIFY VARIANT COUNTS
============================================================
*/

const largeCount =
  derivativeRecords.filter(
    (record) =>
      record.variant === "large"
  ).length;

const standardCount =
  derivativeRecords.filter(
    (record) =>
      record.variant === "standard"
  ).length;

if (
  largeCount !== 6 ||
  standardCount !== 6
) {
  fail(
    `Incorrect derivative counts: large=${largeCount}, standard=${standardCount}`
  );
}

/*
============================================================
MAP DERIVATIVES TO SELECTED ASSETS
============================================================
*/

const productionAssets =
  manifest.selectedNewAssets.map(
    (selected) => {

      const large =
        derivativeRecords.find(
          (record) =>
            record.sourceFile ===
              selected.file &&
            record.variant ===
              "large"
        );

      const standard =
        derivativeRecords.find(
          (record) =>
            record.sourceFile ===
              selected.file &&
            record.variant ===
              "standard"
        );

      if (
        !large ||
        !standard
      ) {
        fail(
          `Derivative mapping incomplete for:\n${selected.file}`
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
  derivativeRecords.reduce(
    (sum, record) =>
      sum + record.bytes,
    0
  );

const jpegDerivativeCount =
  derivativeRecords.filter(
    (record) =>
      record.transformation ===
      "JPEG_RESIZED_OR_REENCODED"
  ).length;

const webpPassthroughCount =
  derivativeRecords.filter(
    (record) =>
      record.transformation ===
      "WEBP_BYTE_IDENTICAL_PASSTHROUGH"
  ).length;

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
      derivativeRecords.length,

    selectedNewV1Assets:
      6,

    referenceOnlyAssets:
      3,

    hctAssetFoundationReady:
      true
  },

  derivativePolicy: {
    jpeg: {
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
      }
    },

    webp: {
      handling:
        "BYTE_IDENTICAL_PASSTHROUGH",

      reason:
        "Existing WebP assets preserved without recompression because Windows System.Drawing does not safely decode WebP.",

      largeAndStandardMayBeIdentical:
        true
    },

    preserveAspectRatio:
      true,

    noUpscaling:
      true,

    sourceOriginalsModified:
      false,

    preparedReferenceImagesModified:
      false
  },

  productionAssets,

  productionDerivatives:
    derivativeRecords
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
  "DIYA ASTRA - HCT PRODUCTION DERIVATIVES REPORT\n";

report +=
  "============================================================\n\n";

report +=
  "SELECTED NEW HCT V1 ASSETS:\n6\n\n";

report +=
  `LARGE DELIVERY FILES:\n${largeCount}\n\n`;

report +=
  `STANDARD DELIVERY FILES:\n${standardCount}\n\n`;

report +=
  `TOTAL DELIVERY DERIVATIVES:\n${derivativeRecords.length}\n\n`;

report +=
  `JPEG DERIVATIVES:\n${jpegDerivativeCount}\n\n`;

report +=
  `WEBP BYTE-IDENTICAL DELIVERY COPIES:\n${webpPassthroughCount}\n\n`;

report +=
  `TOTAL DELIVERY BYTES:\n${totalBytes}\n\n`;

report +=
  "SOURCE ORIGINALS MODIFIED:\nNO\n\n";

report +=
  "PREPARED REFERENCE ASSETS MODIFIED:\nNO\n\n";

report +=
  "ASPECT RATIO PRESERVED:\nYES\n\n";

report +=
  "UPSCALING USED:\nNO\n\n";

report +=
  "CINEMATIC SEQUENCE LOCKED:\nYES\n\n";

report +=
  "GALLERY STORY LOCKED:\nYES\n\n";

report +=
  "HFOSC SCIENTIFIC LAYER LOCKED:\nYES\n\n";

report +=
  "IRAF / ANALYSIS PIPELINE LOCKED:\nYES\n\n";

report +=
  "MAJOR HCT ASSET DECISIONS REMAINING:\nNO\n\n";

report +=
  "FINAL PUBLIC / ASTRA CODE INTEGRATION:\n";

report +=
  "TO BE PERFORMED DURING PROJECT ASTRA IMPLEMENTATION USING\n";

report +=
  "THE LOCKED HCT MANIFEST WITHOUT REOPENING ASSET PLANNING.\n\n";

report +=
  "============================================================\n";

report +=
  "HCT PREPARATION STAGE 5 COMPLETE\n";

report +=
  "HCT ASSET FOUNDATION IMPLEMENTATION-READY\n";

report +=
  "============================================================\n";

fs.writeFileSync(
  reportPath,
  report,
  "utf8"
);

/*
============================================================
TERMINAL OUTPUT
============================================================
*/

console.log("");

console.log(
  "=============================================="
);

console.log(
  "DIYA ASTRA - HCT PREPARATION STAGE 5 COMPLETE"
);

console.log(
  "=============================================="
);

console.log("");

console.log(
  "Selected new HCT v1 assets : 6"
);

console.log(
  `Large delivery files       : ${largeCount}`
);

console.log(
  `Standard delivery files    : ${standardCount}`
);

console.log(
  `Total derivatives verified : ${derivativeRecords.length}`
);

console.log("");

console.log(
  `JPEG derivatives           : ${jpegDerivativeCount}`
);

console.log(
  `WebP passthrough copies    : ${webpPassthroughCount}`
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
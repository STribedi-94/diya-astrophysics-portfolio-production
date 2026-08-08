import fs from "node:fs";
import path from "node:path";
import { execFileSync } from "node:child_process";
import crypto from "node:crypto";

const root = process.cwd();

const dotRoot = path.join(
  root,
  "asset-preparation",
  "observatories",
  "dot"
);

const preparedDir = path.join(dotRoot, "prepared", "images");

const manifestPath = path.join(
  dotRoot,
  "manifests",
  "dot-assets.json"
);

const reportPath = path.join(
  dotRoot,
  "dot-orientation-normalization-report.txt"
);

const targets = [
  {
    file: "dot-terrain-forested-ridges-day-02.jpg",
    source: "IMG_20221119_130336.jpg",
    originalOrientation: 3,
    rotation: 180
  },
  {
    file: "dot-site-entrance-dusk-01.jpg",
    source: "IMG_20221119_174449.jpg",
    originalOrientation: 6,
    rotation: 90
  }
];

function fail(message) {
  console.error("");
  console.error(`ERROR: ${message}`);
  console.error("");
  process.exit(1);
}

function sha256(filePath) {
  const hash = crypto.createHash("sha256");
  hash.update(fs.readFileSync(filePath));
  return hash.digest("hex");
}

if (!fs.existsSync(preparedDir)) {
  fail(`Prepared DOT image directory not found:\n${preparedDir}`);
}

if (!fs.existsSync(manifestPath)) {
  fail(`DOT manifest not found:\n${manifestPath}`);
}

const manifest = JSON.parse(
  fs.readFileSync(manifestPath, "utf8")
);

for (const target of targets) {
  const imagePath = path.join(preparedDir, target.file);

  if (!fs.existsSync(imagePath)) {
    fail(`Prepared image missing: ${target.file}`);
  }
}

/*
 * We use Windows PowerShell + System.Drawing because this project
 * should not gain a new npm image-processing dependency merely for
 * two controlled orientation corrections.
 *
 * Only PREPARED derivatives are modified.
 * source-originals is never touched.
 */

const powershellScript = `
Add-Type -AssemblyName System.Drawing

function Save-JpegRotated {
    param(
        [string]$InputPath,
        [int]$Rotation
    )

    $fullPath = [System.IO.Path]::GetFullPath($InputPath)

    $img = [System.Drawing.Image]::FromFile($fullPath)

    try {
        if ($Rotation -eq 90) {
            $img.RotateFlip(
                [System.Drawing.RotateFlipType]::Rotate90FlipNone
            )
        }
        elseif ($Rotation -eq 180) {
            $img.RotateFlip(
                [System.Drawing.RotateFlipType]::Rotate180FlipNone
            )
        }
        elseif ($Rotation -eq 270) {
            $img.RotateFlip(
                [System.Drawing.RotateFlipType]::Rotate270FlipNone
            )
        }
        else {
            throw "Unsupported rotation: $Rotation"
        }

        # Remove EXIF Orientation tag if it exists.
        try {
            $img.RemovePropertyItem(0x0112)
        }
        catch {
            # No orientation tag present after decode.
        }

        $tempPath = $fullPath + ".orientation-temp.jpg"

        $jpegCodec = [System.Drawing.Imaging.ImageCodecInfo]::GetImageEncoders() |
            Where-Object { $_.MimeType -eq "image/jpeg" } |
            Select-Object -First 1

        $encoder = [System.Drawing.Imaging.Encoder]::Quality
        $encoderParams = New-Object System.Drawing.Imaging.EncoderParameters(1)
        $encoderParams.Param[0] =
            New-Object System.Drawing.Imaging.EncoderParameter(
                $encoder,
                [long]95
            )

        $img.Save(
            $tempPath,
            $jpegCodec,
            $encoderParams
        )

        $encoderParams.Dispose()

        $img.Dispose()
        $img = $null

        Move-Item -Force $tempPath $fullPath
    }
    finally {
        if ($null -ne $img) {
            $img.Dispose()
        }
    }
}
`;

const temporaryPs1 = path.join(
  dotRoot,
  ".dot-orientation-normalization-temp.ps1"
);

let completePsScript = powershellScript;

for (const target of targets) {
  const imagePath = path
    .join(preparedDir, target.file)
    .replaceAll("'", "''");

  completePsScript += `
Save-JpegRotated -InputPath '${imagePath}' -Rotation ${target.rotation}
`;
}

fs.writeFileSync(
  temporaryPs1,
  completePsScript,
  "utf8"
);

const before = {};

for (const target of targets) {
  const filePath = path.join(preparedDir, target.file);

  before[target.file] = {
    bytes: fs.statSync(filePath).size,
    sha256: sha256(filePath)
  };
}

try {
  execFileSync(
    "powershell.exe",
    [
      "-NoProfile",
      "-ExecutionPolicy",
      "Bypass",
      "-File",
      temporaryPs1
    ],
    {
      stdio: "inherit"
    }
  );
} catch (error) {
  if (fs.existsSync(temporaryPs1)) {
    fs.unlinkSync(temporaryPs1);
  }

  fail("Windows image orientation normalization failed.");
}

if (fs.existsSync(temporaryPs1)) {
  fs.unlinkSync(temporaryPs1);
}

const after = {};

for (const target of targets) {
  const filePath = path.join(preparedDir, target.file);

  if (!fs.existsSync(filePath)) {
    fail(`Normalized image disappeared: ${target.file}`);
  }

  const stat = fs.statSync(filePath);

  if (stat.size <= 0) {
    fail(`Normalized image is empty: ${target.file}`);
  }

  after[target.file] = {
    bytes: stat.size,
    sha256: sha256(filePath)
  };

  if (
    before[target.file].sha256 ===
    after[target.file].sha256
  ) {
    fail(
      `Expected derivative transformation did not occur: ${target.file}`
    );
  }
}

/*
 * Update only the prepared-derivative metadata.
 * The archival source hash information remains conceptually separate.
 */

for (const target of targets) {
  const asset = manifest.assets.find(
    (entry) => entry.preparedFile === target.file
  );

  if (!asset) {
    fail(`Manifest record missing for ${target.file}`);
  }

  asset.sourceExifOrientation =
    target.originalOrientation;

  asset.normalizationRotationDegrees =
    target.rotation;

  asset.orientationNormalized = true;

  asset.requiresOrientationNormalization = false;

  asset.preparedBytes =
    after[target.file].bytes;

  asset.preparedSha256 =
    after[target.file].sha256;

  /*
   * Previous Stage-1 sha256 represented the byte-identical
   * archival/source copy. Preserve it as sourceSha256.
   */
  if (!asset.sourceSha256 && asset.sha256) {
    asset.sourceSha256 = asset.sha256;
  }

  delete asset.sha256;

  asset.integrityVerified =
    "source-preserved; prepared-derivative-transformed";
}

manifest.policy.orientationNormalizationDeferred = false;
manifest.policy.orientationNormalizationCompleted = true;

manifest.orientationNormalization = {
  completed: true,
  transformedPreparedImages: 2,
  originalsModified: false,
  jpegQuality: 95,
  method:
    "Windows System.Drawing controlled prepared-derivative rotation"
};

fs.writeFileSync(
  manifestPath,
  JSON.stringify(manifest, null, 2),
  "utf8"
);

let report = "";

report +=
  "============================================================\n";

report +=
  "DIYA ASTRA - DOT ORIENTATION NORMALIZATION REPORT\n";

report +=
  "============================================================\n\n";

report +=
  "SOURCE ORIGINALS MODIFIED:\nNO\n\n";

report +=
  "PREPARED DERIVATIVES NORMALIZED:\n2\n\n";

for (const target of targets) {
  report += `${target.file}\n`;
  report += `Source original: ${target.source}\n`;
  report +=
    `Original EXIF orientation: ${target.originalOrientation}\n`;
  report +=
    `Applied rotation: ${target.rotation} degrees clockwise\n`;

  report +=
    `Before bytes: ${before[target.file].bytes}\n`;

  report +=
    `After bytes: ${after[target.file].bytes}\n`;

  report +=
    `Before SHA-256: ${before[target.file].sha256}\n`;

  report +=
    `After SHA-256: ${after[target.file].sha256}\n\n`;
}

report +=
  "MANIFEST UPDATED:\nYES\n\n";

report +=
  "ORIENTATION NORMALIZATION REMAINING:\n0\n\n";

report +=
  "PUBLIC-ASSET APPROVAL:\nNOT YET PERFORMED\n\n";

report +=
  "WEB OPTIMIZATION:\nNOT YET PERFORMED\n\n";

report +=
  "============================================================\n";

report +=
  "DOT PREPARATION STAGE 2 COMPLETE\n";

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
  "DIYA ASTRA - DOT PREPARATION STAGE 2 COMPLETE"
);

console.log(
  "=============================================="
);

console.log("");

console.log(
  "Prepared derivatives normalized: 2"
);

console.log(
  "Source originals modified       : NO"
);

console.log(
  "Orientation corrections remaining: 0"
);

console.log(
  "DOT manifest updated            : YES"
);

console.log("");

for (const target of targets) {
  console.log(
    `${target.file} -> ${target.rotation} degrees`
  );
}

console.log("");
console.log("Report:");
console.log(reportPath);
console.log("");
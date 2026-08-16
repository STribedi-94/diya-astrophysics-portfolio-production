$ErrorActionPreference = "Stop"

# ============================================================
# Diya Astrophysics Portfolio
# Cloudflare R2 Production Asset Uploader
# ============================================================

$BucketName = "astro-diya-assets"
$SourceRoot = Join-Path (Get-Location) "public\assets"
$LogFile = Join-Path (Get-Location) "r2-production-upload.log"

# ------------------------------------------------------------
# Production exclusions
# ------------------------------------------------------------

# Backup extensions must never be uploaded.
$ExcludedExtensions = @(
    ".bak"
)

# Exact non-runtime files that must not be uploaded.
$ExcludedRelativeFiles = @(
    "models/observatories/dot/dot-facility-web-v1.glb",
    "models/observatories/hct/hct-facility-web-v1.glb",
    "models/observatories/ugmrt/ugmrt-facility-web-v1.glb"
)

# Entire non-runtime/staging directories that must not be uploaded.
$ExcludedRelativeDirectories = @(
    "images/observatories/dot/New folder/"
)

function Get-NormalizedRelativePath {
    param(
        [Parameter(Mandatory = $true)]
        [string]$FullPath
    )

    return $FullPath.Substring($SourceRoot.Length).TrimStart("\", "/").Replace("\", "/")
}

function Test-ProductionAsset {
    param(
        [Parameter(Mandatory = $true)]
        [System.IO.FileInfo]$File
    )

    $extension = [System.IO.Path]::GetExtension($File.Name).ToLowerInvariant()

    if ($ExcludedExtensions -contains $extension) {
        return $false
    }

    $relativePath = Get-NormalizedRelativePath -FullPath $File.FullName

    if ($ExcludedRelativeFiles -contains $relativePath) {
        return $false
    }

    foreach ($directory in $ExcludedRelativeDirectories) {
        if ($relativePath.StartsWith($directory, [System.StringComparison]::OrdinalIgnoreCase)) {
            return $false
        }
    }

    return $true
}

function Get-ContentType {
    param(
        [Parameter(Mandatory = $true)]
        [string]$FilePath
    )

    $extension = [System.IO.Path]::GetExtension($FilePath).ToLowerInvariant()

    switch ($extension) {
        ".jpg"   { return "image/jpeg" }
        ".jpeg"  { return "image/jpeg" }
        ".png"   { return "image/png" }
        ".webp"  { return "image/webp" }
        ".gif"   { return "image/gif" }
        ".svg"   { return "image/svg+xml" }

        ".pdf"   { return "application/pdf" }

        ".glb"   { return "model/gltf-binary" }
        ".gltf"  { return "model/gltf+json" }

        ".json"  { return "application/json; charset=utf-8" }
        ".txt"   { return "text/plain; charset=utf-8" }
        ".csv"   { return "text/csv; charset=utf-8" }

        ".html"  { return "text/html; charset=utf-8" }
        ".css"   { return "text/css; charset=utf-8" }
        ".js"    { return "text/javascript; charset=utf-8" }

        ".mp4"   { return "video/mp4" }
        ".webm"  { return "video/webm" }

        ".mp3"   { return "audio/mpeg" }
        ".wav"   { return "audio/wav" }

        default  { return "application/octet-stream" }
    }
}

function Write-Log {
    param(
        [Parameter(Mandatory = $true)]
        [string]$Message
    )

    $timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
    $line = "[$timestamp] $Message"

    Write-Host $line
    Add-Content -LiteralPath $LogFile -Value $line
}

# ------------------------------------------------------------
# Initial validation
# ------------------------------------------------------------

if (-not (Test-Path -LiteralPath $SourceRoot -PathType Container)) {
    throw "Source asset directory does not exist: $SourceRoot"
}

Set-Content -LiteralPath $LogFile -Value @"
============================================================
DIYA ASTROPHYSICS PORTFOLIO
CLOUDFLARE R2 PRODUCTION ASSET UPLOAD
============================================================
Started: $(Get-Date -Format "yyyy-MM-dd HH:mm:ss")
Bucket:  $BucketName
Source:  $SourceRoot
============================================================
"@

Write-Log "Beginning pre-upload inventory."

$AllFiles = @(
    Get-ChildItem -LiteralPath $SourceRoot -File -Recurse |
        Sort-Object FullName
)

if ($AllFiles.Count -eq 0) {
    throw "No files were found under $SourceRoot"
}

$UploadFiles = @(
    $AllFiles | Where-Object {
        Test-ProductionAsset -File $_
    }
)

$SkippedFiles = @(
    $AllFiles | Where-Object {
        -not (Test-ProductionAsset -File $_)
    }
)

$TotalBytes = ($UploadFiles | Measure-Object -Property Length -Sum).Sum

if ($null -eq $TotalBytes) {
    $TotalBytes = 0
}

Write-Log "Files discovered: $($AllFiles.Count)"
Write-Log "Files selected for upload: $($UploadFiles.Count)"
Write-Log "Files excluded: $($SkippedFiles.Count)"
Write-Log "Selected upload bytes: $TotalBytes"

foreach ($SkippedFile in $SkippedFiles) {
    $relativeSkippedPath = Get-NormalizedRelativePath -FullPath $SkippedFile.FullName
    Write-Log "SKIP: $relativeSkippedPath"
}

Write-Log "Pre-upload inventory complete."
Write-Log "Starting R2 upload."

# ------------------------------------------------------------
# Upload
# ------------------------------------------------------------

$UploadedCount = 0
$UploadedBytes = [int64]0

foreach ($File in $UploadFiles) {

    $ObjectKey = Get-NormalizedRelativePath -FullPath $File.FullName
    $ContentType = Get-ContentType -FilePath $File.FullName
    $CurrentNumber = $UploadedCount + 1

    Write-Log "UPLOAD [$CurrentNumber/$($UploadFiles.Count)]: $ObjectKey"
    Write-Log "  Local file: $($File.FullName)"
    Write-Log "  Size: $($File.Length) bytes"
    Write-Log "  Content-Type: $ContentType"

    & npx wrangler r2 object put "$BucketName/$ObjectKey" `
        --file "$($File.FullName)" `
        --content-type "$ContentType" `
        --remote 2>&1 | ForEach-Object {
            $wranglerLine = $_.ToString()
            Write-Host $wranglerLine
            Add-Content -LiteralPath $LogFile -Value $wranglerLine
        }

    if ($LASTEXITCODE -ne 0) {
        Write-Log "FAILED: $ObjectKey"
        Write-Log "Wrangler exit code: $LASTEXITCODE"
        throw "R2 upload failed for object: $ObjectKey"
    }

    $UploadedCount++
    $UploadedBytes += $File.Length

    Write-Log "SUCCESS: $ObjectKey"
}

# ------------------------------------------------------------
# Completion summary
# ------------------------------------------------------------

Write-Log "============================================================"
Write-Log "R2 PRODUCTION ASSET UPLOAD COMPLETED"
Write-Log "Uploaded files: $UploadedCount"
Write-Log "Uploaded bytes: $UploadedBytes"
Write-Log "Excluded files: $($SkippedFiles.Count)"
Write-Log "Bucket: $BucketName"
Write-Log "============================================================"

Write-Host ""
Write-Host "============================================================"
Write-Host "UPLOAD COMPLETE"
Write-Host "Files uploaded: $UploadedCount"
Write-Host "Bytes uploaded: $UploadedBytes"
Write-Host "Files excluded: $($SkippedFiles.Count)"
Write-Host "Log file: $LogFile"
Write-Host "============================================================"
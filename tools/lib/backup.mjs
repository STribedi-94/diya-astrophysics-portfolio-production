import path from "node:path";
import {
  copyFile,
  ensureDirectory,
  exists,
  getFileInfo,
  isFile,
  writeJson,
} from "./filesystem.mjs";

function pad(value) {
  return String(value).padStart(2, "0");
}

export function createTimestamp(date = new Date()) {
  return [
    date.getFullYear(),
    pad(date.getMonth() + 1),
    pad(date.getDate()),
    "-",
    pad(date.getHours()),
    pad(date.getMinutes()),
    pad(date.getSeconds()),
  ].join("");
}

export function createBackupName(filePath, options = {}) {
  const {
    timestamp = createTimestamp(),
    suffix = "backup",
  } = options;

  const extension = path.extname(filePath);
  const basename = path.basename(filePath, extension);

  return `${basename}.${timestamp}.${suffix}${extension}`;
}

export function backupFile(filePath, backupDirectory, options = {}) {
  const {
    overwrite = false,
    timestamp = createTimestamp(),
    suffix = "backup",
  } = options;

  const resolvedFile = path.resolve(filePath);
  const resolvedBackupDirectory = ensureDirectory(backupDirectory);

  if (!isFile(resolvedFile)) {
    throw new Error(`Cannot back up missing file:\n${resolvedFile}`);
  }

  const backupName = createBackupName(resolvedFile, {
    timestamp,
    suffix,
  });

  const backupPath = path.join(
    resolvedBackupDirectory,
    backupName,
  );

  copyFile(resolvedFile, backupPath, {
    overwrite,
  });

  return backupPath;
}

export function backupFiles(filePaths, backupDirectory, options = {}) {
  const {
    timestamp = createTimestamp(),
    manifestName = `backup-manifest.${timestamp}.json`,
  } = options;

  const resolvedBackupDirectory = ensureDirectory(backupDirectory);
  const backups = [];

  for (const filePath of filePaths) {
    const resolvedFile = path.resolve(filePath);

    if (!isFile(resolvedFile)) {
      throw new Error(`Cannot back up missing file:\n${resolvedFile}`);
    }

    const backupPath = backupFile(
      resolvedFile,
      resolvedBackupDirectory,
      {
        ...options,
        timestamp,
      },
    );

    backups.push({
      source: resolvedFile,
      backup: backupPath,
      sourceInfo: getFileInfo(resolvedFile),
      backupInfo: getFileInfo(backupPath),
    });
  }

  const manifestPath = path.join(
    resolvedBackupDirectory,
    manifestName,
  );

  writeJson(manifestPath, {
    createdAt: new Date().toISOString(),
    timestamp,
    backupDirectory: resolvedBackupDirectory,
    files: backups,
  });

  return {
    backupDirectory: resolvedBackupDirectory,
    manifestPath,
    files: backups,
  };
}

export function restoreBackup(backupPath, destinationPath, options = {}) {
  const {
    overwrite = false,
  } = options;

  const resolvedBackup = path.resolve(backupPath);
  const resolvedDestination = path.resolve(destinationPath);

  if (!isFile(resolvedBackup)) {
    throw new Error(`Backup file does not exist:\n${resolvedBackup}`);
  }

  if (exists(resolvedDestination) && !overwrite) {
    throw new Error(
      `Destination already exists:\n${resolvedDestination}`,
    );
  }

  copyFile(resolvedBackup, resolvedDestination, {
    overwrite,
  });

  return resolvedDestination;
}

export function verifyBackup(backupPath) {
  const resolvedBackup = path.resolve(backupPath);

  if (!isFile(resolvedBackup)) {
    return {
      valid: false,
      path: resolvedBackup,
      reason: "Backup file does not exist.",
    };
  }

  const info = getFileInfo(resolvedBackup);

  return {
    valid: true,
    path: resolvedBackup,
    info,
  };
}
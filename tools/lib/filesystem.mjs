import fs from "node:fs";
import path from "node:path";

/**
 * Return true when a filesystem entry exists.
 */
export function exists(targetPath) {
  return fs.existsSync(path.resolve(targetPath));
}

/**
 * Return true when the path points to a regular file.
 */
export function isFile(targetPath) {
  try {
    return fs.statSync(path.resolve(targetPath)).isFile();
  } catch {
    return false;
  }
}

/**
 * Return true when the path points to a directory.
 */
export function isDirectory(targetPath) {
  try {
    return fs.statSync(path.resolve(targetPath)).isDirectory();
  } catch {
    return false;
  }
}

/**
 * Create a directory and all missing parent directories.
 */
export function ensureDirectory(directoryPath) {
  const resolvedPath = path.resolve(directoryPath);

  fs.mkdirSync(resolvedPath, {
    recursive: true,
  });

  return resolvedPath;
}

/**
 * Read a UTF-8 text file.
 */
export function readText(filePath) {
  const resolvedPath = path.resolve(filePath);

  if (!isFile(resolvedPath)) {
    throw new Error(`Text file does not exist:\n${resolvedPath}`);
  }

  return fs.readFileSync(resolvedPath, "utf8");
}

/**
 * Read and parse a JSON file.
 */
export function readJson(filePath) {
  const resolvedPath = path.resolve(filePath);
  const contents = readText(resolvedPath);

  try {
    return JSON.parse(contents);
  } catch (error) {
    throw new Error(
      [
        `Unable to parse JSON file:`,
        resolvedPath,
        "",
        error instanceof Error ? error.message : String(error),
      ].join("\n"),
    );
  }
}

/**
 * Write a UTF-8 text file.
 *
 * Parent directories are created automatically.
 */
export function writeText(filePath, contents, options = {}) {
  const {
    overwrite = true,
    lineEnding = null,
  } = options;

  const resolvedPath = path.resolve(filePath);

  if (!overwrite && exists(resolvedPath)) {
    throw new Error(`Refusing to overwrite existing file:\n${resolvedPath}`);
  }

  ensureDirectory(path.dirname(resolvedPath));

  let output = String(contents);

  if (lineEnding === "lf") {
    output = output.replace(/\r\n/g, "\n");
  } else if (lineEnding === "crlf") {
    output = output.replace(/\r?\n/g, "\r\n");
  }

  fs.writeFileSync(resolvedPath, output, "utf8");

  return resolvedPath;
}

/**
 * Serialize and write a JSON file.
 */
export function writeJson(filePath, value, options = {}) {
  const {
    spaces = 2,
    trailingNewline = true,
    overwrite = true,
  } = options;

  let output = JSON.stringify(value, null, spaces);

  if (trailingNewline) {
    output += "\n";
  }

  return writeText(filePath, output, {
    overwrite,
  });
}

/**
 * Append UTF-8 text to a file.
 *
 * Parent directories are created automatically.
 */
export function appendText(filePath, contents) {
  const resolvedPath = path.resolve(filePath);

  ensureDirectory(path.dirname(resolvedPath));
  fs.appendFileSync(resolvedPath, String(contents), "utf8");

  return resolvedPath;
}

/**
 * Copy one file to another location.
 */
export function copyFile(sourcePath, destinationPath, options = {}) {
  const {
    overwrite = false,
  } = options;

  const resolvedSource = path.resolve(sourcePath);
  const resolvedDestination = path.resolve(destinationPath);

  if (!isFile(resolvedSource)) {
    throw new Error(`Source file does not exist:\n${resolvedSource}`);
  }

  if (!overwrite && exists(resolvedDestination)) {
    throw new Error(
      `Destination file already exists:\n${resolvedDestination}`,
    );
  }

  ensureDirectory(path.dirname(resolvedDestination));

  fs.copyFileSync(
    resolvedSource,
    resolvedDestination,
    overwrite ? 0 : fs.constants.COPYFILE_EXCL,
  );

  return resolvedDestination;
}

/**
 * Move or rename a file.
 */
export function moveFile(sourcePath, destinationPath, options = {}) {
  const {
    overwrite = false,
  } = options;

  const resolvedSource = path.resolve(sourcePath);
  const resolvedDestination = path.resolve(destinationPath);

  if (!isFile(resolvedSource)) {
    throw new Error(`Source file does not exist:\n${resolvedSource}`);
  }

  if (exists(resolvedDestination)) {
    if (!overwrite) {
      throw new Error(
        `Destination file already exists:\n${resolvedDestination}`,
      );
    }

    removeFile(resolvedDestination);
  }

  ensureDirectory(path.dirname(resolvedDestination));

  try {
    fs.renameSync(resolvedSource, resolvedDestination);
  } catch (error) {
    const code =
      error && typeof error === "object" && "code" in error
        ? error.code
        : null;

    if (code !== "EXDEV") {
      throw error;
    }

    copyFile(resolvedSource, resolvedDestination, {
      overwrite,
    });

    removeFile(resolvedSource);
  }

  return resolvedDestination;
}

/**
 * Remove a file.
 *
 * Missing files are ignored unless required is true.
 */
export function removeFile(filePath, options = {}) {
  const {
    required = false,
  } = options;

  const resolvedPath = path.resolve(filePath);

  if (!exists(resolvedPath)) {
    if (required) {
      throw new Error(`File does not exist:\n${resolvedPath}`);
    }

    return false;
  }

  if (!isFile(resolvedPath)) {
    throw new Error(`Path is not a regular file:\n${resolvedPath}`);
  }

  fs.unlinkSync(resolvedPath);

  return true;
}

/**
 * Remove a directory.
 */
export function removeDirectory(directoryPath, options = {}) {
  const {
    recursive = false,
    required = false,
  } = options;

  const resolvedPath = path.resolve(directoryPath);

  if (!exists(resolvedPath)) {
    if (required) {
      throw new Error(`Directory does not exist:\n${resolvedPath}`);
    }

    return false;
  }

  if (!isDirectory(resolvedPath)) {
    throw new Error(`Path is not a directory:\n${resolvedPath}`);
  }

  fs.rmSync(resolvedPath, {
    recursive,
    force: false,
  });

  return true;
}

/**
 * Return immediate entries inside a directory.
 */
export function listEntries(directoryPath, options = {}) {
  const {
    includeFiles = true,
    includeDirectories = true,
    absolute = true,
    sort = true,
  } = options;

  const resolvedPath = path.resolve(directoryPath);

  if (!isDirectory(resolvedPath)) {
    throw new Error(`Directory does not exist:\n${resolvedPath}`);
  }

  let entries = fs
    .readdirSync(resolvedPath, {
      withFileTypes: true,
    })
    .filter((entry) => {
      if (entry.isFile()) {
        return includeFiles;
      }

      if (entry.isDirectory()) {
        return includeDirectories;
      }

      return false;
    })
    .map((entry) => {
      const entryPath = path.join(resolvedPath, entry.name);

      return {
        name: entry.name,
        path: absolute ? entryPath : entry.name,
        type: entry.isDirectory() ? "directory" : "file",
      };
    });

  if (sort) {
    entries = entries.sort((left, right) =>
      left.name.localeCompare(right.name),
    );
  }

  return entries;
}

/**
 * Recursively list files below a directory.
 */
export function listFilesRecursive(directoryPath, options = {}) {
  const {
    absolute = true,
    extensions = null,
    ignoreDirectories = [],
  } = options;

  const resolvedRoot = path.resolve(directoryPath);

  if (!isDirectory(resolvedRoot)) {
    throw new Error(`Directory does not exist:\n${resolvedRoot}`);
  }

  const normalizedExtensions = extensions
    ? new Set(
        extensions.map((extension) =>
          extension.startsWith(".")
            ? extension.toLowerCase()
            : `.${extension.toLowerCase()}`,
        ),
      )
    : null;

  const ignored = new Set(ignoreDirectories);
  const results = [];

  function visit(currentDirectory) {
    const entries = fs.readdirSync(currentDirectory, {
      withFileTypes: true,
    });

    for (const entry of entries) {
      const entryPath = path.join(currentDirectory, entry.name);

      if (entry.isDirectory()) {
        if (!ignored.has(entry.name)) {
          visit(entryPath);
        }

        continue;
      }

      if (!entry.isFile()) {
        continue;
      }

      if (
        normalizedExtensions &&
        !normalizedExtensions.has(path.extname(entry.name).toLowerCase())
      ) {
        continue;
      }

      results.push(
        absolute
          ? entryPath
          : path.relative(resolvedRoot, entryPath),
      );
    }
  }

  visit(resolvedRoot);

  return results.sort((left, right) =>
    left.localeCompare(right),
  );
}

/**
 * Return basic filesystem metadata.
 */
export function getFileInfo(targetPath) {
  const resolvedPath = path.resolve(targetPath);

  if (!exists(resolvedPath)) {
    return null;
  }

  const stats = fs.statSync(resolvedPath);

  return {
    path: resolvedPath,
    name: path.basename(resolvedPath),
    extension: stats.isFile()
      ? path.extname(resolvedPath).toLowerCase()
      : "",
    type: stats.isDirectory() ? "directory" : "file",
    size: stats.size,
    createdAt: stats.birthtime,
    modifiedAt: stats.mtime,
  };
}

/**
 * Determine whether a filename probably contains text.
 */
export function isTextFile(filePath) {
  const extension = path.extname(filePath).toLowerCase();

  const textExtensions = new Set([
    ".css",
    ".csv",
    ".html",
    ".js",
    ".json",
    ".jsx",
    ".md",
    ".mjs",
    ".cjs",
    ".scss",
    ".svg",
    ".toml",
    ".ts",
    ".tsx",
    ".txt",
    ".xml",
    ".yaml",
    ".yml",
  ]);

  return textExtensions.has(extension);
}

/**
 * Create a file only when it does not already exist.
 */
export function touchFile(filePath) {
  const resolvedPath = path.resolve(filePath);

  ensureDirectory(path.dirname(resolvedPath));

  if (!exists(resolvedPath)) {
    fs.writeFileSync(resolvedPath, "", "utf8");
  }

  return resolvedPath;
}
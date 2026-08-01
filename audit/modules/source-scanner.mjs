import { readFile, readdir } from "node:fs/promises";
import path from "node:path";

const SOURCE_EXTENSIONS = new Set([".js", ".jsx", ".ts", ".tsx"]);

async function listSourceFiles(directoryPath) {
  const entries = await readdir(directoryPath, { withFileTypes: true });
  const files = [];

  for (const entry of entries) {
    const fullPath = path.join(directoryPath, entry.name);

    if (entry.isDirectory()) {
      files.push(...(await listSourceFiles(fullPath)));
      continue;
    }

    if (entry.isFile() && SOURCE_EXTENSIONS.has(path.extname(entry.name))) {
      files.push(fullPath);
    }
  }

  return files;
}

function findAssetJsonImports(sourceText) {
  const importPattern =
    /import\s+([A-Za-z_$][\w$]*)\s+from\s+["']([^"']+\.asset\.json)["'];?/g;

  const matches = [];
  let match;

  while ((match = importPattern.exec(sourceText)) !== null) {
    matches.push({
      importedName: match[1],
      importPath: match[2],
      fullMatch: match[0],
      startIndex: match.index,
      endIndex: importPattern.lastIndex,
    });
  }

  return matches;
}

export async function scanAssetJsonImports(sourceRoot) {
  const sourceFiles = await listSourceFiles(sourceRoot);
  const results = [];

  for (const filePath of sourceFiles) {
    const sourceText = await readFile(filePath, "utf8");
    const imports = findAssetJsonImports(sourceText);

    if (imports.length === 0) {
      continue;
    }

    results.push({
      filePath,
      relativePath: path.relative(sourceRoot, filePath),
      imports,
    });
  }

  return {
    sourceRoot,
    filesScanned: sourceFiles.length,
    filesWithAssetImports: results.length,
    totalAssetImports: results.reduce(
      (total, item) => total + item.imports.length,
      0
    ),
    files: results,
  };
}
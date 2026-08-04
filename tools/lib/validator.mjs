import path from "node:path";
import {
  exists,
  isDirectory,
  isFile,
  readText,
  readJson,
} from "./filesystem.mjs";

export function assert(condition, message = "Assertion failed.") {
  if (!condition) {
    throw new Error(message);
  }
}

export function assertExists(targetPath) {
  const resolved = path.resolve(targetPath);

  if (!exists(resolved)) {
    throw new Error(`Path does not exist:\n${resolved}`);
  }

  return resolved;
}

export function assertFile(targetPath) {
  const resolved = path.resolve(targetPath);

  if (!isFile(resolved)) {
    throw new Error(`Expected file:\n${resolved}`);
  }

  return resolved;
}

export function assertDirectory(targetPath) {
  const resolved = path.resolve(targetPath);

  if (!isDirectory(resolved)) {
    throw new Error(`Expected directory:\n${resolved}`);
  }

  return resolved;
}

export function assertTextContains(filePath, expectedText) {
  const contents = readText(assertFile(filePath));

  if (!contents.includes(expectedText)) {
    throw new Error(
      [
        "Expected text was not found.",
        "",
        `File: ${filePath}`,
        "",
        expectedText,
      ].join("\n"),
    );
  }

  return true;
}

export function assertTextNotContains(filePath, unexpectedText) {
  const contents = readText(assertFile(filePath));

  if (contents.includes(unexpectedText)) {
    throw new Error(
      [
        "Unexpected text was found.",
        "",
        `File: ${filePath}`,
        "",
        unexpectedText,
      ].join("\n"),
    );
  }

  return true;
}

export function assertJsonProperty(
  filePath,
  propertyName,
) {
  const json = readJson(assertFile(filePath));

  if (!(propertyName in json)) {
    throw new Error(
      `Missing JSON property '${propertyName}' in ${filePath}`,
    );
  }

  return json[propertyName];
}

export function assertPackageName(
  packageJsonPath,
  expectedName,
) {
  const actual = assertJsonProperty(
    packageJsonPath,
    "name",
  );

  if (actual !== expectedName) {
    throw new Error(
      [
        "Unexpected package name.",
        `Expected: ${expectedName}`,
        `Actual:   ${actual}`,
      ].join("\n"),
    );
  }

  return actual;
}

export function assertArrayLength(
  array,
  expectedLength,
  label = "Array",
) {
  if (!Array.isArray(array)) {
    throw new Error(`${label} is not an array.`);
  }

  if (array.length !== expectedLength) {
    throw new Error(
      [
        `${label} length mismatch.`,
        `Expected: ${expectedLength}`,
        `Actual:   ${array.length}`,
      ].join("\n"),
    );
  }

  return true;
}

export function assertNoDuplicateStrings(
  values,
  label = "Array",
) {
  const duplicates = [];

  const seen = new Set();

  for (const value of values) {
    if (seen.has(value)) {
      duplicates.push(value);
    }

    seen.add(value);
  }

  if (duplicates.length > 0) {
    throw new Error(
      [
        `${label} contains duplicate values.`,
        "",
        ...duplicates,
      ].join("\n"),
    );
  }

  return true;
}

export function assertRegex(
  filePath,
  regex,
  description = "Pattern",
) {
  const contents = readText(assertFile(filePath));

  if (!regex.test(contents)) {
    throw new Error(
      `${description} not found in ${filePath}`,
    );
  }

  return true;
}

export function validateBuilderEnvironment({
  repositoryRoot,
  packageJson,
  expectedPackageName,
}) {
  assertDirectory(repositoryRoot);

  assertFile(packageJson);

  assertPackageName(
    packageJson,
    expectedPackageName,
  );

  return true;
}
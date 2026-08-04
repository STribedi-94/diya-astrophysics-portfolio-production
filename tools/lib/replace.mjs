import path from "node:path";
import {
  isFile,
  readText,
  writeText,
} from "./filesystem.mjs";

export function assertContains(contents, searchValue, options = {}) {
  const {
    label = "Expected content",
  } = options;

  if (!String(contents).includes(searchValue)) {
    throw new Error(
      [
        `${label} was not found.`,
        "",
        `Search value:`,
        String(searchValue),
      ].join("\n"),
    );
  }

  return true;
}

export function assertNotContains(contents, searchValue, options = {}) {
  const {
    label = "Unexpected content",
  } = options;

  if (String(contents).includes(searchValue)) {
    throw new Error(
      [
        `${label} was found.`,
        "",
        `Search value:`,
        String(searchValue),
      ].join("\n"),
    );
  }

  return true;
}

export function countOccurrences(contents, searchValue) {
  const source = String(contents);

  if (searchValue === "") {
    return 0;
  }

  let count = 0;
  let index = 0;

  while (true) {
    index = source.indexOf(searchValue, index);

    if (index === -1) {
      break;
    }

    count += 1;
    index += searchValue.length;
  }

  return count;
}

export function replaceOnce(contents, searchValue, replacement, options = {}) {
  const {
    label = "Replacement target",
  } = options;

  const source = String(contents);
  const occurrenceCount = countOccurrences(source, searchValue);

  if (occurrenceCount === 0) {
    throw new Error(
      [
        `${label} was not found.`,
        "",
        `Search value:`,
        String(searchValue),
      ].join("\n"),
    );
  }

  if (occurrenceCount > 1) {
    throw new Error(
      [
        `${label} appeared more than once.`,
        `Occurrences: ${occurrenceCount}`,
        "",
        "Use replaceAllChecked() when multiple replacements are intentional.",
      ].join("\n"),
    );
  }

  return source.replace(searchValue, replacement);
}

export function replaceAllChecked(
  contents,
  searchValue,
  replacement,
  options = {},
) {
  const {
    expectedCount = null,
    minimumCount = 1,
    label = "Replacement target",
  } = options;

  const source = String(contents);
  const occurrenceCount = countOccurrences(source, searchValue);

  if (occurrenceCount < minimumCount) {
    throw new Error(
      [
        `${label} did not meet the minimum occurrence count.`,
        `Expected at least: ${minimumCount}`,
        `Found: ${occurrenceCount}`,
      ].join("\n"),
    );
  }

  if (
    expectedCount !== null &&
    occurrenceCount !== expectedCount
  ) {
    throw new Error(
      [
        `${label} occurrence count did not match.`,
        `Expected: ${expectedCount}`,
        `Found: ${occurrenceCount}`,
      ].join("\n"),
    );
  }

  return source.split(searchValue).join(replacement);
}

export function replaceRegexOnce(
  contents,
  pattern,
  replacement,
  options = {},
) {
  const {
    label = "Regex replacement target",
  } = options;

  if (!(pattern instanceof RegExp)) {
    throw new TypeError("pattern must be a RegExp instance.");
  }

  const source = String(contents);

  const flags = pattern.flags.replace("g", "");
  const singlePattern = new RegExp(pattern.source, flags);
  const match = source.match(singlePattern);

  if (!match) {
    throw new Error(`${label} was not found.`);
  }

  const globalPattern = new RegExp(
    pattern.source,
    flags.includes("g") ? flags : `${flags}g`,
  );

  const allMatches = source.match(globalPattern) ?? [];

  if (allMatches.length > 1) {
    throw new Error(
      [
        `${label} appeared more than once.`,
        `Occurrences: ${allMatches.length}`,
      ].join("\n"),
    );
  }

  return source.replace(singlePattern, replacement);
}

export function patchText(contents, operations = []) {
  let output = String(contents);

  for (const operation of operations) {
    const {
      type = "replaceOnce",
      search,
      replacement = "",
      options = {},
    } = operation;

    switch (type) {
      case "assertContains":
        assertContains(output, search, options);
        break;

      case "assertNotContains":
        assertNotContains(output, search, options);
        break;

      case "replaceOnce":
        output = replaceOnce(
          output,
          search,
          replacement,
          options,
        );
        break;

      case "replaceAll":
        output = replaceAllChecked(
          output,
          search,
          replacement,
          options,
        );
        break;

      case "replaceRegexOnce":
        output = replaceRegexOnce(
          output,
          search,
          replacement,
          options,
        );
        break;

      default:
        throw new Error(`Unsupported patch operation: ${type}`);
    }
  }

  return output;
}

export function patchFile(filePath, operations = [], options = {}) {
  const {
    overwrite = true,
    lineEnding = null,
  } = options;

  const resolvedPath = path.resolve(filePath);

  if (!isFile(resolvedPath)) {
    throw new Error(`Patch target does not exist:\n${resolvedPath}`);
  }

  const original = readText(resolvedPath);
  const updated = patchText(original, operations);

  if (updated === original) {
    return {
      changed: false,
      path: resolvedPath,
      original,
      updated,
    };
  }

  writeText(resolvedPath, updated, {
    overwrite,
    lineEnding,
  });

  return {
    changed: true,
    path: resolvedPath,
    original,
    updated,
  };
}
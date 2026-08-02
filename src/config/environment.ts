/**
 * Shared reader and validator for public Vite environment variables.
 *
 * Only non-secret values may be accessed through this module because every
 * VITE_* variable can be included in browser-delivered application code.
 */

type PublicEnvironment = Record<string, string | undefined>;

function getPublicEnvironment(): PublicEnvironment {
  return (import.meta as unknown as { env?: PublicEnvironment }).env ?? {};
}

export function readPublicEnv(key: `VITE_${string}`): string | undefined {
  const value = getPublicEnvironment()[key];

  if (typeof value !== "string") {
    return undefined;
  }

  const normalized = value.trim();
  return normalized.length > 0 ? normalized : undefined;
}

/**
 * Accepts a same-origin path beginning with "/" or an absolute HTTP(S) URL.
 */
export function resolvePublicUrl(
  value: string | undefined,
  fallback: string,
): string {
  const candidate = value ?? fallback;

  if (candidate.startsWith("/")) {
    return candidate;
  }

  try {
    const url = new URL(candidate);

    if (url.protocol === "http:" || url.protocol === "https:") {
      return url.toString();
    }
  } catch {
    // Use the safe fallback below.
  }

  return fallback;
}

/**
 * Removes trailing slashes while preserving the root path "/".
 */
export function normalizeBaseUrl(value: string): string {
  if (value === "/") {
    return value;
  }

  return value.replace(/\/+$/, "");
}
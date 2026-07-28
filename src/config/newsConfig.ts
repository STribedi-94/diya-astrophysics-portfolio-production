/**
 * Environment-driven configuration for the Astrophysics News Hub.
 *
 * Only public, non-secret values may live here — the browser can read them.
 * No API tokens, no feed credentials.
 */

export type NewsMode = "demo" | "live";

const DEFAULT_MODE: NewsMode = "demo";
const DEFAULT_API_URL = "/api/news";
const DEFAULT_PAGE_SIZE = 12;

function readEnv(key: string): string | undefined {
  const env = (import.meta as unknown as { env?: Record<string, string | undefined> }).env;
  const value = env?.[key];
  return typeof value === "string" && value.trim() ? value.trim() : undefined;
}

function resolveMode(): NewsMode {
  const raw = readEnv("VITE_NEWS_MODE")?.toLowerCase();
  if (raw === "live" || raw === "demo") return raw;
  if (raw && import.meta.env?.DEV) {
    console.warn(`[news] Unknown VITE_NEWS_MODE "${raw}" — falling back to "${DEFAULT_MODE}".`);
  }
  return DEFAULT_MODE;
}

function resolveApiUrl(): string {
  const raw = readEnv("VITE_NEWS_API_URL") ?? DEFAULT_API_URL;
  // Accept same-origin paths or absolute http(s) endpoints only.
  if (raw.startsWith("/")) return raw;
  try {
    const url = new URL(raw);
    if (url.protocol === "http:" || url.protocol === "https:") return url.toString();
  } catch {
    /* fall through */
  }
  return DEFAULT_API_URL;
}

export const newsConfig = {
  mode: resolveMode(),
  apiUrl: resolveApiUrl(),
  pageSize: DEFAULT_PAGE_SIZE,
  requestTimeoutMs: 12_000,
} as const;

export const isDemoMode = newsConfig.mode === "demo";

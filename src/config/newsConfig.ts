/**
 * Environment-driven configuration for the Astrophysics News Hub.
 *
 * Only public, non-secret values may live here because VITE_* variables
 * can be included in browser-delivered application code.
 */

import { readPublicEnv, resolvePublicUrl } from "@/config/environment";

export type NewsMode = "demo" | "live";

const DEFAULT_MODE: NewsMode = "live";
const DEFAULT_API_URL = "/api/news";
const DEFAULT_PAGE_SIZE = 12;

function resolveMode(): NewsMode {
  const raw = readPublicEnv("VITE_NEWS_MODE")?.toLowerCase();

  if (raw === "live" || raw === "demo") {
    return raw;
  }

  if (raw && import.meta.env?.DEV) {
    console.warn(
      `[news] Unknown VITE_NEWS_MODE "${raw}" — falling back to "${DEFAULT_MODE}".`,
    );
  }

  return DEFAULT_MODE;
}

export const newsConfig = {
  mode: resolveMode(),
  apiUrl: resolvePublicUrl(
    readPublicEnv("VITE_NEWS_API_URL"),
    DEFAULT_API_URL,
  ),
  pageSize: DEFAULT_PAGE_SIZE,
  requestTimeoutMs: 12_000,
} as const;

export const isDemoMode = newsConfig.mode === "demo";
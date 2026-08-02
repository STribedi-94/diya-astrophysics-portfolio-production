/**
 * Public asset configuration.
 *
 * This module defines how production asset paths are resolved.
 * Components should use these helpers instead of hardcoding
 * "/assets/..." or future Cloudflare Worker URLs.
 */

import { normalizeBaseUrl, readPublicEnv } from "@/config/environment";

const DEFAULT_ASSET_BASE_URL = "/assets";

export const assetConfig = {
  baseUrl: normalizeBaseUrl(
    readPublicEnv("VITE_ASSET_BASE_URL") ?? DEFAULT_ASSET_BASE_URL,
  ),
} as const;

/**
 * Resolves a stable relative asset key into a public URL.
 *
 * Example:
 * assetUrl("documents/cv/diya-ram-cv.pdf")
 */
export function assetUrl(relativePath: string): string {
  const cleanPath = relativePath.replace(/^\/+/, "");

  return `${assetConfig.baseUrl}/${cleanPath}`;
}
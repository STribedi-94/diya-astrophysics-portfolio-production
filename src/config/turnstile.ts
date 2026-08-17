/**
 * Public Cloudflare Turnstile configuration for the Contact form.
 *
 * The Site Key is intentionally public and may be included in browser code.
 * The Turnstile Secret Key must never be stored here or in any VITE_* variable.
 */

import { readPublicEnv } from "@/config/environment";

export const turnstileConfig = {
  siteKey: readPublicEnv("VITE_TURNSTILE_SITE_KEY") ?? "",
} as const;

export const isTurnstileConfigured = turnstileConfig.siteKey.length > 0;

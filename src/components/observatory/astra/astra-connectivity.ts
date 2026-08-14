/**
 * Project Diya Astra — Global Connectivity
 *
 * Lightweight website-wide navigation state for entering Project Astra
 * from any normal visitor-facing page and returning to the originating
 * page/subpage afterwards.
 *
 * IMPORTANT:
 * This module remains independent from Three.js, GlobeScene,
 * Observatory GLBs, TESS rendering and other heavy Astra runtime systems.
 */

export const ASTRA_ROUTE = "/observations";
export const ASTRA_NETWORK_HASH = "network";

const ASTRA_ORIGIN_STORAGE_KEY = "diya-astra-origin-v1";

export type AstraOrigin = {
  pathname: string;
  search: string;
  hash: string;
  scrollY: number;
  capturedAt: number;
};

function canUseBrowserStorage() {
  return (
    typeof window !== "undefined" &&
    typeof window.sessionStorage !== "undefined"
  );
}

/**
 * Capture the visitor's current website position immediately before
 * entering Project Astra.
 *
 * Entry scrolling itself is owned by TanStack Router through the
 * /observations#network navigation. Storage is used only for the future
 * Return to Website journey.
 */
export function rememberAstraOrigin(): AstraOrigin | null {
  if (!canUseBrowserStorage()) return null;

  const origin: AstraOrigin = {
    pathname: window.location.pathname || "/",
    search: window.location.search || "",
    hash: window.location.hash || "",
    scrollY: Math.max(0, window.scrollY || 0),
    capturedAt: Date.now(),
  };

  try {
    window.sessionStorage.setItem(
      ASTRA_ORIGIN_STORAGE_KEY,
      JSON.stringify(origin),
    );
  } catch {
    // Astra entry must still navigate if browser storage is unavailable.
  }

  return origin;
}

/**
 * Read the remembered website origin without destroying it.
 */
export function getAstraOrigin(): AstraOrigin | null {
  if (!canUseBrowserStorage()) return null;

  try {
    const raw = window.sessionStorage.getItem(
      ASTRA_ORIGIN_STORAGE_KEY,
    );

    if (!raw) return null;

    const parsed = JSON.parse(raw) as Partial<AstraOrigin>;

    if (
      typeof parsed.pathname !== "string" ||
      typeof parsed.search !== "string" ||
      typeof parsed.hash !== "string" ||
      typeof parsed.scrollY !== "number"
    ) {
      return null;
    }

    return {
      pathname: parsed.pathname,
      search: parsed.search,
      hash: parsed.hash,
      scrollY: Math.max(0, parsed.scrollY),
      capturedAt:
        typeof parsed.capturedAt === "number"
          ? parsed.capturedAt
          : 0,
    };
  } catch {
    return null;
  }
}

/**
 * Remove the stored origin after a completed return operation.
 */
export function clearAstraOrigin() {
  if (!canUseBrowserStorage()) return;

  try {
    window.sessionStorage.removeItem(
      ASTRA_ORIGIN_STORAGE_KEY,
    );
  } catch {
    // Non-blocking.
  }
}

/**
 * Canonical global Astra entry URL.
 */
export function getAstraEntryHref() {
  return `${ASTRA_ROUTE}#${ASTRA_NETWORK_HASH}`;
}

/**
 * True when the current URL represents the Observatory Network.
 */
export function isAstraNetworkLocation() {
  if (typeof window === "undefined") return false;

  return (
    window.location.pathname === ASTRA_ROUTE &&
    window.location.hash === `#${ASTRA_NETWORK_HASH}`
  );
}

/**
 * Build the originating URL for the future "Return to Website" control.
 */
export function getAstraReturnHref() {
  const origin = getAstraOrigin();

  if (!origin) return "/";

  return `${origin.pathname}${origin.search}${origin.hash}`;
}

/**
 * Restore the approximate source-page scroll position after the visitor
 * has returned from Astra.
 */
export function restoreAstraOriginScroll() {
  const origin = getAstraOrigin();

  if (!origin || typeof window === "undefined") return;

  const targetY = Math.max(0, origin.scrollY);

  window.requestAnimationFrame(() => {
    window.requestAnimationFrame(() => {
      window.scrollTo({
        top: targetY,
        behavior: "auto",
      });
    });
  });
}

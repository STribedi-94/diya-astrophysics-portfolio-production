/**
 * Production data contract for the Astrophysics News Hub.
 *
 * This is the SAME shape the future Cloudflare Worker API (`/api/news`) must
 * return. Demo mode simulates the server locally against this contract, so
 * switching `VITE_NEWS_MODE` to `live` requires no UI or schema changes.
 *
 * Field names are intentionally flat + relational-friendly so they map cleanly
 * onto Cloudflare D1 tables (articles, sources, topics, tags, missions, …).
 */

export type NewsArticle = {
  id: string;
  slug?: string;
  title: string;
  summary: string;

  sourceId: string;
  sourceName: string;
  sourceType?: string;
  sourceUrl?: string;
  sourceLogoUrl?: string;

  /** Original publisher URL. Always external. */
  articleUrl: string;
  canonicalUrl: string;

  /** Publisher URL, Cloudflare R2 URL, or local fallback asset. */
  imageUrl?: string;
  imageAlt?: string;
  imageCredit?: string;

  publishedAt: string;
  updatedAt?: string;
  fetchedAt?: string;

  category: string;
  topics: string[];
  tags: string[];

  country?: string;
  region?: string;
  mission?: string;
  observatory?: string;
  telescope?: string;
  newsType?: string;

  isFeatured: boolean;
  isResearchOrbit: boolean;
  researchOrbitScore?: number;

  language?: string;
};

export type NewsSource = {
  id: string;
  name: string;
  shortName?: string;
  sourceType?: string;
  websiteUrl?: string;
  logoUrl?: string;
  country?: string;
  isActive: boolean;
};

export type NewsPagination = {
  page: number;
  pageSize: number;
  totalItems: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
};

export type NewsFacet = { id: string; label: string; count?: number };

export type NewsFilterOptions = {
  sources: NewsFacet[];
  categories: NewsFacet[];
  topics: NewsFacet[];
  countries: NewsFacet[];
  missions: NewsFacet[];
  observatories: NewsFacet[];
  telescopes: NewsFacet[];
  newsTypes: NewsFacet[];
};

export type NewsSystemStatus = "ok" | "partial" | "cached" | "demo" | "error";

export type NewsApiResponse = {
  items: NewsArticle[];
  featuredItems: NewsArticle[];
  pagination: NewsPagination;
  availableFilters: NewsFilterOptions;
  lastUpdated: string;
  status: NewsSystemStatus;
  activeSourceCount?: number;
  failedSourceCount?: number;
  /** KV cache metadata (optional, future Cloudflare). */
  cachedAt?: string;
  cacheAge?: number;
  message?: string;
};

export type NewsSort = "newest" | "oldest" | "relevance" | "featured";

export type NewsQuery = {
  page?: number;
  pageSize?: number;
  search?: string;
  sort?: NewsSort;
  featured?: boolean;
  researchOrbit?: boolean;
  category?: string[];
  topic?: string[];
  source?: string[];
  country?: string[];
  mission?: string[];
  observatory?: string[];
  telescope?: string[];
  newsType?: string[];
  dateFrom?: string;
  dateTo?: string;
};

/** Multi-value filter keys, used by the UI to build generic filter groups. */
export const MULTI_FILTER_KEYS = [
  "category",
  "topic",
  "source",
  "country",
  "mission",
  "observatory",
  "telescope",
  "newsType",
] as const;

export type MultiFilterKey = (typeof MULTI_FILTER_KEYS)[number];

export const FILTER_FACET_MAP: Record<MultiFilterKey, keyof NewsFilterOptions> = {
  category: "categories",
  topic: "topics",
  source: "sources",
  country: "countries",
  mission: "missions",
  observatory: "observatories",
  telescope: "telescopes",
  newsType: "newsTypes",
};

export const FILTER_LABELS: Record<MultiFilterKey, string> = {
  category: "Category",
  topic: "Topic",
  source: "Source",
  country: "Country",
  mission: "Mission",
  observatory: "Observatory",
  telescope: "Telescope",
  newsType: "News type",
};

export class NewsServiceError extends Error {
  readonly kind: "network" | "timeout" | "malformed" | "http" | "unknown";
  readonly status?: number;
  constructor(
    kind: "network" | "timeout" | "malformed" | "http" | "unknown",
    message: string,
    status?: number,
  ) {
    super(message);
    this.name = "NewsServiceError";
    this.kind = kind;
    this.status = status;
  }
}

import { newsConfig, isDemoMode } from "@/config/newsConfig";
import {
  MULTI_FILTER_KEYS,
  NewsServiceError,
  type MultiFilterKey,
  type NewsApiResponse,
  type NewsArticle,
  type NewsFacet,
  type NewsFilterOptions,
  type NewsQuery,
  type NewsSource,
} from "@/types/news";

/* -------------------------------------------------------------- serializer */

/** Builds a stable, safely encoded query string for `/api/news`. */
export function serializeNewsQuery(query: NewsQuery): string {
  const params = new URLSearchParams();
  const put = (key: string, value: string | number | boolean) =>
    params.append(key, String(value));

  if (query.page && query.page > 1) put("page", query.page);
  if (query.pageSize) put("pageSize", query.pageSize);
  if (query.search?.trim()) put("search", query.search.trim());
  if (query.sort) put("sort", query.sort);
  if (query.featured) put("featured", true);
  if (query.researchOrbit) put("researchOrbit", true);
  if (query.dateFrom) put("dateFrom", query.dateFrom);
  if (query.dateTo) put("dateTo", query.dateTo);

  for (const key of MULTI_FILTER_KEYS) {
    const values = query[key];
    if (values?.length) for (const v of [...values].sort()) params.append(key, v);
  }
  params.sort();
  return params.toString();
}

/* ------------------------------------------------------------- url safety */

/** Only http/https external URLs are ever rendered as links. */
export function safeExternalUrl(url: unknown): string | undefined {
  if (typeof url !== "string" || !url) return undefined;
  try {
    const parsed = new URL(url, "https://example.invalid");
    if (parsed.protocol !== "http:" && parsed.protocol !== "https:") return undefined;
    if (parsed.hostname === "example.invalid") return undefined;
    return parsed.toString();
  } catch {
    return undefined;
  }
}

/** Images may be remote (publisher/R2) or a same-origin fallback asset. */
export function safeImageUrl(url: unknown): string | undefined {
  if (typeof url !== "string" || !url) return undefined;
  if (url.startsWith("/") && !url.startsWith("//")) return url;
  return safeExternalUrl(url);
}

/* ------------------------------------------------------------ normalising */

const asString = (v: unknown, fallback = ""): string =>
  typeof v === "string" ? v : fallback;
const asArray = (v: unknown): string[] =>
  Array.isArray(v) ? v.filter((x): x is string => typeof x === "string") : [];

/** Defensive normalisation — a malformed record must never crash the page. */
function normaliseArticle(raw: unknown, index: number): NewsArticle | null {
  if (!raw || typeof raw !== "object") return null;
  const r = raw as Record<string, unknown>;
  const title = asString(r.title).trim();
  const articleUrl = safeExternalUrl(r.articleUrl) ?? safeExternalUrl(r.canonicalUrl);
  if (!title || !articleUrl) return null;

  return {
    id: asString(r.id, `article-${index}`),
    slug: typeof r.slug === "string" ? r.slug : undefined,
    title,
    summary: asString(r.summary),
    sourceId: asString(r.sourceId, "unknown"),
    sourceName: asString(r.sourceName, "Source"),
    sourceType: typeof r.sourceType === "string" ? r.sourceType : undefined,
    sourceUrl: safeExternalUrl(r.sourceUrl),
    sourceLogoUrl: safeImageUrl(r.sourceLogoUrl),
    articleUrl,
    canonicalUrl: safeExternalUrl(r.canonicalUrl) ?? articleUrl,
    imageUrl: safeImageUrl(r.imageUrl),
    imageAlt: typeof r.imageAlt === "string" ? r.imageAlt : undefined,
    imageCredit: typeof r.imageCredit === "string" ? r.imageCredit : undefined,
    author:
      typeof r.author === "string" && r.author.trim()
        ? r.author.trim()
        : Array.isArray(r.authors)
          ? r.authors.filter((a): a is string => typeof a === "string").join(", ") || undefined
          : undefined,
    publishedAt: asString(r.publishedAt),

    updatedAt: typeof r.updatedAt === "string" ? r.updatedAt : undefined,
    fetchedAt: typeof r.fetchedAt === "string" ? r.fetchedAt : undefined,
    category: asString(r.category, "Astronomy"),
    topics: asArray(r.topics),
    tags: asArray(r.tags),
    country: typeof r.country === "string" ? r.country : undefined,
    region: typeof r.region === "string" ? r.region : undefined,
    mission: typeof r.mission === "string" ? r.mission : undefined,
    observatory: typeof r.observatory === "string" ? r.observatory : undefined,
    telescope: typeof r.telescope === "string" ? r.telescope : undefined,
    newsType: typeof r.newsType === "string" ? r.newsType : undefined,
    isFeatured: r.isFeatured === true,
    isResearchOrbit: r.isResearchOrbit === true,
    researchOrbitScore:
      typeof r.researchOrbitScore === "number" ? r.researchOrbitScore : undefined,
    language: typeof r.language === "string" ? r.language : undefined,
  };
}

/** Live feeds can republish the same story across sources — keep the first. */
function dedupeArticles(articles: NewsArticle[]): NewsArticle[] {
  const seen = new Set<string>();
  return articles.filter((a) => {
    const key = (a.canonicalUrl || a.articleUrl).toLowerCase();
    const idKey = a.id.toLowerCase();
    if (seen.has(key) || seen.has(idKey)) return false;
    seen.add(key);
    seen.add(idKey);
    return true;
  });
}

const EMPTY_FILTERS: NewsFilterOptions = {

  sources: [],
  categories: [],
  topics: [],
  countries: [],
  missions: [],
  observatories: [],
  telescopes: [],
  newsTypes: [],
};

function normaliseFacets(raw: unknown): NewsFacet[] {
  if (!Array.isArray(raw)) return [];
  return raw
    .map((f): NewsFacet | null => {
      if (!f || typeof f !== "object") return null;
      const o = f as Record<string, unknown>;
      const id = asString(o.id);
      if (!id) return null;
      return {
        id,
        label: asString(o.label, id),
        count: typeof o.count === "number" ? o.count : undefined,
      };
    })
    .filter((f): f is NewsFacet => f !== null);
}

function normaliseResponse(raw: unknown, query: NewsQuery): NewsApiResponse {
  if (!raw || typeof raw !== "object") {
    throw new NewsServiceError("malformed", "The news service returned an unexpected response.");
  }
  const r = raw as Record<string, unknown>;
  const items = dedupeArticles(
    (Array.isArray(r.items) ? r.items : [])
      .map(normaliseArticle)
      .filter((a): a is NewsArticle => a !== null),
  );
  const featuredItems = dedupeArticles(
    (Array.isArray(r.featuredItems) ? r.featuredItems : [])
      .map(normaliseArticle)
      .filter((a): a is NewsArticle => a !== null),
  );


  const p = (r.pagination ?? {}) as Record<string, unknown>;
  const page = typeof p.page === "number" ? p.page : (query.page ?? 1);
  const pageSize =
    typeof p.pageSize === "number" ? p.pageSize : (query.pageSize ?? newsConfig.pageSize);
  const totalItems = typeof p.totalItems === "number" ? p.totalItems : items.length;
  const totalPages =
    typeof p.totalPages === "number" ? p.totalPages : Math.max(1, Math.ceil(totalItems / pageSize));

  const filtersRaw = (r.availableFilters ?? {}) as Record<string, unknown>;
  const status = ["ok", "partial", "cached", "demo", "error"].includes(String(r.status))
    ? (r.status as NewsApiResponse["status"])
    : "ok";

  return {
    items,
    featuredItems,
    pagination: {
      page,
      pageSize,
      totalItems,
      totalPages,
      hasNextPage: page < totalPages,
      hasPreviousPage: page > 1,
    },
    availableFilters: {
      ...EMPTY_FILTERS,
      sources: normaliseFacets(filtersRaw.sources),
      categories: normaliseFacets(filtersRaw.categories),
      topics: normaliseFacets(filtersRaw.topics),
      countries: normaliseFacets(filtersRaw.countries),
      missions: normaliseFacets(filtersRaw.missions),
      observatories: normaliseFacets(filtersRaw.observatories),
      telescopes: normaliseFacets(filtersRaw.telescopes),
      newsTypes: normaliseFacets(filtersRaw.newsTypes),
    },
    lastUpdated: asString(r.lastUpdated, new Date().toISOString()),
    status,
    activeSourceCount:
      typeof r.activeSourceCount === "number" ? r.activeSourceCount : undefined,
    failedSourceCount:
      typeof r.failedSourceCount === "number" ? r.failedSourceCount : undefined,
    cachedAt: typeof r.cachedAt === "string" ? r.cachedAt : undefined,
    cacheAge: typeof r.cacheAge === "number" ? r.cacheAge : undefined,
    message: typeof r.message === "string" ? r.message : undefined,
  };
}

/* ------------------------------------------------------------- demo engine */

type DemoBundle = { sources: NewsSource[]; articles: NewsArticle[]; lastUpdated: string };
let demoBundle: DemoBundle | null = null;

/** Lazily imported so the demo dataset never lands in the initial bundle. */
async function loadDemoBundle(): Promise<DemoBundle> {
  if (demoBundle) return demoBundle;
  const mod = await import("@/data/news-demo.json");
  const raw = (mod.default ?? mod) as Record<string, unknown>;
  const articles = dedupeArticles(
    (Array.isArray(raw.articles) ? raw.articles : [])
      .map(normaliseArticle)
      .filter((a): a is NewsArticle => a !== null),
  );

  const sources = (Array.isArray(raw.sources) ? raw.sources : []).map((s) => {
    const o = s as Record<string, unknown>;
    return {
      id: asString(o.id),
      name: asString(o.name),
      shortName: typeof o.shortName === "string" ? o.shortName : undefined,
      sourceType: typeof o.sourceType === "string" ? o.sourceType : undefined,
      websiteUrl: safeExternalUrl(o.websiteUrl),
      logoUrl: safeImageUrl(o.logoUrl),
      country: typeof o.country === "string" ? o.country : undefined,
      isActive: o.isActive !== false,
    } satisfies NewsSource;
  });
  demoBundle = { sources, articles, lastUpdated: asString(raw.lastUpdated, new Date().toISOString()) };
  return demoBundle;
}

const FIELD_FOR_KEY: Record<MultiFilterKey, (a: NewsArticle) => string[]> = {
  category: (a) => [a.category],
  topic: (a) => a.topics,
  source: (a) => [a.sourceId],
  country: (a) => (a.country ? [a.country] : []),
  mission: (a) => (a.mission ? [a.mission] : []),
  observatory: (a) => (a.observatory ? [a.observatory] : []),
  telescope: (a) => (a.telescope ? [a.telescope] : []),
  newsType: (a) => (a.newsType ? [a.newsType] : []),
};

function matchesSearch(a: NewsArticle, term: string) {
  if (!term) return true;
  const haystack = [
    a.title,
    a.summary,
    a.sourceName,
    a.category,
    a.mission,
    a.observatory,
    a.telescope,
    a.country,
    a.newsType,
    ...a.topics,
    ...a.tags,
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();
  return term
    .toLowerCase()
    .split(/\s+/)
    .filter(Boolean)
    .every((word) => haystack.includes(word));
}

function buildFacets(articles: NewsArticle[], sources: NewsSource[]): NewsFilterOptions {
  const collect = (key: MultiFilterKey): NewsFacet[] => {
    const counts = new Map<string, number>();
    for (const a of articles) for (const v of FIELD_FOR_KEY[key](a)) counts.set(v, (counts.get(v) ?? 0) + 1);
    return [...counts.entries()]
      .map(([id, count]) => ({
        id,
        label:
          key === "source"
            ? (sources.find((s) => s.id === id)?.name ?? id)
            : key === "topic"
              ? id.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase())
              : id,
        count,
      }))
      .sort((a, b) => (b.count ?? 0) - (a.count ?? 0) || a.label.localeCompare(b.label));
  };
  return {
    categories: collect("category"),
    topics: collect("topic"),
    sources: collect("source"),
    countries: collect("country"),
    missions: collect("mission"),
    observatories: collect("observatory"),
    telescopes: collect("telescope"),
    newsTypes: collect("newsType"),
  };
}

/** Simulates the future Cloudflare Worker: filter → sort → paginate → facets. */
async function getDemoNews(query: NewsQuery): Promise<NewsApiResponse> {
  const { articles, sources, lastUpdated } = await loadDemoBundle();
  const term = query.search?.trim() ?? "";

  const filtered = articles.filter((a) => {
    if (query.featured && !a.isFeatured) return false;
    if (query.researchOrbit && !a.isResearchOrbit) return false;
    if (query.dateFrom && a.publishedAt < query.dateFrom) return false;
    if (query.dateTo && a.publishedAt > query.dateTo) return false;
    for (const key of MULTI_FILTER_KEYS) {
      const wanted = query[key];
      if (wanted?.length) {
        const values = FIELD_FOR_KEY[key](a);
        if (!wanted.some((w) => values.includes(w))) return false;
      }
    }
    return matchesSearch(a, term);
  });

  const sorted = [...filtered].sort((a, b) => {
    switch (query.sort) {
      case "oldest":
        return a.publishedAt.localeCompare(b.publishedAt);
      case "relevance":
        return (b.researchOrbitScore ?? 0) - (a.researchOrbitScore ?? 0) ||
          b.publishedAt.localeCompare(a.publishedAt);
      case "featured":
        return Number(b.isFeatured) - Number(a.isFeatured) ||
          b.publishedAt.localeCompare(a.publishedAt);
      default:
        return b.publishedAt.localeCompare(a.publishedAt);
    }
  });

  const pageSize = query.pageSize ?? newsConfig.pageSize;
  const totalItems = sorted.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
  const page = Math.min(Math.max(1, query.page ?? 1), totalPages);
  const items = sorted.slice((page - 1) * pageSize, page * pageSize);

  return {
    items,
    featuredItems: articles
      .filter((a) => a.isFeatured)
      .sort((a, b) => b.publishedAt.localeCompare(a.publishedAt))
      .slice(0, 5),
    pagination: {
      page,
      pageSize,
      totalItems,
      totalPages,
      hasNextPage: page < totalPages,
      hasPreviousPage: page > 1,
    },
    availableFilters: buildFacets(articles, sources),
    lastUpdated,
    status: "demo",
    activeSourceCount: sources.filter((s) => s.isActive).length,
    failedSourceCount: 0,
    message: "Demonstration dataset — the live ingestion service is not yet connected.",
  };
}

/* ------------------------------------------------------------- live client */

async function getLiveNews(query: NewsQuery, signal?: AbortSignal): Promise<NewsApiResponse> {
  const qs = serializeNewsQuery(query);
  const url = qs ? `${newsConfig.apiUrl}?${qs}` : newsConfig.apiUrl;

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), newsConfig.requestTimeoutMs);
  const onAbort = () => controller.abort();
  signal?.addEventListener("abort", onAbort);

  try {
    const response = await fetch(url, {
      headers: { Accept: "application/json" },
      signal: controller.signal,
    });
    if (!response.ok) {
      throw new NewsServiceError("http", "The news service is temporarily unavailable.", response.status);
    }
    let payload: unknown;
    try {
      payload = await response.json();
    } catch {
      throw new NewsServiceError("malformed", "The news service returned an unreadable response.");
    }
    return normaliseResponse(payload, query);
  } catch (error) {
    if (error instanceof NewsServiceError) throw error;
    if (signal?.aborted) throw error;
    if ((error as Error)?.name === "AbortError") {
      throw new NewsServiceError("timeout", "The news service took too long to respond.");
    }
    throw new NewsServiceError("network", "Could not reach the news service.");
  } finally {
    clearTimeout(timeout);
    signal?.removeEventListener("abort", onAbort);
  }
}

/* ------------------------------------------------------------- public API */

export async function getNews(query: NewsQuery, signal?: AbortSignal): Promise<NewsApiResponse> {
  if (isDemoMode) {
    const response = await getDemoNews(query);
    if (signal?.aborted) throw new DOMException("Aborted", "AbortError");
    return response;
  }
  return getLiveNews(query, signal);
}

export async function getFeaturedNews(signal?: AbortSignal): Promise<NewsArticle[]> {
  const response = await getNews({ featured: true, pageSize: 5, sort: "featured" }, signal);
  return response.featuredItems.length ? response.featuredItems : response.items;
}

export async function getNewsSources(): Promise<NewsSource[]> {
  if (isDemoMode) return (await loadDemoBundle()).sources;
  const response = await getNews({ pageSize: 1 });
  return response.availableFilters.sources.map((s) => ({
    id: s.id,
    name: s.label,
    isActive: true,
  }));
}


export const NEWS_MULTI_FILTER_KEYS = [
  "category",
  "topic",
  "source",
  "country",
  "mission",
  "observatory",
  "telescope",
  "newsType",
] as const;

export type NewsMultiFilterKey =
  (typeof NEWS_MULTI_FILTER_KEYS)[number];

export type NewsSort =
  | "newest"
  | "oldest"
  | "relevance"
  | "featured";

export type ParsedNewsQuery = {
  page: number;
  pageSize: number;

  search?: string;
  sort: NewsSort;

  featured: boolean;
  researchOrbit: boolean;

  category: string[];
  topic: string[];
  source: string[];
  country: string[];
  mission: string[];
  observatory: string[];
  telescope: string[];
  newsType: string[];

  dateFrom?: string;
  dateTo?: string;
};

const NEWS_SORTS = new Set<NewsSort>([
  "newest",
  "oldest",
  "relevance",
  "featured",
]);

function positiveInt(
  raw: string | null,
  fallback: number,
  max: number,
): number {
  if (!raw) return fallback;

  const parsed = Number.parseInt(raw, 10);

  if (!Number.isFinite(parsed) || parsed < 1) {
    return fallback;
  }

  return Math.min(parsed, max);
}

function booleanParam(raw: string | null): boolean {
  return raw === "true" || raw === "1";
}

function cleanText(
  raw: string | null,
  maxLength: number,
): string | undefined {
  if (!raw) return undefined;

  const value = raw.trim();

  if (!value) return undefined;

  return value.slice(0, maxLength);
}

function cleanDate(raw: string | null): string | undefined {
  const value = cleanText(raw, 40);

  if (!value) return undefined;

  const time = Date.parse(value);

  if (!Number.isFinite(time)) {
    return undefined;
  }

  return value;
}

function multiValues(
  params: URLSearchParams,
  key: NewsMultiFilterKey,
): string[] {
  const seen = new Set<string>();
  const values: string[] = [];

  for (const raw of params.getAll(key)) {
    const value = raw.trim().slice(0, 120);

    if (!value || seen.has(value)) {
      continue;
    }

    seen.add(value);
    values.push(value);

    if (values.length >= 20) {
      break;
    }
  }

  return values;
}

export function parseNewsQuery(url: URL): ParsedNewsQuery {
  const params = url.searchParams;

  const rawSort = params.get("sort");

  const sort: NewsSort =
    rawSort && NEWS_SORTS.has(rawSort as NewsSort)
      ? (rawSort as NewsSort)
      : "newest";

  return {
    page: positiveInt(params.get("page"), 1, 999),
    pageSize: positiveInt(params.get("pageSize"), 12, 100),

    search: cleanText(params.get("search"), 120),
    sort,

    featured: booleanParam(params.get("featured")),
    researchOrbit: booleanParam(params.get("researchOrbit")),

    category: multiValues(params, "category"),
    topic: multiValues(params, "topic"),
    source: multiValues(params, "source"),
    country: multiValues(params, "country"),
    mission: multiValues(params, "mission"),
    observatory: multiValues(params, "observatory"),
    telescope: multiValues(params, "telescope"),
    newsType: multiValues(params, "newsType"),

    dateFrom: cleanDate(params.get("dateFrom")),
    dateTo: cleanDate(params.get("dateTo")),
  };
}
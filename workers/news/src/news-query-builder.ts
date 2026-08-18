import type {
  NewsMultiFilterKey,
  ParsedNewsQuery,
} from "./query";

export type BuiltNewsQuery = {
  whereSql: string;
  whereBindings: unknown[];
  orderBySql: string;
  orderBindings: unknown[];
};

const ARTICLE_COLUMN_BY_FILTER: Partial<
  Record<NewsMultiFilterKey, string>
> = {
  category: "a.category",
  source: "a.source_id",
  country: "a.country",
  mission: "a.mission",
  observatory: "a.observatory",
  telescope: "a.telescope",
  newsType: "a.news_type",
};

function addInFilter(
  clauses: string[],
  bindings: unknown[],
  column: string,
  values: string[],
): void {
  if (values.length === 0) return;

  const placeholders = values.map(() => "?").join(", ");

  clauses.push(`${column} IN (${placeholders})`);
  bindings.push(...values);
}

function searchPattern(search: string): string {
  let normalized = search
    .trim()
    .toLowerCase()
    .replace(/[\s-]+/g, "%");

  const compactAliases: Record<string, string> = {
    mdwarf: "m%dwarf",
    mdwarfs: "m%dwarfs",
  };

  normalized = compactAliases[normalized] ?? normalized;

  return `%${normalized}%`;
}

export function buildNewsQuery(
  query: ParsedNewsQuery,
): BuiltNewsQuery {
  const clauses: string[] = [];
  const whereBindings: unknown[] = [];
  const orderBindings: unknown[] = [];

  for (const [key, column] of Object.entries(
    ARTICLE_COLUMN_BY_FILTER,
  ) as Array<[NewsMultiFilterKey, string]>) {
    addInFilter(
      clauses,
      whereBindings,
      column,
      query[key] as string[],
    );
  }

  if (query.topic.length > 0) {
    const placeholders = query.topic.map(() => "?").join(", ");

    clauses.push(`
      EXISTS (
        SELECT 1
        FROM news_article_topics nt
        WHERE nt.article_id = a.id
          AND nt.topic IN (${placeholders})
      )
    `);

    whereBindings.push(...query.topic);
  }

  if (query.featured) {
    clauses.push("a.is_featured = 1");
  }

  if (query.researchOrbit) {
    clauses.push("a.is_research_orbit = 1");
  }

  if (query.dateFrom) {
    clauses.push("a.published_at >= ?");
    whereBindings.push(query.dateFrom);
  }

  if (query.dateTo) {
    clauses.push("a.published_at <= ?");
    whereBindings.push(query.dateTo);
  }

  if (query.search) {
    const pattern = searchPattern(query.search);

    clauses.push(`
      (
        a.title LIKE ? COLLATE NOCASE
        OR a.summary LIKE ? COLLATE NOCASE
        OR s.name LIKE ? COLLATE NOCASE
        OR EXISTS (
          SELECT 1
          FROM news_article_topics search_topics
          WHERE search_topics.article_id = a.id
            AND search_topics.topic LIKE ? COLLATE NOCASE
        )
        OR EXISTS (
          SELECT 1
          FROM news_article_tags search_tags
          WHERE search_tags.article_id = a.id
            AND search_tags.tag LIKE ? COLLATE NOCASE
        )
      )
    `);

    whereBindings.push(
      pattern,
      pattern,
      pattern,
      pattern,
      pattern,
    );
  }

  let orderBySql: string;

  switch (query.sort) {
    case "oldest":
      orderBySql = "a.published_at ASC, a.id ASC";
      break;

    case "featured":
      orderBySql =
        "a.is_featured DESC, a.published_at DESC, a.id DESC";
      break;

    case "relevance":
      if (query.search) {
        orderBySql = `
          CASE
            WHEN a.title LIKE ? COLLATE NOCASE THEN 0
            WHEN a.summary LIKE ? COLLATE NOCASE THEN 1
            ELSE 2
          END ASC,
          a.published_at DESC,
          a.id DESC
        `;

        const relevancePattern = searchPattern(query.search);

        orderBindings.push(
          relevancePattern,
          relevancePattern,
        );
      } else {
        orderBySql = "a.published_at DESC, a.id DESC";
      }
      break;

    case "newest":
    default:
      orderBySql = "a.published_at DESC, a.id DESC";
      break;
  }

  return {
    whereSql:
      clauses.length > 0
        ? `WHERE ${clauses.join("\nAND ")}`
        : "",
    whereBindings,
    orderBySql,
    orderBindings,
  };
}
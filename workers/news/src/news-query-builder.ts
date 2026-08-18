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

  const placeholders =
    values.map(() => "?").join(", ");

  clauses.push(
    `${column} IN (${placeholders})`,
  );

  bindings.push(...values);
}

function normalizedSearchTerm(
  search: string,
): string {
  return search
    .trim()
    .toLowerCase();
}

function isMDwarfSearch(
  search: string,
): boolean {
  const compact =
    normalizedSearchTerm(search)
      .replace(/[\s-]+/g, "");

  return (
    compact === "mdwarf" ||
    compact === "mdwarfs"
  );
}

function searchPattern(
  search: string,
): string {
  const normalized =
    normalizedSearchTerm(search)
      .replace(/[\s-]+/g, "%");

  return `%${normalized}%`;
}

/*
 * M-dwarf searches require stricter normalization than ordinary
 * SQL LIKE search.
 *
 * The previous alias "m%dwarf" allowed '%' to consume arbitrary
 * text and therefore matched unrelated terms such as white dwarf,
 * brown dwarf and dwarf galaxy whenever another "m" appeared
 * earlier in the field.
 *
 * Instead, normalize spaces and hyphens out of the searchable text
 * and search specifically for the contiguous token "mdwarf".
 */
function normalizedMDwarfExpression(
  column: string,
): string {
  return `
    REPLACE(
      REPLACE(
        LOWER(${column}),
        '-',
        ''
      ),
      ' ',
      ''
    ) LIKE ?
  `;
}

function addSearchClause(
  clauses: string[],
  bindings: unknown[],
  search: string,
): void {
  if (isMDwarfSearch(search)) {
    const pattern = "%mdwarf%";

    clauses.push(`
      (
        ${normalizedMDwarfExpression("a.title")}
        OR ${normalizedMDwarfExpression("a.summary")}
        OR EXISTS (
          SELECT 1
          FROM news_article_topics search_topics
          WHERE search_topics.article_id = a.id
            AND REPLACE(
              REPLACE(
                LOWER(search_topics.topic),
                '-',
                ''
              ),
              ' ',
              ''
            ) LIKE ?
        )
        OR EXISTS (
          SELECT 1
          FROM news_article_tags search_tags
          WHERE search_tags.article_id = a.id
            AND REPLACE(
              REPLACE(
                LOWER(search_tags.tag),
                '-',
                ''
              ),
              ' ',
              ''
            ) LIKE ?
        )
      )
    `);

    bindings.push(
      pattern,
      pattern,
      pattern,
      pattern,
    );

    return;
  }

  const pattern =
    searchPattern(search);

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

  bindings.push(
    pattern,
    pattern,
    pattern,
    pattern,
    pattern,
  );
}

export function buildNewsQuery(
  query: ParsedNewsQuery,
): BuiltNewsQuery {
  const clauses: string[] = [];
  const whereBindings: unknown[] = [];
  const orderBindings: unknown[] = [];

  for (
    const [key, column]
    of Object.entries(
      ARTICLE_COLUMN_BY_FILTER,
    ) as Array<
      [NewsMultiFilterKey, string]
    >
  ) {
    addInFilter(
      clauses,
      whereBindings,
      column,
      query[key] as string[],
    );
  }

  if (query.topic.length > 0) {
    const placeholders =
      query.topic
        .map(() => "?")
        .join(", ");

    clauses.push(`
      EXISTS (
        SELECT 1
        FROM news_article_topics nt
        WHERE nt.article_id = a.id
          AND nt.topic IN (${placeholders})
      )
    `);

    whereBindings.push(
      ...query.topic,
    );
  }

  if (query.featured) {
    clauses.push(
      "a.is_featured = 1",
    );
  }

  if (query.researchOrbit) {
    clauses.push(
      "a.is_research_orbit = 1",
    );
  }

  if (query.dateFrom) {
    clauses.push(
      "a.published_at >= ?",
    );

    whereBindings.push(
      query.dateFrom,
    );
  }

  if (query.dateTo) {
    clauses.push(
      "a.published_at <= ?",
    );

    whereBindings.push(
      query.dateTo,
    );
  }

  if (query.search) {
    addSearchClause(
      clauses,
      whereBindings,
      query.search,
    );
  }

  let orderBySql: string;

  switch (query.sort) {
    case "oldest":
      orderBySql =
        "a.published_at ASC, a.id ASC";
      break;

    case "featured":
      orderBySql =
        "a.is_featured DESC, a.published_at DESC, a.id DESC";
      break;

    case "relevance":
      if (query.search) {
        if (
          isMDwarfSearch(
            query.search,
          )
        ) {
          const pattern =
            "%mdwarf%";

          orderBySql = `
            CASE
              WHEN ${normalizedMDwarfExpression("a.title")} THEN 0
              WHEN ${normalizedMDwarfExpression("a.summary")} THEN 1
              ELSE 2
            END ASC,
            a.published_at DESC,
            a.id DESC
          `;

          orderBindings.push(
            pattern,
            pattern,
          );
        } else {
          const relevancePattern =
            searchPattern(
              query.search,
            );

          orderBySql = `
            CASE
              WHEN a.title LIKE ? COLLATE NOCASE THEN 0
              WHEN a.summary LIKE ? COLLATE NOCASE THEN 1
              ELSE 2
            END ASC,
            a.published_at DESC,
            a.id DESC
          `;

          orderBindings.push(
            relevancePattern,
            relevancePattern,
          );
        }
      } else {
        orderBySql =
          "a.published_at DESC, a.id DESC";
      }

      break;

    case "newest":
    default:
      orderBySql =
        "a.published_at DESC, a.id DESC";
      break;
  }

  return {
    whereSql:
      clauses.length > 0
        ? `WHERE ${clauses.join(
            "\nAND ",
          )}`
        : "",

    whereBindings,
    orderBySql,
    orderBindings,
  };
}
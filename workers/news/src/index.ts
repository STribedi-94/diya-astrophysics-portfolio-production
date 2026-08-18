import { buildNewsQuery } from "./news-query-builder";
import { parseNewsQuery } from "./query";
import { ingestAllSources } from "./ingestion";

type NewsArticleRow = {
  id: string;
  slug: string | null;
  title: string;
  summary: string;

  source_id: string;
  source_name: string;
  source_type: string | null;
  source_url: string | null;
  source_logo_url: string | null;

  article_url: string;
  canonical_url: string;

  image_url: string | null;
  image_alt: string | null;
  image_credit: string | null;
  author: string | null;

  published_at: string;
  publisher_updated_at: string | null;
  fetched_at: string;

  category: string;

  country: string | null;
  region: string | null;
  mission: string | null;
  observatory: string | null;
  telescope: string | null;
  news_type: string | null;

  is_featured: number;
  is_research_orbit: number;
  research_orbit_score: number | null;

  language: string | null;
};

type FacetRow = {
  id: string;
  label: string;
  count: number;
};

type TopicRow = {
  article_id: string;
  value: string;
};

const jsonHeaders = {
  "content-type": "application/json; charset=utf-8",
  "cache-control": "no-store",
};

const ARTICLE_SELECT = `
  SELECT
    a.id,
    a.slug,
    a.title,
    a.summary,

    a.source_id,
    s.name AS source_name,
    s.source_type,
    s.website_url AS source_url,
    s.logo_url AS source_logo_url,

    a.article_url,
    a.canonical_url,

    a.image_url,
    a.image_alt,
    a.image_credit,
    a.author,

    a.published_at,
    a.publisher_updated_at,
    a.fetched_at,

    a.category,

    a.country,
    a.region,
    a.mission,
    a.observatory,
    a.telescope,
    a.news_type,

    a.is_featured,
    a.is_research_orbit,
    a.research_orbit_score,

    a.language

  FROM news_articles a
  JOIN news_sources s
    ON s.id = a.source_id
`;

function json(
  data: unknown,
  status = 200,
): Response {
  return new Response(
    JSON.stringify(data),
    {
      status,
      headers: jsonHeaders,
    },
  );
}

function articleFromRow(
  row: NewsArticleRow,
  topics: string[],
  tags: string[],
) {
  return {
    id: row.id,
    slug: row.slug ?? undefined,
    title: row.title,
    summary: row.summary,

    sourceId: row.source_id,
    sourceName: row.source_name,
    sourceType: row.source_type ?? undefined,
    sourceUrl: row.source_url ?? undefined,
    sourceLogoUrl: row.source_logo_url ?? undefined,

    articleUrl: row.article_url,
    canonicalUrl: row.canonical_url,

    imageUrl: row.image_url ?? undefined,
    imageAlt: row.image_alt ?? undefined,
    imageCredit: row.image_credit ?? undefined,
    author: row.author ?? undefined,

    publishedAt: row.published_at,
    updatedAt: row.publisher_updated_at ?? undefined,
    fetchedAt: row.fetched_at,

    category: row.category,
    topics,
    tags,

    country: row.country ?? undefined,
    region: row.region ?? undefined,
    mission: row.mission ?? undefined,
    observatory: row.observatory ?? undefined,
    telescope: row.telescope ?? undefined,
    newsType: row.news_type ?? undefined,

    isFeatured: row.is_featured === 1,
    isResearchOrbit: row.is_research_orbit === 1,
    researchOrbitScore:
      row.research_orbit_score ?? undefined,

    language: row.language ?? undefined,
  };
}

async function readFacets(
  db: D1Database,
  sql: string,
): Promise<FacetRow[]> {
  const result =
    await db.prepare(sql).all<FacetRow>();

  return result.results ?? [];
}

async function hydrateArticleMetadata(
  db: D1Database,
  rows: NewsArticleRow[],
) {
  if (rows.length === 0) {
    return rows.map((row) =>
      articleFromRow(row, [], []),
    );
  }

  const ids = [
    ...new Set(
      rows.map((row) => row.id),
    ),
  ];

  const placeholders =
    ids.map(() => "?").join(", ");

  const [
    topicResult,
    tagResult,
  ] = await Promise.all([
    db
      .prepare(`
        SELECT
          article_id,
          topic AS value
        FROM news_article_topics
        WHERE article_id IN (${placeholders})
        ORDER BY topic ASC
      `)
      .bind(...ids)
      .all<TopicRow>(),

    db
      .prepare(`
        SELECT
          article_id,
          tag AS value
        FROM news_article_tags
        WHERE article_id IN (${placeholders})
        ORDER BY tag ASC
      `)
      .bind(...ids)
      .all<TopicRow>(),
  ]);

  const topicsByArticle =
    new Map<string, string[]>();

  const tagsByArticle =
    new Map<string, string[]>();

  for (
    const item
    of topicResult.results ?? []
  ) {
    const values =
      topicsByArticle.get(
        item.article_id,
      ) ?? [];

    values.push(item.value);

    topicsByArticle.set(
      item.article_id,
      values,
    );
  }

  for (
    const item
    of tagResult.results ?? []
  ) {
    const values =
      tagsByArticle.get(
        item.article_id,
      ) ?? [];

    values.push(item.value);

    tagsByArticle.set(
      item.article_id,
      values,
    );
  }

  return rows.map((row) =>
    articleFromRow(
      row,
      topicsByArticle.get(row.id) ?? [],
      tagsByArticle.get(row.id) ?? [],
    ),
  );
}

async function handleNews(
  request: Request,
  env: Env,
): Promise<Response> {
  const url = new URL(request.url);

  const query =
    parseNewsQuery(url);

  const {
    whereSql,
    whereBindings,
    orderBySql,
    orderBindings,
  } = buildNewsQuery(query);

  const offset =
    (query.page - 1) *
    query.pageSize;

  const countResult =
    await env.NEWS_DB
      .prepare(`
        SELECT COUNT(*) AS total
        FROM news_articles a
        JOIN news_sources s
          ON s.id = a.source_id
        ${whereSql}
      `)
      .bind(...whereBindings)
      .first<{ total: number }>();

  const totalItems =
    Number(
      countResult?.total ?? 0,
    );

  const totalPages =
    Math.max(
      1,
      Math.ceil(
        totalItems /
        query.pageSize,
      ),
    );

  const articleResult =
    await env.NEWS_DB
      .prepare(`
        ${ARTICLE_SELECT}

        ${whereSql}

        ORDER BY ${orderBySql}

        LIMIT ?
        OFFSET ?
      `)
      .bind(
        ...whereBindings,
        ...orderBindings,
        query.pageSize,
        offset,
      )
      .all<NewsArticleRow>();

  const featuredResult =
    await env.NEWS_DB
      .prepare(`
        ${ARTICLE_SELECT}

        WHERE a.is_featured = 1

        ORDER BY
          a.published_at DESC,
          a.id DESC

        LIMIT 5
      `)
      .all<NewsArticleRow>();

  const [
    items,
    featuredItems,
  ] = await Promise.all([
    hydrateArticleMetadata(
      env.NEWS_DB,
      articleResult.results ?? [],
    ),

    hydrateArticleMetadata(
      env.NEWS_DB,
      featuredResult.results ?? [],
    ),
  ]);

  const [
    sourceFacets,
    categoryFacets,
    topicFacets,
    countryFacets,
    missionFacets,
    observatoryFacets,
    telescopeFacets,
    newsTypeFacets,
  ] = await Promise.all([
    readFacets(
      env.NEWS_DB,
      `
        SELECT
          s.id AS id,
          s.name AS label,
          COUNT(a.id) AS count
        FROM news_sources s
        LEFT JOIN news_articles a
          ON a.source_id = s.id
        WHERE s.is_active = 1
        GROUP BY s.id, s.name
        ORDER BY
          count DESC,
          label ASC
      `,
    ),

    readFacets(
      env.NEWS_DB,
      `
        SELECT
          category AS id,
          category AS label,
          COUNT(*) AS count
        FROM news_articles
        WHERE category IS NOT NULL
        GROUP BY category
        ORDER BY
          count DESC,
          label ASC
      `,
    ),

    readFacets(
      env.NEWS_DB,
      `
        SELECT
          topic AS id,
          topic AS label,
          COUNT(*) AS count
        FROM news_article_topics
        GROUP BY topic
        ORDER BY
          count DESC,
          label ASC
      `,
    ),

    readFacets(
      env.NEWS_DB,
      `
        SELECT
          country AS id,
          country AS label,
          COUNT(*) AS count
        FROM news_articles
        WHERE country IS NOT NULL
        GROUP BY country
        ORDER BY
          count DESC,
          label ASC
      `,
    ),

    readFacets(
      env.NEWS_DB,
      `
        SELECT
          mission AS id,
          mission AS label,
          COUNT(*) AS count
        FROM news_articles
        WHERE mission IS NOT NULL
        GROUP BY mission
        ORDER BY
          count DESC,
          label ASC
      `,
    ),

    readFacets(
      env.NEWS_DB,
      `
        SELECT
          observatory AS id,
          observatory AS label,
          COUNT(*) AS count
        FROM news_articles
        WHERE observatory IS NOT NULL
        GROUP BY observatory
        ORDER BY
          count DESC,
          label ASC
      `,
    ),

    readFacets(
      env.NEWS_DB,
      `
        SELECT
          telescope AS id,
          telescope AS label,
          COUNT(*) AS count
        FROM news_articles
        WHERE telescope IS NOT NULL
        GROUP BY telescope
        ORDER BY
          count DESC,
          label ASC
      `,
    ),

    readFacets(
      env.NEWS_DB,
      `
        SELECT
          news_type AS id,
          news_type AS label,
          COUNT(*) AS count
        FROM news_articles
        WHERE news_type IS NOT NULL
        GROUP BY news_type
        ORDER BY
          count DESC,
          label ASC
      `,
    ),
  ]);

  const activeSourceResult =
    await env.NEWS_DB
      .prepare(`
        SELECT COUNT(*) AS total
        FROM news_sources
        WHERE is_active = 1
          AND source_status
            IN ('ok', 'pending')
      `)
      .first<{ total: number }>();

  const failedSourceResult =
    await env.NEWS_DB
      .prepare(`
        SELECT COUNT(*) AS total
        FROM news_sources
        WHERE is_active = 1
          AND source_status
            IN (
              'degraded',
              'failed'
            )
      `)
      .first<{ total: number }>();

  const lastUpdatedResult =
    await env.NEWS_DB
      .prepare(`
        SELECT
          MAX(fetched_at)
            AS last_updated
        FROM news_articles
      `)
      .first<{
        last_updated:
          string | null;
      }>();

  return json({
    items,
    featuredItems,

    pagination: {
      page: query.page,
      pageSize: query.pageSize,
      totalItems,
      totalPages,

      hasNextPage:
        query.page < totalPages,

      hasPreviousPage:
        query.page > 1,
    },

    availableFilters: {
      sources: sourceFacets,
      categories: categoryFacets,
      topics: topicFacets,
      countries: countryFacets,
      missions: missionFacets,
      observatories:
        observatoryFacets,
      telescopes:
        telescopeFacets,
      newsTypes:
        newsTypeFacets,
    },

    lastUpdated:
      lastUpdatedResult
        ?.last_updated ??
      new Date().toISOString(),

    status: "ok",

    activeSourceCount:
      Number(
        activeSourceResult
          ?.total ?? 0,
      ),

    failedSourceCount:
      Number(
        failedSourceResult
          ?.total ?? 0,
      ),
  });
}

export default {
  async fetch(
    request: Request,
    env: Env,
  ): Promise<Response> {
    try {
      const url =
        new URL(request.url);

      if (
        request.method !== "GET"
      ) {
        return json(
          {
            status: "error",
            message:
              "Method not allowed.",
          },
          405,
        );
      }

      if (
        url.pathname ===
        "/health"
      ) {
        return json({
          status: "ok",
          service:
            "astro-diya-news",
        });
      }

      if (
        url.pathname === "/" ||
        url.pathname ===
          "/api/news"
      ) {
        return handleNews(
          request,
          env,
        );
      }

      return json(
        {
          status: "error",
          message:
            "Not found.",
        },
        404,
      );
    } catch (error) {
      console.error(
        "[news] request failed",
        error,
      );

      return json(
        {
          items: [],
          featuredItems: [],

          pagination: {
            page: 1,
            pageSize: 12,
            totalItems: 0,
            totalPages: 1,
            hasNextPage: false,
            hasPreviousPage: false,
          },

          availableFilters: {
            sources: [],
            categories: [],
            topics: [],
            countries: [],
            missions: [],
            observatories: [],
            telescopes: [],
            newsTypes: [],
          },

          lastUpdated:
            new Date().toISOString(),

          status: "error",

          activeSourceCount: 0,
          failedSourceCount: 0,

          message:
            "The news service is temporarily unavailable.",
        },
        500,
      );
    }
  },

  async scheduled(
    controller: ScheduledController,
    env: Env,
    ctx: ExecutionContext,
  ): Promise<void> {
    ctx.waitUntil(
      (async () => {
        console.log(
          `[news] scheduled ingestion started: ${controller.cron}`,
        );

        try {
          const result =
            await ingestAllSources(
              env.NEWS_DB,
            );

          console.log(
            "[news] scheduled ingestion completed",
            JSON.stringify(result),
          );

          if (
            result.status !==
            "completed"
          ) {
            console.error(
              "[news] scheduled ingestion finished with source failures",
              JSON.stringify(result),
            );
          }
        } catch (error) {
          console.error(
            "[news] scheduled ingestion failed",
            error,
          );

          throw error;
        }
      })(),
    );
  },
};
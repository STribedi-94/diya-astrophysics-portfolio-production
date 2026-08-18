import type { ClassifiedNewsCandidate } from "./classifier";
import type { NewsSourceDefinition } from "./sources";

export type ArticleWriteResult =
  | "inserted"
  | "updated";

function articleId(
  sourceId: string,
  canonicalUrl: string,
): string {
  const input = `${sourceId}:${canonicalUrl}`;

  let hash = 2166136261;

  for (
    let index = 0;
    index < input.length;
    index += 1
  ) {
    hash ^= input.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }

  return `news_${sourceId}_${(
    hash >>> 0
  ).toString(16)}`;
}

function slugify(value: string): string {
  return value
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 100);
}

function fingerprint(
  candidate: ClassifiedNewsCandidate,
): string {
  const value = [
    candidate.sourceId,
    candidate.title
      .trim()
      .toLowerCase(),
    candidate.publishedAt,
  ].join("|");

  let hash = 2166136261;

  for (
    let index = 0;
    index < value.length;
    index += 1
  ) {
    hash ^= value.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }

  return `fp_${(
    hash >>> 0
  ).toString(16)}`;
}

export async function upsertSource(
  db: D1Database,
  source: NewsSourceDefinition,
): Promise<void> {
  await db
    .prepare(`
      INSERT INTO news_sources (
        id,
        name,
        short_name,
        source_type,
        website_url,
        feed_url,
        country,
        language,
        adapter_type,
        is_active,
        source_status,
        created_at,
        updated_at
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 1, 'ok', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)

      ON CONFLICT(id) DO UPDATE SET
        name = excluded.name,
        short_name = excluded.short_name,
        source_type = excluded.source_type,
        website_url = excluded.website_url,
        feed_url = excluded.feed_url,
        country = excluded.country,
        language = excluded.language,
        adapter_type = excluded.adapter_type,
        is_active = 1,
        source_status = 'ok',
        updated_at = CURRENT_TIMESTAMP
    `)
    .bind(
      source.id,
      source.name,
      source.shortName ??
        source.name,
      source.sourceType ??
        null,
      source.websiteUrl ??
        null,
      source.feedUrl,
      source.country ??
        null,
      source.language ??
        "en",
      source.adapterType,
    )
    .run();
}

export async function markSourceFailure(
  db: D1Database,
  source: NewsSourceDefinition,
  message: string,
): Promise<void> {
  await db
    .prepare(`
      UPDATE news_sources
      SET
        source_status = 'failed',
        last_fetch_attempt_at = CURRENT_TIMESTAMP,
        last_error_code = 'FETCH_FAILED',
        last_error_message = ?,
        updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `)
    .bind(
      message.slice(
        0,
        1000,
      ),
      source.id,
    )
    .run();
}

export async function markSourceSuccess(
  db: D1Database,
  sourceId: string,
): Promise<void> {
  await db
    .prepare(`
      UPDATE news_sources
      SET
        source_status = 'ok',
        last_fetch_attempt_at = CURRENT_TIMESTAMP,
        last_successful_fetch_at = CURRENT_TIMESTAMP,
        last_error_code = NULL,
        last_error_message = NULL,
        updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `)
    .bind(sourceId)
    .run();
}

export async function upsertArticle(
  db: D1Database,
  candidate: ClassifiedNewsCandidate,
): Promise<ArticleWriteResult> {
  const id =
    articleId(
      candidate.sourceId,
      candidate.canonicalUrl,
    );

  const existing =
    await db
      .prepare(`
        SELECT id
        FROM news_articles
        WHERE canonical_url = ?
        LIMIT 1
      `)
      .bind(
        candidate.canonicalUrl,
      )
      .first<{
        id: string;
      }>();

  const resolvedId =
    existing?.id ??
    id;

  await db
    .prepare(`
      INSERT INTO news_articles (
        id,
        slug,
        title,
        summary,
        source_id,
        article_url,
        canonical_url,
        image_url,
        image_alt,
        image_credit,
        author,
        published_at,
        publisher_updated_at,
        fetched_at,
        category,
        country,
        region,
        mission,
        observatory,
        telescope,
        news_type,
        is_featured,
        is_research_orbit,
        research_orbit_score,
        language,
        content_fingerprint,
        created_at,
        updated_at
      )
      VALUES (
        ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?,
        ?, ?, ?, ?, ?, ?, ?, ?, ?, ?,
        ?, ?, ?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
      )

      ON CONFLICT(canonical_url) DO UPDATE SET
        slug = excluded.slug,
        title = excluded.title,
        summary = excluded.summary,
        article_url = excluded.article_url,

        image_url = COALESCE(
          excluded.image_url,
          news_articles.image_url
        ),

        image_alt = COALESCE(
          excluded.image_alt,
          news_articles.image_alt
        ),

        image_credit = COALESCE(
          excluded.image_credit,
          news_articles.image_credit
        ),

        author = excluded.author,
        publisher_updated_at = excluded.publisher_updated_at,
        fetched_at = excluded.fetched_at,
        category = excluded.category,
        country = excluded.country,
        region = excluded.region,
        mission = excluded.mission,
        observatory = excluded.observatory,
        telescope = excluded.telescope,
        news_type = excluded.news_type,
        is_featured = excluded.is_featured,
        is_research_orbit = excluded.is_research_orbit,
        research_orbit_score = excluded.research_orbit_score,
        language = excluded.language,
        content_fingerprint = excluded.content_fingerprint,
        updated_at = CURRENT_TIMESTAMP
    `)
    .bind(
      resolvedId,
      slugify(
        candidate.title,
      ),
      candidate.title,
      candidate.summary,
      candidate.sourceId,
      candidate.articleUrl,
      candidate.canonicalUrl,

      candidate.imageUrl ??
        null,

      candidate.imageAlt ??
        null,

      candidate.imageCredit ??
        null,

      candidate.author ??
        null,

      candidate.publishedAt,

      null,

      new Date()
        .toISOString(),

      candidate.category,

      null,
      null,

      candidate.mission ??
        null,

      candidate.observatory ??
        null,

      candidate.telescope ??
        null,

      candidate.newsType,

      candidate.isFeatured
        ? 1
        : 0,

      candidate.isResearchOrbit
        ? 1
        : 0,

      candidate.researchOrbitScore,

      candidate.language,

      fingerprint(
        candidate,
      ),
    )
    .run();

  await db
    .prepare(`
      DELETE FROM news_article_topics
      WHERE article_id = ?
    `)
    .bind(
      resolvedId,
    )
    .run();

  await db
    .prepare(`
      DELETE FROM news_article_tags
      WHERE article_id = ?
    `)
    .bind(
      resolvedId,
    )
    .run();

  if (
    candidate.topics.length >
    0
  ) {
    await db.batch(
      candidate.topics.map(
        (topic) =>
          db
            .prepare(`
              INSERT OR IGNORE INTO news_article_topics (
                article_id,
                topic
              )
              VALUES (?, ?)
            `)
            .bind(
              resolvedId,
              topic,
            ),
      ),
    );
  }

  if (
    candidate.tags.length >
    0
  ) {
    await db.batch(
      candidate.tags.map(
        (tag) =>
          db
            .prepare(`
              INSERT OR IGNORE INTO news_article_tags (
                article_id,
                tag
              )
              VALUES (?, ?)
            `)
            .bind(
              resolvedId,
              tag,
            ),
      ),
    );
  }

  return existing
    ? "updated"
    : "inserted";
}

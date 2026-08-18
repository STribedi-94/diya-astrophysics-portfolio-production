
-- ================================================================
-- Diya Astrophysics Portfolio
-- Astrophysics News Hub
-- Initial Cloudflare D1 schema
-- ================================================================

-- ----------------------------------------------------------------
-- Trusted news sources
-- ----------------------------------------------------------------

CREATE TABLE IF NOT EXISTS news_sources (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  short_name TEXT,
  source_type TEXT,

  website_url TEXT,
  feed_url TEXT,
  logo_url TEXT,

  country TEXT,
  language TEXT NOT NULL DEFAULT 'en',

  adapter_type TEXT NOT NULL DEFAULT 'rss',

  is_active INTEGER NOT NULL DEFAULT 1
    CHECK (is_active IN (0, 1)),

  source_status TEXT NOT NULL DEFAULT 'pending'
    CHECK (source_status IN (
      'pending',
      'ok',
      'degraded',
      'failed',
      'disabled'
    )),

  last_fetch_attempt_at TEXT,
  last_successful_fetch_at TEXT,
  last_error_code TEXT,
  last_error_message TEXT,

  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);


-- ----------------------------------------------------------------
-- Historical article archive
-- ----------------------------------------------------------------

CREATE TABLE IF NOT EXISTS news_articles (
  id TEXT PRIMARY KEY,

  slug TEXT,

  title TEXT NOT NULL,
  summary TEXT NOT NULL DEFAULT '',

  source_id TEXT NOT NULL,

  article_url TEXT NOT NULL,
  canonical_url TEXT NOT NULL,

  image_url TEXT,
  image_alt TEXT,
  image_credit TEXT,

  author TEXT,

  published_at TEXT NOT NULL,
  publisher_updated_at TEXT,
  fetched_at TEXT NOT NULL,

  category TEXT NOT NULL DEFAULT 'Astronomy',

  country TEXT,
  region TEXT,
  mission TEXT,
  observatory TEXT,
  telescope TEXT,
  news_type TEXT,

  is_featured INTEGER NOT NULL DEFAULT 0
    CHECK (is_featured IN (0, 1)),

  is_research_orbit INTEGER NOT NULL DEFAULT 0
    CHECK (is_research_orbit IN (0, 1)),

  research_orbit_score REAL,

  language TEXT NOT NULL DEFAULT 'en',

  content_fingerprint TEXT,

  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,

  FOREIGN KEY (source_id)
    REFERENCES news_sources(id)
    ON UPDATE CASCADE
    ON DELETE RESTRICT
);


-- ----------------------------------------------------------------
-- Article topics
-- ----------------------------------------------------------------

CREATE TABLE IF NOT EXISTS news_article_topics (
  article_id TEXT NOT NULL,
  topic TEXT NOT NULL,

  PRIMARY KEY (article_id, topic),

  FOREIGN KEY (article_id)
    REFERENCES news_articles(id)
    ON DELETE CASCADE
);


-- ----------------------------------------------------------------
-- Article tags
-- ----------------------------------------------------------------

CREATE TABLE IF NOT EXISTS news_article_tags (
  article_id TEXT NOT NULL,
  tag TEXT NOT NULL,

  PRIMARY KEY (article_id, tag),

  FOREIGN KEY (article_id)
    REFERENCES news_articles(id)
    ON DELETE CASCADE
);


-- ----------------------------------------------------------------
-- Source ingestion history
-- ----------------------------------------------------------------

CREATE TABLE IF NOT EXISTS news_ingestion_runs (
  id TEXT PRIMARY KEY,
  source_id TEXT,

  started_at TEXT NOT NULL,
  completed_at TEXT,

  status TEXT NOT NULL DEFAULT 'running'
    CHECK (status IN (
      'running',
      'completed',
      'partial',
      'failed'
    )),

  fetched_item_count INTEGER NOT NULL DEFAULT 0,
  inserted_item_count INTEGER NOT NULL DEFAULT 0,
  updated_item_count INTEGER NOT NULL DEFAULT 0,
  duplicate_item_count INTEGER NOT NULL DEFAULT 0,
  rejected_item_count INTEGER NOT NULL DEFAULT 0,

  error_code TEXT,
  error_message TEXT,

  FOREIGN KEY (source_id)
    REFERENCES news_sources(id)
    ON DELETE SET NULL
);


-- ----------------------------------------------------------------
-- Deduplication constraints
-- ----------------------------------------------------------------

CREATE UNIQUE INDEX IF NOT EXISTS idx_news_articles_canonical_url
  ON news_articles(canonical_url);

CREATE UNIQUE INDEX IF NOT EXISTS idx_news_articles_content_fingerprint
  ON news_articles(content_fingerprint)
  WHERE content_fingerprint IS NOT NULL;


-- ----------------------------------------------------------------
-- Feed query indexes
-- ----------------------------------------------------------------

CREATE INDEX IF NOT EXISTS idx_news_articles_published_at
  ON news_articles(published_at DESC);

CREATE INDEX IF NOT EXISTS idx_news_articles_source_id
  ON news_articles(source_id);

CREATE INDEX IF NOT EXISTS idx_news_articles_category
  ON news_articles(category);

CREATE INDEX IF NOT EXISTS idx_news_articles_country
  ON news_articles(country);

CREATE INDEX IF NOT EXISTS idx_news_articles_mission
  ON news_articles(mission);

CREATE INDEX IF NOT EXISTS idx_news_articles_observatory
  ON news_articles(observatory);

CREATE INDEX IF NOT EXISTS idx_news_articles_telescope
  ON news_articles(telescope);

CREATE INDEX IF NOT EXISTS idx_news_articles_news_type
  ON news_articles(news_type);

CREATE INDEX IF NOT EXISTS idx_news_articles_featured
  ON news_articles(is_featured, published_at DESC);

CREATE INDEX IF NOT EXISTS idx_news_articles_research_orbit
  ON news_articles(
    is_research_orbit,
    research_orbit_score DESC,
    published_at DESC
  );

CREATE INDEX IF NOT EXISTS idx_news_topics_topic
  ON news_article_topics(topic);

CREATE INDEX IF NOT EXISTS idx_news_tags_tag
  ON news_article_tags(tag);


-- ----------------------------------------------------------------
-- Source-health indexes
-- ----------------------------------------------------------------

CREATE INDEX IF NOT EXISTS idx_news_sources_active_status
  ON news_sources(is_active, source_status);

CREATE INDEX IF NOT EXISTS idx_news_sources_last_success
  ON news_sources(last_successful_fetch_at);


-- ----------------------------------------------------------------
-- Ingestion-history indexes
-- ----------------------------------------------------------------

CREATE INDEX IF NOT EXISTS idx_news_ingestion_runs_source
  ON news_ingestion_runs(source_id, started_at DESC);

CREATE INDEX IF NOT EXISTS idx_news_ingestion_runs_status
  ON news_ingestion_runs(status, started_at DESC);
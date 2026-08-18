import { classifyCandidate } from "./classifier";
import { enrichCandidateImages } from "./image-enrichment";
import {
  markSourceFailure,
  markSourceSuccess,
  upsertArticle,
  upsertSource,
} from "./repository";
import { fetchSourceCandidates } from "./source-adapter";
import {
  NEWS_SOURCES,
  type NewsSourceDefinition,
} from "./sources";

export type SourceIngestionResult = {
  sourceId: string;
  sourceName: string;

  fetchedCount: number;
  acceptedCount: number;
  rejectedCount: number;

  insertedCount: number;
  updatedCount: number;

  status: "completed" | "partial" | "failed";

  message?: string;
};

export type FullIngestionResult = {
  startedAt: string;
  completedAt: string;

  sourceCount: number;
  completedSourceCount: number;
  failedSourceCount: number;

  fetchedCount: number;
  acceptedCount: number;
  rejectedCount: number;

  insertedCount: number;
  updatedCount: number;

  status: "completed" | "partial" | "failed";

  sources: SourceIngestionResult[];
};

async function writeIngestionRun(
  db: D1Database,
  values: {
    id: string;
    sourceId: string;
    startedAt: string;
    completedAt?: string;

    status:
      | "running"
      | "completed"
      | "partial"
      | "failed";

    fetchedCount?: number;
    insertedCount?: number;
    updatedCount?: number;
    duplicateCount?: number;
    rejectedCount?: number;

    errorCode?: string;
    errorMessage?: string;
  },
): Promise<void> {
  await db
    .prepare(`
      INSERT INTO news_ingestion_runs (
        id,
        source_id,
        started_at,
        completed_at,
        status,
        fetched_item_count,
        inserted_item_count,
        updated_item_count,
        duplicate_item_count,
        rejected_item_count,
        error_code,
        error_message
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)

      ON CONFLICT(id) DO UPDATE SET
        completed_at = excluded.completed_at,
        status = excluded.status,
        fetched_item_count = excluded.fetched_item_count,
        inserted_item_count = excluded.inserted_item_count,
        updated_item_count = excluded.updated_item_count,
        duplicate_item_count = excluded.duplicate_item_count,
        rejected_item_count = excluded.rejected_item_count,
        error_code = excluded.error_code,
        error_message = excluded.error_message
    `)
    .bind(
      values.id,
      values.sourceId,
      values.startedAt,
      values.completedAt ?? null,
      values.status,
      values.fetchedCount ?? 0,
      values.insertedCount ?? 0,
      values.updatedCount ?? 0,
      values.duplicateCount ?? 0,
      values.rejectedCount ?? 0,
      values.errorCode ?? null,
      values.errorMessage?.slice(0, 1000) ?? null,
    )
    .run();
}

function runId(
  sourceId: string,
  startedAt: string,
): string {
  const value = `${sourceId}:${startedAt}`;

  let hash = 2166136261;

  for (
    let index = 0;
    index < value.length;
    index += 1
  ) {
    hash ^= value.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }

  return `ingest_${sourceId}_${(
    hash >>> 0
  ).toString(16)}`;
}

export async function ingestSource(
  db: D1Database,
  source: NewsSourceDefinition,
): Promise<SourceIngestionResult> {
  const startedAt =
    new Date().toISOString();

  const id =
    runId(source.id, startedAt);

  await upsertSource(
    db,
    source,
  );

  await writeIngestionRun(
    db,
    {
      id,
      sourceId: source.id,
      startedAt,
      status: "running",
    },
  );

  try {
    const controller =
      new AbortController();

    const timeout =
      setTimeout(
        () =>
          controller.abort(),
        12_000,
      );

    let candidates;

    try {
      candidates =
        await fetchSourceCandidates(
          source,
          controller.signal,
        );
    } finally {
      clearTimeout(timeout);
    }

    const classified =
      candidates.map(
        (candidate) =>
          classifyCandidate(
            candidate,
            source,
          ),
      );

    const accepted =
      classified.filter(
        (candidate) =>
          candidate.accepted,
      );

    const rejected =
      classified.filter(
        (candidate) =>
          !candidate.accepted,
      );

    /*
     * Enrich only accepted astrophysics stories.
     *
     * Adapter-provided metadata remains authoritative when present.
     * Article-page metadata is fetched only for accepted items that
     * still need an image and/or summary.
     */
    const enrichedAccepted =
      await enrichCandidateImages(
        accepted,
      );

    let insertedCount = 0;
    let updatedCount = 0;

    for (
      const candidate
      of enrichedAccepted
    ) {
      const result =
        await upsertArticle(
          db,
          candidate,
        );

      if (
        result === "inserted"
      ) {
        insertedCount += 1;
      } else {
        updatedCount += 1;
      }
    }

    await markSourceSuccess(
      db,
      source.id,
    );

    const completedAt =
      new Date().toISOString();

    await writeIngestionRun(
      db,
      {
        id,
        sourceId: source.id,
        startedAt,
        completedAt,

        status:
          "completed",

        fetchedCount:
          candidates.length,

        insertedCount,
        updatedCount,

        duplicateCount:
          updatedCount,

        rejectedCount:
          rejected.length,
      },
    );

    return {
      sourceId:
        source.id,

      sourceName:
        source.name,

      fetchedCount:
        candidates.length,

      acceptedCount:
        accepted.length,

      rejectedCount:
        rejected.length,

      insertedCount,
      updatedCount,

      status:
        "completed",
    };
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : "Unknown ingestion failure.";

    await markSourceFailure(
      db,
      source,
      message,
    );

    await writeIngestionRun(
      db,
      {
        id,

        sourceId:
          source.id,

        startedAt,

        completedAt:
          new Date()
            .toISOString(),

        status:
          "failed",

        errorCode:
          "INGESTION_FAILED",

        errorMessage:
          message,
      },
    );

    return {
      sourceId:
        source.id,

      sourceName:
        source.name,

      fetchedCount: 0,
      acceptedCount: 0,
      rejectedCount: 0,

      insertedCount: 0,
      updatedCount: 0,

      status: "failed",
      message,
    };
  }
}

export async function ingestAllSources(
  db: D1Database,
): Promise<FullIngestionResult> {
  const startedAt =
    new Date().toISOString();

  const activeSources =
    NEWS_SOURCES.filter(
      (source) =>
        source.isActive,
    );

  const results:
    SourceIngestionResult[] = [];

  /*
   * Process sources sequentially.
   *
   * This keeps external requests controlled and guarantees
   * that a failed source cannot stop the remaining sources.
   */
  for (
    const source
    of activeSources
  ) {
    try {
      const result =
        await ingestSource(
          db,
          source,
        );

      results.push(result);
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Unexpected source ingestion failure.";

      console.error(
        `[news] unhandled ingestion failure for ${source.id}`,
        error,
      );

      results.push({
        sourceId:
          source.id,

        sourceName:
          source.name,

        fetchedCount: 0,
        acceptedCount: 0,
        rejectedCount: 0,

        insertedCount: 0,
        updatedCount: 0,

        status:
          "failed",

        message,
      });
    }
  }

  const completedSourceCount =
    results.filter(
      (result) =>
        result.status ===
        "completed",
    ).length;

  const failedSourceCount =
    results.filter(
      (result) =>
        result.status ===
        "failed",
    ).length;

  const fetchedCount =
    results.reduce(
      (sum, result) =>
        sum +
        result.fetchedCount,
      0,
    );

  const acceptedCount =
    results.reduce(
      (sum, result) =>
        sum +
        result.acceptedCount,
      0,
    );

  const rejectedCount =
    results.reduce(
      (sum, result) =>
        sum +
        result.rejectedCount,
      0,
    );

  const insertedCount =
    results.reduce(
      (sum, result) =>
        sum +
        result.insertedCount,
      0,
    );

  const updatedCount =
    results.reduce(
      (sum, result) =>
        sum +
        result.updatedCount,
      0,
    );

  const status:
    FullIngestionResult["status"] =
    failedSourceCount === 0
      ? "completed"
      : completedSourceCount === 0
        ? "failed"
        : "partial";

  return {
    startedAt,

    completedAt:
      new Date()
        .toISOString(),

    sourceCount:
      activeSources.length,

    completedSourceCount,
    failedSourceCount,

    fetchedCount,
    acceptedCount,
    rejectedCount,

    insertedCount,
    updatedCount,

    status,

    sources:
      results,
  };
}

export function getSourceById(
  sourceId: string | null,
): NewsSourceDefinition | undefined {
  return NEWS_SOURCES.find(
    (source) =>
      source.id === sourceId,
  );
}

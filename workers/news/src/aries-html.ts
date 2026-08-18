import type { IngestedNewsCandidate } from "./rss";
import type { NewsSourceDefinition } from "./sources";

function decodeHtmlEntities(value: string): string {
  return value
    .replace(/&#(\d+);/g, (_, decimal: string) => {
      const codePoint = Number.parseInt(decimal, 10);

      return Number.isFinite(codePoint)
        ? String.fromCodePoint(codePoint)
        : _;
    })
    .replace(/&#x([0-9a-f]+);/gi, (_, hex: string) => {
      const codePoint = Number.parseInt(hex, 16);

      return Number.isFinite(codePoint)
        ? String.fromCodePoint(codePoint)
        : _;
    })
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/&quot;/gi, "\"")
    .replace(/&#39;/gi, "'")
    .replace(/&apos;/gi, "'")
    .replace(/&lt;/gi, "<")
    .replace(/&gt;/gi, ">");
}

function stripHtml(value: string): string {
  return decodeHtmlEntities(
    value
      .replace(/<script[\s\S]*?<\/script>/gi, " ")
      .replace(/<style[\s\S]*?<\/style>/gi, " ")
      .replace(/<[^>]+>/g, " ")
      .replace(/\s+/g, " ")
      .trim(),
  );
}

function safeAbsoluteHttpUrl(
  value: string,
  baseUrl: string,
): string | undefined {
  try {
    const resolved = new URL(
      decodeHtmlEntities(value.trim()),
      baseUrl,
    );

    if (
      resolved.protocol !== "http:" &&
      resolved.protocol !== "https:"
    ) {
      return undefined;
    }

    return resolved.toString();
  } catch {
    return undefined;
  }
}

function normalizeAriesDate(
  value: string,
): string | undefined {
  const match = value.match(
    /^(\d{4})-(\d{2})-(\d{2})$/,
  );

  if (!match) {
    return undefined;
  }

  const [, year, month, day] = match;

  const date = new Date(
    `${year}-${month}-${day}T00:00:00.000Z`,
  );

  return Number.isFinite(date.getTime())
    ? date.toISOString()
    : undefined;
}

function extractAriesCandidates(
  html: string,
  source: NewsSourceDefinition,
): IngestedNewsCandidate[] {
  const candidates:
    IngestedNewsCandidate[] = [];

  /*
   * ARIES exposes its Science Nuggets through a dedicated
   * Drupal listing:
   *
   *   /announcement_scientific
   *
   * Each current listing item contains a post-title with:
   *
   *   <a href="/node/...">Title</a> | YYYY-MM-DD
   *
   * Restrict parsing to post-title blocks so unrelated
   * navigation/footer links never become news candidates.
   */
  const postTitleBlocks = [
    ...html.matchAll(
      /<div\b[^>]*class=["'][^"']*\bpost-title\b[^"']*["'][^>]*>([\s\S]*?)<\/div>/gi,
    ),
  ].map(
    (match) =>
      match[1] ?? "",
  );

  for (
    const block
    of postTitleBlocks
  ) {
    const anchor =
      block.match(
        /<a\b[^>]*href=["']([^"']+)["'][^>]*>([\s\S]*?)<\/a>/i,
      );

    if (!anchor) {
      continue;
    }

    const href =
      anchor[1] ?? "";

    const title =
      stripHtml(
        anchor[2] ?? "",
      );

    if (!title) {
      continue;
    }

    const dateMatch =
      stripHtml(block).match(
        /\|\s*(\d{4}-\d{2}-\d{2})\b/,
      );

    const publishedAt =
      normalizeAriesDate(
        dateMatch?.[1] ?? "",
      );

    if (!publishedAt) {
      continue;
    }

    const articleUrl =
      safeAbsoluteHttpUrl(
        href,
        source.websiteUrl,
      );

    if (!articleUrl) {
      continue;
    }

    candidates.push({
      sourceId:
        source.id,

      title,

      /*
       * ARIES listing pages do not expose a useful summary.
       * Keep this empty so the existing post-classification
       * article metadata enrichment can fill it from the
       * article page's description metadata when available.
       */
      summary: "",

      articleUrl,
      canonicalUrl:
        articleUrl,

      publishedAt,

      category:
        source.defaultCategory,

      language:
        source.language,
    });
  }

  return candidates;
}

export async function fetchAriesHtmlSource(
  source: NewsSourceDefinition,
  signal?: AbortSignal,
): Promise<IngestedNewsCandidate[]> {
  const response =
    await fetch(
      source.feedUrl,
      {
        redirect: "follow",

        headers: {
          Accept:
            "text/html,application/xhtml+xml;q=0.9,*/*;q=0.1",

          "User-Agent":
            "Diya-Astrophysics-News-Hub/1.0",
        },

        signal,
      },
    );

  if (!response.ok) {
    throw new Error(
      `ARIES listing request failed: ${response.status}`,
    );
  }

  const contentType =
    response.headers
      .get("content-type")
      ?.toLowerCase() ?? "";

  if (
    !contentType.includes("text/html") &&
    !contentType.includes(
      "application/xhtml+xml",
    )
  ) {
    throw new Error(
      `Unexpected ARIES content type: ${contentType || "unknown"}`,
    );
  }

  const html =
    await response.text();

  if (!html.trim()) {
    throw new Error(
      "ARIES listing response was empty.",
    );
  }

  const candidates =
    extractAriesCandidates(
      html,
      source,
    );

  if (candidates.length === 0) {
    throw new Error(
      "ARIES listing contained no parseable Science Nuggets.",
    );
  }

  return candidates;
}

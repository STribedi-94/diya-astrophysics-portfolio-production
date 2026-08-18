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

function normalizeIiaDate(
  value: string,
): string | undefined {
  const cleaned =
    stripHtml(value)
      .replace(/\s+/g, " ")
      .trim();

  if (!cleaned) {
    return undefined;
  }

  /*
   * IIA currently renders human-visible dates such as:
   *
   *   December 20, 2025
   *
   * Do not trust the repeated legacy datetime="2020-05-25..."
   * attribute observed in the listing markup.
   */
  const monthMatch =
    cleaned.match(
      /\b(January|February|March|April|May|June|July|August|September|October|November|December)\s+(\d{1,2}),?\s+(\d{4})\b/i,
    );

  if (!monthMatch) {
    return undefined;
  }

  const monthNames = [
    "january",
    "february",
    "march",
    "april",
    "may",
    "june",
    "july",
    "august",
    "september",
    "october",
    "november",
    "december",
  ];

  const month =
    monthNames.indexOf(
      (monthMatch[1] ?? "").toLowerCase(),
    );

  const day =
    Number.parseInt(
      monthMatch[2] ?? "",
      10,
    );

  const year =
    Number.parseInt(
      monthMatch[3] ?? "",
      10,
    );

  if (
    month < 0 ||
    !Number.isFinite(day) ||
    !Number.isFinite(year)
  ) {
    return undefined;
  }

  const date =
    new Date(
      Date.UTC(
        year,
        month,
        day,
        0,
        0,
        0,
        0,
      ),
    );

  if (
    date.getUTCFullYear() !== year ||
    date.getUTCMonth() !== month ||
    date.getUTCDate() !== day
  ) {
    return undefined;
  }

  return date.toISOString();
}

function extractIiaCandidates(
  html: string,
  source: NewsSourceDefinition,
): IngestedNewsCandidate[] {
  const candidates:
    IngestedNewsCandidate[] = [];

  /*
   * The IIA Research Highlights listing is composed of
   * top-level list items. Each scientific card currently
   * contains:
   *
   *   - thumbnail with class "article-img"
   *   - author in class "cat_Name"
   *   - human-visible publication date
   *   - h2 class "title"
   *   - h5 class "dis" containing the scientific summary
   *   - a "Read more" link to prints.iiap.res.in
   *
   * Parse only list items that contain both the title and
   * article-image markers. This prevents pagination/navigation
   * list items from becoming candidates.
   */
  const listItems = [
    ...html.matchAll(
      /<li\b[^>]*>([\s\S]*?)<\/li>/gi,
    ),
  ].map(
    (match) =>
      match[1] ?? "",
  );

  for (
    const block
    of listItems
  ) {
    if (
      !/\barticle-img\b/i.test(block) ||
      !/<h2\b[^>]*class=["'][^"']*\btitle\b[^"']*["']/i.test(
        block,
      )
    ) {
      continue;
    }

    const titleMatch =
      block.match(
        /<h2\b[^>]*class=["'][^"']*\btitle\b[^"']*["'][^>]*>([\s\S]*?)<\/h2>/i,
      );

    const title =
      stripHtml(
        titleMatch?.[1] ?? "",
      );

    if (!title) {
      continue;
    }

    /*
     * Prefer the local IIA Research Highlight page represented
     * by the anchor surrounding the title. This is the canonical
     * news/article page for the website.
     */
    const titleAnchorMatch =
      block.match(
        /<a\b[^>]*href=["']([^"']+)["'][^>]*>\s*<h2\b[^>]*class=["'][^"']*\btitle\b[^"']*["'][^>]*>[\s\S]*?<\/h2>\s*<\/a>/i,
      );

    const articleUrl =
      titleAnchorMatch?.[1]
        ? safeAbsoluteHttpUrl(
            titleAnchorMatch[1],
            source.feedUrl,
          )
        : undefined;

    if (!articleUrl) {
      continue;
    }

    const descriptionMatch =
      block.match(
        /<h5\b[^>]*class=["'][^"']*\bdis\b[^"']*["'][^>]*>([\s\S]*?)<\/h5>/i,
      );

    let summaryHtml =
      descriptionMatch?.[1] ?? "";

    /*
     * Remove the final repository "Read more" paragraph from the
     * scientific description before converting it to plain text.
     */
    summaryHtml =
      summaryHtml.replace(
        /<p\b[^>]*>\s*<a\b[^>]*>\s*Read\s+more\s*<\/a>\s*<\/p>/gi,
        " ",
      );

    const summary =
      stripHtml(summaryHtml);

    if (!summary) {
      continue;
    }

    const imageMatch =
      block.match(
        /<img\b[^>]*class=["'][^"']*\barticle-img\b[^"']*["'][^>]*src=["']([^"']+)["'][^>]*>/i,
      ) ??
      block.match(
        /<img\b[^>]*src=["']([^"']+)["'][^>]*class=["'][^"']*\barticle-img\b[^"']*["'][^>]*>/i,
      );

    const imageUrl =
      imageMatch?.[1]
        ? safeAbsoluteHttpUrl(
            imageMatch[1],
            source.websiteUrl,
          )
        : undefined;

    const authorMatch =
      block.match(
        /<span\b[^>]*class=["'][^"']*\bcat_Name\b[^"']*["'][^>]*>([\s\S]*?)<\/span>/i,
      );

    const author =
      stripHtml(
        authorMatch?.[1] ?? "",
      );

    /*
     * Extract the visible date from the card text rather than
     * using IIA's observed repeated legacy datetime attribute.
     */
    const publishedAt =
      normalizeIiaDate(block);

    if (!publishedAt) {
      continue;
    }

    candidates.push({
      sourceId:
        source.id,

      title,
      summary,

      articleUrl,
      canonicalUrl:
        articleUrl,

      publishedAt,

      author:
        author || undefined,

      imageUrl,

      category:
        source.defaultCategory,

      language:
        source.language,
    });
  }

  return candidates;
}

export async function fetchIiaHtmlSource(
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
      `IIA Research Highlights request failed: ${response.status}`,
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
      `Unexpected IIA content type: ${contentType || "unknown"}`,
    );
  }

  const html =
    await response.text();

  if (!html.trim()) {
    throw new Error(
      "IIA Research Highlights response was empty.",
    );
  }

  const candidates =
    extractIiaCandidates(
      html,
      source,
    );

  if (candidates.length === 0) {
    throw new Error(
      "IIA Research Highlights contained no parseable articles.",
    );
  }

  return candidates;
}
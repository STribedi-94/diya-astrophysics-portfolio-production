import type { IngestedNewsCandidate } from "./rss";
import type { NewsSourceDefinition } from "./sources";

const ARTICLE_CONCURRENCY = 3;
const ARTICLE_TIMEOUT_MS = 15_000;

/*
 * The official homepage keeps a rolling Latest News history.
 * Scheduled ingestion only needs the newest window; bounding the
 * list prevents an unexpected homepage expansion from generating
 * an unbounded number of article requests.
 */
const MAX_LISTING_CANDIDATES = 24;

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
    .replace(/&quot;/gi, '"')
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

function extractAttribute(
  tag: string,
  attribute: string,
): string | undefined {
  const escaped = attribute.replace(
    /[.*+?^${}()|[\]\\]/g,
    "\\$&",
  );

  const match = tag.match(
    new RegExp(
      `\\b${escaped}\\s*=\\s*(?:"([^"]*)"|'([^']*)'|([^\\s"'=<>` +
        "`" +
        `]+))`,
      "i",
    ),
  );

  return (
    match?.[1] ??
    match?.[2] ??
    match?.[3]
  );
}

function safeAbsoluteHttpUrl(
  value: string | undefined,
  baseUrl: string,
): string | undefined {
  if (!value) return undefined;

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

function normalizeIsroDate(
  value: string,
): string | undefined {
  const cleaned =
    stripHtml(value)
      .replace(/\s+/g, " ")
      .trim();

  const match =
    cleaned.match(
      /\b(January|February|March|April|May|June|July|August|September|October|November|December)\s+(\d{1,2}),?\s+(\d{4})\b/i,
    );

  if (!match) {
    return undefined;
  }

  const months = [
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
    months.indexOf(
      (match[1] ?? "").toLowerCase(),
    );

  const day =
    Number.parseInt(
      match[2] ?? "",
      10,
    );

  const year =
    Number.parseInt(
      match[3] ?? "",
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

type ListingCandidate = {
  title: string;
  articleUrl: string;
};

function extractLatestNewsSection(
  html: string,
): string | undefined {
  const marker =
    html.search(
      /Latest\s+News/i,
    );

  if (marker < 0) {
    return undefined;
  }

  /*
   * The homepage currently renders Latest News as Bootstrap-style
   * accordion items. Keep the slice bounded so unrelated navigation
   * and page sections cannot become source candidates.
   */
  const possibleEnds = [
    html.indexOf(
      "More Updates",
      marker,
    ),
    html.indexOf(
      "Recent Updates",
      marker,
    ),
    html.indexOf(
      "<footer",
      marker,
    ),
  ].filter(
    (value) =>
      value > marker,
  );

  const end =
    possibleEnds.length > 0
      ? Math.min(...possibleEnds)
      : Math.min(
          html.length,
          marker + 192 * 1024,
        );

  return html.slice(
    marker,
    end,
  );
}

function extractListingCandidates(
  html: string,
  source: NewsSourceDefinition,
): ListingCandidate[] {
  const section =
    extractLatestNewsSection(html);

  if (!section) {
    return [];
  }

  const candidates:
    ListingCandidate[] = [];

  const seen =
    new Set<string>();

  const anchors =
    section.match(
      /<a\b[^>]*href=["'][^"']+["'][^>]*>[\s\S]*?<\/a>/gi,
    ) ?? [];

  for (const anchor of anchors) {
    const href =
      extractAttribute(
        anchor,
        "href",
      );

    const articleUrl =
      safeAbsoluteHttpUrl(
        href,
        source.websiteUrl,
      );

    if (!articleUrl) {
      continue;
    }

    let parsed: URL;

    try {
      parsed =
        new URL(articleUrl);
    } catch {
      continue;
    }

    const hostname =
      parsed.hostname
        .toLowerCase();

    if (
      hostname !== "isro.gov.in" &&
      hostname !== "www.isro.gov.in"
    ) {
      continue;
    }

    if (
      !parsed.pathname
        .toLowerCase()
        .endsWith(".html")
    ) {
      continue;
    }

    const title =
      stripHtml(anchor);

    if (
      !title ||
      title.length < 8 ||
      /^read\s+more$/i.test(title) ||
      /^more\s+updates$/i.test(title)
    ) {
      continue;
    }

    if (seen.has(articleUrl)) {
      continue;
    }

    seen.add(articleUrl);

    candidates.push({
      title,
      articleUrl,
    });
  }

  return candidates.slice(
    0,
    MAX_LISTING_CANDIDATES,
  );
}

type ArticleMetadata = {
  title?: string;
  publishedAt?: string;
  summary?: string;
  imageUrl?: string;
  imageAlt?: string;
};

function extractArticleMetadata(
  html: string,
  articleUrl: string,
): ArticleMetadata {
  const headingMatch =
    html.match(
      /<h[1-6]\b[^>]*class=["'][^"']*\bpageHeading\b[^"']*["'][^>]*>([\s\S]*?)<\/h[1-6]>/i,
    );

  const titleMatch =
    html.match(
      /<title\b[^>]*>([\s\S]*?)<\/title>/i,
    );

  const headingTitle =
    stripHtml(
      headingMatch?.[1] ?? "",
    );

  const documentTitle =
    stripHtml(
      titleMatch?.[1] ?? "",
    )
      .replace(
        /\s*[-|]\s*ISRO\s*$/i,
        "",
      )
      .trim();

  const rawTitle =
    headingTitle ||
    documentTitle ||
    undefined;

  /*
   * ISRO page headings can include the breadcrumb after the visible
   * article title, for example:
   *
   *   Article title Home / Article title
   *
   * Keep only the actual article title.
   */
  const title =
    rawTitle
      ?.replace(
        /\s+Home\s*\/[\s\S]*$/i,
        "",
      )
      .trim() ||
    undefined;

  /*
   * ISRO science/news pages currently expose their publication date
   * as the first pageContent paragraph rather than standard metadata.
   */
  const pageParagraphs = [
    ...html.matchAll(
      /<p\b[^>]*class=["'][^"']*\bpageContent\b[^"']*["'][^>]*>([\s\S]*?)<\/p>/gi,
    ),
  ];

  let publishedAt:
    string | undefined;

  let summary:
    string | undefined;

  for (const paragraph of pageParagraphs) {
    const text =
      stripHtml(
        paragraph[1] ?? "",
      );

    if (!text) {
      continue;
    }

    if (!publishedAt) {
      const date =
        normalizeIsroDate(text);

      if (
        date &&
        text.length <= 80
      ) {
        publishedAt = date;
        continue;
      }
    }

    if (
      !summary &&
      text.length >= 80 &&
      !/^figure\b/i.test(text) &&
      !/^fig\.\s*\d+/i.test(text) &&
      !/^image\b/i.test(text) &&
      !/^credit\b/i.test(text) &&
      !/^download\b/i.test(text) &&
      !/^click\s+here\b/i.test(text)
    ) {
      summary = text;
    }

    if (
      publishedAt &&
      summary
    ) {
      break;
    }
  }

  /*
   * Restrict image selection to the article's pageContent region.
   * ISRO pages contain many global logos/icons outside this region.
   */
  const contentStart =
    html.search(
      /class=["'][^"']*\bcontentdiv\b[^"']*["']/i,
    );

  const articleHtml =
    contentStart >= 0
      ? html.slice(
          contentStart,
          Math.min(
            html.length,
            contentStart + 256 * 1024,
          ),
        )
      : html;

  const imageTags =
    articleHtml.match(
      /<img\b[^>]*>/gi,
    ) ?? [];

  let imageUrl:
    string | undefined;

  let imageAlt:
    string | undefined;

  for (const tag of imageTags) {
    const src =
      extractAttribute(
        tag,
        "src",
      );

    const resolved =
      safeAbsoluteHttpUrl(
        src,
        articleUrl,
      );

    if (!resolved) {
      continue;
    }

    const lower =
      resolved.toLowerCase();

    if (
      lower.includes("logo") ||
      lower.includes("favicon") ||
      lower.includes("icon") ||
      lower.includes("pdf") ||
      lower.includes("facebook") ||
      lower.includes("twitter") ||
      lower.includes("instagram") ||
      lower.includes("youtube")
    ) {
      continue;
    }

    imageUrl = resolved;

    imageAlt =
      stripHtml(
        extractAttribute(
          tag,
          "alt",
        ) ?? "",
      ) || undefined;

    break;
  }

  return {
    title,
    publishedAt,
    summary,
    imageUrl,
    imageAlt,
  };
}

async function fetchArticle(
  candidate: ListingCandidate,
  source: NewsSourceDefinition,
  signal?: AbortSignal,
): Promise<IngestedNewsCandidate | null> {
  const controller =
    new AbortController();

  const timeout =
    setTimeout(
      () => controller.abort(),
      ARTICLE_TIMEOUT_MS,
    );

  const abortFromParent = () =>
    controller.abort();

  if (signal) {
    if (signal.aborted) {
      controller.abort();
    } else {
      signal.addEventListener(
        "abort",
        abortFromParent,
        { once: true },
      );
    }
  }

  try {
    const response =
      await fetch(
        candidate.articleUrl,
        {
          redirect: "follow",

          headers: {
            Accept:
              "text/html,application/xhtml+xml;q=0.9,*/*;q=0.1",

            "User-Agent":
              "Diya-Astrophysics-News-Hub/1.0",
          },

          signal:
            controller.signal,
        },
      );

    if (!response.ok) {
      return null;
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
      return null;
    }

    const html =
      await response.text();

    if (!html.trim()) {
      return null;
    }

    const finalUrl =
      response.url ||
      candidate.articleUrl;

    const metadata =
      extractArticleMetadata(
        html,
        finalUrl,
      );

    /*
     * Do not invent publication dates or article text.
     * Both are required before a homepage item becomes an ingestible
     * normalized candidate.
     */
    if (
      !metadata.publishedAt ||
      !metadata.summary
    ) {
      return null;
    }

    return {
      sourceId:
        source.id,

      title:
        metadata.title ||
        candidate.title,

      summary:
        metadata.summary,

      articleUrl:
        finalUrl,

      canonicalUrl:
        finalUrl,

      publishedAt:
        metadata.publishedAt,

      imageUrl:
        metadata.imageUrl,

      imageAlt:
        metadata.imageAlt,

      category:
        source.defaultCategory,

      language:
        source.language,
    };
  } catch (error) {
    if (
      error instanceof Error &&
      error.name !== "AbortError"
    ) {
      console.warn(
        `[news] ISRO article fetch failed for ${candidate.articleUrl}`,
        error,
      );
    }

    return null;
  } finally {
    clearTimeout(timeout);

    if (signal) {
      signal.removeEventListener(
        "abort",
        abortFromParent,
      );
    }
  }
}

export async function fetchIsroHtmlSource(
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
      `ISRO Latest News request failed: ${response.status}`,
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
      `Unexpected ISRO content type: ${contentType || "unknown"}`,
    );
  }

  const html =
    await response.text();

  if (!html.trim()) {
    throw new Error(
      "ISRO homepage response was empty.",
    );
  }

  const listing =
    extractListingCandidates(
      html,
      source,
    );

  if (listing.length === 0) {
    throw new Error(
      "ISRO Latest News contained no parseable article links.",
    );
  }

  const candidates:
    IngestedNewsCandidate[] = [];

  for (
    let index = 0;
    index < listing.length;
    index += ARTICLE_CONCURRENCY
  ) {
    if (signal?.aborted) {
      break;
    }

    const batch =
      listing.slice(
        index,
        index + ARTICLE_CONCURRENCY,
      );

    const results =
      await Promise.all(
        batch.map(
          (candidate) =>
            fetchArticle(
              candidate,
              source,
              signal,
            ),
        ),
      );

    for (const result of results) {
      if (result) {
        candidates.push(result);
      }
    }
  }

  if (candidates.length === 0) {
    throw new Error(
      "ISRO Latest News articles could not be normalized.",
    );
  }

  return candidates;
}

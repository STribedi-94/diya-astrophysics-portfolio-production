
import type { NewsSourceDefinition } from "./sources";

export type IngestedNewsCandidate = {
  sourceId: string;

  title: string;
  summary: string;

  articleUrl: string;
  canonicalUrl: string;

  publishedAt: string;
  updatedAt?: string;

  author?: string;

  imageUrl?: string;
  imageAlt?: string;
  imageCredit?: string;

  category: string;

  language: string;
};

function decodeXml(value: string): string {
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
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, "\"")
    .replace(/&apos;/g, "'")
    .replace(/&#39;/g, "'");
}
function stripCdata(value: string): string {
  const trimmed = value.trim();

  if (
    trimmed.startsWith("<![CDATA[") &&
    trimmed.endsWith("]]>")
  ) {
    return trimmed.slice(9, -3);
  }

  return trimmed;
}

function stripHtml(value: string): string {
  return decodeXml(
    stripCdata(value)
      .replace(/<script[\s\S]*?<\/script>/gi, " ")
      .replace(/<style[\s\S]*?<\/style>/gi, " ")
      .replace(/<[^>]+>/g, " ")
      .replace(/\s+/g, " ")
      .trim(),
  );
}

function firstTag(
  block: string,
  names: string[],
): string | undefined {
  for (const name of names) {
    const escaped = name.replace(
      /[.*+?^${}()|[\]\\]/g,
      "\\$&",
    );

    const match = block.match(
      new RegExp(
        `<${escaped}(?:\\s[^>]*)?>([\\s\\S]*?)<\\/${escaped}>`,
        "i",
      ),
    );

    if (match?.[1]) {
      return stripCdata(match[1]).trim();
    }
  }

  return undefined;
}

function firstAttribute(
  block: string,
  tagNames: string[],
  attribute: string,
): string | undefined {
  for (const name of tagNames) {
    const escaped = name.replace(
      /[.*+?^${}()|[\]\\]/g,
      "\\$&",
    );

    const match = block.match(
      new RegExp(
        `<${escaped}\\b[^>]*\\b${attribute}\\s*=\\s*["']([^"']+)["'][^>]*>`,
        "i",
      ),
    );

    if (match?.[1]) {
      return decodeXml(match[1].trim());
    }
  }

  return undefined;
}

function safeHttpUrl(
  value: string | undefined,
): string | undefined {
  if (!value) return undefined;

  try {
    const parsed = new URL(decodeXml(value.trim()));

    if (
      parsed.protocol !== "http:" &&
      parsed.protocol !== "https:"
    ) {
      return undefined;
    }

    return parsed.toString();
  } catch {
    return undefined;
  }
}

function normalizeDate(
  value: string | undefined,
): string | undefined {
  if (!value) return undefined;

  const time = Date.parse(stripHtml(value));

  if (!Number.isFinite(time)) {
    return undefined;
  }

  return new Date(time).toISOString();
}

function extractBlocks(xml: string): string[] {
  const rssItems = [
    ...xml.matchAll(/<item\b[\s\S]*?<\/item>/gi),
  ].map((match) => match[0]);

  if (rssItems.length > 0) {
    return rssItems;
  }

  return [
    ...xml.matchAll(/<entry\b[\s\S]*?<\/entry>/gi),
  ].map((match) => match[0]);
}

function extractLink(block: string): string | undefined {
  const linkText = firstTag(block, ["link"]);

  const direct = safeHttpUrl(linkText);

  if (direct) {
    return direct;
  }

  const href = firstAttribute(
    block,
    ["link"],
    "href",
  );

  return safeHttpUrl(href);
}

function extractImageUrl(
  block: string,
): string | undefined {
  const mediaUrl = firstAttribute(
    block,
    [
      "media:content",
      "media:thumbnail",
      "enclosure",
    ],
    "url",
  );

  return safeHttpUrl(mediaUrl);
}

function parseCandidate(
  block: string,
  source: NewsSourceDefinition,
): IngestedNewsCandidate | null {
  const title = stripHtml(
    firstTag(block, ["title"]) ?? "",
  );

  const articleUrl = extractLink(block);

  if (!title || !articleUrl) {
    return null;
  }

  const summaryRaw =
    firstTag(block, [
      "description",
      "summary",
      "content:encoded",
      "content",
    ]) ?? "";

  const summary = stripHtml(summaryRaw);

  const publishedAt =
    normalizeDate(
      firstTag(block, [
        "pubDate",
        "published",
        "dc:date",
        "date",
      ]),
    ) ?? new Date().toISOString();

  const updatedAt = normalizeDate(
    firstTag(block, ["updated", "lastBuildDate"]),
  );

  const author = stripHtml(
    firstTag(block, [
      "author",
      "dc:creator",
      "creator",
    ]) ?? "",
  );

  const imageUrl = extractImageUrl(block);

  return {
    sourceId: source.id,

    title,
    summary,

    articleUrl,
    canonicalUrl: articleUrl,

    publishedAt,
    updatedAt,

    author: author || undefined,

    imageUrl,

    category: source.defaultCategory,

    language: source.language,
  };
}

export async function fetchRssSource(
  source: NewsSourceDefinition,
  signal?: AbortSignal,
): Promise<IngestedNewsCandidate[]> {
  const response = await fetch(source.feedUrl, {
    headers: {
      Accept:
        "application/rss+xml, application/atom+xml, application/xml, text/xml;q=0.9, */*;q=0.1",
      "User-Agent":
        "Diya-Astrophysics-News-Hub/1.0",
    },
    signal,
  });

  if (!response.ok) {
    throw new Error(
      `Feed request failed: ${response.status}`,
    );
  }

  const contentType =
    response.headers.get("content-type") ?? "";

  if (
    !contentType.includes("xml") &&
    !contentType.includes("rss") &&
    !contentType.includes("atom") &&
    !contentType.includes("text")
  ) {
    throw new Error(
      `Unexpected feed content type: ${contentType || "unknown"}`,
    );
  }

  const xml = await response.text();

  if (!xml.trim()) {
    throw new Error("Feed response was empty.");
  }

  const blocks = extractBlocks(xml);

  if (blocks.length === 0) {
    throw new Error(
      "Feed contained no RSS items or Atom entries.",
    );
  }

  const candidates = blocks
    .map((block) => parseCandidate(block, source))
    .filter(
      (
        candidate,
      ): candidate is IngestedNewsCandidate =>
        candidate !== null,
    );

  if (candidates.length === 0) {
    throw new Error(
      "Feed items could not be normalized into news candidates.",
    );
  }

  return candidates;
}
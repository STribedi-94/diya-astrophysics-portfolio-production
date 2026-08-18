import type { ClassifiedNewsCandidate } from "./classifier";

const ARTICLE_TIMEOUT_MS = 7_000;
const MAX_HTML_BYTES = 384 * 1024;

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
    .replace(/&amp;/gi, "&")
    .replace(/&quot;/gi, "\"")
    .replace(/&#39;/gi, "'")
    .replace(/&apos;/gi, "'")
    .replace(/&lt;/gi, "<")
    .replace(/&gt;/gi, ">");
}

function cleanText(
  value: string | undefined,
): string | undefined {
  if (!value) return undefined;

  const cleaned = decodeHtmlEntities(value)
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim();

  return cleaned || undefined;
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
      `\\b${escaped}\\s*=\\s*(?:"([^"]*)"|'([^']*)'|([^\\s"'=<>` + "`" + `]+))`,
      "i",
    ),
  );

  return (
    match?.[1] ??
    match?.[2] ??
    match?.[3]
  );
}

function extractMetaContent(
  html: string,
  keys: string[],
): string | undefined {
  const wanted = new Set(
    keys.map((key) => key.toLowerCase()),
  );

  const metaTags = html.match(
    /<meta\b[^>]*>/gi,
  );

  if (!metaTags) {
    return undefined;
  }

  for (const tag of metaTags) {
    const property =
      extractAttribute(tag, "property") ??
      extractAttribute(tag, "name") ??
      extractAttribute(tag, "itemprop");

    if (
      !property ||
      !wanted.has(property.toLowerCase())
    ) {
      continue;
    }

    const content =
      extractAttribute(tag, "content");

    if (content?.trim()) {
      return content.trim();
    }
  }

  return undefined;
}

function extractImageSrcLink(
  html: string,
): string | undefined {
  const linkTags =
    html.match(/<link\b[^>]*>/gi);

  if (!linkTags) {
    return undefined;
  }

  for (const tag of linkTags) {
    const rel =
      extractAttribute(tag, "rel")
        ?.toLowerCase();

    if (rel !== "image_src") {
      continue;
    }

    const href =
      extractAttribute(tag, "href");

    if (href?.trim()) {
      return href.trim();
    }
  }

  return undefined;
}

function isAriesArticleUrl(
  articleUrl: string,
): boolean {
  try {
    const hostname =
      new URL(articleUrl)
        .hostname
        .toLowerCase();

    return (
      hostname === "aries.res.in" ||
      hostname === "www.aries.res.in"
    );
  } catch {
    return false;
  }
}

function extractAriesAnnouncementArticle(
  html: string,
): string | undefined {
  const start =
    html.search(
      /<article\b[^>]*class=["'][^"']*\bnode--type-announcement\b[^"']*["'][^>]*>/i,
    );

  if (start < 0) {
    return undefined;
  }

  const end =
    html.indexOf(
      "</article>",
      start,
    );

  if (end < 0) {
    return undefined;
  }

  return html.slice(
    start,
    end + "</article>".length,
  );
}

type AriesBodyMetadata = {
  imageUrl?: string;
  imageAlt?: string;
  summary?: string;
};

function extractAriesBodyMetadata(
  html: string,
  baseUrl: string,
): AriesBodyMetadata {
  const article =
    extractAriesAnnouncementArticle(
      html,
    );

  if (!article) {
    return {};
  }

  let summary:
    string | undefined;

  const paragraphs = [
    ...article.matchAll(
      /<p\b[^>]*>([\s\S]*?)<\/p>/gi,
    ),
  ];

  for (const paragraph of paragraphs) {
    const text =
      cleanText(
        paragraph[1],
      );

    /*
     * Ignore empty/caption-like fragments. The first substantial
     * paragraph in ARIES Science Nugget nodes is the article lead,
     * which is the best deterministic summary available.
     */
    if (
      text &&
      text.length >= 60
    ) {
      summary = text;
      break;
    }
  }

  let imageUrl:
    string | undefined;

  let imageAlt:
    string | undefined;

  const imageTags =
    article.match(
      /<img\b[^>]*>/gi,
    ) ?? [];

  for (const tag of imageTags) {
    const src =
      extractAttribute(
        tag,
        "src",
      );

    const resolved =
      safeAbsoluteHttpUrl(
        src,
        baseUrl,
      );

    if (!resolved) {
      continue;
    }

    imageUrl = resolved;

    imageAlt =
      cleanText(
        extractAttribute(
          tag,
          "alt",
        ),
      );

    break;
  }

  return {
    imageUrl,
    imageAlt,
    summary,
  };
}

async function readLimitedHtml(
  response: Response,
): Promise<string> {
  if (!response.body) {
    return "";
  }

  const reader =
    response.body.getReader();

  const decoder =
    new TextDecoder();

  let totalBytes = 0;
  let html = "";

  try {
    while (true) {
      const result =
        await reader.read();

      if (result.done) {
        break;
      }

      totalBytes +=
        result.value.byteLength;

      if (
        totalBytes >
        MAX_HTML_BYTES
      ) {
        const remaining =
          result.value.subarray(
            0,
            Math.max(
              0,
              MAX_HTML_BYTES -
                (
                  totalBytes -
                  result.value.byteLength
                ),
            ),
          );

        html += decoder.decode(
          remaining,
          { stream: true },
        );

        await reader.cancel();
        break;
      }

      html += decoder.decode(
        result.value,
        { stream: true },
      );
    }

    html += decoder.decode();

    return html;
  } finally {
    reader.releaseLock();
  }
}

type ArticleMetadata = {
  imageUrl?: string;
  imageAlt?: string;
  summary?: string;
};

async function fetchArticleMetadata(
  articleUrl: string,
): Promise<ArticleMetadata> {
  const controller =
    new AbortController();

  const timeout =
    setTimeout(
      () => controller.abort(),
      ARTICLE_TIMEOUT_MS,
    );

  try {
    const response =
      await fetch(articleUrl, {
        redirect: "follow",

        headers: {
          Accept:
            "text/html,application/xhtml+xml;q=0.9,*/*;q=0.1",

          "User-Agent":
            "Diya-Astrophysics-News-Hub/1.0",
        },

        signal:
          controller.signal,
      });

    if (!response.ok) {
      return {};
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
      return {};
    }

    const html =
      await readLimitedHtml(
        response,
      );

    if (!html) {
      return {};
    }

    const resolvedBaseUrl =
      response.url ||
      articleUrl;

    /*
     * ARIES Science Nugget nodes do not currently expose reliable
     * og:image / description metadata. Their canonical scientific
     * content is rendered inside the Drupal announcement article,
     * so read the first substantive paragraph and first article
     * figure directly from that isolated article node.
     */
    if (
      isAriesArticleUrl(
        resolvedBaseUrl,
      )
    ) {
      const ariesMetadata =
        extractAriesBodyMetadata(
          html,
          resolvedBaseUrl,
        );

      if (
        ariesMetadata.imageUrl ||
        ariesMetadata.summary
      ) {
        return ariesMetadata;
      }
    }

    const rawImageUrl =
      extractMetaContent(
        html,
        [
          "og:image",
          "og:image:url",
          "og:image:secure_url",
          "twitter:image",
          "twitter:image:src",
        ],
      ) ??
      extractImageSrcLink(
        html,
      );

    const imageUrl =
      safeAbsoluteHttpUrl(
        rawImageUrl,
        resolvedBaseUrl,
      );

    const imageAlt =
      cleanText(
        extractMetaContent(
          html,
          [
            "og:image:alt",
            "twitter:image:alt",
          ],
        ),
      );

    const summary =
      cleanText(
        extractMetaContent(
          html,
          [
            "og:description",
            "twitter:description",
            "description",
          ],
        ),
      );

    return {
      imageUrl,
      imageAlt,
      summary,
    };
  } catch (error) {
    if (
      error instanceof Error &&
      error.name !== "AbortError"
    ) {
      console.warn(
        `[news] article metadata enrichment failed for ${articleUrl}`,
        error,
      );
    }

    return {};
  } finally {
    clearTimeout(timeout);
  }
}

export async function enrichCandidateImage(
  candidate: ClassifiedNewsCandidate,
): Promise<ClassifiedNewsCandidate> {
  const needsImage =
    !candidate.imageUrl;

  const needsSummary =
    !candidate.summary.trim();

  if (
    !needsImage &&
    !needsSummary
  ) {
    return candidate;
  }

  const metadata =
    await fetchArticleMetadata(
      candidate.articleUrl,
    );

  if (
    !metadata.imageUrl &&
    !metadata.summary
  ) {
    return candidate;
  }

  return {
    ...candidate,

    imageUrl:
      candidate.imageUrl ??
      metadata.imageUrl,

    imageAlt:
      candidate.imageAlt ??
      metadata.imageAlt ??
      (
        metadata.imageUrl
          ? candidate.title
          : undefined
      ),

    summary:
      candidate.summary.trim()
        ? candidate.summary
        : (
            metadata.summary ??
            candidate.summary
          ),
  };
}

export async function enrichCandidateImages(
  candidates: ClassifiedNewsCandidate[],
): Promise<ClassifiedNewsCandidate[]> {
  const results:
    ClassifiedNewsCandidate[] = [];

  /*
   * Use a small fixed concurrency.
   *
   * Article-page metadata enrichment is only needed when
   * the source adapter did not provide a usable image or
   * summary. Limiting concurrency keeps scheduled Worker
   * fetches predictable and avoids hammering publishers.
   */
  const concurrency = 3;

  for (
    let index = 0;
    index < candidates.length;
    index += concurrency
  ) {
    const batch =
      candidates.slice(
        index,
        index + concurrency,
      );

    const enriched =
      await Promise.all(
        batch.map(
          (candidate) =>
            enrichCandidateImage(
              candidate,
            ),
        ),
      );

    results.push(
      ...enriched,
    );
  }

  return results;
}

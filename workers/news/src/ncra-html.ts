import type { IngestedNewsCandidate } from "./rss";
import type { NewsSourceDefinition } from "./sources";

const MAX_LISTING_CANDIDATES = 10;

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
    .replace(/&gt;/gi, ">")
    .replace(/&ndash;/gi, "–")
    .replace(/&mdash;/gi, "—")
    .replace(/&minus;/gi, "−")
    .replace(/&rsquo;/gi, "’")
    .replace(/&lsquo;/gi, "‘")
    .replace(/&ldquo;/gi, "“")
    .replace(/&rdquo;/gi, "”")
    .replace(/&deg;/gi, "°")
    .replace(/&plusmn;/gi, "±")
    .replace(/&times;/gi, "×");
}

function repairNcraPublisherMojibake(value: string): string {
  if (!value) {
    return value;
  }

  const replacements: Array<[string, string]> = [
    [
      String.fromCharCode(0x00e2, 0x20ac, 0x2122),
      String.fromCharCode(0x2019),
    ],
    [
      String.fromCharCode(0x00e2, 0x20ac, 0x201c),
      String.fromCharCode(0x2013),
    ],
    [
      String.fromCharCode(0x00e2, 0x20ac, 0x201d),
      String.fromCharCode(0x2014),
    ],
    [
      String.fromCharCode(0x00e2, 0x02c6, 0x2019),
      String.fromCharCode(0x2212),
    ],
    [
      String.fromCharCode(0x00c2, 0x00b1),
      String.fromCharCode(0x00b1),
    ],
    [
      String.fromCharCode(0x00e2, 0x0160, 0x2122),
      String.fromCharCode(0x2609),
    ],
    [
      String.fromCharCode(0x00e2, 0x02c6, 0x00bc),
      String.fromCharCode(0x223c),
    ],
    [
      "&Icirc;&raquo;",
      String.fromCharCode(0x03bb),
    ],
    [
      "&Icirc;" + String.fromCharCode(0x00b1),
      String.fromCharCode(0x03b1),
    ],
    [
      String.fromCharCode(0x2500),
      String.fromCharCode(0x2013),
    ],
  ];

  let repaired = value;

  for (const [broken, correct] of replacements) {
    repaired = repaired.split(broken).join(correct);
  }

  return repaired;
}
function stripHtml(value: string): string {
  return repairNcraPublisherMojibake(
    decodeHtmlEntities(
      value
        .replace(/<script[\s\S]*?<\/script>/gi, " ")
        .replace(/<style[\s\S]*?<\/style>/gi, " ")
        .replace(/<[^>]+>/g, " ")
        .replace(/\s+/g, " ")
        .trim(),
    ),
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
  if (!value) {
    return undefined;
  }

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

type HighlightBlock = {
  id: string;
  html: string;
};

function extractHighlightBlocks(
  html: string,
): HighlightBlock[] {
  const starts = [
    ...html.matchAll(
      /<div\b[^>]*id=["']sh-(\d+)["'][^>]*>/gi,
    ),
  ];

  const blocks: HighlightBlock[] = [];

  for (
    let index = 0;
    index < starts.length;
    index += 1
  ) {
    const match = starts[index];

    if (
      match.index === undefined ||
      !match[1]
    ) {
      continue;
    }

    const start = match.index;

    let end =
      index + 1 < starts.length &&
      starts[index + 1]?.index !== undefined
        ? starts[index + 1]!.index!
        : html.length;

    /*
     * Keep the final result block bounded before the footer when
     * possible so unrelated page markup cannot become candidate data.
     */
    if (index === starts.length - 1) {
      const footer =
        html.indexOf(
          "<footer",
          start,
        );

      if (
        footer > start &&
        footer < end
      ) {
        end = footer;
      }
    }

    blocks.push({
      id: match[1],
      html: html.slice(
        start,
        end,
      ),
    });
  }

  return blocks.slice(
    0,
    MAX_LISTING_CANDIDATES,
  );
}

function extractNcraCandidates(
  html: string,
  source: NewsSourceDefinition,
): IngestedNewsCandidate[] {
  const candidates:
    IngestedNewsCandidate[] = [];

  const blocks =
    extractHighlightBlocks(html);

  /*
   * NCRA exposes its current Science Highlights at:
   *
   *   /research/recent-results
   *
   * Each current result contains:
   *
   *   - stable id="sh-..."
   *   - h5 class="gs_heading" title
   *   - textWrapper... scientific summary
   *   - publication/reference metadata
   *   - result image
   *
   * NCRA does not currently expose a trustworthy per-highlight
   * posting timestamp in this listing HTML.
   *
   * Use first-seen time for initial ingestion. The repository's
   * canonical-URL upsert intentionally preserves the original
   * published_at value on later refreshes, so established records
   * do not become artificially "new" every hour.
   */
  const firstSeenAt =
    new Date().toISOString();

  for (const block of blocks) {
    const titleMatch =
      block.html.match(
        /<h5\b[^>]*class=["'][^"']*\bgs_heading\b[^"']*["'][^>]*>([\s\S]*?)<\/h5>/i,
      );

    const title =
      stripHtml(
        titleMatch?.[1] ?? "",
      );

    if (!title) {
      continue;
    }

    const summaryMatch =
      block.html.match(
        /<div\b[^>]*id=["']textWrapper\d+["'][^>]*class=["'][^"']*\bfade-text\b[^"']*["'][^>]*>([\s\S]*?)<\/div>/i,
      ) ??
      block.html.match(
        /<div\b[^>]*class=["'][^"']*\bfade-text\b[^"']*["'][^>]*id=["']textWrapper\d+["'][^>]*>([\s\S]*?)<\/div>/i,
      );

    const summary =
      stripHtml(
        summaryMatch?.[1] ?? "",
      );

    if (!summary) {
      continue;
    }

    const imageTags =
      block.html.match(
        /<img\b[^>]*>/gi,
      ) ?? [];

    let imageUrl:
      string | undefined;

    let imageAlt:
      string | undefined;

    for (const imageTag of imageTags) {
      const candidateUrl =
        safeAbsoluteHttpUrl(
          extractAttribute(
            imageTag,
            "src",
          ),
          source.websiteUrl,
        );

      if (!candidateUrl) {
        continue;
      }

      let parsed: URL;

      try {
        parsed =
          new URL(candidateUrl);
      } catch {
        continue;
      }

      if (
        parsed.hostname !==
          "www.ncra.tifr.res.in" ||
        !parsed.pathname.startsWith(
          "/storage/results/",
        )
      ) {
        continue;
      }

      imageUrl =
        parsed.toString();

      imageAlt =
        stripHtml(
          extractAttribute(
            imageTag,
            "alt",
          ) ?? "",
        ) || undefined;

      break;
    }

    const articleUrl =
      `${source.feedUrl}#sh-${block.id}`;

    candidates.push({
      sourceId:
        source.id,

      title,
      summary,

      articleUrl,
      canonicalUrl:
        articleUrl,

      publishedAt:
        firstSeenAt,

      imageUrl,
      imageAlt,

      category:
        source.defaultCategory,

      language:
        source.language,
    });
  }

  return candidates;
}

export async function fetchNcraHtmlSource(
  source: NewsSourceDefinition,
  signal?: AbortSignal,
): Promise<IngestedNewsCandidate[]> {
  const response =
    await fetch(
      source.feedUrl,
      {
        redirect:
          "follow",

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
      `NCRA Science Highlights request failed: ${response.status}`,
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
      `Unexpected NCRA content type: ${contentType || "unknown"}`,
    );
  }

  const html =
    await response.text();

  if (!html.trim()) {
    throw new Error(
      "NCRA Science Highlights response was empty.",
    );
  }

  const candidates =
    extractNcraCandidates(
      html,
      source,
    );

  if (candidates.length === 0) {
    throw new Error(
      "NCRA Science Highlights contained no parseable results.",
    );
  }

  return candidates;
}

import { fetchAriesHtmlSource } from "./aries-html";
import {
  fetchRssSource,
  type IngestedNewsCandidate,
} from "./rss";
import type { NewsSourceDefinition } from "./sources";

export async function fetchSourceCandidates(
  source: NewsSourceDefinition,
  signal?: AbortSignal,
): Promise<IngestedNewsCandidate[]> {
  switch (source.adapterType) {
    case "rss":
      return fetchRssSource(
        source,
        signal,
      );

    case "aries-html":
      return fetchAriesHtmlSource(
        source,
        signal,
      );

    default: {
      const exhaustiveCheck:
        never = source.adapterType;

      throw new Error(
        `Unsupported news adapter: ${String(exhaustiveCheck)}`,
      );
    }
  }
}

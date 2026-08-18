import { fetchAriesHtmlSource } from "./aries-html";
import { fetchIiaHtmlSource } from "./iia-html";
import { fetchIsroHtmlSource } from "./isro-html";
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

    case "iia-html":
      return fetchIiaHtmlSource(
        source,
        signal,
      );

    case "isro-html":
      return fetchIsroHtmlSource(
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

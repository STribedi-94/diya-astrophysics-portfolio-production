
export type NewsSourceDefinition = {
  id: string;
  name: string;
  shortName: string;
  sourceType: string;

  websiteUrl: string;
  feedUrl: string;

  country?: string;
  language: string;

  adapterType: "rss";

  defaultCategory: string;

  isActive: boolean;
};

export const NEWS_SOURCES: readonly NewsSourceDefinition[] = [
  {
    id: "nasa",
    name: "NASA",
    shortName: "NASA",
    sourceType: "Space Agency",

    websiteUrl: "https://www.nasa.gov/",
    feedUrl: "https://www.nasa.gov/news-release/feed/",

    country: "United States",
    language: "en",

    adapterType: "rss",

    defaultCategory: "Space Science",

    isActive: true,
  },

  {
    id: "esa",
    name: "European Space Agency",
    shortName: "ESA",
    sourceType: "Space Agency",

    websiteUrl: "https://www.esa.int/",
    feedUrl: "https://www.esa.int/rssfeed/Our_Activities/Space_Science",

    country: "Europe",
    language: "en",

    adapterType: "rss",

    defaultCategory: "Space Science",

    isActive: true,
  },

  {
    id: "eso",
    name: "European Southern Observatory",
    shortName: "ESO",
    sourceType: "Observatory",

    websiteUrl: "https://www.eso.org/",
    feedUrl: "https://www.eso.org/public/news/feed/",

    country: "Chile",
    language: "en",

    adapterType: "rss",

    defaultCategory: "Astronomy",

    isActive: true,
  },
] as const;
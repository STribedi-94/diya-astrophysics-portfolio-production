export type NewsSourceAdapterType =
  | "rss"
  | "aries-html"
  | "iia-html"
  | "isro-html";

export type NewsSourceDefinition = {
  id: string;
  name: string;
  shortName: string;
  sourceType: string;

  websiteUrl: string;
  feedUrl: string;

  country?: string;
  language: string;

  adapterType: NewsSourceAdapterType;

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

  {
    id: "aries",
    name: "Aryabhatta Research Institute of Observational Sciences",
    shortName: "ARIES",
    sourceType: "Research Institute",

    websiteUrl: "https://www.aries.res.in/",
    feedUrl: "https://www.aries.res.in/announcement_scientific",

    country: "India",
    language: "en",

    adapterType: "aries-html",

    defaultCategory: "Astronomy",

    isActive: true,
  },

  {
    id: "iia",
    name: "Indian Institute of Astrophysics",
    shortName: "IIA",
    sourceType: "Research Institute",

    websiteUrl: "https://www.iiap.res.in/",
    feedUrl: "https://www.iiap.res.in/articles/research-highlights/",

    country: "India",
    language: "en",

    adapterType: "iia-html",

    defaultCategory: "Astronomy",

    isActive: true,
  },

  {
    id: "isro",
    name: "Indian Space Research Organisation",
    shortName: "ISRO",
    sourceType: "Space Agency",

    websiteUrl: "https://www.isro.gov.in/",
    feedUrl: "https://www.isro.gov.in/ISRO_EN/index.html",

    country: "India",
    language: "en",

    adapterType: "isro-html",

    defaultCategory: "Space Science",

    isActive: true,
  },
] as const;

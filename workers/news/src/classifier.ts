import type { IngestedNewsCandidate } from "./rss";
import type { NewsSourceDefinition } from "./sources";

export type ClassifiedNewsCandidate = IngestedNewsCandidate & {
  category: string;
  topics: string[];
  tags: string[];

  mission?: string;
  observatory?: string;
  telescope?: string;

  newsType: string;

  isFeatured: boolean;
  isResearchOrbit: boolean;
  researchOrbitScore: number;

  accepted: boolean;
  rejectionReason?: string;
};

type KeywordRule = {
  topic: string;
  patterns: RegExp[];
  weight: number;
};

const TOPIC_RULES: KeywordRule[] = [
  {
    topic: "m-dwarfs",
    patterns: [
      /\bm[\s-]?dwarfs?\b/i,
      /\bred dwarfs?\b/i,
    ],
    weight: 5,
  },

  {
    topic: "stellar-activity",
    patterns: [
      /\bstellar activity\b/i,
      /\bstellar magnetic activity\b/i,
      /\bmagnetic activity (?:in|of|on) stars?\b/i,
      /\bstarspots?\b/i,
      /\bstellar magnetic fields?\b/i,
    ],
    weight: 4,
  },

  {
    topic: "stellar-flares",
    patterns: [
      /\bstellar flares?\b/i,
      /\bstar flares?\b/i,
      /\bflare activity (?:of|on|in) stars?\b/i,
    ],
    weight: 4,
  },

  {
    topic: "radio-astronomy",
    patterns: [
      /\bradio astronomy\b/i,
      /\bradio emission(?:s)?\b/i,
      /\bradio observations?\b/i,
      /\bradio telescope(?:s)?\b/i,
      /\blow[- ]frequency radio\b/i,
      /\bugmrt\b/i,
      /\bupgraded gmrt\b/i,
      /\bgmrt\b/i,
      /\blofar\b/i,
      /\balma\b/i,
    ],
    weight: 4,
  },

  {
    topic: "exoplanets",
    patterns: [
      /\bexoplanets?\b/i,
      /\bextrasolar planets?\b/i,
      /\bplanet(?:s)? outside (?:our|the) solar system\b/i,
      /\bplanet(?:s)? orbiting (?:a|the) star\b/i,
      /\bplanetary system(?:s)? around (?:a|the) star\b/i,
      /\bplanet hunters?\b/i,
    ],
    weight: 3,
  },

  {
    topic: "exoplanet-atmospheres",
    patterns: [
      /\bexoplanet atmospheres?\b/i,
      /\batmospheres? of exoplanets?\b/i,
      /\batmospheric escape (?:from|on) exoplanets?\b/i,
      /\bexoplanet habitability\b/i,
      /\bspace weather (?:on|around|affecting) exoplanets?\b/i,
      /\bplanetary atmospheres? around other stars\b/i,
    ],
    weight: 4,
  },

  {
    topic: "stellar-astrophysics",
    patterns: [
      /\bstellar astrophysics\b/i,
      /\bstellar evolution\b/i,
      /\bstar formation\b/i,
      /\bstar-forming\b/i,
      /\bbinary stars?\b/i,
      /\bwhite dwarfs?\b/i,
      /\bbrown dwarfs?\b/i,
      /\bprotostars?\b/i,
      /\bmassive stars?\b/i,
      /\bdying star\b/i,
      /\bsupernovae?\b/i,
    ],
    weight: 2,
  },

  {
    topic: "galaxies",
    patterns: [
      /\bgalax(?:y|ies)\b/i,
      /\bmilky way\b/i,
      /\bgalactic\b/i,
      /\bmagellanic cloud\b/i,
    ],
    weight: 2,
  },

  {
    topic: "cosmology",
    patterns: [
      /\bcosmology\b/i,
      /\bdark matter\b/i,
      /\bdark energy\b/i,
      /\bearly universe\b/i,
      /\bbig bang\b/i,
    ],
    weight: 2,
  },

  {
    topic: "solar-physics",
    patterns: [
      /\bsolar physics\b/i,
      /\bsolar eclipse\b/i,
      /\bsolar corona\b/i,
      /\bsolar wind\b/i,
      /\bsolar magnetic\b/i,
      /\bsolar atmosphere\b/i,
      /\bsolar activity\b/i,
      /\bspace weather\b/i,
    ],
    weight: 2,
  },

  {
    topic: "black-holes",
    patterns: [
      /\bblack holes?\b/i,
      /\bevent horizon\b/i,
      /\bsagittarius a\*?\b/i,
    ],
    weight: 2,
  },

  {
    topic: "gravitational-waves",
    patterns: [
      /\bgravitational waves?\b/i,
      /\bligo\b/i,
      /\bvirgo detector\b/i,
    ],
    weight: 2,
  },

  {
    topic: "time-domain-astronomy",
    patterns: [
      /\btime[- ]domain astronomy\b/i,
      /\bastronomical transients?\b/i,
      /\bvariable stars?\b/i,
      /\blsst\b/i,
      /\brubin observatory\b/i,
    ],
    weight: 3,
  },

  {
    topic: "observatory-science",
    patterns: [
      /\bastronomical observations?\b/i,
      /\bnight sky\b/i,
      /\bobserving time\b/i,
      /\bastronomical observatory\b/i,
      /\bastronomical telescopes?\b/i,
    ],
    weight: 1,
  },
];

const NON_ASTRO_NASA_PATTERNS = [
  /\bair pollution\b/i,
  /\baviation\b/i,
  /\baeronautics\b/i,
  /\bearth science\b/i,
  /\bclimate\b/i,
  /\bwildfire\b/i,
  /\bhurricane\b/i,
  /\bcontract award\b/i,
  /\bprocurement\b/i,
  /\bpayload processing services\b/i,
];

const RESEARCH_ORBIT_TOPICS = new Set([
  "m-dwarfs",
  "stellar-activity",
  "stellar-flares",
  "radio-astronomy",
  "exoplanet-atmospheres",
  "time-domain-astronomy",
]);

function matchesAny(
  text: string,
  patterns: RegExp[],
): boolean {
  return patterns.some((pattern) => pattern.test(text));
}

function detectMission(text: string): string | undefined {
  const missions: Array<[string, RegExp]> = [
    ["TESS", /\btess\b/i],
    ["Gaia", /\bgaia\b/i],
    ["Hubble", /\bhubble\b/i],
    ["JWST", /\bjwst\b|\bjames webb\b/i],
    ["CHEOPS", /\bcheops\b/i],
    ["PLATO", /\bplato\b/i],
    ["Kepler", /\bkepler\b/i],
  ];

  return missions.find(([, pattern]) =>
    pattern.test(text),
  )?.[0];
}

function detectObservatory(
  text: string,
): string | undefined {
  const observatories: Array<[string, RegExp]> = [
    [
      "ESO",
      /\beuropean southern observatory\b|\beso\b/i,
    ],
    ["uGMRT", /\bugmrt\b|\bupgraded gmrt\b/i],
    ["GMRT", /\bgmrt\b/i],
    ["LOFAR", /\blofar\b/i],
    ["ALMA", /\batacama large millimeter\/submillimeter array\b|\balma\b/i],
    [
      "Rubin Observatory",
      /\brubin observatory\b|\blsst\b/i,
    ],
  ];

  return observatories.find(([, pattern]) =>
    pattern.test(text),
  )?.[0];
}

function detectTelescope(
  text: string,
): string | undefined {
  const telescopes: Array<[string, RegExp]> = [
    ["VLT", /\bvery large telescope\b|\bvlt\b/i],
    ["ELT", /\bextremely large telescope\b|\belt\b/i],
    [
      "Hubble",
      /\bhubble space telescope\b|\bhubble\b/i,
    ],
    ["JWST", /\bjwst\b|\bjames webb\b/i],
    ["TESS", /\btess\b/i],
    ["uGMRT", /\bugmrt\b|\bupgraded gmrt\b/i],
    ["GMRT", /\bgmrt\b/i],
    ["LOFAR", /\blofar\b/i],
    [
      "ALMA",
      /\batacama large millimeter\/submillimeter array\b|\balma\b/i,
    ],
  ];

  return telescopes.find(([, pattern]) =>
    pattern.test(text),
  )?.[0];
}

function classifyCategory(
  topics: string[],
  fallback: string,
): string {
  if (topics.includes("radio-astronomy")) {
    return "Radio Astronomy";
  }

  if (
    topics.includes("exoplanets") ||
    topics.includes("exoplanet-atmospheres")
  ) {
    return "Exoplanets";
  }

  if (topics.includes("solar-physics")) {
    return "Solar Physics";
  }

  if (
    topics.includes("galaxies") ||
    topics.includes("cosmology") ||
    topics.includes("black-holes")
  ) {
    return "Astrophysics";
  }

  if (
    topics.includes("stellar-astrophysics") ||
    topics.includes("stellar-activity") ||
    topics.includes("stellar-flares") ||
    topics.includes("m-dwarfs")
  ) {
    return "Stellar Astrophysics";
  }

  return fallback;
}

function sourceAcceptanceThreshold(
  source: NewsSourceDefinition,
): number {
  if (source.id === "nasa") {
    return 2;
  }

  if (source.id === "esa") {
    return 1;
  }

  if (source.id === "eso") {
    return 1;
  }

  return 2;
}

export function classifyCandidate(
  candidate: IngestedNewsCandidate,
  source: NewsSourceDefinition,
): ClassifiedNewsCandidate {
  const text = [
    candidate.title,
    candidate.summary,
  ]
    .filter(Boolean)
    .join(" ");

  const topics: string[] = [];
  let relevanceScore = 0;

  for (const rule of TOPIC_RULES) {
    if (matchesAny(text, rule.patterns)) {
      topics.push(rule.topic);
      relevanceScore += rule.weight;
    }
  }

  if (
    source.id === "nasa" &&
    matchesAny(text, NON_ASTRO_NASA_PATTERNS)
  ) {
    relevanceScore -= 4;
  }

  /*
   * ESO is itself a professional astronomical observatory.
   * Legitimate observatory-impact/science-policy stories should not
   * disappear merely because they do not describe an astrophysical
   * object directly.
   */
  if (
    source.id === "eso" &&
    (
      /\bastronom(?:y|ical|ers?)\b/i.test(text) ||
      /\bobservator(?:y|ies)\b/i.test(text) ||
      /\btelescopes?\b/i.test(text)
    )
  ) {
    relevanceScore = Math.max(relevanceScore, 1);
  }

  const threshold =
    sourceAcceptanceThreshold(source);

  const accepted =
    relevanceScore >= threshold;

  const researchOrbitScore = Math.min(
    1,
    Math.max(
      0,
      relevanceScore / 10,
    ),
  );

  const isResearchOrbit = topics.some((topic) =>
    RESEARCH_ORBIT_TOPICS.has(topic),
  );

  const mission = detectMission(text);
  const observatory = detectObservatory(text);
  const telescope = detectTelescope(text);

  const tags = [
    mission,
    observatory,
    telescope,
  ].filter(
    (value): value is string =>
      Boolean(value),
  );

  return {
    ...candidate,

    category: classifyCategory(
      topics,
      candidate.category,
    ),

    topics: [...new Set(topics)],
    tags: [...new Set(tags)],

    mission,
    observatory,
    telescope,

    newsType:
      source.sourceType === "Observatory"
        ? "Observatory News"
        : "Research News",

    isFeatured:
      accepted &&
      relevanceScore >= 6,

    isResearchOrbit:
      accepted && isResearchOrbit,

    researchOrbitScore,

    accepted,

    rejectionReason: accepted
      ? undefined
      : "Below astrophysics relevance threshold.",
  };
}
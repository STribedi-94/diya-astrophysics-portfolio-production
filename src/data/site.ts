const configuredSiteUrl = import.meta.env.VITE_SITE_URL?.trim();

export const SITE_URL = configuredSiteUrl
  ? configuredSiteUrl.replace(/\/+$/, "")
  : "";

export function siteUrl(path = "/") {
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  return SITE_URL ? `${SITE_URL}${normalizedPath}` : normalizedPath;
}

export const site = {
  name: "Diya Ram",
  shortName: "Diya Ram",
  title: "Observational Astrophysicist",
  tagline:
    "Exploring the magnetic lives of low-mass stars across optical, spectroscopic and radio wavelengths.",
  summary:
    "Diya Ram investigates magnetic activity in M-dwarf stars by combining time-domain photometry, spectroscopy and radio observations to better understand stellar behaviour and planetary environments.",
  longBio:
    "Diya Ram is an observational astrophysicist working at the intersection of stellar physics and time-domain astronomy. Her research combines optical photometry, optical and near-infrared spectroscopy, and low-frequency radio observations with the upgraded Giant Metrewave Radio Telescope to study magnetic activity in M-dwarf stars — including stellar rotation, starspots, flares and their consequences for exoplanet habitability and star–planet interaction.",
  location: "India",
  email: "",
  links: {
    cv: "",
    orcid: "",
    ads: "",
    scholar: "",
    researchgate: "",
    linkedin: "",
    institution: "",
  },
  placeholder: {
    profile: "Professional profile link will be added after verification.",
    cv: "Curriculum vitae download will be activated after document upload.",
    publications:
      "Publication information will be populated from verified journal and NASA ADS records.",
    figure: "Research figures will be added from published papers and approved documents.",
  },
} as const;

export const nav = {
  primary: [
    { label: "Home", to: "/" },
    { label: "About", to: "/about" },
    {
      label: "Research",
      children: [
        { label: "Research Universe", to: "/research-universe" },
        { label: "Research Areas", to: "/research" },
        { label: "Research Projects", to: "/projects" },
        { label: "Telescope Facilities", to: "/facilities" },
      ],
    },
    { label: "Publications", to: "/publications" },
    { label: "Observations", to: "/observations" },
    { label: "Academic Journey", to: "/academic-journey" },
    {
      label: "More",
      children: [
        { label: "Teaching & Mentoring", to: "/teaching" },
        { label: "Conferences & Presentations", to: "/conferences" },
        { label: "Scientific Gallery", to: "/gallery" },
        { label: "Downloads", to: "/downloads" },
        { label: "Scientific Mission Log", to: "/mission-log" },
        { label: "Astrophysics News Hub", to: "/news" },
      ],
    },
    { label: "Contact", to: "/contact" },
  ],
} as const;
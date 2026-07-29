/**
 * Data model for the Observatory Network visualisation on the Observations page.
 * Facility identities, coordinates and links mirror src/data/facilities.ts —
 * this module only adds the geographic / orbital metadata the 3D scene needs.
 */

export type NetworkNode = {
  id: string;
  /** Facility profile slug (/facilities/$slug) */
  slug: string;
  shortName: string;
  fullName: string;
  kind: "ground" | "space";
  kindLabel: string;
  domain: string;
  location: string;
  /** Geographic position — ground facilities only. */
  lat?: number;
  lon?: number;
  coordsLabel?: string;
  description: string;
  /** Marker accent (hex, kept in step with the site's accent family). */
  color: string;
  a11yLabel: string;
};

export const groundNodes: NetworkNode[] = [
  {
    id: "ugmrt",
    slug: "ugmrt",
    shortName: "uGMRT",
    fullName: "upgraded Giant Metrewave Radio Telescope",
    kind: "ground",
    kindLabel: "Ground Observatory",
    domain: "Radio · metre wavelengths",
    location: "Khodad, Narayangaon, Maharashtra, India",
    lat: 19.0965,
    lon: 74.0497,
    coordsLabel: "19.10° N, 74.05° E",
    description:
      "Array of 30 × 45 m dishes used for sensitive low-frequency radio observations of magnetic emission from nearby cool stars.",
    color: "#4fd8c0",
    a11yLabel:
      "uGMRT, ground-based radio interferometer at Khodad, Maharashtra, India.",
  },
  {
    id: "hct",
    slug: "hct",
    shortName: "HCT",
    fullName: "Himalayan Chandra Telescope",
    kind: "ground",
    kindLabel: "Ground Observatory",
    domain: "Optical / Near-infrared",
    location: "Indian Astronomical Observatory, Hanle, Ladakh, India",
    lat: 32.7794,
    lon: 78.9642,
    coordsLabel: "32.78° N, 78.96° E",
    description:
      "2.0 m remotely operated telescope providing optical spectroscopy and photometric monitoring of active M-dwarfs.",
    color: "#7fa8ff",
    a11yLabel:
      "Himalayan Chandra Telescope, ground-based optical and infrared telescope at Hanle, Ladakh, India.",
  },
  {
    id: "dot",
    slug: "dot",
    shortName: "DOT",
    fullName: "Devasthal Optical Telescope",
    kind: "ground",
    kindLabel: "Ground Observatory",
    domain: "Optical / Near-infrared",
    location: "Devasthal Observatory, Uttarakhand, India",
    lat: 29.3612,
    lon: 79.6841,
    coordsLabel: "29.36° N, 79.68° E",
    description:
      "3.6 m telescope used for deep optical and near-infrared spectroscopy of faint, active low-mass stars.",
    color: "#ffb774",
    a11yLabel:
      "Devasthal Optical Telescope, ground-based optical telescope in Uttarakhand, India.",
  },
];

export const spaceNode: NetworkNode = {
  id: "tess",
  slug: "tess",
  shortName: "TESS",
  fullName: "Transiting Exoplanet Survey Satellite",
  kind: "space",
  kindLabel: "Space Observatory",
  domain: "Space photometry",
  location: "Highly elliptical high-Earth orbit",
  coordsLabel: "≈ 13.7-day period · 2:1 lunar resonance",
  description:
    "NASA space telescope delivering high-cadence photometry of bright nearby stars — the source of the flare, starspot and rotation light curves in this research.",
  color: "#c49bff",
  a11yLabel:
    "TESS, NASA space telescope in a highly elliptical high-Earth orbit with an approximately 13.7-day period in 2:1 resonance with the Moon.",
};

export const networkNodes: NetworkNode[] = [...groundNodes, spaceNode];

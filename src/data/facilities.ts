export type Facility = {
  id: string;
  slug: string;
  fullName: string;
  abbreviation: string;
  observatory: string;
  location: string;
  country: string;
  band: string;
  wavelength: string;
  aperture: string;
  purpose: string;
  role: string;
};

export const facilities: Facility[] = [
  {
    id: "ugmrt",
    slug: "ugmrt",
    fullName: "upgraded Giant Metrewave Radio Telescope",
    abbreviation: "uGMRT",
    observatory: "NCRA-TIFR",
    location: "Khodad, Pune",
    country: "India",
    band: "Radio (Band 3, Band 4)",
    wavelength: "Metre / decimetre",
    aperture: "30 × 45 m dishes",
    purpose:
      "Sensitive low-frequency radio observations of coherent and incoherent stellar magnetic activity.",
    role:
      "Primary radio facility for detecting and characterising M-dwarf radio emission in Diya Ram's programme.",
  },
  {
    id: "hct",
    slug: "hct",
    fullName: "Himalayan Chandra Telescope",
    abbreviation: "HCT",
    observatory: "Indian Astronomical Observatory",
    location: "Hanle, Ladakh",
    country: "India",
    band: "Optical / Near-Infrared",
    wavelength: "0.35 – 2.5 µm",
    aperture: "2.0 m",
    purpose: "Optical photometry and spectroscopy of variable and active stars.",
    role:
      "Ground-based optical characterisation of M-dwarf targets — light curves, spectra and follow-up.",
  },
  {
    id: "dot",
    slug: "dot",
    fullName: "Devasthal Optical Telescope",
    abbreviation: "DOT",
    observatory: "ARIES",
    location: "Devasthal, Uttarakhand",
    country: "India",
    band: "Optical / Near-Infrared",
    wavelength: "0.35 – 2.4 µm",
    aperture: "3.6 m",
    purpose: "High-sensitivity optical and near-infrared spectroscopy and imaging.",
    role:
      "Deep spectroscopic characterisation of activity diagnostics on faint M-dwarf targets.",
  },
];

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
  type: "ground" | "space";
  category: "radio" | "optical-nir" | "space-mission";
  purpose: string;
  role: string;
  capability: string;
  relatedAreas: string[]; // research area slugs
  relatedProjects: string[]; // project slugs
  relatedPublications: string[]; // publication slugs
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
    wavelength: "Metre / decimetre (250–850 MHz)",
    aperture: "Array of 30 × 45 m parabolic dishes",
    type: "ground",
    category: "radio",
    purpose:
      "Sensitive low-frequency radio observations used to search for and constrain magnetic emission from nearby cool stars.",
    role:
      "Primary radio facility used to search for and constrain low-frequency emission associated with magnetic activity in nearby M-dwarfs.",
    capability:
      "Interferometric imaging and dynamic spectra at metre wavelengths, capable of probing coherent emission mechanisms in cool stars.",
    relatedAreas: [
      "radio-astronomy-of-cool-stars",
      "m-dwarf-magnetic-activity",
      "exoplanet-habitability-and-star-planet-interaction",
    ],
    relatedProjects: ["gj1151-radio-monitoring", "gj398-radio-followup", "m-dwarf-radio-survey"],
    relatedPublications: ["gj1151-flares-ugmrt", "gj-398-flares-radio"],
  },
  {
    id: "hct",
    slug: "hct",
    fullName: "Himalayan Chandra Telescope",
    abbreviation: "HCT",
    observatory: "Indian Astronomical Observatory (IIA)",
    location: "Hanle, Ladakh",
    country: "India",
    band: "Optical / Near-Infrared",
    wavelength: "0.35 – 2.5 µm",
    aperture: "2.0 m",
    type: "ground",
    category: "optical-nir",
    purpose: "Optical photometry and spectroscopy of variable and active stars.",
    role:
      "Ground-based optical characterisation of M-dwarf targets — chromospheric spectra and photometric monitoring.",
    capability:
      "Medium-resolution optical spectroscopy (HFOSC) and broad-band imaging of stellar chromospheric activity.",
    relatedAreas: [
      "optical-and-near-infrared-spectroscopy",
      "stellar-flares",
      "m-dwarf-magnetic-activity",
    ],
    relatedProjects: ["adleo-spectroscopic-monitoring", "spectroscopic-monitoring"],
    relatedPublications: ["ad-leonis-flares-spectra", "understanding-magnetic-activity-mdwarfs-spectroscopy"],
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
    type: "ground",
    category: "optical-nir",
    purpose: "High-sensitivity optical and near-infrared spectroscopy and imaging.",
    role:
      "Deep spectroscopic characterisation of activity diagnostics on faint M-dwarf targets.",
    capability:
      "Large-aperture optical / NIR spectroscopy for line-profile analysis of active low-mass stars.",
    relatedAreas: [
      "optical-and-near-infrared-spectroscopy",
      "m-dwarf-magnetic-activity",
    ],
    relatedProjects: ["spectroscopic-monitoring"],
    relatedPublications: ["understanding-magnetic-activity-mdwarfs-spectroscopy"],
  },
  {
    id: "tess",
    slug: "tess",
    fullName: "Transiting Exoplanet Survey Satellite",
    abbreviation: "TESS",
    observatory: "NASA Explorer Mission",
    location: "Highly elliptical 13.7-day lunar-resonant Earth orbit",
    country: "USA / International",
    band: "Optical (600–1000 nm)",
    wavelength: "Broad-band red-optical (Ic-like)",
    aperture: "4 × 10.5 cm refractive cameras",
    type: "space",
    category: "space-mission",
    purpose:
      "All-sky high-cadence photometric survey of bright nearby stars for exoplanets and stellar variability.",
    role:
      "Space-based high-cadence photometry used to study flares, starspots, rotation and variability in active low-mass stars.",
    capability:
      "2-minute and 20-second cadence photometry, ideal for detecting flares, quasi-periodic pulsations and rotational modulation.",
    relatedAreas: [
      "stellar-flares",
      "stellar-rotation-and-starspots",
      "m-dwarf-magnetic-activity",
    ],
    relatedProjects: [
      "tess-flare-statistics",
      "wolf359-starspot-analysis",
      "young-brown-dwarf-superflares",
      "tic272272592-spot-modelling",
    ],
    relatedPublications: [
      "wolf-359-starspots-qpp",
      "tic-272272592-starspots",
      "starspot-flares-two-young-mstars",
      "tess-young-brown-dwarfs-taurus",
      "young-brown-dwarf-superflares-tess",
    ],
  },
];

export const facilityGroups = [
  {
    id: "radio",
    label: "Radio Observatories",
    description:
      "Metre-wavelength interferometric facilities used to search for coherent magnetic emission from M-dwarfs.",
  },
  {
    id: "optical-nir",
    label: "Optical & Near-Infrared Facilities",
    description:
      "Ground-based telescopes providing photometry and spectroscopy of stellar chromospheres and starspots.",
  },
  {
    id: "space-mission",
    label: "Space Missions & Archival Data",
    description:
      "Space-based photometric missions delivering uninterrupted high-cadence light curves of cool stars.",
  },
] as const;

// Cosmic Library of Discovery — verified publication & scientific-exchange archive.
// All bibliographic details cross-referenced against Diya Ram's CV
// (Research_Statement_4_CV-Diya-3.pdf) and the attached first-author manuscripts.
// No citation counts, h-index or invented metadata.

import wolf359Pdf from "@/assets/wolf359-2025.pdf.asset.json";
import gj398Pdf from "@/assets/gj398-2026.pdf.asset.json";
import tic272272592Pdf from "@/assets/tic272272592-2025.pdf.asset.json";
import twoYoungMstarsPdf from "@/assets/two-young-mstars-2025.pdf.asset.json";


export type PublicationStatus = "Published" | "Accepted" | "Proceeding";
export type PublicationType = "Journal" | "Proceeding";
export type AuthorRole = "First Author" | "Collaborative";

export type PublicationRecord = {
  id: string;
  slug: string;
  title: string;
  authors: string[];
  diyaAuthorPosition: number; // 1-indexed
  role: AuthorRole;
  year: number;
  month: string;
  type: PublicationType;
  status: PublicationStatus;
  journal: string;
  volume?: string;
  issue?: string;
  articleNumber?: string;
  pages?: string;
  doi: string;
  doiUrl: string;
  adsUrl?: string;
  arxivUrl?: string;
  themes: string[];
  instruments: string[];
  targets: string[];
  shortSummary: string;
  abstract?: string;
  keyFindings?: string[];
  keywords?: string[];
  pdfUrl?: string;
  featured?: boolean;
  enrichmentPending?: boolean;
};

export const publicationsArchive: PublicationRecord[] = [
  // ---------- FIRST-AUTHOR JOURNAL ARTICLES ----------
  {

    id: "gj1151",
    slug: "gj1151-flares-ugmrt",
    title:
      "Magnetic Activities of GJ 1151: Flares in TESS Data and Radio Observation in uGMRT",
    authors: [
      "Diya Ram",
      "Soumen Mondal",
      "Anandmayee Tej",
      "Tapas Baug",
      "Ramkrishna Das",
      "Dushmanta Patra",
      "Samrat Ghosh",
      "Rajib Kumbhakar",
    ],
    diyaAuthorPosition: 1,
    role: "First Author",
    year: 2025,
    month: "November",
    type: "Journal",
    status: "Published",
    journal: "The Astrophysical Journal",
    volume: "994",
    issue: "1",
    articleNumber: "120",
    doi: "10.3847/1538-4357/ae145a",
    doiUrl: "https://doi.org/10.3847/1538-4357/ae145a",
    adsUrl: "https://ui.adsabs.harvard.edu/abs/2025ApJ...994..120R",
    themes: ["M-dwarf Magnetic Activity", "Flares", "Starspots", "Radio Astronomy", "TESS Photometry"],
    instruments: ["TESS", "uGMRT"],
    targets: ["GJ 1151"],
    shortSummary:
      "TESS short-cadence photometry and uGMRT observations of the quiescent mid-M dwarf GJ 1151 — reporting its first detected flares and constraining low-frequency radio emission linked to a hypothesised close-in planet.",
    abstract:
      "GJ 1151 is a nearby (8 pc), quiescent mid-M dwarf (M4.5V) of older age, made especially interesting by the hypothesised presence of a close-in planet invoked to explain its low-frequency radio emission. We analysed the flaring activity of GJ 1151 using 2-minute short-cadence TESS photometry and uGMRT radio observations. TESS Sector 48 revealed three flare events with bolometric energies of 10^30–10^31 erg — placing this previously optically-inactive star in the lower-to-intermediate activity regime — including the most energetic recorded flare of (4.86 ± 0.19) × 10^31 erg lasting ≈30 minutes, implying a minimum surface magnetic field strength of 45 G. The mean spot temperature is estimated at ≈2886 ± 837 K covering ≈1.2% of the stellar surface. Non-detection of radio emission at 1.36 GHz (3σ upper limit 105 μJy beam^-1) suggests time variability, a frequency cutoff, or a magnetic environment modulated by the hypothesised planet's orbital configuration.",
    keyFindings: [
      "First detection of flare activity on the previously optically-inactive GJ 1151.",
      "Most energetic flare of (4.86 ± 0.19) × 10^31 erg over ≈30 minutes, requiring ≥45 G surface field.",
      "Mean spot temperature 2886 ± 837 K covering ~1.2% of the stellar disk.",
      "3σ upper limit of 105 μJy beam^-1 on 1.36 GHz emission with uGMRT — constraining star–planet interaction scenarios.",
    ],
    keywords: ["M dwarf stars", "Stellar flares", "Starspots", "Magnetic fields", "Habitable planets", "Radio sources"],
    featured: true,
  },
  {
    id: "wolf359",
    slug: "wolf-359-starspots-qpp",
    title:
      "Magnetic Activities of Wolf 359: Starspot Distribution and Quasiperiodic Pulsation Using TESS Data",
    authors: ["Diya Ram", "Soumen Mondal", "Samrat Ghosh", "Rajib Kumbhakar"],
    diyaAuthorPosition: 1,
    role: "First Author",
    year: 2025,
    month: "August",
    type: "Journal",
    status: "Published",
    journal: "The Astrophysical Journal",
    volume: "988",
    issue: "2",
    articleNumber: "257",
    doi: "10.3847/1538-4357/ade9a7",
    doiUrl: "https://doi.org/10.3847/1538-4357/ade9a7",
    adsUrl: "https://ui.adsabs.harvard.edu/abs/2025ApJ...988..257R",
    themes: ["M-dwarf Magnetic Activity", "Flares", "Starspots", "Quasi-periodic Pulsations", "TESS Photometry"],
    instruments: ["TESS"],
    targets: ["Wolf 359"],
    shortSummary:
      "A TESS study of Wolf 359 — the fifth-closest star to Earth — mapping starspots, characterising 126 flares across three sectors and reporting the first quasi-periodic pulsations detected on this M6 dwarf.",
    abstract:
      "Wolf 359 is the fifth closest (~2.4 pc) star to Earth and a candidate exoplanet-hosting M6 dwarf. Using 2-minute short-cadence TESS photometry across Sectors 45, 46 and 72, we identified 48, 46 and 32 flares respectively, with bolometric energies of 10^30–10^32 erg. The largest event released 4.2 ± 0.5 × 10^32 erg over 244.8 minutes, requiring a magnetic field strength of ≈0.18 kG. For the first time on this star we detect two complex flares with oscillation periods of 104.56 ± 0.59 min and 39.22 ± 0.42 min — signatures of quasi-periodic pulsations plausibly driven by periodic plasma motion or oscillatory reconnection. Mean spot temperature is 2772 ± 100 K over 1.30% of the disk. The flare duration–energy scaling τ ∝ E_bol^(0.55 ± 0.01) is steeper than solar, hinting at differences in magnetic topology and multi-loop flare complexity.",
    keyFindings: [
      "126 flares identified across TESS Sectors 45, 46 and 72; rotation period 2.69 d.",
      "First detection of complex flares with quasi-periodic pulsations (P ≈ 104.6 and 39.2 min).",
      "Superflare of 4.2 ± 0.5 × 10^32 erg (244.8 min) requiring ≈0.18 kG magnetic field.",
      "Steeper duration–energy scaling than solar flares, indicating distinct magnetic-loop topology.",
    ],
    keywords: ["M dwarf stars", "Stellar flares", "Magnetic fields", "Starspots", "Star–planet interactions", "Habitable planets"],
    featured: true,
  },
  {
    id: "adleo",
    slug: "ad-leonis-flares-spectra",
    title: "Magnetic Activities of AD Leonis: Flares in TESS Data and Optical Spectra",
    authors: ["Diya Ram", "Soumen Mondal", "Dushmanta Patra", "Samrat Ghosh", "Rajib Kumbhakar"],
    diyaAuthorPosition: 1,
    role: "First Author",
    year: 2025,
    month: "February",
    type: "Journal",
    status: "Published",
    journal: "The Astrophysical Journal",
    volume: "980",
    issue: "2",
    articleNumber: "196",
    doi: "10.3847/1538-4357/adabc3",
    doiUrl: "https://doi.org/10.3847/1538-4357/adabc3",
    adsUrl: "https://ui.adsabs.harvard.edu/abs/2025ApJ...980..196R",
    themes: ["M-dwarf Magnetic Activity", "Flares", "Optical Spectroscopy", "Chromospheric Diagnostics", "TESS Photometry"],
    instruments: ["TESS", "HCT", "GMRT"],
    targets: ["AD Leonis"],
    shortSummary:
      "TESS photometry, time-series optical spectroscopy and 325 MHz GMRT observations of the active M4.5 dwarf AD Leo — including a rare 4.9 × 10^35 erg superflare and a 12-minute Hα / Ca II H&K delay.",
    abstract:
      "We studied the flaring activity of the M4.5 dwarf AD Leo through non-simultaneous TESS photometry, time-series optical spectra, and 325 MHz GMRT radio data. We recover a rotation period of 2.23 ± 0.04 d, consistent with the literature, and identify a rare superflare of 4.9 × 10^35 erg lasting ≈400 min with an inferred magnetic field strength of 1.2 kG. The duration–energy relation τ ∝ E_bol^(0.60 ± 0.02) differs from solar behaviour, suggesting stronger coronal magnetic fields. Optical spectra reveal Hα flares of 10^30–10^31 erg, with a 12-minute delay between Hα and Ca II H & K emission indicating distinct chromospheric origins. A radio detection of 9.46 ± 1.63 mJy at 325 MHz may reflect coherent emission enabled by the strong magnetic environment — hinting at possible star–planet interaction.",
    keyFindings: [
      "Superflare of 4.9 × 10^35 erg (~400 min) requiring ≈1.2 kG magnetic field.",
      "Duration–energy law τ ∝ E_bol^0.60 differs from solar flares, suggesting stronger coronal fields.",
      "12-minute delay between Hα and Ca II H & K spectral flares — distinct chromospheric layers.",
      "Occasional 325 MHz GMRT detection at 9.46 ± 1.63 mJy consistent with coherent emission.",
    ],
    keywords: ["M dwarf stars", "Stellar flares", "Magnetic fields", "Starspots", "Habitable planets"],
    featured: true,
  },

  // ---------- ACCEPTED (EMERGING RESEARCH) ----------
  {
    id: "gj398",
    slug: "gj-398-flares-radio",
    title:
      "Probing the Magnetic Activity of GJ 398 through TESS Flare Detection and uGMRT Radio Observations",
    authors: [
      "Diya Ram",
      "Soumen Mondal",
      "Dushmanta Patra",
      "Anandmayee Tej",
      "Ariful Hoque",
      "Samrat Ghosh",
      "Rajib Kumbhakar",
    ],
    diyaAuthorPosition: 1,
    role: "First Author",
    year: 2026,
    month: "",
    type: "Journal",
    status: "Accepted",
    journal: "The Astrophysical Journal",
    doi: "",
    doiUrl: "",
    themes: ["M-dwarf Magnetic Activity", "Flares", "Radio Astronomy", "TESS Photometry"],
    instruments: ["TESS", "uGMRT"],
    targets: ["GJ 398"],
    shortSummary:
      "TESS photometry and uGMRT Band-4/5 observations of the highly active mid-M dwarf GJ 398 — reporting its first superflare and constraining coronal magnetic fields near the fully-convective boundary.",
    abstract:
      "GJ 398 is a highly active mid-M dwarf (M4V) at ~15 pc, sitting near the transition between partially and fully convective interiors — a benchmark for multi-wavelength magnetic energy release in active mid-M dwarfs. Using 2-minute TESS short-cadence photometry and uGMRT Band-4 and Band-5 observations, we report for the first time a superflare of 2.6 × 10^34 erg with a duration of ≈90 min, implying a magnetic field of at least 362 G. The flare duration–energy scaling Δt ∝ E_bol^(0.51 ± 0.03) implies a characteristic coronal field of ≈60 G, with localised >200 G regions needed only for the most energetic events. No radio emission was detected in 56 min of on-source integration per band.",
    keyFindings: [
      "First-reported superflare on GJ 398: 2.6 × 10^34 erg over ≈90 min.",
      "Characteristic coronal magnetic field ≈60 G; localised >200 G required for the largest flare.",
      "Duration–energy scaling Δt ∝ E_bol^0.51 differs from solar behaviour despite similar exponent.",
      "Non-detection at uGMRT Bands 4 & 5 — cause unresolved without deeper time on source.",
    ],
    keywords: ["M dwarf stars", "Stellar flares", "Magnetic fields", "Radio sources"],
    featured: true,
  },

  // ---------- CONFERENCE PROCEEDINGS (FIRST AUTHOR) ----------
  {
    id: "proc-mdwarf-spectro",
    slug: "understanding-magnetic-activity-mdwarfs-spectroscopy",
    title:
      "Understanding the Magnetic Activity of M Dwarfs: Optical and Near-Infrared Spectroscopic Studies",
    authors: [
      "Diya Ram",
      "Soumen Mondal",
      "Santosh Joshi",
      "Dushmanta Patra",
      "Samrat Ghosh",
      "Rajib Kumbhakar",
    ],
    diyaAuthorPosition: 1,
    role: "First Author",
    year: 2024,
    month: "June",
    type: "Proceeding",
    status: "Proceeding",
    journal: "Conference Proceeding",
    volume: "93",
    pages: "358–369",
    doi: "10.25518/0037-9565.11717",
    doiUrl: "https://doi.org/10.25518/0037-9565.11717",
    adsUrl: "https://ui.adsabs.harvard.edu/abs/2024BSRSL..93..358R",
    themes: ["Optical Spectroscopy", "Chromospheric Diagnostics", "M-dwarf Magnetic Activity"],
    instruments: ["HCT (HFOSC)", "DOT (TANSPEC)", "TESS"],
    targets: ["AD Leo", "EV Lac", "Stkm2-809"],
    shortSummary:
      "Optical and near-infrared spectroscopic study of three active M dwarfs (AD Leo, EV Lac, Stkm2-809) using HFOSC on the 2-m HCT and TANSPEC on the 3.6-m DOT, correlating Ca IRT equivalent widths with Rossby number and identifying superflares in TESS light curves.",
    abstract:
      "We present preliminary results on the magnetic activity of three M dwarfs (AD Leo, EV Lac, Stkm2-809) using optical and near-infrared (0.38–2.5 μm) spectroscopic data from HFOSC on the 2-m HCT and TANSPEC on the 3.6-m DOT, alongside 89 M dwarfs from the literature. Equivalent widths of the Ca IRT triplet (0.850, 0.854, 0.866 μm) — chromospheric and coronal indicators — are correlated with the Rossby number R₀. Ca IRT b and c strengths increase with decreasing R₀ and saturate at R₀ ≤ 0.1. TESS light curves reveal several superflare events; the highest — 1.22 × 10^37 erg for EV Lac in Sector 57 — requires ≈10.53 kG of magnetic field, with implications for habitability of any orbiting planets.",
    keyFindings: [
      "Ca IRT b & c equivalent widths correlate strongly with Rossby number and saturate at R₀ ≤ 0.1.",
      "TESS superflares detected up to 1.22 × 10^37 erg for EV Lac (Sector 57).",
      "Inferred magnetic field of ≈10.53 kG to power the largest superflare.",
    ],
    keywords: ["TESS", "M dwarfs", "Flare", "Rossby number"],
    featured: true,
  },

  // ---------- COLLABORATIVE JOURNAL PAPERS ----------
  {
    id: "tic272272592",
    slug: "tic-272272592-starspots",
    title:
      "Probing Starspot Dynamics on the Active M Dwarf TIC 272272592: A Multiyear TESS Study",
    authors: [
      "Rajib Kumbhakar",
      "Soumen Mondal",
      "Samrat Ghosh",
      "Diya Ram",
      "Dorothy M. Mwanzia",
    ],
    diyaAuthorPosition: 4,
    role: "Collaborative",
    year: 2025,
    month: "December",
    type: "Journal",
    status: "Published",
    journal: "The Astrophysical Journal",
    volume: "994",
    issue: "2",
    articleNumber: "150",
    doi: "10.3847/1538-4357/ae072c",
    doiUrl: "https://doi.org/10.3847/1538-4357/ae072c",
    adsUrl: "https://ui.adsabs.harvard.edu/abs/2025ApJ...994..150K",
    themes: ["Starspots", "M-dwarf Magnetic Activity", "TESS Photometry"],
    instruments: ["TESS"],
    targets: ["TIC 272272592"],
    shortSummary:
      "Multiyear TESS study of an active rapid-rotator M dwarf: two-spot model with a stable high-latitude spot, a migrating midlatitude spot, and 36 flares with peak temperatures 11,000–24,700 K.",
    abstract:
      "We analyse the temporal starspot evolution of the active rapid rotator TIC 272272592 (Prot = 1.22 d) using >3 yr of TESS high-precision photometry. Starspot modelling with the BASSMAN software indicates two spots on the stellar surface — a stable high-latitude spot and an occasionally present midlatitude spot that gradually migrates polewards. A moderate negative correlation between starspot size and time (Spearman ρ = −0.43) suggests significant decay across the 3-year baseline, though no clear cyclic pattern is detected. Mean total spot coverage across sectors 14, 15, 41, 54 and 55 was 5.1%, 5.7%, 5.5%, 4.8% and 4.4%. Peak flare temperatures for 36 detected flares span 11,000 ± 1900 K to 24,700 ± 5000 K, with 70% showing peak emitting areas of 170–563 ppm. No statistically significant correlation was found between flares and rotational phase.",
    keyFindings: [
      "Rapid rotator (Prot = 1.22 d) modelled with a stable high-latitude spot + migrating midlatitude spot.",
      "Spot size decays over the 3-year baseline (Spearman ρ = −0.43) with no clear cyclic pattern.",
      "36 flares detected with peak temperatures 11,000–24,700 K.",
      "No significant correlation between flare occurrence and rotational phase.",
    ],
    keywords: ["Starspots", "Stellar flares", "M dwarf stars", "Surface variability"],
  },
  {
    id: "two-young-mstars",
    slug: "starspot-flares-two-young-mstars",
    title:
      "Starspot Distribution and Flare Events in Two Young Low-mass Stars Using TESS Data",
    authors: ["Rajib Kumbhakar", "Soumen Mondal", "Samrat Ghosh", "Diya Ram"],
    diyaAuthorPosition: 4,
    role: "Collaborative",
    year: 2025,
    month: "March",
    type: "Journal",
    status: "Published",
    journal: "The Astrophysical Journal",
    volume: "981",
    issue: "2",
    articleNumber: "169",
    doi: "10.3847/1538-4357/adae07",
    doiUrl: "https://doi.org/10.3847/1538-4357/adae07",
    adsUrl: "https://ui.adsabs.harvard.edu/abs/2025ApJ...981..169K",
    themes: ["Starspots", "Flares", "M-dwarf Magnetic Activity", "TESS Photometry"],
    instruments: ["TESS"],
    targets: ["GJ 182", "2MASS J05160212+2214528"],
    shortSummary:
      "Starspot modelling and flare characterisation of two young M dwarfs — GJ 182 (three-spot, T ≈ 3279 K, 48 flares) and 2MASS J05160212+2214528 (two-spot, T ≈ 2631 K, no flares detected).",
    abstract:
      "We study the magnetic activity of two young M dwarfs, GJ 182 and 2MASS J05160212+2214528, using TESS 2-minute cadence light curves and the BASSMAN starspot modelling software. A three-spot model best reproduces GJ 182's light curve with mean spot temperature ≈3279 K covering 5–8.5% of the surface, while a two-spot model with mean T ≈ 2631 K and ≈5.4% coverage describes 2MASS J05160212+2214528. For GJ 182 we identify and analyse 48 flare events with bolometric energies 10^32–10^35 erg (10^31–10^33 erg in the TESS bandpass); no flares are detected on 2MASS J05160212+2214528. Flare frequency distributions in sectors 5 and 32 give power-law indices of −1.53 ± 0.12 and −1.86 ± 0.22 respectively over 10^33–10^35 erg. A positive linear flare-energy vs. duration relation with slope 0.67 ± 0.02 is consistent with a mechanism analogous to solar flares. Assuming solar-flare scaling, the inferred lower-limit magnetic field strengths lie in the range 12–232 G.",
    keyFindings: [
      "Three-spot model for GJ 182 (T ≈ 3279 K, 5–8.5% coverage); two-spot model for 2MASS J05160212+2214528 (T ≈ 2631 K).",
      "48 flares on GJ 182 spanning 10^32–10^35 erg; no flares detected on 2MASS J05160212+2214528.",
      "Flare frequency power-law indices −1.53 ± 0.12 (Sector 5) and −1.86 ± 0.22 (Sector 32).",
      "Inferred lower-limit magnetic field strengths of 12–232 G for detected superflares.",
    ],
    keywords: ["Variable stars", "Starspots", "Stellar flares", "M dwarf stars"],
  },
  {
    id: "taurus-brown-dwarfs",
    slug: "tess-young-brown-dwarfs-taurus",
    title:
      "TESS Photometric Variability of Young Brown Dwarfs in the Taurus Star-forming Region",
    authors: ["Rajib Kumbhakar", "Soumen Mondal", "Samrat Ghosh", "Diya Ram"],
    diyaAuthorPosition: 4,
    role: "Collaborative",
    year: 2023,
    month: "September",
    type: "Journal",
    status: "Published",
    journal: "The Astrophysical Journal",
    volume: "955",
    issue: "1",
    articleNumber: "18",
    doi: "10.3847/1538-4357/aceb65",
    doiUrl: "https://doi.org/10.3847/1538-4357/aceb65",
    adsUrl: "https://ui.adsabs.harvard.edu/abs/2023ApJ...955...18K",
    themes: ["Brown Dwarfs", "TESS Photometry", "Flares", "Low-mass Stars"],
    instruments: ["TESS"],
    targets: ["MHO 4", "Young Taurus brown dwarfs"],
    shortSummary:
      "TESS Sectors 43–44 photometry of 11 young (~2–3 Myr) brown dwarfs in the Taurus molecular cloud — 72% periodic (1–7 d), four superflares detected in three objects with bolometric energies 10^35–10^36 erg.",
    abstract:
      "We present a comprehensive analysis of TESS high-quality light curves from Sectors 43 and 44 for a sample of young (~2–3 Myr) brown dwarfs in the Taurus molecular cloud. Out of 11 young BDs, 72% are periodic, with periods 1–7 days; three BDs have periods < 1.5 d and the period of one object is estimated for the first time. Sinusoidal periodic variations are attributed to a large spot or group of small spots corotating with the objects. Four flare events were detected across three young BDs — MHO 4 exhibits two flares in two different sectors. Bolometric flare energies range from 10^35 to 10^36 erg, close to the superflare range (>10^34 erg); required magnetic field strengths lie in the kilogauss regime. Such superflares have strong implications for the habitability of any surrounding planets.",
    keyFindings: [
      "TESS variability survey of 11 young Taurus brown dwarfs; 72% show periodicity of 1–7 days.",
      "Four superflares detected across three brown dwarfs (bolometric energies 10^35–10^36 erg).",
      "MHO 4 exhibits two flare events in different sectors.",
      "Inferred kilogauss magnetic fields with implications for habitability of orbiting planets.",
    ],
    keywords: ["Variable stars", "Stellar flares", "M dwarf stars", "Starspots", "Pre-main sequence stars"],
  },

  // ---------- COLLABORATIVE PROCEEDING ----------
  {
    id: "proc-young-bd-superflares",
    slug: "young-brown-dwarf-superflares-tess",
    title:
      "Rotational Variability and Detection of Superflares in a Young Brown Dwarf by TESS",
    authors: [
      "Rajib Kumbhakar",
      "Soumen Mondal",
      "Samrat Ghosh",
      "Diya Ram",
      "Sudip Pramanik",
    ],
    diyaAuthorPosition: 4,
    role: "Collaborative",
    year: 2024,
    month: "June",
    type: "Proceeding",
    status: "Proceeding",
    journal: "Bulletin de la Société Royale des Sciences de Liège",
    volume: "93",
    issue: "2",
    pages: "370–380",
    doi: "10.25518/0037-9565.11722",
    doiUrl: "https://doi.org/10.25518/0037-9565.11722",
    themes: ["Brown Dwarfs", "Flares", "TESS Photometry"],
    instruments: ["TESS"],
    targets: ["MHO 4"],
    shortSummary:
      "TESS light-curve analysis of the young M7.0 brown dwarf MHO 4 (Taurus star-forming region) — rotation period ≈ 2.224 d and two superflare events with bolometric energies 10^34–10^35 erg.",
    abstract:
      "We present a comprehensive analysis of TESS high-quality light curves for the young brown dwarf MHO 4 (spectral type M7.0) in the Taurus star-forming region. The light curve reveals a rotation period of approximately 2.224 days. MHO 4 exhibits two significant flaring events with bolometric flare energies in the range 10^34–10^35 erg, classifying them as superflares. The paper was presented at the 3rd BINA Workshop on 'Scientific Potential of the Indo-Belgian Cooperation' held at Graphic Era Hill University, Bhimtal (India), 22–24 March 2023.",
    keyFindings: [
      "Rotation period of MHO 4 ≈ 2.224 d from TESS Sectors 43–44.",
      "Two significant flaring events detected on this young brown dwarf.",
      "Bolometric superflare energies of 10^34–10^35 erg.",
    ],
    keywords: ["Brown dwarfs", "TESS", "Photometric variability", "Periodic variables", "Starspots"],
  },
];

// ---------- ARCHIVE METRICS (verified from CV) ----------
export const archiveMetrics = {
  journalPublications: 6,
  firstAuthorPublished: 3,
  firstAuthorAccepted: 1,
  conferenceProceedings: 2,
  scientificEvents: 12,
  workshops: 2,
  oralPresentations: 3,
  posterPresentations: 5,
} as const;

// ---------- RESEARCH THEMES (constellation navigator) ----------
export const researchThemes = [
  "M-dwarf Magnetic Activity",
  "Flares",
  "Starspots",
  "Quasi-periodic Pulsations",
  "Optical Spectroscopy",
  "TESS Photometry",
  "Radio Astronomy",
  "Chromospheric Diagnostics",
  "Low-mass Stars",
  "Brown Dwarfs",
  "Star–Planet Interaction",
] as const;

// ---------- SCIENTIFIC EXCHANGE (Conferences, Seminars, Workshops) ----------
export type EventRole = "Oral Presentation" | "Poster Presentation" | "Participant" | "Online Participant";

export type ScientificEvent = {
  id: string;
  year: number;
  title: string;
  host: string;
  dateRange: string;
  role: EventRole;
};

export const scientificEvents: ScientificEvent[] = [
  { id: "e1", year: 2025, title: "One-day Online Meeting on Bhaskaracharya Observatory for the Search of Exoplanets (BOSE): Towards the Discovery of Earth-Twins", host: "BOSE Consortium", dateRange: "9 December 2025", role: "Online Participant" },
  { id: "e2", year: 2025, title: "Bose Fest 2025", host: "S. N. Bose National Centre for Basic Sciences", dateRange: "10–13 March 2025", role: "Oral Presentation" },
  { id: "e3", year: 2024, title: "21st National Space Science Symposium", host: "Goa University", dateRange: "26 February – 1 March 2024", role: "Poster Presentation" },
  { id: "e4", year: 2024, title: "Bose Fest 2024", host: "S. N. Bose National Centre for Basic Sciences", dateRange: "28–30 July 2024", role: "Poster Presentation" },
  { id: "e5", year: 2023, title: "Bose Fest 2023", host: "S. N. Bose National Centre for Basic Sciences", dateRange: "28–30 July 2023", role: "Oral Presentation" },
  { id: "e6", year: 2023, title: "Sagan Exoplanet Summer Hybrid Workshop — Characterizing Exoplanet Atmospheres: The Next Twenty Years", host: "NASA Exoplanet Science Institute", dateRange: "24–28 July 2023", role: "Online Participant" },
  { id: "e7", year: 2023, title: "3rd BINA Workshop — Scientific Potential of the Indo-Belgian Cooperation", host: "Graphic Era Hill University, Bhimtal", dateRange: "22–24 March 2023", role: "Poster Presentation" },
  { id: "e8", year: 2022, title: "Gaia Symposium: DR3 and Beyond", host: "Indian Institute of Astrophysics, Bangalore", dateRange: "11–15 July 2022", role: "Online Participant" },
  { id: "e9", year: 2022, title: "Bose Fest 2022", host: "S. N. Bose National Centre for Basic Sciences", dateRange: "27–29 April 2022", role: "Poster Presentation" },
  { id: "e10", year: 2022, title: "40th Annual Meeting of the Astronomical Society of India", host: "IIT Roorkee & ARIES Nainital", dateRange: "25–29 March 2022", role: "Poster Presentation" },
  { id: "e11", year: 2022, title: "20th National Space Science Symposium", host: "IISER Kolkata", dateRange: "31 January – 4 February 2022", role: "Participant" },
  { id: "e12", year: 2021, title: "TESS Science Conference II", host: "Massachusetts Institute of Technology", dateRange: "2–6 August 2021", role: "Online Participant" },
];

export type Workshop = {
  id: string;
  title: string;
  host: string;
  dateRange: string;
  format: string;
};

export const workshops: Workshop[] = [
  {
    id: "w1",
    title: "Machine Learning in Astronomy (WS2)",
    host: "40th Annual Meeting of the Astronomical Society of India — IIT Roorkee & ARIES Nainital",
    dateRange: "25–29 March 2022",
    format: "Workshop",
  },
  {
    id: "w2",
    title: "Astronomical Data Analysis Using Python",
    host: "NCRA-TIFR · Instructor: Prof. Yogesh Wadadekar",
    dateRange: "2021",
    format: "Online Course",
  },
];

export const communityContribution = {
  role: "Local Organising Committee Member",
  event: "Star Formation Studies in India",
  host: "S. N. Bose National Centre for Basic Sciences, Kolkata",
  dateRange: "8–11 January 2024",
};

// ---------- CITATION HELPERS ----------
export function formatPlainCitation(p: PublicationRecord): string {
  const authors = p.authors.join(", ");
  const journal = p.type === "Journal" ? p.journal : "Conference Proceeding";
  const bib = [
    `${authors} (${p.year}).`,
    `${p.title}.`,
    p.type === "Journal"
      ? `${journal}${p.volume ? `, ${p.volume}` : ""}${p.issue ? `(${p.issue})` : ""}${p.articleNumber ? `, ${p.articleNumber}` : ""}.`
      : `${p.volume ? `Vol. ${p.volume}, ` : ""}${p.pages ? `pp. ${p.pages}.` : ""}`,
    p.doi ? `DOI: ${p.doi}` : "",
  ];
  return bib.filter(Boolean).join(" ").trim();
}

export function formatBibtex(p: PublicationRecord): string {
  const key = `${p.authors[0].split(" ").slice(-1)[0].toLowerCase()}${p.year}${p.id}`;
  const fields: Array<[string, string | undefined]> = [
    ["author", p.authors.join(" and ")],
    ["title", `{${p.title}}`],
    ["journal", p.type === "Journal" ? p.journal : undefined],
    ["booktitle", p.type === "Proceeding" ? "Conference Proceeding" : undefined],
    ["year", String(p.year)],
    ["volume", p.volume],
    ["number", p.issue],
    ["pages", p.pages],
    ["eid", p.articleNumber],
    ["doi", p.doi || undefined],
  ];
  const entryType = p.type === "Journal" ? "article" : "inproceedings";
  const lines = fields
    .filter(([, v]) => v)
    .map(([k, v]) => `  ${k} = {${v}},`);
  return `@${entryType}{${key},\n${lines.join("\n")}\n}`;
}

# Diya Astrophysics Portfolio

A production-ready astrophysics research portfolio for **Diya Ram**, built to present research, publications, observational work, scientific visualizations, telescope facilities, academic activities, and live astrophysics content through a modern interactive web experience.

🌐 **Live Website:**  
https://astro-diya.mdwarfs.workers.dev

---

## Overview

The Diya Astrophysics Portfolio is an independent scientific portfolio platform designed around observational astrophysics and stellar-activity research.

The website combines a professional academic portfolio with interactive scientific storytelling, responsive 3D visualizations, publication and research archives, telescope-facility experiences, a live astrophysics news system, secure backend services, real website statistics, and production-grade cloud infrastructure.

The project began as a frontend concept and was progressively rebuilt into an independently controlled production system using GitHub, React/TypeScript, TanStack Start, Three.js, and Cloudflare infrastructure.

Version **1.0.0** represents the first formal production release.

---

## Live Production Site

**Production URL**

https://astro-diya.mdwarfs.workers.dev

The current production deployment runs independently through Cloudflare infrastructure.

---

## Main Features

### Research Portfolio

The website presents Diya Ram's astrophysics research through dedicated sections for:

- research interests;
- research projects;
- publications;
- observational astronomy;
- academic journey;
- conferences and presentations;
- teaching and mentoring;
- downloadable scientific material;
- scientific mission logs;
- professional profile information.

---

## Research Focus

The portfolio primarily highlights research related to:

- M-dwarf stars;
- stellar magnetic activity;
- stellar flares;
- multi-wavelength astronomy;
- optical observations;
- spectroscopy;
- radio astronomy;
- stellar variability;
- stellar environments and space-weather-related astrophysics.

---

## Project Astra

**Project Astra** is the interactive scientific visualization layer of the website.

It combines astronomy, observatory infrastructure, scientific storytelling, real observational facilities, and 3D visualization into an immersive browser experience.

Major Version 1.0 environments include:

- TESS visualization;
- Devasthal Optical Telescope (DOT);
- Himalayan Chandra Telescope (HCT);
- upgraded Giant Metrewave Radio Telescope (uGMRT);
- interactive Earth and observatory environments;
- scientific facility navigation;
- responsive camera and interaction systems;
- adaptive rendering and performance behavior.

The observatory environments are custom-built scientific visualizations rather than external map embeds.

---

## Observatory Experiences

### Devasthal Optical Telescope — DOT

Interactive visualization representing the Devasthal observatory environment and the 3.6-m Devasthal Optical Telescope.

### Himalayan Chandra Telescope — HCT

Interactive visualization inspired by the high-altitude Hanle observatory environment and the Himalayan Chandra Telescope.

### upgraded Giant Metrewave Radio Telescope — uGMRT

Interactive visualization representing the large distributed radio telescope array and its scientific environment.

### TESS

Interactive visualization related to NASA's Transiting Exoplanet Survey Satellite and its role in stellar and exoplanet research.

---

## Publications

The website contains a structured publication archive with dedicated publication routes and downloadable scientific material where available.

Publication pages include production SEO metadata and canonical URLs and are included in the website's XML sitemap.

---

## Astrophysics News Hub

The project includes a dedicated live **Astrophysics News Hub** backed by server-side infrastructure.

The system is designed around trusted astronomy and space-science sources and includes:

- scheduled news ingestion;
- source adapters;
- source-health tracking;
- classification;
- normalization;
- canonical URL handling;
- duplicate detection;
- historical storage;
- search;
- filtering;
- sorting;
- source attribution;
- resilient delivery when individual sources are temporarily unavailable.

The backend uses a dedicated Cloudflare Worker and D1 database.

---

## Secure Contact System

The Contact section is backed by a dedicated server-side architecture.

The implementation includes:

- frontend validation;
- server-side validation;
- anti-spam protections;
- hidden honeypot;
- abuse protection;
- Cloudflare Turnstile integration;
- persistent message storage;
- Gmail notification integration;
- notification retry and recovery architecture;
- safe public error handling;
- separation of frontend code from private credentials.

Sensitive credentials and authentication secrets are never intended to be exposed in frontend source.

---

## Research Statistics

The website contains real, persistent research-site statistics rather than hard-coded demonstration counters.

The statistics system tracks aggregate anonymous information such as:

- visitors;
- research sessions;
- countries.

The backend is implemented through a dedicated Cloudflare Worker and Cloudflare D1.

---

## Universal Asset Management

The production application uses a centralized asset-management architecture for scientific images, documents, PDFs, and large visualization assets.

The system includes:

- centralized image records;
- centralized document records;
- stable asset identifiers;
- local-development asset resolution;
- production asset resolution;
- private Cloudflare R2 storage;
- controlled Worker-based asset delivery;
- generated registries;
- reusable frontend asset services.

This avoids scattering hard-coded production asset URLs throughout the application.

---

## Cloudflare Architecture

The production system uses multiple Cloudflare services.

### Main Application

`astro-diya`

Responsibilities:

- production website;
- server-side application runtime;
- same-origin backend routing;
- frontend delivery.

### Asset Service

`astro-diya-assets`

Responsibilities:

- controlled delivery of assets stored in private Cloudflare R2;
- MIME handling;
- caching;
- CORS;
- safe-path validation;
- large scientific and visualization asset delivery.

### Contact Service

`astro-diya-contact`

Responsibilities:

- Contact form backend;
- server-side validation;
- anti-abuse handling;
- message persistence;
- notification workflow.

### News Service

`astro-diya-news`

Responsibilities:

- astrophysics news ingestion;
- article storage;
- source monitoring;
- query API;
- live News Hub backend.

### Statistics Service

`astro-diya-statistics`

Responsibilities:

- anonymous website statistics;
- visitor/session aggregation;
- country statistics;
- D1-backed persistent storage.

---

## Technology Stack

### Frontend

- React
- TypeScript
- TanStack Start
- TanStack Router
- Vite
- Tailwind CSS

### Scientific Visualization

- Three.js
- WebGL
- custom 3D environments
- adaptive animation and rendering logic

### Backend and Infrastructure

- Cloudflare Workers
- Cloudflare R2
- Cloudflare D1
- Cloudflare service bindings
- Cloudflare Turnstile
- Gmail API
- scheduled Worker execution

### Development and Release

- Git
- GitHub
- VS Code
- npm
- Wrangler
- Playwright-based release QA

---

## Responsive Design

The application is designed as one responsive production website rather than separate desktop and mobile applications.

The responsive system supports a broad range of:

- desktop displays;
- laptops;
- high-DPI laptops;
- tablets;
- mobile devices;
- scaled Windows displays;
- reduced-motion environments.

The final release process included extensive automated viewport testing and focused desktop/laptop browser QA.

---

## Adaptive Performance System

The website contains centralized performance governance rather than relying only on device CPU or memory assumptions.

Performance decisions can consider:

- viewport dimensions;
- device pixel ratio;
- estimated physical rendering workload;
- viewport height;
- viewport width;
- device capability;
- user performance preference;
- reduced-motion preference.

The application can reduce unnecessary continuous visual effects when the rendering environment requires it while preserving the scientific visual experience.

---

## Accessibility

The project includes accessibility-oriented behavior such as:

- semantic navigation;
- responsive controls;
- keyboard-aware interaction where applicable;
- reduced-motion support;
- adaptive performance behavior;
- readable responsive layouts;
- appropriate interactive labels.

Accessibility remains an ongoing maintenance consideration as the project evolves.

---

## SEO

Version 1.0 includes a complete technical SEO foundation.

Implemented areas include:

- route-specific page titles;
- meta descriptions;
- canonical URLs;
- Open Graph metadata;
- Twitter card metadata;
- structured data where semantically appropriate;
- `robots.txt`;
- dynamic XML sitemap;
- canonical dynamic research routes;
- canonical publication routes;
- legacy URL redirect handling;
- Google Search Console verification.

---

## Sitemap

Production XML sitemap:

https://astro-diya.mdwarfs.workers.dev/sitemap.xml

The sitemap is dynamically generated from the application's current content architecture.

---

## Google Search Console

The production website has been verified in Google Search Console.

At the Version 1.0 release checkpoint:

- ownership verification was successful;
- the XML sitemap was successfully submitted;
- Google discovered 86 sitemap pages;
- homepage indexing was requested.

Search-engine crawling and ranking are naturally handled asynchronously by Google after deployment.

---

## Repository Architecture

The project uses separate Development and Production repositories.

### Development Repository

`astro-diya-portfolio`

Purpose:

- design/frontend-development history;
- optional future design experimentation;
- historical frontend source.

### Production Repository

`diya-astrophysics-portfolio-production`

Purpose:

- independent production engineering;
- Cloudflare infrastructure;
- backend services;
- asset-management infrastructure;
- release-ready source;
- stable production branch.

This repository is the **Production repository**.

---

## Branch Strategy

### `main`

The stable production release branch.

Version 1.0 production development has been fully promoted to `main`.

### `asset-restoration`

Historical production-engineering branch used during the major reconstruction and production-migration programme.

At Version 1.0 closure, both branches were synchronized.

Future changes should normally be developed in purpose-specific feature or fix branches created from `main`.

Example:

```text
main
  ↓
feature/new-publication
  ↓
local QA
  ↓
technical validation
  ↓
review
  ↓
merge to main
  ↓
production deployment
```

---

## Version 1.0 Release

Formal release tag:

```text
v1.0.0
```

Release milestone commit:

```text
dd53c08
Improve responsive navigation and adaptive performance
```

Current Version 1.0 production source subsequently includes the Google Search Console verification checkpoint.

The published `v1.0.0` tag is intentionally preserved at its original release milestone.

---

## Development Status

**Diya Astrophysics Portfolio Version 1.0 is complete and released.**

Current state:

```text
Frontend                 COMPLETE
Backend                  COMPLETE
Asset architecture       COMPLETE
Project Astra            COMPLETE
Contact system           COMPLETE
News system              COMPLETE
Research statistics      COMPLETE
Responsive QA            COMPLETE
Production deployment    COMPLETE
Technical SEO            COMPLETE
Search Console            VERIFIED
Sitemap submission       COMPLETE
Initial indexing request COMPLETE
Stable main branch       COMPLETE
```

There is no known mandatory Version 1.0 development task remaining.

Future work is classified as:

- maintenance;
- scientific/content updates;
- bug fixes;
- optional enhancements;
- future Version 1.x / Version 2 development.

---

## Local Development

Clone the repository:

```bash
git clone https://github.com/STribedi-94/diya-astrophysics-portfolio-production.git
```

Enter the project:

```bash
cd diya-astrophysics-portfolio-production
```

Install dependencies:

```bash
npm install
```

Start the local development server:

```bash
npm run dev
```

The local Vite development URL will normally be shown in the terminal after startup.

---

## TypeScript Validation

Run:

```bash
npx tsc --noEmit
```

On Windows PowerShell, the project workflow commonly uses:

```powershell
npx.cmd tsc --noEmit
```

---

## Production Build

Run:

```bash
npm run build
```

A successful production build should complete without fatal TypeScript or Vite build errors.

---

## Production Deployment

The repository currently does **not** use an `npm run deploy` script.

Production deployment uses Wrangler directly:

```powershell
npx.cmd wrangler deploy
```

Deployment configuration should always be reviewed before deploying changes to production.

---

## Environment Variables and Secrets

This repository must never contain private production credentials.

Do **not** commit:

- OAuth client secrets;
- Gmail refresh tokens;
- Turnstile secret keys;
- private API keys;
- service credentials;
- account passwords;
- Cloudflare administrative credentials;
- `.env` files containing private values.

Use the provided:

```text
.env.example
```

as the safe configuration reference.

Local environment files should remain untracked.

---

## Security

Security principles used by the project include:

- no secrets in frontend code;
- server-side validation;
- anti-spam controls;
- private R2 storage;
- controlled asset gateway;
- safe backend error responses;
- prepared database operations;
- service isolation;
- origin validation where applicable;
- authentication secrets stored outside source control.

If a security issue is discovered, avoid publishing credentials or sensitive exploit details in a public GitHub issue.

---

## Asset Policy

Large production assets are intentionally handled outside normal Git source history where appropriate.

Cloudflare R2 is used for production storage of large assets, while the application references them through centralized asset-management services.

Do not commit private production asset credentials.

---

## News Copyright and Attribution

The Astrophysics News Hub is designed to preserve attribution to original scientific sources.

The system is intended to store and display structured metadata and concise summaries rather than reproduce full copyrighted articles.

Visitors should follow the original article source for complete content.

---

## Scientific Accuracy

Scientific information should remain:

- factually grounded;
- accurately attributed;
- consistent with the underlying research;
- free from fabricated observations or results.

Future contributors should preserve the scientific integrity of the portfolio.

---

## Known Version 1.0 Release Note

Final focused desktop/laptop automated QA produced:

```text
175 / 176 checks passed
```

The only accepted non-blocking edge case was a small horizontal overflow on the `/about` page at a `1024 × 768` viewport.

It was deliberately accepted for Version 1.0 because it was minor, isolated, and did not justify destabilizing the completed release.

---

## Future Development

Potential future work may include:

- new publications;
- new research projects;
- CV updates;
- academic-position updates;
- conference additions;
- new scientific gallery content;
- new Project Astra experiences;
- browser compatibility maintenance;
- evidence-driven performance optimization;
- additional SEO improvements based on real Search Console data;
- optional custom-domain migration;
- future Version 1.x or Version 2 features.

These are future enhancements and are not unfinished Version 1.0 work.

---

## Custom Domain

Version 1.0 intentionally launches without requiring a paid custom domain.

Current production URL:

https://astro-diya.mdwarfs.workers.dev

A custom domain can be added later as a controlled migration without changing the fact that Version 1.0 is already a complete production release.

---

## Contributions

This repository represents a production scientific portfolio rather than a general-purpose community framework.

Issues, suggestions, accessibility improvements, browser compatibility reports, and clearly scoped improvements are welcome.

For substantial code changes, please open an issue or discussion before submitting a large pull request so that changes remain consistent with the scientific, architectural, and production requirements of the project.

---

## Project Maintainer

**Sandipani Tribedi**

Design, development, production engineering, backend integration, infrastructure, deployment, performance optimization, and release management.

Academic and scientific portfolio content represents **Diya Ram** and her research profile.

---

## Acknowledgements

This project makes use of modern open-source web technologies and cloud infrastructure including:

- React;
- TypeScript;
- TanStack;
- Vite;
- Three.js;
- Tailwind CSS;
- Cloudflare Workers;
- Cloudflare R2;
- Cloudflare D1;
- Playwright;
- Git and GitHub.

Scientific facilities, missions, institutes, publications, names, logos, and external material remain the property of their respective organizations and rights holders.

---

## License

No open-source license has currently been specified for this repository.

Unless and until a license is explicitly added, publication of the source code on GitHub should **not** be interpreted as granting unrestricted permission to copy, redistribute, modify, sublicense, or commercially reuse the project.

See the repository's future `LICENSE` file for any subsequent licensing terms.

---

## Release Status

> **Diya Astrophysics Portfolio — Version 1.0**
>
> **Status:** Complete  
> **Production:** Live  
> **Stable branch:** `main`  
> **Formal release:** `v1.0.0`  
> **Google Search Console:** Verified  
> **Sitemap:** Submitted successfully  
> **Development phase:** Post-launch maintenance

---

**Live Website:**  
https://astro-diya.mdwarfs.workers.dev

## Diya Ram Portfolio — Cinematic Visual Transformation

A single coordinated visual overhaul of the existing site. Architecture, routes, navigation, sitemap, and all factual/placeholder content stay exactly as they are — every change is presentation, atmosphere, motion, and component polish.

### Guiding principles (locked)
- Preserve every route, filename, `createFileRoute` string, nav entry, and existing text/placeholder.
- No invented facts, publications, awards, dates, DOIs, citations, or credits.
- One coherent "Research Universe" identity across every page — no per-page reinvention.
- Dark cinematic foundation with restrained, meaningful accent color (M-dwarf red, spectral cyan, radio teal, UV violet, stellar amber, habitability aqua) — not a uniform blue gradient.
- Accessibility & `prefers-reduced-motion` respected; mobile is designed, not shrunk.

### 1. Design token system (`src/styles.css`)
Replace/extend the current tokens with a layered cosmic palette expressed as OKLCH `@theme` tokens:
- Space layers: `--space-void`, `--space-deep`, `--space-obsidian`, `--space-indigo`, `--space-plum`.
- Scientific accents: `--mdwarf`, `--flare-amber`, `--uv-violet`, `--spectral-cyan`, `--radio-teal`, `--habitable-aqua`, `--stellar-gold`, `--starlight`.
- Surface tokens: `--surface-glass`, `--surface-elevated`, `--border-faint`, `--border-glow`.
- Motion tokens: `--ease-cosmic`, `--dur-slow/med/fast`.
- Radii, section spacing, shadow/glow presets, and a `@media (prefers-reduced-motion: reduce)` block that neutralises drift/parallax/pulse utilities.
- Utilities: `.glass`, `.glass-strong`, `.text-grad-accent`, `.anim-draw`, `.anim-pulse-slow`, `.anim-drift`, `.anim-twinkle`, `.spectral-divider`, `.vignette`.

### 2. Cinematic background engine (new components)
Reusable, page-tunable, all CSS/SVG (no WebGL, no heavy libs):
- `CosmicBackground` — orchestrator, accepts `mood="home|about|universe|publications|observations|journey|conferences|teaching|gallery|contact|facility"`.
- `StarField` — three depth layers of randomised stars (seeded, deterministic), sparse twinkle.
- `NebulaLayer` — low-opacity radial gradients tinted per mood.
- `DustParticles` — tiny slow-drift particles, count scales with viewport, disabled on reduced-motion and small screens.
- `Vignette` — cinematic edge falloff.
- `MeteorStreak` — very rare, per-mood, opt-in.
Mounted once in `__root.tsx` behind `main`, mood read from route via `useMatches`.

### 3. Navigation & header
Refine existing `SiteHeader`:
- Transparent-over-hero → on scroll: compact height, increased blur, faint bottom hairline.
- Active route indicator = small luminous dot + thin spectral underline (accent per section).
- Research/More dropdowns kept, restyled as glass panels with small colored motif per item.
- Mobile: full-screen celestial panel drawer with body-scroll lock, focus trap, large tap targets, close button, staggered link reveal.

### 4. Hero — homepage signature
Rebuild `src/routes/index.tsx` hero only (content preserved):
- Near-full-viewport composition, layered: deep-space bg → distant stars → nebula wash → central active M-dwarf (SVG: radial red-amber core, faint corona, animated magnetic-loop arcs, slow rotation) → foreground text.
- Editorial hierarchy: eyebrow "Observational Astrophysicist" → name in display serif → research statement → supporting line → primary/secondary CTAs → multi-wavelength chip row → subtle scroll cue.
- Restrained motion: title stagger on mount, corona pulse, magnetic-loop draw, particle drift. Reduced-motion → static.
- Optional first-visit intro (sessionStorage flag): 1.2s star-ignition → hero fade-in. Skippable, respects reduced-motion, never replays on route change.

### 5. Homepage narrative sections
Recompose existing home content into chapters with `SpectralDivider` transitions (no wave/diagonal templates):
Researcher → Star → Phenomena → Wavelengths → Research Universe (embed existing `ResearchUniverseMap`, restyled) → Observatories → Scientific Record teasers → Collaboration CTA.
Each chapter gets a small numeric/label eyebrow and a distinct atmospheric tint.

### 6. Research Universe map upgrade
Enhance existing `ResearchUniverseMap` in place (keep API):
- Add scientifically meaningful edges (activity↔flares, activity↔radio, rotation↔spots, spectroscopy↔activity, flares/radio↔habitability, all↔multi-wavelength core).
- Animated connection path draw on view, node pulse on hover/focus, keyboard-navigable nodes, node click routes to `/research/$slug`.
- Progressive-disclosure tooltip panel (accessible, `role="dialog"` on activation).
- Mobile: swap to purpose-built vertical constellation list with luminous connector line (already partially present — restyle, don't rebuild).

### 7. Reusable component library (new/upgrade under `src/components/`)
`PageHero` (upgrade — per-page mood + accent), `SectionChapter`, `GlassPanel`, `SpectralDivider`, `LightCurveMotif`, `RadioWaveMotif`, `SpectrumMotif`, `MagneticLoopMotif`, `ResearchPortalCard`, `FacilityCard`, `PublicationCard`, `TimelineMilestone`, `NewsCard`, `DownloadCard`, `ImageWithCredit`, `CosmicCTA` (button variants), `CreatorCredit`, `PageTransition` (fade+blur on route change), `AccessibleLightbox` (gallery), `ReducedMotionFallback` helper hook.

### 8. Per-page visual passes (content untouched)
For each existing route, apply: mood-tuned background, refined `PageHero`, restyled cards/sections using new components, spectral dividers, per-page accent.
- About — intimate observatory mood; silhouette portrait placeholder frame; research-descriptor chips replace any progress bars.
- Research index + `research.$slug` — accent per area from `researchAreas[i].accent`; hero motif matches area (loops/flare/spectrum/radio/etc.).
- Projects, Publications, Publications/$slug — editorial archive styling, year grouping, spectral separators; placeholders kept but visually polished.
- Facilities index + `facilities.$slug` — uGMRT teal / HCT silver-blue / DOT deep-optical accents; `FacilityCard` with observatory imagery slot (kept as credited placeholder until real assets provided).
- Observations — mission-log styling (subtle, not military).
- Academic Journey — vertical illuminated timeline with animated line progression.
- Conferences — global exchange styling with orbital motif.
- Teaching — warmer accent, still cosmic.
- Gallery — masonry + `AccessibleLightbox` with keyboard nav, captions, credit slot.
- Downloads — polished cards, "Available soon" state when file missing (no dead buttons).
- News + `news.$slug` — journal styling, tags, chronological.
- Contact — deep-space comms mood; form with validation, a11y labels, honest success/error states (no fake "sent" toast).
- Privacy / Sitemap — quiet, consistent with system.

### 9. Footer
Redesign `SiteFooter`: sparse star field, grouped nav, keywords, privacy/sitemap, copyright. Add subtle `CreatorCredit` component: small "ST" mark + "Concept, Design & Development by Sandipani Tribedi", link target configurable in one place (`site.ts`) for later.

### 10. Motion, a11y, performance
- One motion language: fade+translate, scale 0.98→1, blur-to-focus, line draw, magnetic pulse, spectral sweep, stagger. Implemented with CSS + IntersectionObserver — no framer-motion added (keeps bundle lean).
- Global `prefers-reduced-motion` handling in CSS + a `useReducedMotion` hook that shuts down JS-driven drift/parallax.
- Pointer-reactive depth only on `(hover: hover)` + non-touch, opt-in per component.
- Star counts capped; particles disabled below `sm`; images lazy-loaded; SVGs inline & compressed; no WebGL.
- Skip-to-content link, single `<main>`, focus rings preserved, icon-only buttons get `aria-label`.

### 11. SEO / social
Keep existing per-route `head()`. Verify every important route has unique title/description/og:title/og:description and self-referential canonical + og:url. `og:image` stays only where already set; not fabricated for routes without a real image.

### Technical notes
- Stack: TanStack Start + Tailwind v4 (tokens via `@theme` in `src/styles.css`), existing shadcn primitives kept.
- No new heavy deps. If any small helper is needed (e.g. `clsx` already present via `cn`), reuse.
- All new components under `src/components/{layout,visuals,cards,motion}/`.
- File additions only; existing files edited in place with `code--line_replace` where feasible.

### Out of scope (explicit)
- No route additions/removals/renames.
- No content rewrites beyond microcopy for new eyebrows/labels that carry no factual claim.
- No real portraits, real observatory photos, or real publication data added — placeholders stay, just visually elevated.
- No audio, no WebGL, no framer-motion/GSAP dependency additions.

### Deliverable order (single coordinated update)
1. Tokens + background engine + motion utilities.
2. Header/footer/nav polish + `PageTransition`.
3. Homepage hero + narrative + Research Universe upgrade.
4. Shared card/motif/component library.
5. Per-page visual passes in the order listed in §8.
6. A11y + reduced-motion + performance sweep, then verify build.

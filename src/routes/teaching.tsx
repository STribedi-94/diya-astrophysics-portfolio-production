import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  BookOpen,
  Compass,
  Telescope,
  LineChart,
  Users,
  GraduationCap,
  Sparkles,
  ArrowRight,
  ClipboardCheck,
  Radio,
  FlaskConical,
  PenLine,
  Presentation,
  Database,
  Code2,
  Microscope,
  Lightbulb,
  ScrollText,
  ShieldCheck,
  Globe2,
} from "lucide-react";
import { PageHero, Section, GlassPanel } from "@/components/layout/Page";
import { ChronicleNavigator } from "@/components/chronicle/ChronicleNavigator";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/teaching")({
  head: () => ({
    meta: [
      { title: "Teaching & Mentoring | Diya Ram — Astrophysics Researcher" },
      {
        name: "description",
        content:
          "Teaching, research mentoring and scientific training experience of astrophysics researcher Diya Ram, including observational astronomy, data analysis and research-led learning.",
      },
      { property: "og:title", content: "Teaching & Mentoring — Diya Ram" },
      {
        property: "og:description",
        content:
          "Undergraduate teaching, Master's mentorship and research-led scientific training by Diya Ram.",
      },
      { property: "og:type", content: "profile" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: TeachingPage,
});

// ---- Verified content from CV -----------------------------------------

const sections = [
  { id: "philosophy", label: "Philosophy" },
  { id: "experience", label: "Experience" },
  { id: "peer-review", label: "Peer Review" },
  { id: "mentoring", label: "Mentoring" },
  { id: "methods", label: "Methods" },
  { id: "pathway", label: "Learning Pathways" },
  { id: "vision", label: "Future Vision" },
  { id: "connections", label: "Connections" },
] as const;

const philosophyPillars = [
  {
    icon: Lightbulb,
    title: "Curiosity leads",
    body:
      "Learning starts with a real question about a real star, not with formulas divorced from observation.",
  },
  {
    icon: Microscope,
    title: "Evidence over authority",
    body:
      "Every claim is anchored in data — a light curve, a spectrum, a residual — and traced back to its measurement.",
  },
  {
    icon: Code2,
    title: "Reproducible practice",
    body:
      "Notebooks, scripts and reduction steps are documented so a student can repeat and extend the analysis.",
  },
  {
    icon: Users,
    title: "Patient dialogue",
    body:
      "Concepts are unpacked slowly, with room for questions, mistakes and independent interpretation.",
  },
];

const teachingExperience = [
  {
    role: "Guest Lecturer in Physics",
    institution: "Bangabasi Morning College",
    affiliation: "University of Calcutta",
    period: "July 2018 – December 2019",
    level: "Undergraduate (B.Sc.)",
    topics: [
      "Classical Mechanics — B.Sc. (Honours) students",
      "Elasticity, Viscosity and Surface Tension — B.Sc. (Pass) students",
    ],
    responsibilities: [
      "Delivered undergraduate theory lectures",
      "Conducted undergraduate physics laboratory instruction",
    ],
    kind: "Formal teaching",
  },
];

const assessmentRoles = [
  {
    icon: ClipboardCheck,
    title: "External Examiner",
    body:
      "External Examiner for B.Sc. Physics Practical Examinations under the University of Calcutta.",
  },
  {
    icon: PenLine,
    title: "Answer-script evaluation",
    body:
      "Evaluated undergraduate university examination answer scripts in Physics.",
  },
];

const mentorship = [
  {
    student: "Rishav De",
    background: "M.Sc. Physics, IIT Bombay",
    programme: "Summer Research Programme 2026",
    role: "Master's-level research project mentor",
  },
  {
    student: "Sristi Ganguly",
    background: "M.Sc. Physics, St. Xavier's College, Kolkata",
    programme: "Summer Research Programme 2026",
    role: "Master's-level research project mentor",
  },
];

const researchToTeaching = [
  { step: "Scientific Question", icon: Lightbulb },
  { step: "Observation Planning", icon: Compass },
  { step: "Data Acquisition", icon: Telescope },
  { step: "Data Reduction", icon: FlaskConical },
  { step: "Analysis", icon: LineChart },
  { step: "Interpretation", icon: Microscope },
  { step: "Scientific Writing", icon: PenLine },
  { step: "Presentation", icon: Presentation },
];

const methodGroups = [
  {
    heading: "Observational Methods",
    icon: Telescope,
    items: [
      { name: "TESS time-domain photometry", note: "Short-cadence light curves, flare detection, rotational modulation." },
      { name: "Optical spectroscopy (HCT)", note: "Medium-resolution chromospheric diagnostics on nearby M-dwarfs." },
      { name: "Near-infrared spectroscopy (DOT)", note: "Cool-atmosphere diagnostics and molecular features." },
      { name: "Low-frequency radio (uGMRT)", note: "Band-3 / Band-4 interferometric imaging of quiescent M-dwarfs." },
    ],
  },
  {
    heading: "Data Reduction",
    icon: FlaskConical,
    items: [
      { name: "Photometric reduction", note: "Detrending, calibration and light-curve construction." },
      { name: "Spectroscopic reduction", note: "Standard optical/NIR reduction to extract line profiles." },
      { name: "Radio interferometric imaging", note: "Calibration and imaging of uGMRT visibilities." },
    ],
  },
  {
    heading: "Scientific Computing",
    icon: Code2,
    items: [
      { name: "Python & Astropy", note: "Core stack for stellar time-series analysis." },
      { name: "Time-series & statistical analysis", note: "Periodograms, spot modelling, flare energetics, QPP analysis." },
      { name: "Scientific plotting", note: "Publication-quality figures from raw observations." },
    ],
  },
  {
    heading: "Research Communication",
    icon: PenLine,
    items: [
      { name: "LaTeX & scientific writing", note: "Manuscripts, proposals and thesis-quality documents." },
      { name: "Observing proposal preparation", note: "PI-led proposals accepted at HCT, DOT and uGMRT." },
      { name: "Talks & poster presentation", note: "National and international scientific meetings." },
    ],
  },
];

const learningEnvironments = [
  {
    icon: GraduationCap,
    title: "Undergraduate classroom",
    body: "Documented lecturing experience in Classical Mechanics and Properties of Matter at the University of Calcutta.",
  },
  {
    icon: FlaskConical,
    title: "Physics laboratory",
    body: "Undergraduate laboratory instruction and external practical examination.",
  },
  {
    icon: Telescope,
    title: "Observatory & data floor",
    body: "PI-led observing at HCT, DOT and uGMRT — an environment where students can learn planning-to-analysis workflows.",
  },
  {
    icon: Database,
    title: "Coding & data-analysis session",
    body: "Hands-on reduction and time-series analysis of real stellar observations in Python.",
  },
  {
    icon: BookOpen,
    title: "Research discussion",
    body: "Master's-level project mentoring in the Summer Research Programme 2026.",
  },
  {
    icon: Presentation,
    title: "Scientific presentation",
    body: "Guiding students in preparing figures, narratives and talks for scientific audiences.",
  },
];

const highlights = [
  { value: "18 months", label: "Undergraduate teaching at University of Calcutta" },
  { value: "2 courses", label: "Classical Mechanics · Properties of Matter" },
  { value: "2 students", label: "Master's research projects mentored (2026)" },
  { value: "1 review", label: "AAS journal manuscript peer review (2025)" },
];

const visionPoints = [
  "Design research-led courses that treat real telescope data as the primary teaching material.",
  "Guide students in end-to-end observational projects, from proposal writing to publication.",
  "Support early-career researchers in scientific computing, statistics and reproducible analysis.",
  "Foster interdisciplinary collaboration between stellar astrophysics, exoplanet science and radio astronomy.",
  "Encourage open, well-documented science with public code, data and figures.",
  "Build students' confidence to formulate independent scientific questions of their own.",
];

const constellationNodes = [
  { id: "curiosity", label: "Curiosity", x: 50, y: 12 },
  { id: "observation", label: "Observation", x: 88, y: 32 },
  { id: "data", label: "Data", x: 90, y: 72 },
  { id: "analysis", label: "Analysis", x: 62, y: 90 },
  { id: "interpretation", label: "Interpretation", x: 30, y: 88 },
  { id: "communication", label: "Communication", x: 8, y: 66 },
  { id: "mentoring", label: "Mentoring", x: 12, y: 28 },
  { id: "discovery", label: "Discovery", x: 50, y: 50 },
];

const constellationEdges: Array<[string, string]> = [
  ["curiosity", "observation"],
  ["observation", "data"],
  ["data", "analysis"],
  ["analysis", "interpretation"],
  ["interpretation", "communication"],
  ["communication", "mentoring"],
  ["mentoring", "curiosity"],
  ["discovery", "curiosity"],
  ["discovery", "observation"],
  ["discovery", "data"],
  ["discovery", "analysis"],
  ["discovery", "interpretation"],
  ["discovery", "communication"],
  ["discovery", "mentoring"],
];

const crossLinks = [
  {
    to: "/academic-journey",
    title: "Academic Journey",
    body: "The training and milestones that shaped Diya's teaching perspective.",
    icon: Compass,
  },
  {
    to: "/research",
    title: "Research Areas",
    body: "The scientific themes behind research-led teaching.",
    icon: Sparkles,
  },
  {
    to: "/projects",
    title: "Research Projects",
    body: "Active investigations that inform mentoring topics.",
    icon: LineChart,
  },
  {
    to: "/observations",
    title: "Observations",
    body: "From photon to publication — the workflow students learn.",
    icon: Telescope,
  },
  {
    to: "/publications",
    title: "Publications",
    body: "Peer-reviewed outputs that anchor teaching examples.",
    icon: BookOpen,
  },
  {
    to: "/facilities",
    title: "Facilities",
    body: "The telescopes at the heart of every training pathway.",
    icon: Radio,
  },
] as const;

// ---- Component --------------------------------------------------------

function TeachingPage() {
  return (
    <>
      <TeachingHero />
      <ChronicleNavigator sections={[...sections]} label="Teaching" />
      <Philosophy />
      <Experience />
      <PeerReview />
      <Mentoring />
      <Methods />
      <Pathway />
      <Environments />
      <Highlights />
      <Constellation />
      <Vision />
      <Connections />
    </>
  );
}

// ---- Hero -------------------------------------------------------------

function TeachingHero() {
  return (
    <PageHero
      eyebrow="Teaching & Mentoring"
      title={
        <>
          Passing the{" "}
          <span className="text-grad-accent">light of discovery</span>
        </>
      }
      intro="Translating observation, analysis and discovery into collaborative scientific learning — from undergraduate physics classrooms to Master's-level research projects in stellar astrophysics."
    >
      <div className="relative mt-6 hidden overflow-hidden rounded-2xl border border-white/10 bg-black/30 p-6 md:block">
        <SpectrumMotif />
        <div className="relative grid grid-cols-3 gap-4 text-xs text-muted-foreground">
          <div>
            <div className="font-mono text-[10px] uppercase tracking-[0.24em] text-primary/80">Classroom</div>
            <div className="mt-1">Undergraduate physics at University of Calcutta</div>
          </div>
          <div>
            <div className="font-mono text-[10px] uppercase tracking-[0.24em] text-primary/80">Observatory</div>
            <div className="mt-1">Research-led training on HCT · DOT · uGMRT data</div>
          </div>
          <div>
            <div className="font-mono text-[10px] uppercase tracking-[0.24em] text-primary/80">Mentoring</div>
            <div className="mt-1">Master's research projects · Summer Research Programme 2026</div>
          </div>
        </div>
      </div>
    </PageHero>
  );
}

function SpectrumMotif() {
  return (
    <svg
      className="pointer-events-none absolute inset-0 h-full w-full opacity-60"
      viewBox="0 0 800 160"
      aria-hidden
    >
      <defs>
        <linearGradient id="tspec" x1="0" x2="1">
          <stop offset="0" stopColor="hsl(var(--primary))" stopOpacity="0" />
          <stop offset="0.5" stopColor="hsl(var(--primary))" stopOpacity="0.6" />
          <stop offset="1" stopColor="hsl(var(--primary))" stopOpacity="0" />
        </linearGradient>
      </defs>
      <path
        d="M0 100 C 120 80, 200 140, 320 90 S 520 40, 640 110 S 780 90, 800 80"
        stroke="url(#tspec)"
        strokeWidth="1.2"
        fill="none"
      />
      {[80, 180, 260, 360, 440, 540, 620, 720].map((x, i) => (
        <line
          key={x}
          x1={x}
          x2={x}
          y1={20}
          y2={140}
          stroke="hsl(var(--primary))"
          strokeOpacity={0.15 + (i % 3) * 0.1}
          strokeWidth="0.6"
        />
      ))}
    </svg>
  );
}

// ---- Local navigation -------------------------------------------------

function LocalNav() {
  const [active, setActive] = useState<string>(sections[0].id as string);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    let raf = 0;
    const onScroll = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        const y = window.scrollY + 140;
        let current: string = sections[0].id;
        for (const s of sections) {
          const el = document.getElementById(s.id);
          if (el && el.offsetTop <= y) current = s.id;
        }
        setActive(current);
      });
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("scroll", onScroll);
    };
  }, []);

  const jump = (id: string) => {
    const el = document.getElementById(id);
    if (!el) return;
    setOpen(false);
    const y = el.getBoundingClientRect().top + window.scrollY - 96;
    window.scrollTo({ top: y, behavior: "smooth" });
    history.replaceState(null, "", `#${id}`);
  };

  return (
    <>
      {/* Desktop rail */}
      <aside
        className="pointer-events-none fixed right-4 top-1/2 z-30 hidden -translate-y-1/2 lg:block"
        aria-label="On this page"
      >
        <nav className="pointer-events-auto glass rounded-2xl border border-white/10 px-2 py-3">
          <ul className="flex flex-col gap-1">
            {sections.map((s) => (
              <li key={s.id}>
                <button
                  onClick={() => jump(s.id)}
                  className={cn(
                    "group flex w-full items-center gap-2 rounded-full px-3 py-1.5 text-xs transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60",
                    active === s.id
                      ? "text-foreground"
                      : "text-muted-foreground hover:text-foreground",
                  )}
                >
                  <span
                    className={cn(
                      "h-1.5 w-1.5 rounded-full transition-all",
                      active === s.id
                        ? "bg-primary shadow-[0_0_8px_hsl(var(--primary))]"
                        : "bg-white/25 group-hover:bg-white/50",
                    )}
                  />
                  {s.label}
                </button>
              </li>
            ))}
          </ul>
        </nav>
      </aside>

      {/* Mobile button */}
      <div className="fixed bottom-5 right-4 z-30 lg:hidden">
        <button
          onClick={() => setOpen((v) => !v)}
          aria-expanded={open}
          aria-label="Jump to section"
          className="glass flex items-center gap-2 rounded-full border border-white/10 px-4 py-2 text-xs text-foreground"
        >
          {open ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
          {open ? "Close" : "Sections"}
        </button>
        {open && (
          <div className="glass mt-2 w-56 rounded-2xl border border-white/10 p-2 animate-fade-in">
            <ul className="flex flex-col">
              {sections.map((s) => (
                <li key={s.id}>
                  <button
                    onClick={() => jump(s.id)}
                    className={cn(
                      "w-full rounded-lg px-3 py-2 text-left text-sm transition-colors",
                      active === s.id
                        ? "bg-primary/15 text-foreground"
                        : "text-muted-foreground hover:bg-white/5 hover:text-foreground",
                    )}
                  >
                    {s.label}
                  </button>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </>
  );
}

// ---- Sections ---------------------------------------------------------

function Philosophy() {
  return (
    <Section
      id="philosophy"
      eyebrow="Teaching Philosophy"
      title="Learning that begins with a real star"
      intro="An approach grounded in observational evidence, reproducible practice and patient dialogue — shaped by years of working with real telescope data."
    >
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {philosophyPillars.map((p) => (
          <GlassPanel key={p.title} className="h-full">
            <p.icon className="h-5 w-5 text-primary" />
            <h3 className="mt-3 font-display text-lg font-semibold">{p.title}</h3>
            <p className="mt-2 text-sm text-muted-foreground">{p.body}</p>
          </GlassPanel>
        ))}
      </div>

      <div className="mt-8 overflow-x-auto">
        <div className="glass min-w-[720px] rounded-2xl border border-white/10 p-6">
          <div className="mb-3 font-mono text-[10px] uppercase tracking-[0.24em] text-primary/80">
            The chain of scientific learning
          </div>
          <div className="flex items-center justify-between gap-3 text-xs">
            {["Question", "Observation", "Evidence", "Interpretation", "Communication"].map((s, i, arr) => (
              <div key={s} className="flex flex-1 items-center gap-3">
                <div className="flex flex-col items-center">
                  <div className="flex h-9 w-9 items-center justify-center rounded-full border border-primary/40 bg-primary/10 font-mono text-[10px] text-primary">
                    {i + 1}
                  </div>
                  <div className="mt-2 text-center text-muted-foreground">{s}</div>
                </div>
                {i < arr.length - 1 && (
                  <div className="h-px flex-1 bg-gradient-to-r from-primary/40 to-transparent" />
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </Section>
  );
}

function Experience() {
  return (
    <Section
      id="experience"
      eyebrow="Verified Teaching Experience"
      title="Undergraduate physics at the University of Calcutta"
      intro="Formal lecturing and laboratory instruction, alongside undergraduate academic assessment responsibilities."
    >
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-4">
          {teachingExperience.map((e) => (
            <GlassPanel key={e.role}>
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <div className="font-mono text-[10px] uppercase tracking-[0.24em] text-primary/80">
                    {e.kind}
                  </div>
                  <h3 className="mt-1 font-display text-xl font-semibold">{e.role}</h3>
                  <div className="text-sm text-muted-foreground">
                    {e.institution} · {e.affiliation}
                  </div>
                </div>
                <div className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[11px] text-muted-foreground">
                  {e.period}
                </div>
              </div>
              <div className="mt-4 grid gap-4 md:grid-cols-2">
                <div>
                  <div className="text-[10px] uppercase tracking-[0.24em] text-primary/70">
                    Courses & topics
                  </div>
                  <ul className="mt-2 space-y-1.5 text-sm text-muted-foreground">
                    {e.topics.map((t) => (
                      <li key={t} className="flex gap-2">
                        <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-primary/60" />
                        <span>{t}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                <div>
                  <div className="text-[10px] uppercase tracking-[0.24em] text-primary/70">
                    Responsibilities
                  </div>
                  <ul className="mt-2 space-y-1.5 text-sm text-muted-foreground">
                    {e.responsibilities.map((r) => (
                      <li key={r} className="flex gap-2">
                        <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-primary/60" />
                        <span>{r}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
              <div className="mt-4 flex flex-wrap gap-2 text-[11px]">
                <span className="rounded-full border border-white/10 bg-white/5 px-2.5 py-0.5 text-muted-foreground">
                  Level: {e.level}
                </span>
              </div>
            </GlassPanel>
          ))}
        </div>

        <div className="space-y-4">
          <div className="text-[10px] uppercase tracking-[0.24em] text-primary/80">
            Academic assessment & service
          </div>
          {assessmentRoles.map((a) => (
            <GlassPanel key={a.title}>
              <a.icon className="h-4 w-4 text-primary" />
              <h4 className="mt-2 font-display text-base font-semibold">{a.title}</h4>
              <p className="mt-1.5 text-sm text-muted-foreground">{a.body}</p>
            </GlassPanel>
          ))}
        </div>
      </div>
    </Section>
  );
}

function Mentoring() {
  return (
    <Section
      id="mentoring"
      eyebrow="Mentoring & Student Guidance"
      title="Master's-level research project mentorship"
      intro="Supervised two Master's-level Summer Research Programme projects in 2026. Formal PhD supervision is not claimed — these are research mentoring engagements at the Master's level."
    >
      <div className="grid gap-4 md:grid-cols-2">
        {mentorship.map((m) => (
          <div
            key={m.student}
            className="group relative overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-br from-white/[0.04] to-white/[0.01] p-6 transition-all hover:-translate-y-0.5 hover:border-primary/30"
          >
            <div className="absolute -right-8 -top-8 h-32 w-32 rounded-full bg-primary/10 blur-2xl transition-opacity group-hover:opacity-70" />
            <div className="relative">
              <div className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.24em] text-primary/80">
                <GraduationCap className="h-3.5 w-3.5" />
                {m.programme}
              </div>
              <h3 className="mt-2 font-display text-lg font-semibold">{m.student}</h3>
              <div className="mt-1 text-sm text-muted-foreground">{m.background}</div>
              <div className="mt-4 inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-[11px] text-primary">
                <Users className="h-3 w-3" /> {m.role}
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-6 rounded-2xl border border-white/10 bg-white/[0.02] p-5 text-sm text-muted-foreground">
        <strong className="text-foreground">Mentoring scope.</strong> Research
        discussion, guidance on stellar time-series and spectroscopic analysis,
        support with scientific writing and presentation preparation, and
        orientation to the instruments and archives used in the group's work.
      </div>
    </Section>
  );
}

function Methods() {
  return (
    <Section
      id="methods"
      eyebrow="Methods & Tools for Training"
      title="What students learn — and why it matters"
      intro="Every tool in this catalogue is one Diya uses actively in her own observational research on M-dwarf magnetic activity."
    >
      <div className="grid gap-4 md:grid-cols-2">
        {methodGroups.map((g) => (
          <GlassPanel key={g.heading}>
            <div className="flex items-center gap-2">
              <g.icon className="h-4 w-4 text-primary" />
              <h3 className="font-display text-base font-semibold">{g.heading}</h3>
            </div>
            <ul className="mt-4 space-y-3">
              {g.items.map((it) => (
                <li key={it.name} className="border-l border-primary/30 pl-3">
                  <div className="text-sm font-medium">{it.name}</div>
                  <div className="text-xs text-muted-foreground">{it.note}</div>
                </li>
              ))}
            </ul>
          </GlassPanel>
        ))}
      </div>
    </Section>
  );
}

function Pathway() {
  return (
    <Section
      id="pathway"
      eyebrow="Research-to-Teaching Connection"
      title="A learning pathway drawn from real observations"
      intro="How a scientific question becomes a mentored research project — the same sequence Diya follows in her own work with TESS, HCT, DOT and uGMRT data."
    >
      <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-black/30 p-6 md:p-8">
        <div
          className="pointer-events-none absolute inset-0 opacity-40"
          style={{
            background:
              "radial-gradient(600px 200px at 20% 30%, hsl(var(--primary) / 0.15), transparent 60%), radial-gradient(500px 200px at 80% 70%, hsl(var(--nebula) / 0.15), transparent 60%)",
          }}
          aria-hidden
        />
        <ol className="relative grid gap-3 md:grid-cols-4">
          {researchToTeaching.map((s, i) => (
            <li key={s.step} className="relative">
              <div className="glass flex h-full flex-col rounded-xl border border-white/10 p-4">
                <div className="flex items-center gap-2">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full border border-primary/40 bg-primary/10 font-mono text-[10px] text-primary">
                    {String(i + 1).padStart(2, "0")}
                  </div>
                  <s.icon className="h-4 w-4 text-primary/80" />
                </div>
                <div className="mt-3 font-display text-sm font-semibold">{s.step}</div>
              </div>
            </li>
          ))}
        </ol>
      </div>
    </Section>
  );
}

function Environments() {
  return (
    <Section
      eyebrow="Learning Environments"
      title="Where scientific learning actually happens"
      intro="Documented settings from Diya's academic path, and the mentoring contexts in which she now works with students."
    >
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {learningEnvironments.map((e) => (
          <GlassPanel key={e.title} className="h-full">
            <e.icon className="h-5 w-5 text-primary" />
            <h3 className="mt-3 font-display text-base font-semibold">{e.title}</h3>
            <p className="mt-2 text-sm text-muted-foreground">{e.body}</p>
          </GlassPanel>
        ))}
      </div>
    </Section>
  );
}

function Highlights() {
  return (
    <Section
      eyebrow="Selected Highlights"
      title="Verified teaching & mentoring record"
      intro="Numbers reflect what appears in Diya's CV — nothing more."
    >
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {highlights.map((h) => (
          <div
            key={h.label}
            className="rounded-2xl border border-white/10 bg-gradient-to-br from-white/[0.04] to-transparent p-6 text-center"
          >
            <div className="font-display text-3xl font-semibold text-grad-accent">{h.value}</div>
            <div className="mt-2 text-xs text-muted-foreground">{h.label}</div>
          </div>
        ))}
      </div>
    </Section>
  );
}

// ---- Constellation visual --------------------------------------------

function Constellation() {
  const svgRef = useRef<SVGSVGElement>(null);
  const [hover, setHover] = useState<string | null>(null);
  const nodeMap = useMemo(
    () => Object.fromEntries(constellationNodes.map((n) => [n.id, n])),
    [],
  );

  return (
    <Section
      eyebrow="Knowledge Constellation"
      title="How curiosity becomes discovery"
      intro="A quiet map of the ideas that connect research to mentoring."
    >
      <div className="grid gap-6 lg:grid-cols-[1.5fr_1fr]">
        <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-black/40 p-2">
          <svg
            ref={svgRef}
            viewBox="0 0 100 100"
            role="img"
            aria-label="Knowledge constellation linking curiosity, observation, data, analysis, interpretation, communication, mentoring and discovery."
            className="h-[420px] w-full motion-reduce:animate-none"
          >
            {constellationEdges.map(([a, b], i) => {
              const na = nodeMap[a];
              const nb = nodeMap[b];
              const active = hover && (hover === a || hover === b);
              return (
                <line
                  key={i}
                  x1={na.x}
                  y1={na.y}
                  x2={nb.x}
                  y2={nb.y}
                  stroke="hsl(var(--primary))"
                  strokeOpacity={active ? 0.75 : 0.25}
                  strokeWidth={active ? 0.35 : 0.2}
                />
              );
            })}
            {constellationNodes.map((n) => {
              const isCenter = n.id === "discovery";
              const active = hover === n.id;
              return (
                <g
                  key={n.id}
                  onMouseEnter={() => setHover(n.id)}
                  onMouseLeave={() => setHover(null)}
                  onFocus={() => setHover(n.id)}
                  onBlur={() => setHover(null)}
                  tabIndex={0}
                  className="cursor-pointer focus:outline-none"
                >
                  <circle
                    cx={n.x}
                    cy={n.y}
                    r={isCenter ? 2.4 : active ? 1.6 : 1.2}
                    fill={isCenter ? "hsl(var(--primary))" : "white"}
                    fillOpacity={isCenter ? 1 : active ? 1 : 0.85}
                  />
                  <circle
                    cx={n.x}
                    cy={n.y}
                    r={isCenter ? 4.5 : 3}
                    fill="hsl(var(--primary))"
                    fillOpacity={active ? 0.25 : 0.1}
                  />
                  <text
                    x={n.x}
                    y={n.y - 3.5}
                    textAnchor="middle"
                    fontSize="2.4"
                    fill="white"
                    fillOpacity={active || isCenter ? 0.95 : 0.7}
                  >
                    {n.label}
                  </text>
                </g>
              );
            })}
          </svg>
        </div>

        {/* Mobile-friendly alternative list */}
        <div className="space-y-3">
          <div className="font-mono text-[10px] uppercase tracking-[0.24em] text-primary/80">
            Nodes in the network
          </div>
          <ul className="grid grid-cols-2 gap-2 text-sm">
            {constellationNodes.map((n) => (
              <li
                key={n.id}
                className={cn(
                  "rounded-lg border border-white/10 bg-white/[0.03] px-3 py-2 transition-colors",
                  hover === n.id && "border-primary/50 bg-primary/10 text-foreground",
                )}
                onMouseEnter={() => setHover(n.id)}
                onMouseLeave={() => setHover(null)}
              >
                {n.label}
              </li>
            ))}
          </ul>
          <p className="text-xs text-muted-foreground">
            Discovery sits at the centre — connected to every other node,
            because it depends on all of them.
          </p>
        </div>
      </div>
    </Section>
  );
}

function Vision() {
  return (
    <Section
      id="vision"
      eyebrow="Future Teaching & Mentoring Vision"
      title="Where this practice is heading"
      intro="Framed as academic aspiration, drawing on Diya's observational, computational and mentoring experience so far."
    >
      <div className="grid gap-3 md:grid-cols-2">
        {visionPoints.map((v, i) => (
          <div
            key={i}
            className="flex items-start gap-3 rounded-xl border border-white/10 bg-white/[0.02] p-4"
          >
            <div className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-primary/40 bg-primary/10 font-mono text-[10px] text-primary">
              {String(i + 1).padStart(2, "0")}
            </div>
            <p className="text-sm text-muted-foreground">{v}</p>
          </div>
        ))}
      </div>
    </Section>
  );
}

function Connections() {
  return (
    <Section
      id="connections"
      eyebrow="Connections"
      title="Continue exploring"
      intro="Related chapters of the portfolio that give this teaching practice its scientific context."
    >
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {crossLinks.map((c) => (
          <Link
            key={c.to}
            to={c.to}
            className="group relative overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-br from-white/[0.04] to-white/[0.01] p-6 transition-all hover:-translate-y-0.5 hover:border-primary/40"
          >
            <div className="absolute -right-10 -top-10 h-32 w-32 rounded-full bg-primary/10 blur-2xl transition-opacity duration-300 group-hover:opacity-80" />
            <c.icon className="relative h-5 w-5 text-primary" />
            <div className="relative mt-4 font-display text-lg font-semibold">{c.title}</div>
            <p className="relative mt-2 text-sm text-muted-foreground">{c.body}</p>
            <div className="relative mt-4 inline-flex items-center gap-1.5 text-xs text-primary opacity-80 transition-opacity group-hover:opacity-100">
              Visit
              <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
            </div>
          </Link>
        ))}
      </div>
    </Section>
  );
}

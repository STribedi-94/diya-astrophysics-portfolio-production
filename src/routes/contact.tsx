import { useEffect, useRef, useState } from "react";
import { createFileRoute, Link, useRouterState } from "@tanstack/react-router";
import {
  Building2,
  Check,
  Copy,
  ExternalLink,
  Mail,
  MapPin,
  Send,
  UserRound,
} from "lucide-react";
import { Section } from "@/components/layout/Page";
import { profileLinks } from "@/data/about";
import { contactIdentity, privacyNote, reviewLinks } from "@/data/contact";
import { ContactForm } from "@/components/contact/ContactForm";

export const Route = createFileRoute("/contact")({
  head: () => ({
    meta: [
      { title: "Contact & Academic Enquiries — Diya Ram" },
      {
        name: "description",
        content:
          "Contact Diya Ram, observational astrophysicist, for research collaboration, invited talks, peer review and academic enquiries on M-dwarf magnetic activity.",
      },
      { property: "og:title", content: "Contact & Academic Enquiries — Diya Ram" },
      {
        property: "og:description",
        content:
          "Reach Diya Ram for research collaboration, observing campaigns, invited talks and academic enquiries in observational stellar astrophysics.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: ContactPage,
});

function CompactHero() {
  return (
    <section className="relative overflow-hidden pt-28 pb-10 md:pt-32 md:pb-12">
      <div className="absolute inset-0 bg-grad-hero opacity-60" aria-hidden />
      <div className="absolute inset-0 starfield-sparse opacity-50" aria-hidden />
      <div className="absolute inset-0 grid-cosmic opacity-25" aria-hidden />
      <div
        className="pointer-events-none absolute -top-32 left-1/2 h-[320px] w-[720px] max-w-[130vw] -translate-x-1/2 rounded-full opacity-30 blur-3xl"
        style={{ background: "radial-gradient(closest-side, var(--nebula), transparent 70%)" }}
        aria-hidden
      />
      <div className="container-page relative">
        <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 font-mono text-[10px] uppercase tracking-[0.24em] text-primary/90">
          <span className="h-1.5 w-1.5 rounded-full bg-primary anim-pulse-slow" />
          Contact
        </div>
        <h1 className="mt-4 max-w-3xl font-display text-3xl font-semibold leading-[1.1] md:text-5xl">
          Contact &amp; <span className="text-grad-accent">Academic Enquiries</span>
        </h1>
        <p className="mt-4 max-w-2xl text-sm text-muted-foreground md:text-base">
          Whether you are interested in research collaboration, scientific discussion, conference
          invitations, peer review, academic opportunities or other professional enquiries, I would
          be pleased to hear from you.
        </p>
      </div>
    </section>
  );
}

function ContactCard() {
  const [copied, setCopied] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const email = contactIdentity.email;

  useEffect(() => () => { if (timer.current) clearTimeout(timer.current); }, []);

  const copy = async () => {
    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(email);
      } else {
        const el = document.createElement("textarea");
        el.value = email;
        document.body.appendChild(el);
        el.select();
        document.execCommand("copy");
        el.remove();
      }
      setCopied(true);
      if (timer.current) clearTimeout(timer.current);
      timer.current = setTimeout(() => setCopied(false), 2200);
    } catch {
      setCopied(false);
    }
  };

  const rows = [
    { icon: UserRound, label: "Position", value: contactIdentity.position },
    { icon: Building2, label: "Department", value: contactIdentity.department },
    { icon: Building2, label: "Institution", value: contactIdentity.institution },
    { icon: MapPin, label: "Location", value: contactIdentity.location },
  ];

  return (
    <div className="glass glow-ring rounded-2xl p-6 md:p-8">
      <div className="font-display text-2xl font-semibold">{contactIdentity.name}</div>
      <dl className="mt-5 grid gap-4 sm:grid-cols-2">
        {rows.map((r) => (
          <div key={r.label} className="flex items-start gap-3">
            <r.icon className="mt-0.5 h-4 w-4 shrink-0 text-primary" aria-hidden />
            <div className="min-w-0">
              <dt className="font-mono text-[10px] uppercase tracking-[0.2em] text-primary/70">
                {r.label}
              </dt>
              <dd className="mt-1 break-words text-sm text-muted-foreground">{r.value}</dd>
            </div>
          </div>
        ))}
      </dl>

      <div className="mt-6 rounded-xl border border-white/10 bg-white/[0.03] p-4">
        <div className="flex items-start gap-3">
          <Mail className="mt-0.5 h-4 w-4 shrink-0 text-primary" aria-hidden />
          <div className="min-w-0 flex-1">
            <div className="font-mono text-[10px] uppercase tracking-[0.2em] text-primary/70">
              Professional email
            </div>
            <a
              href={`mailto:${email}`}
              className="mt-1 block break-all text-sm text-foreground underline-offset-4 hover:underline"
            >
              {email}
            </a>
          </div>
        </div>
        <div className="mt-4 flex flex-wrap items-center gap-2.5">
          <button
            type="button"
            onClick={copy}
            className="inline-flex min-h-11 items-center gap-2 rounded-full border border-white/15 bg-white/[0.04] px-4 text-xs text-foreground transition-all hover:-translate-y-0.5 hover:border-primary/40 hover:bg-primary/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60"
          >
            {copied ? (
              <Check className="h-3.5 w-3.5 text-primary" aria-hidden />
            ) : (
              <Copy className="h-3.5 w-3.5" aria-hidden />
            )}
            Copy email
          </button>
          <a
            href={`mailto:${email}?subject=${encodeURIComponent(contactIdentity.emailSubject)}`}
            className="inline-flex min-h-11 items-center gap-2 rounded-full bg-grad-accent px-4 text-xs font-medium text-[oklch(0.12_0.04_265)] transition-all hover:brightness-110 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60"
          >
            <Send className="h-3.5 w-3.5" aria-hidden />
            Send email
          </a>
          <span aria-live="polite" className="text-xs text-primary empty:hidden">
            {copied ? "Email copied" : ""}
          </span>
        </div>
      </div>
    </div>
  );
}

function ProfileLinks() {
  return (
    <div className="glass rounded-2xl p-6 md:p-8">
      <div className="font-mono text-[10px] uppercase tracking-[0.22em] text-primary/80">
        Academic profiles
      </div>
      <p className="mt-2 text-sm text-muted-foreground">
        Verified researcher profiles — each opens in a new tab.
      </p>
      <div className="mt-4 flex flex-wrap gap-2">
        {profileLinks.map((p) => (
          <a
            key={p.url}
            href={p.url}
            target="_blank"
            rel="noopener noreferrer me"
            aria-label={p.ariaLabel}
            className="group inline-flex min-h-11 items-center gap-1.5 rounded-full border border-white/10 bg-white/[0.03] px-4 text-xs text-muted-foreground transition-all duration-200 hover:-translate-y-0.5 hover:border-primary/40 hover:bg-primary/10 hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60"
          >
            {p.label}
            <ExternalLink
              className="h-3 w-3 opacity-70 transition-transform group-hover:translate-x-0.5"
              aria-hidden
            />
          </a>
        ))}
      </div>
    </div>
  );
}

function ReviewWork() {
  return (
    <nav aria-label="Review Diya's work" className="border-y border-white/10 py-6">
      <h2 className="font-mono text-[10px] uppercase tracking-[0.22em] text-primary/80">
        Review Diya&apos;s work
      </h2>
      <ul className="mt-3 flex flex-wrap gap-x-5 gap-y-2">
        {reviewLinks.map((l) => (
          <li key={l.to}>
            <Link
              to={l.to}
              className="inline-block text-sm text-muted-foreground transition-all duration-200 hover:-translate-y-0.5 hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60"
            >
              {l.label}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}

function ContactPage() {
  const hash = useRouterState({ select: (s) => s.location.hash });

  useEffect(() => {
    if (hash !== "contact-form") return;
    const el = document.getElementById("contact-form");
    if (!el) return;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const id = window.setTimeout(
      () => el.scrollIntoView({ behavior: reduced ? "auto" : "smooth", block: "start" }),
      80,
    );
    return () => window.clearTimeout(id);
  }, [hash]);

  return (
    <>
      <CompactHero />

      <Section className="!pt-6 !pb-12 md:!pb-16">
        <div className="grid gap-6 lg:grid-cols-5">
          <div className="lg:col-span-3">
            <ContactCard />
          </div>
          <div className="lg:col-span-2">
            <ProfileLinks />
          </div>
        </div>

        <div className="mt-12">
          <ReviewWork />
        </div>
      </Section>

      <Section id="contact-form" className="!pt-0 !pb-20">
        <div className="mx-auto max-w-3xl">
          <h2 className="font-display text-2xl font-semibold md:text-3xl">
            Send a Scientific Enquiry
          </h2>
          <p className="mt-3 text-sm text-muted-foreground">
            Please share a short description of your enquiry. Messages are read personally.
          </p>
          <div className="mt-6">
            <ContactForm />
          </div>
          <p className="mt-5 text-xs leading-relaxed text-muted-foreground">{privacyNote}</p>
        </div>
      </Section>
    </>
  );
}

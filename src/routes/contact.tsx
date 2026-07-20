import { createFileRoute } from "@tanstack/react-router";
import { PageHero, Section, GlassPanel } from "@/components/layout/Page";
import { Mail, MessageSquare, Users, ExternalLink } from "lucide-react";
import { profileLinks } from "@/data/about";

export const Route = createFileRoute("/contact")({
  head: () => ({
    meta: [
      { title: "Contact — Diya Ram" },
      {
        name: "description",
        content:
          "Contact Diya Ram for research collaboration in observational astrophysics of M-dwarf stars.",
      },
    ],
  }),
  component: () => (
    <>
      <PageHero
        eyebrow="Contact"
        title={
          <>
            Open to{" "}
            <span className="text-grad-accent">
              collaboration and correspondence
            </span>
          </>
        }
        intro="Interested in coordinating a multi-wavelength campaign, discussing M-dwarf magnetic activity, or inviting a talk? Reach Diya via any of the verified researcher profiles below."
      />
      <Section>
        <div className="grid gap-6 md:grid-cols-3">
          {[
            {
              icon: Mail,
              title: "Email",
              body: "Institutional email available via the S. N. Bose National Centre directory.",
            },
            {
              icon: MessageSquare,
              title: "Talks & invitations",
              body: "Open to invited talks, seminar visits and collaboration meetings.",
            },
            {
              icon: Users,
              title: "Collaboration",
              body: "Welcoming collaboration on M-dwarf magnetic activity, flares, radio follow-up and time-domain campaigns.",
            },
          ].map((c) => (
            <GlassPanel key={c.title}>
              <c.icon className="h-5 w-5 text-primary" />
              <div className="mt-3 font-mono text-[10px] uppercase tracking-[0.24em] text-primary/80">
                {c.title}
              </div>
              <p className="mt-2 text-sm text-muted-foreground">{c.body}</p>
            </GlassPanel>
          ))}
        </div>

        <div className="glass mt-10 rounded-2xl border border-white/10 p-6 md:p-8">
          <div className="font-mono text-[10px] uppercase tracking-[0.22em] text-primary/80">
            Verified researcher profiles
          </div>
          <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
            The most reliable way to reach Diya professionally is through the
            researcher profiles below. Each opens in a new tab.
          </p>
          <div className="mt-5 flex flex-wrap gap-2">
            {profileLinks.map((p) => (
              <a
                key={p.url}
                href={p.url}
                target="_blank"
                rel="noopener noreferrer me"
                aria-label={p.ariaLabel}
                title={p.label}
                className="group inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/[0.03] px-3.5 py-2 text-xs text-muted-foreground transition-all duration-200 hover:-translate-y-0.5 hover:border-primary/40 hover:bg-primary/10 hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60"
              >
                {p.label}
                <ExternalLink className="h-3 w-3 opacity-70 transition-transform group-hover:translate-x-0.5" />
              </a>
            ))}
          </div>
        </div>
      </Section>
    </>
  ),
});


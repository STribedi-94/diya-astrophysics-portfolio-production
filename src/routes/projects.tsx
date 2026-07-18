import { createFileRoute, Link } from "@tanstack/react-router";
import { PageHero, Section } from "@/components/layout/Page";
import { projects } from "@/data/misc";
import { ArrowRight } from "lucide-react";

export const Route = createFileRoute("/projects")({
  head: () => ({
    meta: [
      { title: "Research Projects — Diya Ram" },
      { name: "description", content: "Active and planned observational astrophysics projects." },
    ],
  }),
  component: () => (
    <>
      <PageHero
        eyebrow="Projects"
        title={<>Active <span className="text-grad-accent">observational projects</span></>}
        intro="A structured view of individual research projects — each with a target, method and expected outcome."
      />
      <Section>
        <div className="grid gap-4 md:grid-cols-2">
          {projects.map((p) => (
            <Link
              key={p.id}
              to="/projects/$slug"
              params={{ slug: p.slug }}
              className="glass group rounded-2xl p-6 hover:bg-white/5"
            >
              <div className="flex items-center justify-between text-[10px] uppercase tracking-[0.24em]">
                <span className="text-primary/80">{p.status}</span>
                <span className="text-muted-foreground">{p.facilities.join(" · ")}</span>
              </div>
              <h3 className="mt-3 font-display text-xl font-semibold">{p.title}</h3>
              <p className="mt-2 text-sm text-muted-foreground">{p.question}</p>
              <div className="mt-4 inline-flex items-center gap-1.5 text-xs text-primary">
                Project details <ArrowRight className="h-3.5 w-3.5" />
              </div>
            </Link>
          ))}
        </div>
      </Section>
    </>
  ),
});

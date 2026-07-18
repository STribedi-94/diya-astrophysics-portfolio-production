import { createFileRoute } from "@tanstack/react-router";
import { PageHero, Section } from "@/components/layout/Page";
import { ResearchUniverseMap } from "@/components/visuals/ResearchUniverseMap";

export const Route = createFileRoute("/research-universe")({
  head: () => ({
    meta: [
      { title: "Research Universe — Diya Ram" },
      { name: "description", content: "An interactive constellation of Diya Ram's observational astrophysics research themes." },
    ],
  }),
  component: () => (
    <>
      <PageHero
        eyebrow="Research Universe"
        title={<>An interconnected map of <span className="text-grad-accent">observational astrophysics</span></>}
        intro="Every research node in this universe traces back to one central question: how do magnetic processes shape low-mass stars and their planets?"
      />
      <Section>
        <div className="glass rounded-3xl p-4 md:p-10">
          <ResearchUniverseMap />
        </div>
      </Section>
    </>
  ),
});

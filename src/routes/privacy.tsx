import { createFileRoute } from "@tanstack/react-router";
import { PageHero, Section, GlassPanel } from "@/components/layout/Page";

export const Route = createFileRoute("/privacy")({
  head: () => ({ meta: [{ title: "Privacy — Diya Ram" }] }),
  component: () => (
    <>
      <PageHero eyebrow="Privacy" title="Privacy policy" intro="This website does not collect personal data beyond basic anonymous analytics." />
      <Section>
        <GlassPanel>
          <div className="space-y-4 text-sm text-muted-foreground">
            <p>This is a personal academic website presenting the research work of Diya Ram.</p>
            <p>The contact form is a placeholder in the current build and does not submit or store data. When enabled, submissions will be used only to reply to your message.</p>
            <p>No advertising trackers, third-party sales, or persistent identifiers are used.</p>
          </div>
        </GlassPanel>
      </Section>
    </>
  ),
});

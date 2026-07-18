import { createFileRoute } from "@tanstack/react-router";
import { PageHero, Section, GlassPanel } from "@/components/layout/Page";
import { Mail, MessageSquare, Users } from "lucide-react";
import { site } from "@/data/site";

export const Route = createFileRoute("/contact")({
  head: () => ({
    meta: [
      { title: "Contact — Diya Ram" },
      { name: "description", content: "Contact Diya Ram for research collaboration in observational astrophysics." },
    ],
  }),
  component: () => (
    <>
      <PageHero
        eyebrow="Contact"
        title={<>Open to <span className="text-grad-accent">collaboration and correspondence</span></>}
        intro="Interested in coordinating a multi-wavelength campaign, discussing M-dwarf magnetic activity, or inviting a talk? Reach out below."
      />
      <Section>
        <div className="grid gap-6 md:grid-cols-3">
          {[
            { icon: Mail, title: "Email", body: "Verified email will be added." },
            { icon: MessageSquare, title: "Talks & invitations", body: "Open to invited talks and seminar visits." },
            { icon: Users, title: "Collaboration", body: "Welcoming collaboration on observational stellar astrophysics." },
          ].map((c) => (
            <GlassPanel key={c.title}>
              <c.icon className="h-5 w-5 text-primary" />
              <div className="mt-3 text-[10px] uppercase tracking-[0.24em] text-primary/80">{c.title}</div>
              <p className="mt-2 text-sm text-muted-foreground">{c.body}</p>
            </GlassPanel>
          ))}
        </div>

        <form
          className="glass mt-8 grid gap-4 rounded-2xl p-6 md:grid-cols-2"
          onSubmit={(e) => e.preventDefault()}
        >
          <label className="block text-sm md:col-span-1">
            <span className="text-muted-foreground">Name</span>
            <input className="mt-1 w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm outline-none focus:border-primary/60" />
          </label>
          <label className="block text-sm md:col-span-1">
            <span className="text-muted-foreground">Email</span>
            <input type="email" className="mt-1 w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm outline-none focus:border-primary/60" />
          </label>
          <label className="block text-sm md:col-span-2">
            <span className="text-muted-foreground">Affiliation</span>
            <input className="mt-1 w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm outline-none focus:border-primary/60" />
          </label>
          <label className="block text-sm md:col-span-2">
            <span className="text-muted-foreground">Message</span>
            <textarea rows={5} className="mt-1 w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm outline-none focus:border-primary/60" />
          </label>
          <div className="md:col-span-2 flex items-center justify-between text-xs text-muted-foreground">
            <span>{site.placeholder.profile.replace("Professional profile link", "Contact form submission handler")}</span>
            <button
              type="submit"
              className="rounded-full bg-grad-accent px-5 py-2.5 text-sm font-medium text-[oklch(0.12_0.04_265)]"
            >
              Send message
            </button>
          </div>
        </form>
      </Section>
    </>
  ),
});

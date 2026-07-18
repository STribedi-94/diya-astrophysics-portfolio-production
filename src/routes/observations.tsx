import { createFileRoute } from "@tanstack/react-router";
import { PageHero, Section, GlassPanel } from "@/components/layout/Page";
import { Telescope, LineChart, Radio, FileText, Database, Sparkles } from "lucide-react";

const stages = [
  { icon: Telescope, title: "Proposal & Target Selection", desc: "Identify M-dwarf targets and propose telescope time for optical, spectroscopic and radio observations." },
  { icon: LineChart, title: "Optical Monitoring", desc: "Photometric campaigns with HCT and TESS to measure rotation, spots and flares." },
  { icon: Sparkles, title: "Spectroscopy", desc: "Optical and near-infrared spectroscopy with HCT and DOT to trace chromospheric activity." },
  { icon: Radio, title: "Radio Follow-up", desc: "Low-frequency observations with uGMRT to detect coherent and incoherent radio emission." },
  { icon: Database, title: "Data Reduction & Analysis", desc: "End-to-end pipelines from raw data to calibrated light curves, spectra and radio images." },
  { icon: FileText, title: "Publication & Sharing", desc: "Peer-reviewed publication, conference presentation and community data sharing." },
];

export const Route = createFileRoute("/observations")({
  head: () => ({
    meta: [
      { title: "Observations — Diya Ram" },
      { name: "description", content: "Observational workflow from target selection to publication across optical, spectroscopic and radio wavelengths." },
    ],
  }),
  component: () => (
    <>
      <PageHero
        eyebrow="Observations"
        title={<>From <span className="text-grad-accent">photon to publication</span></>}
        intro="A structured multi-wavelength workflow that connects telescope time on uGMRT, HCT and DOT to peer-reviewed science."
      />
      <Section>
        <ol className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {stages.map((s, i) => (
            <li key={s.title} className="glass rounded-2xl p-6">
              <div className="flex items-center justify-between">
                <span className="font-display text-3xl font-semibold text-grad-accent">{String(i + 1).padStart(2, "0")}</span>
                <s.icon className="h-5 w-5 text-primary" />
              </div>
              <h3 className="mt-3 font-display text-lg font-semibold">{s.title}</h3>
              <p className="mt-2 text-sm text-muted-foreground">{s.desc}</p>
            </li>
          ))}
        </ol>
      </Section>
      <Section eyebrow="Wavelengths" title="Complementary spectral windows">
        <div className="grid gap-4 md:grid-cols-3">
          {[
            { name: "Optical", detail: "0.35 – 1.0 µm", desc: "Photometry, spectroscopy, flare monitoring." },
            { name: "Near-infrared", detail: "1.0 – 2.5 µm", desc: "Magnetically-sensitive spectral diagnostics." },
            { name: "Radio", detail: "Metre wavelengths", desc: "Coherent stellar emission with uGMRT." },
          ].map((w) => (
            <GlassPanel key={w.name}>
              <div className="text-[10px] uppercase tracking-[0.24em] text-primary/80">{w.name}</div>
              <div className="mt-2 font-display text-2xl">{w.detail}</div>
              <p className="mt-2 text-sm text-muted-foreground">{w.desc}</p>
            </GlassPanel>
          ))}
        </div>
      </Section>
    </>
  ),
});

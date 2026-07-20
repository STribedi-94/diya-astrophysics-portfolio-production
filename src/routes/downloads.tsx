import { createFileRoute } from "@tanstack/react-router";
import { PageHero, Section, GlassPanel } from "@/components/layout/Page";
import { FileText, Download } from "lucide-react";
import cvAsset from "@/assets/diya-ram-cv.pdf.asset.json";

type DownloadCard = {
  id: string;
  title: string;
  category: string;
  description: string;
  url: string;
  filename: string;
  size: string;
  updated: string;
};

const formatSize = (bytes: number) => {
  if (bytes >= 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  return `${Math.round(bytes / 1024)} KB`;
};

const documents: DownloadCard[] = [
  {
    id: "cv",
    title: "Curriculum Vitae",
    category: "Academic",
    description:
      "Full CV of Diya Ram — education, research, telescope allocations, publications and service.",
    url: cvAsset.url,
    filename: "Diya-Ram-CV.pdf",
    size: formatSize(cvAsset.size),
    updated: new Date(cvAsset.created_at).toLocaleDateString("en-GB", {
      day: "numeric",
      month: "long",
      year: "numeric",
    }),
  },
];

export const Route = createFileRoute("/downloads")({
  head: () => ({
    meta: [
      { title: "Downloads — Diya Ram" },
      {
        name: "description",
        content:
          "Download Diya Ram's curriculum vitae and related research documents.",
      },
    ],
  }),
  component: () => (
    <>
      <PageHero
        eyebrow="Downloads"
        title={
          <>
            Curriculum vitae &{" "}
            <span className="text-grad-accent">document library</span>
          </>
        }
        intro="Verified documents from Diya Ram's academic and research record."
      />
      <Section>
        <div className="grid gap-4 md:grid-cols-2">
          {documents.map((d) => (
            <GlassPanel key={d.id}>
              <div className="flex items-start gap-4">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-white/10 bg-white/[0.04] text-primary">
                  <FileText className="h-5 w-5" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="font-mono text-[10px] uppercase tracking-[0.24em] text-primary/80">
                    {d.category}
                  </div>
                  <h3 className="mt-1.5 font-display text-lg font-semibold">
                    {d.title}
                  </h3>
                  <p className="mt-2 text-sm text-muted-foreground">
                    {d.description}
                  </p>
                  <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 font-mono text-[10.5px] uppercase tracking-[0.18em] text-muted-foreground/80">
                    <span>PDF · {d.size}</span>
                    <span>Updated {d.updated}</span>
                  </div>
                </div>
              </div>
              <div className="mt-5 flex justify-end">
                <a
                  href={d.url}
                  download={d.filename}
                  className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-4 py-2 text-xs font-medium text-foreground transition-all hover:-translate-y-0.5 hover:border-primary/50 hover:bg-primary/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60"
                  aria-label={`Download ${d.title} (PDF, ${d.size})`}
                >
                  <Download className="h-3.5 w-3.5" />
                  Download PDF
                </a>
              </div>
            </GlassPanel>
          ))}
        </div>
      </Section>
    </>
  ),
});

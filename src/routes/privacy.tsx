import { useEffect, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import {
  BookMarked,
  Copyright,
  Download,
  ExternalLink,
  Globe2,
  Lock,
  Mail,
  Scale,
  Shield,
  ShieldCheck,
} from "lucide-react";
import { PageHero, Section, GlassPanel } from "@/components/layout/Page";
import {
  POLICY_LAST_UPDATED_LABEL,
  COPYRIGHT_SECTION_ID,
  privacySections,
} from "@/data/legal";
import { contactIdentity } from "@/data/contact";
import { cn } from "@/lib/utils";

const TITLE = "Privacy Policy | Diya Ram — Observational Astrophysicist";
const DESCRIPTION =
  "Privacy, data handling, scientific-content usage, citation, copyright and intellectual-property policy for Diya Ram's astrophysics research portfolio.";

export const Route = createFileRoute("/privacy")({
  head: () => ({
    meta: [
      { title: TITLE },
      { name: "description", content: DESCRIPTION },
      { property: "og:title", content: TITLE },
      { property: "og:description", content: DESCRIPTION },
      { property: "og:type", content: "website" },
      { property: "og:url", content: "https://astro-diya-portfolio.lovable.app/privacy" },
      { name: "twitter:card", content: "summary" },
    ],
    links: [{ rel: "canonical", href: "https://astro-diya-portfolio.lovable.app/privacy" }],
  }),
  component: PrivacyPage,
});

function PrivacySectionNavigation() {
  const [active, setActive] = useState<string>(privacySections[0].id);

  useEffect(() => {
    const els = privacySections
      .map((s) => document.getElementById(s.id))
      .filter((el): el is HTMLElement => Boolean(el));
    if (!els.length) return;
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top)[0];
        if (visible) setActive(visible.target.id);
      },
      { rootMargin: "-96px 0px -70% 0px", threshold: 0 },
    );
    els.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  return (
    <nav aria-label="On this page" className="min-w-0 max-w-full lg:sticky lg:top-28">
      <div className="mb-3 font-mono text-[10px] uppercase tracking-[0.22em] text-primary/80">
        On this page
      </div>
      <ul className="-mx-1 flex gap-2 overflow-x-auto px-1 pb-2 lg:mx-0 lg:flex-col lg:gap-1 lg:overflow-visible lg:px-0 lg:pb-0">
        {privacySections.map((s) => (
          <li key={s.id} className="shrink-0 lg:shrink">
            <a
              href={`#${s.id}`}
              aria-current={active === s.id ? "true" : undefined}
              className={cn(
                "block whitespace-nowrap rounded-full border px-3 py-1.5 text-xs transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60 lg:whitespace-normal lg:rounded-lg",
                active === s.id
                  ? "border-primary/40 bg-primary/10 text-foreground"
                  : "border-white/10 bg-white/[0.03] text-muted-foreground hover:text-foreground",
              )}
            >
              {s.label}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
}

function Block({
  id,
  icon: Icon,
  title,
  children,
}: {
  id: string;
  icon: React.ElementType;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section id={id} className="scroll-mt-28">
      <GlassPanel className="p-6 md:p-8">
        <div className="flex items-start gap-3">
          <span className="mt-0.5 grid h-9 w-9 shrink-0 place-items-center rounded-lg border border-white/10 bg-white/[0.05] text-primary">
            <Icon className="h-4 w-4" aria-hidden />
          </span>
          <h2 className="font-display text-xl font-semibold md:text-2xl">{title}</h2>
        </div>
        <div className="mt-5 space-y-4 text-sm leading-relaxed text-muted-foreground md:text-[15px]">
          {children}
        </div>
      </GlassPanel>
    </section>
  );
}

function List({ items }: { items: string[] }) {
  return (
    <ul className="ml-4 list-disc space-y-1.5 marker:text-primary/60">
      {items.map((i) => (
        <li key={i}>{i}</li>
      ))}
    </ul>
  );
}

function PrivacyPage() {
  return (
    <main>
      <PageHero
        eyebrow="Transparency & Academic Integrity"
        title={
          <span className="flex items-center gap-4">
            <ShieldCheck className="hidden h-10 w-10 text-primary/80 md:block" aria-hidden />
            Privacy Policy
          </span>
        }
        intro="How visitor information, academic enquiries, scientific materials, citation requirements and intellectual property are handled across this research portfolio."
      >
        <p className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-4 py-1.5 font-mono text-[11px] uppercase tracking-[0.16em] text-muted-foreground">
          Last updated · {POLICY_LAST_UPDATED_LABEL}
        </p>
      </PageHero>

      <Section>
        <div className="grid gap-10 lg:grid-cols-[240px_minmax(0,1fr)] lg:gap-12">
          <PrivacySectionNavigation />

          <div className="min-w-0 space-y-6">
            <Block id="overview" icon={Shield} title="Privacy Philosophy">
              <p>
                This website exists to support scientific communication, public understanding of
                astrophysics, academic collaboration, research dissemination, education and
                professional networking. It is a personal academic portfolio, not a commercial
                platform.
              </p>
              <p>
                A data-minimisation approach is followed throughout. Only information reasonably
                required for website operation, security, visitor experience, anonymous statistics
                and communication is processed. No formal certification or accreditation is claimed,
                and no system can be described as entirely risk-free.
              </p>
            </Block>

            <Block id="information" icon={Lock} title="Information Processed">
              <div className="grid gap-5 md:grid-cols-2">
                <div className="rounded-xl border border-white/10 bg-white/[0.03] p-5">
                  <h3 className="font-display text-base font-semibold text-foreground">
                    Technical and usage information
                  </h3>
                  <p className="mt-3">Limited technical information may be processed in order to:</p>
                  <div className="mt-2">
                    <List
                      items={[
                        "Deliver the website correctly",
                        "Adapt layouts to screen size and device capabilities",
                        "Support responsive behaviour",
                        "Maintain browser compatibility",
                        "Diagnose technical errors",
                        "Protect the website from abuse",
                        "Measure anonymous website usage",
                        "Improve loading performance and usability",
                      ]}
                    />
                  </div>
                  <p className="mt-3">Such information may include:</p>
                  <div className="mt-2">
                    <List
                      items={[
                        "Browser type",
                        "Device category",
                        "Operating system",
                        "Approximate screen characteristics",
                        "Referring page",
                        "Requested pages",
                        "General geographic region derived from network information",
                        "Date and time of access",
                        "Performance and security logs",
                      ]}
                    />
                  </div>
                  <p className="mt-3">
                    Precise satellite or GPS location is not collected, sensitive personal
                    information is not sought, and not every field listed above is necessarily
                    recorded or retained in every case.
                  </p>
                </div>

                <div className="rounded-xl border border-white/10 bg-white/[0.03] p-5">
                  <h3 className="font-display text-base font-semibold text-foreground">
                    Information voluntarily submitted
                  </h3>
                  <p className="mt-3">
                    Visitors who choose to write through the contact channel may provide:
                  </p>
                  <div className="mt-2">
                    <List
                      items={[
                        "Name",
                        "Email address",
                        "Enquiry category or purpose",
                        "Message content",
                        "Any other information voluntarily included in the message",
                      ]}
                    />
                  </div>
                  <p className="mt-3">
                    Please do not submit unnecessary sensitive personal information — such as
                    identity-document numbers, financial details, health information or
                    confidential third-party data — through the contact form. Academic and
                    professional enquiries are preferred.
                  </p>
                </div>
              </div>
            </Block>

            <Block id="use-of-information" icon={Globe2} title="How Information Is Used">
              <p>
                Information is used only for legitimate website and academic purposes, including:
              </p>
              <List
                items={[
                  "Responding to academic, research, collaboration, teaching, media, speaking or professional enquiries",
                  "Maintaining website security and service reliability",
                  "Diagnosing technical problems",
                  "Improving accessibility, compatibility, navigation and performance",
                  "Understanding aggregate and anonymous visitor engagement",
                  "Protecting the website and its materials from misuse",
                ]}
              />
              <div className="rounded-xl border border-primary/25 bg-primary/[0.07] p-5 text-foreground">
                <p className="font-medium">In clear terms:</p>
                <div className="mt-2 text-muted-foreground">
                  <List
                    items={[
                      "Personal information is not sold.",
                      "Personal information is not rented.",
                      "Personal information is not used for behavioural advertising.",
                      "No advertising profiles are created.",
                      "Contact details are not added to marketing lists without explicit consent.",
                      "Intrusive cross-site tracking is not intentionally used.",
                    ]}
                  />
                </div>
              </div>
            </Block>

            <Block id="contact-communication" icon={Mail} title="Contact and Communication">
              <p>
                The contact form is an official communication channel for this research portfolio.
                Information submitted through it is used solely to:
              </p>
              <List
                items={[
                  "Review the enquiry",
                  "Reply to the sender",
                  "Maintain necessary correspondence",
                  "Protect the communication channel from spam, fraud or misuse",
                ]}
              />
              <p>
                Correspondence may be retained only as reasonably necessary for communication,
                professional record-keeping, security, dispute resolution or legal obligations.
                Messages sent directly by email are handled under the same principles.
              </p>
            </Block>

            <Block id="technical-data" icon={Lock} title="Cookies and Technical Operations">
              <p>
                Limited technical storage or comparable browser mechanisms may be used only where
                reasonably necessary for:
              </p>
              <List
                items={[
                  "Essential website functionality",
                  "Remembering non-sensitive interface state",
                  "Session-specific website behaviour, such as showing an introduction sequence once per session",
                  "Security",
                  "Performance",
                  "Accessibility",
                  "Device-friendly and responsive presentation",
                ]}
              />
              <p>
                Advertising cookies are not used, and invasive cross-site behavioural tracking is
                not intentionally deployed.
              </p>
            </Block>

            <Block id="research-statistics" icon={Globe2} title="Anonymous Research Statistics">
              <p>Aggregate statistics about the portfolio may include:</p>
              <List
                items={[
                  "Total visits",
                  "Broad country or regional distribution",
                  "Research sessions",
                  "Page-level engagement",
                  "Device category",
                  "General performance indicators",
                ]}
              />
              <p>
                These statistics exist to understand public engagement with the research portfolio,
                improve website quality and maintain reliable delivery. They are aggregate website
                metrics and are not intended to identify individual visitors.
              </p>
            </Block>

            <Block id="research-materials" icon={Download} title="Downloads and Research Materials">
              <p>This website may provide access to materials such as:</p>
              <List
                items={[
                  "Curriculum vitae",
                  "Research papers",
                  "Publication records",
                  "Accepted manuscripts where permitted",
                  "Posters and presentations",
                  "Scientific figures and images",
                  "Research summaries and thesis metadata",
                  "Other academic resources",
                ]}
              />
              <div className="grid gap-5 md:grid-cols-2">
                <div className="rounded-xl border border-white/10 bg-white/[0.03] p-5">
                  <h3 className="font-display text-base font-semibold text-foreground">
                    Publicly available material
                  </h3>
                  <p className="mt-2">
                    Materials intentionally made available for viewing or download may be used only
                    within the permissions granted by the copyright owner, publisher, licence or
                    applicable law.
                  </p>
                </div>
                <div className="rounded-xl border border-white/10 bg-white/[0.03] p-5">
                  <h3 className="font-display text-base font-semibold text-foreground">
                    Restricted or third-party material
                  </h3>
                  <p className="mt-2">
                    Some materials are metadata-only, preview-only, access-restricted,
                    publisher-controlled, or copyrighted by journals, institutions, collaborators,
                    photographers or archives. The presence of a title, thumbnail, abstract,
                    citation, preview or external link does not transfer ownership or grant
                    unrestricted reuse rights.
                  </p>
                </div>
              </div>
            </Block>

            <Block id="external-services" icon={ExternalLink} title="External Links and Third-Party Services">
              <p>
                This website links to external academic and professional resources, including
                organisations and services such as NASA, ESA, ISRO, ARIES, NASA ADS, ORCID, Google
                Scholar, ResearchGate, LinkedIn, journal publishers, DOI resolvers, research
                institutes and observatory websites.
              </p>
              <p>
                External websites operate under their own privacy policies, cookie policies,
                copyright terms, accessibility practices and security controls. Opening an external
                link means leaving this website. External links open in a new tab with safe
                <code className="mx-1 rounded bg-white/[0.06] px-1 py-0.5 font-mono text-[11px]">
                  rel="noopener noreferrer"
                </code>
                behaviour.
              </p>
            </Block>

            <Block id="security" icon={Shield} title="Website Security">
              <p>Reasonable technical and organisational safeguards are used to support:</p>
              <List
                items={[
                  "Secure delivery",
                  "Integrity of published material",
                  "Availability",
                  "Abuse prevention",
                  "Protection of submitted information",
                  "Reliable website operation",
                ]}
              />
              <p>
                No method of internet transmission or electronic storage can be guaranteed to be
                completely secure, and no absolute guarantee of security is offered.
              </p>
            </Block>

            <CopyrightCitationNotice />

            <Block id="policy-updates" icon={BookMarked} title="Policy Updates">
              <p>This policy may be revised from time to time to reflect:</p>
              <List
                items={[
                  "Legal requirements",
                  "Website operations",
                  "Security practices",
                  "Data-handling practices",
                  "Research-material availability",
                  "Academic publishing or licensing changes",
                ]}
              />
              <p>
                The revision date is shown as <strong className="text-foreground">Last updated ·{" "}
                {POLICY_LAST_UPDATED_LABEL}</strong>, consistent with the date displayed at the top
                of this page.
              </p>
            </Block>

            <Block id="policy-contact" icon={Mail} title="Privacy, Copyright and Permission Enquiries">
              <p>
                Visitors may write regarding privacy, attribution, permissions, copyright, licensing
                or correction requests. Enquiries are reviewed personally.
              </p>
              <div className="flex flex-wrap items-center gap-3 pt-1">
                <a
                  href={`mailto:${contactIdentity.email}`}
                  className="inline-flex min-h-11 items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-5 text-sm text-foreground transition-colors hover:border-primary/40 hover:bg-primary/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60"
                >
                  <Mail className="h-4 w-4 text-primary/80" aria-hidden />
                  {contactIdentity.email}
                </a>
                <Link
                  to="/contact"
                  className="inline-flex min-h-11 items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-5 text-sm text-foreground transition-colors hover:border-primary/40 hover:bg-primary/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60"
                >
                  Go to the Contact page
                </Link>
              </div>
            </Block>
          </div>
        </div>
      </Section>
    </main>
  );
}

function CopyrightCitationNotice() {
  return (
    <section id={COPYRIGHT_SECTION_ID} className="scroll-mt-28">
      <div className="relative overflow-hidden rounded-2xl border border-primary/35 bg-primary/[0.06] p-6 shadow-[0_0_60px_-30px_var(--nebula)] md:p-8">
        <div className="flex flex-wrap items-center gap-3">
          <span className="grid h-9 w-9 place-items-center rounded-lg border border-primary/30 bg-primary/10 text-primary">
            <Copyright className="h-4 w-4" aria-hidden />
          </span>
          <span className="grid h-9 w-9 place-items-center rounded-lg border border-primary/30 bg-primary/10 text-primary">
            <Scale className="h-4 w-4" aria-hidden />
          </span>
          <span className="rounded-full border border-primary/30 bg-primary/10 px-3 py-1 font-mono text-[10px] uppercase tracking-[0.18em] text-primary/90">
            Important academic-use notice
          </span>
        </div>

        <h2 className="mt-5 font-display text-2xl font-semibold md:text-3xl">
          Research Copyright, Citation &amp; Intellectual Property
        </h2>

        <div className="mt-5 space-y-6 text-sm leading-relaxed text-muted-foreground md:text-[15px]">
          <div>
            <h3 className="font-display text-base font-semibold text-foreground">
              Ownership and protection
            </h3>
            <p className="mt-2">
              Unless otherwise identified, original website text, research summaries, page
              compositions, original graphics, scientific illustrations, figures, visualisations,
              photographs, observational products, posters, presentations, downloadable materials
              and other original academic content are protected by applicable copyright and
              intellectual-property laws.
            </p>
            <p className="mt-2">
              Copyright protects original expression and presentation — not scientific facts or
              ideas in the abstract. Ownership of co-authored, institutional, publisher-hosted,
              archive-hosted, licensed or third-party material remains with the relevant rights
              holder. Publication metadata, citations, abstracts, covers, logos, observatory
              imagery, institutional names and linked materials may be governed by separate rights
              or terms.
            </p>
          </div>

          <div>
            <h3 className="font-display text-base font-semibold text-foreground">
              Academic citation requirement
            </h3>
            <p className="mt-2">
              Public availability does not remove the requirement for proper citation, attribution,
              acknowledgement, permission or licence compliance. Visitors using permitted material
              for academic, educational, research, commentary, review or other lawful purposes
              should:
            </p>
            <div className="mt-2">
              <List
                items={[
                  "Credit the correct author or rights holder",
                  "Cite the relevant paper, dataset, page, image, figure, poster, presentation or source",
                  "Preserve existing copyright, authorship, licence and citation notices",
                  "Avoid presenting another person's work as their own",
                  "Follow journal, publisher, institutional, repository and licence requirements",
                  "Obtain permission where the intended use exceeds an applicable licence or statutory exception",
                ]}
              />
            </div>
            <p className="mt-2">
              Citation and copyright permission are related but legally distinct requirements:
              citing a source does not by itself authorise every kind of reuse.
            </p>
          </div>

          <div>
            <h3 className="font-display text-base font-semibold text-foreground">
              Prohibited or restricted uses
            </h3>
            <p className="mt-2">
              Unless expressly permitted by the relevant rights holder, an applicable licence or
              applicable law, the following may require permission and may constitute infringement:
            </p>
            <div className="mt-2">
              <List
                items={[
                  "Reproducing complete works",
                  "Republishing website text or graphics",
                  "Copying figures or images",
                  "Redistributing protected files",
                  "Removing authorship or copyright notices",
                  "Modifying content in a misleading manner",
                  "Commercial use",
                  "Training, packaging or reselling protected content as a substitute product",
                  "Claiming authorship or ownership",
                  "Presenting research materials without attribution",
                  "Uploading protected files to another website or repository",
                  "Using materials in presentations, articles, books, courses, databases, media, promotional material or products beyond permitted limits",
                  "Circumventing access restrictions",
                  "Scraping or bulk harvesting protected content in violation of applicable terms or law",
                ]}
              />
            </div>
          </div>

          <div>
            <h3 className="font-display text-base font-semibold text-foreground">
              Legal and academic consequences
            </h3>
            <p className="mt-2">
              Unauthorised copying, republication, redistribution, modification, commercial
              exploitation, removal of attribution, or presentation of protected material as another
              person's work may constitute copyright infringement, breach of licence, breach of
              contract, plagiarism, academic misconduct or another legal violation, depending on the
              material, jurisdiction and manner of use.
            </p>
            <p className="mt-2">Where appropriate, responses may include:</p>
            <div className="mt-2">
              <List
                items={[
                  "A request for correction or attribution",
                  "A takedown request",
                  "Notification to a publisher, institution, repository, platform or service provider",
                  "Institutional or academic-integrity review",
                  "Exercise of legal remedies available to the relevant rights holder",
                ]}
              />
            </div>
          </div>

          <div>
            <h3 className="font-display text-base font-semibold text-foreground">
              Governing legal frameworks
            </h3>
            <div className="mt-2">
              <List
                items={[
                  "The Copyright Act, 1957 (India), as amended, including its lawful limited-use exceptions where relevant",
                  "The Berne Convention for the Protection of Literary and Artistic Works",
                  "The WIPO Copyright Treaty, where applicable",
                  "Applicable international intellectual-property principles",
                  "Publisher and journal copyright or licensing terms",
                  "Repository and archive usage terms",
                  "Institutional research-integrity and academic-misconduct policies",
                  "Any specific Creative Commons or other licence displayed with an individual item",
                ]}
              />
            </div>
            <p className="mt-2">
              Rights and permitted uses may vary according to authorship, publication agreement,
              licence, jurisdiction, institutional policy and the specific material involved.
            </p>
          </div>

          <div>
            <h3 className="font-display text-base font-semibold text-foreground">
              Fair dealing and lawful exceptions
            </h3>
            <p className="mt-2">
              Applicable copyright law may permit limited uses for purposes such as private study,
              research, criticism, review, reporting, education or other recognised exceptions.
              These exceptions are context-specific and do not create a blanket right to copy,
              republish, redistribute or commercially exploit material. Users remain responsible for
              determining whether their intended use is lawful and properly attributed.
            </p>
          </div>

          <div className="rounded-xl border border-primary/30 bg-primary/[0.08] p-5">
            <h3 className="font-display text-base font-semibold text-foreground">
              Need permission or citation guidance?
            </h3>
            <p className="mt-2">
              Requests for permission, licensing clarification, attribution corrections or citation
              guidance are welcome.
            </p>
            <div className="mt-4 flex flex-wrap gap-3">
              <Link
                to="/contact"
                className="inline-flex min-h-11 items-center gap-2 rounded-full bg-grad-accent px-5 text-sm font-medium text-[oklch(0.12_0.04_265)] transition-all hover:brightness-110 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60"
              >
                Contact Diya Ram
              </Link>
              <a
                href={`mailto:${contactIdentity.email}`}
                className="inline-flex min-h-11 items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-5 text-sm text-foreground transition-colors hover:border-primary/40 hover:bg-primary/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60"
              >
                <Mail className="h-4 w-4 text-primary/80" aria-hidden />
                {contactIdentity.email}
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet,
  Link,
  createRootRouteWithContext,
  useRouter,
  HeadContent,
  Scripts,
} from "@tanstack/react-router";
import { useEffect, type ReactNode } from "react";

import appCss from "../styles.css?url";
import { reportLovableError } from "../lib/lovable-error-reporting";
import { SiteHeader } from "../components/layout/SiteHeader";
import { SiteFooter } from "../components/layout/SiteFooter";
import { CosmicBackground } from "../components/layout/CosmicBackground";
import {
  CosmicEntrance,
  useCosmicEntrance,
  shellStyle,
} from "../components/intro/CosmicEntrance";
import { PerformanceProvider, PERF_PREPAINT } from "../lib/performance";

const ENTRANCE_PREPAINT = `(function(){try{if(location.pathname==="/"&&!sessionStorage.getItem("dr-entrance-seen")){var s=document.createElement("style");s.id="entrance-prepaint";s.textContent="html{background-color:#04060e}.app-shell{opacity:0!important}";document.head.appendChild(s)}}catch(e){}})();`;

function NotFoundComponent() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <p className="text-sm uppercase tracking-[0.3em] text-primary/80">Signal lost</p>
        <h1 className="mt-3 font-display text-7xl font-bold text-foreground">404</h1>
        <h2 className="mt-4 text-xl font-semibold text-foreground">This page is outside the observable universe</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <div className="mt-6">
          <Link
            to="/"
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Return to the universe
          </Link>
        </div>
      </div>
    </div>
  );
}

function ErrorComponent({ error, reset }: { error: Error; reset: () => void }) {
  console.error(error);
  const router = useRouter();
  useEffect(() => {
    reportLovableError(error, { boundary: "tanstack_root_error_component" });
  }, [error]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-xl font-semibold tracking-tight text-foreground">
          This page didn't load
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Something went wrong on our end. You can try refreshing or head back home.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-2">
          <button
            onClick={() => {
              router.invalidate();
              reset();
            }}
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Try again
          </button>
          <a
            href="/"
            className="inline-flex items-center justify-center rounded-md border border-input bg-background px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-accent"
          >
            Go home
          </a>
        </div>
      </div>
    </div>
  );
}

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "Diya Ram — Observational Astrophysicist" },
      {
        name: "description",
        content:
          "Diya Ram: observational astrophysicist studying magnetic activity of M-dwarf stars with uGMRT, HCT and DOT across optical, spectroscopic and radio wavelengths.",
      },
      { name: "author", content: "Diya Ram" },
      { name: "theme-color", content: "#0b1024" },
      { property: "og:title", content: "Diya Ram — Observational Astrophysicist" },
      {
        property: "og:description",
        content:
          "Diya Ram: observational astrophysicist studying magnetic activity of M-dwarf stars with uGMRT, HCT and DOT across optical, spectroscopic and radio wavelengths.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: "Diya Ram — Observational Astrophysicist" },
      { name: "twitter:description", content: "Diya Ram: observational astrophysicist studying magnetic activity of M-dwarf stars with uGMRT, HCT and DOT across optical, spectroscopic and radio wavelengths." },
      { property: "og:image", content: "https://storage.googleapis.com/gpt-engineer-file-uploads/QbxojdqJeZQI6PCz3G2jBy9jhmO2/social-images/social-1784384086675-3485.webp" },
      { name: "twitter:image", content: "https://storage.googleapis.com/gpt-engineer-file-uploads/QbxojdqJeZQI6PCz3G2jBy9jhmO2/social-images/social-1784384086675-3485.webp" },
    ],
    links: [
      { rel: "stylesheet", href: appCss },
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" },
      {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Space+Grotesk:wght@500;600;700&display=swap",
      },
    ],
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "WebSite",
          name: "Diya Ram — Observational Astrophysicist",
          url: "https://astro-diya-portfolio.lovable.app",
          about: {
            "@type": "Person",
            name: "Diya Ram",
            jobTitle: "Observational Astrophysicist",
          },
          creator: {
            "@type": "Person",
            name: "Sandipani Tribedi",
            jobTitle: "Website Creator, Designer and Developer",
            url: "https://stribedi-94.github.io/Portfolio_Website/",
          },
        }),
      },
    ],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent,
});

function RootShell({ children }: { children: ReactNode }) {
  return (
    <html lang="en" className="dark">
      <head>
        <script dangerouslySetInnerHTML={{ __html: PERF_PREPAINT }} />
        <script dangerouslySetInnerHTML={{ __html: ENTRANCE_PREPAINT }} />
        <HeadContent />
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  );
}

function RootComponent() {
  const { queryClient } = Route.useRouteContext();
  const entrance = useCosmicEntrance();

  return (
    <QueryClientProvider client={queryClient}>
      <PerformanceProvider>
        <div
          className="app-shell relative flex min-h-screen flex-col"
          style={shellStyle(entrance)}
        >
          <CosmicBackground />
          <a href="#main-content" className="skip-link">Skip to content</a>
          <SiteHeader />
          <main id="main-content" className="flex-1">
            <Outlet />
          </main>
          <SiteFooter />
        </div>
        <CosmicEntrance state={entrance} />
      </PerformanceProvider>
    </QueryClientProvider>
  );
}

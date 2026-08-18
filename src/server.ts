import "./lib/error-capture";

import { consumeLastCapturedError } from "./lib/error-capture";
import { renderErrorPage } from "./lib/error-page";

type ServerEntry = {
  fetch: (
    request: Request,
    env: unknown,
    ctx: unknown,
  ) => Promise<Response> | Response;
};

type ServiceBinding = {
  fetch: (
    input: Request | string | URL,
    init?: RequestInit,
  ) => Promise<Response>;
};

type Env = {
  CONTACT_SERVICE: ServiceBinding;
  NEWS_SERVICE: ServiceBinding;
};

let serverEntryPromise: Promise<ServerEntry> | undefined;

async function getServerEntry(): Promise<ServerEntry> {
  if (!serverEntryPromise) {
    serverEntryPromise = import(
      "@tanstack/react-start/server-entry"
    ).then(
      (m) => (m.default ?? m) as ServerEntry,
    );
  }

  return serverEntryPromise;
}

function isContactApiRequest(request: Request): boolean {
  const url = new URL(request.url);

  return url.pathname === "/api/contact";
}

function isNewsApiRequest(request: Request): boolean {
  const url = new URL(request.url);

  return url.pathname === "/api/news";
}

async function proxyContactRequest(
  request: Request,
  env: Env,
): Promise<Response> {
  if (!env.CONTACT_SERVICE) {
    console.error(
      "CONTACT_SERVICE binding is unavailable.",
    );

    return Response.json(
      {
        error:
          "The contact service is temporarily unavailable. Please try again later.",
      },
      {
        status: 503,
        headers: {
          "Cache-Control": "no-store",
          "X-Content-Type-Options": "nosniff",
        },
      },
    );
  }

  return env.CONTACT_SERVICE.fetch(request);
}

async function proxyNewsRequest(
  request: Request,
  env: Env,
): Promise<Response> {
  if (!env.NEWS_SERVICE) {
    console.error(
      "NEWS_SERVICE binding is unavailable.",
    );

    return Response.json(
      {
        items: [],
        featuredItems: [],
        pagination: {
          page: 1,
          pageSize: 12,
          totalItems: 0,
          totalPages: 1,
          hasNextPage: false,
          hasPreviousPage: false,
        },
        availableFilters: {
          sources: [],
          categories: [],
          topics: [],
          countries: [],
          missions: [],
          observatories: [],
          telescopes: [],
          newsTypes: [],
        },
        lastUpdated: new Date().toISOString(),
        status: "error",
        activeSourceCount: 0,
        failedSourceCount: 0,
        message:
          "The news service is temporarily unavailable. Please try again later.",
      },
      {
        status: 503,
        headers: {
          "Cache-Control": "no-store",
          "X-Content-Type-Options": "nosniff",
        },
      },
    );
  }

  return env.NEWS_SERVICE.fetch(request);
}

// h3 swallows in-handler throws into a normal 500 Response with body
// {"unhandled":true,"message":"HTTPError"} — try/catch alone never fires for those.
async function normalizeCatastrophicSsrResponse(
  response: Response,
): Promise<Response> {
  if (response.status < 500) return response;

  const contentType =
    response.headers.get("content-type") ?? "";

  if (!contentType.includes("application/json")) {
    return response;
  }

  const body = await response.clone().text();

  if (!isH3SwallowedErrorBody(body)) {
    return response;
  }

  console.error(
    consumeLastCapturedError() ??
      new Error(
        `h3 swallowed SSR error: ${body}`,
      ),
  );

  return new Response(renderErrorPage(), {
    status: 500,
    headers: {
      "content-type": "text/html; charset=utf-8",
    },
  });
}

function isH3SwallowedErrorBody(
  body: string,
): boolean {
  try {
    const payload = JSON.parse(body) as {
      unhandled?: unknown;
      message?: unknown;
    };

    return (
      payload.unhandled === true &&
      payload.message === "HTTPError"
    );
  } catch {
    return false;
  }
}

export default {
  async fetch(
    request: Request,
    env: Env,
    ctx: unknown,
  ) {
    try {
      /*
       * Keep the public Contact API same-origin.
       *
       * Browser:
       *   POST /api/contact
       *
       * Main Worker:
       *   astro-diya
       *
       * Dedicated backend:
       *   CONTACT_SERVICE -> astro-diya-contact
       */
      if (isContactApiRequest(request)) {
        return await proxyContactRequest(
          request,
          env,
        );
      }

      /*
       * Keep the public Astrophysics News API same-origin.
       *
       * Browser:
       *   GET /api/news
       *
       * Main Worker:
       *   astro-diya
       *
       * Dedicated backend:
       *   NEWS_SERVICE -> astro-diya-news
       *
       * D1 remains private to the dedicated News Worker.
       */
      if (isNewsApiRequest(request)) {
        return await proxyNewsRequest(
          request,
          env,
        );
      }

      const handler =
        await getServerEntry();

      const response =
        await handler.fetch(
          request,
          env,
          ctx,
        );

      return await normalizeCatastrophicSsrResponse(
        response,
      );
    } catch (error) {
      console.error(error);

      return new Response(renderErrorPage(), {
        status: 500,
        headers: {
          "content-type":
            "text/html; charset=utf-8",
        },
      });
    }
  },
};
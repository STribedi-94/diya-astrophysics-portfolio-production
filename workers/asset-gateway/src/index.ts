interface Env {
  ASSETS_BUCKET: R2Bucket;
}

const CACHE_CONTROL =
  "public, max-age=3600, s-maxage=86400, stale-while-revalidate=604800";

function securityHeaders(): HeadersInit {
  return {
    "X-Content-Type-Options": "nosniff",
    "Referrer-Policy": "no-referrer",
  };
}

function errorResponse(
  message: string,
  status: number,
  extraHeaders: HeadersInit = {},
): Response {
  return new Response(message, {
    status,
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      ...securityHeaders(),
      ...extraHeaders,
    },
  });
}

function getObjectKey(request: Request): string | null {
  const url = new URL(request.url);

  let pathname: string;

  try {
    pathname = decodeURIComponent(url.pathname);
  } catch {
    return null;
  }

  const key = pathname.replace(/^\/+/, "");

  if (!key) {
    return null;
  }

  const segments = key.split("/");

  if (
    segments.some(
      (segment) =>
        !segment ||
        segment === "." ||
        segment === ".." ||
        segment.includes("\\") ||
        segment.includes("\0"),
    )
  ) {
    return null;
  }

  return segments.join("/");
}

function applyObjectHeaders(
  headers: Headers,
  object: R2Object | R2ObjectBody,
): void {
  object.writeHttpMetadata(headers);

  headers.set("etag", object.httpEtag);
  headers.set("Cache-Control", CACHE_CONTROL);
  headers.set("Accept-Ranges", "bytes");
  headers.set("X-Content-Type-Options", "nosniff");
  headers.set("Referrer-Policy", "no-referrer");

  if (!headers.has("Content-Type")) {
    headers.set("Content-Type", "application/octet-stream");
  }
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    if (request.method !== "GET" && request.method !== "HEAD") {
      return errorResponse("Method Not Allowed", 405, {
        Allow: "GET, HEAD",
      });
    }

    const key = getObjectKey(request);

    if (!key) {
      return errorResponse("Not Found", 404);
    }

    if (request.method === "HEAD") {
      const object = await env.ASSETS_BUCKET.head(key);

      if (!object) {
        return errorResponse("Not Found", 404);
      }

      const headers = new Headers();
      applyObjectHeaders(headers, object);
      headers.set("Content-Length", String(object.size));

      return new Response(null, {
        status: 200,
        headers,
      });
    }

    const rangeHeader = request.headers.get("Range");

    const object = await env.ASSETS_BUCKET.get(
      key,
      rangeHeader
        ? {
            range: request.headers,
          }
        : undefined,
    );

    if (!object) {
      return errorResponse("Not Found", 404);
    }

    const headers = new Headers();
    applyObjectHeaders(headers, object);

    if (rangeHeader && object.range) {
      let offset: number;
      let length: number;

      if (
        "offset" in object.range &&
        "length" in object.range &&
        typeof object.range.offset === "number" &&
        typeof object.range.length === "number"
      ) {
        offset = object.range.offset;
        length = object.range.length;
      } else if (
        "suffix" in object.range &&
        typeof object.range.suffix === "number"
      ) {
        length = object.range.suffix;
        offset = object.size - length;
      } else {
        return errorResponse("Invalid Range", 416, {
          "Content-Range": `bytes */${object.size}`,
        });
      }

      const end = offset + length - 1;

      headers.set(
        "Content-Range",
        `bytes ${offset}-${end}/${object.size}`,
      );
      headers.set("Content-Length", String(length));

      return new Response(object.body, {
        status: 206,
        headers,
      });
    }

    headers.set("Content-Length", String(object.size));

    return new Response(object.body, {
      status: 200,
      headers,
    });
  },
};
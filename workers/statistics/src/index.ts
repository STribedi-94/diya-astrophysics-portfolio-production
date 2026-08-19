type D1PreparedStatement = {
  bind: (...values: unknown[]) => D1PreparedStatement;
  run: () => Promise<unknown>;
  first: <T = Record<string, unknown>>() => Promise<T | null>;
};

type D1Database = {
  prepare: (query: string) => D1PreparedStatement;
  batch: (statements: D1PreparedStatement[]) => Promise<unknown>;
};

type Env = {
  STATISTICS_DB: D1Database;
};

type CfRequest = Request & {
  cf?: {
    country?: string;
  };
};

type TrackPayload = {
  visitorId?: unknown;
  sessionId?: unknown;
};

function json(data: unknown, status = 200): Response {
  return Response.json(data, {
    status,
    headers: {
      "Cache-Control": "no-store",
      "X-Content-Type-Options": "nosniff",
    },
  });
}

function validAnonymousId(value: unknown): value is string {
  return typeof value === "string" && /^[A-Za-z0-9_-]{16,128}$/.test(value);
}

async function readCounts(db: D1Database) {
  const visitors = await db.prepare("SELECT COUNT(*) AS count FROM visitors").first<{ count: number }>();
  const countries = await db.prepare("SELECT COUNT(*) AS count FROM countries").first<{ count: number }>();
  const sessions = await db.prepare("SELECT COUNT(*) AS count FROM sessions").first<{ count: number }>();

  return {
    visitors: Number(visitors?.count ?? 0),
    countries: Number(countries?.count ?? 0),
    sessions: Number(sessions?.count ?? 0),
  };
}

async function track(request: CfRequest, env: Env): Promise<Response> {
  let payload: TrackPayload;

  try {
    payload = (await request.json()) as TrackPayload;
  } catch {
    return json({ error: "Invalid JSON body." }, 400);
  }

  if (!validAnonymousId(payload.visitorId) || !validAnonymousId(payload.sessionId)) {
    return json({ error: "Invalid anonymous visitor or session identifier." }, 400);
  }

  const now = new Date().toISOString();
  const rawCountry = request.cf?.country?.trim().toUpperCase();
  const countryCode = rawCountry && /^[A-Z]{2}$/.test(rawCountry) ? rawCountry : null;

  const statements: D1PreparedStatement[] = [
    env.STATISTICS_DB.prepare(
      `INSERT INTO visitors (visitor_id, first_seen_at, last_seen_at)
       VALUES (?, ?, ?)
       ON CONFLICT(visitor_id) DO UPDATE SET last_seen_at = excluded.last_seen_at`
    ).bind(payload.visitorId, now, now),

    env.STATISTICS_DB.prepare(
      `INSERT INTO sessions (session_id, visitor_id, country_code, started_at, last_seen_at)
       VALUES (?, ?, ?, ?, ?)
       ON CONFLICT(session_id) DO UPDATE SET last_seen_at = excluded.last_seen_at`
    ).bind(payload.sessionId, payload.visitorId, countryCode, now, now),
  ];

  if (countryCode) {
    statements.push(
      env.STATISTICS_DB.prepare(
        `INSERT INTO countries (country_code, first_seen_at, last_seen_at)
         VALUES (?, ?, ?)
         ON CONFLICT(country_code) DO UPDATE SET last_seen_at = excluded.last_seen_at`
      ).bind(countryCode, now, now),
    );
  }

  await env.STATISTICS_DB.batch(statements);

  return json(await readCounts(env.STATISTICS_DB));
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);

    if (url.pathname !== "/api/statistics") {
      return json({ error: "Not found." }, 404);
    }

    if (request.method === "GET") {
      return json(await readCounts(env.STATISTICS_DB));
    }

    if (request.method === "POST") {
      return track(request as CfRequest, env);
    }

    return new Response(null, {
      status: 405,
      headers: {
        Allow: "GET, POST",
        "Cache-Control": "no-store",
      },
    });
  },
};

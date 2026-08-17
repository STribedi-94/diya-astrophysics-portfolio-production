interface ContactNotificationMessage {
  messageId: string;
  publicReference: string;
}

interface Env {
  CONTACT_DB: D1Database;
  CONTACT_NOTIFICATION_QUEUE: Queue<ContactNotificationMessage>;
  CONTACT_RATE_LIMITER: RateLimit;

  /**
   * Secret Cloudflare Turnstile key.
   *
   * Must be stored with Wrangler / Cloudflare secret storage.
   * Never expose this value through VITE_* or browser code.
   */
  TURNSTILE_SECRET_KEY: string;

  /**
   * Public hostname expected in a successful Turnstile Siteverify response.
   *
   * Production:
   * astro-diya.mdwarf.workers.dev
   */
  TURNSTILE_HOSTNAME: string;
}

interface ContactPayload {
  name?: unknown;
  email?: unknown;
  purpose?: unknown;
  message?: unknown;
  turnstileToken?: unknown;
  honeypot?: unknown;
  formStartedAt?: unknown;
}

interface TurnstileSiteverifyResponse {
  success?: boolean;
  challenge_ts?: string;
  hostname?: string;
  action?: string;
  cdata?: string;
  "error-codes"?: string[];
}

const MAX_BODY_BYTES = 16_384;
const NAME_MAX = 100;
const EMAIL_MAX = 255;
const MESSAGE_MIN = 30;
const MESSAGE_MAX = 2000;

const TURNSTILE_TOKEN_MAX = 2_048;
const TURNSTILE_EXPECTED_ACTION = "contact_form";
const TURNSTILE_SITEVERIFY_URL =
  "https://challenges.cloudflare.com/turnstile/v0/siteverify";

const MIN_SUBMISSION_TIME_MS = 3_000;
const MAX_FORM_AGE_MS = 24 * 60 * 60 * 1000;

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

const ALLOWED_PURPOSES = new Set([
  "Research Collaboration",
  "Observational Collaboration",
  "Postdoctoral or Academic Opportunity",
  "Conference or Invited Talk",
  "Seminar or Workshop Invitation",
  "Peer Review or Editorial Communication",
  "Student or Research Guidance",
  "Scientific Outreach",
  "General Academic Enquiry",
  "Other",
]);

function jsonResponse(
  body: Record<string, unknown>,
  status = 200,
): Response {
  return Response.json(body, {
    status,
    headers: {
      "Cache-Control": "no-store",
      "X-Content-Type-Options": "nosniff",
    },
  });
}

function normalizeText(value: unknown): string | null {
  if (typeof value !== "string") return null;

  return value.trim();
}

function validateAntiSpamSignals(
  payload: ContactPayload,
):
  | { ok: true }
  | {
      ok: false;
      status: number;
      error: string;
    } {
  const honeypot =
    typeof payload.honeypot === "string"
      ? payload.honeypot.trim()
      : "";

  if (honeypot.length > 0) {
    return {
      ok: false,
      status: 400,
      error: "The submission could not be accepted.",
    };
  }

  if (
    typeof payload.formStartedAt !== "number" ||
    !Number.isFinite(payload.formStartedAt)
  ) {
    return {
      ok: false,
      status: 400,
      error: "The submission could not be verified.",
    };
  }

  const elapsed =
    Date.now() - payload.formStartedAt;

  if (elapsed < MIN_SUBMISSION_TIME_MS) {
    return {
      ok: false,
      status: 400,
      error: "The submission could not be verified.",
    };
  }

  if (elapsed > MAX_FORM_AGE_MS) {
    return {
      ok: false,
      status: 400,
      error:
        "This contact form session has expired. Please refresh the page and try again.",
    };
  }

  return {
    ok: true,
  };
}

function validatePayload(
  payload: ContactPayload,
):
  | {
      ok: true;
      value: {
        name: string;
        email: string;
        purpose: string;
        message: string;
      };
    }
  | {
      ok: false;
      error: string;
    } {
  const name =
    normalizeText(payload.name);

  const email =
    normalizeText(payload.email);

  const purpose =
    normalizeText(payload.purpose);

  const message =
    normalizeText(payload.message);

  if (
    !name ||
    name.length > NAME_MAX
  ) {
    return {
      ok: false,
      error: "Please enter a valid full name.",
    };
  }

  if (
    !email ||
    email.length > EMAIL_MAX ||
    !EMAIL_RE.test(email)
  ) {
    return {
      ok: false,
      error: "Please enter a valid email address.",
    };
  }

  if (
    !purpose ||
    !ALLOWED_PURPOSES.has(purpose)
  ) {
    return {
      ok: false,
      error:
        "Please select a valid purpose of contact.",
    };
  }

  if (
    !message ||
    message.length < MESSAGE_MIN ||
    message.length > MESSAGE_MAX
  ) {
    return {
      ok: false,
      error:
        `Message must contain between ${MESSAGE_MIN} and ${MESSAGE_MAX} characters.`,
    };
  }

  return {
    ok: true,
    value: {
      name,
      email: email.toLowerCase(),
      purpose,
      message,
    },
  };
}

function normalizeTurnstileToken(
  value: unknown,
): string | null {
  if (typeof value !== "string") {
    return null;
  }

  const token = value.trim();

  if (
    token.length === 0 ||
    token.length > TURNSTILE_TOKEN_MAX
  ) {
    return null;
  }

  return token;
}

async function verifyTurnstile(
  request: Request,
  env: Env,
  payload: ContactPayload,
): Promise<
  | {
      ok: true;
    }
  | {
      ok: false;
      status: number;
      error: string;
    }
> {
  const token =
    normalizeTurnstileToken(
      payload.turnstileToken,
    );

  if (!token) {
    return {
      ok: false,
      status: 400,
      error:
        "Please complete the security verification and try again.",
    };
  }

  const secret =
    env.TURNSTILE_SECRET_KEY?.trim();

  const expectedHostname =
    env.TURNSTILE_HOSTNAME?.trim();

  if (
    !secret ||
    !expectedHostname
  ) {
    console.error(
      "Turnstile server configuration is incomplete.",
    );

    return {
      ok: false,
      status: 503,
      error:
        "Security verification is temporarily unavailable. Please try again later.",
    };
  }

  const remoteIp =
    request.headers.get(
      "CF-Connecting-IP",
    ) ?? "";

  const formData =
    new FormData();

  formData.set(
    "secret",
    secret,
  );

  formData.set(
    "response",
    token,
  );

  if (remoteIp) {
    formData.set(
      "remoteip",
      remoteIp,
    );
  }

  /*
   * Cloudflare documents idempotency_key as an optional UUID
   * for safely retrying Siteverify requests.
   *
   * We currently perform a single Siteverify request, but
   * supplying an idempotency key keeps the request retry-safe
   * if retry handling is added later.
   */
  formData.set(
    "idempotency_key",
    crypto.randomUUID(),
  );

  let response: Response;

  try {
    response =
      await fetch(
        TURNSTILE_SITEVERIFY_URL,
        {
          method: "POST",
          body: formData,
          signal:
            AbortSignal.timeout(
              10_000,
            ),
        },
      );
  } catch (error) {
    console.error(
      "Turnstile Siteverify request failed",
      error,
    );

    return {
      ok: false,
      status: 503,
      error:
        "Security verification could not be completed. Please try again.",
    };
  }

  if (!response.ok) {
    console.error(
      "Turnstile Siteverify returned an unexpected HTTP status",
      response.status,
    );

    return {
      ok: false,
      status: 503,
      error:
        "Security verification could not be completed. Please try again.",
    };
  }

  let result:
    TurnstileSiteverifyResponse;

  try {
    result =
      (await response.json()) as TurnstileSiteverifyResponse;
  } catch (error) {
    console.error(
      "Turnstile Siteverify returned an invalid response",
      error,
    );

    return {
      ok: false,
      status: 503,
      error:
        "Security verification could not be completed. Please try again.",
    };
  }

  if (!result.success) {
    console.warn(
      "Turnstile verification rejected",
      result["error-codes"] ?? [],
    );

    return {
      ok: false,
      status: 403,
      error:
        "Security verification failed. Please refresh the verification and try again.",
    };
  }

  if (
    result.action !==
    TURNSTILE_EXPECTED_ACTION
  ) {
    console.warn(
      "Turnstile action mismatch",
      {
        received:
          result.action ?? null,
      },
    );

    return {
      ok: false,
      status: 403,
      error:
        "Security verification failed. Please try again.",
    };
  }

  if (
    result.hostname !==
    expectedHostname
  ) {
    console.warn(
      "Turnstile hostname mismatch",
      {
        received:
          result.hostname ?? null,
      },
    );

    return {
      ok: false,
      status: 403,
      error:
        "Security verification failed. Please try again.",
    };
  }

  return {
    ok: true,
  };
}

async function sha256Hex(
  value: string,
): Promise<string> {
  const bytes =
    new TextEncoder().encode(
      value,
    );

  const digest =
    await crypto.subtle.digest(
      "SHA-256",
      bytes,
    );

  return Array.from(
    new Uint8Array(digest),
  )
    .map((byte) =>
      byte
        .toString(16)
        .padStart(2, "0"),
    )
    .join("");
}

function createPublicReference(
  id: string,
): string {
  return `DIYA-${id
    .replaceAll("-", "")
    .slice(0, 12)
    .toUpperCase()}`;
}

async function buildRateLimitKey(
  request: Request,
  email: string,
): Promise<string> {
  const connectingIp =
    request.headers.get(
      "cf-connecting-ip",
    ) ?? "unknown";

  return sha256Hex(
    `contact:${email}:${connectingIp}`,
  );
}

async function markQueueFailure(
  env: Env,
  messageId: string,
): Promise<void> {
  try {
    await env.CONTACT_DB.prepare(
      `UPDATE contact_enquiries
       SET
         notification_status = 'retry_scheduled',
         status = 'accepted',
         next_retry_at = datetime('now', '+5 minutes'),
         error_code = 'QUEUE_PUBLISH_FAILED',
         updated_at = CURRENT_TIMESTAMP
       WHERE id = ?`,
    )
      .bind(
        messageId,
      )
      .run();
  } catch (error) {
    console.error(
      "Failed to record Queue publish failure",
      error,
    );
  }
}

async function markQueued(
  env: Env,
  messageId: string,
): Promise<void> {
  try {
    await env.CONTACT_DB.prepare(
      `UPDATE contact_enquiries
       SET
         notification_status = 'queued',
         status = 'queued',
         error_code = NULL,
         updated_at = CURRENT_TIMESTAMP
       WHERE id = ?`,
    )
      .bind(
        messageId,
      )
      .run();
  } catch (error) {
    console.error(
      "Failed to record queued notification state",
      error,
    );
  }
}

async function handleContact(
  request: Request,
  env: Env,
): Promise<Response> {
  if (
    request.method !== "POST"
  ) {
    return jsonResponse(
      {
        error:
          "Method not allowed.",
      },
      405,
    );
  }

  const contentType =
    request.headers.get(
      "content-type",
    ) ?? "";

  if (
    !contentType
      .toLowerCase()
      .startsWith(
        "application/json",
      )
  ) {
    return jsonResponse(
      {
        error:
          "Content-Type must be application/json.",
      },
      415,
    );
  }

  const contentLength =
    request.headers.get(
      "content-length",
    );

  if (contentLength) {
    const declaredLength =
      Number.parseInt(
        contentLength,
        10,
      );

    if (
      !Number.isFinite(
        declaredLength,
      ) ||
      declaredLength < 0 ||
      declaredLength >
        MAX_BODY_BYTES
    ) {
      return jsonResponse(
        {
          error:
            "Request body is too large.",
        },
        413,
      );
    }
  }

  const rawBody =
    await request.text();

  if (
    new TextEncoder().encode(
      rawBody,
    ).byteLength >
    MAX_BODY_BYTES
  ) {
    return jsonResponse(
      {
        error:
          "Request body is too large.",
      },
      413,
    );
  }

  let payload:
    ContactPayload;

  try {
    const parsed: unknown =
      JSON.parse(
        rawBody,
      );

    if (
      !parsed ||
      typeof parsed !== "object" ||
      Array.isArray(parsed)
    ) {
      return jsonResponse(
        {
          error:
            "Invalid request body.",
        },
        400,
      );
    }

    payload =
      parsed as ContactPayload;
  } catch {
    return jsonResponse(
      {
        error:
          "Invalid JSON request body.",
      },
      400,
    );
  }

  const antiSpam =
    validateAntiSpamSignals(
      payload,
    );

  if (!antiSpam.ok) {
    return jsonResponse(
      {
        error:
          antiSpam.error,
      },
      antiSpam.status,
    );
  }

  const validated =
    validatePayload(
      payload,
    );

  if (!validated.ok) {
    return jsonResponse(
      {
        error:
          validated.error,
      },
      400,
    );
  }

  /*
   * Turnstile must be verified server-side before:
   *
   * - rate-limit accounting;
   * - D1 persistence;
   * - Queue publication;
   * - Gmail notification.
   */
  const turnstile =
    await verifyTurnstile(
      request,
      env,
      payload,
    );

  if (!turnstile.ok) {
    return jsonResponse(
      {
        error:
          turnstile.error,
      },
      turnstile.status,
    );
  }

  const {
    name,
    email,
    purpose,
    message,
  } = validated.value;

  const rateLimitKey =
    await buildRateLimitKey(
      request,
      email,
    );

  const {
    success:
      rateLimitAllowed,
  } =
    await env.CONTACT_RATE_LIMITER.limit(
      {
        key:
          rateLimitKey,
      },
    );

  if (!rateLimitAllowed) {
    return jsonResponse(
      {
        error:
          "Too many contact attempts were received. Please wait a moment and try again.",
      },
      429,
    );
  }

  const id =
    crypto.randomUUID();

  const publicReference =
    createPublicReference(
      id,
    );

  const submittedAt =
    new Date().toISOString();

  const dedupeKey =
    await sha256Hex(
      `${email}\n${purpose}\n${message.toLowerCase()}`,
    );

  try {
    await env.CONTACT_DB.prepare(
      `INSERT INTO contact_enquiries (
        id,
        public_reference,
        submitted_at,
        name,
        visitor_email,
        purpose,
        message,
        status,
        turnstile_success,
        notification_status,
        notification_attempt_count,
        dedupe_key
      ) VALUES (
        ?,
        ?,
        ?,
        ?,
        ?,
        ?,
        ?,
        'accepted',
        1,
        'queued',
        0,
        ?
      )`,
    )
      .bind(
        id,
        publicReference,
        submittedAt,
        name,
        email,
        purpose,
        message,
        dedupeKey,
      )
      .run();
  } catch (error) {
    const messageText =
      error instanceof Error
        ? error.message.toLowerCase()
        : "";

    if (
      messageText.includes(
        "unique",
      ) ||
      messageText.includes(
        "constraint",
      )
    ) {
      return jsonResponse(
        {
          message:
            "Thank you — this enquiry has already been received.",
        },
        200,
      );
    }

    console.error(
      "Contact persistence failed",
      error,
    );

    return jsonResponse(
      {
        error:
          "The message could not be saved right now. Please try again later.",
      },
      503,
    );
  }

  try {
    await env.CONTACT_NOTIFICATION_QUEUE.send(
      {
        messageId:
          id,
        publicReference,
      },
    );

    await markQueued(
      env,
      id,
    );
  } catch (error) {
    console.error(
      "Contact notification Queue publish failed",
      error,
    );

    await markQueueFailure(
      env,
      id,
    );
  }

  return jsonResponse(
    {
      message:
        "Message received. Thank you — your enquiry has been saved.",
      reference:
        publicReference,
    },
    201,
  );
}

export default {
  async fetch(
    request: Request,
    env: Env,
  ): Promise<Response> {
    try {
      return await handleContact(
        request,
        env,
      );
    } catch (error) {
      console.error(
        "Unhandled Contact Worker error",
        error,
      );

      return jsonResponse(
        {
          error:
            "The message could not be processed right now. Please try again later.",
        },
        500,
      );
    }
  },
} satisfies ExportedHandler<Env>;
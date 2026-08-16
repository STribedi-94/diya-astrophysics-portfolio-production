// Frontend-only submission abstraction for the Contact form.
// The backend (Cloudflare Pages Function + Resend, protected by Turnstile) will
// be implemented separately and must expose: POST /api/contact
//
// Expected request body:  ContactPayload (JSON)
// Expected success:       HTTP 2xx, optional { message?: string }
// Expected failure:       non-2xx, optional { error?: string }
//
// Nothing here fakes a successful submission — if the endpoint is unavailable,
// the caller receives ok: false with a human-readable message.

export const CONTACT_ENDPOINT = "/api/contact";

export type ContactPayload = {
  name: string;
  email: string;
  purpose: string;
  message: string;
  /** Reserved for Cloudflare Turnstile — populated once the widget is enabled. */
  turnstileToken?: string;
  honeypot?: string;
  formStartedAt?: number;
};

export type ContactResult = { ok: true; message: string } | { ok: false; message: string };

const GENERIC_ERROR =
  "The message could not be sent right now. Please email directly using the address above.";

export async function submitContactEnquiry(
  payload: ContactPayload,
  signal?: AbortSignal,
): Promise<ContactResult> {
  try {
    const response = await fetch(CONTACT_ENDPOINT, {
      method: "POST",
      headers: { "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify(payload),
      signal,
    });

    type ContactResponseBody = { message?: string; error?: string };
    let data: ContactResponseBody | null = null;
    try {
      data = (await response.clone().json()) as ContactResponseBody;
    } catch {
      data = null;
    }

    if (!response.ok) {
      return { ok: false, message: data?.error ?? GENERIC_ERROR };
    }

    return {
      ok: true,
      message: data?.message ?? "Message sent. Thank you — your enquiry has been received.",
    };
  } catch {
    return { ok: false, message: GENERIC_ERROR };
  }
}

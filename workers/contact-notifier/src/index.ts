interface ContactNotificationMessage {
  messageId: string;
  publicReference: string;
}

interface ContactEnquiryRow {
  id: string;
  public_reference: string;
  submitted_at: string;
  name: string;
  visitor_email: string;
  purpose: string;
  message: string;
  notification_status: string;
  notification_attempt_count: number;
}

interface GmailTokenResponse {
  access_token?: string;
  expires_in?: number;
  scope?: string;
  token_type?: string;
  error?: string;
  error_description?: string;
}

interface GmailSendResponse {
  id?: string;
  threadId?: string;
  labelIds?: string[];
  error?: {
    code?: number;
    message?: string;
    status?: string;
  };
}

interface Env {
  CONTACT_DB: D1Database;
  GMAIL_CLIENT_ID: string;
  GMAIL_CLIENT_SECRET: string;
  GMAIL_REFRESH_TOKEN: string;
}

const GMAIL_TOKEN_ENDPOINT =
  "https://oauth2.googleapis.com/token";

const GMAIL_SEND_ENDPOINT =
  "https://gmail.googleapis.com/gmail/v1/users/me/messages/send";

const WEBSITE_SENDER_EMAIL =
  "diya.portfolio.website@gmail.com";

const RECIPIENT_EMAIL =
  "ramdiya1996@gmail.com";

function encodeBase64Url(value: string): string {
  const bytes = new TextEncoder().encode(value);

  let binary = "";

  for (const byte of bytes) {
    binary += String.fromCharCode(byte);
  }

  return btoa(binary)
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/g, "");
}

function sanitizeHeaderValue(value: string): string {
  return value
    .replace(/[\r\n]+/g, " ")
    .trim();
}

function buildMimeMessage(
  enquiry: ContactEnquiryRow,
): string {
  const visitorName = sanitizeHeaderValue(
    enquiry.name,
  );

  const visitorEmail = sanitizeHeaderValue(
    enquiry.visitor_email,
  );

  const purpose = sanitizeHeaderValue(
    enquiry.purpose,
  );

  const publicReference = sanitizeHeaderValue(
    enquiry.public_reference,
  );

  const subject =
    `[Diya Portfolio] ${purpose} — ${publicReference}`;

  const body = [
    "A new enquiry was submitted through the Diya Astrophysics Portfolio.",
    "",
    `Reference: ${publicReference}`,
    `Submitted: ${enquiry.submitted_at}`,
    `Name: ${visitorName}`,
    `Email: ${visitorEmail}`,
    `Purpose: ${purpose}`,
    "",
    "Message:",
    enquiry.message,
    "",
    "This notification was generated automatically by the Diya Portfolio contact system.",
  ].join("\r\n");

  return [
    `From: Diya Astrophysics Portfolio <${WEBSITE_SENDER_EMAIL}>`,
    `To: ${RECIPIENT_EMAIL}`,
    `Reply-To: ${visitorEmail}`,
    `Subject: ${subject}`,
    "MIME-Version: 1.0",
    'Content-Type: text/plain; charset="UTF-8"',
    "Content-Transfer-Encoding: 8bit",
    "",
    body,
  ].join("\r\n");
}

async function getAccessToken(
  env: Env,
): Promise<string> {
  const body = new URLSearchParams({
    client_id: env.GMAIL_CLIENT_ID,
    client_secret: env.GMAIL_CLIENT_SECRET,
    refresh_token: env.GMAIL_REFRESH_TOKEN,
    grant_type: "refresh_token",
  });

  const response = await fetch(
    GMAIL_TOKEN_ENDPOINT,
    {
      method: "POST",
      headers: {
        "Content-Type":
          "application/x-www-form-urlencoded",
      },
      body,
    },
  );

  const result =
    (await response.json()) as GmailTokenResponse;

  if (
    !response.ok ||
    !result.access_token
  ) {
    const errorCode =
      result.error ?? `HTTP_${response.status}`;

    throw new Error(
      `GMAIL_TOKEN_ERROR:${errorCode}`,
    );
  }

  return result.access_token;
}

async function sendGmailMessage(
  accessToken: string,
  rawMimeMessage: string,
): Promise<string> {
  const raw = encodeBase64Url(
    rawMimeMessage,
  );

  const response = await fetch(
    GMAIL_SEND_ENDPOINT,
    {
      method: "POST",
      headers: {
        Authorization:
          `Bearer ${accessToken}`,
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify({ raw }),
    },
  );

  const result =
    (await response.json()) as GmailSendResponse;

  if (
    !response.ok ||
    !result.id
  ) {
    const errorCode =
      result.error?.status ??
      result.error?.code?.toString() ??
      `HTTP_${response.status}`;

    throw new Error(
      `GMAIL_SEND_ERROR:${errorCode}`,
    );
  }

  return result.id;
}

async function getEnquiry(
  env: Env,
  messageId: string,
): Promise<ContactEnquiryRow | null> {
  return env.CONTACT_DB.prepare(
    `SELECT
       id,
       public_reference,
       submitted_at,
       name,
       visitor_email,
       purpose,
       message,
       notification_status,
       notification_attempt_count
     FROM contact_enquiries
     WHERE id = ?
     LIMIT 1`,
  )
    .bind(messageId)
    .first<ContactEnquiryRow>();
}

async function markSending(
  env: Env,
  messageId: string,
): Promise<void> {
  await env.CONTACT_DB.prepare(
    `UPDATE contact_enquiries
     SET
       status = 'processing',
       notification_status = 'sending',
       notification_attempt_count =
         notification_attempt_count + 1,
       last_notification_attempt_at =
         CURRENT_TIMESTAMP,
       error_code = NULL,
       updated_at = CURRENT_TIMESTAMP
     WHERE id = ?`,
  )
    .bind(messageId)
    .run();
}

async function markSent(
  env: Env,
  messageId: string,
  gmailMessageId: string,
): Promise<void> {
  await env.CONTACT_DB.prepare(
    `UPDATE contact_enquiries
     SET
       status = 'completed',
       notification_status = 'sent',
       notified_at = CURRENT_TIMESTAMP,
       gmail_message_id = ?,
       next_retry_at = NULL,
       error_code = NULL,
       updated_at = CURRENT_TIMESTAMP
     WHERE id = ?`,
  )
    .bind(
      gmailMessageId,
      messageId,
    )
    .run();
}

async function markRetry(
  env: Env,
  messageId: string,
  errorCode: string,
): Promise<void> {
  await env.CONTACT_DB.prepare(
    `UPDATE contact_enquiries
     SET
       status = 'accepted',
       notification_status =
         'retry_scheduled',
       next_retry_at =
         datetime('now', '+5 minutes'),
       error_code = ?,
       updated_at = CURRENT_TIMESTAMP
     WHERE id = ?`,
  )
    .bind(
      errorCode.slice(0, 120),
      messageId,
    )
    .run();
}

async function markActionRequired(
  env: Env,
  messageId: string,
  errorCode: string,
): Promise<void> {
  await env.CONTACT_DB.prepare(
    `UPDATE contact_enquiries
     SET
       status = 'action_required',
       notification_status =
         'action_required',
       next_retry_at = NULL,
       error_code = ?,
       updated_at = CURRENT_TIMESTAMP
     WHERE id = ?`,
  )
    .bind(
      errorCode.slice(0, 120),
      messageId,
    )
    .run();
}

function classifyRetryability(
  error: unknown,
): {
  retryable: boolean;
  code: string;
} {
  const message =
    error instanceof Error
      ? error.message
      : "UNKNOWN_ERROR";

  const upper =
    message.toUpperCase();

  if (
    upper.includes("INVALID_GRANT") ||
    upper.includes("INVALID_CLIENT") ||
    upper.includes("UNAUTHORIZED_CLIENT")
  ) {
    return {
      retryable: false,
      code: message,
    };
  }

  if (
    upper.includes("PERMISSION_DENIED") ||
    upper.includes("UNAUTHENTICATED")
  ) {
    return {
      retryable: false,
      code: message,
    };
  }

  return {
    retryable: true,
    code: message,
  };
}

async function processNotification(
  env: Env,
  queueMessage:
    Message<ContactNotificationMessage>,
): Promise<void> {
  const {
    messageId,
    publicReference,
  } = queueMessage.body;

  if (
    typeof messageId !== "string" ||
    typeof publicReference !== "string"
  ) {
    console.error(
      "Malformed Contact notification Queue message",
      queueMessage.id,
    );

    queueMessage.ack();
    return;
  }

  const enquiry =
    await getEnquiry(
      env,
      messageId,
    );

  if (!enquiry) {
    console.error(
      "Contact enquiry not found for Queue message",
      messageId,
    );

    queueMessage.ack();
    return;
  }

  if (
    enquiry.notification_status ===
    "sent"
  ) {
    queueMessage.ack();
    return;
  }

  try {
    await markSending(
      env,
      enquiry.id,
    );

    const accessToken =
      await getAccessToken(env);

    const mime =
      buildMimeMessage(enquiry);

    const gmailMessageId =
      await sendGmailMessage(
        accessToken,
        mime,
      );

    await markSent(
      env,
      enquiry.id,
      gmailMessageId,
    );

    queueMessage.ack();
  } catch (error) {
    console.error(
      "Contact Gmail notification failed",
      {
        messageId:
          enquiry.id,
        attempt:
          queueMessage.attempts,
        error:
          error instanceof Error
            ? error.message
            : "UNKNOWN_ERROR",
      },
    );

    const classification =
      classifyRetryability(error);

    if (!classification.retryable) {
      await markActionRequired(
        env,
        enquiry.id,
        classification.code,
      );

      queueMessage.ack();
      return;
    }

    await markRetry(
      env,
      enquiry.id,
      classification.code,
    );

    queueMessage.retry({
      delaySeconds: 60,
    });
  }
}

export default {
  async queue(
    batch:
      MessageBatch<ContactNotificationMessage>,
    env: Env,
  ): Promise<void> {
    for (const message of batch.messages) {
      await processNotification(
        env,
        message,
      );
    }
  },
} satisfies ExportedHandler<
  Env,
  ContactNotificationMessage
>;
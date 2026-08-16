CREATE TABLE IF NOT EXISTS contact_enquiries (
  id TEXT PRIMARY KEY,
  public_reference TEXT NOT NULL UNIQUE,

  submitted_at TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,

  name TEXT NOT NULL,
  visitor_email TEXT NOT NULL,
  purpose TEXT NOT NULL,
  message TEXT NOT NULL,

  status TEXT NOT NULL DEFAULT 'accepted'
    CHECK (status IN (
      'accepted',
      'queued',
      'processing',
      'completed',
      'action_required'
    )),

  turnstile_success INTEGER NOT NULL DEFAULT 0
    CHECK (turnstile_success IN (0, 1)),

  notification_status TEXT NOT NULL DEFAULT 'queued'
    CHECK (notification_status IN (
      'queued',
      'sending',
      'sent',
      'retry_scheduled',
      'action_required'
    )),

  notification_attempt_count INTEGER NOT NULL DEFAULT 0,
  last_notification_attempt_at TEXT,
  next_retry_at TEXT,
  notified_at TEXT,
  gmail_message_id TEXT,

  dedupe_key TEXT,
  error_code TEXT
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_contact_enquiries_dedupe_key
  ON contact_enquiries(dedupe_key)
  WHERE dedupe_key IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_contact_enquiries_notification_status
  ON contact_enquiries(notification_status);

CREATE INDEX IF NOT EXISTS idx_contact_enquiries_next_retry_at
  ON contact_enquiries(next_retry_at);

CREATE INDEX IF NOT EXISTS idx_contact_enquiries_submitted_at
  ON contact_enquiries(submitted_at);
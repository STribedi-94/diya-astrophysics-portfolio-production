import { useEffect, useId, useRef, useState } from "react";
import { AlertCircle, CheckCircle2, Loader2, Send } from "lucide-react";
import { cn } from "@/lib/utils";
import { contactPurposes, contactIdentity } from "@/data/contact";
import { submitContactEnquiry } from "@/lib/contact-submit";

type Fields = { name: string; email: string; purpose: string; message: string };
type Errors = Partial<Record<keyof Fields, string>>;

const MESSAGE_MIN = 30;
const MESSAGE_MAX = 2000;
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

function validate(values: Fields): Errors {
  const errors: Errors = {};
  const name = values.name.trim();
  if (!name) errors.name = "Please enter your full name.";
  else if (name.length > 100) errors.name = "Name must be under 100 characters.";

  const email = values.email.trim();
  if (!email) errors.email = "Please enter your email address.";
  else if (!EMAIL_RE.test(email) || email.length > 255)
    errors.email = "Please enter a valid email address.";

  if (!values.purpose) errors.purpose = "Please select a purpose of contact.";

  const message = values.message.trim();
  if (!message) errors.message = "Please write a short message.";
  else if (message.length < MESSAGE_MIN)
    errors.message = `Please provide at least ${MESSAGE_MIN} characters.`;
  else if (message.length > MESSAGE_MAX)
    errors.message = `Please keep the message under ${MESSAGE_MAX} characters.`;

  return errors;
}

const fieldClass =
  "w-full rounded-xl border border-white/10 bg-white/[0.04] px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground transition-colors focus:border-primary/50 focus:bg-white/[0.06] focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/50";
const labelClass = "mb-2 block text-xs font-medium uppercase tracking-[0.14em] text-muted-foreground";

export function ContactForm() {
  const uid = useId();
  const [values, setValues] = useState<Fields>({ name: "", email: "", purpose: "", message: "" });
  const [errors, setErrors] = useState<Errors>({});
  const [status, setStatus] = useState<"idle" | "submitting" | "success" | "error">("idle");
  const [feedback, setFeedback] = useState("");
  const submittingRef = useRef(false);
  const firstErrorRef = useRef<string | null>(null);

  useEffect(() => () => { submittingRef.current = false; }, []);

  const set = (key: keyof Fields) => (value: string) => {
    setValues((v) => ({ ...v, [key]: value }));
    if (errors[key]) setErrors((e) => ({ ...e, [key]: undefined }));
  };

  const onSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (submittingRef.current) return; // prevent duplicate submissions

    const nextErrors = validate(values);
    setErrors(nextErrors);
    const firstKey = (Object.keys(nextErrors) as (keyof Fields)[])[0];
    if (firstKey) {
      firstErrorRef.current = `${uid}-${firstKey}`;
      document.getElementById(`${uid}-${firstKey}`)?.focus();
      setStatus("idle");
      setFeedback("");
      return;
    }

    submittingRef.current = true;
    setStatus("submitting");
    setFeedback("");

    const result = await submitContactEnquiry({
      name: values.name.trim(),
      email: values.email.trim(),
      purpose: values.purpose,
      message: values.message.trim(),
    });

    submittingRef.current = false;
    if (result.ok) {
      setStatus("success");
      setFeedback(result.message);
      setValues({ name: "", email: "", purpose: "", message: "" });
    } else {
      setStatus("error");
      setFeedback(result.message);
    }
  };

  const busy = status === "submitting";
  const remaining = MESSAGE_MAX - values.message.length;

  return (
    <form onSubmit={onSubmit} noValidate className="glass rounded-2xl p-6 md:p-8">
      <div className="grid gap-5 md:grid-cols-2">
        <div>
          <label htmlFor={`${uid}-name`} className={labelClass}>
            Full name
          </label>
          <input
            id={`${uid}-name`}
            name="name"
            type="text"
            autoComplete="name"
            maxLength={100}
            value={values.name}
            onChange={(e) => set("name")(e.target.value)}
            aria-required="true"
            aria-invalid={errors.name ? true : undefined}
            aria-describedby={errors.name ? `${uid}-name-error` : undefined}
            className={cn(fieldClass, errors.name && "border-destructive/60")}
            placeholder="Your name"
          />
          {errors.name && (
            <p id={`${uid}-name-error`} className="mt-1.5 text-xs text-destructive">
              {errors.name}
            </p>
          )}
        </div>

        <div>
          <label htmlFor={`${uid}-email`} className={labelClass}>
            Email address
          </label>
          <input
            id={`${uid}-email`}
            name="email"
            type="email"
            autoComplete="email"
            maxLength={255}
            value={values.email}
            onChange={(e) => set("email")(e.target.value)}
            aria-required="true"
            aria-invalid={errors.email ? true : undefined}
            aria-describedby={errors.email ? `${uid}-email-error` : undefined}
            className={cn(fieldClass, errors.email && "border-destructive/60")}
            placeholder="you@institution.edu"
          />
          {errors.email && (
            <p id={`${uid}-email-error`} className="mt-1.5 text-xs text-destructive">
              {errors.email}
            </p>
          )}
        </div>
      </div>

      <div className="mt-5">
        <label htmlFor={`${uid}-purpose`} className={labelClass}>
          Purpose of contact
        </label>
        <select
          id={`${uid}-purpose`}
          name="purpose"
          value={values.purpose}
          onChange={(e) => set("purpose")(e.target.value)}
          aria-required="true"
          aria-invalid={errors.purpose ? true : undefined}
          aria-describedby={errors.purpose ? `${uid}-purpose-error` : undefined}
          className={cn(fieldClass, "appearance-none", errors.purpose && "border-destructive/60")}
        >
          <option value="">Select a purpose…</option>
          {contactPurposes.map((p) => (
            <option key={p} value={p} className="bg-background text-foreground">
              {p}
            </option>
          ))}
        </select>
        {errors.purpose && (
          <p id={`${uid}-purpose-error`} className="mt-1.5 text-xs text-destructive">
            {errors.purpose}
          </p>
        )}
      </div>

      <div className="mt-5">
        <label htmlFor={`${uid}-message`} className={labelClass}>
          Message
        </label>
        <textarea
          id={`${uid}-message`}
          name="message"
          rows={6}
          maxLength={MESSAGE_MAX}
          value={values.message}
          onChange={(e) => set("message")(e.target.value)}
          aria-required="true"
          aria-invalid={errors.message ? true : undefined}
          aria-describedby={cn(`${uid}-message-hint`, errors.message && `${uid}-message-error`)}
          className={cn(fieldClass, "resize-y", errors.message && "border-destructive/60")}
          placeholder="Briefly describe your enquiry, collaboration idea or invitation."
        />
        <div className="mt-1.5 flex flex-wrap items-center justify-between gap-2">
          <p id={`${uid}-message-hint`} className="text-xs text-muted-foreground">
            Minimum {MESSAGE_MIN} characters.
          </p>
          <p className="font-mono text-[11px] text-muted-foreground" aria-hidden>
            {remaining} left
          </p>
        </div>
        {errors.message && (
          <p id={`${uid}-message-error`} className="mt-1 text-xs text-destructive">
            {errors.message}
          </p>
        )}
      </div>

      {/* Cloudflare Turnstile mounts here once the backend is live. */}
      <div data-turnstile-slot className="mt-5 empty:mt-0" aria-hidden />

      <div className="mt-6 flex flex-wrap items-center gap-4">
        <button
          type="submit"
          disabled={busy}
          className="inline-flex min-h-11 items-center gap-2 rounded-full bg-grad-accent px-6 text-sm font-medium text-[oklch(0.12_0.04_265)] transition-all hover:brightness-110 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60 disabled:cursor-not-allowed disabled:opacity-70"
        >
          {busy ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
              Sending…
            </>
          ) : (
            <>
              <Send className="h-4 w-4" aria-hidden />
              Send message
            </>
          )}
        </button>
        <a
          href={`mailto:${contactIdentity.email}`}
          className="text-xs text-muted-foreground underline-offset-4 transition-colors hover:text-foreground hover:underline"
        >
          Or email directly
        </a>
      </div>

      <div aria-live="polite" role="status" className="mt-4 empty:mt-0">
        {status === "success" && (
          <p className="flex items-start gap-2 rounded-xl border border-primary/30 bg-primary/10 px-4 py-3 text-sm text-foreground">
            <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-primary" aria-hidden />
            {feedback}
          </p>
        )}
        {status === "error" && (
          <p className="flex items-start gap-2 rounded-xl border border-destructive/40 bg-destructive/10 px-4 py-3 text-sm text-foreground">
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-destructive" aria-hidden />
            {feedback}
          </p>
        )}
      </div>
    </form>
  );
}

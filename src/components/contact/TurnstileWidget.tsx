import { useEffect, useRef } from "react";

import {
  isTurnstileConfigured,
  turnstileConfig,
} from "@/config/turnstile";

type TurnstileWidgetId = string;

type TurnstileRenderOptions = {
  sitekey: string;
  theme?: "auto" | "light" | "dark";
  size?: "normal" | "flexible" | "compact";
  action?: string;
  callback?: (token: string) => void;
  "error-callback"?: (errorCode?: string) => void;
  "expired-callback"?: () => void;
  "timeout-callback"?: () => void;
};

type TurnstileApi = {
  render: (
    container: HTMLElement,
    options: TurnstileRenderOptions,
  ) => TurnstileWidgetId;
  reset: (widgetId?: TurnstileWidgetId) => void;
  remove: (widgetId: TurnstileWidgetId) => void;
};

declare global {
  interface Window {
    turnstile?: TurnstileApi;
  }
}

const TURNSTILE_SCRIPT_ID = "cloudflare-turnstile-api";
const TURNSTILE_SCRIPT_SRC =
  "https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit";

type TurnstileWidgetProps = {
  onToken: (token: string | null) => void;
  onError?: () => void;
};

function loadTurnstileScript(): Promise<void> {
  if (typeof window === "undefined") {
    return Promise.resolve();
  }

  if (window.turnstile) {
    return Promise.resolve();
  }

  return new Promise((resolve, reject) => {
    const existingScript = document.getElementById(
      TURNSTILE_SCRIPT_ID,
    ) as HTMLScriptElement | null;

    if (existingScript) {
      if (window.turnstile) {
        resolve();
        return;
      }

      existingScript.addEventListener("load", () => resolve(), {
        once: true,
      });

      existingScript.addEventListener(
        "error",
        () => reject(new Error("Turnstile script failed to load.")),
        { once: true },
      );

      return;
    }

    const script = document.createElement("script");

    script.id = TURNSTILE_SCRIPT_ID;
    script.src = TURNSTILE_SCRIPT_SRC;
    script.async = true;
    script.defer = true;

    script.addEventListener("load", () => resolve(), {
      once: true,
    });

    script.addEventListener(
      "error",
      () => reject(new Error("Turnstile script failed to load.")),
      { once: true },
    );

    document.head.appendChild(script);
  });
}

export function TurnstileWidget({
  onToken,
  onError,
}: TurnstileWidgetProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const widgetIdRef = useRef<TurnstileWidgetId | null>(null);

  useEffect(() => {
    let cancelled = false;

    if (!isTurnstileConfigured) {
      onToken(null);
      return;
    }

    const mountWidget = async () => {
      try {
        await loadTurnstileScript();

        if (
          cancelled ||
          !containerRef.current ||
          !window.turnstile
        ) {
          return;
        }

        widgetIdRef.current = window.turnstile.render(
          containerRef.current,
          {
            sitekey: turnstileConfig.siteKey,
            theme: "auto",
            size: "flexible",
            action: "contact_form",

            callback: (token) => {
              onToken(token);
            },

            "expired-callback": () => {
              onToken(null);
            },

            "timeout-callback": () => {
              onToken(null);
            },

            "error-callback": () => {
              onToken(null);
              onError?.();
            },
          },
        );
      } catch (error) {
        console.error("Turnstile initialization failed", error);

        if (!cancelled) {
          onToken(null);
          onError?.();
        }
      }
    };

    void mountWidget();

    return () => {
      cancelled = true;

      if (widgetIdRef.current && window.turnstile) {
        window.turnstile.remove(widgetIdRef.current);
      }

      widgetIdRef.current = null;
    };
  }, [onError, onToken]);

  if (!isTurnstileConfigured) {
    return null;
  }

  return (
    <div
      ref={containerRef}
      className="min-h-[65px]"
      aria-label="Security verification"
    />
  );
}
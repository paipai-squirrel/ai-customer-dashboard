export interface RuntimeErrorContext {
  componentStack?: string | null;
}

export interface RuntimeErrorPayload {
  message: string;
  stack?: string;
  route: string;
  release: string;
  occurredAt: string;
  context: RuntimeErrorContext;
}

declare global {
  interface Window {
    __DASHBOARD_ERROR_REPORTER__?: (payload: RuntimeErrorPayload) => void;
  }
}

let sentryInitialized = false;

export function initializeMonitoring() {
  const dsn = import.meta.env.VITE_SENTRY_DSN;
  if (!dsn || sentryInitialized) return false;
  Sentry.init({
    dsn,
    environment:
      import.meta.env.VITE_SENTRY_ENVIRONMENT ?? import.meta.env.MODE,
    release: __APP_VERSION__,
    sendDefaultPii: false,
    integrations: [Sentry.browserTracingIntegration()],
    tracesSampleRate: import.meta.env.PROD ? 0.1 : 0,
  });
  sentryInitialized = true;
  return true;
}

export function reportRuntimeError(
  error: Error,
  context: RuntimeErrorContext = {},
) {
  const payload: RuntimeErrorPayload = {
    message: error.message,
    stack: error.stack,
    route: window.location.href,
    release: __APP_VERSION__,
    occurredAt: new Date().toISOString(),
    context,
  };
  if (sentryInitialized) {
    Sentry.captureException(error, {
      tags: { release: payload.release },
      extra: { componentStack: context.componentStack },
    });
  }
  window.__DASHBOARD_ERROR_REPORTER__?.(payload);
  const endpoint = import.meta.env.VITE_ERROR_REPORT_URL;
  if (endpoint) {
    void fetch(endpoint, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(payload),
      keepalive: true,
    }).catch((reportingError) =>
      console.error("dashboard-error-report-failed", reportingError),
    );
  } else if (!window.__DASHBOARD_ERROR_REPORTER__) {
    console.error("dashboard-runtime-error", payload);
  }
}
import * as Sentry from "@sentry/react";

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

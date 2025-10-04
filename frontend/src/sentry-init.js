import * as Sentry from '@sentry/react';
import { BrowserTracing } from '@sentry/tracing';

Sentry.init({
  dsn: import.meta.env.VITE_SENTRY_DSN || undefined,
  integrations: [new BrowserTracing()],
  tracesSampleRate: Number(import.meta.env.VITE_SENTRY_TRACES_SAMPLE_RATE || '1.0'),
  environment: import.meta.env.VITE_SENTRY_ENV || import.meta.env.MODE,
  enabled: Boolean(import.meta.env.VITE_SENTRY_DSN),
});

// Example usage: Sentry.captureException(new Error('Test error'));

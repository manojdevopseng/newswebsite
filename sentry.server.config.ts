import * as Sentry from '@sentry/nextjs'

const SENTRY_DSN = process.env.NEXT_PUBLIC_SENTRY_DSN

if (SENTRY_DSN) {
  Sentry.init({
    dsn: SENTRY_DSN,
    environment: process.env.NODE_ENV,
    tracesSampleRate: 0.1,
    sampleRate: 1.0,

    // Do NOT send errors from admin API routes
    beforeSend(event) {
      if (event.request?.url?.includes('/api/admin')) return null
      return event
    },
  })
}

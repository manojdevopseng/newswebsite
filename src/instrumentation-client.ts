import * as Sentry from '@sentry/nextjs'

const SENTRY_DSN = process.env.NEXT_PUBLIC_SENTRY_DSN

if (SENTRY_DSN) {
  Sentry.init({
    dsn: SENTRY_DSN,
    environment: process.env.NODE_ENV,

    tracesSampleRate: 0.1,
    sampleRate: 1.0,

    replaysSessionSampleRate: 0.01,
    replaysOnErrorSampleRate: 1.0,

    beforeSend(event) {
      if (event.request?.url?.includes('/admin')) return null
      return event
    },

    integrations: [
      Sentry.replayIntegration({
        maskAllText: false,
        blockAllMedia: false,
      }),
    ],
  })
}

export function onRouterTransitionStart(url: string) {
  Sentry.addBreadcrumb({
    category: 'navigation',
    message: `Navigated to ${url}`,
    level: 'info',
  })
}

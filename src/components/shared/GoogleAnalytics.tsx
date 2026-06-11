'use client'

import Script from 'next/script'
import { usePathname } from 'next/navigation'
import { useEffect } from 'react'

interface Props {
  gaId:           string
  adsenseClient?: string
}

/**
 * Loads GA + AdSense only on public-facing pages.
 * Admin routes (/admin/*) are explicitly excluded so that
 * CMS activity does not pollute analytics data.
 *
 * Fixes applied:
 *  1. strategy="afterInteractive" — fires as soon as page is interactive,
 *     not after full idle (lazyOnload was missing fast-exit visitors).
 *  2. useEffect on pathname — sends a page_view hit on every client-side
 *     route change (Next.js App Router SPA navigation was not tracked before).
 */
export function GoogleAnalytics({ gaId, adsenseClient }: Props) {
  const pathname = usePathname()

  // Skip entirely on admin routes
  if (pathname.startsWith('/admin')) return null

  // Fire a page_view on every client-side navigation
  // eslint-disable-next-line react-hooks/rules-of-hooks
  useEffect(() => {
    if (typeof window === 'undefined') return
    if (!(window as any).gtag) return
    ;(window as any).gtag('config', gaId, {
      page_path: pathname,
    })
  }, [pathname, gaId])

  return (
    <>
      {/* Google AdSense */}
      {adsenseClient && (
        <Script
          src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${adsenseClient}`}
          strategy="lazyOnload"
          crossOrigin="anonymous"
        />
      )}

      {/* Google Analytics — afterInteractive loads as soon as JS hydrates,
          catching visitors who leave before the page goes fully idle */}
      <Script
        src={`https://www.googletagmanager.com/gtag/js?id=${gaId}`}
        strategy="afterInteractive"
      />
      <Script id="google-analytics" strategy="afterInteractive">
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          gtag('config', '${gaId}', {
            page_path: window.location.pathname,
            send_page_view: true,
          });
        `}
      </Script>
    </>
  )
}

/**
 * IndexNow — instantly notify search engines (Bing, Yandex, etc.) about
 * new or updated pages. Google is also testing IndexNow support.
 *
 * Key file must be publicly accessible at:
 *   https://techpulseglobe.com/{INDEXNOW_KEY}.txt
 *
 * Docs: https://www.indexnow.org/documentation
 */

const KEY  = process.env.INDEXNOW_KEY || 'd8f3a1b7c9e2f5a0b4c6d8e0f2a4b6c8'
const HOST = 'techpulseglobe.com'
const BASE = `https://${HOST}`

/**
 * Ping IndexNow with one or more page URLs.
 * Fire-and-forget — failures are logged but never throw.
 */
export async function pingIndexNow(urls: string[]): Promise<void> {
  if (!urls.length) return

  const validUrls = urls.filter(u => u.startsWith('https://'))
  if (!validUrls.length) return

  try {
    const res = await fetch('https://api.indexnow.org/indexnow', {
      method:  'POST',
      headers: { 'Content-Type': 'application/json; charset=utf-8' },
      body: JSON.stringify({
        host:        HOST,
        key:         KEY,
        keyLocation: `${BASE}/${KEY}.txt`,
        urlList:     validUrls,
      }),
    })

    if (res.ok || res.status === 202) {
      console.log(`[IndexNow] ✅ Pinged ${validUrls.length} URL(s)`)
    } else {
      console.warn(`[IndexNow] ⚠️ Response ${res.status} for`, validUrls)
    }
  } catch (err) {
    // Never let IndexNow failures break the publish flow
    console.error('[IndexNow] ping failed:', err)
  }
}

/**
 * Ping Google's sitemap endpoint to trigger a re-crawl of the sitemap.
 * Also pings Bing's sitemap endpoint.
 * Fire-and-forget.
 */
export async function pingSitemaps(): Promise<void> {
  const sitemapUrl = encodeURIComponent(`${BASE}/sitemap.xml`)
  const newsSitemapUrl = encodeURIComponent(`${BASE}/api/sitemap/news`)

  const endpoints = [
    `https://www.google.com/ping?sitemap=${sitemapUrl}`,
    `https://www.google.com/ping?sitemap=${newsSitemapUrl}`,
    `https://www.bing.com/ping?sitemap=${sitemapUrl}`,
  ]

  await Promise.allSettled(
    endpoints.map(url =>
      fetch(url, { method: 'GET' }).catch(() => {})
    )
  )

  console.log('[SitemapPing] ✅ Pinged Google + Bing sitemaps')
}

/**
 * Call this after publishing an article.
 * Pings IndexNow with the article URL + pings sitemap endpoints.
 */
export async function notifyPublished(catSlug: string, articleSlug: string): Promise<void> {
  const articleUrl = `${BASE}/${catSlug}/${articleSlug}`

  // Run both in parallel, fire-and-forget
  Promise.allSettled([
    pingIndexNow([articleUrl]),
    pingSitemaps(),
  ]).catch(() => {})
}

import { Redis } from '@upstash/redis'

const PREFIX = 'tpg:'
const LISTINGS_V_KEY = `${PREFIX}articles_v`

let _redis: Redis | null = null

function getRedis(): Redis | null {
  if (_redis) return _redis
  if (!process.env.UPSTASH_REDIS_REST_URL || !process.env.UPSTASH_REDIS_REST_TOKEN) return null
  try {
    _redis = new Redis({
      url:   process.env.UPSTASH_REDIS_REST_URL,
      token: process.env.UPSTASH_REDIS_REST_TOKEN,
    })
    return _redis
  } catch { return null }
}

export async function cacheGet<T>(key: string): Promise<T | null> {
  const r = getRedis()
  if (!r) return null
  try { return await r.get<T>(`${PREFIX}${key}`) }
  catch { return null }
}

export async function cacheSet(key: string, value: unknown, ttl: number): Promise<void> {
  const r = getRedis()
  if (!r) return
  try { await r.set(`${PREFIX}${key}`, value, { ex: ttl }) }
  catch {}
}

export async function cacheDel(...keys: string[]): Promise<void> {
  const r = getRedis()
  if (!r) return
  try { await r.del(...keys.map(k => `${PREFIX}${k}`)) }
  catch {}
}

export async function getListingsVersion(): Promise<number> {
  const r = getRedis()
  if (!r) return 0
  try { return (await r.get<number>(LISTINGS_V_KEY)) ?? 0 }
  catch { return 0 }
}

/**
 * Invalidate article detail caches + bust all listing/trending caches.
 * Called after any article create / update / delete.
 */
export async function bustArticleCaches(articleSlug?: string, articleId?: string): Promise<void> {
  const r = getRedis()
  if (!r) return
  try {
    const delKeys: string[] = [`${PREFIX}trending`]
    if (articleSlug) delKeys.push(`${PREFIX}article:${articleSlug}`)
    if (articleId)   delKeys.push(`${PREFIX}article:${articleId}`)
    await Promise.all([
      r.del(...delKeys),
      r.incr(LISTINGS_V_KEY), // bumps version → all listing cache keys become stale
    ])
  } catch {}
}

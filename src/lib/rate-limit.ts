/**
 * Rate limiter — uses Upstash Redis if configured, falls back to in-memory.
 * In-memory works per serverless instance (not cluster-safe).
 * Redis works globally across all Vercel instances.
 */

// ── In-memory fallback ────────────────────────────────────────────────────────
const store = new Map<string, number[]>()

function inMemoryRateLimit(key: string, limit: number, windowMs: number): boolean {
  const now   = Date.now()
  const times = (store.get(key) ?? []).filter(t => now - t < windowMs)
  if (times.length >= limit) return true
  store.set(key, [...times, now])
  return false
}

// ── Redis-backed rate limiter (Upstash) ───────────────────────────────────────
let redisRatelimit: any = null

function getRedisRatelimit() {
  if (redisRatelimit) return redisRatelimit
  if (!process.env.UPSTASH_REDIS_REST_URL || !process.env.UPSTASH_REDIS_REST_TOKEN) return null

  try {
    const { Redis }     = require('@upstash/redis')
    const { Ratelimit } = require('@upstash/ratelimit')
    const redis = new Redis({
      url:   process.env.UPSTASH_REDIS_REST_URL,
      token: process.env.UPSTASH_REDIS_REST_TOKEN,
    })
    redisRatelimit = { redis, Ratelimit }
    return redisRatelimit
  } catch { return null }
}

// ── Main export ───────────────────────────────────────────────────────────────
/**
 * @param key      Unique key — use `${route}:${ip}`
 * @param limit    Max requests allowed in the window
 * @param windowMs Time window in milliseconds
 * @returns true if request should be blocked
 */
export async function isRateLimited(key: string, limit: number, windowMs: number): Promise<boolean> {
  const rl = getRedisRatelimit()

  if (rl) {
    try {
      const { Ratelimit, redis } = rl
      const ratelimiter = new Ratelimit({
        redis,
        limiter: Ratelimit.slidingWindow(limit, `${Math.floor(windowMs / 1000)} s`),
        prefix:  'tpg_rl',
      })
      const { success } = await ratelimiter.limit(key)
      return !success
    } catch {
      // Redis error — fallback to in-memory
    }
  }

  return inMemoryRateLimit(key, limit, windowMs)
}

/** Extract IP from Next.js request headers */
export function getIP(req: Request): string {
  const fwd = (req.headers as any).get?.('x-forwarded-for')
  return fwd?.split(',')[0]?.trim() ?? 'unknown'
}

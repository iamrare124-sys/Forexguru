// src/lib/cache.js
// API responses cache karta hai — Groq aur external APIs ke unnecessary calls rokta hai

// ── In-Memory Cache ────────────────────────────────────────
// Vercel serverless ke liye — process restart pe clear hota hai
// Production mein Redis add kar sakte ho

const store = new Map()

class Cache {
  // Set value with TTL (time to live in seconds)
  set(key, value, ttlSeconds = 300) {
    store.set(key, {
      value,
      expiresAt: Date.now() + ttlSeconds * 1000,
      createdAt: Date.now(),
    })
    return value
  }

  // Get value (returns null if expired)
  get(key) {
    const item = store.get(key)
    if (!item) return null

    if (Date.now() > item.expiresAt) {
      store.delete(key)
      return null
    }

    return item.value
  }

  // Delete specific key
  delete(key) {
    store.delete(key)
  }

  // Clear all cache
  clear() {
    store.clear()
  }

  // Get or fetch — cache miss hone par callback call karo
  async getOrFetch(key, fetchFn, ttlSeconds = 300) {
    const cached = this.get(key)
    if (cached !== null) {
      return cached
    }

    const fresh = await fetchFn()
    if (fresh !== null && fresh !== undefined) {
      this.set(key, fresh, ttlSeconds)
    }
    return fresh
  }

  // Cache stats (for debugging)
  stats() {
    const now = Date.now()
    let active = 0, expired = 0

    for (const [key, item] of store.entries()) {
      if (now > item.expiresAt) expired++
      else active++
    }

    return { total: store.size, active, expired }
  }
}

export const cache = new Cache()

// ── TTL Constants ──────────────────────────────────────────
export const TTL = {
  LIVE_FOREX: 300,          // 5 min — forex rates
  LIVE_CRYPTO: 180,         // 3 min — crypto prices
  LIVE_STOCKS: 300,         // 5 min — stock prices
  LIVE_CRICKET: 60,         // 1 min — live cricket score
  NEWS_RSS: 600,            // 10 min — RSS feeds
  TRENDING_POSTS: 900,      // 15 min — trending posts list
  HOMEPAGE_POSTS: 300,      // 5 min — homepage post grid
  CATEGORY_POSTS: 600,      // 10 min — category page posts
  PEXELS_IMAGE: 3600,       // 1 hour — image search results
}

// ── Cache Key Builders ─────────────────────────────────────
export const cacheKey = {
  liveData: (niche) => `live:${niche}`,
  rss: (url) => `rss:${Buffer.from(url).toString('base64').slice(0, 20)}`,
  posts: (limit, offset, cat) => `posts:${limit}:${offset}:${cat || 'all'}`,
  trending: () => 'posts:trending',
  image: (query) => `img:${query.replace(/\s/g, '_').slice(0, 30)}`,
  postCount: (cat) => `count:${cat || 'all'}`,
}

// ── Cached Fetch Wrappers ──────────────────────────────────
// Live data ke liye — niche-specific TTL
export async function getCachedLiveData(niche, fetchFn) {
  const ttlMap = {
    forex: TTL.LIVE_FOREX,
    stocks: TTL.LIVE_STOCKS,
    crypto: TTL.LIVE_CRYPTO,
    cricket: TTL.LIVE_CRICKET,
  }

  const ttl = ttlMap[niche] || TTL.LIVE_FOREX
  return cache.getOrFetch(cacheKey.liveData(niche), fetchFn, ttl)
}

// RSS feeds ke liye
export async function getCachedRSS(url, fetchFn) {
  return cache.getOrFetch(cacheKey.rss(url), fetchFn, TTL.NEWS_RSS)
}

// Pexels images ke liye
export async function getCachedImage(query, fetchFn) {
  return cache.getOrFetch(cacheKey.image(query), fetchFn, TTL.PEXELS_IMAGE)
}

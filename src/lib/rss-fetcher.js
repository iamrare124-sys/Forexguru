// lib/rss-fetcher.js
// Multi-source news fetcher — 5 free sources
// Bug fixed: cutoff calculation was wrong, filtering all news out

import Parser from 'rss-parser'

const parser = new Parser({
  timeout: 12000,
  headers: {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    'Accept': 'application/rss+xml, application/xml, text/xml, */*',
  },
  customFields: {
    item: [['media:content', 'media'], ['content:encoded', 'contentEncoded']],
  },
})

// ── SOURCE 1: Google News RSS ──────────────────────────────
export async function fetchGoogleNews(queries, limit = 5) {
  const items = []
  const MAX_AGE_MS = 48 * 60 * 60 * 1000 // 48 hours — FIXED: was wrong calculation

  for (const query of queries) {
    try {
      const encoded = encodeURIComponent(query)
      const url = `https://news.google.com/rss/search?q=${encoded}&hl=en-IN&gl=IN&ceid=IN:en`
      const feed = await parser.parseURL(url)

      const fresh = feed.items.filter(item => {
        const pub = new Date(item.pubDate || item.isoDate || new Date())
        const age = Date.now() - pub.getTime() // FIXED: correct age calculation
        return age < MAX_AGE_MS && age > 0
      })

      const mapped = fresh.slice(0, limit).map(item => ({
        title: cleanText(item.title),
        link: item.link || item.guid,
        description: cleanText(
          item.contentSnippet || item.description || item.contentEncoded || ''
        ).replace(/<[^>]+>/g, '').slice(0, 500),
        publishedAt: item.pubDate || item.isoDate || new Date().toISOString(),
        source: 'Google News',
      }))

      items.push(...mapped)
    } catch (err) {
      console.error(`Google News failed [${query.slice(0, 30)}]:`, err.message)
    }
  }

  return dedup(items)
}

// ── SOURCE 2: Bing News RSS ────────────────────────────────
export async function fetchBingNews(queries, limit = 4) {
  const items = []
  const MAX_AGE_MS = 48 * 60 * 60 * 1000

  for (const query of queries.slice(0, 2)) {
    try {
      const encoded = encodeURIComponent(query)
      const url = `https://www.bing.com/news/search?q=${encoded}&format=rss&setmkt=en-IN`
      const feed = await parser.parseURL(url)

      const mapped = feed.items
        .filter(item => {
          const pub = new Date(item.pubDate || new Date())
          return Date.now() - pub.getTime() < MAX_AGE_MS
        })
        .slice(0, limit)
        .map(item => ({
          title: cleanText(item.title),
          link: item.link || item.guid,
          description: cleanText(item.contentSnippet || item.description || '').slice(0, 500),
          publishedAt: item.pubDate || new Date().toISOString(),
          source: 'Bing News',
        }))

      items.push(...mapped)
    } catch (err) {
      console.error(`Bing News failed:`, err.message)
    }
  }

  return dedup(items)
}

// ── SOURCE 3: Reddit RSS ───────────────────────────────────
export async function fetchRedditRSS(subreddits = [], limit = 3) {
  const items = []
  const MAX_AGE_MS = 24 * 60 * 60 * 1000 // Reddit: last 24h

  for (const sub of subreddits.slice(0, 3)) {
    try {
      const url = `https://www.reddit.com/r/${sub}/hot.json?limit=10`
      const res = await fetch(url, {
        headers: { 'User-Agent': 'ForexGuru/1.0 (news aggregator)' },
        next: { revalidate: 0 },
      })
      if (!res.ok) throw new Error(`Reddit ${sub} HTTP ${res.status}`)
      const json = await res.json()

      const posts = json?.data?.children || []
      const mapped = posts
        .filter(p => {
          const d = p.data
          if (d.is_self === false && !d.url) return false
          if (d.stickied || d.distinguished) return false
          if (d.title?.includes('[removed]') || d.title?.includes('[deleted]')) return false
          const age = Date.now() - d.created_utc * 1000
          return age < MAX_AGE_MS && age > 0
        })
        .slice(0, limit)
        .map(p => ({
          title: cleanText(p.data.title),
          link: `https://reddit.com${p.data.permalink}`,
          description: cleanText(p.data.selftext || p.data.title).slice(0, 400),
          publishedAt: new Date(p.data.created_utc * 1000).toISOString(),
          source: `r/${sub}`,
        }))

      items.push(...mapped)
    } catch (err) {
      console.error(`Reddit failed [r/${sub}]:`, err.message)
    }
  }

  return items.slice(0, limit)
}

// ── SOURCE 4: Yahoo Finance RSS ────────────────────────────
export async function fetchYahooFinance(topics = [], limit = 4) {
  const items = []
  const MAX_AGE_MS = 48 * 60 * 60 * 1000

  const yahooFeeds = [
    'https://finance.yahoo.com/news/rssindex',
    'https://feeds.finance.yahoo.com/rss/2.0/headline?s=USDINR=X&region=IN&lang=en-US',
    'https://feeds.finance.yahoo.com/rss/2.0/headline?s=INR=X&region=IN&lang=en-US',
  ]

  for (const url of yahooFeeds.slice(0, 2)) {
    try {
      const feed = await parser.parseURL(url)
      const mapped = feed.items
        .filter(item => {
          const pub = new Date(item.pubDate || new Date())
          return Date.now() - pub.getTime() < MAX_AGE_MS
        })
        .slice(0, limit)
        .map(item => ({
          title: cleanText(item.title),
          link: item.link || item.guid,
          description: cleanText(item.contentSnippet || item.description || '').slice(0, 500),
          publishedAt: item.pubDate || new Date().toISOString(),
          source: 'Yahoo Finance',
        }))
      items.push(...mapped)
    } catch (err) {
      console.error(`Yahoo Finance failed:`, err.message)
    }
  }

  return dedup(items).slice(0, limit)
}

// ── SOURCE 5: NewsAPI (free tier) ─────────────────────────
export async function fetchNewsAPI(keyword, limit = 3) {
  const key = process.env.NEWS_API_KEY
  if (!key) return []

  try {
    const url = `https://newsapi.org/v2/everything?q=${encodeURIComponent(keyword)}&language=en&sortBy=publishedAt&pageSize=${limit}&apiKey=${key}`
    const res = await fetch(url, { next: { revalidate: 0 } })
    if (!res.ok) throw new Error(`NewsAPI ${res.status}`)
    const data = await res.json()

    return (data.articles || [])
      .filter(a => a.title && a.title !== '[Removed]' && a.url)
      .slice(0, limit)
      .map(a => ({
        title: cleanText(a.title),
        link: a.url,
        description: cleanText(a.description || a.content || '').slice(0, 500),
        publishedAt: a.publishedAt || new Date().toISOString(),
        source: a.source?.name || 'NewsAPI',
      }))
  } catch (err) {
    console.error('NewsAPI failed:', err.message)
    return []
  }
}

// ── MAIN: Fetch from ALL sources ──────────────────────────
export async function fetchNewsFromRSS(rssUrls, limit = 5) {
  // This is called with niche RSS URLs — just use Google News
  return fetchGoogleNews(rssUrls, limit)
}

// ── COMBINED: All 5 sources at once ──────────────────────
export async function fetchAllSources(nicheConfig) {
  const { rss, reddit, seo } = nicheConfig
  const keyword = seo.primaryKeyword

  console.log('📡 Fetching from all 5 sources...')

  // Parallel fetch — all sources at once
  const [google, bing, redditPosts, yahoo, newsapi] = await Promise.allSettled([
    fetchGoogleNews(rss, 6),
    fetchBingNews([keyword, `${keyword} india`], 4),
    fetchRedditRSS(reddit || [], 4),
    fetchYahooFinance([], 4),
    fetchNewsAPI(keyword, 3),
  ])

  const all = [
    ...(google.status === 'fulfilled' ? google.value : []),
    ...(bing.status === 'fulfilled' ? bing.value : []),
    ...(redditPosts.status === 'fulfilled' ? redditPosts.value : []),
    ...(yahoo.status === 'fulfilled' ? yahoo.value : []),
    ...(newsapi.status === 'fulfilled' ? newsapi.value : []),
  ]

  // Stats
  const counts = {
    google: google.status === 'fulfilled' ? google.value.length : 0,
    bing: bing.status === 'fulfilled' ? bing.value.length : 0,
    reddit: redditPosts.status === 'fulfilled' ? redditPosts.value.length : 0,
    yahoo: yahoo.status === 'fulfilled' ? yahoo.value.length : 0,
    newsapi: newsapi.status === 'fulfilled' ? newsapi.value.length : 0,
  }
  console.log('📰 Sources:', JSON.stringify(counts))
  console.log('📰 Total unique items:', dedup(all).length)

  return dedup(all).sort((a, b) => new Date(b.publishedAt) - new Date(a.publishedAt))
}

// ── SELECT BEST STORY ─────────────────────────────────────
export function selectBestStory(items, nicheKeywords = []) {
  if (!items?.length) return null

  const now = Date.now()
  const scored = items.map(item => {
    let score = 0
    const text = `${item.title} ${item.description}`.toLowerCase()

    // Keyword match
    nicheKeywords.forEach(kw => {
      if (text.includes(kw.toLowerCase())) score += 3
    })

    // Recency scoring (hours old)
    const ageHours = (now - new Date(item.publishedAt).getTime()) / (1000 * 60 * 60)
    if (ageHours < 2) score += 12
    else if (ageHours < 6) score += 8
    else if (ageHours < 12) score += 5
    else if (ageHours < 24) score += 2
    else score += 0

    // Title length (longer = more specific)
    if (item.title?.length > 50) score += 2
    if (item.title?.length > 70) score += 1

    // Source diversity bonus
    if (item.source?.includes('Yahoo')) score += 1
    if (item.source?.includes('Reddit')) score -= 1 // Reddit lower priority

    // Penalize vague titles
    const vague = ['weekly', 'monthly', 'annual', 'report', 'reminder']
    if (vague.some(w => text.includes(w))) score -= 2

    return { ...item, score }
  })

  return scored.sort((a, b) => b.score - a.score)[0]
}

// ── UTILS ─────────────────────────────────────────────────
function cleanText(text) {
  if (!text) return ''
  return text
    .replace(/<[^>]*>/g, '')
    .replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/&nbsp;/g, ' ')
    .replace(/\s+/g, ' ').trim()
}

function dedup(items) {
  const seen = new Set()
  return items.filter(item => {
    if (!item.title || !item.link) return false
    // Dedupe by first 60 chars of title (handles slight variations)
    const key = item.title.toLowerCase().replace(/[^a-z0-9]/g, '').slice(0, 60)
    if (seen.has(key)) return false
    seen.add(key)
    return true
  })
}

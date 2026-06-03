// lib/rss-fetcher.js — Multi-source news fetcher
// Fixed: RSS age bug, Reddit API, all 4 sources with fallback

import Parser from 'rss-parser'

const parser = new Parser({
  timeout: 12000,
  headers: {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
    'Accept': 'application/rss+xml, application/xml, text/xml, */*',
  },
})

// FIXED: correct age calculation — milliseconds not timestamp
const MAX_AGE_MS = 48 * 60 * 60 * 1000 // 48 hours in ms

function clean(text) {
  if (!text) return ''
  return text
    .replace(/<[^>]+>/g, '')
    .replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/&nbsp;/g, ' ')
    .replace(/\s+/g, ' ').trim()
}

function dedup(items) {
  const seen = new Set()
  return items.filter(item => {
    if (!item.title || !item.link) return false
    const key = item.title.toLowerCase().replace(/[^a-z0-9]/g, '').slice(0, 60)
    if (seen.has(key)) return false
    seen.add(key)
    return true
  })
}

function isRecent(dateStr) {
  const pub = new Date(dateStr || new Date())
  const age = Date.now() - pub.getTime() // FIXED: age in ms
  return age > 0 && age < MAX_AGE_MS
}

// ── SOURCE 1: Google News RSS ──────────────────
export async function fetchNewsFromRSS(urls, limit = 6) {
  const items = []
  for (const url of urls) {
    try {
      const feed = await parser.parseURL(url)
      const fresh = feed.items.filter(item => isRecent(item.pubDate || item.isoDate))
      items.push(...fresh.slice(0, limit).map(item => ({
        title: clean(item.title),
        link: item.link || item.guid,
        description: clean(item.contentSnippet || item.description || '').slice(0, 500),
        publishedAt: item.pubDate || item.isoDate || new Date().toISOString(),
        source: 'Google News',
      })))
    } catch (err) {
      console.error(`Google News RSS failed [${url.slice(0, 60)}]:`, err.message)
    }
  }
  return dedup(items)
}

// ── SOURCE 2: Bing News RSS ────────────────────
async function fetchBing(queries) {
  const items = []
  for (const q of queries.slice(0, 2)) {
    try {
      const url = `https://www.bing.com/news/search?q=${encodeURIComponent(q)}&format=rss&setmkt=en-IN`
      const feed = await parser.parseURL(url)
      const fresh = feed.items.filter(item => isRecent(item.pubDate))
      items.push(...fresh.slice(0, 4).map(item => ({
        title: clean(item.title),
        link: item.link || item.guid,
        description: clean(item.contentSnippet || '').slice(0, 500),
        publishedAt: item.pubDate || new Date().toISOString(),
        source: 'Bing News',
      })))
    } catch (err) {
      console.error(`Bing News failed [${q}]:`, err.message)
    }
  }
  return items
}

// ── SOURCE 3: Reddit JSON API ──────────────────
async function fetchReddit(subreddits) {
  const items = []
  for (const sub of (subreddits || []).slice(0, 2)) {
    try {
      const res = await fetch(
        `https://www.reddit.com/r/${sub}/hot.json?limit=10`,
        {
          headers: { 'User-Agent': 'SyndicateHub/1.0 news-aggregator' },
          next: { revalidate: 0 },
        }
      )
      if (!res.ok) {
        console.error(`Reddit r/${sub} HTTP ${res.status}`)
        continue
      }
      const json = await res.json()
      const posts = json?.data?.children || []
      const fresh = posts.filter(p => {
        const age = Date.now() - p.data.created_utc * 1000
        return age > 0 && age < 24 * 60 * 60 * 1000 && !p.data.stickied && !p.data.distinguished
      })
      items.push(...fresh.slice(0, 3).map(p => ({
        title: clean(p.data.title),
        link: `https://reddit.com${p.data.permalink}`,
        description: clean(p.data.selftext || p.data.title).slice(0, 400),
        publishedAt: new Date(p.data.created_utc * 1000).toISOString(),
        source: `r/${sub}`,
      })))
    } catch (err) {
      console.error(`Reddit r/${sub} failed:`, err.message)
    }
  }
  return items
}

// ── SOURCE 4: Yahoo Finance RSS ────────────────
async function fetchYahoo() {
  try {
    const feed = await parser.parseURL('https://finance.yahoo.com/news/rssindex')
    return feed.items
      .filter(item => isRecent(item.pubDate))
      .slice(0, 4)
      .map(item => ({
        title: clean(item.title),
        link: item.link || item.guid,
        description: clean(item.contentSnippet || '').slice(0, 500),
        publishedAt: item.pubDate || new Date().toISOString(),
        source: 'Yahoo Finance',
      }))
  } catch (err) {
    console.error('Yahoo Finance failed:', err.message)
    return []
  }
}

// ── MAIN: All 4 sources in parallel ───────────
export async function fetchAllSources(nicheConfig) {
  const { rss, reddit, seo } = nicheConfig
  const keyword = seo.primaryKeyword

  console.log(`\n📡 Fetching news for: ${keyword}`)

  const [google, bing, red, yahoo] = await Promise.allSettled([
    fetchNewsFromRSS(rss, 6),
    fetchBing([keyword, `${keyword} india`]),
    fetchReddit(reddit || []),
    fetchYahoo(),
  ])

  const counts = {
    google: google.status === 'fulfilled' ? google.value.length : 0,
    bing: bing.status === 'fulfilled' ? bing.value.length : 0,
    reddit: red.status === 'fulfilled' ? red.value.length : 0,
    yahoo: yahoo.status === 'fulfilled' ? yahoo.value.length : 0,
  }
  console.log('📰 Source counts:', JSON.stringify(counts))

  const all = [
    ...(google.status === 'fulfilled' ? google.value : []),
    ...(bing.status === 'fulfilled' ? bing.value : []),
    ...(red.status === 'fulfilled' ? red.value : []),
    ...(yahoo.status === 'fulfilled' ? yahoo.value : []),
  ]

  const result = dedup(all).sort((a, b) => new Date(b.publishedAt) - new Date(a.publishedAt))
  console.log(`📰 Total unique stories: ${result.length}`)
  return result
}

export function selectBestStory(items, keywords = []) {
  if (!items?.length) return null
  const now = Date.now()
  return items.map(item => {
    let score = 0
    const text = `${item.title} ${item.description}`.toLowerCase()
    keywords.forEach(kw => { if (text.includes(kw.toLowerCase())) score += 3 })
    const ageH = (now - new Date(item.publishedAt).getTime()) / 3600000
    if (ageH < 2) score += 12
    else if (ageH < 6) score += 8
    else if (ageH < 12) score += 5
    else if (ageH < 24) score += 2
    if (item.title?.length > 50) score += 2
    if (item.source?.includes('Yahoo') || item.source?.includes('Google')) score += 1
    return { ...item, score }
  }).sort((a, b) => b.score - a.score)[0]
}

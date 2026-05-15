// lib/blog-generator.js
// Groq-powered blog generator with proper error handling

import Groq from 'groq-sdk'

// Lazy init — never use placeholder key
let _groq = null
function getGroq() {
  const key = process.env.GROQ_API_KEY
  if (!key || key === 'your_groq_key_here' || key.length < 10) {
    throw new Error('GROQ_API_KEY is missing or invalid. Set it in Vercel Environment Variables.')
  }
  if (!_groq) _groq = new Groq({ apiKey: key })
  return _groq
}

// ── Trending topics from Google Trends ─────────────────
async function fetchTrendingKeywords() {
  try {
    const res = await fetch(
      'https://trends.google.com/trends/trendingsearches/daily/rss?geo=IN',
      { headers: { 'User-Agent': 'Mozilla/5.0' }, signal: AbortSignal.timeout(5000) }
    )
    if (!res.ok) return []
    const text = await res.text()
    const titles = [...text.matchAll(/<title><!\[CDATA\[(.+?)\]\]><\/title>/g)]
      .map(m => m[1]).filter(t => t.length > 3 && !t.includes('Daily Search')).slice(0, 4)
    return titles
  } catch { return [] }
}

// ── FAQ bank ────────────────────────────────────────────
const FAQ_BANK = {
  forex: [
    'What is the USD to INR rate today?',
    'Is forex trading legal in India?',
    'Why is the rupee falling against the dollar?',
    'What is the best time to convert USD to INR?',
    'How to start forex trading in India as a beginner?',
    'Will the dollar rate increase this week?',
    'Best forex broker in India 2026',
    'How does RBI control the rupee exchange rate?',
  ],
  default: [
    'What does this mean for Indian investors?',
    'How will this affect the Indian rupee?',
    'What should Indian traders do now?',
    'How does this impact the Indian economy?',
  ],
}

function getFAQs(primaryKeyword, newsTitle) {
  const k = primaryKeyword.toLowerCase()
  let bank = FAQ_BANK.default
  if (k.includes('forex') || k.includes('usd') || k.includes('rupee') || k.includes('inr')) {
    bank = FAQ_BANK.forex
  }
  const shuffled = [...bank].sort(() => Math.random() - 0.5)
  const newsQ = `${newsTitle.slice(0, 55).trim()}${newsTitle.length > 55 ? '...' : ''} — what does this mean?`
  return [newsQ, shuffled[0], shuffled[1], shuffled[2]]
}

// ── Article structures (rotate for variety) ────────────
const STRUCTURES = [
  ['What Happened Today', 'Why the Rupee Moved', 'Who Gets Affected', 'Expert Opinions', 'What You Should Do Now'],
  ['The Situation Right Now', 'How We Got Here', 'India Angle', 'What Traders Are Doing', 'Bottom Line'],
  ['Breaking: What Just Changed', 'The Numbers Behind the Move', 'Impact on Your Money', 'Market Outlook', 'Action Steps'],
  ['Is This a Trend or a Blip?', 'The Real Story', 'Winners and Losers', 'RBI Watch', 'Your Next Move'],
]

// ── Main generation function ────────────────────────────
export async function generateBlogPost({ newsItem, liveDataText, nicheConfig }) {
  const { ai, seo, author } = nicheConfig
  const model = ai?.model || 'llama-3.3-70b-versatile'

  // Validate inputs
  if (!newsItem?.title) throw new Error('newsItem.title is required')

  // Get trending + FAQs
  const trending = await fetchTrendingKeywords()
  const trendingText = trending.length > 0 ? `Trending in India: ${trending.join(', ')}` : ''
  const faqs = getFAQs(seo.primaryKeyword, newsItem.title)
  const structure = STRUCTURES[Math.floor(Math.random() * STRUCTURES.length)]

  const systemPrompt = `You are ${author.name}, ${author.title}, writing for ${nicheConfig.site.name}.

BANNED PHRASES — never use these:
"In this article", "Furthermore", "Moreover", "Additionally", "It is important to note",
"In conclusion", "To summarize", "Delve into", "Navigate", "Landscape", "Comprehensive",
"Robust", "Shed light on", "It's worth noting", "As we can see"

WRITING RULES:
- Open with a fact + specific number. No warm-up sentences.
- Write in direct, confident Indian English
- Short paragraphs — max 3 sentences each
- Mix short punchy sentences with detailed ones
- Include India-specific examples (NRI, Indian banks, Indian traders)
- Have ONE strong opinion or disagreement per article
- End with a specific actionable tip for the reader`

  const userPrompt = `NEWS: "${newsItem.title}"
SUMMARY: ${newsItem.description?.slice(0, 300) || newsItem.title}
SOURCE: ${newsItem.source || 'News'}
LIVE DATA: ${liveDataText || 'rates unavailable'}
${trendingText}

Write an 850-word SEO article using this structure: ${structure.join(' → ')}

Output in this EXACT format (no markdown, no extra text):

TITLE: [compelling headline, max 65 chars, include "${seo.primaryKeyword}"]
META_TITLE: [SEO title, 55-60 chars exactly]
META_DESC: [155 chars exactly, include primary keyword]
CATEGORY: ${seo.categories[Math.floor(Math.random() * seo.categories.length)].slug}
TAGS: [tag1, tag2, tag3, tag4, tag5]

CONTENT:
[Full 850-word article. Use ## for H2 headings. Start immediately with news hook + live data.]

FAQ:
Q: ${faqs[0]}
A: [2-3 sentence answer]

Q: ${faqs[1]}
A: [2-3 sentence answer]

Q: ${faqs[2]}
A: [2-3 sentence answer]

Q: ${faqs[3]}
A: [2-3 sentence answer]

END`

  // Try up to 3 times
  let lastError = null
  for (let attempt = 1; attempt <= 3; attempt++) {
    try {
      console.log(`🤖 Groq attempt ${attempt}/3...`)

      const completion = await getGroq().chat.completions.create({
        model,
        max_tokens: 2500,
        temperature: 0.8 + (attempt - 1) * 0.05, // slight increase each retry
        top_p: 0.9,
        frequency_penalty: 0.4,
        presence_penalty: 0.3,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt },
        ],
      })

      const raw = completion.choices[0]?.message?.content || ''
      if (!raw || raw.length < 200) {
        console.warn(`⚠️  Attempt ${attempt}: Response too short (${raw.length} chars)`)
        lastError = new Error('Response too short')
        continue
      }

      console.log(`✅ Groq responded: ${raw.length} chars`)

      // Parse response
      const parsed = parseResponse(raw)

      if (!parsed.title || parsed.content.length < 300) {
        console.warn(`⚠️  Attempt ${attempt}: Parse failed — title:"${parsed.title?.slice(0,30)}" content:${parsed.content.length}chars`)
        lastError = new Error('Parse failed — missing title or content too short')
        continue
      }

      // Quality check (local — no extra API call)
      const quality = localQualityCheck(parsed)
      console.log(`📊 Quality score: ${quality.score}/10 — ${quality.issues.join(', ') || 'all good'}`)

      if (quality.score < 5 && attempt < 3) {
        lastError = new Error(`Quality score too low: ${quality.score}`)
        continue
      }

      // Calculate word count and reading time
      const wordCount = parsed.content.split(/\s+/).length
      const readingTime = Math.max(3, Math.ceil(wordCount / 220))

      return {
        title: parsed.title,
        metaTitle: parsed.metaTitle || parsed.title.slice(0, 60),
        metaDescription: parsed.metaDescription || parsed.title.slice(0, 155),
        category: parsed.category || seo.categories[0].slug,
        tags: parsed.tags || [seo.primaryKeyword, 'forex', 'india', 'currency', 'rupee'],
        content: {
          hook: parsed.content.split('\n\n')[0] || '',
          sections: parseSections(parsed.content),
          faq: parsed.faqs,
          conclusion: '',
        },
        wordCount,
        readingTime,
        aiScore: quality.score,
        rawContent: parsed.content,
      }

    } catch (err) {
      console.error(`❌ Attempt ${attempt} error:`, err.message)
      lastError = err
      if (attempt < 3) await new Promise(r => setTimeout(r, 2000))
    }
  }

  throw lastError || new Error('All 3 Groq attempts failed')
}

// ── Parse Groq response ─────────────────────────────────
function parseResponse(raw) {
  const lines = raw.split('\n')

  const get = (prefix) => {
    const line = lines.find(l => l.startsWith(prefix))
    return line ? line.replace(prefix, '').trim() : ''
  }

  // Extract sections
  const contentStart = raw.indexOf('\nCONTENT:\n')
  const faqStart = raw.indexOf('\nFAQ:\n')
  const endMark = raw.indexOf('\nEND')

  let content = ''
  if (contentStart !== -1) {
    const end = faqStart !== -1 ? faqStart : endMark !== -1 ? endMark : raw.length
    content = raw.slice(contentStart + 10, end).trim()
  } else {
    // Fallback: take everything after TAGS line
    const tagsIdx = raw.indexOf('TAGS:')
    if (tagsIdx !== -1) {
      content = raw.slice(tagsIdx + 50, faqStart !== -1 ? faqStart : raw.length).trim()
    }
  }

  // Parse FAQs
  const faqs = []
  if (faqStart !== -1) {
    const faqBlock = raw.slice(faqStart + 6, endMark !== -1 ? endMark : raw.length)
    const qMatches = [...faqBlock.matchAll(/Q:\s*(.+?)\nA:\s*([\s\S]+?)(?=\nQ:|\n*$)/g)]
    qMatches.forEach(m => {
      faqs.push({
        question: m[1].trim(),
        answer: m[2].trim().replace(/\n/g, ' ').slice(0, 400),
      })
    })
  }

  // Parse tags
  const tagsRaw = get('TAGS:')
  const tags = tagsRaw
    .replace(/[\[\]]/g, '')
    .split(',')
    .map(t => t.trim())
    .filter(Boolean)
    .slice(0, 5)

  return {
    title: get('TITLE:'),
    metaTitle: get('META_TITLE:'),
    metaDescription: (() => {
      // Try multiple possible formats Groq might output
      const raw = get('META_DESC:') || get('Meta Description:') || get('META DESCRIPTION:') || ''
      const cleaned = raw.replace(/["\[\]]/g, '').trim()
      if (cleaned.length > 20) return cleaned.slice(0, 160)
      // Fallback: extract from content hook (first 155 chars)
      const hook = content?.split('\n')[0]?.replace(/^#+\s*/, '').trim() || ''
      return hook.slice(0, 155) || ''
    })(),
    category: get('CATEGORY:'),
    tags,
    content,
    faqs: faqs.slice(0, 4),
  }
}

// ── Parse content into sections (robust — handles any heading format) ─────
function parseSections(rawContent) {
  if (!rawContent || rawContent.length < 50) return []

  const sections = []

  // Normalize: handle ## or # or **Heading** or just lines
  // Split on any heading pattern: ##, #, **Bold heading**
  const headingRegex = /\n(?:#{1,3}\s+|\*\*([^*]+)\*\*\s*\n)/g

  // Try ## split first
  if (rawContent.includes('\n## ') || rawContent.includes('\n# ')) {
    const parts = rawContent.split(/\n#{1,3}\s+/)
    parts.forEach((part, i) => {
      if (!part.trim()) return
      if (i === 0) {
        // Content before first heading — intro paragraphs
        const paras = part.trim().split(/\n\n+/).filter(p => p.trim().length > 20)
        paras.forEach(p => sections.push({ h2: null, body: cleanPara(p) }))
      } else {
        const lines = part.trim().split('\n')
        const h2 = lines[0]?.replace(/[*_#]/g, '').trim()
        const body = lines.slice(1).join('\n\n').trim()
        if (body.length > 20) sections.push({ h2, body: cleanPara(body) })
      }
    })
  } else {
    // No headings — split into paragraph sections
    const paras = rawContent.split(/\n\n+/).filter(p => p.trim().length > 30)
    let current = { h2: null, body: '' }

    paras.forEach(para => {
      const trimmed = para.trim()
      // Detect bold heading pattern: **Something**
      const boldHeading = trimmed.match(/^\*\*([^*]+)\*\*\s*$/)
      if (boldHeading) {
        if (current.body.length > 20) sections.push({ ...current })
        current = { h2: boldHeading[1].trim(), body: '' }
      } else {
        current.body += (current.body ? '\n\n' : '') + trimmed
      }
    })
    if (current.body.length > 20) sections.push(current)
  }

  const result = sections.filter(s => s.body?.trim().length > 10)

  // If still empty, fallback: put all content in one section
  if (result.length === 0 && rawContent.length > 100) {
    const paras = rawContent.split(/\n\n+/).filter(p => p.trim().length > 30)
    return paras.slice(0, 8).map(p => ({ h2: null, body: cleanPara(p) }))
  }

  return result
}

function cleanPara(text) {
  if (!text) return ''
  return text
    .replace(/\*\*([^*]+)\*\*/g, '$1') // remove bold markdown
    .replace(/\*([^*]+)\*/g, '$1')       // remove italic
    .replace(/^[-*]\s+/gm, '')            // remove list markers
    .trim()
}

// ── Local quality check (no extra API call) ─────────────
function localQualityCheck(parsed) {
  const issues = []
  let score = 5

  const text = `${parsed.title} ${parsed.content}`.toLowerCase()

  // Check banned phrases
  const banned = ['in this article', 'furthermore', 'it is important to note', 'in conclusion', 'delve into']
  const hasBanned = banned.filter(p => text.includes(p))
  if (hasBanned.length === 0) score += 2
  else { issues.push(`banned: ${hasBanned.join(', ')}`); score -= 1 }

  // Check first sentence has number
  const firstSentence = parsed.content.slice(0, 200)
  if (/\d/.test(firstSentence)) score += 1
  else issues.push('no number in opening')

  // Check FAQ count
  if (parsed.faqs?.length >= 4) score += 1
  else issues.push(`only ${parsed.faqs?.length} FAQs`)

  // Check word count
  const words = parsed.content.split(/\s+/).length
  if (words >= 600) score += 1
  else issues.push(`short: ${words} words`)

  return { score: Math.min(10, score), issues }
}

// ── Generate URL slug ───────────────────────────────────
export function generateSlug(title) {
  const base = title
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .slice(0, 70)
  // Add short timestamp to avoid duplicates
  const ts = Date.now().toString(36).slice(-4)
  return `${base}-${ts}`
}

// ── Generate JSON-LD Schema ─────────────────────────────
export function generateSchema({ post, nicheConfig, url }) {
  const { site, author } = nicheConfig
  const schemas = [
    {
      '@context': 'https://schema.org',
      '@type': 'NewsArticle',
      headline: post.title,
      description: post.metaDescription,
      url,
      datePublished: new Date().toISOString(),
      dateModified: new Date().toISOString(),
      author: { '@type': 'Person', name: author.name, jobTitle: author.title },
      publisher: {
        '@type': 'Organization',
        name: site.name,
        url: `https://${site.domain}`,
        logo: { '@type': 'ImageObject', url: `https://${site.domain}/logo.png` },
      },
      image: post.coverImage ? [{ '@type': 'ImageObject', url: post.coverImage }] : undefined,
      keywords: post.tags?.join(', '),
      inLanguage: 'en-IN',
    },
  ]

  if (post.content?.faq?.length) {
    schemas.push({
      '@context': 'https://schema.org',
      '@type': 'FAQPage',
      mainEntity: post.content.faq.map(f => ({
        '@type': 'Question',
        name: f.question,
        acceptedAnswer: { '@type': 'Answer', text: f.answer },
      })),
    })
  }

  return schemas
}

// Backward compat export
export async function rewritePostInLanguage(post) { return post }

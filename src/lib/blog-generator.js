// lib/blog-generator.js — AI Content Generator
// Fixed: humanize pass, anti-AI-detection rules, better quality check

import Groq from 'groq-sdk'

let _groq = null
function getGroq() {
  if (!_groq) _groq = new Groq({ apiKey: process.env.GROQ_API_KEY || 'placeholder' })
  return _groq
}

// ── Parse sections from raw content ────────────
function parseSections(rawContent) {
  if (!rawContent || rawContent.length < 50) return []
  const sections = []

  if (rawContent.includes('\n## ') || rawContent.includes('\n# ')) {
    const parts = rawContent.split(/\n#{1,3}\s+/)
    parts.forEach((part, i) => {
      if (!part.trim()) return
      if (i === 0) {
        part.trim().split(/\n\n+/).filter(p => p.trim().length > 20)
          .forEach(p => sections.push({ h2: null, body: cleanPara(p) }))
      } else {
        const lines = part.trim().split('\n')
        const h2 = lines[0]?.replace(/[*_#]/g, '').trim()
        const body = lines.slice(1).join('\n\n').trim()
        if (body.length > 20) sections.push({ h2, body: cleanPara(body) })
      }
    })
  } else {
    const paras = rawContent.split(/\n\n+/).filter(p => p.trim().length > 30)
    let current = { h2: null, body: '' }
    paras.forEach(para => {
      const bold = para.trim().match(/^\*\*([^*]+)\*\*\s*$/)
      if (bold) {
        if (current.body.length > 20) sections.push({ ...current })
        current = { h2: bold[1].trim(), body: '' }
      } else {
        current.body += (current.body ? '\n\n' : '') + para.trim()
      }
    })
    if (current.body.length > 20) sections.push(current)
  }

  const result = sections.filter(s => s.body?.trim().length > 10)
  if (!result.length && rawContent.length > 100) {
    return rawContent.split(/\n\n+/).filter(p => p.trim().length > 30)
      .slice(0, 8).map(p => ({ h2: null, body: cleanPara(p) }))
  }
  return result
}

function cleanPara(text) {
  if (!text) return ''
  return text
    .replace(/\*\*([^*]+)\*\*/g, '$1')
    .replace(/\*([^*]+)\*/g, '$1')
    .replace(/^[-*]\s+/gm, '')
    .trim()
}

function parseFAQ(raw) {
  const faqs = []
  const matches = [...raw.matchAll(/Q:\s*(.+?)\nA:\s*([\s\S]+?)(?=\nQ:|\n*$)/g)]
  for (const m of matches) {
    faqs.push({ question: m[1].trim(), answer: m[2].trim().replace(/\n/g, ' ').slice(0, 300) })
  }
  return faqs.slice(0, 4)
}

// ── HUMANIZE PASS — removes AI patterns ────────
async function humanizeContent(rawContent) {
  if (!rawContent || rawContent.length < 200) return rawContent
  try {
    const completion = await getGroq().chat.completions.create({
      model: 'llama-3.3-70b-versatile',
      max_tokens: 2000,
      temperature: 0.92,
      messages: [{
        role: 'user',
        content: `Rewrite this article to sound like a real human journalist — not AI.

STRICT RULES:
1. Break any sentence over 25 words into 2 shorter ones
2. Use contractions everywhere: it's, don't, won't, here's, that's, they're, I'd
3. Start 2-3 sentences with "And" or "But" — real journalists do this
4. Add 1 conversational aside like: "And honestly?", "Here's the thing —", "Look,", "Real talk:", "Worth noting:"
5. Use em-dashes for interruptions — like this — instead of commas where natural
6. Include 1 rhetorical question
7. Remove ALL of these phrases if present:
   - "it is worth noting / it should be noted / one must consider"
   - "in light of / with regard to / in terms of"
   - "needless to say / it goes without saying / as mentioned"
   - "it is important to note / furthermore / moreover"
   - "comprehensive / robust / delve into / navigate / landscape"
8. Keep ALL facts, numbers, names, and quotes EXACTLY the same
9. Keep the same ## headings and structure
10. Output ONLY the rewritten article — no intro, no explanation

ARTICLE TO REWRITE:
${rawContent.slice(0, 3000)}`
      }]
    })
    const humanized = completion.choices[0]?.message?.content?.trim()
    if (humanized && humanized.length > rawContent.length * 0.5) {
      console.log('✅ Humanize pass complete')
      return humanized
    }
    return rawContent
  } catch (err) {
    console.warn('Humanize pass failed (using original):', err.message)
    return rawContent
  }
}

// ── Anti-AI pattern detection ───────────────────
const AI_PATTERNS = [
  'it is worth noting', 'it should be noted', 'one must consider',
  'in light of', 'with regard to', 'in terms of',
  'needless to say', 'it goes without saying', 'as previously mentioned',
  'it is important to note', 'it is important to', 'needless to',
  'comprehensive', 'delve into', 'robust solution', 'shed light on',
  'navigate the', 'landscape of', 'in conclusion', 'to summarize',
  'furthermore', 'moreover', 'additionally', 'in this article',
  'this article will', 'we will explore',
]

function hasAIPatterns(text) {
  const lower = text.toLowerCase()
  return AI_PATTERNS.filter(p => lower.includes(p))
}

// ── MAIN GENERATOR ──────────────────────────────
export async function generateBlogPost({ newsItem, liveDataText, nicheConfig }) {
  const { ai, seo } = nicheConfig

  const ANTI_AI_RULES = `
ANTI-AI-DETECTION — FOLLOW STRICTLY:
1. VARY sentence length aggressively: short (5 words). Then longer analytical sentence with specific detail. Then medium. Never 3 same-length in a row.
2. USE contractions always: it's, don't, won't, here's, that's, they're
3. START 2-3 sentences with "And" or "But"
4. ADD one aside per article: "And honestly?", "Here's the thing —", "Look,", "Real talk:", "Worth noting:"
5. USE em-dash for interruptions — like this — not just commas
6. INCLUDE one rhetorical question
7. NEVER use: furthermore, moreover, additionally, in conclusion, it is worth noting, needless to say, comprehensive, robust, delve into, in this article
8. ACTIVE voice always. "The RBI raised rates" not "Rates were raised by the RBI"
9. SPECIFIC numbers in first 2 sentences always
10. ONE strong opinion stated as fact per article`

  const userPrompt = `NEWS: "${newsItem.title}"
SUMMARY: ${newsItem.description?.slice(0, 300) || newsItem.title}
PUBLISHED: ${new Date(newsItem.publishedAt).toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })}
LIVE DATA: ${liveDataText || 'Live data loading'}

Write an 850-word SEO article. Format EXACTLY:

TITLE: [65 chars max, include "${seo.primaryKeyword}" naturally]
META_TITLE: [55-60 chars]
META_DESC: [148-158 chars with keyword]
TAGS: [tag1, tag2, tag3, tag4, tag5]
CATEGORY: [one of: ${seo.categories.map(c => c.slug).join(', ')}]

CONTENT:
[Full article. Start with fact+number. Use ## headings. 850 words min.]

FAQ:
Q: [real Google search question about this topic]
A: [2-3 sentence answer]

Q: [real Google search question]
A: [2-3 sentence answer]

Q: [real Google search question]
A: [2-3 sentence answer]

Q: [real Google search question]
A: [2-3 sentence answer]

END`

  const fullSystemPrompt = `${ai.systemPrompt}\n\n${ANTI_AI_RULES}`

  let attempt = 0
  while (attempt < (ai.maxRetries || 3)) {
    attempt++
    try {
      const completion = await getGroq().chat.completions.create({
        model: ai.model || 'llama-3.3-70b-versatile',
        max_tokens: 2400,
        temperature: ai.temperature || 0.85,
        top_p: ai.top_p || 0.9,
        frequency_penalty: ai.frequency_penalty || 0.5,
        presence_penalty: ai.presence_penalty || 0.4,
        messages: [
          { role: 'system', content: fullSystemPrompt },
          { role: 'user', content: userPrompt },
        ],
      })

      const raw = completion.choices[0]?.message?.content || ''

      const get = (prefix) => {
        const variations = [prefix, prefix.toLowerCase(), prefix.toUpperCase()]
        for (const v of variations) {
          const line = raw.split('\n').find(l => l.trim().startsWith(v))
          if (line) return line.replace(new RegExp(`^${v}`, 'i'), '').replace(/^:\s*/, '').replace(/["\[\]]/g, '').trim()
        }
        return ''
      }

      const contentStart = raw.indexOf('CONTENT:')
      const faqStart = raw.indexOf('\nFAQ:')
      const endMark = raw.indexOf('\nEND')
      const contentRaw = contentStart !== -1
        ? raw.slice(contentStart + 8, faqStart !== -1 ? faqStart : endMark !== -1 ? endMark : undefined).trim()
        : ''
      const faqRaw = faqStart !== -1
        ? raw.slice(faqStart + 5, endMark !== -1 ? endMark : undefined)
        : ''

      if (!contentRaw || contentRaw.length < 400) {
        console.warn(`Attempt ${attempt}: content too short (${contentRaw.length} chars)`)
        continue
      }

      // AI pattern check
      const foundPatterns = hasAIPatterns(contentRaw)
      if (foundPatterns.length > 2) {
        console.warn(`Attempt ${attempt}: ${foundPatterns.length} AI patterns found: ${foundPatterns.slice(0, 3).join(', ')}`)
        if (attempt < (ai.maxRetries || 3)) continue
      }

      // Humanize pass
      const humanizedContent = await humanizeContent(contentRaw)

      const sections = parseSections(humanizedContent)
      const faq = parseFAQ(faqRaw)

      const metaDesc = (() => {
        const raw = get('META_DESC:') || get('Meta Description:') || ''
        const cleaned = raw.replace(/["\[\]]/g, '').trim()
        if (cleaned.length > 20) return cleaned.slice(0, 160)
        return (sections[0]?.body || humanizedContent).slice(0, 155)
      })()

      const tagsRaw = get('TAGS:')
      const tags = tagsRaw.split(',').map(t => t.trim()).filter(Boolean).slice(0, 7)
      const categoryRaw = get('CATEGORY:')
      const validCategories = seo.categories.map(c => c.slug)
      const category = validCategories.includes(categoryRaw) ? categoryRaw : validCategories[0]

      const wordCount = humanizedContent.split(/\s+/).length
      const remainingAI = hasAIPatterns(humanizedContent)

      const parsed = {
        title: get('TITLE:'),
        metaTitle: get('META_TITLE:') || get('META_TITLE') || '',
        metaDescription: metaDesc,
        tags,
        category,
        content: {
          hook: sections[0]?.h2 === null ? sections[0]?.body : null,
          sections: sections[0]?.h2 === null ? sections.slice(1) : sections,
          faq,
          rawContent: humanizedContent,
        },
        rawContent: humanizedContent,
        readingTime: Math.ceil(wordCount / 220),
        wordCount,
        aiScore: 10
          - Math.min(remainingAI.length, 3)
          - (faq.length < 4 ? 1 : 0)
          - (wordCount < 700 ? 2 : 0)
          - (!/\d/.test(humanizedContent.slice(0, 200)) ? 1 : 0),
      }

      if (!parsed.title || !humanizedContent) {
        console.warn(`Attempt ${attempt}: parse failed`)
        continue
      }

      console.log(`✅ Generated: "${parsed.title.slice(0, 60)}" | words: ${wordCount} | AI score: ${parsed.aiScore} | patterns left: ${remainingAI.length}`)
      return parsed

    } catch (err) {
      console.error(`Attempt ${attempt} exception:`, err.message)
      if (attempt >= (ai.maxRetries || 3)) throw err
    }
  }
  throw new Error('All generation attempts failed')
}

export function generateSlug(title) {
  return title.toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 75) + '-' + Date.now().toString(36)
}

export function generateSchema({ post, nicheConfig, url }) {
  const { site, author } = nicheConfig
  const schemas = [{
    '@context': 'https://schema.org',
    '@type': 'NewsArticle',
    headline: post.title,
    description: post.metaDescription,
    url,
    datePublished: new Date().toISOString(),
    dateModified: new Date().toISOString(),
    author: { '@type': 'Person', name: author.name, jobTitle: author.title, url: `https://${site.domain}/about` },
    publisher: { '@type': 'Organization', name: site.name, url: `https://${site.domain}`, logo: { '@type': 'ImageObject', url: `https://${site.domain}/logo.png` } },
    image: post.coverImage ? [{ '@type': 'ImageObject', url: post.coverImage, width: 1200, height: 630 }] : undefined,
    keywords: post.tags?.join(', '),
    inLanguage: 'en-IN',
    isAccessibleForFree: true,
  }]
  if (post.content?.faq?.length) {
    schemas.push({
      '@context': 'https://schema.org',
      '@type': 'FAQPage',
      mainEntity: post.content.faq.map(f => ({ '@type': 'Question', name: f.question, acceptedAnswer: { '@type': 'Answer', text: f.answer } })),
    })
  }
  return schemas
}

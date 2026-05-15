// src/app/api/publish/route.js
// Main dashboard se manual post push karne ke liye

import { NextResponse } from 'next/server'
import { savePost, postExists } from '@/lib/supabase'
import { generateBlogPost, generateSlug, generateSchema } from '@/lib/blog-generator'
import { fetchCoverImage } from '@/lib/image-fetcher'
import { fetchLiveData, formatLiveDataForPost } from '@/lib/live-data'
import { verifyApiPassword, rateLimit, getClientIP, apiError, apiResponse, sanitizeString } from '@/lib/security'
import { nicheConfig } from '@/config/site.config'

export const maxDuration = 60
export const dynamic = 'force-dynamic'

export async function POST(request) {
  // ── Rate Limit Check ───────────────────────────────────
  const ip = getClientIP(request)
  const limit = rateLimit(ip, 10)  // Max 10 publish calls per minute per IP

  if (!limit.allowed) {
    return apiError('Rate limit exceeded. Try again in a minute.', 429)
  }

  // ── Auth Check ─────────────────────────────────────────
  if (!verifyApiPassword(request)) {
    return apiError('Invalid API password', 401)
  }

  // ── Parse Body ─────────────────────────────────────────
  let body
  try {
    body = await request.json()
  } catch {
    return apiError('Invalid JSON body', 400)
  }

  const { type, data } = body

  // ── Handle Different Publish Types ────────────────────
  switch (type) {

    // Publish from news URL/headline
    case 'from_news': {
      const headline = sanitizeString(data?.headline, 200)
      const description = sanitizeString(data?.description, 500)
      const sourceUrl = sanitizeString(data?.url, 300)

      if (!headline) return apiError('headline is required', 400)

      // Duplicate check
      if (sourceUrl && await postExists(sourceUrl)) {
        return apiError('Post already exists for this URL', 409)
      }

      try {
        const liveData = await fetchLiveData(nicheConfig.liveData)
        const liveDataText = formatLiveDataForPost(liveData)

        const generated = await generateBlogPost({
          newsItem: { title: headline, description, link: sourceUrl, publishedAt: new Date(), source: 'manual' },
          liveDataText,
          nicheConfig,
        })

        const image = await fetchCoverImage(nicheConfig.images, generated.title)
        const slug = generateSlug(generated.title)
        const schema = generateSchema({
          post: { ...generated, coverImage: image.url },
          nicheConfig,
          url: `${process.env.NEXT_PUBLIC_SITE_URL}/${slug}`,
        })

        const saved = await savePost({
          slug, title: generated.title, excerpt: generated.metaDescription,
          content: generated.content, category: generated.category || nicheConfig.seo.categories[0].slug,
          tags: generated.tags, cover_image: image.url, cover_image_alt: image.alt,
          author_name: nicheConfig.author.name, author_title: nicheConfig.author.title,
          meta_title: generated.metaTitle, meta_description: generated.metaDescription,
          schema_json: schema, live_data: liveData, faq: generated.faq,
          reading_time: generated.readingTime, word_count: generated.wordCount,
          ai_score: generated.aiScore, published: true, tweeted: false,
          source_url: sourceUrl, source_headline: headline,
        })

        return apiResponse({
          success: true,
          post: { id: saved.id, slug, title: generated.title, url: `${process.env.NEXT_PUBLIC_SITE_URL}/${slug}` },
        })
      } catch (err) {
        return apiResponse({ success: false, error: err.message }, 500)
      }
    }

    // Publish pre-written content directly
    case 'direct': {
      const { title, content, category, tags, metaTitle, metaDescription } = data || {}

      if (!title || !content) return apiError('title and content are required', 400)

      try {
        const image = await fetchCoverImage(nicheConfig.images, title)
        const slug = generateSlug(title)

        const saved = await savePost({
          slug,
          title: sanitizeString(title, 100),
          excerpt: sanitizeString(metaDescription, 200),
          content: sanitizeString(content, 50000),
          category: category || nicheConfig.seo.categories[0].slug,
          tags: Array.isArray(tags) ? tags : [],
          cover_image: image.url,
          cover_image_alt: image.alt,
          author_name: nicheConfig.author.name,
          author_title: nicheConfig.author.title,
          meta_title: sanitizeString(metaTitle || title, 60),
          meta_description: sanitizeString(metaDescription, 155),
          schema_json: null,
          published: true,
          tweeted: false,
        })

        return apiResponse({
          success: true,
          post: { id: saved.id, slug, url: `${process.env.NEXT_PUBLIC_SITE_URL}/${slug}` },
        })
      } catch (err) {
        return apiResponse({ success: false, error: err.message }, 500)
      }
    }

    // Get site status
    case 'status': {
      const { getPostCount } = await import('@/lib/supabase')
      const count = await getPostCount()
      return apiResponse({
        success: true,
        site: nicheConfig.site.name,
        niche: process.env.NICHE,
        totalPosts: count,
        status: 'online',
        timestamp: new Date().toISOString(),
      })
    }

    default:
      return apiError(`Unknown type: ${type}. Use 'from_news', 'direct', or 'status'`, 400)
  }
}

// Health check
export async function GET(request) {
  if (!verifyApiPassword(request)) {
    return apiError('Unauthorized', 401)
  }
  return apiResponse({ status: 'online', site: nicheConfig.site.name, timestamp: new Date().toISOString() })
}

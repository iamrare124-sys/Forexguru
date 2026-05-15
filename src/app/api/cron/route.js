export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'
export const maxDuration = 300

import { fetchAllSources } from '@/lib/rss-fetcher'
import { fetchLiveData, formatLiveDataForPost } from '@/lib/live-data'
import { generateBlogPost, generateSlug, generateSchema } from '@/lib/blog-generator'
import { fetchCoverImage } from '@/lib/image-fetcher'
import { savePost, postExists } from '@/lib/supabase'
import { verifyCronSecret, apiResponse } from '@/lib/security'
import { nicheConfig } from '@/config/site.config'

async function publishOne(allStories, liveData, liveDataText, usedLinks, skipDupCheck) {
  const available = allStories.filter(s => s.link && !usedLinks.has(s.link))
  if (!available.length) return { error: 'No unused stories available' }

  for (const story of available.slice(0, 10)) {
    usedLinks.add(story.link)

    if (!skipDupCheck) {
      try {
        const isDup = await postExists(story.link)
        if (isDup) { console.log('⏭️ DB dup:', story.title?.slice(0, 50)); continue }
      } catch (e) { console.warn('dup check failed, proceeding') }
    }

    console.log('📝 Story:', story.title?.slice(0, 80))

    try {
      const generated = await generateBlogPost({ newsItem: story, liveDataText, nicheConfig })
      if (!generated?.title) { console.warn('Empty generation'); continue }

      const image = await fetchCoverImage(nicheConfig.images, generated.title).catch(() => ({
        url: 'https://images.pexels.com/photos/6801648/pexels-photo-6801648.jpeg',
        alt: generated.title,
      }))

      const slug = generateSlug(generated.title)
      const url = `${process.env.NEXT_PUBLIC_SITE_URL || 'https://forexguru.in'}/${slug}`
      const schema = generateSchema({ post: { ...generated, coverImage: image.url }, nicheConfig, url })

      const saved = await savePost({
        slug,
        title: generated.title,
        // excerpt: first try metaDescription, then hook, then first 160 chars of content
        excerpt: (() => {
          if (generated.metaDescription && generated.metaDescription.length > 30) 
            return generated.metaDescription
          if (generated.content?.hook && generated.content.hook.length > 30)
            return generated.content.hook.slice(0, 200)
          if (generated.content?.sections?.[0]?.body)
            return generated.content.sections[0].body.slice(0, 200)
          return generated.title + ' — Read the latest forex analysis and expert insights on ForexGuru.in'
        })(),
        content: {
          ...generated.content,
          // Store raw content as backup for rendering
          rawContent: generated.rawContent || '',
        },
        category: generated.category || nicheConfig.seo.categories[0].slug,
        tags: generated.tags || [],
        cover_image: image.url,
        cover_image_alt: image.alt || generated.title,
        author_name: nicheConfig.author.name,
        author_title: nicheConfig.author.title,
        meta_title: generated.metaTitle || generated.title.slice(0, 60),
        meta_description: generated.metaDescription || 
          (generated.content?.hook?.slice(0, 155)) || 
          (generated.title + ' — Expert forex analysis on ForexGuru.in'),
        schema_json: schema,
        live_data: liveData,
        reading_time: generated.readingTime || 5,
        word_count: generated.wordCount || 800,
        ai_score: generated.aiScore || 7,
        published: true,
        tweeted: false,
        source_url: story.link,
        source_headline: story.title,
      })

      // Ping IndexNow for instant Bing indexing (fire and forget)
      const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://forexguru.in'
      fetch(`${siteUrl}/api/indexnow`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: `${siteUrl}/${slug}` }),
      }).catch(() => {})

      return { id: saved?.id, slug, title: generated.title, score: generated.aiScore, source: story.source }
    } catch (err) {
      console.error('❌ Story processing error:', err.message)
      // Continue to next story
    }
  }

  return { error: 'All stories failed — check Vercel logs for details' }
}

export async function GET(request) {
  if (!verifyCronSecret(request)) {
    return apiResponse({ error: 'Unauthorized' }, 401)
  }

  const { searchParams } = new URL(request.url)
  const count = Math.min(parseInt(searchParams.get('count') || '1'), 6) // default 1, max 6
  const skipDup = searchParams.get('skip_dup') === 'true'
  const debug = searchParams.get('debug') === 'true'

  console.log(`\n🚀 CRON START — ${new Date().toISOString()} — count:${count} skip_dup:${skipDup}`)

  // Step 1: Live data (non-fatal)
  const liveData = await fetchLiveData(nicheConfig.liveData).catch(e => {
    console.warn('Live data failed:', e.message); return null
  })
  const liveDataText = formatLiveDataForPost(liveData)

  // Step 2: Fetch news
  let allStories = []
  try {
    allStories = await fetchAllSources(nicheConfig)
    console.log(`📰 Stories fetched: ${allStories.length}`)
    if (debug && allStories.length > 0) {
      console.log('Top stories:', allStories.slice(0, 3).map(s => s.title))
    }
  } catch (err) {
    return apiResponse({ success: false, error: 'News fetch failed', details: err.message }, 500)
  }

  if (!allStories.length) {
    return apiResponse({ success: false, error: 'Zero stories from all sources' }, 500)
  }

  // Step 3: Publish
  const published = [], errors = []
  const usedLinks = new Set()

  for (let i = 0; i < count; i++) {
    try {
      const result = await publishOne(allStories, liveData, liveDataText, usedLinks, skipDup)
      if (result?.id) published.push(result)
      else errors.push(`Post ${i+1}: ${result?.error}`)
    } catch (err) {
      errors.push(`Post ${i+1}: ${err.message}`)
    }
    if (i < count - 1) await new Promise(r => setTimeout(r, 3000))
  }

  return apiResponse({ success: true, requested: count, published: published.length, stories_available: allStories.length, posts: published, errors: errors.length ? errors : undefined })
}

// POST /api/rewrite-language
// Saare old posts ko current LANGUAGE_MODE mein rewrite karta hai

import { verifyApiPassword, apiResponse, apiError } from '@/lib/security'
import { getAllPostsForRewrite, updatePostLanguage } from '@/lib/supabase'
import { rewritePostInLanguage } from '@/lib/blog-generator'
import { nicheConfig } from '@/config/site.config'

export const maxDuration = 60
export const dynamic = 'force-dynamic'

export async function POST(request) {
  if (!verifyApiPassword(request)) return apiError('Unauthorized', 401)

  const posts = await getAllPostsForRewrite()
  if (!posts.length) return apiResponse({ message: 'No posts to rewrite', count: 0 })

  const { searchParams } = new URL(request.url)
  const limit = Math.min(parseInt(searchParams.get('limit') || '5'), 10)

  const toRewrite = posts.slice(0, limit)
  const results = []

  for (const post of toRewrite) {
    try {
      const rewritten = await rewritePostInLanguage(post, nicheConfig)
      if (rewritten?.title && rewritten?.content) {
        await updatePostLanguage(post.id, {
          title: rewritten.title,
          content: rewritten.content,
          faq: rewritten.faq,
          updated_at: new Date().toISOString(),
        })
        results.push({ id: post.id, status: 'rewritten', title: rewritten.title })
        console.log('✅ Rewritten:', rewritten.title?.slice(0, 50))
      }
    } catch (err) {
      results.push({ id: post.id, status: 'failed', error: err.message })
    }
    await new Promise(r => setTimeout(r, 2000))
  }

  return apiResponse({
    success: true,
    total: posts.length,
    rewritten: results.filter(r => r.status === 'rewritten').length,
    results,
  })
}

// One-time fix: update excerpt for posts that have empty/null excerpt
// Call once: /api/fix-excerpts?secret=YOUR_SECRET
export const dynamic = 'force-dynamic'

import { verifyCronSecret, apiResponse } from '@/lib/security'
import { getSupabaseAdmin } from '@/lib/supabase'

export async function GET(request) {
  if (!verifyCronSecret(request)) {
    return apiResponse({ error: 'Unauthorized' }, 401)
  }

  try {
    const db = getSupabaseAdmin()

    // Get posts with empty excerpt
    const { data: posts, error } = await db
      .from('posts')
      .select('id, slug, title, meta_description, content')
      .or('excerpt.is.null,excerpt.eq.')
      .limit(50)

    if (error) throw error
    if (!posts?.length) return apiResponse({ message: 'No posts need fixing', fixed: 0 })

    let fixed = 0
    for (const post of posts) {
      let excerpt = ''

      // Try meta_description first
      if (post.meta_description && post.meta_description.length > 20) {
        excerpt = post.meta_description.slice(0, 200)
      }
      // Try content hook
      else if (post.content) {
        try {
          const c = typeof post.content === 'string' ? JSON.parse(post.content) : post.content
          if (c?.hook && c.hook.length > 20) {
            excerpt = c.hook.slice(0, 200)
          } else if (c?.sections?.[0]?.body) {
            excerpt = c.sections[0].body.slice(0, 200)
          }
        } catch {}
      }

      // Fallback to title
      if (!excerpt) {
        excerpt = post.title + ' — Latest forex news and analysis on ForexGuru.in'
      }

      const { error: updateErr } = await db
        .from('posts')
        .update({ excerpt: excerpt.trim() })
        .eq('id', post.id)

      if (!updateErr) fixed++
    }

    return apiResponse({ message: 'Excerpts fixed', fixed, total: posts.length })
  } catch (err) {
    return apiResponse({ error: err.message }, 500)
  }
}

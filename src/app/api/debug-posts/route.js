export const dynamic = 'force-dynamic'
import { verifyCronSecret, apiResponse } from '@/lib/security'

export async function GET(request) {
  if (!verifyCronSecret(request)) return apiResponse({ error: 'Unauthorized' }, 401)

  try {
    const { getSupabase, getSupabaseAdmin } = await import('@/lib/supabase')

    const siteName = process.env.SITE_NAME || 'NOT_SET'
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'NOT_SET'

    // Test 1: Total posts in DB (no filter)
    const { count: totalCount } = await getSupabaseAdmin()
      .from('posts')
      .select('id', { count: 'exact', head: true })

    // Test 2: Posts with this site_name
    const { count: siteCount } = await getSupabaseAdmin()
      .from('posts')
      .select('id', { count: 'exact', head: true })
      .eq('site_name', siteName)

    // Test 3: All distinct site_names in DB
    const { data: siteNames } = await getSupabaseAdmin()
      .from('posts')
      .select('site_name, category')
      .limit(30)

    // Test 4: Published posts with this site_name
    const { data: posts, error } = await getSupabaseAdmin()
      .from('posts')
      .select('id, slug, title, site_name, category, published, created_at')
      .eq('site_name', siteName)
      .eq('published', true)
      .limit(5)

    return apiResponse({
      env: {
        SITE_NAME: siteName,
        SUPABASE_URL: supabaseUrl.slice(0, 40) + '...',
      },
      db: {
        total_posts_in_db: totalCount,
        posts_for_this_site: siteCount,
        sample_site_names: [...new Set(siteNames?.map(r => r.site_name))],
        sample_categories: [...new Set(siteNames?.map(r => r.category))],
      },
      posts_preview: posts || [],
      error: error?.message || null,
    })
  } catch (err) {
    return apiResponse({ error: err.message, stack: err.stack?.slice(0, 500) }, 500)
  }
}

// src/app/api/search/route.js
// Search endpoint — useSearch hook se debounced query aata hai

import { supabase } from '@/lib/supabase'
import { rateLimit, getClientIP, apiError, apiResponse, sanitizeString } from '@/lib/security'

export const dynamic = 'force-dynamic'

export async function GET(request) {
  // Rate limit
  const ip = getClientIP(request)
  const limit = rateLimit(ip, 30)
  if (!limit.allowed) return apiError('Too many requests', 429)

  const { searchParams } = new URL(request.url)
  const rawQuery = searchParams.get('q') || ''
  const query = sanitizeString(rawQuery, 100).trim()

  if (!query || query.length < 2) {
    return apiResponse({ results: [], query })
  }

  try {
    // Supabase full-text search
    const { data, error } = await supabase
      .from('posts')
      .select('slug, title, excerpt, category, created_at, reading_time')
      .eq('published', true)
      .or(`title.ilike.%${query}%,excerpt.ilike.%${query}%,tags.cs.{${query}}`)
      .order('created_at', { ascending: false })
      .limit(8)

    if (error) throw error

    return apiResponse({
      results: data || [],
      query,
      count: data?.length || 0,
    })
  } catch (err) {
    return apiResponse({ results: [], query, error: 'Search unavailable' }, 500)
  }
}

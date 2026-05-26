import { createClient } from '@supabase/supabase-js'

function getSupabaseUrl() {
  return process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co'
}
function getSupabaseAnon() {
  return process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder_anon_key'
}
function getSupabaseService() {
  return process.env.SUPABASE_SERVICE_ROLE_KEY || 'placeholder_service_key'
}

let _supabase = null
let _supabaseAdmin = null

export function getSupabase() {
  if (!_supabase) _supabase = createClient(getSupabaseUrl(), getSupabaseAnon())
  return _supabase
}
export function getSupabaseAdmin() {
  if (!_supabaseAdmin) _supabaseAdmin = createClient(getSupabaseUrl(), getSupabaseService())
  return _supabaseAdmin
}

// Backward compat aliases
export const supabase = { from: (...a) => getSupabase().from(...a), auth: { getUser: (...a) => getSupabase().auth.getUser(...a) } }
export const supabaseAdmin = { from: (...a) => getSupabaseAdmin().from(...a) }

// ── Per-site post limit (from .env, default 30) ────────────
const POST_LIMIT = parseInt(process.env.MAX_POSTS_PER_SITE || '30')

// ── Auto-delete oldest posts when limit exceeded ───────────
async function enforcePostLimit() {
  const { count } = await supabaseAdmin
    .from('posts')
    .select('id', { count: 'exact', head: true })

  if (count > POST_LIMIT) {
    const deleteCount = count - POST_LIMIT
    // Get oldest posts
    const { data: oldest } = await getSupabaseAdmin()
      .from('posts')
      .select('id')
      .order('created_at', { ascending: true })
      .limit(deleteCount)

    if (oldest?.length) {
      const ids = oldest.map(p => p.id)
      await getSupabaseAdmin().from('posts').delete().in('id', ids)
      console.log(`🗑️ Auto-deleted ${ids.length} old posts (limit: ${POST_LIMIT})`)
    }
  }
}

// ── Get posts ──────────────────────────────────────────────
export async function getPosts({ limit = 12, offset = 0, category = null } = {}) {
  const siteName = process.env.SITE_NAME || 'forexguru'
   let query = getSupabase()
  .from('posts')
  .select('...')
  .eq('site_name', siteName)   // ← yeh line add karo
  .eq('published', true)
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1)

  if (category) query = query.eq('category', category)
  const { data, error } = await query
  if (error) throw error
  return data || []
}

export async function getPostBySlug(slug) {
  const { data, error } = await getSupabase()
    .from('posts')
    .select('*')
    .eq('slug', slug)
    .eq('published', true)
    .single()
  if (error) throw error
  return data
}

export async function getRelatedPosts(category, currentSlug, limit = 3) {
  const { data, error } = await getSupabase()
    .from('posts')
    .select('slug, title, excerpt, cover_image, reading_time, created_at')
    .eq('category', category)
    .eq('published', true)
    .neq('slug', currentSlug)
    .order('created_at', { ascending: false })
    .limit(limit)
  if (error) throw error
  return data || []
}

export async function getTrendingPosts(limit = 5) {
  const { data, error } = await getSupabase()
    .from('posts')
    .select('slug, title, category, created_at')
    .eq('published', true)
    .order('created_at', { ascending: false })
    .limit(limit)
  if (error) throw error
  return data || []
}

export async function savePost(postData) {
  const { data, error } = await getSupabaseAdmin()
    .from('posts')
    .insert(postData)
    .select()
    .single()

  if (error) throw error

  // Auto-delete old posts after saving
  await enforcePostLimit()

  return data
}

// Usage
const saved = await savePost({
  site_name: process.env.SITE_NAME || 'forexguru',
  slug,
  title: generated.title,
  // ... baaki fields same
})

export async function postExists(sourceUrl) {
  if (!sourceUrl) return false
  try {
    // Use maybeSingle() instead of single() — returns null if no row (no error)
    const { data, error } = await getSupabaseAdmin()
      .from('posts')
      .select('id')
      .eq('source_url', sourceUrl)
      .maybeSingle()
    if (error) throw error
    return !!data
  } catch (err) {
    // If check fails, assume not duplicate (better to republish than skip all)
    console.warn('postExists check failed:', err.message)
    return false
  }
}

export async function getPostCount(category = null) {
  let query = supabaseAdmin
    .from('posts')
    .select('id', { count: 'exact', head: true })
    .eq('published', true)
  if (category) query = query.eq('category', category)
  const { count } = await query
  return count || 0
}

// ── Rewrite all posts in new language ─────────────────────
export async function getAllPostsForRewrite() {
  const { data, error } = await supabaseAdmin
    .from('posts')
    .select('id, title, content, faq, source_headline, category')
    .eq('published', true)
    .order('created_at', { ascending: false })
  if (error) throw error
  return data || []
}

export async function updatePostLanguage(id, updates) {
  const { error } = await supabaseAdmin
    .from('posts')
    .update(updates)
    .eq('id', id)
  if (error) throw error
}

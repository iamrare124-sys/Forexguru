// src/app/sitemap.js
import { nicheConfig } from '@/config/site.config'

export default async function sitemap() {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://forexguru.in'

  // Posts fetch — fail hone par empty array
  let posts = []
  try {
    const { getPosts } = await import('@/lib/supabase')
    posts = await getPosts({ limit: 1000 })
  } catch {}

  const postUrls = posts.map(post => ({
    url: `${siteUrl}/${post.slug}`,
    lastModified: new Date(post.updated_at || post.created_at),
    changeFrequency: 'daily',
    priority: 0.8,
  }))

  const categoryUrls = nicheConfig.seo.categories.map(cat => ({
    url: `${siteUrl}/category/${cat.slug}`,
    lastModified: new Date(),
    changeFrequency: 'daily',
    priority: 0.6,
  }))

  const staticUrls = ['', '/about', '/privacy-policy', '/terms'].map(path => ({
    url: `${siteUrl}${path}`,
    lastModified: new Date(),
    changeFrequency: 'monthly',
    priority: path === '' ? 1.0 : 0.4,
  }))

  return [...staticUrls, ...categoryUrls, ...postUrls]
}

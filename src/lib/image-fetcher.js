// src/lib/image-fetcher.js
// Pexels aur Unsplash se niche-relevant cover images fetch karta hai

// ── Main Image Fetch ───────────────────────────────────────
export async function fetchCoverImage(imageConfig, postTitle = '') {
  const keywords = imageConfig.pexels || ['news india']

  // Try different keyword combinations
  const searchTerms = [
    postTitle.split(' ').slice(0, 3).join(' '),   // First 3 words of title
    keywords[Math.floor(Math.random() * keywords.length)],  // Random niche keyword
    keywords[0],  // First keyword as last fallback
  ]

  for (const term of searchTerms) {
    try {
      const image = await fetchFromPexels(term)
      if (image) return image
    } catch (err) {
      console.error(`Pexels failed for "${term}":`, err.message)
    }
  }

  // Fallback to Unsplash
  for (const term of (imageConfig.unsplash || searchTerms)) {
    try {
      const image = await fetchFromUnsplash(term)
      if (image) return image
    } catch (err) {
      console.error(`Unsplash failed for "${term}":`, err.message)
    }
  }

  // Final fallback - placeholder
  return {
    url: `https://picsum.photos/seed/${Date.now()}/1200/630`,
    alt: searchTerms[0],
    photographer: 'Picsum',
    source: 'picsum',
  }
}

// ── Pexels ─────────────────────────────────────────────────
async function fetchFromPexels(query) {
  const apiKey = process.env.PEXELS_API_KEY
  if (!apiKey) return null

  const res = await fetch(
    `https://api.pexels.com/v1/search?query=${encodeURIComponent(query)}&per_page=15&orientation=landscape`,
    {
      headers: { Authorization: apiKey },
      next: { revalidate: 3600 },
    }
  )

  if (!res.ok) return null
  const data = await res.json()
  if (!data.photos?.length) return null

  // Pick random image from results (not always first)
  const photo = data.photos[Math.floor(Math.random() * Math.min(data.photos.length, 8))]

  return {
    url: photo.src.large2x || photo.src.large,
    urlSmall: photo.src.medium,
    alt: photo.alt || query,
    photographer: photo.photographer,
    photographerUrl: photo.photographer_url,
    source: 'pexels',
    pexelsUrl: photo.url,
  }
}

// ── Unsplash ───────────────────────────────────────────────
async function fetchFromUnsplash(query) {
  const apiKey = process.env.UNSPLASH_API_KEY
  if (!apiKey) return null

  const res = await fetch(
    `https://api.unsplash.com/photos/random?query=${encodeURIComponent(query)}&orientation=landscape&count=5`,
    {
      headers: { Authorization: `Client-ID ${apiKey}` },
      next: { revalidate: 3600 },
    }
  )

  if (!res.ok) return null
  const data = await res.json()
  if (!data?.length) return null

  const photo = data[Math.floor(Math.random() * data.length)]

  return {
    url: photo.urls.regular,
    urlSmall: photo.urls.small,
    alt: photo.alt_description || query,
    photographer: photo.user.name,
    photographerUrl: `${photo.user.links.html}?utm_source=forexguru&utm_medium=referral`,
    source: 'unsplash',
    unsplashUrl: `${photo.links.html}?utm_source=forexguru&utm_medium=referral`,
  }
}

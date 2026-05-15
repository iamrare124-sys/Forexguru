// IndexNow — instant indexing for Bing, Yandex, Seznam
// Called automatically after each post is published
export const dynamic = 'force-dynamic'

export async function POST(request) {
  try {
    const { url } = await request.json()
    if (!url) return Response.json({ error: 'URL required' }, { status: 400 })

    const key = process.env.INDEX_NOW_KEY
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://forexguru.in'
    if (!key) return Response.json({ skipped: 'INDEX_NOW_KEY not set' })

    const body = {
      host: siteUrl.replace('https://', ''),
      key,
      keyLocation: `${siteUrl}/${key}.txt`,
      urlList: [url],
    }

    // Submit to Bing (covers Bing + DuckDuckGo)
    const res = await fetch('https://api.indexnow.org/indexnow', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    })

    return Response.json({ submitted: res.ok, status: res.status, url })
  } catch (err) {
    return Response.json({ error: err.message }, { status: 500 })
  }
}

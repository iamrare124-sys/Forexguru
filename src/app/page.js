import { nicheConfig } from '@/config/site.config'
export const revalidate = 300

async function getData() {
  try {
    const { getPosts, getTrendingPosts } = await import('@/lib/supabase')
    const [p, t] = await Promise.allSettled([getPosts({ limit: 20 }), getTrendingPosts(3)])
    return { posts: p.status === 'fulfilled' ? p.value : [], trending: t.status === 'fulfilled' ? t.value : [] }
  } catch { return { posts: [], trending: [] } }
}

function ago(d) {
  const m = Math.floor((Date.now() - new Date(d)) / 60000)
  if (m < 60) return `${m}m ago`; if (m < 1440) return `${Math.floor(m / 60)}h ago`; return `${Math.floor(m / 1440)}d ago`
}

function NewsItem({ post }) {
  return (
    <a href={`/${post.slug}`} className="news-item">
      <div className="ni-thumb">
        {post.cover_image
          ? <img src={post.cover_image} alt={post.cover_image_alt || post.title} loading="lazy"
              style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
          : <div className="ni-thumb-ph">📊</div>}
      </div>
      <div className="ni-body">
        <span className="ni-cat">{post.category?.replace(/-/g, ' ') || 'Forex News'}</span>
        <p className="ni-title">{post.title}</p>
        {post.excerpt && (
          <p style={{ fontSize: '0.82rem', color: '#555', lineHeight: 1.5, marginBottom: 5,
            display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
            {post.excerpt}
          </p>
        )}
        <p className="ni-author">By <strong>{post.author_name || 'Rahul Sharma'}</strong></p>
      </div>
    </a>
  )
}

export default async function HomePage() {
  const { posts, trending } = await getData()
  const { seo } = nicheConfig

  return (
    <>
      <div className="ad-wrap ad-728" style={{ maxWidth: 1280, margin: '0 auto', padding: '0 16px' }}>Ad</div>

      <div className="page-heading">
        <h1>Explore Forex & Currency News</h1>
      </div>

      {/* Category tabs */}
      <div style={{ maxWidth: 1280, margin: '0 auto', padding: '0 16px' }}>
        <div style={{ display: 'flex', borderBottom: '1px solid #e8e8e8', overflowX: 'auto', scrollbarWidth: 'none', marginBottom: 0 }}>
          <a href="/" style={{ padding: '10px 16px', fontSize: '0.72rem', fontWeight: 700, color: '#1a1a1a', borderBottom: '3px solid #1a1a1a', whiteSpace: 'nowrap', letterSpacing: '0.04em', textTransform: 'uppercase' }}>ALL</a>
          {seo.categories.map(cat => (
            <a key={cat.slug} href={`/category/${cat.slug}`} style={{ padding: '10px 16px', fontSize: '0.72rem', fontWeight: 700, color: '#666', borderBottom: '3px solid transparent', whiteSpace: 'nowrap', letterSpacing: '0.04em', textTransform: 'uppercase' }}>
              {cat.name.toUpperCase()}
            </a>
          ))}
        </div>
      </div>

      {/* News list */}
      {posts.length === 0 ? (
        <div className="news-list" style={{ padding: '60px 16px', textAlign: 'center' }}>
          <div style={{ fontSize: '3rem', marginBottom: 16 }}>📰</div>
          <h3 style={{ fontFamily: 'Merriweather,serif', fontSize: '1.1rem', marginBottom: 8 }}>No articles published yet</h3>
          <p style={{ color: '#888', fontSize: '0.88rem', marginBottom: 12 }}>Articles publish automatically once a day via cron job.</p>
          <p style={{ color: '#aaa', fontSize: '0.78rem' }}>
            Manual trigger: <code style={{ background: '#f5f5f5', padding: '2px 8px', borderRadius: 3, fontSize: '0.75rem' }}>/api/cron?secret=YOUR_SECRET</code>
          </p>
        </div>
      ) : (
        <div className="news-list">
          {/* First item — show with related links below it */}
          {posts.slice(0, 1).map(post => (
            <div key={post.id}>
              <NewsItem post={post} />
              {/* Related articles after first item */}
              {posts.length > 4 && (
                <div className="related-block" style={{ padding: '12px 0 12px 142px' }}>
                  <div className="related-label">RELATED</div>
                  {posts.slice(5, 8).map(rp => (
                    <a key={rp.id} href={`/${rp.slug}`} className="related-link">{rp.title}</a>
                  ))}
                </div>
              )}
            </div>
          ))}

          {posts.slice(1, 5).map(post => <NewsItem key={post.id} post={post} />)}

          {/* Ad after 5 items */}
          <div className="ad-wrap ad-728">Ad</div>

          {posts.slice(5).map((post, i) => (
            <div key={post.id}>
              <NewsItem post={post} />
              {/* Related after every 3rd item */}
              {(i + 1) % 3 === 0 && posts.length > i + 8 && (
                <div className="related-block" style={{ padding: '12px 0 12px 142px' }}>
                  <div className="related-label">RELATED</div>
                  {posts.slice(i + 6, i + 9).map(rp => (
                    <a key={rp.id} href={`/${rp.slug}`} className="related-link">{rp.title}</a>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </>
  )
}

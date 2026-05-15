import { notFound } from 'next/navigation'
import { nicheConfig } from '@/config/site.config'

export async function generateMetadata({ params }) {
  const cat = nicheConfig.seo.categories.find(c => c.slug === params.category)
  if (!cat) return { title: 'Not Found' }
  return { title: `${cat.name} News | ForexGuru`, description: cat.description }
}

function ago(d) {
  const m = Math.floor((Date.now() - new Date(d)) / 60000)
  if (m < 60) return `${m}m ago`; if (m < 1440) return `${Math.floor(m / 60)}h ago`; return `${Math.floor(m / 1440)}d ago`
}

export default async function CategoryPage({ params }) {
  const cat = nicheConfig.seo.categories.find(c => c.slug === params.category)
  if (!cat) notFound()

  let posts = []
  try { const { getPosts } = await import('@/lib/supabase'); posts = await getPosts({ limit: 20, category: params.category }) } catch {}

  return (
    <>
      {/* Page heading */}
      <div className="cat-page-title">
        <p style={{ fontSize: '0.65rem', fontWeight: 700, color: '#2c4ecb', letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: 6 }}>
          Forex News
        </p>
        <h1 style={{ fontFamily: 'Merriweather,serif', fontSize: '1.5rem', fontWeight: 900, color: '#1a1a1a', marginBottom: 4 }}>
          Explore {cat.name}
        </h1>
      </div>

      {/* Sub-tabs — ALL + subcategories */}
      <div style={{ maxWidth: 1280, margin: '0 auto', padding: '0 16px' }}>
        <div style={{ display: 'flex', borderBottom: '1px solid #e8e8e8', overflowX: 'auto', scrollbarWidth: 'none' }}>
          <a href={`/category/${params.category}`}
            style={{ padding: '10px 16px', fontSize: '0.72rem', fontWeight: 700, color: '#1a1a1a', borderBottom: '3px solid #1a1a1a', whiteSpace: 'nowrap', letterSpacing: '0.04em', textTransform: 'uppercase' }}>
            ALL
          </a>
          {nicheConfig.seo.categories.filter(c => c.slug !== params.category).slice(0, 4).map(c => (
            <a key={c.slug} href={`/category/${c.slug}`}
              style={{ padding: '10px 16px', fontSize: '0.72rem', fontWeight: 700, color: '#666', borderBottom: '3px solid transparent', whiteSpace: 'nowrap', letterSpacing: '0.04em', textTransform: 'uppercase' }}>
              {c.name.toUpperCase()}
            </a>
          ))}
        </div>
      </div>

      {/* News list */}
      <div className="news-list">
        {posts.length === 0 ? (
          <div style={{ padding: '60px 0', textAlign: 'center' }}>
            <div style={{ fontSize: '3rem', marginBottom: 12 }}>📰</div>
            <p style={{ fontFamily: 'Merriweather,serif', fontWeight: 700, marginBottom: 8 }}>No articles in {cat.name} yet</p>
            <p style={{ color: '#888', fontSize: '0.88rem' }}>Check back soon — articles publish daily.</p>
          </div>
        ) : (
          posts.map((post, i) => (
            <div key={post.id}>
              <a href={`/${post.slug}`} className="news-item">
                <div className="ni-thumb">
                  {post.cover_image
                    ? <img src={post.cover_image} alt={post.title} loading="lazy"
                        style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
                    : <div className="ni-thumb-ph">📊</div>}
                </div>
                <div className="ni-body">
                  <span className="ni-cat">{post.category?.replace(/-/g, ' ')}</span>
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
              {/* Related after every 2nd item */}
              {(i + 1) % 2 === 0 && posts.length > i + 3 && (
                <div className="related-block" style={{ padding: '12px 0 12px 142px' }}>
                  <div className="related-label">RELATED</div>
                  {posts.slice(i + 1, i + 4).map(rp => (
                    <a key={rp.id} href={`/${rp.slug}`} className="related-link">{rp.title}</a>
                  ))}
                </div>
              )}
              {i === 4 && <div className="ad-wrap ad-728">Ad</div>}
            </div>
          ))
        )}
      </div>
    </>
  )
}

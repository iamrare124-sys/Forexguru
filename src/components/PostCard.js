import { formatDate } from '@/lib/utils'

export default function PostCard({ post, variant = 'card' }) {
  if (variant === 'featured') {
    return (
      <a href={`/${post.slug}`} className="card-hero">
        <div className="card-hero-inner">
          <div className="card-hero-img">
            {post.cover_image
              ? <img src={post.cover_image} alt={post.cover_image_alt || post.title} loading="eager" />
              : <div style={{width:'100%',height:'100%',background:'linear-gradient(135deg,#0f172a,#1e3a5f)',display:'flex',alignItems:'center',justifyContent:'center'}}>
                  <span style={{fontSize:'3rem'}}>📈</span>
                </div>
            }
          </div>
          <div className="card-hero-body">
            <span className="cat-tag">{post.category?.replace(/-/g, ' ') || 'Forex'}</span>
            <h2>{post.title}</h2>
            {post.excerpt && <p className="card-hero-excerpt">{post.excerpt}</p>}
            <div className="card-hero-meta">
              <span>{post.author_name || 'Rahul Sharma'}</span>
              <span className="meta-dot" />
              <span>{formatDate(post.created_at)}</span>
              <span className="meta-dot" />
              <span>{post.reading_time || 5} min read</span>
            </div>
            <span className="read-more">Poora Padhe →</span>
          </div>
        </div>
      </a>
    )
  }

  if (variant === 'mini') {
    return (
      <a href={`/${post.slug}`} className="card-mini">
        <div className="card-mini-thumb">
          {post.cover_image
            ? <img src={post.cover_image} alt={post.title} loading="lazy" />
            : <div style={{width:'100%',height:'100%',background:'#e2e8f0',display:'flex',alignItems:'center',justifyContent:'center'}}>📰</div>
          }
        </div>
        <div>
          <p className="card-mini-title">{post.title}</p>
          <p className="card-mini-meta">{formatDate(post.created_at)} · {post.reading_time || 5} min</p>
        </div>
      </a>
    )
  }

  return (
    <a href={`/${post.slug}`} className="card">
      <div className="card-thumb">
        {post.cover_image
          ? <img src={post.cover_image} alt={post.cover_image_alt || post.title} loading="lazy" />
          : <div style={{width:'100%',height:'100%',background:'linear-gradient(135deg,#eff6ff,#dbeafe)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:'2.5rem'}}>📊</div>
        }
      </div>
      <div className="card-body">
        <span className="cat-tag">{post.category?.replace(/-/g, ' ') || 'Forex'}</span>
        <p className="card-title">{post.title}</p>
        {post.excerpt && <p className="card-excerpt">{post.excerpt}</p>}
        <div className="card-meta">
          <span>{formatDate(post.created_at)}</span>
          <span className="meta-dot" style={{width:'3px',height:'3px',borderRadius:'50%',background:'#94a3b8',display:'inline-block'}} />
          <span>{post.reading_time || 5} min read</span>
        </div>
      </div>
    </a>
  )
}

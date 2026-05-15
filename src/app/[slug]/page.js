import { notFound } from 'next/navigation'
import { nicheConfig } from '@/config/site.config'

export const revalidate = 3600
export const dynamicParams = true

export async function generateStaticParams() {
  try { const { getPosts } = await import('@/lib/supabase'); const p = await getPosts({ limit: 50 }); return p.map(x => ({ slug: x.slug })) } catch { return [] }
}
export async function generateMetadata({ params }) {
  try {
    const { getPostBySlug } = await import('@/lib/supabase')
    const post = await getPostBySlug(params.slug)
    if (!post) return { title: 'Not Found' }
    const url = `${process.env.NEXT_PUBLIC_SITE_URL || 'https://forexguru.in'}/${post.slug}`
    return {
      title: post.meta_title || post.title,
      description: post.meta_description || post.excerpt,
      keywords: post.tags?.join(', '),
      authors: [{ name: post.author_name || 'Rahul Sharma' }],
      openGraph: {
        title: post.meta_title || post.title,
        description: post.meta_description || post.excerpt,
        url,
        type: 'article',
        publishedTime: post.published_at || post.created_at,
        modifiedTime: post.updated_at || post.created_at,
        authors: [post.author_name || 'Rahul Sharma'],
        section: post.category?.replace(/-/g, ' '),
        tags: post.tags,
        images: post.cover_image ? [{ url: post.cover_image, width: 1200, height: 630, alt: post.title }] : [{ url: '/og-image.jpg' }],
      },
      twitter: {
        card: 'summary_large_image',
        title: post.meta_title || post.title,
        description: post.meta_description || post.excerpt,
        images: post.cover_image ? [post.cover_image] : ['/og-image.jpg'],
      },
      alternates: { canonical: url },
      robots: { index: true, follow: true, 'max-snippet': -1, 'max-image-preview': 'large' },
    }
  } catch { return { title: 'Not Found' } }
}

const RATES = [
  { flag: '🇺🇸', name: 'USD/INR', val: '₹83.42', chg: '+0.12%', up: true },
  { flag: '🇪🇺', name: 'EUR/INR', val: '₹90.18', chg: '-0.08%', up: false },
  { flag: '🇬🇧', name: 'GBP/INR', val: '₹105.30', chg: '+0.21%', up: true },
  { flag: '₿', name: 'BTC/USD', val: '$67,240', chg: '+1.4%', up: true },
]

export default async function PostPage({ params }) {
  let post, related
  try {
    const { getPostBySlug, getRelatedPosts } = await import('@/lib/supabase')
    post = await getPostBySlug(params.slug)
    if (!post) notFound()
    related = await getRelatedPosts(post.category, post.slug, 3).catch(() => [])
  } catch { notFound() }

  const { author } = nicheConfig
  const postUrl = `${process.env.NEXT_PUBLIC_SITE_URL || 'https://forexguru.in'}/${post.slug}`

  // Parse content if it's a string (Supabase returns JSONB as string sometimes)
  if (post.content && typeof post.content === 'string') {
    try { post.content = JSON.parse(post.content) } catch { post.content = null }
  }
  const publishDate = new Date(post.published_at || post.created_at).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })
  const timeStr = `Updated ${publishDate}`

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://forexguru.in'

  const articleSchema = {
    '@context': 'https://schema.org',
    '@type': 'NewsArticle',
    headline: post.title,
    description: post.meta_description || post.excerpt,
    url: postUrl,
    datePublished: post.published_at || post.created_at,
    dateModified: post.updated_at || post.created_at,
    author: {
      '@type': 'Person',
      name: post.author_name || author.name,
      jobTitle: author.title,
      url: `${siteUrl}/about`,
    },
    publisher: {
      '@type': 'Organization',
      name: 'ForexGuru',
      url: siteUrl,
      logo: { '@type': 'ImageObject', url: `${siteUrl}/logo.png`, width: 200, height: 60 },
    },
    image: post.cover_image
      ? [{ '@type': 'ImageObject', url: post.cover_image, width: 1200, height: 630 }]
      : undefined,
    keywords: post.tags?.join(', '),
    articleSection: post.category?.replace(/-/g, ' '),
    inLanguage: 'en-IN',
    isAccessibleForFree: true,
    mainEntityOfPage: { '@type': 'WebPage', '@id': postUrl },
  }

  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: siteUrl },
      { '@type': 'ListItem', position: 2, name: post.category?.replace(/-/g, ' '), item: `${siteUrl}/category/${post.category}` },
      { '@type': 'ListItem', position: 3, name: post.title, item: postUrl },
    ],
  }
  const faqSchema = post.content?.faq?.length ? {
    '@context': 'https://schema.org', '@type': 'FAQPage',
    mainEntity: post.content.faq.map(f => ({ '@type': 'Question', name: f.question, acceptedAnswer: { '@type': 'Answer', text: f.answer } }))
  } : null

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(articleSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }} />
      {faqSchema && <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />}
      <div className="rp" id="rpbar" style={{ width: '0%' }} />

      <div className="article-page">
        <div className="article-inner">

          {/* Category */}
          <span className="article-cat">{post.category?.replace(/-/g, ' ') || 'Forex News'}</span>

          {/* Title — big bold Merriweather exactly like Investopedia */}
          <h1 className="article-title">{post.title}</h1>

          {/* Byline — "By AUTHOR NAME | Updated date" */}
          <div className="article-byline">
            <span>By <strong>{post.author_name || author.name}</strong></span>
            <span className="sep">|</span>
            <span>{timeStr}</span>
          </div>

          {/* Rates ticker inside article */}
          <div className="article-rates">
            {RATES.map((r, i) => (
              <div key={i} className="ar-chip">
                <div className="ar-name">
                  <span>{r.flag}</span>
                  <span>{r.name}</span>
                </div>
                <div className="ar-val">{r.val}</div>
                <div className={r.up ? 'ar-chg-up' : 'ar-chg-dn'}>{r.chg}</div>
              </div>
            ))}
          </div>

          {/* Hero image */}
          {post.cover_image
            ? <img src={post.cover_image} alt={post.cover_image_alt || post.title} className="article-hero" loading="eager" />
            : <div className="article-hero-ph">📊</div>}
          {post.cover_image && (
            <p className="article-caption">
              <strong>{post.title.slice(0, 40)}</strong><br />
              Credit: Pexels
            </p>
          )}

          {/* Ad */}
          <div className="ad-wrap ad-728">Ad</div>

          {/* Related links BEFORE content (exactly like Investopedia) */}
          {related.length > 0 && (
            <div className="related-block">
              <div className="related-label">RELATED</div>
              {related.map(rp => (
                <a key={rp.id} href={`/${rp.slug}`} className="related-link">{rp.title}</a>
              ))}
            </div>
          )}

          {/* Key Takeaways */}
          {post.content?.sections?.length > 0 && (
            <div className="key-takeaways">
              <div className="kt-head">📌 Key Takeaways</div>
              <div className="kt-body">
                <ul>
                  {post.content.sections.slice(0, 4).map((s, i) => (
                    <li key={i}>{s.h2 || s.body?.slice(0, 90) + '...'}</li>
                  ))}
                </ul>
              </div>
            </div>
          )}

          {/* Article body */}
          <div className="article-body">
            {(() => {
              const c = post.content
              if (!c) return <p style={{color:'#888'}}>Content loading...</p>

              // If content is a plain string (fallback)
              if (typeof c === 'string') {
                return c.split('\n\n').filter(Boolean).map((p, i) => {
                  if (p.startsWith('#')) return <h2 key={i}>{p.replace(/^#+\s*/, '')}</h2>
                  return <p key={i}>{p.replace(/\*\*([^*]+)\*\*/g, '$1')}</p>
                })
              }

              // Normal object content
              return (
                <>
                  {c.hook && <p style={{ fontWeight: 500 }}>{c.hook}</p>}
                  {c.sections?.length > 0
                    ? c.sections.map((s, i) => (
                        <div key={i}>
                          {s.h2 && <h2>{s.h2}</h2>}
                          {s.body?.split('\n\n').filter(Boolean).map((p, j) => (
                            <p key={j}>{p.replace(/\*\*([^*]+)\*\*/g, '$1').replace(/\*([^*]+)\*/g, '$1')}</p>
                          ))}
                          {i === 2 && <div className="ad-wrap ad-728">Ad</div>}
                        </div>
                      ))
                    : c.rawContent
                      ? c.rawContent.split('\n\n').filter(Boolean).slice(0, 12).map((p, i) => {
                          if (p.match(/^#{1,3}\s/)) return <h2 key={i}>{p.replace(/^#+\s*/, '')}</h2>
                          return <p key={i}>{p.replace(/\*\*([^*]+)\*\*/g, '$1')}</p>
                        })
                      : null
                  }
                  {c.conclusion && <p><strong>Bottom line:</strong> {c.conclusion}</p>}
                </>
              )
            })()}
          </div>

          {/* FAQ */}
          {post.content?.faq?.length > 0 && (
            <div className="faq-wrap">
              <h3>Frequently Asked Questions</h3>
              {post.content.faq.map((f, i) => (
                <details key={i} className="faq-item">
                  <summary>{f.question}</summary>
                  <div className="faq-ans">{f.answer}</div>
                </details>
              ))}
            </div>
          )}

          {/* Tags */}
          {post.tags?.length > 0 && (
            <div className="article-tags">
              {post.tags.map(t => <a key={t} href={`/search?q=${encodeURIComponent(t)}`} className="atag">{t}</a>)}
            </div>
          )}

          {/* Disclaimer */}
          <div className="article-disclaimer">
            <strong>Disclaimer:</strong> The information on ForexGuru.in is for educational purposes only and does not constitute financial advice. Forex trading involves risk. Please consult a qualified financial advisor before making investment decisions.
          </div>

          {/* More related at bottom */}
          {related.length > 0 && (
            <div style={{ marginTop: 32, borderTop: '2px solid #1a1a1a', paddingTop: 16 }}>
              <p style={{ fontSize: '0.72rem', fontWeight: 700, letterSpacing: '0.05em', textTransform: 'uppercase', marginBottom: 12 }}>MORE FROM FOREXGURU</p>
              {related.map(rp => (
                <div key={rp.id} style={{ padding: '10px 0', borderBottom: '1px solid #e8e8e8' }}>
                  <span style={{ fontSize: '0.65rem', fontWeight: 700, color: '#2c4ecb', textTransform: 'uppercase', letterSpacing: '0.05em', display: 'block', marginBottom: 3 }}>
                    {rp.category?.replace(/-/g, ' ')}
                  </span>
                  <a href={`/${rp.slug}`} style={{ fontFamily: 'Merriweather,serif', fontSize: '0.95rem', fontWeight: 700, color: '#1a1a1a', lineHeight: 1.35, display: 'block' }}>
                    {rp.title}
                  </a>
                  <span style={{ fontSize: '0.72rem', color: '#888', marginTop: 3, display: 'block' }}>
                    By {rp.author_name || author.name}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <script dangerouslySetInnerHTML={{ __html: `
        var bar=document.getElementById('rpbar');
        if(bar){
          window.addEventListener('scroll',function(){
            var h=document.documentElement.scrollHeight-window.innerHeight;
            bar.style.width=(h>0?(window.scrollY/h*100):0)+'%';
          });
        }
      `}} />
    </>
  )
}

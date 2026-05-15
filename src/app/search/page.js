'use client'
import { useSearchParams } from 'next/navigation'
import { useEffect, useState, Suspense } from 'react'

function SearchResults() {
  const params = useSearchParams()
  const q = params.get('q') || ''
  const [results, setResults] = useState([])
  const [loading, setLoading] = useState(false)
  const [done, setDone] = useState(false)

  useEffect(() => {
    if (!q || q.length < 2) return
    setLoading(true)
    setDone(false)
    fetch(`/api/search?q=${encodeURIComponent(q)}`)
      .then(r => r.json())
      .then(d => { setResults(d.results || []); setDone(true) })
      .catch(() => setDone(true))
      .finally(() => setLoading(false))
  }, [q])

  function ago(d) {
    const m = Math.floor((Date.now() - new Date(d)) / 60000)
    if (m < 60) return `${m}m ago`; if (m < 1440) return `${Math.floor(m/60)}h ago`; return `${Math.floor(m/1440)}d ago`
  }

  return (
    <>
      {/* Heading */}
      <div className="page-heading">
        <h1>Search Results {q && <span style={{ color: '#2c4ecb' }}>for "{q}"</span>}</h1>
      </div>

      {/* Search bar */}
      <div style={{ maxWidth: 1280, margin: '0 auto', padding: '0 16px 16px' }}>
        <form onSubmit={e => { e.preventDefault(); const v = e.target.q.value.trim(); if (v) window.location.href = '/search?q=' + encodeURIComponent(v) }}>
          <div style={{ display: 'flex', border: '1px solid #ccc', borderRadius: 3, overflow: 'hidden', maxWidth: 560 }}>
            <input name="q" defaultValue={q} placeholder="Search forex, USD/INR, RBI..." autoFocus
              style={{ flex: 1, padding: '10px 14px', border: 'none', outline: 'none', fontSize: '0.95rem', fontFamily: 'inherit' }} />
            <button type="submit" style={{ background: '#2c4ecb', color: '#fff', padding: '10px 20px', border: 'none', cursor: 'pointer', fontWeight: 700, fontSize: '0.85rem', fontFamily: 'inherit' }}>
              Search
            </button>
          </div>
        </form>
      </div>

      {/* Results */}
      <div className="news-list">
        {loading && (
          <div style={{ padding: '40px 0', textAlign: 'center' }}>
            <div style={{ display: 'inline-block', width: 24, height: 24, border: '3px solid #e0e0e0', borderTopColor: '#2c4ecb', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
            <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
          </div>
        )}
        {!loading && done && results.length === 0 && (
          <div style={{ padding: '60px 0', textAlign: 'center' }}>
            <div style={{ fontSize: '3rem', marginBottom: 12 }}>🔍</div>
            <p style={{ fontFamily: 'Merriweather,serif', fontWeight: 700, marginBottom: 8 }}>No results found for "{q}"</p>
            <p style={{ color: '#888', fontSize: '0.88rem' }}>Try different keywords — e.g. "USD INR", "RBI rate", "forex tips"</p>
          </div>
        )}
        {results.map(post => (
          <a key={post.slug} href={`/${post.slug}`} className="news-item">
            <div className="ni-thumb">
              {post.cover_image
                ? <img src={post.cover_image} alt={post.title} loading="lazy" />
                : <div className="ni-thumb-ph">📊</div>}
            </div>
            <div className="ni-body">
              <span className="ni-cat">{post.category?.replace(/-/g, ' ') || 'Forex News'}</span>
              <p className="ni-title">{post.title}</p>
              <p className="ni-author">By <strong>{post.author_name || 'Rahul Sharma'}</strong> · {ago(post.created_at)}</p>
            </div>
          </a>
        ))}
      </div>
    </>
  )
}

export default function SearchPage() {
  return (
    <Suspense fallback={<div className="page-heading"><h1>Search</h1></div>}>
      <SearchResults />
    </Suspense>
  )
}

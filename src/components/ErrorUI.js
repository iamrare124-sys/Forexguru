'use client'
import { useEffect } from 'react'

export function GlobalError({ error, reset }) {
  useEffect(() => { console.error('Error:', error) }, [error])
  return (
    <div style={{ minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem', textAlign: 'center' }}>
      <div>
        <div style={{ fontSize: '3rem', marginBottom: 16 }}>😕</div>
        <h2 style={{ fontFamily: 'Merriweather,serif', fontSize: '1.25rem', fontWeight: 900, marginBottom: 8 }}>Something went wrong</h2>
        <p style={{ color: '#888', fontSize: '0.9rem', marginBottom: 24 }}>Server did not respond. Please try again in a moment.</p>
        <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
          <button className="btn-blue" onClick={reset}>Try Again</button>
          <a href="/" className="btn-outline">Go Home</a>
        </div>
        {process.env.NODE_ENV === 'development' && (
          <details style={{ marginTop: 24, textAlign: 'left', background: '#fef2f2', borderRadius: 4, padding: 12, fontSize: '0.75rem', color: '#dc2626' }}>
            <summary style={{ cursor: 'pointer', fontWeight: 600 }}>Error Details</summary>
            <pre style={{ marginTop: 8, whiteSpace: 'pre-wrap', wordBreak: 'break-all' }}>{error?.message}</pre>
          </details>
        )}
      </div>
    </div>
  )
}

export function InlineError({ message = 'Data could not be loaded' }) {
  return (
    <div style={{ background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 4, padding: '12px 16px', display: 'flex', alignItems: 'center', gap: 8 }}>
      <span>⚠️</span>
      <span style={{ fontSize: '0.875rem', color: '#dc2626' }}>{message}</span>
    </div>
  )
}

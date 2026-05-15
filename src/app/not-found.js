import { nicheConfig } from '@/config/site.config'
export const metadata = { title: '404 — Page Not Found | ForexGuru' }
export default function NotFound() {
  const { seo } = nicheConfig
  return (
    <div className="not-found">
      <div>
        <div className="nf-num">404</div>
        <h2 style={{ fontFamily: 'Merriweather,serif', fontSize: '1.25rem', fontWeight: 900, marginBottom: 8 }}>
          Page Not Found
        </h2>
        <p style={{ color: '#888', fontSize: '0.9rem', marginBottom: 24 }}>
          The page you are looking for has been removed or the URL is incorrect.
        </p>
        <div style={{ display: 'flex', gap: 10, justifyContent: 'center', flexWrap: 'wrap' }}>
          <a href="/" className="btn-blue">← Back to Home</a>
          {seo.categories.slice(0, 2).map(cat => (
            <a key={cat.slug} href={`/category/${cat.slug}`} className="btn-outline">{cat.name}</a>
          ))}
        </div>
      </div>
    </div>
  )
}

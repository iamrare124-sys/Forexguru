import './globals.css'
import { nicheConfig } from '@/config/site.config'
import CookieBanner from '@/components/CookieBanner'
import MobileMenu from '@/components/MobileMenu'

const { site, seo, author } = nicheConfig
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://forexguru.in'

export const metadata = {
  metadataBase: new URL(SITE_URL),
  title: { default: `${site.name} — ${site.tagline}`, template: `%s | ${site.name}` },
  description: site.description,
  keywords: [seo.primaryKeyword, ...seo.secondaryKeywords].join(', '),
  authors: [{ name: author.name }],
  creator: site.name,
  publisher: site.name,
  robots: {
    index: true, follow: true,
    googleBot: { index: true, follow: true, 'max-snippet': -1, 'max-image-preview': 'large', 'max-video-preview': -1 },
  },
  openGraph: {
    type: 'website', locale: 'en_IN', siteName: site.name,
    title: `${site.name} — ${site.tagline}`,
    description: site.description,
    images: [{ url: '/og-image.jpg', width: 1200, height: 630, alt: site.name }],
    url: SITE_URL,
  },
  twitter: {
    card: 'summary_large_image',
    title: `${site.name} — ${site.tagline}`,
    description: site.description,
    images: ['/og-image.jpg'],
    creator: seo.twitterHandle || '@ForexGuruIndia',
    site: seo.twitterHandle || '@ForexGuruIndia',
  },
  alternates: { canonical: SITE_URL },
  manifest: '/manifest.json',
  icons: { icon: '/favicon.ico', apple: '/icons/apple-touch-icon.png' },
  verification: {
    google: process.env.GOOGLE_SITE_VERIFICATION || '',
    other: { 'msvalidate.01': process.env.BING_SITE_VERIFICATION || '' },
  },
  category: 'finance',
}

const RATES = [
  { flag: '🇺🇸', name: 'USD/INR', val: '₹83.42', chg: '+0.12%', up: true },
  { flag: '🇪🇺', name: 'EUR/INR', val: '₹90.18', chg: '-0.08%', up: false },
  { flag: '🇬🇧', name: 'GBP/INR', val: '₹105.30', chg: '+0.21%', up: true },
  { flag: '🇦🇪', name: 'AED/INR', val: '₹22.71', chg: '+0.05%', up: true },
  { flag: '🇯🇵', name: 'JPY/INR', val: '₹0.553', chg: '-0.03%', up: false },
  { flag: '₿', name: 'BTC/USD', val: '$67,240', chg: '+1.4%', up: true },
  { flag: '📈', name: 'NIFTY', val: '22,487', chg: '+0.31%', up: true },
  { flag: '🇺🇸', name: 'USD/INR', val: '₹83.42', chg: '+0.12%', up: true },
  { flag: '🇪🇺', name: 'EUR/INR', val: '₹90.18', chg: '-0.08%', up: false },
  { flag: '🇬🇧', name: 'GBP/INR', val: '₹105.30', chg: '+0.21%', up: true },
  { flag: '🇦🇪', name: 'AED/INR', val: '₹22.71', chg: '+0.05%', up: true },
  { flag: '🇯🇵', name: 'JPY/INR', val: '₹0.553', chg: '-0.03%', up: false },
  { flag: '₿', name: 'BTC/USD', val: '$67,240', chg: '+1.4%', up: true },
  { flag: '📈', name: 'NIFTY', val: '22,487', chg: '+0.31%', up: true },
]

export default function RootLayout({ children }) {
  const ga4 = process.env.NEXT_PUBLIC_GA4_ID
  const adsense = process.env.NEXT_PUBLIC_ADSENSE_ID

  return (
    <html lang="en-IN">
      <head>
        <meta name="theme-color" content="#2c4ecb" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Merriweather:wght@700;900&family=Source+Serif+4:ital,wght@0,400;0,600;1,400&family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet" />
        {adsense && adsense !== 'ca-pub-XXXXXXXXXX' && (
          <script async src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${adsense}`} crossOrigin="anonymous" />
        )}
        {ga4 && ga4 !== 'G-XXXXXXXXXX' && (
          <>
            <script async src={`https://www.googletagmanager.com/gtag/js?id=${ga4}`} />
            <script dangerouslySetInnerHTML={{ __html: `window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}gtag('js',new Date());gtag('config','${ga4}');` }} />
          </>
        )}
      </head>
      <body>

        {/* ── HEADER (exactly like Investopedia) ── */}
        <header className="site-header">
          <div className="header-inner">
            <div className="header-left">
              <MobileMenu categories={seo.categories} siteName={site.name} />
              <a href="/" className="logo">
                <svg className="logo-icon" viewBox="0 0 28 28" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <circle cx="14" cy="14" r="14" fill="#2c4ecb"/>
                  <path d="M8 14 L14 8 L20 14 L14 20 Z" fill="white" opacity="0.9"/>
                  <circle cx="14" cy="14" r="3" fill="#2c4ecb"/>
                </svg>
                <span className="logo-text">{site.name}</span>
              </a>
            </div>
            <div className="header-right">
              <a href="/category/forex-tips" className="trade-btn">TIPS</a>
            </div>
          </div>
        </header>

        {/* ── LIVE RATES TICKER ── */}
        <div className="rates-bar">
          <div className="rates-scroll">
            {RATES.map((r, i) => (
              <div key={i} className="rate-chip">
                <span className="rc-flag">{r.flag}</span>
                <div>
                  <div className="rc-name">{r.name}</div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <span className="rc-val">{r.val}</span>
                    <span className={r.up ? 'rc-up' : 'rc-dn'}>{r.chg}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ── CATEGORY TABS ── */}
        <nav className="cat-tabs">
          <div className="cat-tabs-inner">
            <a href="/" className="ctab active">ALL</a>
            {seo.categories.map(cat => (
              <a key={cat.slug} href={`/category/${cat.slug}`} className="ctab">
                {cat.name.toUpperCase()}
              </a>
            ))}
          </div>
        </nav>

        {/* ── MAIN ── */}
        <main>{children}</main>

        {/* ── FOOTER ── */}
        <div style={{ borderTop: '1px solid #e0e0e0', marginTop: 40 }}>
          <div className="site-footer">
            <div className="footer-grid">
              <div className="footer-brand">
                <div className="logo-text">{site.name}</div>
                <p>{site.description}</p>
                <p className="footer-disclaimer">
                  <strong>Disclaimer:</strong> Content on {site.name} is for educational purposes only. Not financial advice. Forex trading involves risk of loss. Consult a qualified financial advisor.
                </p>
              </div>
              <div className="footer-col">
                <h4>News</h4>
                <ul>
                  {seo.categories.map(cat => (
                    <li key={cat.slug}><a href={`/category/${cat.slug}`}>{cat.name}</a></li>
                  ))}
                </ul>
              </div>
              <div className="footer-col">
                <h4>Company</h4>
                <ul>
                  <li><a href="/about">About Us</a></li>
                  <li><a href="/contact">Contact</a></li>
                  <li><a href="/sitemap.xml">Sitemap</a></li>
                </ul>
              </div>
              <div className="footer-col">
                <h4>Legal</h4>
                <ul>
                  <li><a href="/privacy-policy">Privacy Policy</a></li>
                  <li><a href="/terms">Terms of Use</a></li>
                  <li><a href="/disclaimer">Disclaimer</a></li>
                  <li><a href="/cookie-policy">Cookie Policy</a></li>
                </ul>
              </div>
            </div>
            <div className="footer-bottom">
              <span>© {new Date().getFullYear()} {site.name} — All rights reserved</span>
              <span>Built for Indian traders 🇮🇳</span>
            </div>
          </div>
        </div>

        <CookieBanner />

        {/* Back to top */}
        <button className="btt" id="btt" aria-label="Back to top">↑</button>

        <script dangerouslySetInnerHTML={{ __html: `
          var btt=document.getElementById('btt');
          if(btt){
            window.addEventListener('scroll',function(){btt.classList.toggle('show',window.scrollY>400)});
            btt.addEventListener('click',function(){window.scrollTo({top:0,behavior:'smooth'})});
          }
        `}} />
      </body>
    </html>
  )
}

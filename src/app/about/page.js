import { nicheConfig } from '@/config/site.config'
export const metadata = { title: 'About ForexGuru | India\'s #1 Forex News', description: 'About ForexGuru.in — India\'s leading source for live forex rates, currency news and trading analysis.' }
export default function AboutPage() {
  const { author, site } = nicheConfig
  return (
    <div className="static-page">
      <p style={{ fontSize: '0.65rem', fontWeight: 700, color: '#2c4ecb', letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: 8 }}>COMPANY</p>
      <h1>About {site.name}</h1>
      <p className="updated">Last Updated: May 2026</p>
      <div className="static-section">
        <h2>Who We Are</h2>
        <p>{site.name} is India's leading digital publication for forex trading news, live currency rates, and financial analysis. We cover USD/INR movements, RBI policy updates, and global currency events — written specifically for Indian traders, investors, and NRIs.</p>
      </div>
      <div className="static-section">
        <h2>Our Editorial Team</h2>
        <p>Our content is written and reviewed by experienced financial journalists and forex analysts with deep knowledge of Indian currency markets. Our lead analyst, <strong>{author.name}</strong>, has {author.title}.</p>
      </div>
      <div className="static-section">
        <h2>Editorial Standards</h2>
        <p>We follow strict editorial guidelines to ensure accuracy. All market data is sourced from licensed financial data providers. Our news articles clearly distinguish between news reporting and opinion/analysis.</p>
      </div>
      <div className="static-section">
        <h2>Disclaimer</h2>
        <p>Content on {site.name} is for educational and informational purposes only. It does not constitute financial, investment, or trading advice. Forex trading involves significant risk of loss. Always consult a qualified financial advisor.</p>
      </div>
      <div className="static-section">
        <h2>Contact Us</h2>
        <p>For editorial inquiries, corrections, or partnership opportunities, email us at: <a href="mailto:hello@forexguru.in" style={{ color: '#2c4ecb' }}>hello@forexguru.in</a></p>
      </div>
    </div>
  )
}

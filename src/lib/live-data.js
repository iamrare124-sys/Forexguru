// src/lib/live-data.js

export async function fetchLiveData(liveDataConfig) {
  if (!liveDataConfig) return null
  const { provider, symbols } = liveDataConfig
  try {
    switch (provider) {
      case 'exchangerate':
      case 'alphavantage':
      default:
        return await fetchForexRates(symbols)
      case 'coingecko':
        return await fetchCryptoRates(symbols)
      case 'cricapi':
        return await fetchCricketScore()
    }
  } catch (err) {
    console.error('Live data error:', err.message)
    return getStaticForexData(symbols)
  }
}

// Primary: ExchangeRate-API free tier (accurate INR rates)
async function fetchForexRates(symbols) {
  const pairs = symbols || ['USD/INR', 'EUR/INR', 'GBP/INR', 'AED/INR', 'JPY/INR']

  try {
    // exchangerate-api.com free tier — no key needed, accurate rates
    const res = await fetch('https://open.er-api.com/v6/latest/USD', {
      next: { revalidate: 300 },
      headers: { 'Accept': 'application/json' }
    })
    if (!res.ok) throw new Error('er-api failed')
    const data = await res.json()

    if (data.result !== 'success') throw new Error('bad response')

    const inrRate = data.rates?.INR || 83.42
    const rates = {}

    pairs.forEach(pair => {
      const [from] = pair.split('/')
      let rate

      if (from === 'USD') {
        rate = inrRate
      } else if (data.rates?.[from]) {
        // Convert: 1 FROM = ? INR
        // 1 USD = X INR, 1 USD = Y FROM
        // So 1 FROM = X/Y INR
        rate = inrRate / data.rates[from]
      } else {
        return
      }

      rates[pair] = {
        rate: rate.toFixed(2),
        timestamp: new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }),
      }
    })

    return {
      type: 'forex',
      data: rates,
      updatedAt: new Date().toISOString(),
      label: 'Live Forex Rates',
      source: 'live',
    }
  } catch (err) {
    console.error('er-api failed:', err.message)
    // Fallback: frankfurter.app
    try {
      const res2 = await fetch('https://api.frankfurter.app/latest?from=USD', {
        next: { revalidate: 300 }
      })
      if (!res2.ok) throw new Error('frankfurter failed')
      const data2 = await res2.json()

      const inrRate = data2.rates?.INR || 83.42
      const rates = {}

      pairs.forEach(pair => {
        const [from] = pair.split('/')
        let rate
        if (from === 'USD') rate = inrRate
        else if (data2.rates?.[from]) rate = inrRate / data2.rates[from]
        else return
        rates[pair] = { rate: rate.toFixed(2), timestamp: 'Delayed' }
      })

      return { type: 'forex', data: rates, updatedAt: new Date().toISOString(), label: 'Forex Rates', source: 'delayed' }
    } catch {
      return getStaticForexData(pairs)
    }
  }
}

// CoinGecko free
async function fetchCryptoRates(symbols) {
  try {
    const ids = { BTC: 'bitcoin', ETH: 'ethereum', SOL: 'solana', BNB: 'binancecoin', XRP: 'ripple' }
    const coinIds = (symbols || ['BTC', 'ETH']).map(s => ids[s] || s.toLowerCase()).join(',')
    const res = await fetch(
      `https://api.coingecko.com/api/v3/simple/price?ids=${coinIds}&vs_currencies=usd,inr&include_24hr_change=true`,
      { next: { revalidate: 180 } }
    )
    if (!res.ok) throw new Error('coingecko failed')
    const data = await res.json()
    const rates = {}
    ;(symbols || ['BTC', 'ETH']).forEach(sym => {
      const id = ids[sym] || sym.toLowerCase()
      if (data[id]) {
        rates[sym] = {
          usd: '$' + (data[id].usd || 0).toLocaleString('en-US'),
          inr: '₹' + (data[id].inr || 0).toLocaleString('en-IN'),
          change24h: data[id].usd_24h_change?.toFixed(2),
        }
      }
    })
    return { type: 'crypto', data: rates, updatedAt: new Date().toISOString(), label: 'Live Crypto' }
  } catch { return null }
}

async function fetchCricketScore() {
  const key = process.env.CRICAPI_KEY
  if (!key) return null
  try {
    const res = await fetch(`https://api.cricapi.com/v1/currentMatches?apikey=${key}&offset=0`, { next: { revalidate: 120 } })
    const data = await res.json()
    if (!data.data?.length) return null
    const m = data.data.find(x => x.matchStarted && !x.matchEnded) || data.data[0]
    return { type: 'cricket', data: { match: m.name, status: m.status, isLive: m.matchStarted && !m.matchEnded }, updatedAt: new Date().toISOString(), label: m.matchStarted ? 'LIVE Match' : 'Latest Match' }
  } catch { return null }
}

function getStaticForexData(symbols) {
  const staticRates = {
    'USD/INR': '83.54', 'EUR/INR': '91.20', 'GBP/INR': '106.80',
    'JPY/INR': '0.554', 'AED/INR': '22.74', 'SGD/INR': '62.30'
  }
  const rates = {}
  ;(symbols || Object.keys(staticRates)).forEach(pair => {
    if (staticRates[pair]) rates[pair] = { rate: staticRates[pair], timestamp: 'Indicative' }
  })
  return { type: 'forex', data: rates, updatedAt: new Date().toISOString(), label: 'Forex Rates (Indicative)', source: 'static' }
}

export function formatLiveDataForPost(liveData) {
  if (!liveData) return ''
  if (liveData.type === 'forex') {
    return '[LIVE RATES] ' + Object.entries(liveData.data).map(([p, i]) => `${p}: Rs ${i.rate}`).join(' | ')
  }
  if (liveData.type === 'crypto') {
    return '[CRYPTO] ' + Object.entries(liveData.data).map(([s, i]) => `${s}: ${i.usd}`).join(' | ')
  }
  return ''
}

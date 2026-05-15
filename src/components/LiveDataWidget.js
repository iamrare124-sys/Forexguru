'use client'

export default function LiveDataWidget({ liveData, compact = false }) {
  if (!liveData?.data) return null

  if (liveData.type === 'forex') {
    const rates = Object.entries(liveData.data)
    const isIndicative = Object.values(liveData.data)[0]?.timestamp === 'Indicative'

    return (
      <div className={compact ? 'live-widget' : 'live-widget'}>
        <div className="live-badge">
          <span className="live-dot" style={isIndicative ? {background:'#f59e0b'} : {}} />
          <span style={isIndicative ? {color:'#f59e0b'} : {}}>
            {isIndicative ? 'Indicative Rates' : 'Live Rates'}
          </span>
          {!isIndicative && <span style={{color:'rgba(255,255,255,0.4)',fontSize:'0.7rem'}}>• Updates every 5 min</span>}
        </div>
        <div className="rate-chips">
          {rates.map(([pair, info]) => (
            <div key={pair} className="rate-chip">
              <span className="rate-chip-pair">{pair}</span>
              <span className="rate-chip-val">₹{info.rate}</span>
            </div>
          ))}
        </div>
      </div>
    )
  }

  if (liveData.type === 'crypto') {
    const coins = Object.entries(liveData.data)
    return (
      <div className="live-widget">
        <div className="live-badge">
          <span className="live-dot" style={{background:'#f97316'}} />
          <span style={{color:'#f97316'}}>Live Crypto</span>
        </div>
        <div className="rate-chips">
          {coins.map(([sym, info]) => (
            <div key={sym} className="rate-chip">
              <span className="rate-chip-pair">{sym}</span>
              <span className="rate-chip-val">{info.usd}</span>
              {info.change24h && (
                <span className={parseFloat(info.change24h) >= 0 ? 'rate-chip-change up' : 'rate-chip-change dn'}>
                  {parseFloat(info.change24h) >= 0 ? '▲' : '▼'}{Math.abs(info.change24h)}%
                </span>
              )}
            </div>
          ))}
        </div>
      </div>
    )
  }

  if (liveData.type === 'cricket') {
    return (
      <div style={{background:'rgba(255,255,255,0.1)',border:'1px solid rgba(255,255,255,0.2)',borderRadius:'8px',padding:'0.75rem 1rem',display:'inline-flex',alignItems:'center',gap:'0.75rem'}}>
        {liveData.data.isLive && <span className="live-dot" style={{background:'#ef4444'}} />}
        <div>
          <p style={{fontSize:'0.7rem',fontWeight:'700',color:'#4ade80',textTransform:'uppercase'}}>{liveData.label}</p>
          <p style={{fontSize:'0.875rem',fontWeight:'500',color:'white'}}>{liveData.data.match}</p>
          <p style={{fontSize:'0.75rem',color:'rgba(255,255,255,0.6)'}}>{liveData.data.status}</p>
        </div>
      </div>
    )
  }

  return null
}

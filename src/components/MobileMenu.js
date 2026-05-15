'use client'
import { useState } from 'react'
export default function MobileMenu({ categories, siteName }) {
  const [open, setOpen] = useState(false)
  return (
    <>
      <button className="hamburger" onClick={() => setOpen(true)} aria-label="Menu">
        <span /><span /><span />
      </button>
      {open && (
        <>
          <div style={{ position:'fixed',inset:0,background:'rgba(0,0,0,0.4)',zIndex:600 }} onClick={() => setOpen(false)} />
          <div style={{ position:'fixed',top:0,left:0,bottom:0,width:300,background:'#fff',zIndex:700,overflowY:'auto',transform:'translateX(0)',transition:'transform 0.25s ease' }}>
            <div style={{ display:'flex',alignItems:'center',justifyContent:'space-between',padding:16,borderBottom:'1px solid #e0e0e0' }}>
              <span style={{ fontFamily:'Merriweather,serif',fontWeight:900,fontSize:'1.1rem' }}>{siteName}</span>
              <button onClick={() => setOpen(false)} style={{ fontSize:'1.2rem',color:'#666',background:'none',border:'none',cursor:'pointer',padding:4 }}>✕</button>
            </div>
            <div style={{ display:'flex',alignItems:'center',border:'1px solid #ccc',borderRadius:3,overflow:'hidden',margin:16 }}>
              <input type="text" placeholder="What are you looking for?" id="menuQ"
                style={{ flex:1,padding:'10px 12px',border:'none',outline:'none',fontSize:'0.9rem',fontFamily:'inherit' }}
                onKeyDown={e => e.key==='Enter' && (window.location.href='/search?q='+encodeURIComponent(e.target.value))}
              />
              <button style={{ background:'#2c4ecb',color:'#fff',padding:'10px 14px',border:'none',cursor:'pointer' }}
                onClick={() => { const q=document.getElementById('menuQ')?.value; if(q) window.location.href='/search?q='+encodeURIComponent(q) }}>
                🔍
              </button>
            </div>
            <a href="/category/usd-inr" style={{ display:'flex',justifyContent:'space-between',padding:16,borderBottom:'1px solid #f0f0f0',fontWeight:700,color:'#1a1a1a',textDecoration:'none' }}>
              NEWS <span style={{ color:'#ccc' }}>›</span>
            </a>
            {categories.map(cat => (
              <a key={cat.slug} href={`/category/${cat.slug}`} style={{ display:'flex',justifyContent:'space-between',padding:16,borderBottom:'1px solid #f0f0f0',fontWeight:700,color:'#1a1a1a',textDecoration:'none' }}>
                {cat.name.toUpperCase()} <span style={{ color:'#ccc' }}>›</span>
              </a>
            ))}
            <a href="/about" style={{ display:'flex',justifyContent:'space-between',padding:16,borderBottom:'1px solid #f0f0f0',fontWeight:700,color:'#1a1a1a',textDecoration:'none' }}>
              ABOUT <span style={{ color:'#ccc' }}>›</span>
            </a>
            <div style={{ padding:16,borderTop:'1px solid #e0e0e0',fontSize:'0.82rem',color:'#666' }}>Newsletters</div>
            <div style={{ padding:16,display:'flex',alignItems:'center',gap:16 }}>
              <span style={{ fontSize:'0.72rem',color:'#888',fontWeight:600 }}>Follow Us</span>
              <a href="#" style={{ color:'#666',fontSize:'1.2rem' }}>𝕏</a>
              <a href="#" style={{ color:'#666',fontSize:'1.2rem' }}>in</a>
            </div>
          </div>
        </>
      )}
    </>
  )
}

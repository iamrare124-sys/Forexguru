// src/components/AdBanner.js
'use client'
import { useEffect } from 'react'

export default function AdBanner({ slot, format = 'auto', className = '', sticky = false }) {
  const adsenseId = process.env.NEXT_PUBLIC_ADSENSE_ID
  if (!adsenseId || !slot) return null

  useEffect(() => {
    try {
      ;(window.adsbygoogle = window.adsbygoogle || []).push({})
    } catch {}
  }, [])

  const formatMap = {
    horizontal: { width: '100%', height: '90px', format: 'horizontal' },
    rectangle: { width: '300px', height: '250px', format: 'rectangle' },
    auto: { width: '100%', height: 'auto', format: 'auto' },
  }

  const adFormat = formatMap[format] || formatMap.auto

  return (
    <div className={`flex justify-center ${sticky ? 'lg:sticky lg:top-20' : ''} ${className}`}>
      <ins
        className="adsbygoogle"
        style={{ display: 'block', width: adFormat.width, height: adFormat.height }}
        data-ad-client={adsenseId}
        data-ad-slot={slot}
        data-ad-format={adFormat.format}
        data-full-width-responsive="true"
      />
    </div>
  )
}

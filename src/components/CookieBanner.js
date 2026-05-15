'use client'
import { useEffect, useState } from 'react'

export default function CookieBanner() {
  const [show, setShow] = useState(false)
  useEffect(() => {
    if (!localStorage.getItem('cookieConsent')) {
      setTimeout(() => setShow(true), 1500)
    }
  }, [])
  if (!show) return null
  return (
    <div className="cookie-bar show">
      <div className="cookie-inner">
        <p>
          We use cookies to improve your experience and show relevant ads. By continuing, you agree to our{' '}
          <a href="/privacy-policy">Privacy Policy</a> and{' '}
          <a href="/cookie-policy">Cookie Policy</a>.
        </p>
        <div className="cookie-btns">
          <button className="btn-accept" onClick={() => { localStorage.setItem('cookieConsent', 'accepted'); setShow(false) }}>
            Accept All
          </button>
          <button className="btn-decline" onClick={() => { localStorage.setItem('cookieConsent', 'declined'); setShow(false) }}>
            Decline
          </button>
        </div>
      </div>
    </div>
  )
}

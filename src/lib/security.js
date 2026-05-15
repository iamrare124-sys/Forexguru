// src/lib/security.js
// API routes ke liye security middleware

// ── Rate Limiter (in-memory, Vercel ke liye kaafi hai) ─────
const rateLimitMap = new Map()

export function rateLimit(ip, limitPerMinute = 60) {
  const now = Date.now()
  const windowStart = now - 60 * 1000   // Last 1 minute

  const requests = rateLimitMap.get(ip) || []

  // Remove old requests outside window
  const recent = requests.filter(time => time > windowStart)
  recent.push(now)
  rateLimitMap.set(ip, recent)

  // Cleanup old IPs periodically
  if (rateLimitMap.size > 10000) {
    for (const [key, times] of rateLimitMap.entries()) {
      if (times.every(t => t < windowStart)) {
        rateLimitMap.delete(key)
      }
    }
  }

  return {
    allowed: recent.length <= limitPerMinute,
    remaining: Math.max(0, limitPerMinute - recent.length),
    total: limitPerMinute,
  }
}

// ── Verify API Password ────────────────────────────────────
export function verifyApiPassword(request) {
  const authHeader = request.headers.get('authorization')
  const expected = `Bearer ${process.env.SITE_API_PASSWORD}`

  if (!authHeader || authHeader !== expected) {
    return false
  }
  return true
}

// ── Verify Cron Secret ─────────────────────────────────────
export function verifyCronSecret(request) {
  const secret = process.env.CRON_SECRET

  // 1. Vercel automatic cron — sends Authorization: Bearer <secret>
  const authHeader = request.headers.get('authorization')
  if (authHeader && authHeader === `Bearer ${secret}`) return true

  // 2. Manual trigger — ?secret=xxx in URL
  const querySecret = new URL(request.url).searchParams.get('secret')
  if (querySecret && querySecret === secret) return true

  // 3. x-cron-secret header (legacy)
  const headerSecret = request.headers.get('x-cron-secret')
  if (headerSecret && headerSecret === secret) return true

  return false
}

// ── Get Client IP ──────────────────────────────────────────
export function getClientIP(request) {
  return (
    request.headers.get('x-forwarded-for')?.split(',')[0]?.trim()
    || request.headers.get('x-real-ip')
    || '127.0.0.1'
  )
}

// ── Security Headers ───────────────────────────────────────
export function getSecurityHeaders() {
  return {
    'X-Frame-Options': 'DENY',
    'X-Content-Type-Options': 'nosniff',
    'X-XSS-Protection': '1; mode=block',
    'Referrer-Policy': 'strict-origin-when-cross-origin',
    'Permissions-Policy': 'camera=(), microphone=(), geolocation=()',
    'Strict-Transport-Security': 'max-age=31536000; includeSubDomains',
    'Content-Security-Policy': [
      "default-src 'self'",
      "script-src 'self' 'unsafe-inline' https://pagead2.googlesyndication.com https://www.googletagmanager.com",
      "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
      "img-src 'self' data: https://images.pexels.com https://images.unsplash.com https://picsum.photos",
      "font-src 'self' https://fonts.gstatic.com",
      "connect-src 'self' https://vitals.vercel-insights.com",
      "frame-src https://googleads.g.doubleclick.net",
    ].join('; '),
  }
}

// ── Input Sanitizer ────────────────────────────────────────
export function sanitizeString(str, maxLength = 500) {
  if (!str || typeof str !== 'string') return ''
  return str
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/<[^>]+>/g, '')
    .replace(/javascript:/gi, '')
    .trim()
    .slice(0, maxLength)
}

// ── Standard API Response ──────────────────────────────────
export function apiResponse(data, status = 200) {
  return Response.json(data, {
    status,
    headers: {
      'Content-Type': 'application/json',
      ...getSecurityHeaders(),
    },
  })
}

export function apiError(message, status = 400) {
  return apiResponse({ success: false, error: message }, status)
}

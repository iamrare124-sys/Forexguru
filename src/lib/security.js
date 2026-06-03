// lib/security.js — 3-method cron auth
export function verifyCronSecret(request) {
  const secret = process.env.CRON_SECRET
  if (!secret) return false
  // 1. Vercel automatic cron — Authorization: Bearer header
  if (request.headers.get('authorization') === `Bearer ${secret}`) return true
  // 2. Manual trigger — ?secret= param
  if (new URL(request.url).searchParams.get('secret') === secret) return true
  // 3. Legacy x-cron-secret header
  if (request.headers.get('x-cron-secret') === secret) return true
  return false
}
export function apiResponse(data, status = 200) {
  return Response.json(data, { status })
}

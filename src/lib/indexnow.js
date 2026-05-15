// src/lib/indexnow.js
// Naya post publish hone par IndexNow ko notify karo

export async function notifyIndexNow(urls) {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL
  const apiPassword = process.env.SITE_API_PASSWORD

  if (!siteUrl || !apiPassword) return

  try {
    await fetch(`${siteUrl}/api/indexnow`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiPassword}`,
      },
      body: JSON.stringify({ urls }),
    })
    console.log(`✅ IndexNow notified for ${urls.length} URLs`)
  } catch (err) {
    console.error('IndexNow notification failed:', err.message)
    // Non-critical — don't throw
  }
}

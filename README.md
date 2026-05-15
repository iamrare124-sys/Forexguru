# SyndicateHub — Blog Template

Auto-publishing niche blog. Sirf `.env` mein `NICHE` change karo — baaki sab automatic.

## 🚀 Quick Setup (15 minutes)

### 1. Clone & Install
```bash
git clone https://github.com/yourusername/syndicatehub-template.git my-forex-blog
cd my-forex-blog
npm install
```

### 2. Environment Setup
```bash
cp .env.example .env.local
```
`.env.local` mein fill karo:
- `NICHE=forex`  ← sirf yeh change karo new site ke liye
- `GROQ_API_KEY=` ← from console.groq.com
- `NEXT_PUBLIC_SUPABASE_URL=` ← from supabase.com
- `NEXT_PUBLIC_SUPABASE_ANON_KEY=`
- `SUPABASE_SERVICE_ROLE_KEY=`
- `PEXELS_API_KEY=` ← from pexels.com/api
- `SITE_API_PASSWORD=` ← koi bhi strong password
- `CRON_SECRET=` ← koi bhi random string
- `NEXT_PUBLIC_SITE_URL=https://yourdomain.in`

### 3. Supabase Setup
Supabase dashboard → SQL Editor → Run the SQL from `src/lib/supabase.js` comments.

### 4. Local Test
```bash
npm run dev
# Open http://localhost:3000
```

### 5. Test Cron Manually
```bash
curl -H "x-cron-secret: YOUR_CRON_SECRET" http://localhost:3000/api/cron
```

### 6. Deploy to Vercel
```bash
npm i -g vercel
vercel --prod
```
Vercel dashboard mein saari env vars add karo.

### 7. vercel.json Update
`vercel.json` mein REPLACE_WITH_CRON_SECRET ko apne CRON_SECRET se replace karo.

---

## 🔄 New Site Banana (150 sites ke liye)

```bash
# Step 1: Clone
git clone https://github.com/yourusername/syndicatehub-template.git crypto-samachar
cd crypto-samachar

# Step 2: Sirf NICHE change karo .env mein
echo "NICHE=crypto" >> .env.local

# Step 3: Deploy
vercel --prod
```

Available niches: `forex`, `stocks`, `mutualfunds`, `crypto`, `loans`, `aitools`, `yojana`, `jobs`, `cricket`, `startup`

---

## 📁 Project Structure

```
src/
├── app/
│   ├── page.js              # Homepage
│   ├── [slug]/page.js       # Post page
│   ├── category/[cat]/      # Category page
│   ├── api/
│   │   ├── cron/route.js    # Auto-publish (runs 6x/day)
│   │   └── publish/route.js # Manual publish API
│   ├── sitemap.js           # Auto sitemap
│   └── robots.js            # Robots.txt
├── components/
│   ├── PostCard.js          # Post card (3 variants)
│   ├── LiveDataWidget.js    # Live forex/crypto/cricket widget
│   └── AdBanner.js          # AdSense component
├── config/
│   ├── site.config.js       # Loads niche config from .env
│   └── niches/
│       ├── forex.config.js
│       ├── crypto.config.js  (coming)
│       └── ...
└── lib/
    ├── supabase.js          # DB client + queries
    ├── rss-fetcher.js       # News from RSS feeds
    ├── live-data.js         # Live forex/crypto/sports data
    ├── blog-generator.js    # Groq AI blog generation
    ├── image-fetcher.js     # Pexels/Unsplash images
    ├── security.js          # Auth, rate limit, headers
    └── utils.js             # Helpers
```

---

## 🔐 Security Features
- API password auth on all endpoints
- Rate limiting (60 req/min)
- Supabase Row Level Security
- CORS restricted to own domain
- Security headers (XSS, HSTS, CSP)
- Input sanitization
- No API keys in client-side code

---

## 💰 AdSense Setup
1. Apply at google.com/adsense with live site URL
2. Approval milne par `NEXT_PUBLIC_ADSENSE_ID` set karo
3. Ad slots `.env` mein update karo

---

## ❓ Issues?
Check `vercel.json` cron secret matches `CRON_SECRET` env var.

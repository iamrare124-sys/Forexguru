const forexConfig = {
  site: {
    name: "ForexGuru",
    domain: "forexguru.in",
    tagline: "India's #1 Forex & Currency News",
    description: "Live USD/INR rates, expert forex analysis and currency trading insights for Indian traders, NRIs and investors.",
    language: "en-IN",
    locale: "en_IN",
    themeColor: "#0ea5e9",
    accentColor: "#f59e0b",
  },
  author: {
    name: "Rahul Sharma",
    title: "Senior Forex Analyst | 7 Years Experience",
    bio: "Rahul Sharma has 7 years of hands-on forex trading experience in Indian currency markets. Previously with Kotak Securities, now helping Indian traders navigate the currency markets through ForexGuru.in",
    avatar: "/authors/rahul.jpg",
    twitter: "@rahulforex",
  },
  rss: [
    "https://news.google.com/rss/search?q=forex+trading+india+usd+inr&hl=en-IN&gl=IN&ceid=IN:en",
    "https://news.google.com/rss/search?q=dollar+rupee+exchange+rate+today&hl=en-IN&gl=IN&ceid=IN:en",
    "https://news.google.com/rss/search?q=RBI+forex+reserve+currency+india&hl=en-IN&gl=IN&ceid=IN:en",
    "https://news.google.com/rss/search?q=rupee+dollar+rate+rbi+policy&hl=en-IN&gl=IN&ceid=IN:en",
  ],
  reddit: ["forex", "IndiaInvestments", "personalfinanceindia"],
  liveData: {
    provider: "exchangerate",
    backup: "alphavantage",
    symbols: ["USD/INR", "EUR/INR", "GBP/INR", "JPY/INR", "AED/INR"],
    widgetLabel: "Live Forex Rates",
    refreshEvery: 300,
    showInPost: true,
    showInSidebar: true,
  },
  images: {
    pexels: ["forex trading", "currency exchange india", "money trading charts", "rupee dollar", "indian finance"],
    unsplash: ["finance charts", "trading desk", "indian currency", "stock market"],
    fallback: "/images/forex-default.jpg",
  },
  ai: {
    model: "llama-3.3-70b-versatile",
    temperature: 0.85,
    top_p: 0.9,
    frequency_penalty: 0.4,
    presence_penalty: 0.3,
    systemPrompt: `You are Rahul Sharma, a real forex analyst writing for ForexGuru.in. You've traded currencies for 7 years. You're not an AI assistant — you're a person with opinions, frustrations, and insider knowledge about Indian forex markets.

ABSOLUTE BANNED LIST — never use these words or phrases, not even once:
- "In this article" / "In today's article"
- "It is important to note" / "It is worth noting"
- "Furthermore" / "Moreover" / "Additionally" / "In addition"
- "In conclusion" / "To summarize" / "To wrap up"
- "Delve into" / "Dive into" / "Navigate" / "Landscape"
- "Comprehensive" / "In-depth" / "Robust"
- "It's worth mentioning" / "As we can see"
- "This article will" / "We will explore"
- "Shed light on" / "Unpack" / "Leverage"
- Any sentence starting with "It is" or "There is/are" as opening lines

HOW TO WRITE — follow this exactly:
1. First sentence = the actual news + a number. No warmup. No greeting. Just the fact.
   Example: "Dollar hit ₹83.58 this morning — that's a 4-month high and every importer in India felt it."
   NOT: "In today's forex market, the dollar has seen significant movement..."

2. Write like you're texting a friend who knows finance. Casual but sharp.
   Good: "RBI stepped in around 83.60. They always do. But here's what's different this time."
   Bad: "The Reserve Bank of India intervened at the 83.60 level as per their policy mandate."

3. Have ONE strong opinion per article. Disagree with something.
   Example: "Analysts are calling this a 'temporary dip.' I don't buy it. Here's why."

4. Sentence length: mix it up hard.
   Short. Then a longer sentence that explains the context and gives the reader something to think about. Then short again.

5. India-specific always. Not generic "traders" — say:
   - "If you're an NRI sending money home from Dubai..."
   - "Mumbai importers paying for Chinese goods..."  
   - "A Pune IT professional with USD savings..."

6. Use numbers like a journalist: not "the rupee weakened" but "rupee lost 38 paise in 3 hours"

7. One "by the way" moment per article — a quick aside that feels like insider knowledge:
   "Quick note — the 84 level is psychologically huge. RBI will fight tooth and nail to keep it below that."

8. End with what the reader should actually DO today. Specific. Not vague.
   Good: "If you have USD to convert, today at 83.58 is better than waiting for 84. Lock it in."
   Bad: "Investors should carefully consider their options in this volatile environment."`,

    postStructure: [
      { heading: null, type: "hook", words: 80 },
      { heading: "What Happened — The Full Picture", type: "news", words: 180 },
      { heading: "Why the Rupee Moved (Real Reason)", type: "analysis", words: 160 },
      { heading: "Who Gets Hit and Who Benefits", type: "impact", words: 150 },
      { heading: "What Experts Are Saying (And What I Think)", type: "expert", words: 130 },
      { heading: "Your Move Right Now", type: "action", words: 120 },
    ],

    // Rotate structures so every post feels different
    alternateStructures: [
      ["The Situation Right Now", "How We Got Here", "The India Angle", "What Traders Are Doing", "Bottom Line"],
      ["Breaking: What Just Changed", "Why This Time Is Different", "Impact on Your Money", "Expert Opinions", "Action Steps"],
      ["Is the Rupee Really Falling?", "The Numbers Don't Lie", "Winners and Losers Today", "RBI's Next Move", "What You Should Do"],
    ],

    faqCount: 4,
    faqTopics: [
      "What is the USD to INR rate today?",
      "Is forex trading legal in India?",
      "Why is the rupee falling against the dollar?",
      "Best forex broker in India 2026",
      "How to convert USD to INR at best rate",
      "Will dollar rate increase tomorrow in India",
    ],
    qualityCheck: `Rate this article 1-10 strictly:
1. Does the first sentence contain a specific number or rate? (2 pts)
2. Are ALL these phrases absent: "In this article", "Furthermore", "It is important", "In conclusion", "Delve"? (2 pts — 0 if any present)
3. Is there at least one India-specific example (city, NRI, Indian business)? (2 pts)
4. Is there ONE clear opinion or disagreement with mainstream view? (2 pts)
5. Are there exactly 4 FAQ entries? (2 pts)

First 400 chars of article: CONTENT_PLACEHOLDER
FAQ count: FAQ_COUNT_PLACEHOLDER

Reply with ONLY a single number 1-10. Nothing else.`,
    minScore: 7,
    maxRetries: 3,
  },
  seo: {
    primaryKeyword: "forex trading india",
    secondaryKeywords: [
      "usd inr rate today",
      "dollar rupee exchange rate",
      "forex trading tips india",
      "currency exchange india",
      "best forex broker india",
    ],
    schemaType: "NewsArticle",
    categories: [
      { slug: "usd-inr", name: "USD/INR Rate", description: "Live USD to INR exchange rate news and analysis" },
      { slug: "forex-tips", name: "Forex Tips", description: "Forex trading tips and strategies for India" },
      { slug: "rbi-news", name: "RBI News", description: "RBI forex and currency policy updates" },
      { slug: "currency-news", name: "Currency News", description: "Indian rupee and global currency news" },
    ],
  },
  cron: {
    postsPerDay: 6,
    schedule: "0 6,9,12,15,18,21 * * *",
    maxPostsPerRun: 1,
  },
  twitter: {
    enabled: false,
    template: "🔴 {title}\n\nUSD/INR: ₹{rate} | {time}\n\n{url}\n\n#ForexIndia #USDINR #RupeeRate",
    hashtags: ["#ForexIndia", "#USDINR", "#CurrencyExchange"],
  },
  adsense: {
    header: { slot: "XXXXXXXXXX", format: "728x90" },
    inContent: { slot: "XXXXXXXXXX", format: "300x250" },
    sidebar: { slot: "XXXXXXXXXX", format: "300x250" },
    footer: { slot: "XXXXXXXXXX", format: "728x90" },
  },
}

module.exports = forexConfig

// src/config/site.config.js

const getNicheConfig = () => {
  const niche = process.env.NICHE || 'forex'
  try {
    return require(`./niches/${niche}.config.js`)
  } catch (err) {
    console.warn(`Config not found for niche: "${niche}", using forex`)
    return require('./niches/forex.config.js')
  }
}

const getLanguageConfig = () => {
  const instructions = {
    hinglish: {
      name: 'Hinglish', locale: 'en-IN', htmlLang: 'hi-IN',
      writingInstruction: `Tu Hinglish mein likhta hai — Hindi aur English ka natural mix jaise Indians bolte hain.\nExamples:\n- "Aaj dollar ne phir naya high toda — Rs 84.20 pe pahunch gaya"\n- "Agar aap SIP start karna chahte hain toh yeh 3 cheezein zaroor check karo"`,
      numberFormat: 'en-IN', currencySymbol: 'Rs',
    },
    hindi: {
      name: 'Hindi', locale: 'hi-IN', htmlLang: 'hi-IN',
      writingInstruction: `Tu shuddh Hindi mein likhta hai — simple, clear aur samajhne mein aasan.\nTechnical terms jaise "SIP", "EMI", "forex" English mein likhna theek hai.`,
      numberFormat: 'hi-IN', currencySymbol: 'Rs',
    },
    english: {
      name: 'English', locale: 'en-IN', htmlLang: 'en-IN',
      writingInstruction: `Write in sharp, direct Indian English. You are a real financial journalist, not an AI.
Rules: Start with the actual news fact + number. Use short sentences. Have opinions. Mention specific Indian cities, businesses, or scenarios. Never use transition words like "Furthermore", "Moreover", "Additionally". Sound like a person, not a report.`,
      numberFormat: 'en-IN', currencySymbol: '₹',
    },
  }
  const mode = process.env.LANGUAGE_MODE || 'english'
  return instructions[mode] || instructions.hinglish
}

const nicheConfig = getNicheConfig()
const languageConfig = getLanguageConfig()

const globalConfig = {
  postsPerPage: 12,
  excerptLength: 150,
  security: { rateLimitPerMinute: 60 },
  supabase: {
    url: process.env.NEXT_PUBLIC_SUPABASE_URL,
    anonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    serviceKey: process.env.SUPABASE_SERVICE_ROLE_KEY,
  },
}

module.exports = { nicheConfig, languageConfig, globalConfig }

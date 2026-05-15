// src/config/language.config.js
// LANGUAGE_MODE env var se language instructions load karta hai

const languageInstructions = {

  hinglish: {
    name: 'Hinglish',
    locale: 'en-IN',
    htmlLang: 'hi-IN',
    writingInstruction: `Tu Hinglish mein likhta hai — Hindi aur English ka natural mix, 
jaise Indians actually bolte aur type karte hain (WhatsApp style nahi, professional lekin friendly).

Examples:
- "Aaj dollar ne phir ek naya high toda — ₹84.20 pe pahunch gaya"
- "Agar aap SIP start karna chahte hain toh yeh 3 cheezein zaroor check karo"
- "Experts ka maanna hai ki yeh trend agle 2-3 months tak continue karega"

Avoid: Pure English paragraphs, pure Hindi paragraphs, Hinglish jo forced lage.`,

    numberFormat: 'en-IN',
    currencySymbol: '₹',
    dateFormat: { day: 'numeric', month: 'long', year: 'numeric' },
  },

  hindi: {
    name: 'Hindi',
    locale: 'hi-IN',
    htmlLang: 'hi-IN',
    writingInstruction: `Tu shuddh Hindi mein likhta hai — simple, clear, aur samajhne mein aasan.
Technical terms jo Hindi mein nahi hain (jaise "SIP", "EMI", "forex", "IPL") woh English mein likhna theek hai.

Examples:
- "Aaj sheyar bazaar mein bhari giravat dekhi gayi"
- "Sarkar ne nai yojana ki ghoshna ki hai jisme kisan bhai ko seedha laabh milega"
- "Naukri dhundhne walon ke liye yeh khabar bahut zaruri hai"

Avoid: Roman script Hindi, unnecessary English words jahan Hindi word maujood ho.`,

    numberFormat: 'hi-IN',
    currencySymbol: '₹',
    dateFormat: { day: 'numeric', month: 'long', year: 'numeric' },
  },

  english: {
    name: 'English',
    locale: 'en-IN',
    htmlLang: 'en-IN',
    writingInstruction: `Write in simple, conversational Indian English. 
Friendly and expert tone — like a knowledgeable friend explaining things clearly.

Examples:
- "The Nifty hit a new high today — here's what it means for your portfolio"
- "3 AI tools every Indian freelancer should try in 2026"
- "Here's why this startup just raised ₹50 crore — and what it tells us about the market"

Avoid: British slang, American idioms, overly formal language, robotic AI phrasing.`,

    numberFormat: 'en-IN',
    currencySymbol: '₹',
    dateFormat: { day: 'numeric', month: 'short', year: 'numeric' },
  },
}

// ── Main export ────────────────────────────────────────────
export function getLanguageConfig() {
  const mode = process.env.LANGUAGE_MODE || 'hinglish'

  if (!languageInstructions[mode]) {
    console.warn(`⚠️ Unknown LANGUAGE_MODE "${mode}", falling back to hinglish`)
    return languageInstructions.hinglish
  }

  return languageInstructions[mode]
}

export const languageConfig = getLanguageConfig()

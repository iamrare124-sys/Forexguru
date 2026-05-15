-- ============================================================
-- SYNDICATEHUB — Supabase SQL Schema
-- Supabase Dashboard > SQL Editor mein yeh poora paste karo
-- aur Run karo
-- ============================================================

-- Posts table
CREATE TABLE IF NOT EXISTS posts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  slug TEXT UNIQUE NOT NULL,
  title TEXT NOT NULL,
  excerpt TEXT,
  content TEXT NOT NULL,
  category TEXT NOT NULL,
  tags TEXT[] DEFAULT '{}',
  cover_image TEXT,
  cover_image_alt TEXT,
  author_name TEXT,
  author_title TEXT,
  meta_title TEXT,
  meta_description TEXT,
  schema_json JSONB,
  live_data JSONB,
  faq JSONB,
  reading_time INTEGER DEFAULT 5,
  word_count INTEGER DEFAULT 800,
  ai_score INTEGER DEFAULT 8,
  published BOOLEAN DEFAULT true,
  tweeted BOOLEAN DEFAULT false,
  source_url TEXT,
  source_headline TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for fast queries
CREATE INDEX IF NOT EXISTS idx_posts_slug ON posts(slug);
CREATE INDEX IF NOT EXISTS idx_posts_category ON posts(category);
CREATE INDEX IF NOT EXISTS idx_posts_created_at ON posts(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_posts_published ON posts(published);
CREATE INDEX IF NOT EXISTS idx_posts_source_url ON posts(source_url);

-- Row Level Security ON karo
ALTER TABLE posts ENABLE ROW LEVEL SECURITY;

-- Public sirf published posts read kar sakta hai
CREATE POLICY "Public read published posts" ON posts
  FOR SELECT USING (published = true);

-- Service role ko full access
CREATE POLICY "Service role full access" ON posts
  FOR ALL USING (auth.role() = 'service_role');

-- Auto-update updated_at on every update
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS posts_updated_at ON posts;
CREATE TRIGGER posts_updated_at
  BEFORE UPDATE ON posts
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- Test insert karo (optional — baad mein delete kar sakte ho)
INSERT INTO posts (
  slug, title, excerpt, content, category, tags,
  author_name, author_title, meta_title, meta_description,
  reading_time, word_count, ai_score, published
) VALUES (
  'test-post-syndicatehub',
  'ForexGuru Test Post — Setup Successful!',
  'Yeh ek test post hai. Supabase successfully connected hai.',
  'Aaj ka din ek naya chapter shuru karta hai — ForexGuru.in live ho gaya! USD/INR rate aaj ₹83.42 pe hai. Yeh ek test post hai jo confirm karta hai ki database correctly setup ho gaya hai.',
  'usd-inr',
  ARRAY['forex', 'test', 'setup'],
  'Rahul Sharma',
  'Senior Forex Analyst | 7 Saal Ka Experience',
  'ForexGuru Test — Setup Successful',
  'ForexGuru.in ka Supabase database successfully setup ho gaya. Ab auto-publishing shuru ho sakti hai.',
  1, 50, 9, true
);

-- Confirm karo
SELECT id, slug, title, created_at FROM posts WHERE slug = 'test-post-syndicatehub';

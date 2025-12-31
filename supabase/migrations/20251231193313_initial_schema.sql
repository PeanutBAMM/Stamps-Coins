-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Gebruikersprofielen en Pro-status
CREATE TABLE profiles (
  id uuid REFERENCES auth.users ON DELETE CASCADE,
  pro_status boolean DEFAULT false,
  region text, -- 'EU', 'NA', 'ASIA'
  item_count integer DEFAULT 0, -- Voor 35 items limiet tracking
  PRIMARY KEY (id)
);

-- Vaults (Kluizen voor organisatie)
CREATE TABLE vaults (
  id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  name text, -- bijv. "Kluis A", "Belegging"
  created_at timestamp with time zone DEFAULT now()
);

-- De verzameling
CREATE TABLE items (
  id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  vault_id uuid REFERENCES vaults(id) ON DELETE SET NULL,
  name text,
  category text, -- 'coin', 'stamp'
  image_url text,
  metadata jsonb, -- jaar, land, tanding/metaal
  purchase_price decimal,
  market_price decimal, -- Live waarde via Google Grounding
  manual_value decimal, -- User override
  ignore_price_suggestion boolean DEFAULT false, -- Voor Manual Override logic
  condition_report jsonb, -- Grade (VF-20) en AI-onderbouwing
  material text, -- Specifiek voor munten (Goud, Zilver, Koper)
  last_modified_at timestamp with time zone DEFAULT now(),
  created_at timestamp with time zone DEFAULT now()
);

-- Prijs caching per regio (Legacy - voor backwards compatibility)
CREATE TABLE price_cache (
  item_identifier text PRIMARY KEY, -- bijv: "NL_10G_1897"
  region text,
  last_value decimal,
  updated_at timestamp DEFAULT now()
);

-- Portfolio geschiedenis voor grafieken
CREATE TABLE portfolio_history (
  id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  total_value decimal,
  date date DEFAULT CURRENT_DATE,
  UNIQUE(user_id, date)
);

-- Global Assets Registry (Unieke items wereldwijd)
CREATE TABLE global_assets (
  id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
  asset_identifier text UNIQUE, -- bijv: "NL_10G_1897"
  name text,
  category text, -- 'coin', 'stamp'
  metadata jsonb, -- technische specs
  created_at timestamp with time zone DEFAULT now()
);

-- Market Prices per continent (De prijsmotor)
CREATE TABLE market_prices (
  id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
  asset_id uuid REFERENCES global_assets(id) ON DELETE CASCADE,
  region text, -- 'EU', 'NA', 'ASIA'
  current_value decimal,
  confidence_score decimal, -- 0.0 - 1.0
  updated_at timestamp DEFAULT now(),
  UNIQUE(asset_id, region)
);

-- News Feed Table (From Sprint 5 planning)
CREATE TABLE news_feed (
  id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
  title text,
  summary text,
  category text, -- 'coin', 'stamp', 'general'
  source_url text,
  image_url text,
  published_at timestamp with time zone,
  created_at timestamp with time zone DEFAULT now()
);

-- Enable RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE vaults ENABLE ROW LEVEL SECURITY;
ALTER TABLE items ENABLE ROW LEVEL SECURITY;
ALTER TABLE portfolio_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE price_cache ENABLE ROW LEVEL SECURITY;
ALTER TABLE global_assets ENABLE ROW LEVEL SECURITY;
ALTER TABLE market_prices ENABLE ROW LEVEL SECURITY;
ALTER TABLE news_feed ENABLE ROW LEVEL SECURITY;

-- RLS Policies

-- Profiles
CREATE POLICY "Users can view own profile" ON profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON profiles FOR UPDATE USING (auth.uid() = id);

-- Vaults
CREATE POLICY "Users can view own vaults" ON vaults FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own vaults" ON vaults FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own vaults" ON vaults FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own vaults" ON vaults FOR DELETE USING (auth.uid() = user_id);

-- Items
CREATE POLICY "Users can view own items" ON items FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own items" ON items FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own items" ON items FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own items" ON items FOR DELETE USING (auth.uid() = user_id);

-- Portfolio History
CREATE POLICY "Users can view own portfolio history" ON portfolio_history FOR SELECT USING (auth.uid() = user_id);

-- Market Data & News (Readable by all authenticated users)
CREATE POLICY "Authenticated users can view market data" ON market_prices FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can view global assets" ON global_assets FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can view price cache" ON price_cache FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can view news feed" ON news_feed FOR SELECT TO authenticated USING (true);

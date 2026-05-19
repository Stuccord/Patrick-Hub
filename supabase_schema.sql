-- PatrickHub Supabase Schema

-- Users Table
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  phone TEXT NOT NULL,
  username TEXT UNIQUE NOT NULL, -- This is the store slug
  role TEXT NOT NULL CHECK (role IN ('admin', 'agent')),
  status TEXT NOT NULL CHECK (status IN ('pending', 'active', 'suspended')) DEFAULT 'pending',
  password_hash TEXT, -- Storing encrypted password (or use Supabase Auth)
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Bundles Table
CREATE TABLE bundles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  size_gb NUMERIC NOT NULL,
  network TEXT NOT NULL CHECK (network IN ('MTN', 'Vodafone', 'AirtelTigo')),
  base_price NUMERIC NOT NULL,
  min_resell_price NUMERIC NOT NULL,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Agent Bundles (Prices set by agents)
CREATE TABLE agent_bundles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  agent_id UUID REFERENCES users(id) ON DELETE CASCADE,
  bundle_id UUID REFERENCES bundles(id) ON DELETE CASCADE,
  selling_price NUMERIC NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(agent_id, bundle_id)
);

-- Orders
CREATE TABLE orders (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  agent_id UUID REFERENCES users(id) ON DELETE SET NULL,
  bundle_id UUID REFERENCES bundles(id) ON DELETE SET NULL,
  customer_phone TEXT NOT NULL,
  customer_paid NUMERIC NOT NULL,
  agent_credited NUMERIC NOT NULL,
  platform_fee NUMERIC NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('pending', 'completed', 'failed')) DEFAULT 'pending',
  reference TEXT UNIQUE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Wallets
CREATE TABLE wallets (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  agent_id UUID REFERENCES users(id) ON DELETE CASCADE UNIQUE,
  balance NUMERIC DEFAULT 0.00,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Wallet Transactions
CREATE TABLE wallet_transactions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  agent_id UUID REFERENCES users(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('credit', 'debit')),
  amount NUMERIC NOT NULL,
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Withdrawals
CREATE TABLE withdrawals (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  agent_id UUID REFERENCES users(id) ON DELETE CASCADE,
  amount_requested NUMERIC NOT NULL,
  commission_pct NUMERIC NOT NULL,
  payout_amount NUMERIC NOT NULL,
  momo_number TEXT NOT NULL,
  network TEXT NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('pending', 'approved', 'rejected')) DEFAULT 'pending',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Platform Configuration
CREATE TABLE platform_config (
  key TEXT PRIMARY KEY,
  value TEXT NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Insert Default Config
INSERT INTO platform_config (key, value) VALUES 
('transaction_fee', '0.20'),
('withdrawal_commission', '5.00');

-- Optional RLS Policies
-- ALTER TABLE users ENABLE ROW LEVEL SECURITY;
-- ... setup RLS as needed for real prod env.

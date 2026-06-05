-- Patrick's Info Tech Supabase Schema

-- Users Table
CREATE TABLE users (
  id UUID PRIMARY KEY, -- Maps to Supabase auth.users.id
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  phone TEXT NOT NULL,
  username TEXT UNIQUE NOT NULL, -- This is the store slug
  role TEXT NOT NULL CHECK (role IN ('admin', 'agent')),
  status TEXT NOT NULL CHECK (status IN ('pending', 'active', 'suspended')) DEFAULT 'pending',
  password_hash TEXT, -- Storing encrypted password (or use Supabase Auth)
  store_name TEXT,
  store_description TEXT,
  logo_url TEXT,
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
  cheapgigz_id TEXT,             -- Product ID from Cheap Gigz API for auto-fulfillment
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
-- For existing databases, run: ALTER TABLE bundles ADD COLUMN IF NOT EXISTS cheapgigz_id TEXT;

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
  customer_network TEXT,               -- Network chosen by customer (MTN, Vodafone, AirtelTigo)
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

-- Row Level Security (RLS) Policies
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bundles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.agent_bundles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.wallets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.wallet_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.withdrawals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.platform_config ENABLE ROW LEVEL SECURITY;

-- public.users Table Policies
CREATE POLICY "Allow public select active users" ON public.users FOR SELECT USING (status = 'active');
CREATE POLICY "Allow users insert own profile" ON public.users FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "Allow users select own profile" ON public.users FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Allow users update own profile" ON public.users FOR UPDATE USING (auth.uid() = id) WITH CHECK (auth.uid() = id);
CREATE POLICY "Allow admins full access to users" ON public.users FOR ALL USING (((auth.jwt() -> 'user_metadata') ->> 'role') = 'admin');

-- public.bundles Table Policies
CREATE POLICY "Allow public select active bundles" ON public.bundles FOR SELECT USING (is_active = true);
CREATE POLICY "Allow admins full access to bundles" ON public.bundles FOR ALL USING (((auth.jwt() -> 'user_metadata') ->> 'role') = 'admin');

-- public.agent_bundles Table Policies
CREATE POLICY "Allow public select agent bundles" ON public.agent_bundles FOR SELECT USING (true);
CREATE POLICY "Allow agents to manage own bundles" ON public.agent_bundles FOR ALL USING (agent_id = auth.uid());
CREATE POLICY "Allow admins full access to agent bundles" ON public.agent_bundles FOR ALL USING (((auth.jwt() -> 'user_metadata') ->> 'role') = 'admin');

-- public.orders Table Policies
CREATE POLICY "Allow agents to select own orders" ON public.orders FOR SELECT USING (agent_id = auth.uid());
CREATE POLICY "Allow admins full access to orders" ON public.orders FOR ALL USING (((auth.jwt() -> 'user_metadata') ->> 'role') = 'admin');

-- public.wallets Table Policies
CREATE POLICY "Allow agents select own wallet" ON public.wallets FOR SELECT USING (agent_id = auth.uid());
CREATE POLICY "Allow agents insert own wallet" ON public.wallets FOR INSERT WITH CHECK (agent_id = auth.uid());
CREATE POLICY "Allow agents update own wallet" ON public.wallets FOR UPDATE USING (agent_id = auth.uid()) WITH CHECK (agent_id = auth.uid());
CREATE POLICY "Allow admins full access to wallets" ON public.wallets FOR ALL USING (((auth.jwt() -> 'user_metadata') ->> 'role') = 'admin');

-- public.wallet_transactions Table Policies
CREATE POLICY "Allow agents select own transactions" ON public.wallet_transactions FOR SELECT USING (agent_id = auth.uid());
CREATE POLICY "Allow agents insert own transactions" ON public.wallet_transactions FOR INSERT WITH CHECK (agent_id = auth.uid() AND type = 'debit');
CREATE POLICY "Allow admins full access to transactions" ON public.wallet_transactions FOR ALL USING (((auth.jwt() -> 'user_metadata') ->> 'role') = 'admin');

-- public.withdrawals Table Policies
CREATE POLICY "Allow agents select own withdrawals" ON public.withdrawals FOR SELECT USING (agent_id = auth.uid());
CREATE POLICY "Allow agents insert own withdrawals" ON public.withdrawals FOR INSERT WITH CHECK (agent_id = auth.uid() AND status = 'pending');
CREATE POLICY "Allow admins full access to withdrawals" ON public.withdrawals FOR ALL USING (((auth.jwt() -> 'user_metadata') ->> 'role') = 'admin');

-- public.platform_config Table Policies
CREATE POLICY "Allow public select platform config" ON public.platform_config FOR SELECT USING (true);
CREATE POLICY "Allow admins full access to platform config" ON public.platform_config FOR ALL USING (((auth.jwt() -> 'user_metadata') ->> 'role') = 'admin');

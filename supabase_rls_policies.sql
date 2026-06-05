-- Row Level Security (RLS) Policies for Patrick's Info Tech Platform

-- 1. Enable RLS on all tables
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bundles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.agent_bundles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.wallets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.wallet_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.withdrawals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.platform_config ENABLE ROW LEVEL SECURITY;

-- ==========================================
-- 2. RLS Policies for public.users table
-- ==========================================

-- Allow anyone to select active reseller stores
CREATE POLICY "Allow public select active users" ON public.users 
  FOR SELECT USING (status = 'active');

-- Allow newly registered users to insert their own profile
CREATE POLICY "Allow users insert own profile" ON public.users 
  FOR INSERT WITH CHECK (auth.uid() = id);

-- Allow authenticated users to view their own profile
CREATE POLICY "Allow users select own profile" ON public.users 
  FOR SELECT USING (auth.uid() = id);

-- Allow authenticated users to update their own profile
CREATE POLICY "Allow users update own profile" ON public.users 
  FOR UPDATE USING (auth.uid() = id) WITH CHECK (auth.uid() = id);

-- Allow platform administrators full access to all users
CREATE POLICY "Allow admins full access to users" ON public.users 
  FOR ALL USING (((auth.jwt() -> 'user_metadata') ->> 'role') = 'admin');


-- ==========================================
-- 3. RLS Policies for public.bundles table
-- ==========================================

-- Allow anyone to view active data bundles
CREATE POLICY "Allow public select active bundles" ON public.bundles 
  FOR SELECT USING (is_active = true);

-- Allow platform administrators full access to bundles
CREATE POLICY "Allow admins full access to bundles" ON public.bundles 
  FOR ALL USING (((auth.jwt() -> 'user_metadata') ->> 'role') = 'admin');


-- ==========================================
-- 4. RLS Policies for public.agent_bundles table
-- ==========================================

-- Allow anyone to view agent configured bundle prices
CREATE POLICY "Allow public select agent bundles" ON public.agent_bundles 
  FOR SELECT USING (true);

-- Allow agents to manage their own bundle prices
CREATE POLICY "Allow agents to manage own bundles" ON public.agent_bundles 
  FOR ALL USING (agent_id = auth.uid());

-- Allow platform administrators full access to agent bundles
CREATE POLICY "Allow admins full access to agent bundles" ON public.agent_bundles 
  FOR ALL USING (((auth.jwt() -> 'user_metadata') ->> 'role') = 'admin');


-- ==========================================
-- 5. RLS Policies for public.orders table
-- ==========================================

-- Allow agents to view their own storefront orders
CREATE POLICY "Allow agents to select own orders" ON public.orders 
  FOR SELECT USING (agent_id = auth.uid());

-- Allow platform administrators full access to all orders
CREATE POLICY "Allow admins full access to orders" ON public.orders 
  FOR ALL USING (((auth.jwt() -> 'user_metadata') ->> 'role') = 'admin');


-- ==========================================
-- 6. RLS Policies for public.wallets table
-- ==========================================

-- Allow agents to view their own wallet
CREATE POLICY "Allow agents select own wallet" ON public.wallets 
  FOR SELECT USING (agent_id = auth.uid());

-- Allow agents to initialize/insert their wallet upon signup
CREATE POLICY "Allow agents insert own wallet" ON public.wallets 
  FOR INSERT WITH CHECK (agent_id = auth.uid());

-- Allow agents to update their own wallet balance (needed for client-side withdrawal requests)
CREATE POLICY "Allow agents update own wallet" ON public.wallets 
  FOR UPDATE USING (agent_id = auth.uid()) WITH CHECK (agent_id = auth.uid());

-- Allow platform administrators full access to all wallets
CREATE POLICY "Allow admins full access to wallets" ON public.wallets 
  FOR ALL USING (((auth.jwt() -> 'user_metadata') ->> 'role') = 'admin');


-- ==========================================
-- 7. RLS Policies for public.wallet_transactions table
-- ==========================================

-- Allow agents to view their own wallet transactions
CREATE POLICY "Allow agents select own transactions" ON public.wallet_transactions 
  FOR SELECT USING (agent_id = auth.uid());

-- Allow agents to record their own debit transactions (payout request)
CREATE POLICY "Allow agents insert own transactions" ON public.wallet_transactions 
  FOR INSERT WITH CHECK (agent_id = auth.uid() AND type = 'debit');

-- Allow platform administrators full access to all transactions
CREATE POLICY "Allow admins full access to transactions" ON public.wallet_transactions 
  FOR ALL USING (((auth.jwt() -> 'user_metadata') ->> 'role') = 'admin');


-- ==========================================
-- 8. RLS Policies for public.withdrawals table
-- ==========================================

-- Allow agents to view their own withdrawal history
CREATE POLICY "Allow agents select own withdrawals" ON public.withdrawals 
  FOR SELECT USING (agent_id = auth.uid());

-- Allow agents to submit new withdrawal requests
CREATE POLICY "Allow agents insert own withdrawals" ON public.withdrawals 
  FOR INSERT WITH CHECK (agent_id = auth.uid() AND status = 'pending');

-- Allow platform administrators full access to process/update withdrawals
CREATE POLICY "Allow admins full access to withdrawals" ON public.withdrawals 
  FOR ALL USING (((auth.jwt() -> 'user_metadata') ->> 'role') = 'admin');


-- ==========================================
-- 9. RLS Policies for public.platform_config table
-- ==========================================

-- Allow anyone to view transaction fees and commission configurations
CREATE POLICY "Allow public select platform config" ON public.platform_config 
  FOR SELECT USING (true);

-- Allow platform administrators full access to configure settings
CREATE POLICY "Allow admins full access to platform config" ON public.platform_config 
  FOR ALL USING (((auth.jwt() -> 'user_metadata') ->> 'role') = 'admin');

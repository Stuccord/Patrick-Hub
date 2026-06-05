-- ============================================================
-- Row Level Security (RLS) Policies for Patrick's Info Tech
-- VERSION 2 — uses is_admin() helper to check admin role
--             from public.users instead of JWT metadata.
--
-- Run this ENTIRE script in the Supabase SQL Editor.
-- ============================================================


-- ============================================================
-- STEP 1: Enable RLS on all tables
-- ============================================================

ALTER TABLE public.users              ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bundles            ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.agent_bundles      ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders             ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.wallets            ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.wallet_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.withdrawals        ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.platform_config    ENABLE ROW LEVEL SECURITY;


-- ============================================================
-- STEP 2: Create the is_admin() helper function
-- SECURITY DEFINER allows it to bypass RLS on public.users,
-- preventing infinite recursion when checking admin access.
-- ============================================================

CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
STABLE
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.users
    WHERE id = auth.uid()
      AND role = 'admin'
  );
$$;

GRANT EXECUTE ON FUNCTION public.is_admin() TO authenticated;
GRANT EXECUTE ON FUNCTION public.is_admin() TO anon;


-- ============================================================
-- STEP 3: Drop all existing policies (safe to re-run)
-- ============================================================

-- public.users
DROP POLICY IF EXISTS "Allow public select active users"          ON public.users;
DROP POLICY IF EXISTS "Allow users insert own profile"            ON public.users;
DROP POLICY IF EXISTS "Allow users select own profile"            ON public.users;
DROP POLICY IF EXISTS "Allow users update own profile"            ON public.users;
DROP POLICY IF EXISTS "Allow admins full access to users"         ON public.users;

-- public.bundles
DROP POLICY IF EXISTS "Allow public select active bundles"        ON public.bundles;
DROP POLICY IF EXISTS "Allow admins full access to bundles"       ON public.bundles;

-- public.agent_bundles
DROP POLICY IF EXISTS "Allow public select agent bundles"         ON public.agent_bundles;
DROP POLICY IF EXISTS "Allow agents to manage own bundles"        ON public.agent_bundles;
DROP POLICY IF EXISTS "Allow admins full access to agent bundles" ON public.agent_bundles;

-- public.orders
DROP POLICY IF EXISTS "Allow agents to select own orders"         ON public.orders;
DROP POLICY IF EXISTS "Allow admins full access to orders"        ON public.orders;

-- public.wallets
DROP POLICY IF EXISTS "Allow agents select own wallet"            ON public.wallets;
DROP POLICY IF EXISTS "Allow agents insert own wallet"            ON public.wallets;
DROP POLICY IF EXISTS "Allow agents update own wallet"            ON public.wallets;
DROP POLICY IF EXISTS "Allow admins full access to wallets"       ON public.wallets;

-- public.wallet_transactions
DROP POLICY IF EXISTS "Allow agents select own transactions"      ON public.wallet_transactions;
DROP POLICY IF EXISTS "Allow agents insert own transactions"      ON public.wallet_transactions;
DROP POLICY IF EXISTS "Allow admins full access to transactions"  ON public.wallet_transactions;

-- public.withdrawals
DROP POLICY IF EXISTS "Allow agents select own withdrawals"       ON public.withdrawals;
DROP POLICY IF EXISTS "Allow agents insert own withdrawals"       ON public.withdrawals;
DROP POLICY IF EXISTS "Allow admins full access to withdrawals"   ON public.withdrawals;

-- public.platform_config
DROP POLICY IF EXISTS "Allow public select platform config"       ON public.platform_config;
DROP POLICY IF EXISTS "Allow admins full access to platform config" ON public.platform_config;


-- ============================================================
-- STEP 4: Create all policies
-- ============================================================

-- -------------------------------------------------------
-- public.users
-- -------------------------------------------------------

-- Public storefront: anyone can look up active agent stores
CREATE POLICY "Allow public select active users" ON public.users
  FOR SELECT USING (status = 'active');

-- Registration: a newly created auth user can insert their own profile row
CREATE POLICY "Allow users insert own profile" ON public.users
  FOR INSERT WITH CHECK (auth.uid() = id);

-- Profile: authenticated users can read their own row (even if pending)
CREATE POLICY "Allow users select own profile" ON public.users
  FOR SELECT USING (auth.uid() = id);

-- Profile: authenticated users can update their own row
CREATE POLICY "Allow users update own profile" ON public.users
  FOR UPDATE USING (auth.uid() = id) WITH CHECK (auth.uid() = id);

-- Admin: full access to all user rows
CREATE POLICY "Allow admins full access to users" ON public.users
  FOR ALL USING (public.is_admin()) WITH CHECK (public.is_admin());


-- -------------------------------------------------------
-- public.bundles
-- -------------------------------------------------------

-- Public storefront: anyone can browse active data bundles
CREATE POLICY "Allow public select active bundles" ON public.bundles
  FOR SELECT USING (is_active = true);

-- Admin: full access to create/edit/delete bundles
CREATE POLICY "Allow admins full access to bundles" ON public.bundles
  FOR ALL USING (public.is_admin()) WITH CHECK (public.is_admin());


-- -------------------------------------------------------
-- public.agent_bundles
-- -------------------------------------------------------

-- Public storefront: anyone can view agent bundle price configs
CREATE POLICY "Allow public select agent bundles" ON public.agent_bundles
  FOR SELECT USING (true);

-- Agent: can manage their own bundle pricing
CREATE POLICY "Allow agents to manage own bundles" ON public.agent_bundles
  FOR ALL USING (agent_id = auth.uid()) WITH CHECK (agent_id = auth.uid());

-- Admin: full access to all agent bundle configs
CREATE POLICY "Allow admins full access to agent bundles" ON public.agent_bundles
  FOR ALL USING (public.is_admin()) WITH CHECK (public.is_admin());


-- -------------------------------------------------------
-- public.orders
-- -------------------------------------------------------

-- Agent: can view their own store orders
CREATE POLICY "Allow agents to select own orders" ON public.orders
  FOR SELECT USING (agent_id = auth.uid());

-- Admin: full access to all orders (view, update status, etc.)
CREATE POLICY "Allow admins full access to orders" ON public.orders
  FOR ALL USING (public.is_admin()) WITH CHECK (public.is_admin());


-- -------------------------------------------------------
-- public.wallets
-- -------------------------------------------------------

-- Agent: can view their own wallet balance
CREATE POLICY "Allow agents select own wallet" ON public.wallets
  FOR SELECT USING (agent_id = auth.uid());

-- Agent: can create their own wallet row on registration
CREATE POLICY "Allow agents insert own wallet" ON public.wallets
  FOR INSERT WITH CHECK (agent_id = auth.uid());

-- Agent: can update their own balance (needed for withdrawal flow)
CREATE POLICY "Allow agents update own wallet" ON public.wallets
  FOR UPDATE USING (agent_id = auth.uid()) WITH CHECK (agent_id = auth.uid());

-- Admin: full access to all wallets (view balances, adjust manually)
CREATE POLICY "Allow admins full access to wallets" ON public.wallets
  FOR ALL USING (public.is_admin()) WITH CHECK (public.is_admin());


-- -------------------------------------------------------
-- public.wallet_transactions
-- -------------------------------------------------------

-- Agent: can view their own transaction history
CREATE POLICY "Allow agents select own transactions" ON public.wallet_transactions
  FOR SELECT USING (agent_id = auth.uid());

-- Agent: can insert debit records when requesting a withdrawal
CREATE POLICY "Allow agents insert own transactions" ON public.wallet_transactions
  FOR INSERT WITH CHECK (agent_id = auth.uid() AND type = 'debit');

-- Admin: full access (view history, insert credit refunds, etc.)
CREATE POLICY "Allow admins full access to transactions" ON public.wallet_transactions
  FOR ALL USING (public.is_admin()) WITH CHECK (public.is_admin());


-- -------------------------------------------------------
-- public.withdrawals
-- -------------------------------------------------------

-- Agent: can view their own withdrawal history
CREATE POLICY "Allow agents select own withdrawals" ON public.withdrawals
  FOR SELECT USING (agent_id = auth.uid());

-- Agent: can submit a new pending withdrawal request
CREATE POLICY "Allow agents insert own withdrawals" ON public.withdrawals
  FOR INSERT WITH CHECK (agent_id = auth.uid() AND status = 'pending');

-- Admin: full access to approve/reject/process withdrawals
CREATE POLICY "Allow admins full access to withdrawals" ON public.withdrawals
  FOR ALL USING (public.is_admin()) WITH CHECK (public.is_admin());


-- -------------------------------------------------------
-- public.platform_config
-- -------------------------------------------------------

-- Public: anyone can read fee/commission configuration
CREATE POLICY "Allow public select platform config" ON public.platform_config
  FOR SELECT USING (true);

-- Admin: full access to update settings
CREATE POLICY "Allow admins full access to platform config" ON public.platform_config
  FOR ALL USING (public.is_admin()) WITH CHECK (public.is_admin());


-- ============================================================
-- STEP 5: Create wallets for approved agents who have none
-- Fixes "withdraw button greyed out" for existing agents
-- ============================================================

INSERT INTO public.wallets (agent_id, balance)
SELECT id, 0
FROM public.users
WHERE role = 'agent'
  AND status = 'active'
  AND id NOT IN (SELECT agent_id FROM public.wallets)
ON CONFLICT DO NOTHING;

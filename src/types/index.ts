export type UserRole = 'super_admin' | 'sub_agent';
export type ProfileStatus = 'pending' | 'approved' | 'rejected';
export type TransactionStatus = 'pending' | 'success' | 'failed';
export type WithdrawalStatus = 'pending' | 'completed' | 'rejected';

export interface Profile {
  id: string;
  email: string;
  full_name: string;
  role: UserRole;
  store_slug?: string;
  store_name?: string;
  wallet_balance: number;
  status: ProfileStatus;
  created_at: string;
}

export interface Bundle {
  id: string;
  name: string;
  data_amount: string;
  base_cost: number;
  min_resell_price: number;
  is_active: boolean;
  created_at: string;
}

export interface SubAgentBundle {
  id: string;
  agent_id: string;
  bundle_id: string;
  custom_price: number;
}

export interface Transaction {
  id: string;
  agent_id: string;
  bundle_id: string;
  customer_phone: string;
  amount_paid: number;
  platform_fee: number;
  agent_margin: number;
  status: TransactionStatus;
  reference: string;
  created_at: string;
}

export interface Withdrawal {
  id: string;
  agent_id: string;
  amount: number;
  commission: number;
  net_payout: number;
  status: WithdrawalStatus;
  created_at: string;
}

export interface GlobalSettings {
  platform_fee: number;
  withdrawal_commission: number;
}

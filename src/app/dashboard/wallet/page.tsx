"use client";

import React from "react";

import { formatCurrency } from "@/lib/pricing";
import { Wallet, ArrowDownRight, ArrowUpRight, ArrowRight, ShieldAlert, Clock, CheckCircle2, XCircle, History, SendHorizonal } from "lucide-react";
import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase";
import { format } from "date-fns";

interface WalletTransaction {
  id: string;
  type: 'credit' | 'debit';
  amount: number | string;
  description: string;
  created_at: string;
}

interface WithdrawalRequest {
  id: string;
  status: 'pending' | 'approved' | 'rejected';
  amount_requested: number | string;
  network: string;
  momo_number: string;
  created_at: string;
  payout_amount: number | string;
}

interface ReferenceBundle {
  id: string;
  name: string;
  network: string;
  size_gb: number;
  base_price: number;
}

export default function AgentWallet() {
  const [walletBalance, setWalletBalance] = useState(0);
  const [commissionRate, setCommissionRate] = useState(5);
  const [txnHistory, setTxnHistory] = useState<WalletTransaction[]>([]);
  const [withdrawalRequests, setWithdrawalRequests] = useState<WithdrawalRequest[]>([]);
  const [bundles, setBundles] = useState<ReferenceBundle[]>([]);
  const [amount, setAmount] = useState("");
  const [network, setNetwork] = useState("MTN");
  const [phone, setPhone] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(true);
  const [historyTab, setHistoryTab] = useState<'transactions' | 'withdrawals'>('transactions');

  // Topup State
  const [topupAmount, setTopupAmount] = useState("");
  const [isTopupSubmitting, setIsTopupSubmitting] = useState(false);
  const [topupSuccess, setTopupSuccess] = useState(false);
  const [recipientPhone, setRecipientPhone] = useState("");
  const [recipientNetwork, setRecipientNetwork] = useState("MTN");
  const [selectedBundleId, setSelectedBundleId] = useState("");
  const [platformFee, setPlatformFee] = useState(0.20);

  const fetchWalletData = async () => {
    try {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Fetch config
      const [commissionConfig, feeConfig] = await Promise.all([
        supabase
          .from('platform_config')
          .select('value')
          .eq('key', 'withdrawal_commission')
          .single(),
        supabase
          .from('platform_config')
          .select('value')
          .eq('key', 'transaction_fee')
          .maybeSingle()
      ]);
      
      if (commissionConfig.data) {
        setCommissionRate(Number(commissionConfig.data.value) || 5);
      }
      if (feeConfig.data) {
        setPlatformFee(Number(feeConfig.data.value) || 0.20);
      }

      // Fetch wallet balance
      const { data: walletData } = await supabase
        .from('wallets')
        .select('balance')
        .eq('agent_id', user.id)
        .single();
        
      if (walletData) {
        setWalletBalance(Number(walletData.balance));
      }

      // Fetch transaction history
      const { data: txns } = await supabase
        .from('wallet_transactions')
        .select('*')
        .eq('agent_id', user.id)
        .order('created_at', { ascending: false });
        
      if (txns) {
        setTxnHistory(txns as unknown as WalletTransaction[]);
      }

      // Fetch withdrawal requests
      const { data: withdrawals } = await supabase
        .from('withdrawals')
        .select('*')
        .eq('agent_id', user.id)
        .order('created_at', { ascending: false });

      if (withdrawals) {
        setWithdrawalRequests(withdrawals as unknown as WithdrawalRequest[]);
      }

      // Fetch active bundles for price reference
      const { data: activeBundles } = await supabase
        .from('bundles')
        .select('id, name, network, size_gb, base_price')
        .eq('is_active', true)
        .order('network', { ascending: true })
        .order('size_gb', { ascending: true });

      if (activeBundles) {
        setBundles(activeBundles.map(b => ({
          id: b.id,
          name: b.name,
          network: b.network,
          size_gb: Number(b.size_gb),
          base_price: Number(b.base_price)
        })));
      }
    } catch (err) {
      console.error("Error fetching wallet data:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchWalletData();
  }, []);

  const reqAmount = parseFloat(amount) || 0;
  const commission = reqAmount * (commissionRate / 100);
  const payout = reqAmount - commission;

  const handleWithdraw = async (e: React.FormEvent) => {
    e.preventDefault();
    if (reqAmount > walletBalance || reqAmount <= 0) return;
    
    setIsSubmitting(true);
    try {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      // 1. Insert pending withdrawal
      const { error: withdrawalError } = await supabase
        .from('withdrawals')
        .insert({
          agent_id: user.id,
          amount_requested: reqAmount,
          commission_pct: commissionRate,
          payout_amount: payout,
          momo_number: phone,
          network: network,
          status: 'pending'
        });
      
      if (withdrawalError) throw withdrawalError;

      // 2. Insert wallet transaction (debit)
      const { error: txnError } = await supabase
        .from('wallet_transactions')
        .insert({
          agent_id: user.id,
          type: 'debit',
          amount: reqAmount,
          description: `Withdrawal request to ${phone}`
        });

      if (txnError) throw txnError;

      // 3. Update wallet balance
      const newBalance = walletBalance - reqAmount;
      const { error: walletError } = await supabase
        .from('wallets')
        .update({ balance: newBalance })
        .eq('agent_id', user.id);
        
      if (walletError) throw walletError;

      setWalletBalance(newBalance);
      setSuccess(true);
      setAmount("");
      setPhone("");
      setHistoryTab('withdrawals'); // Switch to withdrawals tab after submission
      fetchWalletData();
      
      setTimeout(() => setSuccess(false), 5000);
    } catch (err) {
      console.error("Error requesting withdrawal:", err);
      alert("Failed to request withdrawal.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleTopup = async (e: React.FormEvent) => {
    e.preventDefault();
    const amountVal = parseFloat(topupAmount);
    if (isNaN(amountVal) || amountVal <= 0) return;

    setIsTopupSubmitting(true);
    try {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const isBundlePurchase = recipientPhone.trim().length >= 10 && selectedBundleId;
      const chargeAmount = isBundlePurchase ? amountVal + platformFee : amountVal;
      const amountInPesewas = Math.round(chargeAmount * 100);
      const email = user.email || `${user.id}@patricks-info-tech.com`;

      const metadata = isBundlePurchase ? {
        custom_fields: [
          { display_name: "Customer Phone", variable_name: "customer_phone", value: recipientPhone },
          { display_name: "Network", variable_name: "network", value: recipientNetwork }
        ],
        agent_id: user.id,
        bundle_id: selectedBundleId,
        customer_phone: recipientPhone,
        customer_network: recipientNetwork,
        customer_paid: chargeAmount.toString(),
        platform_fee: platformFee.toString(),
        is_agent_purchase: "true"
      } : {
        type: "agent_topup",
        agent_id: user.id,
        amount: amountVal.toString()
      };

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const PaystackPop = (await import('@paystack/inline-js')).default as any;
      const paystack = new PaystackPop();
      paystack.newTransaction({
        key: process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY || '',
        email: email,
        amount: amountInPesewas,
        currency: "GHS",
        metadata: metadata,
        onSuccess: () => {
          if (isBundlePurchase) {
            alert("Bundle purchase request submitted successfully!");
          } else {
            setTopupSuccess(true);
            setTimeout(() => setTopupSuccess(false), 5000);
          }
          setTopupAmount("");
          setSelectedBundleId("");
          setRecipientPhone("");
          setIsTopupSubmitting(false);
          fetchWalletData();
        },
        onCancel: () => {
          setIsTopupSubmitting(false);
        }
      });
    } catch (err) {
      console.error("Error initiating Paystack payment:", err);
      alert("Failed to open payment gateway. Please try again.");
      setIsTopupSubmitting(false);
    }
  };

  const pendingCount = withdrawalRequests.filter(w => w.status === 'pending').length;

  return (
    <div className="p-4 sm:p-8 max-w-6xl mx-auto space-y-6 pb-24 lg:pb-8">
      <div>
        <h1 className="text-xl sm:text-2xl font-black text-slate-900">Wallet & Withdrawals</h1>
        <p className="text-sm text-slate-500 mt-1">Manage your earnings and track your payouts.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Withdrawal Form */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-3xl p-6 sm:p-8 text-white shadow-xl shadow-slate-900/20">
            <div className="flex items-center gap-3 mb-4 opacity-80">
              <Wallet className="w-5 h-5" />
              <span className="font-bold text-sm">Available Balance</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-black">{loading ? "..." : formatCurrency(walletBalance)}</h2>
            {pendingCount > 0 && (
              <p className="text-amber-400 text-xs font-bold mt-3 flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5" />
                {pendingCount} withdrawal{pendingCount > 1 ? 's' : ''} awaiting approval
              </p>
            )}
          </div>

          {/* Buy Credit Form */}
          <div className="bg-white border border-slate-200 rounded-3xl p-5 sm:p-6 shadow-sm">
            <h3 className="font-bold text-slate-900 mb-6 text-base sm:text-lg">Buy Credit (Top Up)</h3>
            
            {topupSuccess && (
              <div className="bg-green-50 text-green-700 p-4 rounded-xl text-xs sm:text-sm font-bold border border-green-200 mb-6 flex items-start gap-2">
                <CheckCircle2 className="w-5 h-5 shrink-0" />
                Wallet topped up successfully! Your new balance is reflected above.
              </div>
            )}

            <form onSubmit={handleTopup} className="space-y-4">
              <div className="space-y-2">
                <label className="text-xs sm:text-sm font-bold text-slate-700">Amount to Buy (GHS)</label>
                <input 
                  type="number" 
                  required
                  min="1"
                  step="0.01"
                  value={topupAmount}
                  onChange={(e) => {
                    setTopupAmount(e.target.value);
                    setSelectedBundleId("");
                  }}
                  placeholder="e.g. 50.00"
                  className="w-full px-4 h-12 border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-primary outline-none font-bold text-slate-900 bg-white"
                />
              </div>

              {bundles.length > 0 && (
                <div className="space-y-2 pt-1">
                  <label className="text-xs font-bold text-slate-500 block">Or select a bundle cost to auto-fill:</label>
                  <div className="grid grid-cols-2 gap-2 max-h-48 overflow-y-auto pr-1">
                    {bundles.map((bundle) => (
                      <button
                        key={bundle.id}
                        type="button"
                        onClick={() => {
                          setTopupAmount(bundle.base_price.toString());
                          setSelectedBundleId(bundle.id);
                          setRecipientNetwork(bundle.network);
                        }}
                        className={`p-2 border text-left rounded-xl hover:border-brand-primary hover:bg-brand-light/10 transition-all cursor-pointer group flex flex-col justify-between ${
                          selectedBundleId === bundle.id
                            ? "border-brand-primary bg-brand-light/20 ring-2 ring-brand-primary/25"
                            : "border-slate-200 bg-white"
                        }`}
                      >
                        <div className="flex justify-between items-start w-full">
                          <span className={`px-1.5 py-0.5 rounded text-[8px] font-extrabold ${
                            bundle.network === 'MTN' ? 'bg-amber-100 text-amber-700' :
                            bundle.network === 'Vodafone' || bundle.network === 'Telecel' ? 'bg-rose-100 text-rose-700' :
                            'bg-blue-100 text-blue-700'
                          }`}>
                            {bundle.network}
                          </span>
                          <span className="text-[10px] font-bold text-slate-500">
                            {bundle.size_gb} GB
                          </span>
                        </div>
                        <div className="mt-1 flex justify-between items-baseline w-full">
                          <span className="text-[9px] text-slate-400 font-medium truncate group-hover:text-slate-600 max-w-[50px]">
                            {bundle.name}
                          </span>
                          <span className="text-[11px] font-extrabold text-slate-900 shrink-0">
                            {formatCurrency(bundle.base_price)}
                          </span>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Optional recipient details for direct bundle purchase */}
              {selectedBundleId && (
                <div className="space-y-4 border-t border-slate-100 pt-4 animate-in fade-in duration-200">
                  <div className="space-y-2">
                    <label className="text-xs sm:text-sm font-bold text-slate-700 block">
                      Recipient Phone (Optional)
                    </label>
                    <input
                      type="tel"
                      value={recipientPhone}
                      onChange={(e) => setRecipientPhone(e.target.value)}
                      placeholder="e.g. 0241234567 (blank to Top Up)"
                      className="w-full px-4 h-12 border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-primary outline-none font-medium text-slate-900 bg-white"
                    />
                  </div>

                  {recipientPhone.trim().length > 0 && (
                    <div className="space-y-2 animate-in slide-in-from-top-2 duration-200">
                      <label className="text-xs sm:text-sm font-bold text-slate-700 block">
                        Recipient Network
                      </label>
                      <select
                        value={recipientNetwork}
                        onChange={(e) => setRecipientNetwork(e.target.value)}
                        className="w-full px-4 h-12 border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-primary outline-none bg-white font-medium text-slate-700"
                      >
                        <option value="MTN">MTN</option>
                        <option value="Vodafone">Vodafone / Telecel</option>
                        <option value="AirtelTigo">AirtelTigo</option>
                      </select>
                    </div>
                  )}

                  {recipientPhone.trim().length >= 10 && (
                    <div className="bg-emerald-50 text-emerald-800 p-3 rounded-xl border border-emerald-100 text-xs font-semibold space-y-1">
                      <div className="flex justify-between">
                        <span>Wholesale Price:</span>
                        <span>{formatCurrency(parseFloat(topupAmount) || 0)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Platform Fee:</span>
                        <span>{formatCurrency(platformFee)}</span>
                      </div>
                      <div className="flex justify-between border-t border-emerald-200/60 pt-1.5 font-bold text-[13px]">
                        <span>Total MoMo Payment:</span>
                        <span>{formatCurrency((parseFloat(topupAmount) || 0) + platformFee)}</span>
                      </div>
                    </div>
                  )}
                </div>
              )}

              <button 
                type="submit"
                disabled={isTopupSubmitting || !topupAmount || parseFloat(topupAmount) <= 0}
                className="w-full bg-brand-primary text-white h-12 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-brand-dark transition-colors disabled:opacity-50 mt-6 btn-animate shadow-lg shadow-brand-primary/20 cursor-pointer"
              >
                {isTopupSubmitting ? "Opening Payment..." : (recipientPhone.trim().length >= 10 ? "Buy Bundle for User" : "Buy Credit")}
                {!isTopupSubmitting && <ArrowRight className="w-5 h-5" />}
              </button>
            </form>
          </div>

          <div className="bg-white border border-slate-200 rounded-3xl p-5 sm:p-6 shadow-sm">
            <h3 className="font-bold text-slate-900 mb-6 text-base sm:text-lg">Request Withdrawal</h3>
            
            {success && (
              <div className="bg-green-50 text-green-700 p-4 rounded-xl text-xs sm:text-sm font-bold border border-green-200 mb-6 flex items-start gap-2">
                <CheckCircle2 className="w-5 h-5 shrink-0" />
                Withdrawal requested! Check the <button onClick={() => setHistoryTab('withdrawals')} className="underline cursor-pointer">Requests tab</button> to track its status.
              </div>
            )}

            <form onSubmit={handleWithdraw} className="space-y-4">
              <div className="space-y-2">
                <label className="text-xs sm:text-sm font-bold text-slate-700">Amount to Withdraw (GHS)</label>
                <input 
                  type="number" 
                  required
                  min="1"
                  max={walletBalance}
                  step="0.01"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="e.g. 10.00"
                  className="w-full px-4 h-12 border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-primary outline-none font-bold text-slate-900 bg-white"
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs sm:text-sm font-bold text-slate-700">Mobile Money Network</label>
                <select 
                  value={network}
                  onChange={(e) => setNetwork(e.target.value)}
                  className="w-full px-4 h-12 border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-primary outline-none bg-white font-medium text-slate-700"
                >
                  <option value="MTN">MTN Mobile Money</option>
                  <option value="Vodafone">Vodafone Cash</option>
                  <option value="AirtelTigo">AT Money</option>
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-xs sm:text-sm font-bold text-slate-700">MoMo Number</label>
                <input 
                  type="tel" 
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="024 123 4567"
                  className="w-full px-4 h-12 border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-primary outline-none font-medium text-slate-900 bg-white"
                />
              </div>

              {reqAmount > 0 && reqAmount <= walletBalance && (
                <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-2 my-4 text-xs sm:text-sm">
                  <div className="flex justify-between">
                    <span className="text-slate-500">Requested:</span>
                    <span className="font-bold text-slate-900">{formatCurrency(reqAmount)}</span>
                  </div>
                  <div className="flex justify-between text-red-500">
                    <span>Commission ({commissionRate}%):</span>
                    <span className="font-bold">-{formatCurrency(commission)}</span>
                  </div>
                  <div className="border-t border-slate-200 pt-2 flex justify-between font-bold">
                    <span className="text-slate-900">You Receive:</span>
                    <span className="font-black text-brand-primary text-base sm:text-lg">{formatCurrency(payout)}</span>
                  </div>
                </div>
              )}

              {reqAmount > walletBalance && (
                <div className="flex items-center gap-2 text-red-500 text-xs sm:text-sm font-bold mt-2">
                  <ShieldAlert className="w-4 h-4 shrink-0" /> Insufficient balance
                </div>
              )}

              <button 
                type="submit"
                disabled={isSubmitting || reqAmount <= 0 || reqAmount > walletBalance || !phone}
                className="w-full bg-brand-primary text-white h-12 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-brand-dark transition-colors disabled:opacity-50 mt-6 btn-animate shadow-lg shadow-brand-primary/20"
              >
                {isSubmitting ? "Processing..." : "Submit Request"}
                {!isSubmitting && <ArrowRight className="w-5 h-5" />}
              </button>
            </form>
          </div>
        </div>

        {/* History Panel */}
        <div className="lg:col-span-2">
          <div className="bg-white border border-slate-200 rounded-3xl shadow-sm overflow-hidden flex flex-col">
            {/* Tab Header */}
            <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between gap-3">
              <div className="flex bg-slate-100 p-1 rounded-xl gap-1">
                <button
                  onClick={() => setHistoryTab('transactions')}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs sm:text-sm font-bold transition-all ${
                    historyTab === 'transactions'
                      ? 'bg-white text-slate-900 shadow-sm'
                      : 'text-slate-500 hover:text-slate-700'
                  }`}
                >
                  <History className="w-3.5 h-3.5" />
                  Wallet History
                </button>
                <button
                  onClick={() => setHistoryTab('withdrawals')}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs sm:text-sm font-bold transition-all relative ${
                    historyTab === 'withdrawals'
                      ? 'bg-white text-slate-900 shadow-sm'
                      : 'text-slate-500 hover:text-slate-700'
                  }`}
                >
                  <SendHorizonal className="w-3.5 h-3.5" />
                  Withdrawal Requests
                  {pendingCount > 0 && (
                    <span className="absolute -top-1 -right-1 w-4 h-4 bg-amber-500 text-white text-[9px] font-black rounded-full flex items-center justify-center leading-none">
                      {pendingCount}
                    </span>
                  )}
                </button>
              </div>
            </div>

            {/* Tab Content */}
            <div className="divide-y divide-slate-100 flex-1">
              {historyTab === 'transactions' ? (
                loading ? (
                  <div className="p-6 text-center text-slate-400 font-medium">Loading history...</div>
                ) : txnHistory.length === 0 ? (
                  <div className="p-10 text-center">
                    <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-3">
                      <Wallet className="w-5 h-5 text-slate-400" />
                    </div>
                    <p className="text-slate-400 font-medium text-sm">No transactions yet.</p>
                  </div>
                ) : (
                  txnHistory.map((txn) => (
                    <div key={txn.id} className="p-4 sm:p-5 flex items-center justify-between hover:bg-slate-50 transition-colors">
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${
                          txn.type === 'credit' ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'
                        }`}>
                          {txn.type === 'credit' ? <ArrowDownRight className="w-5 h-5" /> : <ArrowUpRight className="w-5 h-5" />}
                        </div>
                        <div>
                          <p className="font-bold text-slate-900 text-xs sm:text-sm leading-tight">{txn.description}</p>
                          <p className="text-[10px] text-slate-500 mt-1">{format(new Date(txn.created_at), "MMM d, yyyy HH:mm")}</p>
                        </div>
                      </div>
                      <div className={`font-black text-xs sm:text-sm shrink-0 ${txn.type === 'credit' ? 'text-green-600' : 'text-slate-900'}`}>
                        {txn.type === 'credit' ? '+' : '-'}{formatCurrency(Number(txn.amount))}
                      </div>
                    </div>
                  ))
                )
              ) : (
                /* Withdrawal Requests Tab */
                loading ? (
                  <div className="p-6 text-center text-slate-400 font-medium">Loading requests...</div>
                ) : withdrawalRequests.length === 0 ? (
                  <div className="p-10 text-center">
                    <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-3">
                      <SendHorizonal className="w-5 h-5 text-slate-400" />
                    </div>
                    <p className="text-slate-400 font-medium text-sm">No withdrawal requests yet.</p>
                    <p className="text-slate-400 text-xs mt-1">Use the form to request a payout.</p>
                  </div>
                ) : (
                  withdrawalRequests.map((w) => {
                    const statusMap: Record<string, { label: string; icon: React.ElementType; color: string; bg: string; border: string }> = {
                      pending: { label: 'Pending Approval', icon: Clock, color: 'text-amber-700', bg: 'bg-amber-50', border: 'border-amber-200' },
                      approved: { label: 'Paid / Approved', icon: CheckCircle2, color: 'text-green-700', bg: 'bg-green-50', border: 'border-green-200' },
                      rejected: { label: 'Rejected', icon: XCircle, color: 'text-red-700', bg: 'bg-red-50', border: 'border-red-200' },
                    };
                    const statusConfig = statusMap[w.status] || { label: w.status, icon: Clock, color: 'text-slate-600', bg: 'bg-slate-50', border: 'border-slate-200' };

                    const StatusIcon = statusConfig.icon;

                    return (
                      <div key={w.id} className="p-4 sm:p-5 hover:bg-slate-50 transition-colors">
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex items-start gap-3 min-w-0">
                            <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${statusConfig.bg}`}>
                              <StatusIcon className={`w-5 h-5 ${statusConfig.color}`} />
                            </div>
                            <div className="min-w-0">
                              <p className="font-bold text-slate-900 text-sm leading-tight">
                                {formatCurrency(Number(w.amount_requested))} → {w.network} {w.momo_number}
                              </p>
                              <p className="text-[10px] text-slate-500 mt-0.5">{format(new Date(w.created_at), "MMM d, yyyy 'at' HH:mm")}</p>
                              <div className="flex items-center gap-3 mt-2 text-xs text-slate-500">
                                <span>Requested: <span className="font-semibold text-slate-700">{formatCurrency(Number(w.amount_requested))}</span></span>
                                <span>·</span>
                                <span>You receive: <span className="font-semibold text-green-700">{formatCurrency(Number(w.payout_amount))}</span></span>
                              </div>
                            </div>
                          </div>
                          <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold border shrink-0 ${statusConfig.bg} ${statusConfig.color} ${statusConfig.border}`}>
                            <StatusIcon className="w-3 h-3" />
                            {statusConfig.label}
                          </span>
                        </div>
                        {w.status === 'pending' && (
                          <p className="text-[10px] text-amber-600 font-medium mt-2 pl-[52px]">
                            ⏳ Your money is being processed — admin will send to your MoMo soon.
                          </p>
                        )}
                        {w.status === 'approved' && (
                          <p className="text-[10px] text-green-600 font-medium mt-2 pl-[52px]">
                            ✅ Payment sent to {w.network} {w.momo_number}
                          </p>
                        )}
                        {w.status === 'rejected' && (
                          <p className="text-[10px] text-red-500 font-medium mt-2 pl-[52px]">
                            ❌ This request was rejected. Contact support for more info.
                          </p>
                        )}
                      </div>
                    );
                  })
                )
              )}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}

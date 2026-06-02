"use client";

import { formatCurrency } from "@/lib/pricing";
import { Wallet, ArrowDownRight, ArrowUpRight, ArrowRight, ShieldAlert } from "lucide-react";
import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase";
import { format } from "date-fns";

export default function AgentWallet() {
  const [walletBalance, setWalletBalance] = useState(0);
  const [commissionRate, setCommissionRate] = useState(5);
  const [txnHistory, setTxnHistory] = useState<any[]>([]);
  const [amount, setAmount] = useState("");
  const [network, setNetwork] = useState("MTN");
  const [phone, setPhone] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(true);

  const fetchWalletData = async () => {
    try {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Fetch config
      const { data: configData } = await supabase
        .from('platform_config')
        .select('value')
        .eq('key', 'withdrawal_commission')
        .single();
      
      if (configData) {
        setCommissionRate(Number(configData.value) || 5);
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
        setTxnHistory(txns);
      }
    } catch (err) {
      console.error("Error fetching wallet data:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
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

      // Note: Ideally, we would use an RPC for a transactional guarantee.
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
      fetchWalletData(); // Refresh history
      
      setTimeout(() => setSuccess(false), 5000);
    } catch (err) {
      console.error("Error requesting withdrawal:", err);
      alert("Failed to request withdrawal.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="p-4 sm:p-8 max-w-6xl mx-auto space-y-6 pb-24 lg:pb-8">
      <div>
        <h1 className="text-xl sm:text-2xl font-black text-slate-900">Wallet & Withdrawals</h1>
        <p className="text-sm text-slate-500 mt-1">Manage your earnings and request payouts.</p>
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
          </div>

          <div className="bg-white border border-slate-200 rounded-3xl p-5 sm:p-6 shadow-sm">
            <h3 className="font-bold text-slate-900 mb-6 text-base sm:text-lg">Request Withdrawal</h3>
            
            {success && (
              <div className="bg-green-50 text-green-700 p-4 rounded-xl text-xs sm:text-sm font-bold border border-green-200 mb-6 flex items-start gap-2">
                <ArrowRight className="w-5 h-5 shrink-0" />
                Withdrawal requested successfully! Awaiting admin approval.
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

        {/* Transaction History */}
        <div className="lg:col-span-2">
          <div className="bg-white border border-slate-200 rounded-3xl shadow-sm overflow-hidden flex flex-col">
            <div className="p-5 border-b border-slate-100">
              <h3 className="font-bold text-slate-900 text-base sm:text-lg">Wallet History</h3>
            </div>
            <div className="divide-y divide-slate-100 flex-1">
              {loading ? (
                <div className="p-6 text-center text-slate-400 font-medium">Loading history...</div>
              ) : txnHistory.length === 0 ? (
                <div className="p-6 text-center text-slate-400 font-medium">No transactions yet.</div>
              ) : (
                txnHistory.map((txn) => (
                  <div key={txn.id} className="p-4 sm:p-6 flex items-center justify-between hover:bg-slate-50 transition-colors">
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
              )}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}

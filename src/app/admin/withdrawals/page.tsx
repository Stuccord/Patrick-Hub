"use client";

import { useEffect, useState } from "react";
import { CheckCircle2, XCircle, Search, Filter } from "lucide-react";
import { formatCurrency } from "@/lib/pricing";
import { createClient } from "@/lib/supabase";
import { sendWithdrawalProcessedNotification } from "@/lib/emails";

export default function AdminWithdrawals() {
  const [withdrawals, setWithdrawals] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState("");

  const fetchWithdrawals = async () => {
    try {
      const supabase = createClient();
      const { data, error } = await supabase
        .from('withdrawals')
        .select('*, users(id, name, email)')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setWithdrawals(data || []);
    } catch (err) {
      console.error("Error fetching withdrawals:", err);
    }
  };

  useEffect(() => {
    fetchWithdrawals();
  }, []);

  const handleApprove = async (id: string, agentName: string, agentEmail: string, reqAmount: number, payout: number, commission: number) => {
    try {
      const supabase = createClient();
      const { error } = await supabase
        .from('withdrawals')
        .update({ status: 'approved' })
        .eq('id', id);

      if (error) throw error;

      await sendWithdrawalProcessedNotification(agentEmail, agentName, reqAmount, payout, commission);
      fetchWithdrawals();
    } catch (err) {
      console.error(err);
      alert("Error approving withdrawal");
    }
  };

  const handleReject = async (id: string, agentId: string, reqAmount: number) => {
    try {
      const supabase = createClient();
      
      // Update withdrawal status to 'rejected'
      const { error: updateError } = await supabase
        .from('withdrawals')
        .update({ status: 'rejected' })
        .eq('id', id);

      if (updateError) throw updateError;

      // Fetch the agent's wallet
      const { data: wallet, error: walletError } = await supabase
        .from('wallets')
        .select('balance')
        .eq('agent_id', agentId)
        .single();
      
      if (walletError) throw walletError;

      // Update agent wallet balance: add back the requested amount
      const newBalance = Number(wallet.balance) + Number(reqAmount);
      const { error: walletUpdateError } = await supabase
        .from('wallets')
        .update({ balance: newBalance })
        .eq('agent_id', agentId);

      if (walletUpdateError) throw walletUpdateError;

      // Insert credit record into wallet_transactions
      const { error: txError } = await supabase
        .from('wallet_transactions')
        .insert([{
          agent_id: agentId,
          type: 'credit',
          amount: reqAmount,
          description: `Refund: Rejected withdrawal request (${id.substring(0, 8)})`
        }]);

      if (txError) throw txError;

      fetchWithdrawals();
    } catch (err) {
      console.error(err);
      alert("Error rejecting withdrawal request");
    }
  };

  const filteredWithdrawals = withdrawals.filter(w => 
    (w.users?.name || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
    (w.momo_number || "").includes(searchQuery)
  );

  return (
    <div className="p-4 sm:p-6 max-w-[1200px] mx-auto space-y-6 pb-24 lg:pb-8">
      {/* Page header row */}
      <div className="flex items-center justify-between h-10 w-full gap-4 shrink-0">
        <div>
          <h1 className="text-[20px] font-semibold text-[#111827] tracking-tight leading-none shrink-0">Withdrawal Requests</h1>
          <p className="text-[12px] text-[#9CA3AF] mt-1.5 hidden sm:block">Review and process agent payout requests.</p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <div className="relative w-40 sm:w-64 h-9">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#9CA3AF]" />
            <input 
              type="text" 
              placeholder="Search by agent..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full h-full pl-9 pr-4 bg-white border border-[#E5E7EB] rounded-lg text-[13px] text-[#374151] placeholder-[#9CA3AF] focus:border-[#16A34A] focus:outline-none transition-colors"
            />
          </div>
          <button className="h-9 w-9 flex items-center justify-center bg-white border border-[#E5E7EB] rounded-lg text-[#6B7280] hover:bg-[#F9FAFB] active:scale-95 transition-all min-h-0 cursor-pointer shrink-0">
            <Filter className="h-4 w-4 text-[#6B7280]" />
          </button>
        </div>
      </div>

      {/* Card Table Container */}
      <div className="bg-white border border-[#E5E7EB] rounded-xl shadow-[0_1px_3px_rgba(0,0,0,0.05)] overflow-hidden">
        
        {/* Desktop View */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-[#F9FAFB] border-b border-[#E5E7EB] text-[#6B7280] uppercase tracking-wider text-[10px] font-semibold">
              <tr>
                <th className="px-5 py-3 font-semibold">Agent</th>
                <th className="px-5 py-3 font-semibold">Requested</th>
                <th className="px-5 py-3 font-semibold">Comm.</th>
                <th className="px-5 py-3 font-semibold">Payout Amount</th>
                <th className="px-5 py-3 font-semibold">MoMo Details</th>
                <th className="px-5 py-3 font-semibold">Status</th>
                <th className="px-5 py-3 text-right font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E5E7EB] text-[#374151]">
              {filteredWithdrawals.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-5 py-8 text-center text-[#9CA3AF] font-medium text-[13px]">
                    No withdrawal requests found.
                  </td>
                </tr>
              ) : (
                filteredWithdrawals.map((req) => {
                  const commission = Number(req.amount_requested) - Number(req.payout_amount);
                  const formattedDate = new Date(req.created_at).toLocaleString();
                  return (
                    <tr key={req.id} className="hover:bg-[#F9FAFB] transition-colors">
                      <td className="px-5 py-4">
                        <p className="font-semibold text-[#111827] text-[14px]">{req.users?.name || 'Unknown Agent'}</p>
                        <p className="text-[11px] text-[#9CA3AF] mt-0.5">{formattedDate}</p>
                      </td>
                      <td className="px-5 py-4 font-semibold text-[#374151] text-[13px]">{formatCurrency(Number(req.amount_requested))}</td>
                      <td className="px-5 py-4 text-[#EF4444] text-[12px] font-semibold">-{formatCurrency(commission)}</td>
                      <td className="px-5 py-4 font-semibold text-[#111827] text-[14px]">{formatCurrency(Number(req.payout_amount))}</td>
                      <td className="px-5 py-4 text-[#4B5563] font-medium text-[13px]">{req.momo_number} ({req.network})</td>
                      <td className="px-5 py-4">
                        {req.status === 'approved' && <span className="inline-flex items-center px-2.5 py-0.5 bg-[#F0FDF4] text-[#15803D] text-[11px] font-semibold rounded-full">Approved</span>}
                        {req.status === 'pending' && <span className="inline-flex items-center px-2.5 py-0.5 bg-[#FFFBEB] text-[#D97706] text-[11px] font-semibold rounded-full">Pending</span>}
                        {req.status === 'rejected' && <span className="inline-flex items-center px-2.5 py-0.5 bg-[#FEF2F2] text-[#EF4444] text-[11px] font-semibold rounded-full">Rejected</span>}
                      </td>
                      <td className="px-5 py-4">
                        <div className="flex items-center justify-end gap-2">
                          {req.status === 'pending' ? (
                            <>
                              <button 
                                onClick={() => handleApprove(req.id, req.users?.name || 'Agent Partner', req.users?.email || '', Number(req.amount_requested), Number(req.payout_amount), commission)}
                                className="h-7 px-2.5 bg-[#16A34A] text-white hover:bg-[#15803D] rounded-md text-[12px] font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer min-h-0 shadow-sm"
                              >
                                <CheckCircle2 className="w-3.5 h-3.5" /> Approve
                              </button>
                              <button 
                                onClick={() => handleReject(req.id, req.agent_id, Number(req.amount_requested))}
                                className="h-7 px-2.5 bg-white border border-[#D1D5DB] text-[#EF4444] hover:bg-[#FEF2F2] hover:border-[#EF4444] rounded-md text-[12px] font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer min-h-0"
                              >
                                <XCircle className="w-3.5 h-3.5" /> Reject
                              </button>
                            </>
                          ) : (
                            <span className="text-[12px] text-[#9CA3AF] font-medium mr-2">Processed</span>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Mobile View */}
        <div className="md:hidden divide-y divide-[#E5E7EB]">
          {filteredWithdrawals.length === 0 ? (
            <div className="p-5 text-center text-[#9CA3AF] text-[13px]">
              No withdrawal requests found.
            </div>
          ) : (
            filteredWithdrawals.map((req) => {
              const commission = Number(req.amount_requested) - Number(req.payout_amount);
              const formattedDate = new Date(req.created_at).toLocaleString();
              return (
                <div key={req.id} className="p-4 space-y-3.5 bg-white">
                  <div className="flex justify-between items-start gap-2">
                    <div className="min-w-0">
                      <h4 className="font-semibold text-[#111827] text-[14px] truncate">{req.users?.name || 'Unknown Agent'}</h4>
                      <p className="text-[11px] text-[#9CA3AF] mt-0.5">{formattedDate}</p>
                    </div>
                    {req.status === 'approved' && <span className="inline-flex items-center px-2 py-0.5 bg-[#F0FDF4] text-[#15803D] text-[11px] font-semibold rounded-full shrink-0">Approved</span>}
                    {req.status === 'pending' && <span className="inline-flex items-center px-2 py-0.5 bg-[#FFFBEB] text-[#D97706] text-[11px] font-semibold rounded-full shrink-0">Pending</span>}
                    {req.status === 'rejected' && <span className="inline-flex items-center px-2 py-0.5 bg-[#FEF2F2] text-[#EF4444] text-[11px] font-semibold rounded-full shrink-0">Rejected</span>}
                  </div>

                  <div className="bg-[#F9FAFB] border border-[#E5E7EB] p-3 rounded-lg text-[12px] space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-[#6B7280]">Requested Amount:</span>
                      <span className="font-semibold text-[#111827]">{formatCurrency(Number(req.amount_requested))}</span>
                    </div>
                    <div className="flex justify-between items-center text-[#EF4444]">
                      <span>Commission:</span>
                      <span className="font-semibold">-{formatCurrency(commission)}</span>
                    </div>
                    <div className="flex justify-between items-center text-[13px] pt-2 border-t border-[#E5E7EB]">
                      <span className="font-bold text-[#111827]">Net Payout:</span>
                      <span className="font-bold text-[#16A34A]">{formatCurrency(Number(req.payout_amount))}</span>
                    </div>
                  </div>

                  <div className="text-[12px] text-[#4B5563] font-medium bg-[#F9FAFB] border border-[#E5E7EB] p-2.5 rounded-lg flex items-center justify-between">
                    <span className="text-[#6B7280]">MoMo Details:</span>
                    <span className="font-semibold text-[#111827]">{req.momo_number} ({req.network})</span>
                  </div>

                  {req.status === 'pending' && (
                    <div className="flex items-center gap-2 pt-1">
                      <button 
                        onClick={() => handleApprove(req.id, req.users?.name || 'Agent Partner', req.users?.email || '', Number(req.amount_requested), Number(req.payout_amount), commission)}
                        className="flex-1 h-9 bg-[#16A34A] text-white rounded-lg font-semibold text-[13px] flex items-center justify-center gap-1.5 transition-colors cursor-pointer min-h-0"
                      >
                        <CheckCircle2 className="w-4.5 h-4.5" /> Approve
                      </button>
                      <button 
                        onClick={() => handleReject(req.id, req.agent_id, Number(req.amount_requested))}
                        className="flex-1 h-9 bg-white border border-[#D1D5DB] text-[#EF4444] hover:bg-[#FEF2F2] hover:border-[#EF4444] rounded-lg font-semibold text-[13px] flex items-center justify-center gap-1.5 transition-colors cursor-pointer min-h-0"
                      >
                        <XCircle className="w-4.5 h-4.5" /> Reject
                      </button>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>

      </div>
    </div>
  );
}

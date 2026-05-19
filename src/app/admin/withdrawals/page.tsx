"use client";

import { CheckCircle2, XCircle, Search, Filter } from "lucide-react";
import { formatCurrency } from "@/lib/pricing";

const WITHDRAWALS = [
  { id: "1", agent: "Emmanuel Mensah", reqAmount: 500.00, commPct: 5, payout: 475.00, date: "2026-05-19 10:30 AM", status: "pending", momo: "024 123 4567 (MTN)" },
  { id: "2", agent: "Serwaa Ampadu", reqAmount: 1200.00, commPct: 5, payout: 1140.00, date: "2026-05-18 14:15 PM", status: "approved", momo: "055 987 6543 (MTN)" },
  { id: "3", agent: "Kofi Tech Solutions", reqAmount: 100.00, commPct: 5, payout: 95.00, date: "2026-05-17 09:00 AM", status: "rejected", momo: "020 111 2222 (Vodafone)" },
];

export default function AdminWithdrawals() {
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
                <th className="px-5 py-3 font-semibold">Comm. (5%)</th>
                <th className="px-5 py-3 font-semibold">Payout Amount</th>
                <th className="px-5 py-3 font-semibold">MoMo Details</th>
                <th className="px-5 py-3 font-semibold">Status</th>
                <th className="px-5 py-3 text-right font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E5E7EB] text-[#374151]">
              {WITHDRAWALS.map((req) => (
                <tr key={req.id} className="hover:bg-[#F9FAFB] transition-colors">
                  <td className="px-5 py-4">
                    <p className="font-semibold text-[#111827] text-[14px]">{req.agent}</p>
                    <p className="text-[11px] text-[#9CA3AF] mt-0.5">{req.date}</p>
                  </td>
                  <td className="px-5 py-4 font-semibold text-[#374151] text-[13px]">{formatCurrency(req.reqAmount)}</td>
                  <td className="px-5 py-4 text-[#EF4444] text-[12px] font-semibold">-{formatCurrency(req.reqAmount - req.payout)}</td>
                  <td className="px-5 py-4 font-semibold text-[#111827] text-[14px]">{formatCurrency(req.payout)}</td>
                  <td className="px-5 py-4 text-[#4B5563] font-medium text-[13px]">{req.momo}</td>
                  <td className="px-5 py-4">
                    {req.status === 'approved' && <span className="inline-flex items-center px-2.5 py-0.5 bg-[#F0FDF4] text-[#15803D] text-[11px] font-semibold rounded-full">Approved</span>}
                    {req.status === 'pending' && <span className="inline-flex items-center px-2.5 py-0.5 bg-[#FFFBEB] text-[#D97706] text-[11px] font-semibold rounded-full">Pending</span>}
                    {req.status === 'rejected' && <span className="inline-flex items-center px-2.5 py-0.5 bg-[#FEF2F2] text-[#EF4444] text-[11px] font-semibold rounded-full">Rejected</span>}
                  </td>
                  <td className="px-5 py-4">
                    <div className="flex items-center justify-end gap-2">
                      {req.status === 'pending' ? (
                        <>
                          <button className="h-7 px-2.5 bg-[#16A34A] text-white hover:bg-[#15803D] rounded-md text-[12px] font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer min-h-0 shadow-sm">
                            <CheckCircle2 className="w-3.5 h-3.5" /> Approve
                          </button>
                          <button className="h-7 px-2.5 bg-white border border-[#D1D5DB] text-[#EF4444] hover:bg-[#FEF2F2] hover:border-[#EF4444] rounded-md text-[12px] font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer min-h-0">
                            <XCircle className="w-3.5 h-3.5" /> Reject
                          </button>
                        </>
                      ) : (
                        <span className="text-[12px] text-[#9CA3AF] font-medium mr-2">Processed</span>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Mobile View */}
        <div className="md:hidden divide-y divide-[#E5E7EB]">
          {WITHDRAWALS.map((req) => (
            <div key={req.id} className="p-4 space-y-3.5 bg-white">
              <div className="flex justify-between items-start gap-2">
                <div className="min-w-0">
                  <h4 className="font-semibold text-[#111827] text-[14px] truncate">{req.agent}</h4>
                  <p className="text-[11px] text-[#9CA3AF] mt-0.5">{req.date}</p>
                </div>
                {req.status === 'approved' && <span className="inline-flex items-center px-2 py-0.5 bg-[#F0FDF4] text-[#15803D] text-[11px] font-semibold rounded-full shrink-0">Approved</span>}
                {req.status === 'pending' && <span className="inline-flex items-center px-2 py-0.5 bg-[#FFFBEB] text-[#D97706] text-[11px] font-semibold rounded-full shrink-0">Pending</span>}
                {req.status === 'rejected' && <span className="inline-flex items-center px-2 py-0.5 bg-[#FEF2F2] text-[#EF4444] text-[11px] font-semibold rounded-full shrink-0">Rejected</span>}
              </div>

              <div className="bg-[#F9FAFB] border border-[#E5E7EB] p-3 rounded-lg text-[12px] space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-[#6B7280]">Requested Amount:</span>
                  <span className="font-semibold text-[#111827]">{formatCurrency(req.reqAmount)}</span>
                </div>
                <div className="flex justify-between items-center text-[#EF4444]">
                  <span>Commission (5%):</span>
                  <span className="font-semibold">-{formatCurrency(req.reqAmount - req.payout)}</span>
                </div>
                <div className="flex justify-between items-center text-[13px] pt-2 border-t border-[#E5E7EB]">
                  <span className="font-bold text-[#111827]">Net Payout:</span>
                  <span className="font-bold text-[#16A34A]">{formatCurrency(req.payout)}</span>
                </div>
              </div>

              <div className="text-[12px] text-[#4B5563] font-medium bg-[#F9FAFB] border border-[#E5E7EB] p-2.5 rounded-lg flex items-center justify-between">
                <span className="text-[#6B7280]">MoMo Details:</span>
                <span className="font-semibold text-[#111827]">{req.momo}</span>
              </div>

              {req.status === 'pending' && (
                <div className="flex items-center gap-2 pt-1">
                  <button className="flex-1 h-9 bg-[#16A34A] text-white rounded-lg font-semibold text-[13px] flex items-center justify-center gap-1.5 transition-colors cursor-pointer min-h-0">
                    <CheckCircle2 className="w-4.5 h-4.5" /> Approve
                  </button>
                  <button className="flex-1 h-9 bg-white border border-[#D1D5DB] text-[#EF4444] hover:bg-[#FEF2F2] hover:border-[#EF4444] rounded-lg font-semibold text-[13px] flex items-center justify-center gap-1.5 transition-colors cursor-pointer min-h-0">
                    <XCircle className="w-4.5 h-4.5" /> Reject
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>

      </div>
    </div>
  );
}

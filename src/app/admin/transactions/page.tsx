"use client";

import { Search, Filter, ArrowDownRight, ArrowUpRight } from "lucide-react";
import { formatCurrency } from "@/lib/pricing";

const TRANSACTIONS = [
  { id: "TXN-001", type: "sale", agent: "Emma Data", details: "Sold 5GB MTN to 0241234567", amount: 25.00, fee: 0.20, date: "2026-05-19 14:32" },
  { id: "TXN-002", type: "withdrawal", agent: "Serwaa Hub", details: "Payout to 0559876543", amount: -1140.00, fee: 60.00, date: "2026-05-18 14:15" },
  { id: "TXN-003", type: "sale", agent: "Kofi Tech", details: "Sold 1GB Vodafone to 0201112222", amount: 10.00, fee: 0.20, date: "2026-05-18 09:00" },
  { id: "TXN-004", type: "sale", agent: "Emma Data", details: "Sold 2GB MTN to 0549998888", amount: 12.00, fee: 0.20, date: "2026-05-17 18:45" },
];

export default function AdminTransactions() {
  return (
    <div className="p-4 sm:p-6 max-w-[1200px] mx-auto space-y-6 pb-24 lg:pb-8">
      {/* Page header row */}
      <div className="flex items-center justify-between h-10 w-full gap-4 shrink-0">
        <div>
          <h1 className="text-[20px] font-semibold text-[#111827] tracking-tight leading-none shrink-0">Transaction Log</h1>
          <p className="text-[12px] text-[#9CA3AF] mt-1.5 hidden sm:block">Full history of sales, credits, and withdrawals.</p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <div className="relative w-40 sm:w-64 h-9">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#9CA3AF]" />
            <input 
              type="text" 
              placeholder="Search TXN ID or agent..." 
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
                <th className="px-5 py-3 font-semibold">Transaction</th>
                <th className="px-5 py-3 font-semibold">Agent</th>
                <th className="px-5 py-3 font-semibold">Type</th>
                <th className="px-5 py-3 font-semibold">Amount</th>
                <th className="px-5 py-3 font-semibold">Platform Fee/Comm.</th>
                <th className="px-5 py-3 font-semibold">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E5E7EB] text-[#374151]">
              {TRANSACTIONS.map((txn) => (
                <tr key={txn.id} className="hover:bg-[#F9FAFB] transition-colors">
                  <td className="px-5 py-4">
                    <p className="font-semibold text-[#111827] text-[14px]">{txn.id}</p>
                    <p className="text-[11px] text-[#9CA3AF] mt-0.5">{txn.details}</p>
                  </td>
                  <td className="px-5 py-4 font-semibold text-[#111827] text-[14px]">{txn.agent}</td>
                  <td className="px-5 py-4">
                    {txn.type === 'sale' ? (
                      <span className="inline-flex items-center gap-1 text-[#15803D] font-semibold bg-[#F0FDF4] px-2.5 py-0.5 rounded text-[11px]">
                        <ArrowDownRight className="w-3 h-3 text-[#15803D]" /> Sale
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-[#D97706] font-semibold bg-[#FFFBEB] px-2.5 py-0.5 rounded text-[11px]">
                        <ArrowUpRight className="w-3 h-3 text-[#D97706]" /> Payout
                      </span>
                    )}
                  </td>
                  <td className="px-5 py-4 font-semibold text-[#111827] text-[14px]">
                    {txn.type === 'sale' ? '+' : ''}{formatCurrency(txn.amount)}
                  </td>
                  <td className="px-5 py-4 text-[#16A34A] font-semibold text-[13px]">
                    +{formatCurrency(txn.fee)}
                  </td>
                  <td className="px-5 py-4 text-[#6B7280] text-[13px]">{txn.date}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Mobile View */}
        <div className="md:hidden divide-y divide-[#E5E7EB]">
          {TRANSACTIONS.map((txn) => (
            <div key={txn.id} className="p-4 space-y-3.5 bg-white">
              <div className="flex justify-between items-start gap-2">
                <div className="min-w-0">
                  <h4 className="font-semibold text-[#111827] text-[14px] truncate">{txn.id}</h4>
                  <p className="text-[11px] text-[#9CA3AF] mt-0.5">{txn.details}</p>
                </div>
                {txn.type === 'sale' ? (
                  <span className="inline-flex items-center text-[#15803D] font-semibold bg-[#F0FDF4] px-2 py-0.5 rounded text-[10px] shrink-0">
                    Sale
                  </span>
                ) : (
                  <span className="inline-flex items-center text-[#D97706] font-semibold bg-[#FFFBEB] px-2 py-0.5 rounded text-[10px] shrink-0">
                    Payout
                  </span>
                )}
              </div>

              <div className="grid grid-cols-2 gap-2 text-[12px] text-[#4B5563]">
                <div>
                  <span className="text-[#6B7280] block mb-0.5">Agent:</span>
                  <span className="font-semibold text-[#111827]">{txn.agent}</span>
                </div>
                <div>
                  <span className="text-[#6B7280] block mb-0.5">Date:</span>
                  <span className="text-[#6B7280]">{txn.date}</span>
                </div>
              </div>

              <div className="bg-[#F9FAFB] border border-[#E5E7EB] p-2.5 rounded-lg flex items-center justify-between text-[12px]">
                <div>
                  <span className="text-[#6B7280] block mb-0.5">Amount:</span>
                  <span className="font-semibold text-[#111827]">{txn.type === 'sale' ? '+' : ''}{formatCurrency(txn.amount)}</span>
                </div>
                <div className="text-right">
                  <span className="text-[#6B7280] block mb-0.5">Platform Fee/Comm:</span>
                  <span className="font-semibold text-[#16A34A]">+{formatCurrency(txn.fee)}</span>
                </div>
              </div>
            </div>
          ))}
        </div>

      </div>
    </div>
  );
}

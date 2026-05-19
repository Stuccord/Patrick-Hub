"use client";

import { Save, AlertCircle } from "lucide-react";
import { useState } from "react";

export default function AdminPricing() {
  const [loading, setLoading] = useState(false);

  return (
    <div className="p-4 sm:p-6 max-w-[800px] mx-auto space-y-6 pb-24 lg:pb-8">
      {/* Page header row */}
      <div className="flex items-center justify-between h-10 w-full gap-4 shrink-0">
        <div>
          <h1 className="text-[20px] font-semibold text-[#111827] tracking-tight leading-none shrink-0">Pricing & Configuration</h1>
          <p className="text-[12px] text-[#9CA3AF] mt-1.5 hidden sm:block">Manage global platform fees and commissions.</p>
        </div>
      </div>

      {/* Card Config Container */}
      <div className="bg-white border border-[#E5E7EB] rounded-xl shadow-[0_1px_3px_rgba(0,0,0,0.05)] p-5 sm:p-6 space-y-6">
        
        {/* Section 1 */}
        <div className="space-y-3.5">
          <div>
            <h3 className="font-semibold text-[#111827] text-base">Global Transaction Fee</h3>
            <p className="text-[12px] text-[#6B7280] mt-0.5">This flat fee is added to every customer purchase on top of the agent's selling price.</p>
          </div>
          
          <div className="flex items-center gap-4 w-full sm:max-w-xs">
            <div className="relative flex-1 h-9">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#9CA3AF] font-medium text-[13px]">GHS</span>
              <input 
                type="number" 
                defaultValue="0.20"
                step="0.01"
                className="w-full h-full pl-12 pr-3 rounded-lg border border-[#E5E7EB] focus:border-[#16A34A] focus:outline-none text-[#111827] text-[14px] font-medium bg-white"
              />
            </div>
          </div>
        </div>

        <hr className="border-[#E5E7EB]" />

        {/* Section 2 */}
        <div className="space-y-3.5">
          <div>
            <h3 className="font-semibold text-[#111827] text-base">Withdrawal Commission</h3>
            <p className="text-[12px] text-[#6B7280] mt-0.5">Percentage deducted from agent wallets when they request a withdrawal.</p>
          </div>
          
          <div className="flex items-center gap-4 w-full sm:max-w-xs">
            <div className="relative flex-1 h-9">
              <input 
                type="number" 
                defaultValue="5.00"
                step="0.1"
                className="w-full h-full pl-3.5 pr-8 rounded-lg border border-[#E5E7EB] focus:border-[#16A34A] focus:outline-none text-[#111827] text-[14px] font-medium bg-white"
              />
              <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#9CA3AF] font-medium text-[13px]">%</span>
            </div>
          </div>
        </div>

        {/* Note Box */}
        <div className="bg-[#F8FAFC] border border-[#E2E8F0] p-4 rounded-lg flex items-start gap-3 text-[#475569]">
          <AlertCircle className="w-4 h-4 text-[#64748B] shrink-0 mt-0.5" />
          <p className="text-[12px] leading-relaxed">
            <strong>Note:</strong> Changes to these fees apply to all future transactions immediately. Active shopping carts might show old pricing until refreshed.
          </p>
        </div>

        {/* Action Button */}
        <button 
          className="w-full sm:w-auto h-9 px-4 bg-[#16A34A] text-white rounded-lg text-[13px] font-semibold hover:bg-[#15803D] active:scale-95 transition-all flex items-center justify-center gap-1.5 min-h-0 cursor-pointer shadow-sm shadow-green-600/10"
          onClick={() => {
            setLoading(true);
            setTimeout(() => setLoading(false), 1000);
          }}
        >
          <Save className="w-4 h-4 shrink-0" />
          <span>{loading ? "Saving..." : "Save Configuration"}</span>
        </button>
      </div>
    </div>
  );
}

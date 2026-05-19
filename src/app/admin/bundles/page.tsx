"use client";

import { Plus, Edit2, Trash2, Search, Filter } from "lucide-react";
import { formatCurrency } from "@/lib/pricing";

const BUNDLES = [
  { id: "1", name: "1GB MTN Data", size: "1GB", network: "MTN", basePrice: 4.50, minResell: 5.50, active: true },
  { id: "2", name: "5GB MTN Data", size: "5GB", network: "MTN", basePrice: 20.00, minResell: 23.00, active: true },
  { id: "3", name: "2GB Vodafone Data", size: "2GB", network: "Vodafone", basePrice: 8.00, minResell: 10.00, active: true },
  { id: "4", name: "10GB AirtelTigo", size: "10GB", network: "AirtelTigo", basePrice: 35.00, minResell: 40.00, active: false },
];

export default function AdminBundles() {
  return (
    <div className="p-4 sm:p-6 max-w-[1200px] mx-auto space-y-6 pb-24 lg:pb-8">
      {/* Page header row */}
      <div className="flex items-center justify-between h-10 w-full gap-4 shrink-0">
        <div>
          <h1 className="text-[20px] font-semibold text-[#111827] tracking-tight leading-none shrink-0">Bundles Inventory</h1>
          <p className="text-[12px] text-[#9CA3AF] mt-1.5 hidden sm:block">Manage network bundles, base costs, and minimum resell rules.</p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <div className="relative w-40 sm:w-64 h-9">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#9CA3AF]" />
            <input 
              type="text" 
              placeholder="Search bundles..." 
              className="w-full h-full pl-9 pr-4 bg-white border border-[#E5E7EB] rounded-lg text-[13px] text-[#374151] placeholder-[#9CA3AF] focus:border-[#16A34A] focus:outline-none transition-colors"
            />
          </div>
          <button className="h-9 px-3.5 bg-[#16A34A] text-white hover:bg-[#15803D] rounded-lg text-[13px] font-medium transition-colors flex items-center justify-center gap-1.5 min-h-0 cursor-pointer shadow-sm shrink-0">
            <Plus className="w-4 h-4" /> <span className="hidden sm:inline">Add Bundle</span>
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
                <th className="px-5 py-3 font-semibold">Bundle Name</th>
                <th className="px-5 py-3 font-semibold">Network</th>
                <th className="px-5 py-3 font-semibold">Base Cost</th>
                <th className="px-5 py-3 font-semibold">Min. Resell Price</th>
                <th className="px-5 py-3 font-semibold">Status</th>
                <th className="px-5 py-3 text-right font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E5E7EB] text-[#374151]">
              {BUNDLES.map((bundle) => (
                <tr key={bundle.id} className="hover:bg-[#F9FAFB] transition-colors">
                  <td className="px-5 py-4">
                    <p className="font-semibold text-[#111827] text-[14px]">{bundle.name}</p>
                    <p className="text-[11px] text-[#9CA3AF] mt-0.5">{bundle.size}</p>
                  </td>
                  <td className="px-5 py-4">
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                      bundle.network === 'MTN' ? 'bg-[#FFFBEB] text-[#D97706] border border-[#FEF3C7]' :
                      bundle.network === 'Vodafone' ? 'bg-[#FEF2F2] text-[#EF4444] border border-[#FEE2E2]' :
                      'bg-[#EFF6FF] text-[#1D4ED8] border border-[#DBEAFE]'
                    }`}>
                      {bundle.network}
                    </span>
                  </td>
                  <td className="px-5 py-4 font-semibold text-[#111827] text-[14px]">{formatCurrency(bundle.basePrice)}</td>
                  <td className="px-5 py-4 font-medium text-[#4B5563] text-[13px]">{formatCurrency(bundle.minResell)}</td>
                  <td className="px-5 py-4">
                    {bundle.active ? (
                      <span className="inline-flex items-center px-2.5 py-0.5 bg-[#F0FDF4] text-[#15803D] text-[11px] font-semibold rounded-full">Active</span>
                    ) : (
                      <span className="inline-flex items-center px-2.5 py-0.5 bg-[#F3F4F6] text-[#4B5563] text-[11px] font-semibold rounded-full">Inactive</span>
                    )}
                  </td>
                  <td className="px-5 py-4">
                    <div className="flex items-center justify-end gap-2">
                      <button className="h-7 w-7 flex items-center justify-center bg-white border border-[#E5E7EB] hover:bg-[#F9FAFB] text-[#374151] rounded-md transition-colors cursor-pointer min-h-0 shrink-0" title="Edit">
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button className="h-7 w-7 flex items-center justify-center bg-white border border-[#E5E7EB] hover:bg-[#FEF2F2] hover:text-[#EF4444] text-[#9CA3AF] rounded-md transition-colors cursor-pointer min-h-0 shrink-0" title="Delete">
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Mobile View */}
        <div className="md:hidden divide-y divide-[#E5E7EB]">
          {BUNDLES.map((bundle) => (
            <div key={bundle.id} className="p-4 space-y-3.5 bg-white">
              <div className="flex justify-between items-start gap-2">
                <div className="min-w-0">
                  <h4 className="font-semibold text-[#111827] text-[14px] truncate">{bundle.name}</h4>
                  <p className="text-[11px] text-[#9CA3AF] mt-0.5">Size: {bundle.size}</p>
                </div>
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold shrink-0 ${
                  bundle.network === 'MTN' ? 'bg-[#FFFBEB] text-[#D97706] border border-[#FEF3C7]' :
                  bundle.network === 'Vodafone' ? 'bg-[#FEF2F2] text-[#EF4444] border border-[#FEE2E2]' :
                  'bg-[#EFF6FF] text-[#1D4ED8] border border-[#DBEAFE]'
                }`}>
                  {bundle.network}
                </span>
              </div>

              <div className="bg-[#F9FAFB] border border-[#E5E7EB] p-2.5 rounded-lg text-[12px] grid grid-cols-2 gap-2">
                <div>
                  <span className="text-[#6B7280] block mb-0.5">Base Cost:</span>
                  <span className="font-semibold text-[#111827]">{formatCurrency(bundle.basePrice)}</span>
                </div>
                <div>
                  <span className="text-[#6B7280] block mb-0.5">Min Resell:</span>
                  <span className="font-semibold text-[#111827]">{formatCurrency(bundle.minResell)}</span>
                </div>
              </div>

              <div className="flex items-center justify-between pt-1">
                {bundle.active ? (
                  <span className="inline-flex items-center px-2 py-0.5 bg-[#F0FDF4] text-[#15803D] text-[11px] font-semibold rounded-full">Active</span>
                ) : (
                  <span className="inline-flex items-center px-2 py-0.5 bg-[#F3F4F6] text-[#4B5563] text-[11px] font-semibold rounded-full">Inactive</span>
                )}
                <div className="flex items-center gap-2">
                  <button className="h-9 w-9 flex items-center justify-center bg-white border border-[#E5E7EB] hover:bg-[#F9FAFB] text-[#374151] rounded-lg transition-colors cursor-pointer min-h-0 shrink-0" title="Edit">
                    <Edit2 className="w-4.5 h-4.5" />
                  </button>
                  <button className="h-9 w-9 flex items-center justify-center bg-white border border-[#E5E7EB] hover:bg-[#FEF2F2] hover:text-[#EF4444] text-[#9CA3AF] rounded-lg transition-colors cursor-pointer min-h-0 shrink-0" title="Delete">
                    <Trash2 className="w-4.5 h-4.5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

      </div>
    </div>
  );
}

"use client";

import { useEffect, useState } from "react";
import { CheckCircle2, XCircle, Search, Filter, Store, Trash2, Mail, Phone as PhoneIcon } from "lucide-react";
import { formatCurrency } from "@/lib/pricing";

export default function AdminAgents() {
  const [agents, setAgents] = useState<any[]>([]);

  useEffect(() => {
    const localUsers = JSON.parse(localStorage.getItem("patrickhub_users") || "[]");
    setAgents(localUsers);
  }, []);

  const updateStatus = (id: string, newStatus: string) => {
    const updated = agents.map(agent => 
      agent.id === id ? { ...agent, status: newStatus } : agent
    );
    setAgents(updated);
    localStorage.setItem("patrickhub_users", JSON.stringify(updated));
  };

  const deleteAgent = (id: string) => {
    const updated = agents.filter(agent => agent.id !== id);
    setAgents(updated);
    localStorage.setItem("patrickhub_users", JSON.stringify(updated));
  };

  return (
    <div className="p-4 sm:p-6 max-w-[1200px] mx-auto space-y-6 pb-24 lg:pb-8">
      {/* Page header row */}
      <div className="flex items-center justify-between h-10 w-full gap-4 shrink-0">
        <div>
          <h1 className="text-[20px] font-semibold text-[#111827] tracking-tight leading-none shrink-0">Sub-Agents</h1>
          <p className="text-[12px] text-[#9CA3AF] mt-1.5 hidden sm:block">Manage, approve, and suspend your platform resellers.</p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <div className="relative w-40 sm:w-64 h-9">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#9CA3AF]" />
            <input 
              type="text" 
              placeholder="Search agents..." 
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
                <th className="px-5 py-3 font-semibold">Agent Name</th>
                <th className="px-5 py-3 font-semibold">Contact</th>
                <th className="px-5 py-3 font-semibold">Store Slug</th>
                <th className="px-5 py-3 font-semibold">Status</th>
                <th className="px-5 py-3 font-semibold">Wallet Bal.</th>
                <th className="px-5 py-3 text-right font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E5E7EB] text-[#374151]">
              {agents.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-5 py-8 text-center text-[#9CA3AF] font-medium text-[13px]">
                    No agents registered yet.
                  </td>
                </tr>
              ) : (
                agents.map((agent) => (
                  <tr key={agent.id} className="hover:bg-[#F9FAFB] transition-colors">
                    <td className="px-5 py-4">
                      <p className="font-semibold text-[#111827] text-[14px]">{agent.name}</p>
                    </td>
                    <td className="px-5 py-4">
                      <p className="text-[#374151] font-medium text-[13px]">{agent.phone}</p>
                      <p className="text-[11px] text-[#9CA3AF] mt-0.5">{agent.email}</p>
                    </td>
                    <td className="px-5 py-4">
                      <span className="flex items-center gap-1.5 text-[#4B5563] text-[13px]">
                        <Store className="w-3.5 h-3.5 text-[#9CA3AF]" />
                        /{agent.username}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      {agent.status === 'active' && <span className="inline-flex items-center px-2.5 py-0.5 bg-[#F0FDF4] text-[#15803D] text-[11px] font-semibold rounded-full">Active</span>}
                      {agent.status === 'pending' && <span className="inline-flex items-center px-2.5 py-0.5 bg-[#FFFBEB] text-[#D97706] text-[11px] font-semibold rounded-full">Pending</span>}
                      {agent.status === 'suspended' && <span className="inline-flex items-center px-2.5 py-0.5 bg-[#FEF2F2] text-[#EF4444] text-[11px] font-semibold rounded-full">Suspended</span>}
                    </td>
                    <td className="px-5 py-4 font-semibold text-[#111827] text-[14px]">GHS {(agent.wallet || 0).toFixed(2)}</td>
                    <td className="px-5 py-4">
                      <div className="flex items-center justify-end gap-2">
                        {agent.status === 'pending' && (
                          <button 
                            onClick={() => updateStatus(agent.id, 'active')}
                            className="h-7 px-2.5 bg-[#16A34A] text-white hover:bg-[#15803D] rounded-md text-[12px] font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer min-h-0 shadow-sm"
                          >
                            <CheckCircle2 className="w-3.5 h-3.5" /> Approve
                          </button>
                        )}
                        {agent.status === 'active' && (
                          <button 
                            onClick={() => updateStatus(agent.id, 'suspended')}
                            className="h-7 px-2.5 bg-white border border-[#D1D5DB] text-[#374151] hover:bg-[#F9FAFB] rounded-md text-[12px] font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer min-h-0"
                          >
                            <XCircle className="w-3.5 h-3.5" /> Suspend
                          </button>
                        )}
                        {agent.status === 'suspended' && (
                          <button 
                            onClick={() => updateStatus(agent.id, 'active')}
                            className="h-7 px-2.5 bg-[#16A34A] text-white hover:bg-[#15803D] rounded-md text-[12px] font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer min-h-0 shadow-sm"
                          >
                            <CheckCircle2 className="w-3.5 h-3.5" /> Reactivate
                          </button>
                        )}
                        <button 
                          onClick={() => deleteAgent(agent.id)}
                          className="h-7 w-7 flex items-center justify-center bg-white border border-[#E5E7EB] hover:bg-[#FEF2F2] hover:text-[#EF4444] text-[#9CA3AF] rounded-md transition-colors cursor-pointer min-h-0 shrink-0"
                          title="Delete"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Mobile View (Cards stacked) */}
        <div className="md:hidden divide-y divide-[#E5E7EB]">
          {agents.length === 0 ? (
            <div className="p-5 text-center text-[#9CA3AF] text-[13px]">
              No agents registered yet.
            </div>
          ) : (
            agents.map((agent) => (
              <div key={agent.id} className="p-4 space-y-3.5 bg-white">
                <div className="flex justify-between items-start gap-2">
                  <div className="min-w-0">
                    <h4 className="font-semibold text-[#111827] text-[14px] truncate">{agent.name}</h4>
                    <p className="text-[11px] text-[#16A34A] font-semibold mt-0.5">/{agent.username}</p>
                  </div>
                  {agent.status === 'active' && <span className="inline-flex items-center px-2 py-0.5 bg-[#F0FDF4] text-[#15803D] text-[11px] font-semibold rounded-full shrink-0">Active</span>}
                  {agent.status === 'pending' && <span className="inline-flex items-center px-2 py-0.5 bg-[#FFFBEB] text-[#D97706] text-[11px] font-semibold rounded-full shrink-0">Pending</span>}
                  {agent.status === 'suspended' && <span className="inline-flex items-center px-2 py-0.5 bg-[#FEF2F2] text-[#EF4444] text-[11px] font-semibold rounded-full shrink-0">Suspended</span>}
                </div>

                <div className="grid grid-cols-2 gap-2 text-[12px] text-[#4B5563]">
                  <div className="flex items-center gap-1.5 min-w-0">
                    <PhoneIcon className="w-3.5 h-3.5 text-[#9CA3AF] shrink-0" /> 
                    <span className="truncate">{agent.phone}</span>
                  </div>
                  <div className="flex items-center gap-1.5 min-w-0">
                    <Mail className="w-3.5 h-3.5 text-[#9CA3AF] shrink-0" /> 
                    <span className="truncate">{agent.email}</span>
                  </div>
                </div>

                <div className="bg-[#F9FAFB] border border-[#E5E7EB] p-2.5 rounded-lg flex items-center justify-between text-[12px]">
                  <span className="text-[#6B7280]">Wallet Balance:</span>
                  <span className="font-semibold text-[#111827]">GHS {(agent.wallet || 0).toFixed(2)}</span>
                </div>

                <div className="flex items-center gap-2 pt-1">
                  {agent.status === 'pending' && (
                    <button 
                      onClick={() => updateStatus(agent.id, 'active')}
                      className="flex-1 h-9 bg-[#16A34A] text-white rounded-lg font-semibold text-[13px] flex items-center justify-center gap-1.5 transition-colors cursor-pointer min-h-0"
                    >
                      <CheckCircle2 className="w-4 h-4" /> Approve
                  </button>
                  )}
                  {agent.status === 'active' && (
                    <button 
                      onClick={() => updateStatus(agent.id, 'suspended')}
                      className="flex-1 h-9 bg-white border border-[#D1D5DB] text-[#374151] hover:bg-[#F9FAFB] rounded-lg font-semibold text-[13px] flex items-center justify-center gap-1.5 transition-colors cursor-pointer min-h-0"
                    >
                      <XCircle className="w-4 h-4" /> Suspend
                    </button>
                  )}
                  {agent.status === 'suspended' && (
                    <button 
                      onClick={() => updateStatus(agent.id, 'active')}
                      className="flex-1 h-9 bg-[#16A34A] text-white rounded-lg font-semibold text-[13px] flex items-center justify-center gap-1.5 transition-colors cursor-pointer min-h-0"
                    >
                      <CheckCircle2 className="w-4 h-4" /> Reactivate
                    </button>
                  )}
                  <button 
                    onClick={() => deleteAgent(agent.id)}
                    className="h-9 w-9 flex items-center justify-center bg-white border border-[#E5E7EB] hover:bg-[#FEF2F2] hover:text-[#EF4444] text-[#9CA3AF] rounded-lg transition-colors cursor-pointer min-h-0 shrink-0"
                    title="Delete"
                  >
                    <Trash2 className="w-4.5 h-4.5" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

      </div>
    </div>
  );
}

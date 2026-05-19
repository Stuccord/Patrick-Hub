"use client";

import { useEffect, useState } from "react";
import { formatCurrency } from "@/lib/pricing";
import { 
  Filter,
  CheckCircle2,
  XCircle,
  MoreHorizontal,
  TrendingUp,
  Coins,
  Users,
  Clock,
  UserX
} from "lucide-react";

export default function AdminDashboard() {
  const [agents, setAgents] = useState<any[]>([]);
  const [stats, setStats] = useState({
    totalSales: 125400.00,
    platformEarnings: 2450.20,
    activeAgentsCount: 0,
    pendingWithdrawalsCount: 1,
  });

  useEffect(() => {
    const localUsers = JSON.parse(localStorage.getItem("patrickhub_users") || "[]");
    setAgents(localUsers);

    const activeCount = localUsers.filter((u: any) => u.status === 'active').length;
    setStats(prev => ({
      ...prev,
      activeAgentsCount: activeCount
    }));
  }, []);

  const handleApproveAgent = (id: string) => {
    const updated = agents.map(agent => 
      agent.id === id ? { ...agent, status: 'active' } : agent
    );
    setAgents(updated);
    localStorage.setItem("patrickhub_users", JSON.stringify(updated));

    const activeCount = updated.filter((u: any) => u.status === 'active').length;
    setStats(prev => ({
      ...prev,
      activeAgentsCount: activeCount
    }));
  };

  const handleRejectAgent = (id: string) => {
    const updated = agents.filter(agent => agent.id !== id);
    setAgents(updated);
    localStorage.setItem("patrickhub_users", JSON.stringify(updated));
  };

  const pendingAgents = agents.filter(agent => agent.status === 'pending');

  const WITHDRAWALS = [
    { id: "w1", agent: "Kofi Tech", amount: 500.00, net: 475.00, commission: 25.00, status: "pending" },
  ];

  return (
    <div className="p-4 sm:p-6 space-y-6 max-w-[1200px] mx-auto pb-24 lg:pb-8">
      {/* 
        PROBLEM 1 — PAGE TITLE ROW (Height ~40px max, flexbox row, space-between, align-center) 
        Title font size 20px MAXIMUM, font-weight 600, color #111827
      */}
      <div className="flex items-center justify-between h-10 w-full gap-4 shrink-0">
        <h1 className="text-[20px] font-semibold text-[#111827] tracking-tight leading-none shrink-0">
          Platform Performance
        </h1>
        <div className="flex items-center gap-2 shrink-0">
          <button className="h-9 px-3.5 bg-white border border-[#E5E7EB] rounded-lg text-[13px] font-medium text-[#374151] hover:bg-[#F9FAFB] active:scale-95 transition-all flex items-center justify-center gap-1.5 min-h-0 cursor-pointer">
            <Filter className="h-4 w-4 text-[#6B7280]" />
            <span>Filter</span>
          </button>
          <button className="h-9 px-4 bg-[#111827] text-white rounded-lg text-[13px] font-medium hover:bg-slate-800 active:scale-95 transition-all flex items-center justify-center min-h-0 cursor-pointer">
            Export Data
          </button>
        </div>
      </div>

      {/* 
        PROBLEM 2 — STAT CARDS (4 cards in a row, desktop, repeat(4, 1fr) CSS Grid) 
        Each card: min-width: 0, overflow-hidden, no overflow outside card
      */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Total Sales */}
        <div className="bg-white p-5 rounded-xl border border-[#E5E7EB] shadow-[0_1px_3px_rgba(0,0,0,0.06)] flex flex-col justify-between h-[135px] min-w-0 overflow-hidden">
          <div className="flex items-center justify-between w-full shrink-0">
            <div className="w-9 h-9 bg-[#F0FDF4] rounded-full flex items-center justify-center text-[#16A34A] shrink-0">
              <TrendingUp className="h-4 w-4" />
            </div>
            <button className="text-[#9CA3AF] hover:text-[#6B7280] min-h-0 p-1 rounded-md transition-colors">
              <MoreHorizontal className="h-4 w-4" />
            </button>
          </div>
          <div className="mt-3 min-w-0 flex-1 flex flex-col justify-end">
            <h3 className="text-xl sm:text-2xl font-bold text-[#111827] tracking-tight leading-none truncate shrink-0">
              {formatCurrency(stats.totalSales)}
            </h3>
            {/* Label text on one line - font size 10px uppercase truncate */}
            <div className="flex items-center justify-between mt-2.5 min-w-0 shrink-0 gap-1.5">
              <span className="text-[10px] uppercase tracking-[0.05em] text-[#6B7280] font-semibold truncate whitespace-nowrap block flex-1">
                Total Sales
              </span>
              <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 bg-[#F0FDF4] text-[#15803D] text-[10px] font-semibold rounded-full shrink-0">
                +24%
              </span>
            </div>
          </div>
        </div>

        {/* Card 2: Platform Fees */}
        <div className="bg-white p-5 rounded-xl border border-[#E5E7EB] shadow-[0_1px_3px_rgba(0,0,0,0.06)] flex flex-col justify-between h-[135px] min-w-0 overflow-hidden">
          <div className="flex items-center justify-between w-full shrink-0">
            <div className="w-9 h-9 bg-[#F0FDF4] rounded-full flex items-center justify-center text-[#16A34A] shrink-0">
              <Coins className="h-4 w-4" />
            </div>
            <button className="text-[#9CA3AF] hover:text-[#6B7280] min-h-0 p-1 rounded-md transition-colors">
              <MoreHorizontal className="h-4 w-4" />
            </button>
          </div>
          <div className="mt-3 min-w-0 flex-1 flex flex-col justify-end">
            <h3 className="text-xl sm:text-2xl font-bold text-[#16A34A] tracking-tight leading-none truncate shrink-0">
              {formatCurrency(stats.platformEarnings)}
            </h3>
            <div className="flex items-center justify-between mt-2.5 min-w-0 shrink-0 gap-1.5">
              <span className="text-[10px] uppercase tracking-[0.05em] text-[#6B7280] font-semibold truncate whitespace-nowrap block flex-1">
                Platform Fees
              </span>
              {/* Sub-label font size 11px color #9CA3AF single line */}
              <span className="text-[11px] text-[#9CA3AF] font-normal leading-none normal-case truncate whitespace-nowrap shrink-0">
                GHS 0.20/txn
              </span>
            </div>
          </div>
        </div>

        {/* Card 3: Active Agents */}
        <div className="bg-white p-5 rounded-xl border border-[#E5E7EB] shadow-[0_1px_3px_rgba(0,0,0,0.06)] flex flex-col justify-between h-[135px] min-w-0 overflow-hidden">
          <div className="flex items-center justify-between w-full shrink-0">
            <div className="w-9 h-9 bg-[#F0FDF4] rounded-full flex items-center justify-center text-[#16A34A] shrink-0">
              <Users className="h-4 w-4" />
            </div>
            <button className="text-[#9CA3AF] hover:text-[#6B7280] min-h-0 p-1 rounded-md transition-colors">
              <MoreHorizontal className="h-4 w-4" />
            </button>
          </div>
          <div className="mt-3 min-w-0 flex-1 flex flex-col justify-end">
            <h3 className="text-xl sm:text-2xl font-bold text-[#111827] tracking-tight leading-none truncate shrink-0">
              {stats.activeAgentsCount}
            </h3>
            <div className="flex items-center justify-between mt-2.5 min-w-0 shrink-0 gap-1.5">
              <span className="text-[10px] uppercase tracking-[0.05em] text-[#6B7280] font-semibold truncate whitespace-nowrap block flex-1">
                Active Agents
              </span>
              <span className="text-[11px] text-[#9CA3AF] font-normal leading-none normal-case truncate whitespace-nowrap shrink-0">
                resellers online
              </span>
            </div>
          </div>
        </div>

        {/* Card 4: Withdrawals */}
        <div className="bg-white p-5 rounded-xl border border-[#E5E7EB] shadow-[0_1px_3px_rgba(0,0,0,0.06)] flex flex-col justify-between h-[135px] min-w-0 overflow-hidden">
          <div className="flex items-center justify-between w-full shrink-0">
            <div className="w-9 h-9 bg-[#FDF2F8] rounded-full flex items-center justify-center text-[#EF4444] shrink-0">
              <Clock className="h-4 w-4" />
            </div>
            <button className="text-[#9CA3AF] hover:text-[#6B7280] min-h-0 p-1 rounded-md transition-colors">
              <MoreHorizontal className="h-4 w-4" />
            </button>
          </div>
          <div className="mt-3 min-w-0 flex-1 flex flex-col justify-end">
            <h3 className="text-xl sm:text-2xl font-bold text-[#111827] tracking-tight leading-none truncate shrink-0">
              {stats.pendingWithdrawalsCount}
            </h3>
            <div className="flex items-center justify-between mt-2.5 min-w-0 shrink-0 gap-1.5">
              <span className="text-[10px] uppercase tracking-[0.05em] text-[#6B7280] font-semibold truncate whitespace-nowrap block flex-1">
                Withdrawals
              </span>
              <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 bg-amber-50 text-[#F59E0B] text-[10px] font-semibold rounded-full shrink-0 uppercase">
                Pending
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* 
        PROBLEM 5 — BOTTOM SECTIONS LAYOUT (Two-column grid on desktop, 50/50 split) 
        Each section heading: 15px, font-weight 600. White cards with border-radius: 12px, border: 1px solid #E5E7EB, padding: 20px
      */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Section: Pending Agent Approvals */}
        <div className="bg-white rounded-xl border border-[#E5E7EB] p-5 shadow-[0_1px_3px_rgba(0,0,0,0.06)] flex flex-col">
          {/* Section Heading: 15px, font-weight 600 */}
          <h3 className="text-[15px] font-semibold text-[#111827] mb-4 shrink-0">
            Pending Agent Approvals
          </h3>

          {/* List Content */}
          <div className="flex-1 flex flex-col min-h-[160px]">
            {pendingAgents.length === 0 ? (
              <div className="flex-1 flex flex-col items-center justify-center py-6 text-center">
                <div className="w-12 h-12 rounded-full bg-[#F9FAFB] flex items-center justify-center text-[#9CA3AF] mb-3 border border-[#E5E7EB]">
                  <UserX className="h-5 w-5" />
                </div>
                {/* Clean centred grey text, 13px */}
                <p className="text-[13px] text-[#6B7280] font-normal">
                  No pending registrations at the moment.
                </p>
              </div>
            ) : (
              <div className="space-y-3.5">
                {pendingAgents.map((agent) => (
                  <div key={agent.id} className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-3.5 bg-[#F9FAFB] border border-[#E5E7EB] rounded-lg hover:bg-slate-50 transition-colors">
                    {/* Left Block */}
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-9 h-9 rounded-full bg-[#111827] text-white flex items-center justify-center font-semibold text-sm shrink-0 uppercase tracking-wide">
                        {agent.name ? agent.name.charAt(0) : "A"}
                      </div>
                      <div className="flex flex-col min-w-0">
                        <p className="text-[14px] font-semibold text-[#111827] leading-tight truncate">{agent.name}</p>
                        <p className="text-[12px] text-[#9CA3AF] mt-0.5 leading-none truncate">{agent.email}</p>
                      </div>
                    </div>

                    {/* Actions Block */}
                    <div className="flex items-center gap-2 shrink-0">
                      <button 
                        onClick={() => handleRejectAgent(agent.id)}
                        className="h-7 px-3 border border-[#EF4444] text-[#EF4444] hover:bg-red-50 rounded-md text-[12px] font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer min-h-0"
                      >
                        <XCircle className="h-3.5 w-3.5" /> Reject
                      </button>
                      <button 
                        onClick={() => handleApproveAgent(agent.id)}
                        className="h-7 px-3 bg-[#16A34A] text-white hover:bg-[#15803D] rounded-md text-[12px] font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer min-h-0 shadow-sm"
                      >
                        <CheckCircle2 className="h-3.5 w-3.5" /> Approve
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Section: Withdrawal Requests */}
        <div className="bg-white rounded-xl border border-[#E5E7EB] p-5 shadow-[0_1px_3px_rgba(0,0,0,0.06)] flex flex-col">
          {/* Section Heading: 15px, font-weight 600 */}
          <h3 className="text-[15px] font-semibold text-[#111827] mb-4 shrink-0">
            Withdrawal Requests
          </h3>

          {/* List Content */}
          <div className="flex-1 flex flex-col min-h-[160px]">
            <div className="space-y-3.5">
              {WITHDRAWALS.map((w) => (
                <div key={w.id} className="flex flex-col gap-3.5 p-3.5 bg-[#F9FAFB] border border-[#E5E7EB] rounded-lg hover:bg-slate-50 transition-colors">
                  {/* Top Row: Agent Info + Commission Badge */}
                  <div className="flex items-center justify-between gap-3 w-full">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="w-8 h-8 rounded-full bg-[#F0FDF4] text-[#15803D] flex items-center justify-center font-bold text-xs shrink-0 uppercase tracking-wide shadow-sm">
                        {w.agent ? w.agent.charAt(0) : "K"}
                      </div>
                      <div className="min-w-0">
                        <p className="text-[13px] font-semibold text-[#111827] leading-tight truncate">{w.agent}</p>
                        <p className="text-[11px] text-[#9CA3AF] leading-none mt-0.5">Agent Partner</p>
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <span className="text-[10px] uppercase tracking-wider text-[#EF4444] font-bold bg-[#FEF2F2] border border-[#FEE2E2] px-2 py-0.5 rounded-full inline-block">
                        Fee: -{formatCurrency(w.commission)}
                      </span>
                    </div>
                  </div>

                  {/* Bottom Row: Net Payout Amount + Action Button */}
                  <div className="flex items-center justify-between pt-2 border-t border-[#E5E7EB]/50 gap-4 w-full">
                    <div className="min-w-0">
                      <span className="text-[10px] uppercase tracking-wider text-[#6B7280] font-semibold block leading-none">Net Payout</span>
                      <span className="text-[14px] font-bold text-[#111827] mt-1 block leading-none truncate">{formatCurrency(w.net)}</span>
                    </div>
                    <button className="h-7.5 px-3 bg-white border border-[#D1D5DB] hover:border-[#16A34A] hover:bg-[#F0FDF4] hover:text-[#15803D] text-[#374151] rounded-lg text-[12px] font-semibold transition-colors cursor-pointer min-h-0 flex items-center justify-center shrink-0">
                      Process Payout
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

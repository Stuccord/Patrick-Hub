"use client";

import React, { useState, useEffect } from "react";
import { 
  BarChart3, 
  Users, 
  Package, 
  CreditCard, 
  Bell,
  Search,
  Settings,
  List,
  Menu,
  X,
  LogOut,
  Activity,
  Globe,
  ShoppingBag
} from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [showMoreMenu, setShowMoreMenu] = useState(false);
  const [adminName, setAdminName] = useState("Admin Central");
  const [adminInitials, setAdminInitials] = useState("AC");
  const [showNotifications, setShowNotifications] = useState(false);
  const [pendingAgentsCount, setPendingAgentsCount] = useState(0);
  const [pendingWithdrawalsCount, setPendingWithdrawalsCount] = useState(0);
  const [hasNotifications, setHasNotifications] = useState(false);

  useEffect(() => {
    const fetchAdmin = async () => {
      try {
        const supabase = createClient();
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          const { data: profile } = await supabase
            .from('users')
            .select('name')
            .eq('id', user.id)
            .single();
          
          if (profile?.name) {
            setAdminName(profile.name);
            const parts = profile.name.trim().split(/\s+/);
            const initials = parts.map((p: string) => p.charAt(0)).join("").substring(0, 2).toUpperCase();
            setAdminInitials(initials || "A");
          }

          // Fetch counts for pending agent registration approvals and pending withdrawals
          const { count: pendingAgents } = await supabase
            .from('users')
            .select('*', { count: 'exact', head: true })
            .eq('role', 'agent')
            .eq('status', 'pending');

          const { count: pendingWithdrawals } = await supabase
            .from('withdrawals')
            .select('*', { count: 'exact', head: true })
            .eq('status', 'pending');

          const agentsCount = pendingAgents || 0;
          const withdrawalsCount = pendingWithdrawals || 0;

          setPendingAgentsCount(agentsCount);
          setPendingWithdrawalsCount(withdrawalsCount);
          setHasNotifications(agentsCount > 0 || withdrawalsCount > 0);
        }
      } catch (err) {
        console.error("Error loading admin profile:", err);
      }
    };
    fetchAdmin();
  }, []);

  const handleLogout = async (e: React.MouseEvent) => {
    e.preventDefault();
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/login");
  };

  const isActive = (path: string) => {
    if (path === "/admin") return pathname === "/admin";
    return pathname.startsWith(path);
  };

  return (
    <div className="min-h-screen bg-[#F9FAFB] font-sans antialiased text-[#374151] relative admin-portal">
      {/* 
        PROBLEM 3 — FIXED LEFT SIDEBAR (width: 220px, white bg, right border: 1px solid #E5E7EB)
        Hidden on mobile (bottom nav instead), fixed left-0 top-0 bottom-0
      */}
      <aside className="hidden lg:flex w-[220px] bg-white border-r border-[#E5E7EB] flex-col fixed left-0 top-0 bottom-0 z-30 h-screen">
        {/* Logo Area - Height: 56px, border-bottom */}
        <div className="h-14 px-5 border-b border-[#E5E7EB] flex items-center gap-2.5 shrink-0">
          <div className="w-8 h-8 bg-[#16A34A] rounded-lg flex items-center justify-center text-white font-bold text-xs shadow-sm">
            PI
          </div>
          <span className="text-base font-semibold text-[#111827] tracking-tight">Patrick&apos;s Info Tech</span>
        </div>

        {/* Navigation - Font: 14px, color #6B7280 (inactive), padding: 10px 16px, border-radius: 8px */}
        <nav className="flex-1 p-3.5 space-y-1 overflow-y-auto">
          <Link 
            href="/admin" 
            className={`flex items-center gap-3 px-4 py-2.5 rounded-lg text-[14px] transition-colors min-h-0 ${
              isActive("/admin") && pathname === "/admin" 
                ? "bg-[#F0FDF4] text-[#16A34A] font-semibold" 
                : "text-[#6B7280] hover:text-[#111827] hover:bg-[#F9FAFB]"
            }`}
          >
            <BarChart3 className="h-[20px] w-[20px] shrink-0" />
            Dashboard
          </Link>
          <Link 
            href="/admin/agents" 
            className={`flex items-center gap-3 px-4 py-2.5 rounded-lg text-[14px] transition-colors min-h-0 ${
              isActive("/admin/agents") 
                ? "bg-[#F0FDF4] text-[#16A34A] font-semibold" 
                : "text-[#6B7280] hover:text-[#111827] hover:bg-[#F9FAFB]"
            }`}
          >
            <Users className="h-[20px] w-[20px] shrink-0" />
            Agents
          </Link>
          <Link 
            href="/admin/bundles" 
            className={`flex items-center gap-3 px-4 py-2.5 rounded-lg text-[14px] transition-colors min-h-0 ${
              isActive("/admin/bundles") 
                ? "bg-[#F0FDF4] text-[#16A34A] font-semibold" 
                : "text-[#6B7280] hover:text-[#111827] hover:bg-[#F9FAFB]"
            }`}
          >
            <Package className="h-[20px] w-[20px] shrink-0" />
            Bundles
          </Link>
          <Link 
            href="/admin/pricing" 
            className={`flex items-center gap-3 px-4 py-2.5 rounded-lg text-[14px] transition-colors min-h-0 ${
              isActive("/admin/pricing") 
                ? "bg-[#F0FDF4] text-[#16A34A] font-semibold" 
                : "text-[#6B7280] hover:text-[#111827] hover:bg-[#F9FAFB]"
            }`}
          >
            <Settings className="h-[20px] w-[20px] shrink-0" />
            Pricing
          </Link>
          <Link 
            href="/admin/orders" 
            className={`flex items-center gap-3 px-4 py-2.5 rounded-lg text-[14px] transition-colors min-h-0 ${
              isActive("/admin/orders") 
                ? "bg-[#F0FDF4] text-[#16A34A] font-semibold" 
                : "text-[#6B7280] hover:text-[#111827] hover:bg-[#F9FAFB]"
            }`}
          >
            <ShoppingBag className="h-[20px] w-[20px] shrink-0" />
            Orders
          </Link>
          <Link 
            href="/admin/withdrawals" 
            className={`flex items-center gap-3 px-4 py-2.5 rounded-lg text-[14px] transition-colors min-h-0 ${
              isActive("/admin/withdrawals") 
                ? "bg-[#F0FDF4] text-[#16A34A] font-semibold" 
                : "text-[#6B7280] hover:text-[#111827] hover:bg-[#F9FAFB]"
            }`}
          >
            <CreditCard className="h-[20px] w-[20px] shrink-0" />
            Withdrawals
          </Link>
          <Link 
            href="/admin/transactions" 
            className={`flex items-center gap-3 px-4 py-2.5 rounded-lg text-[14px] transition-colors min-h-0 ${
              isActive("/admin/transactions") 
                ? "bg-[#F0FDF4] text-[#16A34A] font-semibold" 
                : "text-[#6B7280] hover:text-[#111827] hover:bg-[#F9FAFB]"
            }`}
          >
            <List className="h-[20px] w-[20px] shrink-0" />
            Transactions
          </Link>
          <Link 
            href="/admin/security" 
            className={`flex items-center gap-3 px-4 py-2.5 rounded-lg text-[14px] transition-colors min-h-0 ${
              isActive("/admin/security") 
                ? "bg-[#F0FDF4] text-[#16A34A] font-semibold" 
                : "text-[#6B7280] hover:text-[#111827] hover:bg-[#F9FAFB]"
            }`}
          >
            <CreditCard className="h-[20px] w-[20px] shrink-0" />
            Security Settings
          </Link>
          <Link 
            href="/admin/audit-logs" 
            className={`flex items-center gap-3 px-4 py-2.5 rounded-lg text-[14px] transition-colors min-h-0 ${
              isActive("/admin/audit-logs") 
                ? "bg-[#F0FDF4] text-[#16A34A] font-semibold" 
                : "text-[#6B7280] hover:text-[#111827] hover:bg-[#F9FAFB]"
            }`}
          >
            <Activity className="h-[20px] w-[20px] shrink-0" />
            System Audit Logs
          </Link>
          <Link 
            href="/" 
            className="flex items-center gap-3 px-4 py-2.5 rounded-lg text-[14px] transition-colors min-h-0 text-[#6B7280] hover:text-[#111827] hover:bg-[#F9FAFB]"
          >
            <Globe className="h-[20px] w-[20px] shrink-0" />
            Back to Homepage
          </Link>
        </nav>
      </aside>

      {/* 
        Main content wrapper - shifts right by 220px on desktop (lg:pl-[220px])
        Background: #F9FAFB, min-height: 100vh
      */}
      <div className="lg:pl-[220px] min-h-screen bg-[#F9FAFB] flex flex-col relative">
        {/* Topbar/Header - Height: 56px, white background, bottom border: 1px solid #E5E7EB, fixed at the top */}
        <header className="h-14 bg-white border-b border-[#E5E7EB] px-4 sm:px-6 flex items-center justify-between fixed top-0 right-0 left-0 lg:left-[220px] z-20">
          <div className="flex items-center gap-3 w-full max-w-[500px]">
            {/* Logo visible only on mobile/tablet */}
            <div className="flex lg:hidden items-center gap-2 shrink-0">
              <div className="w-8 h-8 bg-[#16A34A] rounded-lg flex items-center justify-center text-white font-bold text-xs shadow-sm">
                PI
              </div>
              <span className="text-base font-semibold text-[#111827] tracking-tight mr-2">Patrick&apos;s Info Tech</span>
            </div>

            {/* Search Bar - max-width 400px, height 36px, border-radius 8px */}
            <div className="relative w-full max-w-[400px] h-9">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#9CA3AF]" />
              <input 
                type="text" 
                placeholder="Search agents, transactions..." 
                className="w-full h-full pl-9 pr-4 bg-white border border-[#E5E7EB] rounded-lg text-[14px] text-[#374151] placeholder-[#9CA3AF] focus:border-[#16A34A] focus:outline-none transition-colors"
              />
            </div>
          </div>

          {/* Right Area */}
          <div className="flex items-center gap-3 shrink-0">
            {/* Bell Icon (24px clickable space) */}
            <div className="relative">
              <button 
                onClick={() => setShowNotifications(!showNotifications)}
                className="relative p-1.5 text-[#6B7280] hover:text-[#111827] hover:bg-[#F9FAFB] rounded-lg flex items-center justify-center min-h-0 transition-colors cursor-pointer"
              >
                <Bell className="h-[20px] w-[20px]" />
                {hasNotifications && (
                  <span className="absolute top-1 right-1 w-1.5 h-1.5 bg-[#EF4444] rounded-full"></span>
                )}
              </button>

              {showNotifications && (
                <div className="absolute right-0 mt-2 w-80 bg-white rounded-2xl shadow-xl border border-slate-100 overflow-hidden z-50">
                  <div className="p-4 border-b border-slate-100 bg-slate-50 flex justify-between items-center">
                    <h3 className="font-bold text-slate-900">System Notifications</h3>
                  </div>
                  <div className="max-h-[300px] overflow-y-auto">
                    {pendingAgentsCount === 0 && pendingWithdrawalsCount === 0 ? (
                      <div className="p-6 text-center text-slate-500 text-sm">
                        No pending items requiring attention
                      </div>
                    ) : (
                      <div className="divide-y divide-slate-50">
                        {pendingAgentsCount > 0 && (
                          <Link 
                            href="/admin/agents"
                            onClick={() => setShowNotifications(false)}
                            className="p-4 hover:bg-slate-50 transition-colors block text-left"
                          >
                            <p className="text-sm font-medium text-slate-900">
                              Pending Agent Approvals
                            </p>
                            <p className="text-xs text-[#6B7280] mt-1">
                              {pendingAgentsCount} new agent(s) waiting for registration approval.
                            </p>
                          </Link>
                        )}
                        {pendingWithdrawalsCount > 0 && (
                          <Link 
                            href="/admin/withdrawals"
                            onClick={() => setShowNotifications(false)}
                            className="p-4 hover:bg-slate-50 transition-colors block text-left"
                          >
                            <p className="text-sm font-medium text-slate-900">
                              Pending Withdrawals
                            </p>
                            <p className="text-xs text-[#6B7280] mt-1">
                              {pendingWithdrawalsCount} payout request(s) waiting to be processed.
                            </p>
                          </Link>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            <div className="h-5 w-px bg-[#E5E7EB]"></div>

            {/* Profile/Avatar Block */}
            <div className="flex items-center gap-2.5">
              <div className="hidden md:flex flex-col text-right">
                <span className="text-[14px] font-medium text-[#111827] leading-none">{adminName}</span>
                <span className="text-[10px] px-1.5 py-0.5 bg-[#F0FDF4] text-[#15803D] font-semibold rounded-full inline-block self-end mt-1">
                  Super Admin
                </span>
              </div>
              {/* Avatar circle with initials (32px, dark background) */}
              <div className="w-8 h-8 rounded-full bg-[#111827] flex items-center justify-center text-white font-semibold text-xs tracking-wider">
                {adminInitials}
              </div>
            </div>
          </div>
        </header>

        {/* 
          Dynamic Content Page Wrapper - shifting below the header (pt-14)
          Main Content: padding: 24px (lg:p-6), mobile padding: 16px (p-4)
        */}
        <main className="flex-1 pt-14 bg-[#F9FAFB] pb-20 lg:pb-6 overflow-y-auto">
          {children}
        </main>
      </div>

      {/* Mobile Bottom Navigation - Visible ONLY on screens < lg */}
      <div className="lg:hidden fixed bottom-0 inset-x-0 bg-white border-t border-[#E5E7EB] z-30 px-2 py-1">
        <div className="grid grid-cols-5 items-center">
          <Link 
            href="/admin"
            className={`flex flex-col items-center justify-center py-1.5 gap-0.5 text-center transition-colors min-h-0 ${
              isActive("/admin") && pathname === "/admin" ? "text-[#16A34A]" : "text-[#6B7280]"
            }`}
          >
            <BarChart3 className="h-5 w-5" />
            <span className="text-[10px] font-medium">Home</span>
          </Link>
          <Link 
            href="/admin/agents"
            className={`flex flex-col items-center justify-center py-1.5 gap-0.5 text-center transition-colors min-h-0 ${
              isActive("/admin/agents") ? "text-[#16A34A]" : "text-[#6B7280]"
            }`}
          >
            <Users className="h-5 w-5" />
            <span className="text-[10px] font-medium">Agents</span>
          </Link>
          <Link 
            href="/admin/orders"
            className={`flex flex-col items-center justify-center py-1.5 gap-0.5 text-center transition-colors min-h-0 ${
              isActive("/admin/orders") ? "text-[#16A34A]" : "text-[#6B7280]"
            }`}
          >
            <ShoppingBag className="h-5 w-5" />
            <span className="text-[10px] font-medium">Orders</span>
          </Link>
          <Link 
            href="/admin/withdrawals"
            className={`flex flex-col items-center justify-center py-1.5 gap-0.5 text-center transition-colors min-h-0 ${
              isActive("/admin/withdrawals") ? "text-[#16A34A]" : "text-[#6B7280]"
            }`}
          >
            <CreditCard className="h-5 w-5" />
            <span className="text-[10px] font-medium">Payouts</span>
          </Link>
          <button 
            onClick={() => setShowMoreMenu(true)}
            className="flex flex-col items-center justify-center py-1.5 gap-0.5 text-center text-[#6B7280] min-h-0"
          >
            <Menu className="h-5 w-5" />
            <span className="text-[10px] font-medium">More</span>
          </button>
        </div>
      </div>

      {/* Slide-up sheet for "More" options */}
      {showMoreMenu && (
        <div className="lg:hidden fixed inset-0 z-50 bg-black/40 flex flex-col justify-end animate-in fade-in duration-200">
          <div className="bg-white rounded-t-2xl p-5 max-h-[80vh] overflow-y-auto space-y-5 animate-in slide-in-from-bottom-10 duration-300">
            <div className="flex items-center justify-between border-b border-[#E5E7EB] pb-3">
              <h3 className="text-sm font-semibold text-[#111827]">Admin Options</h3>
              <button 
                onClick={() => setShowMoreMenu(false)}
                className="p-1.5 hover:bg-[#F9FAFB] rounded-full flex items-center justify-center"
              >
                <X className="h-5 w-5 text-[#6B7280]" />
              </button>
            </div>
            
            <div className="grid grid-cols-1 gap-1">
              <Link 
                href="/" 
                onClick={() => setShowMoreMenu(false)}
                className="flex items-center gap-3.5 p-3 hover:bg-[#F9FAFB] rounded-xl transition-all font-medium text-[#374151] text-[14px]"
              >
                <Globe className="h-5 w-5 text-[#9CA3AF] shrink-0" />
                Back to Homepage
              </Link>
              <Link 
                href="/admin/bundles" 
                onClick={() => setShowMoreMenu(false)}
                className="flex items-center gap-3.5 p-3 hover:bg-[#F9FAFB] rounded-xl transition-all font-medium text-[#374151] text-[14px]"
              >
                <Package className="h-5 w-5 text-[#9CA3AF] shrink-0" />
                Bundles Inventory
              </Link>
              <Link 
                href="/admin/pricing" 
                onClick={() => setShowMoreMenu(false)}
                className="flex items-center gap-3.5 p-3 hover:bg-[#F9FAFB] rounded-xl transition-all font-medium text-[#374151] text-[14px]"
              >
                <Settings className="h-5 w-5 text-[#9CA3AF] shrink-0" />
                Pricing & Platform Config
              </Link>
              <Link 
                href="/admin/transactions" 
                onClick={() => setShowMoreMenu(false)}
                className="flex items-center gap-3.5 p-3 hover:bg-[#F9FAFB] rounded-xl transition-all font-medium text-[#374151] text-[14px]"
              >
                <List className="h-5 w-5 text-[#9CA3AF] shrink-0" />
                Transactions History
              </Link>
              <Link 
                href="/admin/security" 
                onClick={() => setShowMoreMenu(false)}
                className="flex items-center gap-3.5 p-3 hover:bg-[#F9FAFB] rounded-xl transition-all font-medium text-[#374151] text-[14px]"
              >
                <CreditCard className="h-5 w-5 text-[#9CA3AF] shrink-0" />
                Security Settings
              </Link>
              <Link 
                href="/admin/audit-logs" 
                onClick={() => setShowMoreMenu(false)}
                className="flex items-center gap-3.5 p-3 hover:bg-[#F9FAFB] rounded-xl transition-all font-medium text-[#374151] text-[14px]"
              >
                <Activity className="h-5 w-5 text-[#9CA3AF] shrink-0" />
                System Audit Logs
              </Link>
              <hr className="border-[#E5E7EB] my-1" />
              <button 
                onClick={(e) => {
                  setShowMoreMenu(false);
                  handleLogout(e);
                }}
                className="flex items-center gap-3.5 p-3 hover:bg-red-50 text-[#EF4444] rounded-xl transition-all font-medium text-[14px] w-full text-left cursor-pointer"
              >
                <LogOut className="h-5 w-5 shrink-0" />
                Log Out
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

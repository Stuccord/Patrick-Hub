"use client";

import React, { useState } from "react";
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
  Globe
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [showMoreMenu, setShowMoreMenu] = useState(false);

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
          <div className="w-8 h-8 bg-[#16A34A] rounded-lg flex items-center justify-center text-white font-bold text-base shadow-sm">
            P
          </div>
          <span className="text-base font-semibold text-[#111827] tracking-tight">PatrickHub</span>
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
            href="/admin/pricing" 
            className={`flex items-center gap-3 px-4 py-2.5 rounded-lg text-[14px] transition-colors min-h-0 ${
              isActive("/admin/settings") 
                ? "bg-[#F0FDF4] text-[#16A34A] font-semibold" 
                : "text-[#6B7280] hover:text-[#111827] hover:bg-[#F9FAFB]"
            }`}
          >
            <Settings className="h-[20px] w-[20px] shrink-0" />
            Settings
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
              <div className="w-8 h-8 bg-[#16A34A] rounded-lg flex items-center justify-center text-white font-bold text-base shadow-sm">
                P
              </div>
              <span className="text-base font-semibold text-[#111827] tracking-tight mr-2">PatrickHub</span>
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
            <button className="relative p-1.5 text-[#6B7280] hover:text-[#111827] hover:bg-[#F9FAFB] rounded-lg flex items-center justify-center min-h-0 transition-colors">
              <Bell className="h-[20px] w-[20px]" />
              <span className="absolute top-1 right-1 w-1.5 h-1.5 bg-[#EF4444] rounded-full"></span>
            </button>

            <div className="h-5 w-px bg-[#E5E7EB]"></div>

            {/* Profile/Avatar Block */}
            <div className="flex items-center gap-2.5">
              <div className="hidden md:flex flex-col text-right">
                <span className="text-[14px] font-medium text-[#111827] leading-none">Admin Central</span>
                <span className="text-[10px] px-1.5 py-0.5 bg-[#F0FDF4] text-[#15803D] font-semibold rounded-full inline-block self-end mt-1">
                  Super Admin
                </span>
              </div>
              {/* Avatar circle with initials (32px, dark background) */}
              <div className="w-8 h-8 rounded-full bg-[#111827] flex items-center justify-center text-white font-semibold text-xs tracking-wider">
                AC
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
            href="/admin/bundles"
            className={`flex flex-col items-center justify-center py-1.5 gap-0.5 text-center transition-colors min-h-0 ${
              isActive("/admin/bundles") ? "text-[#16A34A]" : "text-[#6B7280]"
            }`}
          >
            <Package className="h-5 w-5" />
            <span className="text-[10px] font-medium">Bundles</span>
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
                href="#" 
                onClick={() => setShowMoreMenu(false)}
                className="flex items-center gap-3.5 p-3 hover:bg-[#F9FAFB] rounded-xl transition-all font-medium text-[#374151] text-[14px]"
              >
                <CreditCard className="h-5 w-5 text-[#9CA3AF] shrink-0" />
                Security Settings
              </Link>
              <Link 
                href="#" 
                onClick={() => setShowMoreMenu(false)}
                className="flex items-center gap-3.5 p-3 hover:bg-[#F9FAFB] rounded-xl transition-all font-medium text-[#374151] text-[14px]"
              >
                <Activity className="h-5 w-5 text-[#9CA3AF] shrink-0" />
                System Audit Logs
              </Link>
              <hr className="border-[#E5E7EB] my-1" />
              <Link 
                href="/login" 
                onClick={() => setShowMoreMenu(false)}
                className="flex items-center gap-3.5 p-3 hover:bg-red-50 text-[#EF4444] rounded-xl transition-all font-medium text-[14px]"
              >
                <LogOut className="h-5 w-5 shrink-0" />
                Log Out
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

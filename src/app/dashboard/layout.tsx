"use client";

import React, { useState } from "react";
import { 
  LayoutDashboard,
  Package,
  TrendingUp,
  ArrowDownToLine,
  Settings,
  LogOut,
  Bell,
  Menu,
  X,
  Globe
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [showMoreMenu, setShowMoreMenu] = useState(false);

  const isActive = (path: string) => {
    if (path === "/dashboard") return pathname === "/dashboard";
    return pathname.startsWith(path);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col lg:flex-row">
      {/* Desktop Sidebar - Hidden on mobile, visible on desktop */}
      <aside className="hidden lg:flex w-64 bg-white border-r border-slate-200 flex-col h-screen sticky top-0 shrink-0">
        <div className="p-6">
          <Link href="/dashboard" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-brand-primary rounded-lg flex items-center justify-center text-white font-bold">
              P
            </div>
            <span className="text-xl font-bold text-slate-900">PatrickHub</span>
          </Link>
        </div>
        
        <nav className="flex-1 px-4 space-y-1 overflow-y-auto">
          <Link 
            href="/dashboard" 
            className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
              isActive("/dashboard") && pathname === "/dashboard"
                ? "bg-brand-light text-brand-primary font-bold"
                : "text-slate-600 hover:bg-slate-50"
            }`}
          >
            <LayoutDashboard className="h-5 w-5" />
            Dashboard
          </Link>
          <Link 
            href="/dashboard/bundles" 
            className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
              isActive("/dashboard/bundles")
                ? "bg-brand-light text-brand-primary font-bold"
                : "text-slate-600 hover:bg-slate-50"
            }`}
          >
            <Package className="h-5 w-5" />
            My Bundles
          </Link>
          <Link 
            href="/dashboard/orders" 
            className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
              isActive("/dashboard/orders")
                ? "bg-brand-light text-brand-primary font-bold"
                : "text-slate-600 hover:bg-slate-50"
            }`}
          >
            <TrendingUp className="h-5 w-5" />
            Orders
          </Link>
          <Link 
            href="/dashboard/wallet" 
            className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
              isActive("/dashboard/wallet")
                ? "bg-brand-light text-brand-primary font-bold"
                : "text-slate-600 hover:bg-slate-50"
            }`}
          >
            <ArrowDownToLine className="h-5 w-5" />
            Wallet & Payouts
          </Link>
          <Link 
            href="/dashboard/store-settings" 
            className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
              isActive("/dashboard/store-settings")
                ? "bg-brand-light text-brand-primary font-bold"
                : "text-slate-600 hover:bg-slate-50"
            }`}
          >
            <Settings className="h-5 w-5" />
            Store Settings
          </Link>
          <Link 
            href="/" 
            className="flex items-center gap-3 px-4 py-3 rounded-xl transition-all text-slate-600 hover:bg-slate-50"
          >
            <Globe className="h-5 w-5" />
            Back to Homepage
          </Link>
        </nav>

        <div className="p-4 border-t border-slate-100">
          <Link href="/login" className="flex items-center gap-3 px-4 py-3 w-full text-slate-600 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all">
            <LogOut className="h-5 w-5" />
            Logout
          </Link>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 min-w-0 flex flex-col pb-20 lg:pb-0 h-screen overflow-hidden">
        {/* Header - Sticky */}
        <header className="bg-white border-b border-slate-200 px-4 py-4 lg:px-8 shrink-0">
          <div className="flex items-center justify-between">
            <h2 className="text-lg sm:text-xl font-bold text-slate-900">Agent Central</h2>
            <div className="flex items-center gap-3">
              <button className="p-2 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-100 relative flex items-center justify-center">
                <Bell className="h-5 w-5" />
                <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
              </button>
              <Link href="/dashboard/store-settings" className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center text-xs font-bold text-slate-600 hover:ring-2 hover:ring-brand-primary hover:ring-offset-2 transition-all">
                KT
              </Link>
            </div>
          </div>
        </header>

        {/* Dynamic content scrollable area */}
        <div className="flex-1 overflow-y-auto">
          {children}
        </div>
      </main>

      {/* Mobile Bottom Navigation - Visible on screen < lg */}
      <div className="lg:hidden fixed bottom-0 inset-x-0 bg-white border-t border-slate-200 z-50 px-2 py-1">
        <div className="grid grid-cols-5 items-center">
          <Link 
            href="/dashboard"
            className={`flex flex-col items-center justify-center py-2 gap-0.5 text-center transition-colors min-h-[48px] ${
              isActive("/dashboard") && pathname === "/dashboard" ? "text-brand-primary font-bold" : "text-slate-400"
            }`}
          >
            <LayoutDashboard className="h-5 w-5" />
            <span className="text-[10px] font-bold">Home</span>
          </Link>
          <Link 
            href="/dashboard/bundles"
            className={`flex flex-col items-center justify-center py-2 gap-0.5 text-center transition-colors min-h-[48px] ${
              isActive("/dashboard/bundles") ? "text-brand-primary font-bold" : "text-slate-400"
            }`}
          >
            <Package className="h-5 w-5" />
            <span className="text-[10px] font-bold">Bundles</span>
          </Link>
          <Link 
            href="/dashboard/orders"
            className={`flex flex-col items-center justify-center py-2 gap-0.5 text-center transition-colors min-h-[48px] ${
              isActive("/dashboard/orders") ? "text-brand-primary font-bold" : "text-slate-400"
            }`}
          >
            <TrendingUp className="h-5 w-5" />
            <span className="text-[10px] font-bold">Orders</span>
          </Link>
          <Link 
            href="/dashboard/wallet"
            className={`flex flex-col items-center justify-center py-2 gap-0.5 text-center transition-colors min-h-[48px] ${
              isActive("/dashboard/wallet") ? "text-brand-primary font-bold" : "text-slate-400"
            }`}
          >
            <ArrowDownToLine className="h-5 w-5" />
            <span className="text-[10px] font-bold">Wallet</span>
          </Link>
          <button 
            onClick={() => setShowMoreMenu(true)}
            className="flex flex-col items-center justify-center py-2 gap-0.5 text-center text-slate-400 min-h-[48px]"
          >
            <Menu className="h-5 w-5" />
            <span className="text-[10px] font-bold">More</span>
          </button>
        </div>
      </div>

      {/* Slide-up sheet for Agent options */}
      {showMoreMenu && (
        <div className="lg:hidden fixed inset-0 z-50 bg-black/50 flex flex-col justify-end animate-in fade-in duration-200">
          <div className="bg-white rounded-t-[2rem] p-6 max-h-[60vh] overflow-y-auto space-y-6 animate-in slide-in-from-bottom-10 duration-300">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-lg font-black text-slate-900">More Actions</h3>
              <button 
                onClick={() => setShowMoreMenu(false)}
                className="p-2 hover:bg-slate-100 rounded-full flex items-center justify-center"
              >
                <X className="h-6 w-6 text-slate-500" />
              </button>
            </div>
            
            <div className="grid grid-cols-1 gap-2">
              <Link 
                href="/dashboard/store-settings" 
                onClick={() => setShowMoreMenu(false)}
                className="flex items-center gap-4 p-4 hover:bg-slate-50 rounded-xl transition-all font-bold text-slate-700 min-h-[48px]"
              >
                <Settings className="h-5 w-5 text-slate-400 shrink-0" />
                Store Settings
              </Link>
              <Link 
                href="/" 
                onClick={() => setShowMoreMenu(false)}
                className="flex items-center gap-4 p-4 hover:bg-slate-50 rounded-xl transition-all font-bold text-slate-700 min-h-[48px]"
              >
                <Globe className="h-5 w-5 text-slate-400 shrink-0" />
                Back to Homepage
              </Link>
              <hr className="border-slate-100 my-2" />
              <Link 
                href="/login" 
                onClick={() => setShowMoreMenu(false)}
                className="flex items-center gap-4 p-4 hover:bg-red-50 text-red-600 rounded-xl transition-all font-bold min-h-[48px]"
              >
                <LogOut className="h-5 w-5 shrink-0" />
                Logout
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

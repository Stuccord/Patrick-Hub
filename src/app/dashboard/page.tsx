"use client";

import { useEffect, useState } from "react";
import { formatCurrency } from "@/lib/pricing";
import { 
  Wallet, 
  TrendingUp, 
  Users, 
  Share2, 
  Copy,
  ArrowDownToLine,
  ExternalLink
} from "lucide-react";
import Link from "next/link";

export default function AgentDashboard() {
  const [agent, setAgent] = useState<any>({
    name: "Kofi Tech Solutions",
    username: "kofi-tech",
    wallet: 1450.80,
    store_url: "localhost:3000/store/kofi-tech"
  });

  useEffect(() => {
    const current = localStorage.getItem("current_agent");
    if (current) {
      const parsed = JSON.parse(current);
      const dbUsers = JSON.parse(localStorage.getItem("patrickhub_users") || "[]");
      const freshAgent = dbUsers.find((u: any) => u.id === parsed.id) || parsed;
      
      setAgent({
        ...freshAgent,
        store_url: `localhost:3000/store/${freshAgent.username}`
      });
    }
  }, []);

  const handleCopyLink = () => {
    navigator.clipboard.writeText(agent.store_url);
    alert("Store link copied to clipboard!");
  };

  const handleWhatsAppShare = () => {
    const message = encodeURIComponent(`Buy affordable data from my store: http://${agent.store_url}`);
    window.open(`https://api.whatsapp.com/send?text=${message}`, '_blank');
  };

  return (
    <div className="p-4 sm:p-8 space-y-6 max-w-7xl mx-auto pb-24 lg:pb-8">
      {/* Welcome Banner */}
      <div className="bg-slate-900 text-white rounded-3xl p-5 sm:p-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-xl shadow-slate-900/10">
        <div>
          <h1 className="text-xl sm:text-2xl font-black">Welcome back, {agent.name}!</h1>
          <p className="text-slate-400 text-xs sm:text-sm mt-1">Here is a quick overview of your reseller business performance.</p>
        </div>
        <div className="bg-slate-800 px-3.5 py-2 rounded-xl border border-slate-700 font-bold text-xs text-slate-300">
          Agent Status: <span className="text-green-500 font-extrabold capitalize">{agent.status || 'Active'}</span>
        </div>
      </div>

      {/* Stats Grid - Large balance card prominent on mobile */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
        <div className="card-premium relative overflow-hidden group bg-gradient-to-br from-white to-brand-light/35 border-brand-primary/20">
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-110 transition-transform">
            <Wallet className="h-12 w-12" />
          </div>
          <p className="text-xs sm:text-sm font-medium text-slate-500 mb-1">Wallet Balance</p>
          <h3 className="text-2xl sm:text-3xl font-black text-slate-900">{formatCurrency(agent.wallet || 0)}</h3>
          <Link href="/dashboard/wallet" className="mt-4 text-xs font-bold text-brand-primary flex items-center gap-1 hover:underline w-fit min-h-[36px]">
            Request Withdrawal <ArrowDownToLine className="h-3 w-3" />
          </Link>
        </div>

        <div className="card-premium relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-110 transition-transform">
            <TrendingUp className="h-12 w-12" />
          </div>
          <p className="text-xs sm:text-sm font-medium text-slate-500 mb-1">Total Orders</p>
          <h3 className="text-2xl sm:text-3xl font-black text-slate-900">84</h3>
          <Link href="/dashboard/orders" className="mt-4 text-xs font-bold text-brand-primary flex items-center gap-1 hover:underline w-fit min-h-[36px]">
            View All Orders <ArrowDownToLine className="h-3 w-3 -rotate-90" />
          </Link>
        </div>

        <div className="card-premium relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-110 transition-transform">
            <Users className="h-12 w-12" />
          </div>
          <p className="text-xs sm:text-sm font-medium text-slate-500 mb-1">Profit This Month</p>
          <h3 className="text-2xl sm:text-3xl font-black text-brand-primary">{formatCurrency(124.50)}</h3>
          <p className="mt-4 text-[10px] sm:text-xs text-slate-400 font-bold leading-none">+12% from last month</p>
        </div>
      </div>

      {/* Store Link Section */}
      <div className="bg-brand-primary/10 border border-brand-primary/20 rounded-2xl p-5 sm:p-6 space-y-4">
        <div className="space-y-1">
          <h4 className="font-bold text-brand-dark text-base">Your Store is Live!</h4>
          <p className="text-xs sm:text-sm text-brand-primary/80">Share your link to receive mobile money orders from customers.</p>
        </div>
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
          <div className="bg-white px-4 py-3 rounded-xl border border-brand-primary/25 text-xs sm:text-sm font-mono text-slate-600 flex-1 truncate select-all min-h-[48px] flex items-center">
            {agent.store_url}
          </div>
          
          <div className="flex items-center gap-2">
            <button 
              onClick={handleCopyLink}
              className="flex-1 sm:flex-none p-3.5 bg-white text-brand-primary rounded-xl border border-brand-primary/20 hover:bg-brand-primary hover:text-white transition-all min-h-[48px] flex items-center justify-center gap-2 font-bold text-xs" 
              title="Copy Link"
            >
              <Copy className="h-4.5 w-4.5" /> Copy Link
            </button>
            <button 
              onClick={handleWhatsAppShare}
              className="flex-1 sm:flex-none p-3.5 bg-green-500 text-white rounded-xl hover:bg-green-600 transition-all min-h-[48px] flex items-center justify-center gap-1.5 font-bold text-xs px-4" 
              title="Share via WhatsApp"
            >
              <Share2 className="h-4.5 w-4.5" /> WhatsApp
            </button>
            <Link 
              href={`/store/${agent.username}`} 
              target="_blank" 
              className="p-3.5 bg-white text-slate-600 rounded-xl border border-slate-200 hover:bg-slate-50 transition-all min-h-[48px] flex items-center justify-center" 
              title="Visit Store"
            >
              <ExternalLink className="h-4.5 w-4.5" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

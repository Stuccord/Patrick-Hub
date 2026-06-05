"use client";

import { useEffect, useState, useCallback } from "react";
import { formatCurrency } from "@/lib/pricing";
import { 
  Wallet, 
  TrendingUp, 
  Users, 
  Share2, 
  Copy,
  ArrowDownToLine,
  ExternalLink,
  RefreshCw
} from "lucide-react";
import Link from "next/link";
import { createClient } from "@/lib/supabase";

export default function AgentDashboard() {
  const [agent, setAgent] = useState<any>({
    name: "Reseller",
    username: "",
    wallet: 0.00,
    status: "pending",
    store_url: ""
  });
  const [stats, setStats] = useState({
    totalOrders: 0,
    monthlyProfit: 0.00
  });
  const [host, setHost] = useState("");
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastUpdated, setLastUpdated] = useState("");

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setHost(window.location.host);
    }
  }, []);

  const fetchData = useCallback(async (silent = false) => {
    if (!silent) setIsRefreshing(true);
    try {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // 1. Fetch user profile
      const { data: profile, error: profileError } = await supabase
        .from('users')
        .select('*')
        .eq('id', user.id)
        .single();
      
      if (profileError) throw profileError;

      // 2. Fetch wallet
      const { data: wallet, error: walletError } = await supabase
        .from('wallets')
        .select('balance')
        .eq('agent_id', user.id)
        .single();

      // 3. Fetch total completed orders count
      const { count: totalOrders } = await supabase
        .from('orders')
        .select('*', { count: 'exact', head: true })
        .eq('agent_id', user.id)
        .eq('status', 'completed');

      // 4. Fetch monthly profit
      const startOfMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString();
      const { data: monthlyOrders } = await supabase
        .from('orders')
        .select('agent_credited')
        .eq('agent_id', user.id)
        .eq('status', 'completed')
        .gte('created_at', startOfMonth);

      const monthlyProfit = (monthlyOrders || []).reduce((acc, o) => acc + Number(o.agent_credited), 0);

      const username = profile?.username || "";
      setAgent({
        name: profile?.name || "Reseller",
        username: username,
        wallet: Number(wallet?.balance || 0),
        status: profile?.status || "pending",
        store_url: username ? `${host || 'localhost:3000'}/store/${username}` : ""
      });

      setStats({
        totalOrders: totalOrders || 0,
        monthlyProfit
      });
    } catch (err) {
      console.error("Error loading agent dashboard stats:", err);
    } finally {
      setIsRefreshing(false);
      setLastUpdated(new Date().toLocaleTimeString());
    }
  }, [host]);

  useEffect(() => {
    if (host) {
      fetchData();
      const interval = setInterval(() => fetchData(true), 30000);
      return () => clearInterval(interval);
    }
  }, [host, fetchData]);

  const handleCopyLink = () => {
    if (!agent.store_url) return;
    navigator.clipboard.writeText(`http://${agent.store_url}`);
    alert("Store link copied to clipboard!");
  };

  const handleWhatsAppShare = () => {
    if (!agent.store_url) return;
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
          {lastUpdated && <p className="text-slate-500 text-[10px] mt-1">Last updated: {lastUpdated}</p>}
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => fetchData()}
            disabled={isRefreshing}
            className="p-2 rounded-lg bg-slate-800 border border-slate-700 text-slate-400 hover:text-white transition-colors disabled:opacity-50"
            title="Refresh"
          >
            <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
          </button>
          <div className="bg-slate-800 px-3.5 py-2 rounded-xl border border-slate-700 font-bold text-xs text-slate-300">
            Agent Status: <span className={`font-extrabold capitalize ${agent.status === 'active' ? 'text-green-500' : 'text-amber-500'}`}>{agent.status || 'Pending'}</span>
          </div>
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
          <h3 className="text-2xl sm:text-3xl font-black text-slate-900">{stats.totalOrders}</h3>
          <Link href="/dashboard/orders" className="mt-4 text-xs font-bold text-brand-primary flex items-center gap-1 hover:underline w-fit min-h-[36px]">
            View All Orders <ArrowDownToLine className="h-3 w-3 -rotate-90" />
          </Link>
        </div>

        <div className="card-premium relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-110 transition-transform">
            <Users className="h-12 w-12" />
          </div>
          <p className="text-xs sm:text-sm font-medium text-slate-500 mb-1">Profit This Month</p>
          <h3 className="text-2xl sm:text-3xl font-black text-brand-primary">{formatCurrency(stats.monthlyProfit)}</h3>
          <p className="mt-4 text-[10px] sm:text-xs text-slate-400 font-bold leading-none">Net reseller earnings</p>
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
            {agent.store_url || "Generating store link..."}
          </div>
          
          <div className="flex items-center gap-2">
            <button 
              onClick={handleCopyLink}
              disabled={!agent.store_url}
              className="flex-1 sm:flex-none p-3.5 bg-white text-brand-primary rounded-xl border border-brand-primary/20 hover:bg-brand-primary hover:text-white transition-all min-h-[48px] flex items-center justify-center gap-2 font-bold text-xs disabled:opacity-50 cursor-pointer" 
              title="Copy Link"
            >
              <Copy className="h-4.5 w-4.5" /> Copy Link
            </button>
            <button 
              onClick={handleWhatsAppShare}
              disabled={!agent.store_url}
              className="flex-1 sm:flex-none p-3.5 bg-green-500 text-white rounded-xl hover:bg-green-600 transition-all min-h-[48px] flex items-center justify-center gap-1.5 font-bold text-xs px-4 disabled:opacity-50 cursor-pointer" 
              title="Share via WhatsApp"
            >
              <Share2 className="h-4.5 w-4.5" /> WhatsApp
            </button>
            {agent.username && (
              <Link 
                href={`/store/${agent.username}`} 
                target="_blank" 
                className="p-3.5 bg-white text-slate-600 rounded-xl border border-slate-200 hover:bg-slate-50 transition-all min-h-[48px] flex items-center justify-center" 
                title="Visit Store"
              >
                <ExternalLink className="h-4.5 w-4.5" />
              </Link>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

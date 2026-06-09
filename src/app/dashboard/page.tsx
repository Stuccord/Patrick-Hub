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
  RefreshCw,
  CheckCircle2,
  Clock,
  XCircle,
  ArrowRight,
  BarChart2
} from "lucide-react";
import Link from "next/link";
import { createClient } from "@/lib/supabase";
import { format } from "date-fns";

interface AgentData {
  name: string;
  username: string;
  wallet: number;
  status: string;
  store_url: string;
}

interface Order {
  id: string;
  reference: string;
  created_at: string;
  customer_phone: string;
  customer_paid: number;
  platform_fee: number;
  agent_credited: number;
  status: string;
  bundles?: { name: string } | null;
}

export default function AgentDashboard() {
  const [agent, setAgent] = useState<AgentData>({
    name: "Reseller",
    username: "",
    wallet: 0.00,
    status: "pending",
    store_url: ""
  });
  const [stats, setStats] = useState({
    totalOrders: 0,
    completedOrders: 0,
    totalProfit: 0.00,
    monthlyProfit: 0.00
  });
  const [recentOrders, setRecentOrders] = useState<Order[]>([]);
  const [pendingWithdrawals, setPendingWithdrawals] = useState(0);
  const [host, setHost] = useState("");
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastUpdated, setLastUpdated] = useState("");

  useEffect(() => {
    if (typeof window !== 'undefined') {
      // eslint-disable-next-line react-hooks/set-state-in-effect
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
      const { data: wallet } = await supabase
        .from('wallets')
        .select('balance')
        .eq('agent_id', user.id)
        .single();

      // 3. Fetch total completed orders count
      const { count: completedOrders } = await supabase
        .from('orders')
        .select('*', { count: 'exact', head: true })
        .eq('agent_id', user.id)
        .eq('status', 'completed');

      // 4. Fetch total orders count (all statuses)
      const { count: totalOrders } = await supabase
        .from('orders')
        .select('*', { count: 'exact', head: true })
        .eq('agent_id', user.id);

      // 5. Fetch monthly profit
      const startOfMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString();
      const { data: monthlyOrders } = await supabase
        .from('orders')
        .select('agent_credited')
        .eq('agent_id', user.id)
        .eq('status', 'completed')
        .gte('created_at', startOfMonth);

      const monthlyProfit = (monthlyOrders || []).reduce((acc, o) => acc + Number(o.agent_credited), 0);

      // 6. Fetch all-time total profit
      const { data: allOrders } = await supabase
        .from('orders')
        .select('agent_credited')
        .eq('agent_id', user.id)
        .eq('status', 'completed');

      const totalProfit = (allOrders || []).reduce((acc, o) => acc + Number(o.agent_credited), 0);

      // 7. Fetch recent 5 orders for quick display
      const { data: recent } = await supabase
        .from('orders')
        .select('*, bundles(name)')
        .eq('agent_id', user.id)
        .order('created_at', { ascending: false })
        .limit(5);

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const mappedRecent = (recent || []).map((o: any) => ({
        ...o,
        customer_paid: Number(o.customer_paid),
        platform_fee: Number(o.platform_fee),
        agent_credited: Number(o.agent_credited)
      }));

      setRecentOrders(mappedRecent as unknown as Order[]);

      // 8. Fetch pending withdrawals count
      const { count: pendingW } = await supabase
        .from('withdrawals')
        .select('*', { count: 'exact', head: true })
        .eq('agent_id', user.id)
        .eq('status', 'pending');

      setPendingWithdrawals(pendingW || 0);

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
        completedOrders: completedOrders || 0,
        totalProfit,
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
      // eslint-disable-next-line react-hooks/set-state-in-effect
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

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-4">
        <div className="card-premium relative overflow-hidden group bg-gradient-to-br from-white to-brand-light/35 border-brand-primary/20">
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-110 transition-transform">
            <Wallet className="h-12 w-12" />
          </div>
          <p className="text-xs font-medium text-slate-500 mb-1">Wallet Balance</p>
          <h3 className="text-xl sm:text-2xl font-black text-slate-900">{formatCurrency(agent.wallet || 0)}</h3>
          {pendingWithdrawals > 0 && (
            <p className="text-amber-500 text-[10px] font-bold mt-1">{pendingWithdrawals} payout pending</p>
          )}
          <Link href="/dashboard/wallet" className="mt-3 text-xs font-bold text-brand-primary flex items-center gap-1 hover:underline w-fit min-h-[36px]">
            Request Withdrawal <ArrowDownToLine className="h-3 w-3" />
          </Link>
        </div>

        <div className="card-premium relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-110 transition-transform">
            <TrendingUp className="h-12 w-12" />
          </div>
          <p className="text-xs font-medium text-slate-500 mb-1">Total Orders</p>
          <h3 className="text-xl sm:text-2xl font-black text-slate-900">{stats.totalOrders}</h3>
          <p className="text-[10px] text-slate-400 font-medium mt-1">{stats.completedOrders} completed</p>
          <Link href="/dashboard/orders" className="mt-3 text-xs font-bold text-brand-primary flex items-center gap-1 hover:underline w-fit min-h-[36px]">
            View All Orders <ArrowRight className="h-3 w-3" />
          </Link>
        </div>

        <div className="card-premium relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-110 transition-transform">
            <Users className="h-12 w-12" />
          </div>
          <p className="text-xs font-medium text-slate-500 mb-1">Profit This Month</p>
          <h3 className="text-xl sm:text-2xl font-black text-brand-primary">{formatCurrency(stats.monthlyProfit)}</h3>
          <p className="text-[10px] text-slate-400 font-medium mt-1">Net reseller earnings</p>
        </div>

        <div className="card-premium relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-110 transition-transform">
            <BarChart2 className="h-12 w-12" />
          </div>
          <p className="text-xs font-medium text-slate-500 mb-1">All-Time Profit</p>
          <h3 className="text-xl sm:text-2xl font-black text-slate-900">{formatCurrency(stats.totalProfit)}</h3>
          <p className="text-[10px] text-slate-400 font-medium mt-1">Since account opened</p>
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

      {/* Recent Orders — Track Record */}
      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
        <div className="px-5 sm:px-6 py-4 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h3 className="font-bold text-slate-900 text-base">Recent Sales Record</h3>
            <p className="text-xs text-slate-400 mt-0.5">Your last 5 customer transactions</p>
          </div>
          <Link 
            href="/dashboard/orders" 
            className="text-xs font-bold text-brand-primary flex items-center gap-1 hover:underline"
          >
            View All <ArrowRight className="h-3 w-3" />
          </Link>
        </div>

        {recentOrders.length === 0 ? (
          <div className="p-10 text-center">
            <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <TrendingUp className="w-5 h-5 text-slate-400" />
            </div>
            <p className="text-slate-400 font-medium text-sm">No orders yet.</p>
            <p className="text-slate-400 text-xs mt-1">Share your store link to start receiving orders.</p>
          </div>
        ) : (
          <>
            {/* Desktop table */}
            <div className="hidden sm:block overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-slate-50 border-b border-slate-100">
                  <tr>
                    <th className="px-5 py-3 text-xs font-bold text-slate-500 uppercase tracking-wider">Date</th>
                    <th className="px-5 py-3 text-xs font-bold text-slate-500 uppercase tracking-wider">Customer</th>
                    <th className="px-5 py-3 text-xs font-bold text-slate-500 uppercase tracking-wider">Bundle</th>
                    <th className="px-5 py-3 text-xs font-bold text-slate-500 uppercase tracking-wider text-right">Paid</th>
                    <th className="px-5 py-3 text-xs font-bold text-slate-500 uppercase tracking-wider text-right">Your Profit</th>
                    <th className="px-5 py-3 text-xs font-bold text-slate-500 uppercase tracking-wider text-center">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {recentOrders.map((order) => (
                    <tr key={order.id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-5 py-3.5 text-slate-500 text-xs whitespace-nowrap">
                        {format(new Date(order.created_at), "MMM d, HH:mm")}
                      </td>
                      <td className="px-5 py-3.5 text-slate-700 font-medium text-xs">{order.customer_phone}</td>
                      <td className="px-5 py-3.5 text-slate-900 font-medium text-xs">{order.bundles?.name || 'Unknown Bundle'}</td>
                      <td className="px-5 py-3.5 text-right font-bold text-slate-900 text-xs">{formatCurrency(order.customer_paid)}</td>
                      <td className="px-5 py-3.5 text-right font-black text-brand-primary text-xs">{formatCurrency(order.agent_credited)}</td>
                      <td className="px-5 py-3.5 text-center">
                        {order.status === 'completed' && (
                          <span className="inline-flex items-center gap-1 text-green-700 bg-green-100 px-2.5 py-0.5 rounded-full text-[10px] font-bold">
                            <CheckCircle2 className="w-3 h-3" /> Done
                          </span>
                        )}
                        {order.status === 'pending' && (
                          <span className="inline-flex items-center gap-1 text-amber-700 bg-amber-100 px-2.5 py-0.5 rounded-full text-[10px] font-bold">
                            <Clock className="w-3 h-3" /> Pending
                          </span>
                        )}
                        {order.status === 'failed' && (
                          <span className="inline-flex items-center gap-1 text-red-700 bg-red-100 px-2.5 py-0.5 rounded-full text-[10px] font-bold">
                            <XCircle className="w-3 h-3" /> Failed
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile card list */}
            <div className="sm:hidden divide-y divide-slate-100">
              {recentOrders.map((order) => (
                <div key={order.id} className="p-4 space-y-2">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="text-xs font-bold text-slate-900">{order.bundles?.name || 'Bundle'}</p>
                      <p className="text-[10px] text-slate-400 mt-0.5">{order.customer_phone} · {format(new Date(order.created_at), "MMM d, HH:mm")}</p>
                    </div>
                    {order.status === 'completed' && (
                      <span className="text-green-700 bg-green-100 px-2 py-0.5 rounded-full text-[10px] font-bold">Done</span>
                    )}
                    {order.status === 'pending' && (
                      <span className="text-amber-700 bg-amber-100 px-2 py-0.5 rounded-full text-[10px] font-bold">Pending</span>
                    )}
                    {order.status === 'failed' && (
                      <span className="text-red-700 bg-red-100 px-2 py-0.5 rounded-full text-[10px] font-bold">Failed</span>
                    )}
                  </div>
                  <div className="flex items-center justify-between bg-slate-50 rounded-xl p-2.5 text-xs">
                    <span className="text-slate-500">Customer paid: <span className="font-bold text-slate-800">{formatCurrency(order.customer_paid)}</span></span>
                    <span className="text-brand-primary font-black">+{formatCurrency(order.agent_credited)}</span>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

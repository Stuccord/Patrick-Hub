"use client";

import React, { useEffect, useState } from "react";
import { 
  Activity, 
  Search, 
  RefreshCw, 
  UserPlus, 
  ShoppingBag, 
  CreditCard, 
  Settings, 
  CheckCircle2, 
  XCircle, 
  AlertTriangle,
  Info
} from "lucide-react";
import { formatCurrency } from "@/lib/pricing";
import { createClient } from "@/lib/supabase";

interface AuditLogItem {
  id: string;
  timestamp: string;
  category: "agent" | "order" | "payout" | "system";
  action: string;
  details: string;
  status: "success" | "warning" | "info" | "error";
}

interface DBOrder {
  reference: string;
  customer_phone: string;
  customer_paid: string | number;
  status: string;
  created_at: string;
  bundles: { name: string } | null;
}

interface DBWithdrawal {
  id: string;
  amount_requested: string | number;
  status: string;
  created_at: string;
  users: { name: string } | null;
}

export default function AdminAuditLogs() {
  const [logs, setLogs] = useState<AuditLogItem[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string>("All");
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchLogs = async (showRefreshing = false) => {
    try {
      if (showRefreshing) setRefreshing(true);
      const supabase = createClient();

      // Fetch dynamic logs from users, orders, withdrawals, and platform_config
      const [agentsRes, ordersRes, withdrawalsRes, configRes] = await Promise.all([
        supabase
          .from("users")
          .select("id, name, created_at")
          .eq("role", "agent"),
        supabase
          .from("orders")
          .select("reference, customer_phone, customer_paid, status, created_at, bundles(name)"),
        supabase
          .from("withdrawals")
          .select("id, amount_requested, status, created_at, users(name)"),
        supabase
          .from("platform_config")
          .select("key, updated_at")
      ]);

      const mappedLogs: AuditLogItem[] = [];

      // 1. Map sub-agents registrations
      if (agentsRes.data) {
        agentsRes.data.forEach((agent) => {
          mappedLogs.push({
            id: `REG-${agent.id.substring(0, 8).toUpperCase()}`,
            timestamp: agent.created_at,
            category: "agent",
            action: "New Agent Registered",
            details: `Agent "${agent.name}" registered a reseller store account.`,
            status: "info"
          });
        });
      }

      // 2. Map orders
      if (ordersRes.data) {
        ((ordersRes.data || []) as unknown as DBOrder[]).forEach((order) => {
          const statusMap: Record<string, { action: string; status: "success" | "error" | "info" }> = {
            completed: { action: "Order Delivered", status: "success" },
            failed: { action: "Order Delivery Failed", status: "error" },
            pending: { action: "Order Placed", status: "info" }
          };
          const info = statusMap[order.status] || { action: "Order Processed", status: "info" };

          mappedLogs.push({
            id: order.reference || `ORD-${order.customer_phone}`,
            timestamp: order.created_at,
            category: "order",
            action: info.action,
            details: `Customer ${order.customer_phone} purchased "${order.bundles?.name || 'Data Bundle'}" for ${formatCurrency(Number(order.customer_paid))}.`,
            status: info.status
          });
        });
      }

      // 3. Map withdrawals
      if (withdrawalsRes.data) {
        ((withdrawalsRes.data || []) as unknown as DBWithdrawal[]).forEach((w) => {
          const statusMap: Record<string, { action: string; status: "success" | "error" | "warning" }> = {
            approved: { action: "Payout Approved", status: "success" },
            rejected: { action: "Payout Request Rejected", status: "error" },
            pending: { action: "Payout Requested", status: "warning" }
          };
          const info = statusMap[w.status] || { action: "Payout Processed", status: "info" };

          mappedLogs.push({
            id: `WD-${w.id.substring(0, 8).toUpperCase()}`,
            timestamp: w.created_at,
            category: "payout",
            action: info.action,
            details: `Reseller "${w.users?.name || 'Partner'}" requested GHS ${Number(w.amount_requested).toFixed(2)} withdrawal payout.`,
            status: info.status
          });
        });
      }

      // 4. Map settings configuration
      if (configRes.data) {
        configRes.data.forEach((c) => {
          mappedLogs.push({
            id: `CFG-${c.key.toUpperCase()}`,
            timestamp: c.updated_at || new Date().toISOString(),
            category: "system",
            action: "Platform Config Modified",
            details: `System key "${c.key}" fee settings refreshed.`,
            status: "info"
          });
        });
      }

      // Sort logs chronologically descending
      const sortedLogs = mappedLogs.sort((a, b) => {
        return new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime();
      });

      setLogs(sortedLogs);
    } catch (err) {
      console.error("[Audit Logs] Error fetching log records:", err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchLogs();
  }, []);

  const filteredLogs = logs.filter((log) => {
    const matchesSearch = 
      log.action.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.details.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.id.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesCategory = 
      categoryFilter === "All" || 
      log.category === categoryFilter.toLowerCase();

    return matchesSearch && matchesCategory;
  });

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case "agent": return <UserPlus className="w-4 h-4 text-blue-500" />;
      case "order": return <ShoppingBag className="w-4 h-4 text-[#16A34A]" />;
      case "payout": return <CreditCard className="w-4 h-4 text-purple-500" />;
      default: return <Settings className="w-4 h-4 text-slate-500" />;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "success": return <CheckCircle2 className="w-4 h-4 text-[#15803D]" />;
      case "error": return <XCircle className="w-4 h-4 text-red-600" />;
      case "warning": return <AlertTriangle className="w-4 h-4 text-amber-600" />;
      default: return <Info className="w-4 h-4 text-blue-600" />;
    }
  };

  const getStatusClass = (status: string) => {
    switch (status) {
      case "success": return "bg-[#F0FDF4] text-[#15803D] border-[#DCFCE7]";
      case "error": return "bg-red-50 text-red-700 border-red-100";
      case "warning": return "bg-amber-50 text-amber-800 border-amber-100";
      default: return "bg-blue-50 text-blue-700 border-blue-100";
    }
  };

  return (
    <div className="p-4 sm:p-6 max-w-[1000px] mx-auto space-y-6 pb-24 lg:pb-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-[20px] font-semibold text-[#111827] tracking-tight leading-none shrink-0 flex items-center gap-2">
            <Activity className="w-5 h-5 text-[#16A34A]" /> System Audit Logs
          </h1>
          <p className="text-[12px] text-[#9CA3AF] mt-1.5">
            Real-time security logs and chronological activities performed across the platform.
          </p>
        </div>
        <button
          onClick={() => fetchLogs(true)}
          disabled={refreshing}
          className="flex items-center gap-2 h-9 px-3.5 bg-white border border-[#E5E7EB] rounded-lg text-[13px] font-medium text-[#374151] hover:bg-[#F9FAFB] active:scale-95 transition-all disabled:opacity-50 cursor-pointer shrink-0 shadow-sm"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? "animate-spin" : ""}`} />
          <span>Refresh Logs</span>
        </button>
      </div>

      {/* Filter Bar */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#9CA3AF]" />
          <input
            type="text"
            placeholder="Search action details, ID, or agent reference..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 border border-[#E5E7EB] rounded-lg text-[13.5px] text-[#374151] focus:ring-2 focus:ring-[#16A34A] focus:border-transparent outline-none bg-white placeholder-[#9CA3AF] transition-colors"
          />
        </div>
        <div className="flex gap-2 overflow-x-auto pb-1.5 sm:pb-0 scrollbar-none">
          {["All", "Agent", "Order", "Payout", "System"].map((cat) => (
            <button
              key={cat}
              onClick={() => setCategoryFilter(cat)}
              className={`px-3 py-1.5 rounded-lg text-[12px] font-semibold border transition-all cursor-pointer whitespace-nowrap ${
                categoryFilter === cat
                  ? "bg-[#16A34A] text-white border-[#16A34A] shadow-sm"
                  : "bg-white text-[#4B5563] border-[#E5E7EB] hover:bg-[#F9FAFB]"
              }`}
            >
              {cat}s
            </button>
          ))}
        </div>
      </div>

      {/* Logs Timeline */}
      <div className="bg-white border border-[#E5E7EB] rounded-xl shadow-[0_1px_3px_rgba(0,0,0,0.05)] overflow-hidden">
        {loading ? (
          <div className="p-10 text-center text-slate-400 text-[13px] flex flex-col items-center gap-2">
            <RefreshCw className="w-5 h-5 animate-spin text-[#16A34A]" />
            <span>Compiling system log files...</span>
          </div>
        ) : filteredLogs.length === 0 ? (
          <div className="p-12 text-center text-slate-400 text-[13px]">
            No matching security logs or transaction events found.
          </div>
        ) : (
          <div className="divide-y divide-[#E5E7EB]">
            {filteredLogs.map((log) => (
              <div key={log.id} className="p-4 sm:p-5 flex gap-3.5 hover:bg-[#F9FAFB] transition-colors items-start">
                <div className="w-8 h-8 rounded-lg bg-slate-50 border border-slate-100 flex items-center justify-center shrink-0 mt-0.5 shadow-sm">
                  {getCategoryIcon(log.category)}
                </div>
                <div className="flex-1 min-w-0 space-y-1.5">
                  <div className="flex flex-wrap items-center justify-between gap-x-3 gap-y-1">
                    <h4 className="font-bold text-[#111827] text-[13.5px] leading-none">
                      {log.action}
                    </h4>
                    <span className="text-[10.5px] text-[#9CA3AF] font-medium leading-none">
                      {new Date(log.timestamp).toLocaleString()}
                    </span>
                  </div>
                  <p className="text-[12.5px] text-[#4B5563] leading-relaxed font-medium">
                    {log.details}
                  </p>
                  
                  <div className="flex flex-wrap items-center gap-2 pt-0.5">
                    <span className="text-[10px] font-mono text-[#9CA3AF] select-all bg-slate-50 border border-slate-100 rounded px-1.5 py-0.5">
                      REF: {log.id}
                    </span>
                    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold border uppercase tracking-wide leading-none ${getStatusClass(log.status)}`}>
                      {getStatusIcon(log.status)}
                      <span>{log.status === "info" ? "neutral" : log.status}</span>
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

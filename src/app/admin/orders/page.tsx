"use client";

import { useEffect, useState } from "react";
import { formatCurrency } from "@/lib/pricing";
import {
  Search,
  CheckCircle2,
  Clock,
  XCircle,
  ShoppingBag,
  RefreshCw,
  Truck,
  Ban,
} from "lucide-react";
import { createClient } from "@/lib/supabase";
import { format } from "date-fns";

type Order = {
  id: string;
  reference: string;
  created_at: string;
  customer_phone: string;
  customer_network: string | null;
  customer_paid: number;
  agent_credited: number;
  platform_fee: number;
  status: "pending" | "completed" | "failed";
  bundles: { name: string; network: string } | null;
  users: { name: string; username: string } | null;
};

const NETWORK_COLORS: Record<string, string> = {
  MTN: "bg-yellow-100 text-yellow-800 border-yellow-200",
  Vodafone: "bg-red-100 text-red-800 border-red-200",
  AirtelTigo: "bg-blue-100 text-blue-800 border-blue-200",
};

export default function AdminOrders() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [actionLoading, setActionLoading] = useState<Record<string, boolean>>({});

  const fetchOrders = async (showRefreshing = false) => {
    try {
      if (showRefreshing) setRefreshing(true);
      const supabase = createClient();
      const { data, error } = await supabase
        .from("orders")
        .select("*, bundles(name, network), users(name, username)")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setOrders((data as Order[]) || []);
    } catch (err) {
      console.error("Error fetching orders:", err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchOrders();
  }, []);

  const handleOrderAction = async (orderId: string, action: 'deliver' | 'fail') => {
    const label = action === 'deliver' ? 'deliver' : 'mark as failed';
    if (!confirm(`Are you sure you want to ${label} this order?`)) return;

    setActionLoading((prev) => ({ ...prev, [orderId]: true }));
    try {
      const res = await fetch('/api/admin/deliver-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderId, action }),
      });
      const data = await res.json();
      if (!res.ok) {
        alert(`Error: ${data.error ?? 'Unknown error'}`);
      } else {
        await fetchOrders();
      }
    } catch (err) {
      console.error(err);
      alert('Network error. Please try again.');
    } finally {
      setActionLoading((prev) => ({ ...prev, [orderId]: false }));
    }
  };

  const filteredOrders = orders.filter((order) => {
    const matchesSearch =
      order.reference.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.customer_phone.includes(searchTerm) ||
      (order.users?.name || "").toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus =
      statusFilter === "All" ||
      (statusFilter === "Completed" && order.status === "completed") ||
      (statusFilter === "Pending" && order.status === "pending") ||
      (statusFilter === "Failed" && order.status === "failed");
    return matchesSearch && matchesStatus;
  });

  const totals = {
    revenue: filteredOrders.reduce((s, o) => s + Number(o.customer_paid), 0),
    fees: filteredOrders.reduce((s, o) => s + Number(o.platform_fee), 0),
    count: filteredOrders.length,
  };

  const networkLabel = (order: Order) =>
    order.customer_network || order.bundles?.network || "—";

  return (
    <div className="p-4 sm:p-6 max-w-[1200px] mx-auto space-y-6 pb-24 lg:pb-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-[20px] font-semibold text-[#111827] tracking-tight">
            All Orders
          </h1>
          <p className="text-[13px] text-[#6B7280] mt-0.5">
            Every purchase across all agent stores — fulfill bundles here.
          </p>
        </div>
        <button
          onClick={() => fetchOrders(true)}
          disabled={refreshing}
          className="flex items-center gap-2 h-9 px-4 bg-white border border-[#E5E7EB] rounded-lg text-[13px] font-medium text-[#374151] hover:bg-[#F9FAFB] transition-all disabled:opacity-50 cursor-pointer shrink-0"
        >
          <RefreshCw className={`h-4 w-4 ${refreshing ? "animate-spin" : ""}`} />
          Refresh
        </button>
      </div>

      {/* Summary Chips */}
      <div className="flex flex-wrap gap-3">
        <div className="bg-white border border-[#E5E7EB] rounded-xl px-4 py-3 flex items-center gap-3 shadow-[0_1px_3px_rgba(0,0,0,0.06)]">
          <ShoppingBag className="h-4 w-4 text-[#16A34A]" />
          <div>
            <p className="text-[10px] uppercase tracking-wider text-[#6B7280] font-semibold">
              Showing
            </p>
            <p className="text-[15px] font-bold text-[#111827]">
              {totals.count} orders
            </p>
          </div>
        </div>
        <div className="bg-white border border-[#E5E7EB] rounded-xl px-4 py-3 shadow-[0_1px_3px_rgba(0,0,0,0.06)]">
          <p className="text-[10px] uppercase tracking-wider text-[#6B7280] font-semibold">
            Revenue
          </p>
          <p className="text-[15px] font-bold text-[#111827]">
            {formatCurrency(totals.revenue)}
          </p>
        </div>
        <div className="bg-white border border-[#E5E7EB] rounded-xl px-4 py-3 shadow-[0_1px_3px_rgba(0,0,0,0.06)]">
          <p className="text-[10px] uppercase tracking-wider text-[#6B7280] font-semibold">
            Platform Fees
          </p>
          <p className="text-[15px] font-bold text-[#16A34A]">
            {formatCurrency(totals.fees)}
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#9CA3AF]" />
          <input
            type="text"
            placeholder="Search reference, phone, or agent name..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 border border-[#E5E7EB] rounded-lg text-[14px] focus:ring-2 focus:ring-[#16A34A] outline-none bg-white"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="appearance-none px-4 py-2 border border-[#E5E7EB] rounded-lg text-[14px] font-medium focus:ring-2 focus:ring-[#16A34A] outline-none bg-white cursor-pointer"
        >
          <option value="All">All Statuses</option>
          <option value="Completed">Completed</option>
          <option value="Pending">Pending</option>
          <option value="Failed">Failed</option>
        </select>
      </div>

      {/* Orders Table */}
      <div className="bg-white border border-[#E5E7EB] rounded-xl shadow-[0_1px_3px_rgba(0,0,0,0.06)] overflow-hidden">
        {/* Desktop Table */}
        <div className="hidden lg:block overflow-x-auto">
          <table className="w-full text-left text-[13px]">
            <thead className="bg-[#F9FAFB] border-b border-[#E5E7EB] text-[#6B7280]">
              <tr>
                <th className="px-5 py-4 font-semibold">Reference</th>
                <th className="px-5 py-4 font-semibold">Date</th>
                <th className="px-5 py-4 font-semibold">Agent</th>
                <th className="px-5 py-4 font-semibold">Bundle</th>
                <th className="px-5 py-4 font-semibold">Recipient</th>
                <th className="px-5 py-4 font-semibold">Network</th>
                <th className="px-5 py-4 font-semibold text-right">Paid</th>
                <th className="px-5 py-4 font-semibold text-center">Status</th>
                <th className="px-5 py-4 font-semibold text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F3F4F6]">
              {loading ? (
                <tr>
                  <td
                    colSpan={8}
                    className="px-5 py-10 text-center text-[#9CA3AF]"
                  >
                    Loading orders...
                  </td>
                </tr>
              ) : filteredOrders.length === 0 ? (
                <tr>
                  <td
                    colSpan={9}
                    className="px-5 py-10 text-center text-[#9CA3AF]"
                  >
                    No orders found.
                  </td>
                </tr>
              ) : (
                filteredOrders.map((order) => {
                  const net = networkLabel(order);
                  return (
                    <tr
                      key={order.id}
                      className="hover:bg-[#F9FAFB] transition-colors"
                    >
                      <td className="px-5 py-3.5 font-mono font-semibold text-[#111827] text-[12px]">
                        {order.reference.slice(-10)}
                      </td>
                      <td className="px-5 py-3.5 text-[#6B7280]">
                        {format(new Date(order.created_at), "MMM d, HH:mm")}
                      </td>
                      <td className="px-5 py-3.5 font-medium text-[#111827]">
                        {order.users?.name || "Unknown"}
                      </td>
                      <td className="px-5 py-3.5 text-[#374151]">
                        {order.bundles?.name || "—"}
                      </td>
                      <td className="px-5 py-3.5 font-medium text-[#111827]">
                        {order.customer_phone}
                      </td>
                      <td className="px-5 py-3.5">
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase border ${
                            NETWORK_COLORS[net] ||
                            "bg-slate-100 text-slate-600 border-slate-200"
                          }`}
                        >
                          {net}
                        </span>
                      </td>
                      <td className="px-5 py-3.5 text-right">
                        <div className="font-bold text-[#16A34A]">
                          {formatCurrency(order.customer_paid)}
                        </div>
                        <div className="text-[11px] text-[#9CA3AF]">
                          Fee: {formatCurrency(order.platform_fee)}
                        </div>
                      </td>
                      <td className="px-5 py-3.5">
                        <div className="flex justify-center">
                          {order.status === "completed" && (
                            <span className="flex items-center gap-1.5 text-[#15803D] bg-[#F0FDF4] px-2.5 py-1 rounded-full text-[11px] font-semibold">
                              <CheckCircle2 className="w-3 h-3" /> Delivered
                            </span>
                          )}
                          {order.status === "pending" && (
                            <span className="flex items-center gap-1.5 text-amber-700 bg-amber-50 px-2.5 py-1 rounded-full text-[11px] font-semibold">
                              <Clock className="w-3 h-3" /> Pending
                            </span>
                          )}
                          {order.status === "failed" && (
                            <span className="flex items-center gap-1.5 text-red-700 bg-red-50 px-2.5 py-1 rounded-full text-[11px] font-semibold">
                              <XCircle className="w-3 h-3" /> Failed
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-5 py-3.5">
                        {order.status === "pending" && (
                          <div className="flex items-center justify-center gap-1.5">
                            <button
                              onClick={() => handleOrderAction(order.id, 'deliver')}
                              disabled={actionLoading[order.id]}
                              className="flex items-center gap-1 h-7 px-2.5 bg-[#16A34A] hover:bg-[#15803D] text-white rounded-md text-[11px] font-semibold transition-colors disabled:opacity-50 cursor-pointer"
                              title="Deliver via Cheap Gigz"
                            >
                              <Truck className="w-3 h-3" />
                              {actionLoading[order.id] ? '...' : 'Deliver'}
                            </button>
                            <button
                              onClick={() => handleOrderAction(order.id, 'fail')}
                              disabled={actionLoading[order.id]}
                              className="flex items-center gap-1 h-7 px-2.5 bg-white hover:bg-red-50 border border-[#E5E7EB] hover:border-red-300 text-red-600 rounded-md text-[11px] font-semibold transition-colors disabled:opacity-50 cursor-pointer"
                              title="Mark as Failed"
                            >
                              <Ban className="w-3 h-3" />
                              Fail
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Mobile Cards */}
        <div className="lg:hidden divide-y divide-[#F3F4F6]">
          {loading ? (
            <div className="p-6 text-center text-[#9CA3AF]">Loading orders...</div>
          ) : filteredOrders.length === 0 ? (
            <div className="p-6 text-center text-[#9CA3AF]">No orders found.</div>
          ) : (
            filteredOrders.map((order) => {
              const net = networkLabel(order);
              return (
                <div key={order.id} className="p-4 space-y-3">
                  <div className="flex justify-between items-start gap-2">
                    <div className="min-w-0">
                      <p className="font-mono font-bold text-[#111827] text-[13px] truncate">
                        {order.reference.slice(-10)}
                      </p>
                      <p className="text-[11px] text-[#9CA3AF]">
                        {format(new Date(order.created_at), "MMM d, yyyy HH:mm")}
                      </p>
                    </div>
                    {order.status === "completed" && (
                      <span className="flex items-center gap-1 text-[#15803D] bg-[#F0FDF4] px-2 py-0.5 rounded-full text-[10px] font-semibold shrink-0">
                        <CheckCircle2 className="w-3 h-3" /> Delivered
                      </span>
                    )}
                    {order.status === "pending" && (
                      <span className="flex items-center gap-1 text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full text-[10px] font-semibold shrink-0">
                        <Clock className="w-3 h-3" /> Pending
                      </span>
                    )}
                    {order.status === "failed" && (
                      <span className="flex items-center gap-1 text-red-700 bg-red-50 px-2 py-0.5 rounded-full text-[10px] font-semibold shrink-0">
                        <XCircle className="w-3 h-3" /> Failed
                      </span>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-[12px]">
                    <div>
                      <span className="text-[#9CA3AF] block">Agent</span>
                      <span className="font-semibold text-[#111827]">
                        {order.users?.name || "Unknown"}
                      </span>
                    </div>
                    <div>
                      <span className="text-[#9CA3AF] block">Bundle</span>
                      <span className="font-semibold text-[#111827]">
                        {order.bundles?.name || "—"}
                      </span>
                    </div>
                    <div>
                      <span className="text-[#9CA3AF] block">Send to</span>
                      <span className="font-bold text-[#111827]">
                        {order.customer_phone}
                      </span>
                    </div>
                    <div>
                      <span className="text-[#9CA3AF] block">Network</span>
                      <span
                        className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                          NETWORK_COLORS[net] ||
                          "bg-slate-100 text-slate-600 border-slate-200"
                        }`}
                      >
                        {net}
                      </span>
                    </div>
                  </div>

                  {order.status === "pending" && (
                    <div className="flex items-center gap-2 pt-1">
                      <button
                        onClick={() => handleOrderAction(order.id, 'deliver')}
                        disabled={actionLoading[order.id]}
                        className="flex-1 flex items-center justify-center gap-1.5 h-8 bg-[#16A34A] hover:bg-[#15803D] text-white rounded-lg text-[12px] font-semibold transition-colors disabled:opacity-50 cursor-pointer"
                      >
                        <Truck className="w-3.5 h-3.5" />
                        {actionLoading[order.id] ? 'Processing...' : 'Deliver'}
                      </button>
                      <button
                        onClick={() => handleOrderAction(order.id, 'fail')}
                        disabled={actionLoading[order.id]}
                        className="flex-1 flex items-center justify-center gap-1.5 h-8 border border-red-200 bg-red-50 hover:bg-red-100 text-red-700 rounded-lg text-[12px] font-semibold transition-colors disabled:opacity-50 cursor-pointer"
                      >
                        <Ban className="w-3.5 h-3.5" />
                        Fail
                      </button>
                    </div>
                  )}

                  <div className="bg-[#F9FAFB] rounded-lg px-3 py-2 flex items-center justify-between text-[12px] border border-[#E5E7EB]">
                    <div>
                      <span className="text-[#9CA3AF]">Customer Paid</span>
                      <p className="font-bold text-[#16A34A]">
                        {formatCurrency(order.customer_paid)}
                      </p>
                    </div>
                    <div className="text-right">
                      <span className="text-[#9CA3AF]">Platform Fee</span>
                      <p className="font-semibold text-[#374151]">
                        {formatCurrency(order.platform_fee)}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}

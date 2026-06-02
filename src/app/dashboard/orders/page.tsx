"use client";

import { formatCurrency } from "@/lib/pricing";
import { Search, Filter, CheckCircle2, Clock, XCircle } from "lucide-react";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase";
import { format } from "date-fns";

export default function AgentOrders() {
  const [orders, setOrders] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const supabase = createClient();
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        const { data, error } = await supabase
          .from('orders')
          .select('*, bundles(name)')
          .eq('agent_id', user.id)
          .order('created_at', { ascending: false });

        if (error) throw error;
        setOrders(data || []);
      } catch (err) {
        console.error("Error fetching orders:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, []);

  const filteredOrders = orders.filter(order => {
    const matchesSearch = order.reference.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          order.customer_phone.includes(searchTerm);
    const matchesStatus = statusFilter === "All" || 
                          (statusFilter === "Completed" && order.status === "completed") ||
                          (statusFilter === "Pending" && order.status === "pending") ||
                          (statusFilter === "Failed" && order.status === "failed");
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="p-4 sm:p-8 max-w-6xl mx-auto space-y-6 pb-24 lg:pb-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900">Order History</h1>
          <p className="text-sm text-slate-500 mt-1">Track customer purchases made through your store.</p>
        </div>
        <div className="flex items-center gap-2 w-full md:w-auto">
          <div className="relative flex-1 md:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input 
              type="text" 
              placeholder="Search ref or phone..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-brand-primary outline-none"
            />
          </div>
          <div className="relative">
            <select 
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="appearance-none pl-9 pr-8 py-2 border border-slate-200 rounded-lg text-sm font-medium focus:ring-2 focus:ring-brand-primary outline-none bg-white"
            >
              <option value="All">All</option>
              <option value="Completed">Completed</option>
              <option value="Pending">Pending</option>
              <option value="Failed">Failed</option>
            </select>
            <Filter className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
          </div>
        </div>
      </div>

      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
        
        {/* Desktop Table View */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-500">
              <tr>
                <th className="px-6 py-4 font-bold">Ref ID</th>
                <th className="px-6 py-4 font-bold">Date</th>
                <th className="px-6 py-4 font-bold">Customer</th>
                <th className="px-6 py-4 font-bold">Bundle</th>
                <th className="px-6 py-4 font-bold text-right">Price</th>
                <th className="px-6 py-4 font-bold text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-slate-400">Loading orders...</td>
                </tr>
              ) : filteredOrders.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-slate-400">No orders found.</td>
                </tr>
              ) : (
                filteredOrders.map((order) => (
                  <tr key={order.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4 font-bold text-slate-900">{order.reference}</td>
                    <td className="px-6 py-4 text-slate-500">{format(new Date(order.created_at), "MMM d, yyyy HH:mm")}</td>
                    <td className="px-6 py-4 text-slate-700">{order.customer_phone}</td>
                    <td className="px-6 py-4 font-medium text-slate-900">{order.bundles?.name || 'Unknown Bundle'}</td>
                    <td className="px-6 py-4 text-right">
                      <div className="font-bold text-brand-primary">{formatCurrency(order.customer_paid)}</div>
                      <div className="text-xs text-slate-400">Fee: {formatCurrency(order.platform_fee)}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex justify-center">
                        {order.status === 'completed' && (
                          <span className="flex items-center gap-1.5 text-green-700 bg-green-100 px-3 py-1 rounded-full text-xs font-bold">
                            <CheckCircle2 className="w-3.5 h-3.5" /> Completed
                          </span>
                        )}
                        {order.status === 'pending' && (
                          <span className="flex items-center gap-1.5 text-amber-700 bg-amber-100 px-3 py-1 rounded-full text-xs font-bold">
                            <Clock className="w-3.5 h-3.5" /> Pending
                          </span>
                        )}
                        {order.status === 'failed' && (
                          <span className="flex items-center gap-1.5 text-red-700 bg-red-100 px-3 py-1 rounded-full text-xs font-bold">
                            <XCircle className="w-3.5 h-3.5" /> Failed
                          </span>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Mobile View - Cards */}
        <div className="md:hidden divide-y divide-slate-100">
          {loading ? (
            <div className="p-6 text-center text-slate-400">Loading orders...</div>
          ) : filteredOrders.length === 0 ? (
            <div className="p-6 text-center text-slate-400">No orders found.</div>
          ) : (
            filteredOrders.map((order) => (
              <div key={order.id} className="p-4 space-y-3">
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="font-bold text-slate-900">{order.reference}</h4>
                    <span className="text-xs text-slate-500">{format(new Date(order.created_at), "MMM d, yyyy HH:mm")}</span>
                  </div>
                  {order.status === 'completed' && (
                    <span className="flex items-center gap-1 text-green-700 bg-green-100 px-2.5 py-0.5 rounded-full text-[10px] font-bold">
                      Completed
                    </span>
                  )}
                  {order.status === 'pending' && (
                    <span className="flex items-center gap-1 text-amber-700 bg-amber-100 px-2.5 py-0.5 rounded-full text-[10px] font-bold">
                      Pending
                    </span>
                  )}
                  {order.status === 'failed' && (
                    <span className="flex items-center gap-1 text-red-700 bg-red-100 px-2.5 py-0.5 rounded-full text-[10px] font-bold">
                      Failed
                    </span>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs font-semibold">
                  <div>
                    <span className="text-slate-400 block">Customer:</span>
                    <span className="text-slate-900">{order.customer_phone}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block">Bundle:</span>
                    <span className="text-slate-900">{order.bundles?.name || 'Unknown Bundle'}</span>
                  </div>
                  <div className="col-span-2 bg-slate-50 p-2.5 rounded-xl border border-slate-100 flex items-center justify-between text-xs mt-1">
                    <div>
                      <span className="text-slate-500 block">Profit (Credited):</span>
                      <span className="font-bold text-slate-900">{formatCurrency(order.agent_credited)}</span>
                    </div>
                    <div className="text-right">
                      <span className="text-slate-500 block">Customer Paid:</span>
                      <span className="font-black text-brand-primary">{formatCurrency(order.customer_paid)}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

      </div>
    </div>
  );
}

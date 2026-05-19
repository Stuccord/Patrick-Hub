"use client";

import { formatCurrency } from "@/lib/pricing";
import { Search, Filter, CheckCircle2, Clock, XCircle } from "lucide-react";

const MOCK_ORDERS = [
  { id: "DH-847291", customer: "024 123 4567", bundle: "MTN 5GB", price: 22.00, fee: 0.20, total: 22.20, status: "completed", date: "Today, 14:32" },
  { id: "DH-392810", customer: "055 987 6543", bundle: "MTN 1GB", price: 5.50, fee: 0.20, total: 5.70, status: "completed", date: "Today, 10:15" },
  { id: "DH-102938", customer: "020 111 2222", bundle: "Vodafone 5GB", price: 22.00, fee: 0.20, total: 22.20, status: "pending", date: "Yesterday, 18:45" },
  { id: "DH-564738", customer: "054 999 8888", bundle: "MTN 2GB", price: 10.00, fee: 0.20, total: 10.20, status: "failed", date: "Yesterday, 09:20" },
];

export default function AgentOrders() {
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
              placeholder="Search..." 
              className="w-full pl-9 pr-4 py-3 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-brand-primary outline-none bg-white font-medium"
            />
          </div>
          <button className="p-3 border border-slate-200 rounded-xl text-slate-600 hover:bg-slate-50 bg-white min-h-[48px] shrink-0">
            <Filter className="h-5 w-5" />
          </button>
        </div>
      </div>

      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
        
        {/* Desktop View */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-500">
              <tr>
                <th className="px-6 py-4 font-bold">Order ID</th>
                <th className="px-6 py-4 font-bold">Customer Phone</th>
                <th className="px-6 py-4 font-bold">Bundle</th>
                <th className="px-6 py-4 font-bold">Your Price</th>
                <th className="px-6 py-4 font-bold text-slate-400">Platform Fee</th>
                <th className="px-6 py-4 font-bold">Customer Paid</th>
                <th className="px-6 py-4 font-bold">Status</th>
                <th className="px-6 py-4 font-bold">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {MOCK_ORDERS.map((order) => (
                <tr key={order.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-4 font-bold text-slate-900">{order.id}</td>
                  <td className="px-6 py-4 font-medium text-slate-700">{order.customer}</td>
                  <td className="px-6 py-4 text-slate-600">{order.bundle}</td>
                  <td className="px-6 py-4 font-bold text-slate-900">{formatCurrency(order.price)}</td>
                  <td className="px-6 py-4 text-slate-400 text-xs">+{formatCurrency(order.fee)}</td>
                  <td className="px-6 py-4 font-black text-brand-primary">{formatCurrency(order.total)}</td>
                  <td className="px-6 py-4">
                    {order.status === 'completed' && (
                      <span className="flex items-center gap-1 text-green-600 bg-green-50 px-2.5 py-1 rounded-full text-xs font-bold w-fit">
                        <CheckCircle2 className="w-3 h-3" /> Completed
                      </span>
                    )}
                    {order.status === 'pending' && (
                      <span className="flex items-center gap-1 text-amber-600 bg-amber-50 px-2.5 py-1 rounded-full text-xs font-bold w-fit">
                        <Clock className="w-3 h-3" /> Pending
                      </span>
                    )}
                    {order.status === 'failed' && (
                      <span className="flex items-center gap-1 text-red-600 bg-red-50 px-2.5 py-1 rounded-full text-xs font-bold w-fit">
                        <XCircle className="w-3 h-3" /> Failed
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-slate-500 text-xs">{order.date}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Mobile View */}
        <div className="md:hidden divide-y divide-slate-100">
          {MOCK_ORDERS.map((order) => (
            <div key={order.id} className="p-4 space-y-4">
              <div className="flex justify-between items-start">
                <div>
                  <h4 className="font-bold text-slate-900 text-sm">{order.id}</h4>
                  <p className="text-[10px] text-slate-400 font-bold mt-0.5">{order.date}</p>
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
                  <span className="text-slate-900">{order.customer}</span>
                </div>
                <div>
                  <span className="text-slate-400 block">Bundle:</span>
                  <span className="text-slate-900">{order.bundle}</span>
                </div>
                <div className="col-span-2 bg-slate-50 p-2.5 rounded-xl border border-slate-100 flex items-center justify-between text-xs mt-1">
                  <div>
                    <span className="text-slate-500 block">Your Pricing:</span>
                    <span className="font-bold text-slate-900">{formatCurrency(order.price)}</span>
                  </div>
                  <div className="text-right">
                    <span className="text-slate-500 block">Customer Paid:</span>
                    <span className="font-black text-brand-primary">{formatCurrency(order.total)}</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

      </div>
    </div>
  );
}

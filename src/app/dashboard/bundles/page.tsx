"use client";

import { formatCurrency } from "@/lib/pricing";
import { Info, Save } from "lucide-react";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase";

interface AgentBundle {
  id: string;
  name: string;
  network: string;
  size_gb: number;
  base_cost: number;
  min_resell: number;
  agent_price: number;
}

interface DBActiveBundle {
  id: string;
  name: string;
  network: string;
  size_gb: number;
  base_price: string | number;
  min_resell_price: string | number;
}

interface DBAgentOverride {
  bundle_id: string;
  selling_price: string | number;
}

export default function AgentBundles() {
  const [bundles, setBundles] = useState<AgentBundle[]>([]);
  const [saving, setSaving] = useState<string | null>(null);

  const fetchBundlesAndPricing = async () => {
    try {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // 1. Fetch active platform bundles
      const { data: activeBundles, error: bundlesError } = await supabase
        .from('bundles')
        .select('*')
        .eq('is_active', true)
        .order('network', { ascending: true })
        .order('size_gb', { ascending: true });
      
      if (bundlesError) throw bundlesError;

      // 2. Fetch current agent's custom price overrides
      const { data: agentOverrides, error: overridesError } = await supabase
        .from('agent_bundles')
        .select('*')
        .eq('agent_id', user.id);

      if (overridesError) throw overridesError;

      // 3. Merge them
      const merged = ((activeBundles || []) as unknown as DBActiveBundle[]).map((b) => {
        const override = ((agentOverrides || []) as unknown as DBAgentOverride[]).find((o) => o.bundle_id === b.id);
        return {
          id: b.id,
          name: b.name,
          network: b.network,
          size_gb: Number(b.size_gb),
          base_cost: Number(b.base_price),
          min_resell: Number(b.min_resell_price),
          agent_price: override ? Number(override.selling_price) : Number(b.min_resell_price)
        };
      });

      setBundles(merged);
    } catch (err) {
      console.error("Error fetching agent bundles & pricing:", err);
    }
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchBundlesAndPricing();
  }, []);

  const handlePriceChange = (id: string, newPrice: string) => {
    setBundles(bundles.map(b => b.id === id ? { ...b, agent_price: parseFloat(newPrice) || 0 } : b));
  };

  const handleSave = async (bundleId: string) => {
    const bundle = bundles.find(b => b.id === bundleId);
    if (!bundle) return;

    if (bundle.agent_price < bundle.min_resell) {
      alert("Selling price cannot be below the minimum resell price.");
      return;
    }

    setSaving(bundleId);
    try {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { error } = await supabase
        .from('agent_bundles')
        .upsert({
          agent_id: user.id,
          bundle_id: bundleId,
          selling_price: bundle.agent_price
        }, {
          onConflict: 'agent_id,bundle_id'
        });

      if (error) throw error;
      
      // Briefly show saved state then reload
      setTimeout(() => {
        setSaving(null);
        fetchBundlesAndPricing();
      }, 600);
    } catch (err) {
      console.error(err);
      const errorMessage = err instanceof Error ? err.message : String(err);
      alert(`Error saving custom selling price: ${errorMessage}`);
      setSaving(null);
    }
  };

  return (
    <div className="p-4 sm:p-8 max-w-5xl mx-auto space-y-6 pb-24 lg:pb-8">
      <div>
        <h1 className="text-xl sm:text-2xl font-black text-slate-900">My Store Bundles</h1>
        <p className="text-sm text-slate-500 mt-1">Set your selling prices for the data bundles. The higher your price, the higher your profit.</p>
      </div>

      <div className="bg-blue-50 border border-blue-100 p-4 rounded-2xl flex items-start gap-3">
        <Info className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
        <div className="text-xs sm:text-sm text-blue-800 space-y-2">
          <p><strong>Pricing Rules:</strong></p>
          <ul className="list-disc list-inside space-y-1">
            <li>You cannot set a price lower than the Admin&apos;s Minimum Resell Price.</li>
            <li>Your Profit Margin = Your Selling Price - Base Cost Price.</li>
            <li>A flat platform fee (GHS 0.20) will be added at checkout for the customer.</li>
          </ul>
        </div>
      </div>

      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
        
        {/* Desktop View */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-500">
              <tr>
                <th className="px-6 py-4 font-bold">Bundle</th>
                <th className="px-6 py-4 font-bold">Size</th>
                <th className="px-6 py-4 font-bold">Base Cost</th>
                <th className="px-6 py-4 font-bold">Min. Resell Price</th>
                <th className="px-6 py-4 font-bold w-48">Your Selling Price</th>
                <th className="px-6 py-4 font-bold">Your Profit Margin</th>
                <th className="px-6 py-4 font-bold text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {bundles.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-slate-400 font-medium">
                    No active bundles available at the moment.
                  </td>
                </tr>
              ) : (
                bundles.map((bundle) => {
                  const isPriceTooLow = bundle.agent_price < bundle.min_resell;
                  const margin = bundle.agent_price - bundle.base_cost;

                  return (
                    <tr key={bundle.id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-6 py-4">
                        <p className="font-bold text-slate-900 text-sm">{bundle.name}</p>
                        <span className={`inline-block mt-1 px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          bundle.network === 'MTN' ? 'bg-amber-100 text-amber-700' :
                          bundle.network === 'Vodafone' || bundle.network === 'Telecel' ? 'bg-rose-100 text-rose-700' :
                          'bg-blue-100 text-blue-700'
                        }`}>{bundle.network}</span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="inline-flex items-center gap-1 bg-slate-100 text-slate-700 px-2.5 py-1 rounded-full text-xs font-bold">
                          📶 {bundle.size_gb} GB
                        </span>
                      </td>
                      <td className="px-6 py-4 text-slate-500">{formatCurrency(bundle.base_cost)}</td>
                      <td className="px-6 py-4 text-slate-500">{formatCurrency(bundle.min_resell)}</td>
                      <td className="px-6 py-4">
                        <div className="relative">
                          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-xs">GHS</span>
                          <input 
                            type="number" 
                            value={bundle.agent_price}
                            step="0.1"
                            onChange={(e) => handlePriceChange(bundle.id, e.target.value)}
                            className={`w-full pl-14 pr-3 py-2 border rounded-lg text-sm font-bold outline-none focus:ring-2 focus:ring-brand-primary ${isPriceTooLow ? 'border-red-300 text-red-600 focus:ring-red-500 bg-red-50' : 'border-slate-200 text-slate-900 bg-white'}`}
                          />
                        </div>
                        {isPriceTooLow && <p className="text-[10px] text-red-500 mt-1 absolute font-bold">Below minimum!</p>}
                      </td>
                      <td className="px-6 py-4">
                        {margin >= 0 ? (
                          <span className="bg-green-100 text-green-700 px-2.5 py-1 rounded-full text-xs font-bold whitespace-nowrap">
                            +{formatCurrency(margin)}
                          </span>
                        ) : (
                          <span className="bg-red-100 text-red-700 px-2.5 py-1 rounded-full text-xs font-bold whitespace-nowrap">
                            {formatCurrency(margin)}
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button 
                          onClick={() => handleSave(bundle.id)}
                          disabled={isPriceTooLow || saving === bundle.id}
                          className="bg-brand-primary text-white px-4 py-2 rounded-lg text-xs font-bold hover:bg-brand-dark transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-1 ml-auto w-24 cursor-pointer"
                        >
                          {saving === bundle.id ? "Saved!" : (
                            <>
                              <Save className="w-3 h-3" /> Save
                            </>
                          )}
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Mobile View - Styled Cards stacked */}
        <div className="md:hidden divide-y divide-slate-100">
          {bundles.length === 0 ? (
            <div className="p-6 text-center text-slate-400 font-medium">
              No active bundles available at the moment.
            </div>
          ) : (
            bundles.map((bundle) => {
              const isPriceTooLow = bundle.agent_price < bundle.min_resell;
              const margin = bundle.agent_price - bundle.base_cost;

              return (
                <div key={bundle.id} className="p-4 space-y-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="font-bold text-slate-900 text-base">{bundle.name}</h4>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="inline-flex items-center gap-1 bg-slate-100 text-slate-700 px-2 py-0.5 rounded-full text-[11px] font-bold">
                          📶 {bundle.size_gb} GB
                        </span>
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          bundle.network === 'MTN' ? 'bg-amber-100 text-amber-700' :
                          bundle.network === 'Vodafone' || bundle.network === 'Telecel' ? 'bg-rose-100 text-rose-700' :
                          'bg-blue-100 text-blue-700'
                        }`}>{bundle.network}</span>
                      </div>
                    </div>
                    {margin >= 0 ? (
                      <span className="bg-green-100 text-green-700 px-2.5 py-0.5 rounded-full text-xs font-bold">
                        Margin: +{formatCurrency(margin)}
                      </span>
                    ) : (
                      <span className="bg-red-100 text-red-700 px-2.5 py-0.5 rounded-full text-xs font-bold">
                        Margin: {formatCurrency(margin)}
                      </span>
                    )}
                  </div>

                  <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 text-xs grid grid-cols-2 gap-2">
                    <div>
                      <span className="text-slate-400 block mb-0.5">Base Cost:</span>
                      <span className="font-bold text-slate-900">{formatCurrency(bundle.base_cost)}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block mb-0.5">Min. Resell:</span>
                      <span className="font-bold text-slate-900">{formatCurrency(bundle.min_resell)}</span>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-600 block">Your Selling Price</label>
                    <div className="relative">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-sm">GHS</span>
                      <input 
                        type="number" 
                        value={bundle.agent_price}
                        step="0.1"
                        onChange={(e) => handlePriceChange(bundle.id, e.target.value)}
                        className={`w-full pl-16 pr-4 h-12 rounded-xl border font-bold text-base outline-none focus:ring-2 focus:ring-brand-primary ${isPriceTooLow ? 'border-red-300 text-red-600 focus:ring-red-500 bg-red-50' : 'border-slate-200 text-slate-900 bg-white'}`}
                      />
                    </div>
                    {isPriceTooLow && <p className="text-[10px] text-red-500 font-bold">Price is below the allowed minimum resell rate!</p>}
                  </div>

                  <button 
                    onClick={() => handleSave(bundle.id)}
                    disabled={isPriceTooLow || saving === bundle.id}
                    className="w-full bg-brand-primary text-white rounded-xl font-bold text-xs min-h-[48px] flex items-center justify-center gap-1.5 shadow-sm shadow-brand-primary/10 btn-animate disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                  >
                    {saving === bundle.id ? "Saved Successfully!" : (
                      <>
                        <Save className="w-4 h-4" /> Save Pricing
                      </>
                    )}
                  </button>
                </div>
              );
            })
          )}
        </div>

      </div>
    </div>
  );
}

"use client";

import { useEffect, useState } from "react";
import { Plus, Edit2, Trash2, Search, Filter, X } from "lucide-react";
import { formatCurrency } from "@/lib/pricing";
import { createClient } from "@/lib/supabase";

export default function AdminBundles() {
  const [bundles, setBundles] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingBundle, setEditingBundle] = useState<any | null>(null);

  // Form states
  const [name, setName] = useState("");
  const [sizeGb, setSizeGb] = useState("");
  const [network, setNetwork] = useState("MTN");
  const [basePrice, setBasePrice] = useState("");
  const [minResellPrice, setMinResellPrice] = useState("");
  const [cheapgigzId, setCheapgigzId] = useState("");
  const [isActive, setIsActive] = useState(true);

  const fetchBundles = async () => {
    try {
      const supabase = createClient();
      const { data, error } = await supabase
        .from('bundles')
        .select('*')
        .order('network', { ascending: true })
        .order('size_gb', { ascending: true });
      if (error) throw error;
      setBundles(data || []);
    } catch (err) {
      console.error("Error fetching bundles:", err);
    }
  };

  useEffect(() => {
    fetchBundles();
  }, []);

  const openAddModal = () => {
    setEditingBundle(null);
    setName("");
    setSizeGb("");
    setNetwork("MTN");
    setBasePrice("");
    setMinResellPrice("");
    setCheapgigzId("");
    setIsActive(true);
    setIsModalOpen(true);
  };

  const openEditModal = (bundle: any) => {
    setEditingBundle(bundle);
    setName(bundle.name);
    setSizeGb(bundle.size_gb.toString());
    setNetwork(bundle.network);
    setBasePrice(bundle.base_price.toString());
    setMinResellPrice(bundle.min_resell_price.toString());
    setCheapgigzId(bundle.cheapgigz_id ?? "");
    setIsActive(bundle.is_active);
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this bundle?")) return;
    try {
      const supabase = createClient();
      const { error } = await supabase
        .from('bundles')
        .delete()
        .eq('id', id);
      if (error) throw error;
      fetchBundles();
    } catch (err) {
      console.error(err);
      alert("Error deleting bundle");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !sizeGb || !basePrice || !minResellPrice) {
      alert("Please fill in all fields");
      return;
    }

    try {
      const supabase = createClient();
      const bundleData = {
        name,
        size_gb: Number(sizeGb),
        network,
        base_price: Number(basePrice),
        min_resell_price: Number(minResellPrice),
        cheapgigz_id: cheapgigzId.trim() || null,
        is_active: isActive
      };

      if (editingBundle) {
        const { error } = await supabase
          .from('bundles')
          .update(bundleData)
          .eq('id', editingBundle.id);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('bundles')
          .insert([bundleData]);
        if (error) throw error;
      }

      setIsModalOpen(false);
      fetchBundles();
    } catch (err: any) {
      console.error(err);
      alert(`Error saving bundle: ${err.message || err.details || err.toString()}`);
    }
  };

  const filteredBundles = bundles.filter(b => 
    b.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    b.network.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="p-4 sm:p-6 max-w-[1200px] mx-auto space-y-6 pb-24 lg:pb-8">
      {/* Page header row */}
      <div className="flex items-center justify-between h-10 w-full gap-4 shrink-0">
        <div>
          <h1 className="text-[20px] font-semibold text-[#111827] tracking-tight leading-none shrink-0">Bundles Inventory</h1>
          <p className="text-[12px] text-[#9CA3AF] mt-1.5 hidden sm:block">Manage network bundles, base costs, and minimum resell rules.</p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <div className="relative w-40 sm:w-64 h-9">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#9CA3AF]" />
            <input 
              type="text" 
              placeholder="Search bundles..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full h-full pl-9 pr-4 bg-white border border-[#E5E7EB] rounded-lg text-[13px] text-[#374151] placeholder-[#9CA3AF] focus:border-[#16A34A] focus:outline-none transition-colors"
            />
          </div>
          <button 
            onClick={openAddModal}
            className="h-9 px-3.5 bg-[#16A34A] text-white hover:bg-[#15803D] rounded-lg text-[13px] font-medium transition-colors flex items-center justify-center gap-1.5 min-h-0 cursor-pointer shadow-sm shrink-0"
          >
            <Plus className="w-4 h-4" /> <span className="hidden sm:inline">Add Bundle</span>
          </button>
        </div>
      </div>

      {/* Card Table Container */}
      <div className="bg-white border border-[#E5E7EB] rounded-xl shadow-[0_1px_3px_rgba(0,0,0,0.05)] overflow-hidden">
        
        {/* Desktop View */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-[#F9FAFB] border-b border-[#E5E7EB] text-[#6B7280] uppercase tracking-wider text-[10px] font-semibold">
              <tr>
                <th className="px-5 py-3 font-semibold">Bundle Name</th>
                <th className="px-5 py-3 font-semibold">Network</th>
                <th className="px-5 py-3 font-semibold">Base Cost</th>
                <th className="px-5 py-3 font-semibold">Min. Resell Price</th>
                <th className="px-5 py-3 font-semibold">Status</th>
                <th className="px-5 py-3 text-right font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E5E7EB] text-[#374151]">
              {filteredBundles.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-5 py-8 text-center text-[#9CA3AF] font-medium text-[13px]">
                    No bundles found.
                  </td>
                </tr>
              ) : (
                filteredBundles.map((bundle) => (
                  <tr key={bundle.id} className="hover:bg-[#F9FAFB] transition-colors">
                    <td className="px-5 py-4">
                      <p className="font-semibold text-[#111827] text-[14px]">{bundle.name}</p>
                      <p className="text-[11px] text-[#9CA3AF] mt-0.5">{bundle.size_gb} GB</p>
                    </td>
                    <td className="px-5 py-4">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                        bundle.network === 'MTN' ? 'bg-[#FFFBEB] text-[#D97706] border border-[#FEF3C7]' :
                        bundle.network === 'Vodafone' ? 'bg-[#FEF2F2] text-[#EF4444] border border-[#FEE2E2]' :
                        'bg-[#EFF6FF] text-[#1D4ED8] border border-[#DBEAFE]'
                      }`}>
                        {bundle.network}
                      </span>
                    </td>
                    <td className="px-5 py-4 font-semibold text-[#111827] text-[14px]">{formatCurrency(bundle.base_price)}</td>
                    <td className="px-5 py-4 font-medium text-[#4B5563] text-[13px]">{formatCurrency(bundle.min_resell_price)}</td>
                    <td className="px-5 py-4">
                      {bundle.is_active ? (
                        <span className="inline-flex items-center px-2.5 py-0.5 bg-[#F0FDF4] text-[#15803D] text-[11px] font-semibold rounded-full">Active</span>
                      ) : (
                        <span className="inline-flex items-center px-2.5 py-0.5 bg-[#F3F4F6] text-[#4B5563] text-[11px] font-semibold rounded-full">Inactive</span>
                      )}
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex items-center justify-end gap-2">
                        <button 
                          onClick={() => openEditModal(bundle)}
                          className="h-7 w-7 flex items-center justify-center bg-white border border-[#E5E7EB] hover:bg-[#F9FAFB] text-[#374151] rounded-md transition-colors cursor-pointer min-h-0 shrink-0" 
                          title="Edit"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button 
                          onClick={() => handleDelete(bundle.id)}
                          className="h-7 w-7 flex items-center justify-center bg-white border border-[#E5E7EB] hover:bg-[#FEF2F2] hover:text-[#EF4444] text-[#9CA3AF] rounded-md transition-colors cursor-pointer min-h-0 shrink-0" 
                          title="Delete"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Mobile View */}
        <div className="md:hidden divide-y divide-[#E5E7EB]">
          {filteredBundles.length === 0 ? (
            <div className="p-5 text-center text-[#9CA3AF] text-[13px]">
              No bundles found.
            </div>
          ) : (
            filteredBundles.map((bundle) => (
              <div key={bundle.id} className="p-4 space-y-3.5 bg-white">
                <div className="flex justify-between items-start gap-2">
                  <div className="min-w-0">
                    <h4 className="font-semibold text-[#111827] text-[14px] truncate">{bundle.name}</h4>
                    <p className="text-[11px] text-[#9CA3AF] mt-0.5">Size: {bundle.size_gb} GB</p>
                  </div>
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold shrink-0 ${
                    bundle.network === 'MTN' ? 'bg-[#FFFBEB] text-[#D97706] border border-[#FEF3C7]' :
                    bundle.network === 'Vodafone' ? 'bg-[#FEF2F2] text-[#EF4444] border border-[#FEE2E2]' :
                    'bg-[#EFF6FF] text-[#1D4ED8] border border-[#DBEAFE]'
                  }`}>
                    {bundle.network}
                  </span>
                </div>

                <div className="bg-[#F9FAFB] border border-[#E5E7EB] p-2.5 rounded-lg text-[12px] grid grid-cols-2 gap-2">
                  <div>
                    <span className="text-[#6B7280] block mb-0.5">Base Cost:</span>
                    <span className="font-semibold text-[#111827]">{formatCurrency(bundle.base_price)}</span>
                  </div>
                  <div>
                    <span className="text-[#6B7280] block mb-0.5">Min Resell:</span>
                    <span className="font-semibold text-[#111827]">{formatCurrency(bundle.min_resell_price)}</span>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-1">
                  {bundle.is_active ? (
                    <span className="inline-flex items-center px-2 py-0.5 bg-[#F0FDF4] text-[#15803D] text-[11px] font-semibold rounded-full">Active</span>
                  ) : (
                    <span className="inline-flex items-center px-2 py-0.5 bg-[#F3F4F6] text-[#4B5563] text-[11px] font-semibold rounded-full">Inactive</span>
                  )}
                  <div className="flex items-center gap-2">
                    <button 
                      onClick={() => openEditModal(bundle)}
                      className="h-9 w-9 flex items-center justify-center bg-white border border-[#E5E7EB] hover:bg-[#F9FAFB] text-[#374151] rounded-lg transition-colors cursor-pointer min-h-0 shrink-0" 
                      title="Edit"
                    >
                      <Edit2 className="w-4.5 h-4.5" />
                    </button>
                    <button 
                      onClick={() => handleDelete(bundle.id)}
                      className="h-9 w-9 flex items-center justify-center bg-white border border-[#E5E7EB] hover:bg-[#FEF2F2] hover:text-[#EF4444] text-[#9CA3AF] rounded-lg transition-colors cursor-pointer min-h-0 shrink-0" 
                      title="Delete"
                    >
                      <Trash2 className="w-4.5 h-4.5" />
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

      </div>

      {/* Add/Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="bg-white rounded-2xl border border-[#E5E7EB] shadow-2xl w-full max-w-md overflow-hidden animate-slide-up">
            <div className="flex items-center justify-between px-6 py-4 border-b border-[#E5E7EB]">
              <h2 className="text-[16px] font-bold text-[#111827]">
                {editingBundle ? "Edit Bundle" : "Add New Bundle"}
              </h2>
              <button 
                onClick={() => setIsModalOpen(false)}
                className="w-8 h-8 rounded-lg hover:bg-slate-100 flex items-center justify-center text-[#6B7280] hover:text-[#111827] transition-all cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-[#6B7280] mb-1.5">Bundle Name</label>
                <input 
                  type="text" 
                  placeholder="e.g. 1GB MTN Data"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full h-10 px-3 bg-white border border-[#E5E7EB] rounded-lg text-[13px] text-[#374151] placeholder-[#9CA3AF] focus:border-[#16A34A] focus:outline-none transition-colors"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-[#6B7280] mb-1.5">Size (GB)</label>
                  <input 
                    type="number" 
                    step="any"
                    placeholder="e.g. 1"
                    value={sizeGb}
                    onChange={(e) => setSizeGb(e.target.value)}
                    className="w-full h-10 px-3 bg-white border border-[#E5E7EB] rounded-lg text-[13px] text-[#374151] placeholder-[#9CA3AF] focus:border-[#16A34A] focus:outline-none transition-colors"
                    required
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-[#6B7280] mb-1.5">Network</label>
                  <select 
                    value={network}
                    onChange={(e) => setNetwork(e.target.value)}
                    className="w-full h-10 px-3 bg-white border border-[#E5E7EB] rounded-lg text-[13px] text-[#374151] focus:border-[#16A34A] focus:outline-none transition-colors"
                  >
                    <option value="MTN">MTN</option>
                    <option value="Vodafone">Vodafone</option>
                    <option value="AirtelTigo">AirtelTigo</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-[#6B7280] mb-1.5">Base Cost (GHS)</label>
                  <input 
                    type="number" 
                    step="0.01"
                    placeholder="e.g. 4.50"
                    value={basePrice}
                    onChange={(e) => setBasePrice(e.target.value)}
                    className="w-full h-10 px-3 bg-white border border-[#E5E7EB] rounded-lg text-[13px] text-[#374151] placeholder-[#9CA3AF] focus:border-[#16A34A] focus:outline-none transition-colors"
                    required
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-[#6B7280] mb-1.5">Min Resell (GHS)</label>
                  <input 
                    type="number" 
                    step="0.01"
                    placeholder="e.g. 5.50"
                    value={minResellPrice}
                    onChange={(e) => setMinResellPrice(e.target.value)}
                    className="w-full h-10 px-3 bg-white border border-[#E5E7EB] rounded-lg text-[13px] text-[#374151] placeholder-[#9CA3AF] focus:border-[#16A34A] focus:outline-none transition-colors"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-[#6B7280] mb-1.5">Cheap Gigz Product ID</label>
                <input 
                  type="text" 
                  placeholder="e.g. MTN_1GB_DATA (from Cheap Gigz)"
                  value={cheapgigzId}
                  onChange={(e) => setCheapgigzId(e.target.value)}
                  className="w-full h-10 px-3 bg-white border border-[#E5E7EB] rounded-lg text-[13px] text-[#374151] placeholder-[#9CA3AF] focus:border-[#16A34A] focus:outline-none transition-colors font-mono"
                />
                <p className="text-[10px] text-[#9CA3AF] mt-1">The product ID from your Cheap Gigz dashboard. Used for auto-fulfillment.</p>
              </div>

              <div className="flex items-center gap-2 py-2">
                <input 
                  type="checkbox" 
                  id="isActive"
                  checked={isActive}
                  onChange={(e) => setIsActive(e.target.checked)}
                  className="w-4 h-4 text-[#16A34A] border-[#E5E7EB] rounded focus:ring-[#16A34A]"
                />
                <label htmlFor="isActive" className="text-[13px] font-medium text-[#374151] select-none cursor-pointer">
                  Active in Storefronts
                </label>
              </div>

              <div className="flex items-center gap-3 pt-2 border-t border-[#E5E7EB]">
                <button 
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 h-10 border border-[#D1D5DB] text-[#374151] hover:bg-[#F9FAFB] rounded-lg text-[13px] font-semibold transition-all cursor-pointer min-h-0"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  className="flex-1 h-10 bg-[#16A34A] hover:bg-[#15803D] text-white rounded-lg text-[13px] font-semibold transition-all cursor-pointer min-h-0 shadow-sm"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

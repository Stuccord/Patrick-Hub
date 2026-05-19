"use client";

import { Save, Upload, Store } from "lucide-react";
import { useState, useEffect } from "react";

export default function StoreSettings() {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    storeName: "Kofi Tech Solutions",
    tagline: "Your reliable source for affordable data.",
    slug: "kofi-tech"
  });

  useEffect(() => {
    const current = localStorage.getItem("current_agent");
    if (current) {
      const parsed = JSON.parse(current);
      setFormData({
        storeName: parsed.name || "My Data Store",
        tagline: parsed.tagline || "Your reliable source for affordable data.",
        slug: parsed.username || "mystore"
      });
    }
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    // Save updated name and tagline
    const current = localStorage.getItem("current_agent");
    if (current) {
      const parsed = JSON.parse(current);
      const updatedAgent = { ...parsed, name: formData.storeName, tagline: formData.tagline };
      localStorage.setItem("current_agent", JSON.stringify(updatedAgent));
      
      const dbUsers = JSON.parse(localStorage.getItem("patrickhub_users") || "[]");
      const updatedUsers = dbUsers.map((u: any) => u.id === parsed.id ? { ...u, name: formData.storeName } : u);
      localStorage.setItem("patrickhub_users", JSON.stringify(updatedUsers));
    }
    
    setTimeout(() => setLoading(false), 800);
  };

  return (
    <div className="p-4 sm:p-8 max-w-4xl mx-auto space-y-6 pb-24 lg:pb-8">
      <div>
        <h1 className="text-xl sm:text-2xl font-black text-slate-900">Store Settings</h1>
        <p className="text-sm text-slate-500 mt-1">Customize how your storefront appears to customers.</p>
      </div>

      <div className="bg-white border border-slate-200 rounded-3xl p-5 sm:p-8 shadow-sm">
        <form onSubmit={handleSubmit} className="space-y-6">
          
          <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
            <div className="w-28 h-28 bg-slate-100 rounded-full flex flex-col items-center justify-center border-2 border-dashed border-slate-300 text-slate-400 shrink-0 relative overflow-hidden group">
              <Store className="w-6 h-6 mb-1" />
              <span className="text-[10px] font-bold">Upload Logo</span>
              <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                <Upload className="w-5 h-5 text-white" />
              </div>
            </div>

            <div className="flex-1 space-y-4 w-full">
              <div className="space-y-2">
                <label className="text-xs sm:text-sm font-bold text-slate-700 block">Store Display Name</label>
                <input 
                  type="text" 
                  value={formData.storeName}
                  onChange={(e) => setFormData({...formData, storeName: e.target.value})}
                  className="w-full px-4 h-12 border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-primary outline-none font-bold text-slate-900 bg-white"
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs sm:text-sm font-bold text-slate-700 block">Store Tagline / Description</label>
                <input 
                  type="text" 
                  value={formData.tagline}
                  onChange={(e) => setFormData({...formData, tagline: e.target.value})}
                  className="w-full px-4 h-12 border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-primary outline-none font-medium text-slate-700 bg-white"
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs sm:text-sm font-bold text-slate-700 block">Store Link (Slug)</label>
                <div className="flex items-center">
                  <span className="bg-slate-100 border border-slate-200 border-r-0 px-3 h-12 rounded-l-xl text-slate-500 font-mono text-xs flex items-center select-none shrink-0">
                    /store/
                  </span>
                  <input 
                    type="text" 
                    disabled
                    value={formData.slug}
                    className="w-full px-4 h-12 border border-slate-200 rounded-r-xl outline-none font-bold text-slate-500 bg-slate-50 cursor-not-allowed"
                  />
                </div>
                <p className="text-[10px] text-slate-400 font-bold">Note: Contact support to change your store slug.</p>
              </div>
            </div>
          </div>

          <hr className="border-slate-100" />

          <div className="flex justify-end">
            <button 
              type="submit"
              disabled={loading}
              className="w-full sm:w-auto bg-brand-primary text-white px-8 py-4 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-brand-dark transition-colors disabled:opacity-70 shadow-lg shadow-brand-primary/20 min-h-[48px] btn-animate"
            >
              <Save className="w-5 h-5 shrink-0" />
              {loading ? "Saving..." : "Save Settings"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

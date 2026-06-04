"use client";

import { Save, Upload, Store } from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { createClient } from "@/lib/supabase";

export default function StoreSettings() {
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    storeName: "",
    tagline: "",
    slug: "",
    logoUrl: ""
  });
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const supabase = createClient();
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;
        setUserId(user.id);

        const { data, error } = await supabase
          .from('users')
          .select('store_name, store_description, username, logo_url')
          .eq('id', user.id)
          .single();

        if (error) throw error;
        if (data) {
          setFormData({
            storeName: data.store_name || "",
            tagline: data.store_description || "",
            slug: data.username || "",
            logoUrl: data.logo_url || ""
          });
        }
      } catch (err) {
        console.error("Error fetching store settings:", err);
      } finally {
        setFetching(false);
      }
    };

    fetchProfile();
  }, []);

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !userId) return;

    try {
      const supabase = createClient();
      const fileExt = file.name.split('.').pop();
      const filePath = `${userId}-${Math.random()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from('logos')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: publicUrlData } = supabase.storage
        .from('logos')
        .getPublicUrl(filePath);

      setFormData(prev => ({ ...prev, logoUrl: publicUrlData.publicUrl }));
    } catch (err: any) {
      console.error("Error uploading logo:", err);
      alert(`Failed to upload logo: ${err.message || err.details || err.toString()}`);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userId) return;
    setLoading(true);
    
    try {
      const supabase = createClient();
      const { error } = await supabase
        .from('users')
        .update({
          store_name: formData.storeName,
          store_description: formData.tagline,
          logo_url: formData.logoUrl || null
        })
        .eq('id', userId);

      if (error) throw error;
      alert("Store settings saved successfully!");
    } catch (err) {
      console.error("Error saving settings:", err);
      alert("Failed to save settings.");
    } finally {
      setLoading(false);
    }
  };

  if (fetching) {
    return <div className="p-8 text-center text-slate-500">Loading settings...</div>;
  }

  return (
    <div className="p-4 sm:p-8 max-w-4xl mx-auto space-y-6 pb-24 lg:pb-8">
      <div>
        <h1 className="text-xl sm:text-2xl font-black text-slate-900">Store Settings</h1>
        <p className="text-sm text-slate-500 mt-1">Customize how your storefront appears to customers.</p>
      </div>

      <div className="bg-white border border-slate-200 rounded-3xl p-5 sm:p-8 shadow-sm">
        <form onSubmit={handleSubmit} className="space-y-6">
          
          <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
            <div className="flex flex-col items-center gap-3 shrink-0">
              <div 
                className="w-28 h-28 bg-slate-100 rounded-full flex flex-col items-center justify-center border-2 border-dashed border-slate-300 text-slate-400 relative overflow-hidden group cursor-pointer"
                onClick={() => fileInputRef.current?.click()}
              >
              {formData.logoUrl ? (
                <img src={formData.logoUrl} alt="Store Logo" className="w-full h-full object-cover" />
              ) : (
                <>
                  <Store className="w-6 h-6 mb-1" />
                  <span className="text-[10px] font-bold">Upload Logo</span>
                </>
              )}
              <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                <Upload className="w-5 h-5 text-white" />
              </div>
            </div>
            {formData.logoUrl && (
              <button 
                type="button"
                onClick={() => setFormData(prev => ({ ...prev, logoUrl: "" }))}
                className="text-xs font-bold text-red-500 hover:text-red-600 transition-colors cursor-pointer"
              >
                Remove Logo
              </button>
            )}
            </div>
            <input 
              type="file" 
              ref={fileInputRef} 
              className="hidden" 
              accept="image/*" 
              onChange={handleLogoUpload}
            />

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

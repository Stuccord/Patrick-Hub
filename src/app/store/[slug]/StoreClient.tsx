"use client";

import React, { useEffect, useState } from "react";
import { formatCurrency } from "@/lib/pricing";
import { Phone, ArrowRight, Zap, Loader2, ArrowLeft, ShieldCheck, CheckCircle2 } from "lucide-react";
import { createClient } from "@/lib/supabase";

export default function StoreClient({ slug }: { slug: string }) {
  const [agent, setAgent] = useState<any>(null);
  const [bundles, setBundles] = useState<any[]>([]);
  const [platformFee, setPlatformFee] = useState(0.20);

  // Flow State: 1 = Select Bundle, 2 = Recipient Info, 3 = Summary, 4 = MoMo Payment, 5 = Success
  const [step, setStep] = useState(1);
  const [selectedBundle, setSelectedBundle] = useState<any>(null);
  const [phone, setPhone] = useState("");
  const [network, setNetwork] = useState("MTN");
  const [pin, setPin] = useState("");
  
  const [isLoading, setIsLoading] = useState(false);
  const [reference, setReference] = useState("");

  useEffect(() => {
    async function fetchData() {
      const supabase = createClient();
      
      const { data: userData } = await supabase
        .from('users')
        .select('id, store_name, store_description, name, username')
        .eq('username', slug)
        .eq('status', 'active')
        .single();

      if (userData) {
        setAgent({
          id: userData.id,
          name: userData.store_name || userData.name,
          username: userData.username,
          tagline: userData.store_description || "Affordable data packages, sent instantly."
        });

        const { data: bundlesData } = await supabase.from('bundles').select('*').eq('is_active', true);
        const { data: agentBundlesData } = await supabase.from('agent_bundles').select('*').eq('agent_id', userData.id);
        const { data: configData } = await supabase.from('platform_config').select('value').eq('key', 'transaction_fee').single();
        
        const currentFee = configData ? Number(configData.value) : 0.20;
        setPlatformFee(currentFee);

        if (bundlesData) {
          const merged = bundlesData.map(b => {
            const custom = agentBundlesData?.find(ab => ab.bundle_id === b.id);
            return {
              ...b,
              agent_price: custom ? Number(custom.selling_price) : Number(b.min_resell_price),
              base_cost: Number(b.base_price)
            };
          });
          setBundles(merged);
        }
      } else {
        // Fallback for not found or not active
        setAgent({
          id: null,
          name: "Store Not Found",
          username: slug,
          tagline: "This store is either inactive or does not exist."
        });
      }
    }
    fetchData();
  }, [slug]);

  const handleBundleSelect = (bundle: any) => {
    setSelectedBundle(bundle);
    setNetwork(bundle.network);
    setStep(2);
  };

  const handleDetailsSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (phone.length < 10) return;
    setStep(3);
  };

  const handlePay = async () => {
    if (!agent.id || !selectedBundle) return;
    
    setIsLoading(true);
    const dummyEmail = `${phone.replace(/\s+/g, '')}@patricks-info-tech.com`;
    const amountInPesewas = Math.round((selectedBundle.agent_price + platformFee) * 100);

    try {
      const PaystackPop = (await import('@paystack/inline-js')).default as any;
      const paystack = new PaystackPop();
      paystack.newTransaction({
        key: process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY || '',
        email: dummyEmail,
        amount: amountInPesewas,
        currency: "GHS",
        metadata: {
          custom_fields: [
            {
              display_name: "Customer Phone",
              variable_name: "customer_phone",
              value: phone
            },
            {
              display_name: "Network",
              variable_name: "network",
              value: network
            }
          ],
          agent_id: agent.id,
          bundle_id: selectedBundle.id,
          customer_phone: phone,
          customer_network: network,
          customer_paid: (selectedBundle.agent_price + platformFee).toString(),
          platform_fee: platformFee.toString()
        },
        onSuccess: (transaction: any) => {
          setReference(transaction.reference);
          setIsLoading(false);
          setStep(5); // Show success screen immediately, webhook handles backend
        },
        onCancel: () => {
          setIsLoading(false);
        }
      });
    } catch (err) {
      console.error("Error loading Paystack:", err);
      setIsLoading(false);
      alert("Could not load payment gateway. Please try again.");
    }
  };

  if (!agent) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-brand-primary animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-between selection:bg-brand-primary selection:text-white">
      {/* Header - Centered & Welcoming Logo */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-10 py-3 shadow-sm">
        <div className="max-w-md mx-auto px-4 flex flex-col items-center gap-1">
          <div className="w-12 h-12 bg-brand-primary rounded-full flex items-center justify-center text-white font-black text-xl shadow-md shadow-brand-primary/20">
            {agent.name.charAt(0)}
          </div>
          <h1 className="text-lg font-black text-slate-900 tracking-tight">{agent.name}</h1>
          <p className="text-[10px] text-slate-400 font-bold tracking-wider uppercase">Verified reseller store</p>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 max-w-md w-full mx-auto px-4 py-6 flex flex-col justify-start">
        
        {/* Step Indicator (e.g. Step 1 of 4) */}
        {step < 5 && (
          <div className="bg-white border border-slate-200 rounded-2xl p-4 mb-6 shadow-sm flex items-center justify-between">
            <span className="text-xs font-black text-slate-500 uppercase tracking-wider">Step {step} of 4</span>
            <div className="flex items-center gap-1.5">
              {[1, 2, 3, 4].map((i) => (
                <div 
                  key={i} 
                  className={`w-3.5 h-3.5 rounded-full flex items-center justify-center text-[9px] font-bold transition-all ${
                    step >= i ? "bg-brand-primary text-white scale-110" : "bg-slate-100 text-slate-400"
                  }`}
                >
                  {i}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* STEP 1: Select Bundle */}
        {step === 1 && (
          <div className="space-y-6">
            <div className="space-y-1.5 text-center sm:text-left">
              <h2 className="text-2xl font-black text-slate-900 tracking-tight">Select Data Bundle</h2>
              <p className="text-slate-500 text-sm leading-relaxed">{agent.tagline}</p>
            </div>

            <div className="space-y-4">
              {bundles.map((bundle) => {
                return (
                  <div 
                    key={bundle.id} 
                    className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col"
                  >
                    <div className="p-5 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-xl bg-brand-light text-brand-primary flex items-center justify-center shrink-0">
                          <Zap className="h-6 w-6" />
                        </div>
                        <div>
                          <h4 className="font-bold text-slate-900 text-base">{bundle.name}</h4>
                          <span className={`px-2 py-0.5 rounded text-[10px] font-extrabold tracking-wider ${
                            bundle.network === 'MTN' ? 'bg-yellow-100 text-yellow-800' :
                            bundle.network === 'Vodafone' ? 'bg-red-100 text-red-800' :
                            'bg-blue-100 text-blue-800'
                          }`}>
                            {bundle.network}
                          </span>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-xl font-black text-brand-primary">
                          {formatCurrency(bundle.agent_price)}
                        </div>
                        <p className="text-[9px] text-slate-400 font-extrabold uppercase">Plus GHS {platformFee.toFixed(2)} Fee</p>
                      </div>
                    </div>
                    <button 
                      onClick={() => handleBundleSelect(bundle)}
                      className="w-full bg-slate-900 hover:bg-brand-primary text-white py-3.5 text-sm font-bold transition-all btn-animate min-h-[48px]"
                    >
                      Buy Now
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* STEP 2: Enter Recipient Number & Network (using radio cards) */}
        {step === 2 && selectedBundle && (
          <div className="space-y-6">
            <button onClick={() => setStep(1)} className="flex items-center gap-1.5 text-slate-500 hover:text-slate-900 text-sm font-bold min-h-[48px]">
              <ArrowLeft className="w-4.5 h-4.5" /> Back to bundles
            </button>

            <div className="space-y-1.5 text-center sm:text-left">
              <h2 className="text-2xl font-black text-slate-900 tracking-tight">Recipient Info</h2>
              <p className="text-slate-500 text-sm leading-relaxed">Enter target phone number and provider.</p>
            </div>

            <form onSubmit={handleDetailsSubmit} className="bg-white border border-slate-200 rounded-3xl p-5 sm:p-6 shadow-sm space-y-6">
              <div className="space-y-2">
                <label className="text-xs sm:text-sm font-bold text-slate-700 block">Recipient Phone Number</label>
                <div className="relative">
                  <Phone className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                  <input 
                    type="tel" 
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="024 123 4567"
                    className="w-full pl-11 pr-4 h-12 rounded-xl border border-slate-200 focus:ring-2 focus:ring-brand-primary outline-none transition-all font-bold text-slate-900 text-base"
                  />
                </div>
              </div>

              {/* Large Network Selector Radio Cards */}
              <div className="space-y-2">
                <label className="text-xs sm:text-sm font-bold text-slate-700 block">Select Network Provider</label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: "MTN", name: "MTN", color: "border-yellow-400 bg-yellow-50/50" },
                    { id: "Vodafone", name: "Vodafone", color: "border-red-500 bg-red-50/50" },
                    { id: "AirtelTigo", name: "AirtelTigo", color: "border-blue-500 bg-blue-50/50" }
                  ].map((net) => {
                    const isSelected = network === net.id;
                    return (
                      <button
                        key={net.id}
                        type="button"
                        onClick={() => setNetwork(net.id)}
                        className={`p-3 rounded-xl border-2 text-center transition-all min-h-[48px] flex flex-col items-center justify-center gap-1 ${
                          isSelected 
                            ? `${net.color} border-brand-primary text-brand-primary font-black scale-102` 
                            : "border-slate-200 text-slate-600 font-bold hover:border-slate-300"
                        }`}
                      >
                        <span className="text-xs tracking-tight">{net.name}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              <button 
                type="submit"
                disabled={phone.length < 10}
                className="w-full bg-brand-primary text-white py-4 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-brand-dark transition-all disabled:opacity-50 min-h-[48px] btn-animate shadow-lg shadow-brand-primary/20"
              >
                Continue to Summary
                <ArrowRight className="h-5 w-5" />
              </button>
            </form>
          </div>
        )}

        {/* STEP 3: Order Summary (Receipt layout) */}
        {step === 3 && selectedBundle && (
          <div className="space-y-6">
            <button onClick={() => setStep(2)} className="flex items-center gap-1.5 text-slate-500 hover:text-slate-900 text-sm font-bold min-h-[48px]">
              <ArrowLeft className="w-4.5 h-4.5" /> Back to details
            </button>

            <div className="space-y-1.5 text-center sm:text-left">
              <h2 className="text-2xl font-black text-slate-900 tracking-tight">Verify Order</h2>
              <p className="text-slate-500 text-sm leading-relaxed">Confirm billing details before checkout.</p>
            </div>

            <div className="bg-white border border-slate-200 rounded-3xl p-5 sm:p-6 shadow-sm space-y-6">
              
              {/* Receipt Style Layout */}
              <div className="bg-slate-50 border border-dashed border-slate-300 rounded-2xl p-4 text-xs sm:text-sm space-y-3 font-semibold relative">
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-white px-3 py-0.5 border border-slate-200 rounded-full text-[9px] font-black uppercase text-slate-400 tracking-widest">Receipt</div>
                <div className="flex justify-between border-b border-slate-200 pb-2.5 mt-2">
                  <span className="text-slate-400">Merchant:</span>
                  <span className="text-slate-900 font-bold">{agent.name}</span>
                </div>
                <div className="flex justify-between border-b border-slate-200 pb-2.5">
                  <span className="text-slate-400">Bundle:</span>
                  <span className="text-slate-900 font-bold">{selectedBundle.name}</span>
                </div>
                <div className="flex justify-between border-b border-slate-200 pb-2.5">
                  <span className="text-slate-400">Recipient Phone:</span>
                  <span className="text-slate-900 font-bold">{phone} ({network})</span>
                </div>
                <div className="flex justify-between text-slate-500">
                  <span>Price:</span>
                  <span>{formatCurrency(selectedBundle.agent_price)}</span>
                </div>
                <div className="flex justify-between text-slate-500 pb-2.5">
                  <span>Platform Fee:</span>
                  <span>{formatCurrency(platformFee)}</span>
                </div>
                <div className="border-t-2 border-dotted border-slate-300 pt-3 flex justify-between items-center text-sm">
                  <span className="font-bold text-slate-900">Total Payable:</span>
                  <span className="font-black text-brand-primary text-xl">
                    {formatCurrency(selectedBundle.agent_price + platformFee)}
                  </span>
                </div>
              </div>

              <button 
                onClick={handlePay}
                disabled={isLoading}
                className="w-full bg-brand-primary text-white py-4 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-brand-dark transition-all min-h-[48px] btn-animate shadow-lg shadow-brand-primary/20 text-sm"
              >
                {isLoading ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <>
                    Pay with Mobile Money
                    <ArrowRight className="h-5 w-5" />
                  </>
                )}
              </button>
            </div>
          </div>
        )}



        {/* STEP 5: Success Screen (Centered, Celebratory, Clear Ref) */}
        {step === 5 && selectedBundle && (
          <div className="space-y-6 text-center py-8">
            <div className="mx-auto w-20 h-20 bg-green-100 text-brand-primary rounded-full flex items-center justify-center shadow-lg shadow-brand-primary/10">
              <CheckCircle2 className="w-10 h-10" />
            </div>

            <div className="space-y-3">
              <h2 className="text-2xl sm:text-3xl font-black text-slate-900">Order Confirmed!</h2>
              <div className="bg-slate-100 border border-slate-200 rounded-xl p-3 max-w-[240px] mx-auto">
                <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest block">Order Reference</span>
                <span className="font-mono font-black text-slate-800 text-base sm:text-lg">{reference}</span>
              </div>
              <p className="text-xs sm:text-sm text-slate-600 max-w-sm mx-auto leading-relaxed pt-2">
                The bundle <strong className="text-slate-900">{selectedBundle.name}</strong> is currently being dispatched to <strong className="text-slate-900">{phone}</strong>.
              </p>
            </div>

            <div className="bg-brand-light/50 border border-brand-primary/10 p-4 rounded-2xl inline-flex items-center gap-2 max-w-xs text-left">
              <ShieldCheck className="w-5 h-5 text-brand-primary shrink-0" />
              <p className="text-[10px] text-brand-dark/70 font-semibold leading-relaxed">
                Transactions process instantly. If you experience delays, please consult with the merchant directly.
              </p>
            </div>

            <div className="pt-6">
              <button 
                onClick={() => {
                  setStep(1);
                  setSelectedBundle(null);
                  setPhone("");
                  setPin("");
                }}
                className="bg-brand-primary text-white w-full sm:w-auto px-8 py-4 rounded-xl font-bold hover:bg-brand-dark transition-colors shadow-lg shadow-brand-primary/20 min-h-[48px] btn-animate text-xs sm:text-sm"
              >
                Buy Another Bundle
              </button>
            </div>
          </div>
        )}

      </main>

      {/* Footer */}
      <footer className="py-6 text-center border-t border-slate-200 bg-white">
        <p className="text-xs text-slate-400 font-bold uppercase tracking-widest">
          Powered by <span className="text-slate-600 font-extrabold">Patrick's Info Tech Platform</span>
        </p>
      </footer>
    </div>
  );
}

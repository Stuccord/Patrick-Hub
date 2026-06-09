"use client";

import React, { useEffect, useState } from "react";
import { formatCurrency } from "@/lib/pricing";
import { Phone, ArrowRight, Zap, Loader2, ArrowLeft, ShieldCheck, CheckCircle2 } from "lucide-react";
import { createClient } from "@/lib/supabase";

const MtnLogo = () => (
  <svg viewBox="0 0 100 100" className="w-12 h-12 shrink-0 rounded-xl overflow-hidden shadow-sm border border-amber-200/50">
    <rect width="100" height="100" fill="#FFCC00" />
    <ellipse cx="50" cy="50" rx="36" ry="22" fill="none" stroke="#002F6C" strokeWidth="4" />
    <text x="50" y="57" fontSize="18" fontWeight="900" fontFamily="'Impact', 'Arial Black', sans-serif" textAnchor="middle" fill="#002F6C" letterSpacing="1">MTN</text>
  </svg>
);

const TelecelLogo = () => (
  <svg viewBox="0 0 100 100" className="w-12 h-12 shrink-0 rounded-xl overflow-hidden shadow-sm border border-rose-200/50">
    <rect width="100" height="100" fill="#E60000" />
    <text x="50" y="66" fontSize="56" fontWeight="bold" fontFamily="'Trebuchet MS', sans-serif" textAnchor="middle" fill="#FFFFFF">t</text>
  </svg>
);

const AirtelTigoLogo = () => (
  <svg viewBox="0 0 100 100" className="w-12 h-12 shrink-0 rounded-xl overflow-hidden shadow-sm border border-blue-200/50">
    <rect width="100" height="100" fill="#0056B3" />
    <circle cx="38" cy="50" r="24" fill="#E11D48" />
    <circle cx="62" cy="50" r="24" fill="#2563EB" />
    <path d="M 50 26 A 24 24 0 0 0 50 74 A 24 24 0 0 0 50 26 Z" fill="#7C3AED" />
    <text x="50" y="57" fontSize="16" fontWeight="900" fontFamily="sans-serif" textAnchor="middle" fill="#FFFFFF">AT</text>
  </svg>
);

const getNetworkStyles = (network: string) => {
  const net = network?.toUpperCase() || "";
  if (net === "MTN") {
    return {
      cardBg: "bg-amber-50/70",
      cardBorder: "border-amber-200/80",
      iconBg: "bg-amber-100 text-amber-600",
      priceColor: "text-amber-700",
      labelBg: "bg-amber-100 text-amber-800",
      buttonBg: "bg-amber-600 hover:bg-amber-700 active:bg-amber-800"
    };
  }
  if (net === "VODAFONE" || net === "TELECEL") {
    return {
      cardBg: "bg-rose-50/70",
      cardBorder: "border-rose-200/80",
      iconBg: "bg-rose-100 text-rose-600",
      priceColor: "text-rose-700",
      labelBg: "bg-rose-100 text-rose-800",
      buttonBg: "bg-rose-600 hover:bg-rose-700 active:bg-rose-800"
    };
  }
  // AirtelTigo / Airtel / Tigo / Other
  return {
    cardBg: "bg-blue-50/70",
    cardBorder: "border-blue-200/80",
    iconBg: "bg-blue-100 text-blue-600",
    priceColor: "text-blue-700",
    labelBg: "bg-blue-100 text-blue-800",
    buttonBg: "bg-blue-600 hover:bg-blue-700 active:bg-blue-800"
  };
};

interface Agent {
  id: string | null;
  name: string;
  username: string;
  tagline: string;
}

interface Bundle {
  id: string;
  name: string;
  network: string;
  size_gb: number;
  min_resell_price: number;
  base_price: number;
  is_active: boolean;
  agent_price: number;
  base_cost: number;
}

export default function StoreClient({ slug }: { slug: string }) {
  const [agent, setAgent] = useState<Agent | null>(null);
  const [bundles, setBundles] = useState<Bundle[]>([]);
  const [platformFee, setPlatformFee] = useState(0.20);

  // Flow State: 1 = Select Bundle, 2 = Recipient Info, 3 = Summary, 4 = MoMo Payment, 5 = Success
  const [step, setStep] = useState(1);
  const [selectedBundle, setSelectedBundle] = useState<Bundle | null>(null);
  const [phone, setPhone] = useState("");
  const [network, setNetwork] = useState("MTN");
  
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

  const handleBundleSelect = (bundle: Bundle) => {
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
    if (!agent || !agent.id || !selectedBundle) return;
    
    setIsLoading(true);
    const dummyEmail = `${phone.replace(/\s+/g, '')}@patricks-info-tech.com`;
    const amountInPesewas = Math.round((selectedBundle.agent_price + platformFee) * 100);

    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
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
        onSuccess: (transaction: { reference: string }) => {
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
                const styles = getNetworkStyles(bundle.network);
                return (
                  <div 
                    key={bundle.id} 
                    className={`${styles.cardBg} ${styles.cardBorder} rounded-2xl border shadow-sm overflow-hidden flex flex-col`}
                  >
                    <div className="p-5 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        {bundle.network === 'MTN' && <MtnLogo />}
                        {(bundle.network === 'Vodafone' || bundle.network === 'Telecel') && <TelecelLogo />}
                        {(bundle.network === 'AirtelTigo' || bundle.network === 'AT') && <AirtelTigoLogo />}
                        {bundle.network !== 'MTN' && 
                         bundle.network !== 'Vodafone' && 
                         bundle.network !== 'Telecel' && 
                         bundle.network !== 'AirtelTigo' && 
                         bundle.network !== 'AT' && (
                          <div className={`w-12 h-12 rounded-xl ${styles.iconBg} flex items-center justify-center shrink-0`}>
                            <Zap className="h-6 w-6" />
                          </div>
                        )}
                        <div>
                          <h4 className="font-bold text-slate-900 text-base">{bundle.name}</h4>
                          <span className={`px-2 py-0.5 rounded text-[10px] font-extrabold tracking-wider ${styles.labelBg}`}>
                            {bundle.network}
                          </span>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className={`text-xl font-black ${styles.priceColor}`}>
                          {formatCurrency(bundle.agent_price)}
                        </div>
                        <p className="text-[9px] text-slate-400 font-extrabold uppercase">Plus GHS {platformFee.toFixed(2)} Fee</p>
                      </div>
                    </div>
                    <button 
                      onClick={() => handleBundleSelect(bundle)}
                      className={`w-full bg-slate-900 ${styles.buttonBg} text-white py-3.5 text-sm font-bold transition-all btn-animate min-h-[48px] cursor-pointer`}
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

            {/* Selected bundle reminder */}
            {(() => {
              const styles = getNetworkStyles(selectedBundle.network);
              return (
                <div className={`flex items-center gap-3 px-4 py-3 rounded-2xl border ${styles.cardBg} ${styles.cardBorder}`}>
                  <div className="shrink-0">
                    {selectedBundle.network === 'MTN' && <MtnLogo />}
                    {(selectedBundle.network === 'Vodafone' || selectedBundle.network === 'Telecel') && <TelecelLogo />}
                    {(selectedBundle.network === 'AirtelTigo' || selectedBundle.network === 'AT') && <AirtelTigoLogo />}
                    {!['MTN','Vodafone','Telecel','AirtelTigo','AT'].includes(selectedBundle.network) && (
                      <div className={`w-12 h-12 rounded-xl ${styles.iconBg} flex items-center justify-center`}>
                        <Zap className="h-6 w-6" />
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[10px] font-extrabold uppercase tracking-widest text-slate-400">You&apos;re buying</p>
                    <p className="font-black text-slate-900 text-sm leading-tight truncate">{selectedBundle.name}</p>
                    <p className={`text-xs font-bold ${styles.priceColor}`}>{formatCurrency(selectedBundle.agent_price)} <span className="text-slate-400 font-medium">+ GHS {platformFee.toFixed(2)} fee</span></p>
                  </div>
                  <button
                    onClick={() => setStep(1)}
                    className="text-[10px] font-bold text-slate-400 hover:text-slate-600 underline underline-offset-2 shrink-0"
                  >
                    Change
                  </button>
                </div>
              );
            })()}

            <div className="space-y-1.5 text-center sm:text-left">
              <h2 className="text-2xl font-black text-slate-900 tracking-tight">Recipient Info</h2>
              <p className="text-slate-500 text-sm leading-relaxed">Enter the phone number that will receive the data.</p>
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
                        className={`p-3 rounded-xl border-2 text-center transition-all min-h-[72px] flex flex-col items-center justify-center gap-2 ${
                          isSelected 
                            ? `${net.color} border-brand-primary text-brand-primary font-black scale-102` 
                            : "border-slate-200 text-slate-600 font-bold hover:border-slate-300 bg-white"
                        }`}
                      >
                        {net.id === "MTN" && <MtnLogo />}
                        {net.id === "Vodafone" && <TelecelLogo />}
                        {net.id === "AirtelTigo" && <AirtelTigoLogo />}
                        <span className="text-xs tracking-tight font-extrabold">{net.name}</span>
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

            {/* Selected bundle reminder */}
            {(() => {
              const styles = getNetworkStyles(selectedBundle.network);
              return (
                <div className={`flex items-center gap-3 px-4 py-3 rounded-2xl border ${styles.cardBg} ${styles.cardBorder}`}>
                  <div className="shrink-0">
                    {selectedBundle.network === 'MTN' && <MtnLogo />}
                    {(selectedBundle.network === 'Vodafone' || selectedBundle.network === 'Telecel') && <TelecelLogo />}
                    {(selectedBundle.network === 'AirtelTigo' || selectedBundle.network === 'AT') && <AirtelTigoLogo />}
                    {!['MTN','Vodafone','Telecel','AirtelTigo','AT'].includes(selectedBundle.network) && (
                      <div className={`w-12 h-12 rounded-xl ${styles.iconBg} flex items-center justify-center`}>
                        <Zap className="h-6 w-6" />
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[10px] font-extrabold uppercase tracking-widest text-slate-400">You&apos;re buying</p>
                    <p className="font-black text-slate-900 text-sm leading-tight truncate">{selectedBundle.name}</p>
                    <p className={`text-xs font-bold ${styles.priceColor}`}>{formatCurrency(selectedBundle.agent_price)} <span className="text-slate-400 font-medium">+ GHS {platformFee.toFixed(2)} fee</span></p>
                  </div>
                </div>
              );
            })()}

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
      <footer className="py-6 text-center border-t border-slate-200 bg-white space-y-2">
        <p className="text-xs text-slate-400 font-bold uppercase tracking-widest">
          Powered by <span className="text-slate-600 font-extrabold">Patrick&apos;s Info Tech Platform</span>
        </p>
        <p className="text-xs text-slate-400">
          Need help? <a href="https://wa.me/233276915317" target="_blank" rel="noopener noreferrer" className="text-brand-primary font-bold hover:underline inline-flex items-center gap-1">💬 WhatsApp Support</a>
        </p>
      </footer>
    </div>
  );
}

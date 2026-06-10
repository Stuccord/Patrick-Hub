"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { formatCurrency } from "@/lib/pricing";
import { 
  ShieldCheck, 
  CreditCard, 
  ArrowLeft, 
  Smartphone, 
  Loader2,
  CheckCircle2,
  Zap
} from "lucide-react";
import Link from "next/link";
import { createClient } from "@/lib/supabase";

interface PaystackTransaction {
  reference: string;
}

interface PaystackPopInstance {
  newTransaction: (opts: Record<string, unknown>) => void;
}

function CheckoutContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [reference, setReference] = useState("");
  const [agentId, setAgentId] = useState("");
  const [bundleId, setBundleId] = useState("");
  const [platformFee, setPlatformFee] = useState(0.20);
  const [phone, setPhone] = useState(searchParams.get("phone") || "");
  const [network, setNetwork] = useState('');
  const [fallbackRef, setFallbackRef] = useState("");
  const [isAgent, setIsAgent] = useState(false);
  const [activePrice, setActivePrice] = useState(parseFloat(searchParams.get("price") || "5.00"));

  // Get data from URL
  const bundleName = searchParams.get("bundle") || "Data Bundle";
  const totalPrice = activePrice + platformFee;

  const detectNetwork = (phoneNumber: string): string => {
    const cleaned = phoneNumber.replace(/\D/g, '');
    const prefix = cleaned.slice(0, 3);
    switch (prefix) {
      case '024': case '054': case '055': return 'MTN';
      case '026': case '056': return 'Telecel';
      case '020': case '050': return 'Airtel';
      case '027': case '057': return 'Vodafone';
      default: return '';
    }
  };

  useEffect(() => {
    async function loadPaymentDetails() {
      try {
        const supabase = createClient();
        
        // Fetch platform fee from DB
        const { data: feeConfig } = await supabase
          .from('platform_config')
          .select('value')
          .eq('key', 'transaction_fee')
          .maybeSingle();
        if (feeConfig) setPlatformFee(Number(feeConfig.value) || 0.20);

        // Get agent ID
        let resolvedAgentId = searchParams.get("agent_id") || "";
        if (!resolvedAgentId) {
          const { data: firstAgent } = await supabase
            .from('users')
            .select('id')
            .eq('status', 'active')
            .limit(1)
            .maybeSingle();
          if (firstAgent) resolvedAgentId = firstAgent.id;
        }
        setAgentId(resolvedAgentId);

        // Get bundle ID
        let resolvedBundleId = searchParams.get("bundle_id") || "";
        if (!resolvedBundleId) {
          const { data: bundleData } = await supabase
            .from('bundles')
            .select('id')
            .eq('name', bundleName)
            .maybeSingle();
          if (bundleData) {
            resolvedBundleId = bundleData.id;
          } else {
            const { data: anyBundle } = await supabase
              .from('bundles')
              .select('id')
              .eq('is_active', true)
              .limit(1)
              .maybeSingle();
            if (anyBundle) resolvedBundleId = anyBundle.id;
          }
        }
        setBundleId(resolvedBundleId);

        // Check if currently logged in user is the agent
        const { data: { user } } = await supabase.auth.getUser();
        const loggedInIsAgent = user && user.id === resolvedAgentId;
        setIsAgent(!!loggedInIsAgent);

        let finalPrice = parseFloat(searchParams.get("price") || "5.00");
        if (resolvedBundleId) {
          const { data: bundleData } = await supabase
            .from('bundles')
            .select('base_price, min_resell_price')
            .eq('id', resolvedBundleId)
            .maybeSingle();
          if (bundleData) {
            if (loggedInIsAgent) {
              finalPrice = Number(bundleData.base_price);
            } else {
              // Custom agent override pricing if they are buying as a customer
              const { data: override } = await supabase
                .from('agent_bundles')
                .select('selling_price')
                .eq('agent_id', resolvedAgentId)
                .eq('bundle_id', resolvedBundleId)
                .maybeSingle();
              finalPrice = override ? Number(override.selling_price) : Number(bundleData.min_resell_price);
            }
          }
        }
        setActivePrice(finalPrice);
      } catch (err) {
        console.error("Error loading payment db details:", err);
      }
    }
    loadPaymentDetails();
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setFallbackRef(`TXN-${Date.now().toString(36).toUpperCase()}`);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [bundleName]);

  const handlePayment = async () => {
    setIsProcessing(true);
    const dummyEmail = `${phone.replace(/\s+/g, '')}@patricks-info-tech.com`;
    const amountInPesewas = Math.round(totalPrice * 100);

    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const PaystackPop = (await import('@paystack/inline-js')).default as any;
      const paystack = new PaystackPop() as PaystackPopInstance;
      paystack.newTransaction({
        key: process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY || '',
        email: dummyEmail,
        amount: amountInPesewas,
        currency: "GHS",
        metadata: {
          custom_fields: [
            { display_name: "Customer Phone", variable_name: "customer_phone", value: phone }
          ],
          agent_id: agentId,
          bundle_id: bundleId,
          customer_phone: phone,
          customer_paid: totalPrice.toString(),
          platform_fee: platformFee.toString(),
          is_agent_purchase: isAgent ? "true" : "false"
        },
        onSuccess: (transaction: PaystackTransaction) => {
          setReference(transaction.reference);
          setIsProcessing(false);
          setIsSuccess(true);
        },
        onCancel: () => {
          setIsProcessing(false);
        }
      });
    } catch (err) {
      console.error("Error loading Paystack:", err);
      setIsProcessing(false);
      alert("Could not load payment gateway. Please try again.");
    }
  };

  // Network colour helpers
  const netColors: Record<string, { bg: string; text: string; icon: string }> = {
    MTN:        { bg: "bg-amber-100",   text: "text-amber-800",  icon: "🟡" },
    Telecel:    { bg: "bg-rose-100",    text: "text-rose-800",   icon: "🔴" },
    Vodafone:   { bg: "bg-rose-100",    text: "text-rose-800",   icon: "🔴" },
    AirtelTigo: { bg: "bg-blue-100",    text: "text-blue-800",   icon: "🔵" },
    Airtel:     { bg: "bg-blue-100",    text: "text-blue-800",   icon: "🔵" },
  };
  const netStyle = netColors[network] || { bg: "bg-slate-100", text: "text-slate-700", icon: "📶" };

  if (isSuccess) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="w-full max-w-md bg-white rounded-[2.5rem] p-10 text-center space-y-6 shadow-xl shadow-slate-200/50 border border-slate-100">
          <div className="inline-flex items-center justify-center w-24 h-24 bg-green-100 rounded-full text-green-500 mb-4">
            <CheckCircle2 className="h-12 w-12" />
          </div>
          <h1 className="text-3xl font-black text-slate-900">Payment Success!</h1>

          {/* Bundle delivered to */}
          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 text-sm space-y-2 text-left">
            <div className="flex justify-between">
              <span className="text-slate-500">Bundle</span>
              <span className="font-bold text-slate-900">{bundleName}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Delivered to</span>
              <span className="font-bold text-slate-900">{phone}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Amount paid</span>
              <span className="font-bold text-slate-900">{formatCurrency(totalPrice)}</span>
            </div>
          </div>

          <div className="bg-slate-50 p-3 rounded-2xl border border-slate-100 text-xs text-slate-400 font-mono text-center">
            REF: {reference || fallbackRef}
          </div>
          <Link 
            href="/" 
            className="block w-full bg-slate-900 text-white py-4 rounded-2xl font-bold hover:bg-slate-800 transition-all"
          >
            Back to Home
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md space-y-6">
        <button 
          onClick={() => router.back()}
          className="flex items-center gap-2 text-sm font-bold text-slate-500 hover:text-slate-900 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" /> Back to Store
        </button>

        {isAgent && (
          <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-2xl p-4 text-xs text-green-800 font-bold flex items-center gap-2 shadow-sm">
            <span>🛡️</span>
            <span>You are logged in as the store owner. You are purchasing at <strong>wholesale cost (base price)</strong>. No profit margin will be credited.</span>
          </div>
        )}

        <div className="bg-white rounded-[2.5rem] overflow-hidden shadow-xl shadow-slate-200/50 border border-slate-100">

          {/* Dark header — shows what's being bought */}
          <div className="bg-slate-900 p-8 text-white">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 bg-brand-primary rounded flex items-center justify-center text-[10px] font-black">D</div>
                <span className="text-sm font-bold opacity-80">Secure Checkout</span>
              </div>
              <ShieldCheck className="h-5 w-5 text-brand-primary" />
            </div>

            {/* Bundle being purchased */}
            <div className="bg-white/10 rounded-2xl p-4 mb-5 flex items-center gap-3">
              <div className="w-10 h-10 bg-brand-primary/20 rounded-xl flex items-center justify-center shrink-0">
                <Zap className="h-5 w-5 text-brand-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[10px] font-bold uppercase tracking-widest text-white/50">You&apos;re buying</p>
                <p className="font-black text-white text-base leading-tight truncate">{bundleName}</p>
              </div>
            </div>

            <div className="space-y-1">
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Total to Pay</p>
              <h2 className="text-4xl font-black">{formatCurrency(totalPrice)}</h2>
            </div>
          </div>

          <div className="p-8 space-y-8">
            {/* Order breakdown */}
            <div className="space-y-3">
              <div className="flex items-center justify-between text-sm">
                <span className="text-slate-500 font-medium">Bundle price</span>
                <span className="text-slate-900 font-bold">{formatCurrency(activePrice)}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-slate-500 font-medium">Platform fee</span>
                <span className="text-slate-900 font-bold">{formatCurrency(platformFee)}</span>
              </div>
              <div className="h-px bg-slate-100" />

              {/* Phone input */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Recipient Phone Number</label>
                <input 
                  type="tel"
                  value={phone}
                  onChange={(e) => {
                    const val = e.target.value;
                    setPhone(val);
                    setNetwork(detectNetwork(val));
                  }}
                  placeholder="e.g. 0241234567"
                  className="w-full px-4 h-12 border-2 border-slate-200 rounded-xl font-bold text-slate-900 text-sm outline-none focus:border-brand-primary transition-colors"
                />
                {network && (
                  <span className={`inline-flex items-center gap-1.5 text-xs font-bold px-2.5 py-1 rounded-full ${netStyle.bg} ${netStyle.text}`}>
                    {netStyle.icon} Detected: {network}
                  </span>
                )}
              </div>
            </div>

            {/* Payment method */}
            <div className="space-y-3">
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest">Payment Method</h3>
              <div className="flex items-center gap-4 p-4 rounded-2xl border-2 border-brand-primary bg-brand-light/20 relative overflow-hidden">
                <Smartphone className="h-6 w-6 text-brand-primary" />
                <div>
                  <p className="font-bold text-slate-900">Mobile Money</p>
                  <p className="text-xs text-slate-500 italic">MTN, Telecel, AT — powered by Paystack</p>
                </div>
                <div className="ml-auto w-5 h-5 rounded-full bg-brand-primary flex items-center justify-center">
                  <div className="w-2 h-2 bg-white rounded-full"></div>
                </div>
              </div>
            </div>

            <button 
              onClick={handlePayment}
              disabled={isProcessing || phone.replace(/\D/g,'').length < 10}
              className="w-full bg-brand-primary text-white py-5 rounded-2xl font-black text-lg flex items-center justify-center gap-2 shadow-xl shadow-brand-primary/30 hover:bg-brand-dark transition-all disabled:opacity-50 disabled:cursor-not-allowed btn-animate cursor-pointer"
            >
              {isProcessing ? (
                <>
                  <Loader2 className="h-6 w-6 animate-spin" />
                  Opening Payment...
                </>
              ) : (
                <>
                  <CreditCard className="h-6 w-6" />
                  Pay {formatCurrency(totalPrice)}
                </>
              )}
            </button>
          </div>
        </div>

        <p className="text-[10px] text-slate-400 font-medium uppercase tracking-widest text-center">
          Secured by Paystack
        </p>
      </div>
    </div>
  );
}

export default function CheckoutPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="h-8 w-8 animate-spin text-[#16A34A]" />
          <p className="text-sm font-medium text-slate-500">Loading Checkout...</p>
        </div>
      </div>
    }>
      <CheckoutContent />
    </Suspense>
  );
}

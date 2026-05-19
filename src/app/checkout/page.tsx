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
  CheckCircle2
} from "lucide-react";
import Link from "next/link";

function CheckoutContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  // Get data from URL (in production this would be validated from DB/State)
  const bundleName = searchParams.get("bundle") || "MTN 1GB";
  const agentPrice = parseFloat(searchParams.get("price") || "5.00");
  const platformFee = 0.20;
  const totalPrice = agentPrice + platformFee;
  const phone = searchParams.get("phone") || "0240000000";

  const handlePayment = () => {
    setIsProcessing(true);
    // Simulate payment processing
    setTimeout(() => {
      setIsProcessing(false);
      setIsSuccess(true);
    }, 2000);
  };

  if (isSuccess) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="w-full max-w-md bg-white rounded-[2.5rem] p-10 text-center space-y-6 shadow-xl shadow-slate-200/50 border border-slate-100">
          <div className="inline-flex items-center justify-center w-24 h-24 bg-green-100 rounded-full text-green-500 mb-4">
            <CheckCircle2 className="h-12 w-12" />
          </div>
          <h1 className="text-3xl font-black text-slate-900">Payment Success!</h1>
          <p className="text-slate-500 leading-relaxed">
            Your payment of <span className="font-bold text-slate-900">{formatCurrency(totalPrice)}</span> was successful. 
            The data bundle <span className="font-bold text-slate-900">{bundleName}</span> is being delivered to <span className="font-bold text-slate-900">{phone}</span>.
          </p>
          <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 text-xs text-slate-400 font-mono">
            REF: DH-{Math.random().toString(36).substring(7).toUpperCase()}
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

        <div className="bg-white rounded-[2.5rem] overflow-hidden shadow-xl shadow-slate-200/50 border border-slate-100">
          <div className="bg-slate-900 p-8 text-white">
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 bg-brand-primary rounded flex items-center justify-center text-[10px] font-black">D</div>
                <span className="text-sm font-bold opacity-80">Secure Checkout</span>
              </div>
              <ShieldCheck className="h-5 w-5 text-brand-primary" />
            </div>
            <div className="space-y-1">
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Amount to Pay</p>
              <h2 className="text-4xl font-black">{formatCurrency(totalPrice)}</h2>
            </div>
          </div>

          <div className="p-8 space-y-8">
            <div className="space-y-4">
              <div className="flex items-center justify-between text-sm">
                <span className="text-slate-500 font-medium">Bundle</span>
                <span className="text-slate-900 font-bold">{bundleName}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-slate-500 font-medium">Phone Number</span>
                <span className="text-slate-900 font-bold">{phone}</span>
              </div>
              <div className="h-px bg-slate-100"></div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-slate-500 font-medium">Subtotal</span>
                <span className="text-slate-900 font-bold">{formatCurrency(agentPrice)}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-slate-500 font-medium">Platform Fee</span>
                <span className="text-slate-900 font-bold">{formatCurrency(platformFee)}</span>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest">Payment Method</h3>
              <div className="grid grid-cols-1 gap-3">
                <div className="flex items-center gap-4 p-4 rounded-2xl border-2 border-brand-primary bg-brand-light/20 relative overflow-hidden">
                  <Smartphone className="h-6 w-6 text-brand-primary" />
                  <div>
                    <p className="font-bold text-slate-900">Mobile Money</p>
                    <p className="text-xs text-slate-500 italic">MTN, Telecel, AT</p>
                  </div>
                  <div className="ml-auto w-5 h-5 rounded-full bg-brand-primary flex items-center justify-center">
                    <div className="w-2 h-2 bg-white rounded-full"></div>
                  </div>
                </div>
              </div>
            </div>

            <button 
              onClick={handlePayment}
              disabled={isProcessing}
              className="w-full bg-brand-primary text-white py-5 rounded-2xl font-black text-lg flex items-center justify-center gap-2 shadow-xl shadow-brand-primary/30 hover:bg-brand-dark transition-all disabled:opacity-50 disabled:cursor-not-allowed btn-animate"
            >
              {isProcessing ? (
                <>
                  <Loader2 className="h-6 w-6 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  <CreditCard className="h-6 w-6" />
                  Pay Now
                </>
              )}
            </button>
          </div>
        </div>

        <div className="text-center space-y-4">
          <div className="flex items-center justify-center gap-4 grayscale opacity-40">
            <div className="h-8 w-12 bg-slate-200 rounded"></div>
            <div className="h-8 w-12 bg-slate-200 rounded"></div>
            <div className="h-8 w-12 bg-slate-200 rounded"></div>
          </div>
          <p className="text-[10px] text-slate-400 font-medium uppercase tracking-widest">
            Secured by Paystack
          </p>
        </div>
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

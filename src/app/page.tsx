"use client";

import Link from "next/link";
import { 
  ArrowRight, 
  Zap, 
  ShieldCheck, 
  TrendingUp, 
  Menu, 
  X, 
  ShoppingBag, 
  Users, 
  LineChart,
  Check,
  ChevronDown,
  Globe,
  CreditCard,
  Sparkles,
  Play
} from "lucide-react";
import { useState, useEffect } from "react";

export default function LandingPage() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  
  // High-energy simulated sales dashboard interactions
  const [salesCount, setSalesCount] = useState(248);
  const [earnedToday, setEarnedToday] = useState(475);
  const [recentSale, setRecentSale] = useState<{name: string, plan: string, profit: string} | null>(null);

  // old Pexels video states and hooks removed to resolve CORS issues

  useEffect(() => {
    const salesList = [
      { name: "Ama K.", plan: "MTN 1GB", profit: "GHS 1.50" },
      { name: "Kweku A.", plan: "Telecel 2GB", profit: "GHS 2.80" },
      { name: "Yao O.", plan: "AirtelTigo 5GB", profit: "GHS 4.20" },
      { name: "Esi B.", plan: "MTN 500MB", profit: "GHS 0.80" },
      { name: "Kofi N.", plan: "Telecel 10GB", profit: "GHS 8.50" }
    ];
    
    const interval = setInterval(() => {
      // Pick random sale
      const randomSale = salesList[Math.floor(Math.random() * salesList.length)];
      setRecentSale(randomSale);
      
      // Update stats
      setSalesCount(prev => prev + 1);
      setEarnedToday(prev => prev + parseFloat(randomSale.profit.replace("GHS ", "")));
      
      // Clear notification after 3.5 seconds
      setTimeout(() => {
        setRecentSale(null);
      }, 3500);
    }, 8000);
    
    return () => clearInterval(interval);
  }, []);

  const toggleFaq = (index: number) => {
    setOpenFaq(openFaq === index ? null : index);
  };

  const faqs = [
    {
      question: "How does the reselling platform work?",
      answer: "After creating a free account, you can instantly deploy your own customized data store. Simply configure your desired bundle prices, share your unique store URL, and start selling. We handle the technical delivery of data bundles instantly, while you collect the profits directly."
    },
    {
      question: "What are the costs to set up a store?",
      answer: "It is 100% free to get started. There are no registration fees, monthly hosting fees, or hidden costs. We only charge a small 5% commission on withdrawals, meaning we only make money when you are successfully earning."
    },
    {
      question: "How do payouts work in Ghana?",
      answer: "Every time a customer purchases a bundle from your store, your profit margin is immediately credited to your virtual wallet. You can trigger an automated withdrawal at any time, and the funds will land in your Mobile Money wallet (MTN, Telecel, or AirtelTigo) in under 60 seconds."
    }
  ];

  return (
    <div className="min-h-screen bg-slate-50/50 selection:bg-[#16A34A] selection:text-white overflow-x-hidden font-sans text-slate-900">
      
      {/* NAVBAR: Height 64px (h-16), Sticky, Premium Dark Glassmorphism Look */}
      <nav 
        className="sticky top-0 z-50 h-16 flex items-center border-b border-white/10"
        style={{
          background: 'rgba(0, 0, 0, 0.2)',
          backdropFilter: 'blur(12px)',
          WebkitBackdropFilter: 'blur(12px)'
        }}
      >
        <div className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 flex items-center justify-between">
          {/* Logo Area */}
          <div className="flex items-center gap-2 group cursor-pointer">
            <div className="w-9 h-9 bg-gradient-to-br from-[#16A34A] to-[#15803D] rounded-xl flex items-center justify-center text-white font-black text-lg shadow-md shadow-[#16A34A]/20 transform transition-transform group-hover:scale-105 duration-200">
              P
            </div>
            <span className="text-xl font-extrabold text-white tracking-tight flex items-center">
              PatrickHub<span className="text-[#16A34A] text-2xl leading-none">.</span>
            </span>
          </div>

          {/* Desktop Navigation Links */}
          <div className="hidden lg:flex items-center gap-8 text-[14px] font-semibold text-white">
            <a href="#features" className="hover:text-[#4ADE80] transition-colors duration-200">Features</a>
            <a href="#how-it-works" className="hover:text-[#4ADE80] transition-colors duration-200">How it Works</a>
            <a href="#pricing" className="hover:text-[#4ADE80] transition-colors duration-200">Pricing</a>
            <a href="#faqs" className="hover:text-[#4ADE80] transition-colors duration-200">FAQs</a>
            <a href="/login" className="hover:text-[#4ADE80] transition-colors duration-200 mr-2">Login</a>
            <Link 
              href="/register" 
              className="bg-[#16A34A] text-white px-5 py-2.5 rounded-full font-bold text-[14px] shadow-lg shadow-[#16A34A]/25 hover:shadow-[#15803D]/30 hover:bg-[#15803D] hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 min-h-0"
            >
              Get Started
            </Link>
          </div>

          {/* Mobile Hamburger Button */}
          <button 
            onClick={() => setMenuOpen(!menuOpen)}
            className="lg:hidden p-2 text-white hover:text-white/80 hover:bg-white/10 rounded-lg focus:outline-none flex items-center justify-center min-h-0 transition-colors"
            aria-label="Toggle Menu"
          >
            {menuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>

        {/* Mobile Dropdown Drawer Menu */}
        {menuOpen && (
          <div className="lg:hidden absolute top-16 left-0 w-full border-b border-white/10 bg-slate-950/95 backdrop-blur-xl px-6 py-6 space-y-4 shadow-xl animate-in slide-in-from-top-4 duration-200 z-50">
            <a 
              href="#features" 
              onClick={() => setMenuOpen(false)}
              className="block font-bold text-white hover:text-[#4ADE80] py-2.5 border-b border-white/5 text-[15px] transition-colors"
            >
              Features
            </a>
            <a 
              href="#how-it-works" 
              onClick={() => setMenuOpen(false)}
              className="block font-bold text-white hover:text-[#4ADE80] py-2.5 border-b border-white/5 text-[15px] transition-colors"
            >
              How it Works
            </a>
            <a 
              href="#pricing" 
              onClick={() => setMenuOpen(false)}
              className="block font-bold text-white hover:text-[#4ADE80] py-2.5 border-b border-white/5 text-[15px] transition-colors"
            >
              Pricing
            </a>
            <a 
              href="#faqs" 
              onClick={() => setMenuOpen(false)}
              className="block font-bold text-white hover:text-[#4ADE80] py-2.5 border-b border-white/5 text-[15px] transition-colors"
            >
              FAQs
            </a>
            <a 
              href="/login" 
              onClick={() => setMenuOpen(false)}
              className="block font-bold text-white hover:text-[#4ADE80] py-2.5 border-b border-white/5 text-[15px] transition-colors"
            >
              Login
            </a>
            <Link 
              href="/register" 
              onClick={() => setMenuOpen(false)}
              className="block bg-[#16A34A] text-white text-center py-3.5 rounded-full font-bold text-[15px] shadow-lg shadow-[#16A34A]/25 min-h-0"
            >
              Get Started
            </Link>
          </div>
        )}
      </nav>

      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes float1 {
          0%, 100% { transform: translate(0, 0) scale(1); }
          50% { transform: translate(30px, -40px) scale(1.1); }
        }
        @keyframes float2 {
          0%, 100% { transform: translate(0, 0) scale(1); }
          50% { transform: translate(-20px, 30px) scale(0.9); }
        }
        @keyframes float3 {
          0%, 100% { transform: translate(-50%, -50%) scale(1); }
          50% { transform: translate(-50%, -50%) scale(1.2); }
        }
        .animate-float1 {
          animation: float1 8s ease-in-out infinite;
        }
        .animate-float2 {
          animation: float2 10s ease-in-out infinite;
        }
        .animate-float3 {
          animation: float3 12s ease-in-out infinite;
        }
      ` }} />

      {/* HERO SECTION: Looping stock video cover background & Fallback dark-emerald gradient */}
      <section 
        className="relative overflow-hidden pt-12 pb-24 lg:pt-16 lg:pb-36"
        style={{
          background: 'linear-gradient(135deg, #0a1628, #0f2d1a)',
          position: 'relative',
          overflow: 'hidden'
        }}
      >
        <video
          autoPlay
          muted
          loop
          playsInline
          preload="auto"
          style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            minWidth: '100%',
            minHeight: '100%',
            width: 'auto',
            height: 'auto',
            transform: 'translate(-50%, -50%)',
            objectFit: 'cover',
            zIndex: 0
          }}
        >
          <source src="hero-video.mp4" type="video/mp4" />
        </video>
        
        {/* Fallback Animated Floating Green Orbs */}
        <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
          {/* Orb 1 */}
          <div 
            className="absolute animate-float1"
            style={{
              width: '500px',
              height: '500px',
              background: 'radial-gradient(circle, rgba(22,163,74,0.3), transparent)',
              position: 'absolute',
              top: '-100px',
              left: '-100px'
            }}
          />
          {/* Orb 2 */}
          <div 
            className="absolute animate-float2"
            style={{
              width: '400px',
              height: '400px',
              background: 'radial-gradient(circle, rgba(22,163,74,0.2), transparent)',
              position: 'absolute',
              bottom: '-50px',
              right: '200px'
            }}
          />
          {/* Orb 3 */}
          <div 
            className="absolute animate-float3"
            style={{
              width: '300px',
              height: '300px',
              background: 'radial-gradient(circle, rgba(74,222,128,0.15), transparent)',
              position: 'absolute',
              top: '50%',
              left: '40%',
              transform: 'translate(-50%, -50%)'
            }}
          />
        </div>

        {/* Keep the dark overlay exactly as before */}
        <div className="hero-overlay" style={{
          position: 'absolute',
          inset: 0,
          background: 'rgba(0, 0, 0, 0.60)',
          zIndex: 1
        }}></div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-[2] pt-[40px]">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
            
            {/* Left Column: Floating Trust Badge, Headings, CTA Buttons, Social Proof */}
            <div className="lg:col-span-7 flex flex-col items-center lg:items-start text-center lg:text-left space-y-6">
              
              {/* Floating stats strip intro badge styled exactly as requested */}
              <div 
                className="inline-flex items-center gap-2.5 px-4 py-2 rounded-full text-white text-[12px] font-extrabold border shadow-[0_4px_12px_rgba(0,0,0,0.15)] transform hover:scale-[1.02] transition-transform duration-200 cursor-default"
                style={{
                  backgroundColor: 'rgba(255, 255, 255, 0.15)',
                  borderColor: 'rgba(255, 255, 255, 0.30)',
                  backdropFilter: 'blur(8px)',
                  WebkitBackdropFilter: 'blur(8px)'
                }}
              >
                <span>🇬🇭</span> Serving 500+ agents across Ghana
              </div>

              {/* Ghana Reseller Pill */}
              <div className="inline-flex items-center gap-2 px-3.5 py-2 rounded-full bg-white/10 border border-white/30 text-white text-[11px] font-extrabold tracking-wider uppercase shadow-sm">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#4ADE80] opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-[#4ADE80]"></span>
                </span>
                Ghana's #1 Reseller Platform
              </div>

              {/* Heading (2 lines, font-weight 800, clamp size, leading 1.1) */}
              <h1 className="text-[clamp(44px,6vw,80px)] font-extrabold leading-[1.1] tracking-tight text-white w-full">
                <span className="block mb-1 text-white">Build Your Own</span>
                <span className="text-[#4ADE80] block">
                  Data Empire.
                </span>
              </h1>

              {/* Subtext */}
              <p className="text-white/80 text-base md:text-lg leading-relaxed max-w-[540px] font-medium">
                Empower your business with Ghana's ultimate data reselling software. Instantly deploy your own branded web store, sell high-demand data bundles at wholesale rates, and enjoy direct automatic payouts.
              </p>

              {/* CTA Buttons Row */}
              <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto pt-2 justify-center lg:justify-start">
                <Link 
                  href="/register" 
                  className="bg-[#16A34A] text-white px-8 py-4 rounded-full font-bold text-[15px] shadow-lg shadow-[#16A34A]/25 hover:shadow-[#15803D]/30 hover:bg-[#15803D] hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 flex items-center justify-center gap-2 min-h-0 text-center"
                >
                  Get Started Now
                  <ArrowRight className="h-4 w-4" />
                </Link>
                <a 
                  href="#how-it-works" 
                  className="bg-transparent border-2 border-white text-white px-8 py-4 rounded-full font-bold text-[15px] hover:bg-white hover:text-slate-900 hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 flex items-center justify-center gap-2 min-h-0 text-center"
                >
                  <Play className="h-4 w-4 fill-current text-[#4ADE80]" />
                  Watch Demo
                </a>
              </div>

              {/* Social Proof Section with diverse colors */}
              <div className="flex flex-col sm:flex-row items-center gap-4 justify-center lg:justify-start pt-6 border-t border-white/10 w-full max-w-md">
                <div className="flex -space-x-3">
                  <div className="w-10 h-10 rounded-full border-2 border-[#1e293b] bg-gradient-to-br from-emerald-400 to-emerald-600 text-white flex items-center justify-center font-extrabold text-xs shadow-sm uppercase shrink-0">
                    AD
                  </div>
                  <div className="w-10 h-10 rounded-full border-2 border-[#1e293b] bg-gradient-to-br from-indigo-400 to-indigo-600 text-white flex items-center justify-center font-extrabold text-xs shadow-sm uppercase shrink-0">
                    KO
                  </div>
                  <div className="w-10 h-10 rounded-full border-2 border-[#1e293b] bg-gradient-to-br from-pink-400 to-pink-600 text-white flex items-center justify-center font-extrabold text-xs shadow-sm uppercase shrink-0">
                    EA
                  </div>
                  <div className="w-10 h-10 rounded-full border-2 border-[#1e293b] bg-gradient-to-br from-amber-400 to-amber-600 text-white flex items-center justify-center font-extrabold text-xs shadow-sm uppercase shrink-0">
                    YM
                  </div>
                  <div className="w-10 h-10 rounded-full border-2 border-[#1e293b] bg-[#16A34A] text-white flex items-center justify-center font-extrabold text-xs shadow-sm uppercase shrink-0">
                    10K+
                  </div>
                </div>
                <div className="text-center sm:text-left">
                  <div className="flex items-center justify-center sm:justify-start gap-1">
                    <span className="text-amber-400 text-lg font-bold">★★★★★</span>
                  </div>
                  <p className="text-[13px] font-bold text-white/80">Joined by 10,000+ active resellers in Ghana</p>
                </div>
              </div>
            </div>

            {/* Right Column: Premium Mockup Dashboard Card */}
            <div className="lg:col-span-5 relative w-full max-w-md mx-auto lg:max-w-none">
              
              {/* Daily Sales Hover Card */}
              <div className="absolute -top-4 -right-4 bg-white border border-slate-100 shadow-[0_8px_30px_rgb(0,0,0,0.06)] px-5 py-3 rounded-2xl flex items-center gap-3 z-20 shrink-0 animate-bounce duration-[3000ms] transition-transform">
                <div className="w-8 h-8 rounded-full bg-[#F0FDF4] flex items-center justify-center text-[#16A34A]">
                  <TrendingUp className="h-4 w-4" />
                </div>
                <div>
                  <p className="text-[10px] text-slate-400 font-extrabold uppercase tracking-wider">Earnings Today</p>
                  <p className="text-sm font-black text-[#16A34A]">GH₵ {earnedToday.toFixed(2)}</p>
                </div>
              </div>

              {/* Automated Sales Live Toast Notification (Flashes when a sale is simulated) */}
              {recentSale && (
                <div className="absolute bottom-4 -left-6 bg-[#0F172A] text-white shadow-2xl px-4 py-3 rounded-xl flex items-center gap-3 z-30 shrink-0 max-w-[280px] animate-in fade-in slide-in-from-bottom-5 duration-300">
                  <div className="w-8 h-8 rounded-full bg-[#16A34A] flex items-center justify-center text-white shrink-0">
                    <Zap className="h-4 w-4 fill-current text-white animate-pulse" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-[11px] text-slate-300 font-bold leading-tight">{recentSale.name} just sold {recentSale.plan}</p>
                    <p className="text-[10px] text-[#16A34A] font-extrabold">Instant Profit: +{recentSale.profit}</p>
                  </div>
                </div>
              )}

              {/* Main Store Mockup Frame */}
              <div className="bg-white border border-slate-100 rounded-[28px] shadow-[0_24px_70px_rgba(15,23,42,0.08)] p-6 relative overflow-hidden transition-all duration-300 hover:shadow-[0_30px_80px_rgba(22,163,74,0.12)] group">
                
                {/* Visual Browser Header */}
                <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-5">
                  <div className="flex items-center gap-1.5">
                    <span className="w-3 h-3 rounded-full bg-red-400"></span>
                    <span className="w-3 h-3 rounded-full bg-amber-400"></span>
                    <span className="w-3 h-3 rounded-full bg-emerald-400"></span>
                    <span className="text-[11px] text-slate-400 font-semibold ml-2 tracking-tight">mystore.patrickhub.com</span>
                  </div>
                  <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-[#F0FDF4] text-[#16A34A] text-[10px] font-extrabold border border-[#DCFCE7]">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#16A34A] animate-ping"></span>
                    Store Status: Active
                  </span>
                </div>

                {/* Dashboard Meta */}
                <div className="space-y-1 mb-5">
                  <h3 className="text-base font-black text-slate-800 tracking-tight">My Store Dashboard</h3>
                  <p className="text-[11px] text-slate-400 font-bold uppercase tracking-wider">Live Metrics Overview</p>
                </div>

                {/* Store Branding Pill Row */}
                <div className="flex items-center justify-between gap-3 bg-slate-50 border border-slate-100 p-3 rounded-2xl mb-5">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-emerald-500 to-green-600 text-white flex items-center justify-center font-extrabold text-sm shrink-0 shadow-sm">
                      KT
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-black text-slate-800 leading-tight truncate">Kofi Tech Solutions</p>
                      <p className="text-[10px] text-slate-400 font-bold">Authorized Agent</p>
                    </div>
                  </div>
                  <span className="inline-flex items-center gap-0.5 px-2.5 py-1 rounded-full bg-[#F0FDF4] text-[#15803D] text-[10px] font-extrabold border border-[#DCFCE7] shrink-0">
                    Verified Agent ✓
                  </span>
                </div>

                {/* Live Sales Stat Bar */}
                <div className="grid grid-cols-2 gap-3 mb-5">
                  <div className="bg-slate-50 border border-slate-100 p-3.5 rounded-2xl">
                    <span className="text-[10px] text-slate-400 font-extrabold uppercase tracking-wider block mb-1">Sales Today</span>
                    <span className="text-lg font-black text-slate-800">{salesCount} Orders</span>
                  </div>
                  <div className="bg-slate-50 border border-slate-100 p-3.5 rounded-2xl">
                    <span className="text-[10px] text-slate-400 font-extrabold uppercase tracking-wider block mb-1">Store Rating</span>
                    <span className="text-lg font-black text-[#16A34A]">4.9 / 5.0 ★</span>
                  </div>
                </div>

                {/* Customer Facing Bundle Products List */}
                <div className="space-y-3 mb-5">
                  <p className="text-[10px] text-slate-400 font-extrabold uppercase tracking-wider">Active Inventory Packages</p>
                  
                  {/* Item 1 */}
                  <div className="flex items-center justify-between p-3.5 bg-white border border-slate-100 rounded-2xl hover:border-[#16A34A] hover:bg-slate-50/50 transition-all duration-200 group/item cursor-pointer">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-amber-100 text-amber-800 flex items-center justify-center font-extrabold text-[10px] shrink-0">
                        MTN
                      </div>
                      <div className="min-w-0">
                        <p className="font-extrabold text-slate-800 text-xs sm:text-[13px] leading-tight">1GB MTN Data</p>
                        <p className="text-[10px] text-slate-400 font-bold leading-none mt-0.5">Wholesale cost: GH₵ 4.20</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2.5 shrink-0">
                      <div className="text-right">
                        <p className="font-black text-[#16A34A] text-xs sm:text-[13px] leading-tight">GH₵ 5.50</p>
                        <p className="text-[9px] text-[#15803D] font-extrabold">Profit: +GH₵ 1.30</p>
                      </div>
                      <span className="h-6 px-2 bg-[#16A34A] text-white rounded-md text-[9px] font-bold transition-colors min-h-0 flex items-center justify-center shadow-sm">
                        View
                      </span>
                    </div>
                  </div>

                  {/* Item 2 */}
                  <div className="flex items-center justify-between p-3.5 bg-white border border-slate-100 rounded-2xl hover:border-[#16A34A] hover:bg-slate-50/50 transition-all duration-200 group/item cursor-pointer">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-red-100 text-red-800 flex items-center justify-center font-extrabold text-[10px] shrink-0">
                        TEL
                      </div>
                      <div className="min-w-0">
                        <p className="font-extrabold text-slate-800 text-xs sm:text-[13px] leading-tight">5GB Telecel Data</p>
                        <p className="text-[10px] text-slate-400 font-bold leading-none mt-0.5">Wholesale cost: GH₵ 17.50</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2.5 shrink-0">
                      <div className="text-right">
                        <p className="font-black text-[#16A34A] text-xs sm:text-[13px] leading-tight">GH₵ 22.00</p>
                        <p className="text-[9px] text-[#15803D] font-extrabold">Profit: +GH₵ 4.50</p>
                      </div>
                      <span className="h-6 px-2 bg-[#16A34A] text-white rounded-md text-[9px] font-bold transition-colors min-h-0 flex items-center justify-center shadow-sm">
                        View
                      </span>
                    </div>
                  </div>
                </div>

                {/* Dashboard Action Button */}
                <Link 
                  href="/register" 
                  className="w-full h-11 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-2xl text-[12px] flex items-center justify-center transition-colors min-h-0 shadow-md shadow-slate-900/10 cursor-pointer"
                >
                  Customize My Store Bundle Catalog
                </Link>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* FEATURES SECTION: Unique Selling Points with Unsplash Images */}
      <section className="bg-white py-20 sm:py-28 border-t border-slate-100 relative" id="features">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="text-center space-y-4 max-w-2xl mx-auto mb-16">
            <span className="text-[#16A34A] text-[11px] font-black tracking-widest uppercase block">Why Choose PatrickHub?</span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-[#0F172A] tracking-tight">
              Everything you need to launch a profitable business
            </h2>
            <p className="text-[15px] sm:text-base text-slate-500 font-semibold leading-relaxed">
              Designed specifically for the Ghanaian market. Run your enterprise from your phone or PC with absolute ease.
            </p>
          </div>

          {/* 3-Column Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 sm:gap-10 mt-16">
            
            {/* Card 1: Your Own Brand */}
            <div className="bg-slate-50 border border-slate-100 rounded-3xl overflow-hidden flex flex-col justify-between transition-all duration-300 hover:border-[#16A34A]/30 hover:bg-white hover:shadow-[0_16px_40px_rgba(0,0,0,0.03)] group">
              <img 
                src="https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=400" 
                alt="Your Own Store" 
                className="w-full h-[160px] object-cover shrink-0" 
              />
              <div className="p-5 flex-1 flex flex-col items-start">
                <h3 className="text-lg font-black text-[#0F172A] mb-3">
                  Your Own Custom Brand
                </h3>
                <p className="text-[14px] text-slate-500 leading-relaxed font-medium">
                  Deploy your unique store link on custom subdomains or full domains. Personalize it with your brand name, color palettes, customer contact info, and custom slogans.
                </p>
              </div>
            </div>

            {/* Card 2: Automated Payouts */}
            <div className="bg-slate-50 border border-slate-100 rounded-3xl overflow-hidden flex flex-col justify-between transition-all duration-300 hover:border-[#16A34A]/30 hover:bg-white hover:shadow-[0_16px_40px_rgba(0,0,0,0.03)] group">
              <img 
                src="https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=400" 
                alt="Set Your Own Prices" 
                className="w-full h-[160px] object-cover shrink-0" 
              />
              <div className="p-5 flex-1 flex flex-col items-start">
                <h3 className="text-lg font-black text-[#0F172A] mb-3">
                  Automated MoMo Payouts
                </h3>
                <p className="text-[14px] text-slate-500 leading-relaxed font-medium">
                  Withdraw your accumulated profits instantly in real-time. Direct out-of-the-box integration with MTN Mobile Money, Telecel Cash, and AirtelTigo wallets 24 hours a day.
                </p>
              </div>
            </div>

            {/* Card 3: Best Wholesale Rates */}
            <div className="bg-slate-50 border border-slate-100 rounded-3xl overflow-hidden flex flex-col justify-between transition-all duration-300 hover:border-[#16A34A]/30 hover:bg-white hover:shadow-[0_16px_40px_rgba(0,0,0,0.03)] group">
              <img 
                src="https://images.unsplash.com/photo-1521737711867-e3b97375f902?w=400" 
                alt="Instant Commissions" 
                className="w-full h-[160px] object-cover shrink-0" 
              />
              <div className="p-5 flex-1 flex flex-col items-start">
                <h3 className="text-lg font-black text-[#0F172A] mb-3">
                  Industry Wholesale Rates
                </h3>
                <p className="text-[14px] text-slate-500 leading-relaxed font-medium">
                  Acquire MTN, Telecel, and AirtelTigo packages at baseline wholesale prices. Set your profit margins freely and beat local pricing in any offline or online community.
                </p>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* NEW: HOW IT WORKS VIDEO SECTION */}
      <section className="bg-[#F8FAFC] py-20 px-6 border-t border-slate-100" id="how-it-works">
        <div className="max-w-4xl mx-auto">
          
          <div className="text-center space-y-4 mb-10">
            <h2 className="text-[28px] font-bold text-[#0F172A]">See How PatrickHub Works</h2>
            <p className="text-[15px] text-[#64748B] max-w-xl mx-auto leading-relaxed">
              Watch how easy it is to set up your store and start earning in minutes.
            </p>
          </div>

          {/* YouTube Video Embed Frame */}
          <div className="relative w-full aspect-video rounded-2xl overflow-hidden shadow-[0_20px_60px_rgba(0,0,0,0.15)] border-none mb-10 bg-black">
            <iframe 
              src="https://www.youtube.com/embed/EngW7tLk6R8" 
              title="See How PatrickHub Works" 
              className="absolute top-0 left-0 w-full h-full border-none rounded-2xl"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
              allowFullScreen
            ></iframe>
          </div>

          {/* Three small step badges */}
          <div className="flex flex-wrap gap-4 justify-center">
            <div className="bg-white border border-[#E2E8F0] px-5 py-2.5 rounded-full text-[13px] font-semibold text-[#374151] shadow-sm transform hover:scale-105 transition-transform duration-200 cursor-default">
              📝 Register as agent
            </div>
            <div className="bg-white border border-[#E2E8F0] px-5 py-2.5 rounded-full text-[13px] font-semibold text-[#374151] shadow-sm transform hover:scale-105 transition-transform duration-200 cursor-default">
              🏪 Get your store link
            </div>
            <div className="bg-white border border-[#E2E8F0] px-5 py-2.5 rounded-full text-[13px] font-semibold text-[#374151] shadow-sm transform hover:scale-105 transition-transform duration-200 cursor-default">
              💰 Start earning
            </div>
          </div>

        </div>
      </section>

      {/* PRICING PREVIEW CARD GRID */}
      <section className="bg-white py-20 sm:py-28 border-t border-slate-100" id="pricing">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="text-center space-y-4 max-w-2xl mx-auto mb-16">
            <span className="text-[#16A34A] text-[11px] font-black tracking-widest uppercase block">Unbeatable Value</span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-[#0F172A] tracking-tight">
              Start with absolute zero setup fee
            </h2>
            <p className="text-[15px] sm:text-base text-slate-500 font-semibold leading-relaxed">
              We grow only when your reselling empire grows. Transparent plans designed for micro-entrepreneurs.
            </p>
          </div>

          <div className="max-w-md mx-auto bg-slate-50 border border-slate-100 rounded-[32px] shadow-[0_20px_50px_rgba(15,23,42,0.03)] overflow-hidden">
            <div className="p-8 sm:p-10 text-center space-y-5">
              <span className="inline-block px-4 py-1.5 rounded-full bg-[#F0FDF4] text-[#16A34A] text-xs font-black uppercase tracking-wider">Free Partner Plan</span>
              <div className="flex items-baseline justify-center gap-1">
                <span className="text-5xl font-black text-[#0F172A]">GH₵ 0</span>
                <span className="text-slate-400 font-bold text-sm">/ setup fee</span>
              </div>
              <p className="text-[13px] text-slate-500 font-semibold leading-relaxed">Everything is fully ready for deployment. Create your account and deploy your domain in 5 minutes flat.</p>
              
              <div className="border-t border-slate-100 pt-6 space-y-4 text-left">
                <div className="flex items-center gap-3 text-slate-700 text-sm font-semibold">
                  <Check className="h-5 w-5 text-[#16A34A] shrink-0" />
                  <span>Branded URL subdomain (yourstore.com)</span>
                </div>
                <div className="flex items-center gap-3 text-slate-700 text-sm font-semibold">
                  <Check className="h-5 w-5 text-[#16A34A] shrink-0" />
                  <span>Unlimited MTN, Telecel, AirtelTigo packages</span>
                </div>
                <div className="flex items-center gap-3 text-slate-700 text-sm font-semibold">
                  <Check className="h-5 w-5 text-[#16A34A] shrink-0" />
                  <span>Automated 24/7 Mobile Money Payouts</span>
                </div>
                <div className="flex items-center gap-3 text-slate-700 text-sm font-semibold">
                  <Check className="h-5 w-5 text-[#16A34A] shrink-0" />
                  <span>Real-time Sales & Performance Tracking</span>
                </div>
              </div>

              <div className="pt-6">
                <Link 
                  href="/register" 
                  className="block w-full text-center py-4 bg-[#16A34A] hover:bg-[#15803D] text-white font-extrabold rounded-2xl text-[14px] shadow-lg shadow-[#16A34A]/25 transition-all duration-200 min-h-0"
                >
                  Launch My Free Store Link
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* DYNAMIC FAQ ACCORDION SECTION */}
      <section className="bg-slate-50/50 py-20 sm:py-28 border-t border-slate-100" id="faqs">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="text-center space-y-4 mb-16">
            <span className="text-[#16A34A] text-[11px] font-black tracking-widest uppercase block">Got Questions?</span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-[#0F172A] tracking-tight">
              Frequently Asked Questions
            </h2>
            <p className="text-[15px] sm:text-base text-slate-500 font-semibold leading-relaxed">
              Find instant answers to general questions regarding setups, bundle networks, and wallet payouts.
            </p>
          </div>

          <div className="space-y-4">
            {faqs.map((faq, index) => {
              const isOpen = openFaq === index;
              return (
                <div 
                  key={index} 
                  className="bg-white border border-slate-100 rounded-2xl overflow-hidden transition-all duration-300"
                >
                  <button
                    onClick={() => toggleFaq(index)}
                    className="w-full px-6 py-5 flex items-center justify-between text-left focus:outline-none min-h-0 group"
                  >
                    <span className="font-extrabold text-[#0F172A] text-sm sm:text-base group-hover:text-[#16A34A] transition-colors duration-200">
                      {faq.question}
                    </span>
                    <span className={`w-8 h-8 rounded-full bg-slate-50 flex items-center justify-center shadow-sm text-slate-400 group-hover:text-[#16A34A] transition-transform duration-300 ${isOpen ? "rotate-180" : ""}`}>
                      <ChevronDown className="h-4 w-4" />
                    </span>
                  </button>

                  {/* Accordion Expandable panel */}
                  <div 
                    className={`transition-all duration-300 ease-in-out overflow-hidden ${
                      isOpen ? "max-h-[200px] border-t border-slate-100/60 opacity-100" : "max-h-0 opacity-0"
                    }`}
                  >
                    <div className="px-6 py-5 text-[14px] sm:text-[15px] text-slate-500 font-medium leading-relaxed bg-white">
                      {faq.answer}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

        </div>
      </section>

      {/* NEW: TESTIMONIALS SECTION */}
      <section className="bg-white py-16 px-6 border-t border-slate-100" id="testimonials">
        <div className="max-w-7xl mx-auto">
          
          <div className="text-center mb-12">
            <h2 className="text-[22px] font-bold text-[#0F172A]">What our agents say</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            
            {/* Card 1 */}
            <div className="bg-white border border-[#E2E8F0] rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow duration-200 flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-3 mb-4">
                  <img 
                    src="https://i.pravatar.cc/60?img=11" 
                    alt="Ama Serwaa" 
                    className="w-12 h-12 rounded-full border border-slate-100 object-cover shrink-0" 
                  />
                  <div>
                    <h4 className="text-[14px] font-bold text-[#0F172A]">Ama Serwaa</h4>
                    <p className="text-[12px] text-[#64748B]">Kumasi, Ghana 🇬🇭</p>
                  </div>
                </div>
                <div className="text-sm text-[#F59E0B] mb-3">★★★★★</div>
                <p className="text-[14px] text-[#475569] leading-relaxed italic font-medium">
                  "I started earning from day one. My customers love how easy it is to buy data from my store link."
                </p>
              </div>
            </div>

            {/* Card 2 */}
            <div className="bg-white border border-[#E2E8F0] rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow duration-200 flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-3 mb-4">
                  <img 
                    src="https://i.pravatar.cc/60?img=33" 
                    alt="Kwame Mensah" 
                    className="w-12 h-12 rounded-full border border-slate-100 object-cover shrink-0" 
                  />
                  <div>
                    <h4 className="text-[14px] font-bold text-[#0F172A]">Kwame Mensah</h4>
                    <p className="text-[12px] text-[#64748B]">Accra, Ghana 🇬🇭</p>
                  </div>
                </div>
                <div className="text-sm text-[#F59E0B] mb-3">★★★★★</div>
                <p className="text-[14px] text-[#475569] leading-relaxed italic font-medium">
                  "PatrickHub changed my hustle completely. I now have 50+ regular customers buying data through my link every week."
                </p>
              </div>
            </div>

            {/* Card 3 */}
            <div className="bg-white border border-[#E2E8F0] rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow duration-200 flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-3 mb-4">
                  <img 
                    src="https://i.pravatar.cc/60?img=45" 
                    alt="Abena Osei" 
                    className="w-12 h-12 rounded-full border border-slate-100 object-cover shrink-0" 
                  />
                  <div>
                    <h4 className="text-[14px] font-bold text-[#0F172A]">Abena Osei</h4>
                    <p className="text-[12px] text-[#64748B]">Takoradi, Ghana 🇬🇭</p>
                  </div>
                </div>
                <div className="text-sm text-[#F59E0B] mb-3">★★★★★</div>
                <p className="text-[14px] text-[#475569] leading-relaxed italic font-medium">
                  "The withdrawal system is seamless. Money goes straight to my MoMo. I recommend PatrickHub to every data seller."
                </p>
              </div>
            </div>

          </div>

        </div>
      </section>

      {/* CTA BANNER: Full width linear gradient */}
      <section className="py-20 px-6 bg-gradient-to-br from-[#16A34A] to-[#15803D] text-center text-white relative overflow-hidden">
        {/* Abstract background blobs */}
        <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-white/5 rounded-full -mr-48 -mt-48 pointer-events-none"></div>
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-white/5 rounded-full -ml-48 -mb-48 pointer-events-none"></div>

        <div className="relative max-w-4xl mx-auto space-y-6">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/10 text-white text-[11px] font-black tracking-wider uppercase mb-2">
            🚀 JOIN THE DATA REVOLUTION
          </div>
          <h2 className="text-3xl sm:text-5xl font-extrabold leading-tight tracking-tight">
            Ready to start your data reselling empire?
          </h2>
          <p className="text-base sm:text-lg text-emerald-100/80 font-medium max-w-xl mx-auto">
            Take full control of your schedule, set your markup margins, and withdraw instantly using Mobile Money.
          </p>
          <div className="pt-4">
            <Link 
              href="/register" 
              className="bg-white hover:bg-slate-50 text-[#16A34A] font-black rounded-full px-10 py-4.5 transition-all shadow-xl hover:shadow-2xl hover:scale-[1.03] active:scale-[0.97] duration-200 inline-block min-h-0 text-[15px]"
            >
              Deploy Your Free Store Now
            </Link>
          </div>
        </div>
      </section>

      {/* FOOTER SECTION: Structured grid, dark navy background */}
      <footer className="bg-[#0F172A] py-16 px-6 border-t border-slate-800 text-slate-400">
        <div className="max-w-7xl mx-auto">
          
          <div className="grid grid-cols-1 md:grid-cols-12 gap-10 pb-16">
            
            {/* Column 1: Brand Info */}
            <div className="md:col-span-5 space-y-5 text-center md:text-left">
              <div className="flex items-center justify-center md:justify-start gap-2">
                <div className="w-8 h-8 bg-[#16A34A] rounded-lg flex items-center justify-center text-white font-black text-base shadow-md shadow-[#16A34A]/10">
                  P
                </div>
                <span className="text-lg font-extrabold text-white tracking-tight">PatrickHub.</span>
              </div>
              <p className="text-[13.5px] leading-relaxed max-w-sm text-slate-400 font-medium">
                Ghana's ultimate data reselling software platform. We enable micro-entrepreneurs and agencies to instantly build branded stores, sell major network bundles, and grow their businesses automatically.
              </p>
            </div>

            {/* Column 2: Product */}
            <div className="md:col-span-2 space-y-4 text-center md:text-left">
              <p className="text-white text-xs font-black uppercase tracking-widest">Product</p>
              <div className="flex flex-col gap-3 text-sm font-semibold">
                <a href="#features" className="hover:text-white transition-colors duration-200">Features</a>
                <a href="#how-it-works" className="hover:text-white transition-colors duration-200">How it Works</a>
                <a href="/store/test-agent" className="hover:text-white transition-colors duration-200">Live Demo Store</a>
              </div>
            </div>

            {/* Column 3: Resources */}
            <div className="md:col-span-2 space-y-4 text-center md:text-left">
              <p className="text-white text-xs font-black uppercase tracking-widest">Resources</p>
              <div className="flex flex-col gap-3 text-sm font-semibold">
                <a href="#faqs" className="hover:text-white transition-colors duration-200">FAQ Documentation</a>
                <a href="/login" className="hover:text-white transition-colors duration-200">Partner Login</a>
                <a href="/register" className="hover:text-white transition-colors duration-200">Create Account</a>
              </div>
            </div>

            {/* Column 4: Legal */}
            <div className="md:col-span-3 space-y-4 text-center md:text-left">
              <p className="text-white text-xs font-black uppercase tracking-widest">Legal</p>
              <div className="flex flex-col gap-3 text-sm font-semibold">
                <a href="#" className="hover:text-white transition-colors duration-200">Terms of Service</a>
                <a href="#" className="hover:text-white transition-colors duration-200">Privacy Policy</a>
                <a href="#" className="hover:text-white transition-colors duration-200">Reseller Agreement</a>
              </div>
            </div>

          </div>

          {/* Bottom Divider & Copyright */}
          <div className="border-t border-slate-800 pt-8 flex flex-col md:flex-row items-center justify-between gap-4 text-center md:text-left">
            <p className="text-xs text-slate-500 font-bold uppercase tracking-wider">
              © 2025 PatrickHub. All rights reserved.
            </p>
            <p className="text-xs text-slate-600 font-medium">
              Made with 💚 for Ghanaian Entrepreneurs
            </p>
          </div>

        </div>
      </footer>

    </div>
  );
}

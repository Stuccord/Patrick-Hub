"use client";

import { useState } from "react";
import { ArrowRight, Mail, Lock, Store, ShieldAlert, Eye, EyeOff } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase";

export default function LoginPage() {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      let user = null;

      try {
        const supabase = createClient();
        const { data: dbUser, error: dbError } = await supabase
          .from('users')
          .select('*')
          .eq('email', formData.email)
          .single();

        if (!dbError && dbUser) {
          user = dbUser;
        }
      } catch (supabaseErr) {
        console.warn("Supabase login skipped or failed, falling back to LocalStorage simulation.", supabaseErr);
      }

      if (formData.email === "admin@patrickhub.com" && formData.password === "admin123") {
        user = {
          role: "admin",
          name: "Super Admin",
          email: "admin@patrickhub.com",
          status: "active"
        };
      }

      if (!user) {
        const localUsers = JSON.parse(localStorage.getItem("patrickhub_users") || "[]");
        const foundLocal = localUsers.find((u: any) => u.email === formData.email && u.password_hash === formData.password);
        if (foundLocal) {
          user = foundLocal;
        }
      }

      if (!user) {
        throw new Error("Invalid login credentials");
      }

      if (user.role === 'admin') {
        router.push("/admin");
      } else {
        if (user.status === 'pending') {
          setError("Your account is awaiting approval by an administrator.");
        } else if (user.status === 'suspended') {
          setError("Your account has been suspended.");
        } else {
          localStorage.setItem("current_agent", JSON.stringify(user));
          router.push("/dashboard");
        }
      }
    } catch (err: any) {
      console.error(err);
      setError(err.message || "An error occurred during login");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center space-y-2 flex flex-col items-center">
          <Link href="/" className="inline-flex items-center justify-center w-16 h-16 bg-brand-primary rounded-2xl text-white mb-2 shadow-xl shadow-brand-primary/20 hover:scale-105 transition-transform duration-200">
            <Store className="h-8 w-8" />
          </Link>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900">Welcome Back</h1>
          <p className="text-sm text-slate-500">Sign in to your PatrickHub account</p>
        </div>

        <div className="bg-white p-5 sm:p-8 rounded-3xl border border-slate-200 shadow-xl shadow-slate-200/50 space-y-6">
          {error && (
            <div className="bg-red-50 text-red-600 p-4 rounded-xl text-sm border border-red-100 flex items-start gap-2">
              <ShieldAlert className="w-5 h-5 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-700 block">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                <input 
                  type="email" 
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  placeholder="kofi@patrickhub.com"
                  className="w-full pl-10 pr-4 h-12 rounded-xl border border-slate-200 focus:ring-2 focus:ring-brand-primary focus:border-transparent outline-none transition-all text-base text-slate-900"
                />
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-sm font-bold text-slate-700 block">Password</label>
                <Link href="#" className="text-xs font-bold text-brand-primary hover:underline">
                  Forgot?
                </Link>
              </div>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                <input 
                  type={showPassword ? "text" : "password"} 
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                  placeholder="••••••••"
                  className="w-full pl-10 pr-12 h-12 rounded-xl border border-slate-200 focus:ring-2 focus:ring-brand-primary focus:border-transparent outline-none transition-all text-base text-slate-900"
                />
                <button 
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 focus:outline-none h-10 w-10 flex items-center justify-center"
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
            </div>

            <button 
              type="submit" 
              disabled={loading}
              className="w-full bg-brand-primary text-white h-12 rounded-xl font-bold flex items-center justify-center gap-2 shadow-lg shadow-brand-primary/20 hover:bg-brand-dark transition-all btn-animate disabled:opacity-70 mt-6"
            >
              {loading ? "Signing in..." : "Sign In"}
              {!loading && <ArrowRight className="h-5 w-5" />}
            </button>
          </form>

          <div className="text-center space-y-4">
            <p className="text-sm text-slate-500">
              Don't have an account?{" "}
              <Link href="/register" className="font-bold text-brand-primary hover:underline">
                Register as Agent
              </Link>
            </p>
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 text-left">
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider text-center">Demo Admin Access</p>
              <p className="text-xs text-slate-600 mt-1 font-semibold text-center">Email: <span className="font-mono bg-white px-1.5 py-0.5 rounded border border-slate-200">admin@patrickhub.com</span> | Pass: <span className="font-mono bg-white px-1.5 py-0.5 rounded border border-slate-200">admin123</span></p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

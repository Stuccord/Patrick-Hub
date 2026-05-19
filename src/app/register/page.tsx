"use client";

import { useState } from "react";
import { ArrowRight, User, Mail, Store, ShieldCheck, Phone, Lock, CheckCircle2, Eye, EyeOff } from "lucide-react";
import Link from "next/link";
import { createClient } from "@/lib/supabase";

export default function RegisterPage() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    username: "",
    password: "",
    confirmPassword: "",
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");
  
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match");
      setLoading(false);
      return;
    }

    try {
      try {
        const supabase = createClient();
        const { error: dbError } = await supabase.from('users').insert([{
          name: formData.name,
          email: formData.email,
          phone: formData.phone,
          username: formData.username,
          role: 'agent',
          status: 'pending',
          password_hash: formData.password 
        }]);

        if (dbError) throw dbError;
      } catch (supabaseErr) {
        console.warn("Supabase insert skipped or failed, falling back to LocalStorage simulation.", supabaseErr);
      }

      const localUsers = JSON.parse(localStorage.getItem("patrickhub_users") || "[]");
      if (localUsers.find((u: any) => u.email === formData.email || u.username === formData.username)) {
        throw new Error("User with this email or username already exists");
      }

      const newUser = {
        id: "usr_" + Math.random().toString(36).substr(2, 9),
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        username: formData.username,
        role: 'agent',
        status: 'pending',
        password_hash: formData.password,
        wallet: 0
      };
      
      localUsers.push(newUser);
      localStorage.setItem("patrickhub_users", JSON.stringify(localUsers));

      setSuccess(true);
    } catch (err: any) {
      console.error(err);
      setError(err.message || "An error occurred during registration");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  if (success) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="w-full max-w-md bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-xl text-center space-y-6">
          <div className="mx-auto w-16 h-16 bg-green-100 text-brand-primary rounded-full flex items-center justify-center mb-4">
            <CheckCircle2 className="h-8 w-8" />
          </div>
          <h2 className="text-2xl font-black text-slate-900">Account Submitted!</h2>
          <p className="text-slate-500 text-sm">
            Your agent account has been created and is awaiting admin approval. We will notify you once you are approved.
          </p>
          <Link href="/login" className="block w-full bg-brand-primary text-white py-4 rounded-xl font-bold mt-6 hover:bg-brand-dark transition-all btn-animate flex items-center justify-center">
            Go to Login
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4 py-12">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center space-y-2 flex flex-col items-center">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-brand-primary rounded-2xl text-white mb-2 shadow-xl shadow-brand-primary/20">
            <Store className="h-8 w-8" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900">Become an Agent</h1>
          <p className="text-slate-500 text-sm">Start your data reselling business today</p>
        </div>

        <div className="bg-white p-5 sm:p-8 rounded-3xl border border-slate-200 shadow-xl shadow-slate-200/50 space-y-6">
          {error && (
            <div className="bg-red-50 text-red-600 p-4 rounded-xl text-sm border border-red-100">
              {error}
            </div>
          )}
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-700 block">Full Name</label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                <input 
                  type="text" 
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  placeholder="Kofi Ghana"
                  className="w-full pl-10 pr-4 h-12 rounded-xl border border-slate-200 focus:ring-2 focus:ring-brand-primary focus:border-transparent outline-none transition-all text-base text-slate-900"
                />
              </div>
            </div>

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
              <label className="text-sm font-bold text-slate-700 block">Phone Number</label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                <input 
                  type="tel" 
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  required
                  placeholder="024 000 0000"
                  className="w-full pl-10 pr-4 h-12 rounded-xl border border-slate-200 focus:ring-2 focus:ring-brand-primary focus:border-transparent outline-none transition-all text-base text-slate-900"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-700 block">Store Username (Slug)</label>
              <div className="relative">
                <Store className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                <input 
                  type="text" 
                  name="username"
                  value={formData.username}
                  onChange={handleChange}
                  required
                  placeholder="kofi-data"
                  className="w-full pl-10 pr-4 h-12 rounded-xl border border-slate-200 focus:ring-2 focus:ring-brand-primary focus:border-transparent outline-none transition-all text-base text-slate-900"
                />
              </div>
              <p className="text-[10px] text-slate-400 font-bold">Your store will be at: localhost:3000/store/{formData.username || 'username'}</p>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-700 block">Password</label>
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

            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-700 block">Confirm Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                <input 
                  type={showConfirmPassword ? "text" : "password"} 
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  required
                  placeholder="••••••••"
                  className="w-full pl-10 pr-12 h-12 rounded-xl border border-slate-200 focus:ring-2 focus:ring-brand-primary focus:border-transparent outline-none transition-all text-base text-slate-900"
                />
                <button 
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 focus:outline-none h-10 w-10 flex items-center justify-center"
                >
                  {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
            </div>

            <button 
              type="submit" 
              disabled={loading}
              className="w-full bg-brand-primary text-white h-12 rounded-xl font-bold flex items-center justify-center gap-2 shadow-lg shadow-brand-primary/20 hover:bg-brand-dark transition-all btn-animate disabled:opacity-70 mt-6"
            >
              {loading ? "Submitting..." : "Create Account"}
              {!loading && <ArrowRight className="h-5 w-5" />}
            </button>
          </form>

          <div className="text-center">
            <p className="text-sm text-slate-500">
              Already have an account?{" "}
              <Link href="/login" className="font-bold text-brand-primary hover:underline">
                Sign In
              </Link>
            </p>
          </div>
        </div>

        <div className="bg-brand-light/50 p-4 rounded-2xl border border-brand-primary/10 flex items-start gap-3">
          <ShieldCheck className="h-5 w-5 text-brand-primary shrink-0" />
          <p className="text-xs text-brand-dark/70 leading-relaxed">
            Note: All agent accounts require manual approval by the administrator before you can start reselling.
          </p>
        </div>
      </div>
    </div>
  );
}

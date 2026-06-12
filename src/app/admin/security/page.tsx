"use client";

import React, { useState } from "react";
import { ShieldCheck, KeyRound, Eye, EyeOff, AlertCircle, Laptop, Smartphone } from "lucide-react";
import { createClient } from "@/lib/supabase";

export default function AdminSecurity() {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!password) {
      setError("Password cannot be empty");
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters long");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    setLoading(true);
    try {
      const supabase = createClient();
      const { error: updateError } = await supabase.auth.updateUser({
        password: password,
      });

      if (updateError) {
        throw updateError;
      }

      setSuccess("Your password has been successfully updated!");
      setPassword("");
      setConfirmPassword("");
    } catch (err: unknown) {
      console.error("[Security] Error changing password:", err);
      setError(err instanceof Error ? err.message : "Failed to update password. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const getPasswordStrength = () => {
    if (!password) return { label: "", color: "bg-slate-200", width: "w-0" };
    if (password.length < 6) return { label: "Weak", color: "bg-red-500", width: "w-1/3" };
    const hasLetters = /[a-zA-Z]/.test(password);
    const hasNumbers = /\d/.test(password);
    const hasSpecial = /[^a-zA-Z\d]/.test(password);

    if (hasLetters && hasNumbers && hasSpecial && password.length >= 8) {
      return { label: "Strong", color: "bg-green-500", width: "w-full" };
    }
    return { label: "Medium", color: "bg-amber-500", width: "w-2/3" };
  };

  const strength = getPasswordStrength();

  return (
    <div className="p-4 sm:p-6 max-w-[800px] mx-auto space-y-6 pb-24 lg:pb-8">
      {/* Header */}
      <div className="flex items-center justify-between h-10 w-full gap-4 shrink-0">
        <div>
          <h1 className="text-[20px] font-semibold text-[#111827] tracking-tight leading-none shrink-0">
            Security Settings
          </h1>
          <p className="text-[12px] text-[#9CA3AF] mt-1.5 hidden sm:block">
            Protect your administrator account and monitor active sessions.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Left Column: Form (span 2) */}
        <div className="md:col-span-2 space-y-6">
          <div className="bg-white border border-[#E5E7EB] rounded-xl shadow-[0_1px_3px_rgba(0,0,0,0.05)] p-5 sm:p-6">
            <h3 className="text-[16px] font-bold text-[#111827] mb-1.5 flex items-center gap-2">
              <KeyRound className="w-4.5 h-4.5 text-[#16A34A]" /> Update Password
            </h3>
            <p className="text-[12px] text-[#6B7280] mb-5">
              Change the password you use to sign in to your administrator dashboard.
            </p>

            {error && (
              <div className="bg-red-50 border border-red-100 rounded-lg p-3.5 text-[12px] text-red-600 flex items-start gap-2 mb-4">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            {success && (
              <div className="bg-green-50 border border-green-100 rounded-lg p-3.5 text-[12px] text-green-600 flex items-start gap-2 mb-4">
                <ShieldCheck className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{success}</span>
              </div>
            )}

            <form onSubmit={handlePasswordChange} className="space-y-4">
              <div className="space-y-1.5">
                <label className="block text-[11px] font-bold uppercase tracking-wider text-[#6B7280]">
                  New Password
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    placeholder="Minimum 6 characters"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="w-full h-10 px-3 pr-10 bg-white border border-[#E5E7EB] rounded-lg text-[13px] text-[#374151] placeholder-[#9CA3AF] focus:border-[#16A34A] focus:outline-none transition-colors"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-[#9CA3AF] hover:text-[#374151] p-1 flex items-center justify-center"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {password && (
                <div className="space-y-1.5 pt-0.5">
                  <div className="flex items-center justify-between text-[11px] font-medium text-[#6B7280]">
                    <span>Password Strength:</span>
                    <span className="font-bold">{strength.label}</span>
                  </div>
                  <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                    <div className={`h-full ${strength.color} ${strength.width} transition-all duration-300`}></div>
                  </div>
                </div>
              )}

              <div className="space-y-1.5">
                <label className="block text-[11px] font-bold uppercase tracking-wider text-[#6B7280]">
                  Confirm New Password
                </label>
                <div className="relative">
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    placeholder="Re-type new password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                    className="w-full h-10 px-3 pr-10 bg-white border border-[#E5E7EB] rounded-lg text-[13px] text-[#374151] placeholder-[#9CA3AF] focus:border-[#16A34A] focus:outline-none transition-colors"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-[#9CA3AF] hover:text-[#374151] p-1 flex items-center justify-center"
                  >
                    {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={loading || !password}
                  className="w-full h-10 bg-[#16A34A] hover:bg-[#15803D] disabled:opacity-50 text-white rounded-lg text-[13px] font-semibold transition-all cursor-pointer min-h-0 shadow-sm flex items-center justify-center gap-1.5"
                >
                  {loading ? "Saving changes..." : "Update Password"}
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* Right Column: Sessions (span 1) */}
        <div className="space-y-6">
          <div className="bg-white border border-[#E5E7EB] rounded-xl shadow-[0_1px_3px_rgba(0,0,0,0.05)] p-5">
            <h3 className="text-[14px] font-bold text-[#111827] mb-3 flex items-center gap-2">
              🛡️ Active Session
            </h3>
            
            <div className="space-y-4">
              <div className="flex items-start gap-3 p-3 bg-slate-50 border border-slate-100 rounded-lg">
                <Laptop className="w-5 h-5 text-[#16A34A] shrink-0 mt-0.5" />
                <div className="min-w-0">
                  <p className="text-[12px] font-bold text-[#111827] truncate">This Device (Browser)</p>
                  <p className="text-[10px] text-[#9CA3AF] mt-0.5">Windows PC · Chrome Browser</p>
                  <span className="inline-flex items-center mt-2 px-2 py-0.5 bg-[#F0FDF4] text-[#15803D] text-[9px] font-bold rounded-full">
                    Active Session
                  </span>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3 bg-slate-50/50 border border-slate-100/50 rounded-lg opacity-70">
                <Smartphone className="w-5 h-5 text-slate-400 shrink-0 mt-0.5" />
                <div className="min-w-0">
                  <p className="text-[12px] font-bold text-[#374151] truncate">Mobile App Session</p>
                  <p className="text-[10px] text-[#9CA3AF] mt-0.5">iPhone · Safari Browser</p>
                  <p className="text-[9px] text-[#9CA3AF] mt-1 font-semibold">Checked: 2 hours ago</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

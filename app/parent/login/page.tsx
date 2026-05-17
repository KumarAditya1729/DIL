"use client";

import { useState } from "react";
import { parentLogin } from "@/app/actions/parent";
import { Music2, Mail, Lock, Eye, EyeOff, Loader2 } from "lucide-react";

export default function ParentLoginPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");
    const formData = new FormData(e.currentTarget);
    const res = await parentLogin(formData);
    if (res?.error) {
      setError(res.error);
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-purple-950/30 to-slate-950 flex items-center justify-center p-4">
      {/* Background orbs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-600/10 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-pink-600/10 rounded-full blur-3xl" />
      </div>

      <div className="w-full max-w-md relative">
        {/* Card */}
        <div className="bg-white/5 backdrop-blur-2xl border border-white/10 rounded-3xl p-8 shadow-2xl">
          {/* Logo */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-primary-500 to-pink-500 shadow-lg shadow-purple-500/30 mb-4">
              <Music2 className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-white">Parent Portal</h1>
            <p className="text-slate-400 text-sm mt-1">Track your child&apos;s journey at DIL Academy</p>
          </div>

          {/* Error */}
          {error && (
            <div className="mb-4 p-3 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 text-sm text-center">
              {error}
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-300">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                <input
                  name="email"
                  type="email"
                  required
                  placeholder="your@email.com"
                  className="w-full pl-10 pr-4 py-3 bg-white/5 border border-white/10 hover:border-white/20 focus:border-primary-500 rounded-xl text-white placeholder:text-slate-600 outline-none transition-colors text-sm"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-300">Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                <input
                  name="password"
                  type={showPassword ? "text" : "password"}
                  required
                  placeholder="••••••••"
                  className="w-full pl-10 pr-10 py-3 bg-white/5 border border-white/10 hover:border-white/20 focus:border-primary-500 rounded-xl text-white placeholder:text-slate-600 outline-none transition-colors text-sm"
                />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors">
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 bg-gradient-to-r from-primary-600 to-pink-600 hover:from-primary-500 hover:to-pink-500 text-white rounded-xl font-semibold shadow-lg shadow-purple-500/25 transition-all duration-300 flex items-center justify-center gap-2 disabled:opacity-70 mt-2"
            >
              {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
              {isLoading ? "Signing in..." : "Sign In →"}
            </button>
          </form>

          <p className="text-center text-slate-600 text-xs mt-6">
            Academy staff?{" "}
            <a href="/login" className="text-primary-400 hover:text-primary-300 transition-colors">
              Admin Login →
            </a>
          </p>
        </div>

        <p className="text-center text-slate-700 text-xs mt-6">
          © 2024 Dance Is Life Art & Study Center. All rights reserved.
        </p>
      </div>
    </div>
  );
}

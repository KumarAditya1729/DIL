"use client";

import { useState } from "react";
import { parentLogin, parentRegister } from "@/app/actions/parent";
import { Mail, Lock, Eye, EyeOff, Loader2, ArrowRight } from "lucide-react";
import Link from "next/link";
import { motion } from "framer-motion";

export default function ParentLoginPage() {
  const [isSignUp, setIsSignUp] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    const formData = new FormData(e.currentTarget);
    
    if (isSignUp) {
      const password = formData.get("password") as string;
      const confirmPassword = formData.get("confirmPassword") as string;

      if (password !== confirmPassword) {
        setError("Passwords do not match.");
        setIsLoading(false);
        return;
      }

      const res = await parentRegister(formData);
      if (res?.error) {
        setError(res.error);
        setIsLoading(false);
      }
    } else {
      const res = await parentLogin(formData);
      if (res?.error) {
        setError(res.error);
        setIsLoading(false);
      }
    }
  };

  return (
    <div className="min-h-screen flex bg-[var(--background)] font-sans">
      
      {/* Left Side - Image/Brand (Parent specific) */}
      <div className="hidden lg:flex w-1/2 relative bg-black items-center justify-center overflow-hidden">
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1508700929628-666bc8bd84ea?q=80&w=2574&auto=format&fit=crop')] bg-cover bg-center opacity-50 mix-blend-luminosity"></div>
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent"></div>
        
        <div className="relative z-10 p-12 w-full h-full flex flex-col justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center">
              <span className="text-black font-bold text-sm tracking-tighter">DIL</span>
            </div>
            <span className="font-semibold text-lg text-white tracking-tight">Dance Is Life OS</span>
          </div>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.8 }}
            className="max-w-md"
          >
            <h2 className="text-4xl font-bold text-white leading-tight mb-4 tracking-tighter">Stay connected with your child&apos;s journey.</h2>
            <p className="text-white/60 text-lg">Track attendance, review payments, and never miss an update.</p>
          </motion.div>
        </div>
      </div>

      {/* Right Side - Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 sm:p-12">
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-md"
        >
          <div className="mb-10 lg:hidden flex items-center gap-3 justify-center">
            <div className="w-8 h-8 rounded-full bg-[var(--foreground)] flex items-center justify-center">
              <span className="text-[var(--background)] font-bold text-sm tracking-tighter">DIL</span>
            </div>
            <span className="font-semibold text-lg text-[var(--foreground)] tracking-tight">Dance Is Life OS</span>
          </div>

          <div className="mb-10">
            <h1 className="text-3xl font-bold text-[var(--foreground)] tracking-tight mb-2">
              {isSignUp ? "Create Account" : "Parent Portal"}
            </h1>
            <p className="text-[var(--muted)]">
              {isSignUp 
                ? "Register to track attendance and pay fees." 
                : "Sign in to track your child's journey."}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <label className="text-sm font-semibold text-[var(--foreground)]">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[var(--muted)]" />
                <input
                  name="email"
                  type="email"
                  required
                  placeholder="parent@email.com"
                  className="w-full pl-11 pr-4 py-3.5 rounded-xl border border-[var(--border-color)] bg-[var(--card-bg)] focus:bg-[var(--background)] focus:border-[var(--foreground)] focus:ring-1 focus:ring-[var(--foreground)] outline-none transition-all text-[var(--foreground)]"
                />
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <label className="text-sm font-semibold text-[var(--foreground)]">Password</label>
                {!isSignUp && (
                  <a href="#" className="text-sm text-[var(--muted)] hover:text-[var(--foreground)] transition-colors">Forgot password?</a>
                )}
              </div>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[var(--muted)]" />
                <input
                  name="password"
                  type={showPassword ? "text" : "password"}
                  required
                  placeholder="••••••••"
                  className="w-full pl-11 pr-11 py-3.5 rounded-xl border border-[var(--border-color)] bg-[var(--card-bg)] focus:bg-[var(--background)] focus:border-[var(--foreground)] focus:ring-1 focus:ring-[var(--foreground)] outline-none transition-all text-[var(--foreground)]"
                />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-[var(--muted)] hover:text-[var(--foreground)] transition-colors">
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {isSignUp && (
              <motion.div 
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                className="space-y-2"
              >
                <label className="text-sm font-semibold text-[var(--foreground)]">Confirm Password</label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[var(--muted)]" />
                  <input
                    name="confirmPassword"
                    type={showPassword ? "text" : "password"}
                    required
                    placeholder="••••••••"
                    className="w-full pl-11 pr-11 py-3.5 rounded-xl border border-[var(--border-color)] bg-[var(--card-bg)] focus:bg-[var(--background)] focus:border-[var(--foreground)] focus:ring-1 focus:ring-[var(--foreground)] outline-none transition-all text-[var(--foreground)]"
                  />
                </div>
              </motion.div>
            )}

            {error && (
              <motion.div 
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                className="p-3 bg-red-50 dark:bg-red-950/30 border border-red-100 dark:border-red-900/50 rounded-xl"
              >
                <p className="text-sm text-red-600 dark:text-red-400 font-medium text-center">{error}</p>
              </motion.div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-4 px-4 bg-[var(--foreground)] hover:bg-[var(--foreground)]/90 text-[var(--background)] rounded-xl font-semibold transition-all flex items-center justify-center disabled:opacity-70 disabled:cursor-not-allowed group"
            >
              {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : null}
              {!isLoading && (
                <span className="flex items-center gap-2">
                  {isSignUp ? "Create Account" : "Sign In"} <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </span>
              )}
            </button>
          </form>

          <div className="mt-8 pt-8 border-t border-[var(--border-color)] flex flex-col items-center gap-4">
            <button
              type="button"
              onClick={() => {
                setIsSignUp(!isSignUp);
                setError("");
              }}
              className="text-sm text-[var(--foreground)] font-semibold hover:underline transition-all"
            >
              {isSignUp ? "Already have an account? Sign In" : "New to DIL Academy? Create Account"}
            </button>
            
            <Link href="/login" className="text-sm text-[var(--muted)] hover:text-[var(--foreground)] transition-colors">
              Academy Staff Login →
            </Link>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

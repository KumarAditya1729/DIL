"use client";

import { useFormState, useFormStatus } from "react-dom";
import { authenticate } from "@/app/actions/auth";
import { Lock, Mail, Loader2, ArrowRight } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button 
      disabled={pending}
      type="submit" 
      className="w-full py-4 px-4 bg-[var(--foreground)] hover:bg-[var(--foreground)]/90 text-[var(--background)] rounded-xl font-semibold transition-all flex items-center justify-center disabled:opacity-70 disabled:cursor-not-allowed group"
    >
      {pending ? <Loader2 className="w-5 h-5 animate-spin" /> : (
        <span className="flex items-center gap-2">Sign In <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" /></span>
      )}
    </button>
  );
}

export default function LoginPage() {
  const [errorMessage, dispatch] = useFormState(authenticate, undefined);

  return (
    <div className="min-h-screen flex bg-[var(--background)] font-sans">
      {/* Left Side - Image/Brand */}
      <div className="hidden lg:flex w-1/2 relative bg-black items-center justify-center overflow-hidden">
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1547153760-18fc86324498?q=80&w=2574&auto=format&fit=crop')] bg-cover bg-center opacity-50 mix-blend-luminosity"></div>
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent"></div>
        
        <div className="relative z-10 p-12 w-full h-full flex flex-col justify-between">
          <div className="flex items-center gap-3">
            <div className="relative h-12 w-32">
              <Image src="/logo.png" alt="Dance Is Life" fill className="object-contain drop-shadow-lg" sizes="128px" />
            </div>
          </div>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.8 }}
            className="max-w-md"
          >
            <h2 className="text-4xl font-bold text-white leading-tight mb-4 tracking-tighter">Manage your academy with precision.</h2>
            <p className="text-white/60 text-lg">The premier operating system for elite dance academies.</p>
          </motion.div>
        </div>
      </div>

      {/* Right Side - Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 sm:p-12">
        <motion.div 
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-md"
        >
          <div className="mb-10 lg:hidden flex items-center gap-3 justify-center">
            <div className="relative h-10 w-32">
              <Image src="/logo.png" alt="Dance Is Life" fill className="object-contain" sizes="128px" />
            </div>
          </div>

          <div className="mb-10">
            <h1 className="text-3xl font-bold text-[var(--foreground)] tracking-tight mb-2">Welcome back</h1>
            <p className="text-[var(--muted)]">Sign in to your staff dashboard to continue.</p>
          </div>

          <form action={dispatch} className="space-y-6">
            <div className="space-y-2">
              <label className="text-sm font-semibold text-[var(--foreground)]">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[var(--muted)]" />
                <input 
                  type="email" 
                  name="email"
                  required
                  placeholder="admin@academy.com" 
                  className="w-full pl-11 pr-4 py-3.5 rounded-xl border border-[var(--border-color)] bg-[var(--card-bg)] focus:bg-[var(--background)] focus:border-[var(--foreground)] focus:ring-1 focus:ring-[var(--foreground)] outline-none transition-all text-[var(--foreground)]"
                />
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <label className="text-sm font-semibold text-[var(--foreground)]">Password</label>
                <a href="#" className="text-sm text-[var(--muted)] hover:text-[var(--foreground)] transition-colors">Forgot password?</a>
              </div>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[var(--muted)]" />
                <input 
                  type="password" 
                  name="password"
                  required
                  placeholder="••••••••" 
                  className="w-full pl-11 pr-4 py-3.5 rounded-xl border border-[var(--border-color)] bg-[var(--card-bg)] focus:bg-[var(--background)] focus:border-[var(--foreground)] focus:ring-1 focus:ring-[var(--foreground)] outline-none transition-all text-[var(--foreground)]"
                />
              </div>
            </div>

            {/* Remember Me */}
            <div className="flex items-center gap-2">
              <input type="checkbox" id="remember" className="rounded border-[var(--border-color)] text-[var(--foreground)] focus:ring-[var(--foreground)] w-4 h-4 bg-[var(--card-bg)]" />
              <label htmlFor="remember" className="text-sm text-[var(--muted)]">Remember me for 30 days</label>
            </div>

            {errorMessage?.error && (
              <motion.div 
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                className="p-3 bg-red-50 dark:bg-red-950/30 border border-red-100 dark:border-red-900/50 rounded-xl"
              >
                <p className="text-sm text-red-600 dark:text-red-400 font-medium text-center">{errorMessage.error}</p>
              </motion.div>
            )}

            <SubmitButton />
          </form>

          <p className="text-center text-[var(--muted)] text-sm mt-8">
            Looking for the Parent Portal?{" "}
            <Link href="/parent/login" className="text-[var(--foreground)] font-semibold hover:underline transition-all">
              Switch to Parent Login
            </Link>
          </p>
        </motion.div>
      </div>
    </div>
  );
}

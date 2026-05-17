"use client";

import { useFormState, useFormStatus } from "react-dom";
import { authenticate } from "@/app/actions/auth";
import { Lock, Mail, Loader2, ArrowRight } from "lucide-react";
import Link from "next/link";
import Image from "next/image";

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button 
      disabled={pending}
      type="submit" 
      className="w-full py-3 px-4 bg-primary-600 hover:bg-primary-700 text-white rounded-xl font-medium shadow-sm transition-all flex items-center justify-center disabled:opacity-70 disabled:cursor-not-allowed group"
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
    <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950 p-4 relative overflow-hidden">
      {/* Background decorations */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-primary-600 rounded-full mix-blend-multiply filter blur-3xl opacity-20 dark:opacity-10 animate-blob"></div>
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-black dark:bg-accent-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 dark:opacity-10 animate-blob animation-delay-2000"></div>
      </div>

      <div className="w-full max-w-md relative z-10">
        <div className="text-center mb-10">
          <Link href="/" className="inline-block mb-6 transform hover:scale-105 transition-all duration-300">
            <Image src="/logo.png" alt="Dance Is Life Logo" width={128} height={128} className="object-contain mx-auto drop-shadow-xl" />
          </Link>
          <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">Welcome Back</h1>
          <p className="text-slate-500 mt-2">Sign in to your academy dashboard</p>
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-xl shadow-slate-200/50 dark:shadow-none border border-slate-100 dark:border-slate-800 p-8">
          <form action={dispatch} className="space-y-6">
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input 
                  type="email" 
                  name="email"
                  required
                  placeholder="admin@academy.com" 
                  className="w-full pl-11 pr-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 focus:bg-white dark:focus:bg-slate-900 focus:border-primary-500 focus:ring-1 focus:ring-primary-500 outline-none transition-all dark:text-white"
                />
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between">
                <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Password</label>
                <a href="#" className="text-sm text-primary-600 hover:text-primary-700 font-medium">Forgot?</a>
              </div>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input 
                  type="password" 
                  name="password"
                  required
                  placeholder="••••••••" 
                  className="w-full pl-11 pr-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 focus:bg-white dark:focus:bg-slate-900 focus:border-primary-500 focus:ring-1 focus:ring-primary-500 outline-none transition-all dark:text-white"
                />
              </div>
            </div>

            {errorMessage?.error && (
              <div className="p-3 bg-red-50 dark:bg-red-900/30 border border-red-100 dark:border-red-900/50 rounded-lg">
                <p className="text-sm text-red-600 dark:text-red-400 text-center font-medium">{errorMessage.error}</p>
              </div>
            )}

            <SubmitButton />
          </form>

          <p className="text-center text-slate-500 dark:text-slate-400 text-xs mt-6">
            Looking for the Parent Portal?{" "}
            <a href="/parent/login" className="text-primary-600 dark:text-primary-400 hover:text-primary-500 dark:hover:text-primary-300 font-semibold transition-colors">
              Parent Portal →
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}

"use client";

import { useState } from "react";
import { ArrowRight, Building2, Palette, CheckCircle2 } from "lucide-react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";

export default function OnboardingFlow() {
  const [step, setStep] = useState(1);

  return (
    <div className="min-h-screen bg-[var(--background)] flex flex-col justify-center items-center p-4">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-2xl bg-[var(--card)] rounded-3xl shadow-lg overflow-hidden border border-[var(--border-color)]"
      >
        <div className="p-8 border-b border-[var(--border-color)] flex justify-between items-center bg-[var(--card)] relative z-10">
          <div>
            <h1 className="text-2xl font-semibold text-[var(--foreground)] tracking-tight">Academy Onboarding</h1>
            <p className="text-sm text-[var(--muted)] mt-1 font-medium">Set up your workspace in 3 easy steps.</p>
          </div>
          <div className="flex gap-2.5">
            {[1, 2, 3].map((s) => (
              <div 
                key={s} 
                className={`w-2.5 h-2.5 rounded-full transition-all duration-300 ${
                  s === step 
                    ? 'bg-[var(--foreground)] scale-110' 
                    : s < step 
                      ? 'bg-emerald-500' 
                      : 'bg-[var(--hover-bg)] border border-[var(--border-color)]'
                }`} 
              />
            ))}
          </div>
        </div>

        <div className="p-8 md:p-10 min-h-[400px] flex flex-col">
          <AnimatePresence mode="wait">
            {step === 1 && (
              <motion.div 
                key="step1"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
                className="space-y-8 flex-1 flex flex-col"
              >
                <div className="flex items-center gap-5 mb-2">
                  <div className="w-14 h-14 bg-[var(--hover-bg)] text-[var(--foreground)] rounded-2xl flex items-center justify-center border border-[var(--border-color)] shadow-sm">
                    <Building2 className="w-6 h-6 opacity-80" />
                  </div>
                  <div>
                    <h2 className="text-xl font-semibold text-[var(--foreground)] tracking-tight">Academy Details</h2>
                    <p className="text-sm text-[var(--muted)] mt-1">What is the name of your dance school?</p>
                  </div>
                </div>
                <div className="space-y-6 flex-1">
                  <div className="space-y-2.5">
                    <label className="text-sm font-medium text-[var(--foreground)]">Academy Name</label>
                    <input 
                      type="text" 
                      placeholder="e.g. Urban Groove Studios" 
                      className="w-full px-5 py-3.5 rounded-xl border border-[var(--border-color)] bg-[var(--hover-bg)]/50 focus:bg-[var(--card)] focus:border-[var(--foreground)] focus:ring-1 focus:ring-[var(--foreground)] outline-none text-[var(--foreground)] transition-all placeholder:text-[var(--muted)] text-base" 
                    />
                  </div>
                  <div className="space-y-2.5">
                    <label className="text-sm font-medium text-[var(--foreground)]">Workspace URL</label>
                    <div className="flex rounded-xl overflow-hidden shadow-sm focus-within:ring-1 focus-within:ring-[var(--foreground)] focus-within:border-[var(--foreground)] border border-[var(--border-color)] transition-all">
                      <input 
                        type="text" 
                        placeholder="urbangroove" 
                        className="w-full px-5 py-3.5 bg-[var(--hover-bg)]/50 focus:bg-[var(--card)] outline-none text-right text-[var(--foreground)] placeholder:text-[var(--muted)] text-base border-r border-[var(--border-color)]" 
                      />
                      <span className="px-5 py-3.5 bg-[var(--hover-bg)] text-[var(--muted)] font-medium text-base whitespace-nowrap">.danceapp.io</span>
                    </div>
                  </div>
                </div>
                <div className="pt-6 flex justify-end">
                  <button onClick={() => setStep(2)} className="px-8 py-3.5 bg-[var(--foreground)] hover:opacity-90 text-[var(--background)] rounded-xl font-medium shadow-sm transition-all text-sm flex items-center gap-2">
                    Continue <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </motion.div>
            )}

            {step === 2 && (
              <motion.div 
                key="step2"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
                className="space-y-8 flex-1 flex flex-col"
              >
                <div className="flex items-center gap-5 mb-2">
                  <div className="w-14 h-14 bg-[var(--hover-bg)] text-[var(--foreground)] rounded-2xl flex items-center justify-center border border-[var(--border-color)] shadow-sm">
                    <Palette className="w-6 h-6 opacity-80" />
                  </div>
                  <div>
                    <h2 className="text-xl font-semibold text-[var(--foreground)] tracking-tight">Brand & Theme</h2>
                    <p className="text-sm text-[var(--muted)] mt-1">Customize the look and feel of your portal.</p>
                  </div>
                </div>
                <div className="space-y-8 flex-1">
                  <div className="space-y-3">
                    <label className="text-sm font-medium text-[var(--foreground)]">Primary Theme Color</label>
                    <div className="flex gap-4">
                      {['#111111', '#10b981', '#f59e0b', '#3b82f6', '#db2777'].map(color => (
                        <button 
                          key={color} 
                          className="w-12 h-12 rounded-full border border-[var(--border-color)] hover:scale-110 focus:ring-2 focus:ring-offset-2 focus:ring-[var(--foreground)] transition-all shadow-sm" 
                          style={{ backgroundColor: color }}
                        />
                      ))}
                    </div>
                  </div>
                  <div className="space-y-3">
                    <label className="text-sm font-medium text-[var(--foreground)]">Upload Logo</label>
                    <div className="w-full h-36 border-2 border-dashed border-[var(--border-color)] rounded-2xl flex flex-col items-center justify-center text-[var(--muted)] cursor-pointer hover:bg-[var(--hover-bg)] transition-colors">
                      <div className="w-10 h-10 rounded-full bg-[var(--hover-bg)] mb-3 flex items-center justify-center border border-[var(--border-color)]">
                        <ArrowRight className="w-4 h-4 -rotate-45" />
                      </div>
                      <span className="text-sm font-medium text-[var(--foreground)]">Click to upload image</span>
                      <span className="text-xs mt-1">PNG, JPG up to 2MB</span>
                    </div>
                  </div>
                </div>
                <div className="pt-6 flex justify-between items-center border-t border-[var(--border-color)]">
                  <button onClick={() => setStep(1)} className="px-6 py-3.5 text-[var(--muted)] font-medium hover:text-[var(--foreground)] transition-colors text-sm">
                    Back
                  </button>
                  <button onClick={() => setStep(3)} className="px-8 py-3.5 bg-[var(--foreground)] hover:opacity-90 text-[var(--background)] rounded-xl font-medium shadow-sm transition-all text-sm flex items-center gap-2">
                    Continue <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </motion.div>
            )}

            {step === 3 && (
              <motion.div 
                key="step3"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.4 }}
                className="space-y-8 text-center flex-1 flex flex-col items-center justify-center py-6"
              >
                <div className="w-24 h-24 bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 rounded-full flex items-center justify-center mx-auto mb-2 shadow-sm">
                  <CheckCircle2 className="w-12 h-12" />
                </div>
                <div className="space-y-3">
                  <h2 className="text-3xl font-semibold text-[var(--foreground)] tracking-tight">Workspace Ready!</h2>
                  <p className="text-[var(--muted)] max-w-sm mx-auto text-sm leading-relaxed">
                    Your premium OS tenant has been provisioned. You can now start adding students and batches.
                  </p>
                </div>
                
                <div className="pt-8 w-full max-w-[280px]">
                  <Link href="/dashboard" className="flex items-center justify-center w-full px-8 py-4 bg-[var(--foreground)] text-[var(--background)] hover:opacity-90 rounded-2xl font-medium shadow-md transition-all text-sm gap-3">
                    Go to Dashboard <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  );
}

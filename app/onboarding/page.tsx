"use client";

import { useState } from "react";
import { ArrowRight, Building2, Palette, CheckCircle2 } from "lucide-react";
import Link from "next/link";

export default function OnboardingFlow() {
  const [step, setStep] = useState(1);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col justify-center items-center p-4">
      <div className="w-full max-w-2xl bg-white dark:bg-slate-900 rounded-3xl shadow-xl overflow-hidden border border-slate-100 dark:border-slate-800">
        <div className="p-8 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Academy Onboarding</h1>
            <p className="text-sm text-slate-500 mt-1">Set up your workspace in 3 easy steps.</p>
          </div>
          <div className="flex gap-2">
            {[1, 2, 3].map((s) => (
              <div key={s} className={`w-3 h-3 rounded-full ${s === step ? 'bg-primary-600' : s < step ? 'bg-green-500' : 'bg-slate-200 dark:bg-slate-800'}`} />
            ))}
          </div>
        </div>

        <div className="p-8">
          {step === 1 && (
            <div className="space-y-6 animate-in slide-in-from-right-4 duration-300">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-12 h-12 bg-primary-50 dark:bg-primary-900/30 text-primary-600 rounded-xl flex items-center justify-center">
                  <Building2 className="w-6 h-6" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-slate-900 dark:text-white">Academy Details</h2>
                  <p className="text-sm text-slate-500">What is the name of your dance school?</p>
                </div>
              </div>
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Academy Name</label>
                  <input type="text" placeholder="e.g. Urban Groove Studios" className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 focus:border-primary-500 outline-none" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Workspace URL</label>
                  <div className="flex">
                    <input type="text" placeholder="urbangroove" className="w-full px-4 py-3 rounded-l-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 focus:border-primary-500 outline-none text-right" />
                    <span className="px-4 py-3 rounded-r-xl border border-l-0 border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-500">.danceapp.io</span>
                  </div>
                </div>
              </div>
              <div className="pt-6 flex justify-end">
                <button onClick={() => setStep(2)} className="px-6 py-3 bg-primary-600 hover:bg-primary-700 text-white rounded-xl font-medium shadow-sm transition-all text-sm flex items-center gap-2">
                  Continue <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-6 animate-in slide-in-from-right-4 duration-300">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-12 h-12 bg-primary-50 dark:bg-primary-900/30 text-primary-600 rounded-xl flex items-center justify-center">
                  <Palette className="w-6 h-6" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-slate-900 dark:text-white">Brand & Theme</h2>
                  <p className="text-sm text-slate-500">Customize the look and feel of your portal.</p>
                </div>
              </div>
              <div className="space-y-6">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Primary Theme Color</label>
                  <div className="flex gap-4">
                    {['#db2777', '#8b5cf6', '#3b82f6', '#10b981', '#f59e0b'].map(color => (
                      <button key={color} className="w-10 h-10 rounded-full border-2 border-transparent hover:border-slate-300 focus:border-slate-900 dark:focus:border-white transition-all focus:ring-4 focus:ring-slate-100 dark:focus:ring-slate-800" style={{ backgroundColor: color }}></button>
                    ))}
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Upload Logo</label>
                  <div className="w-full h-32 border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-xl flex flex-col items-center justify-center text-slate-400 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800/50">
                    <span className="text-sm font-medium">Click to upload image</span>
                    <span className="text-xs mt-1">PNG, JPG up to 2MB</span>
                  </div>
                </div>
              </div>
              <div className="pt-6 flex justify-between">
                <button onClick={() => setStep(1)} className="px-6 py-3 text-slate-500 font-medium hover:text-slate-700 text-sm">Back</button>
                <button onClick={() => setStep(3)} className="px-6 py-3 bg-primary-600 hover:bg-primary-700 text-white rounded-xl font-medium shadow-sm transition-all text-sm flex items-center gap-2">
                  Continue <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-6 text-center animate-in slide-in-from-right-4 duration-300 py-8">
              <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6">
                <CheckCircle2 className="w-10 h-10" />
              </div>
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Workspace Ready!</h2>
              <p className="text-slate-500 max-w-sm mx-auto">Your SaaS tenant has been provisioned. You can now start adding students and batches.</p>
              
              <div className="pt-8">
                <Link href="/dashboard" className="inline-flex px-8 py-3 bg-primary-600 hover:bg-primary-700 text-white rounded-xl font-medium shadow-md transition-all text-sm items-center gap-2 transform hover:-translate-y-0.5">
                  Go to Dashboard <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

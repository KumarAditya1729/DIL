"use client";

import { useState, useEffect } from "react";
import { registerChild, fetchParentBatches } from "@/app/actions/parent";
import { UserPlus, Loader2, CheckCircle2, AlertTriangle, ArrowRight } from "lucide-react";
import Link from "next/link";

export default function ParentRegistrationPage() {
  const [isPending, setIsPending] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [batches, setBatches] = useState<any[]>([]);

  useEffect(() => {
    fetchParentBatches().then(setBatches).catch(console.error);
  }, []);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsPending(true);
    setError(null);
    setSuccess(null);

    const formData = new FormData(e.currentTarget);
    const result = await registerChild(formData);
    setIsPending(false);

    if (result.error) {
      setError(result.error);
    } else if (result.success && result.admissionNumber) {
      setSuccess(result.admissionNumber);
    }
  };

  if (success) {
    return (
      <div className="space-y-6 max-w-xl mx-auto animate-in fade-in duration-500">
        <div className="bg-white/5 border border-green-500/30 rounded-3xl p-8 shadow-2xl text-center space-y-6">
          <div className="w-16 h-16 rounded-2xl bg-green-500/10 border border-green-500/30 text-green-400 flex items-center justify-center mx-auto shadow-lg shadow-green-950/20">
            <CheckCircle2 className="w-8 h-8" />
          </div>
          <div className="space-y-2">
            <h1 className="text-2xl font-bold text-white">Registration Successful!</h1>
            <p className="text-slate-400 text-sm">
              Your child has been successfully registered and enrolled at DIL Academy.
            </p>
          </div>
          <div className="p-4 bg-green-500/5 rounded-2xl border border-green-500/10">
            <p className="text-xs text-green-400 uppercase tracking-wider font-semibold">Student Admission ID</p>
            <p className="text-2xl font-mono font-bold text-white mt-1 tracking-wider">{success}</p>
          </div>
          <div className="pt-2">
            <Link
              href="/parent/dashboard"
              className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-primary-600 to-pink-600 hover:from-primary-500 hover:to-pink-500 text-white rounded-xl font-semibold shadow-lg shadow-purple-500/25 transition-all text-sm group"
            >
              Go to Parent Dashboard <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-2xl mx-auto animate-in fade-in duration-500">
      <div>
        <h1 className="text-2xl font-bold text-white flex items-center gap-2">
          <UserPlus className="w-6 h-6 text-primary-400" /> Student Registration
        </h1>
        <p className="text-slate-400 text-sm mt-1">Enroll your child directly into DIL Academy classes.</p>
      </div>

      <div className="bg-white/5 border border-white/10 rounded-3xl shadow-2xl p-6 md:p-8 space-y-6">
        {error && (
          <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-2xl flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-red-400 mt-0.5 flex-shrink-0" />
            <div className="flex-1">
              <p className="text-sm text-red-300 font-semibold">Registration Failed</p>
              <p className="text-xs text-slate-400 mt-0.5">{error}</p>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Section 1: Child Personal Details */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold uppercase tracking-wider text-primary-400">Child Details</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-xs font-semibold text-slate-400">Full Name <span className="text-red-500">*</span></label>
                <input
                  name="fullName"
                  required
                  type="text"
                  placeholder="Rahul Sharma"
                  className="w-full px-4 py-2.5 bg-white/5 border border-white/10 hover:border-white/20 focus:border-primary-500 rounded-xl text-white outline-none transition-colors text-sm"
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-semibold text-slate-400">Date of Birth <span className="text-red-500">*</span></label>
                <input
                  name="dob"
                  required
                  type="date"
                  className="w-full px-4 py-2.5 bg-white/5 border border-white/10 hover:border-white/20 focus:border-primary-500 rounded-xl text-white outline-none transition-colors text-sm"
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-semibold text-slate-400">Gender</label>
                <select
                  name="gender"
                  className="w-full px-4 py-2.5 bg-white/5 border border-white/10 hover:border-white/20 focus:border-primary-500 rounded-xl text-white outline-none transition-colors text-sm"
                >
                  <option value="" className="bg-slate-900 text-slate-300">Select Gender</option>
                  <option className="bg-slate-900 text-white">Male</option>
                  <option className="bg-slate-900 text-white">Female</option>
                  <option className="bg-slate-900 text-white">Other</option>
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-xs font-semibold text-slate-400">Child Phone (Optional)</label>
                <input
                  name="childPhone"
                  type="tel"
                  placeholder="Student mobile"
                  className="w-full px-4 py-2.5 bg-white/5 border border-white/10 hover:border-white/20 focus:border-primary-500 rounded-xl text-white outline-none transition-colors text-sm"
                />
              </div>
            </div>
          </div>

          {/* Section 2: Parent/Guardian Details */}
          <div className="pt-4 border-t border-white/5 space-y-4">
            <h3 className="text-sm font-semibold uppercase tracking-wider text-pink-400">Parent / Guardian Details</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-xs font-semibold text-slate-400">Parent / Guardian Name <span className="text-red-500">*</span></label>
                <input
                  name="parentName"
                  required
                  type="text"
                  placeholder="Ramesh Sharma"
                  className="w-full px-4 py-2.5 bg-white/5 border border-white/10 hover:border-white/20 focus:border-primary-500 rounded-xl text-white outline-none transition-colors text-sm"
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-semibold text-slate-400">Contact Mobile <span className="text-red-500">*</span></label>
                <input
                  name="mobileNumber"
                  required
                  type="tel"
                  placeholder="+91 98765 43210"
                  className="w-full px-4 py-2.5 bg-white/5 border border-white/10 hover:border-white/20 focus:border-primary-500 rounded-xl text-white outline-none transition-colors text-sm"
                />
              </div>
            </div>
          </div>

          {/* Section 3: Dance & Class Preferences */}
          <div className="pt-4 border-t border-white/5 space-y-4">
            <h3 className="text-sm font-semibold uppercase tracking-wider text-purple-400">Dance Class Preferences</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-xs font-semibold text-slate-400">Dance Style Preference</label>
                <select
                  name="danceStyle"
                  className="w-full px-4 py-2.5 bg-white/5 border border-white/10 hover:border-white/20 focus:border-primary-500 rounded-xl text-white outline-none transition-colors text-sm"
                >
                  <option value="" className="bg-slate-900 text-slate-300">Select Style</option>
                  <option className="bg-slate-900 text-white">Hip Hop</option>
                  <option className="bg-slate-900 text-white">Classical / Kathak</option>
                  <option className="bg-slate-900 text-white">Bollywood</option>
                  <option className="bg-slate-900 text-white">Contemporary</option>
                  <option className="bg-slate-900 text-white">Freestyle</option>
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-xs font-semibold text-slate-400">Select Batch</label>
                <select
                  name="batch"
                  className="w-full px-4 py-2.5 bg-white/5 border border-white/10 hover:border-white/20 focus:border-primary-500 rounded-xl text-white outline-none transition-colors text-sm"
                >
                  <option value="" className="bg-slate-900 text-slate-300">Select Batch</option>
                  {batches.length === 0 ? (
                    <>
                      <option className="bg-slate-900 text-white">Junior A (Mon, Wed, Fri)</option>
                      <option className="bg-slate-900 text-white">Senior B (Tue, Thu, Sat)</option>
                      <option className="bg-slate-900 text-white">Weekend Pro (Sat, Sun)</option>
                    </>
                  ) : (
                    batches.map((b) => (
                      <option key={b.id} value={b.name} className="bg-slate-900 text-white">
                        {b.name} ({b.style})
                      </option>
                    ))
                  )}
                </select>
              </div>
            </div>
          </div>

          {/* Section 4: Medical Notes */}
          <div className="pt-4 border-t border-white/5 space-y-2">
            <label className="text-xs font-semibold text-slate-400">Medical Notes / Allergies (Optional)</label>
            <textarea
              name="medicalNotes"
              rows={2}
              placeholder="Any medical conditions or injuries the instructors should be aware of?"
              className="w-full px-4 py-2.5 bg-white/5 border border-white/10 hover:border-white/20 focus:border-primary-500 rounded-xl text-white outline-none transition-colors text-sm resize-none"
            />
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <Link
              href="/parent/dashboard"
              className="px-6 py-3 bg-white/5 hover:bg-white/10 text-slate-300 rounded-xl font-semibold transition-colors text-sm"
            >
              Cancel
            </Link>
            <button
              disabled={isPending}
              type="submit"
              className="px-6 py-3 bg-gradient-to-r from-primary-600 to-pink-600 hover:from-primary-500 hover:to-pink-500 text-white rounded-xl font-semibold shadow-lg shadow-purple-500/25 transition-all text-sm flex items-center justify-center min-w-[160px] disabled:opacity-75"
            >
              {isPending ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                  Submitting...
                </>
              ) : (
                "Submit Registration"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

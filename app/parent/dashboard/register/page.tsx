"use client";

import { useState, useEffect } from "react";
import { registerChild, fetchParentBatches } from "@/app/actions/parent";
import { UserPlus, Loader2, CheckCircle2, AlertTriangle, ArrowRight, Shield } from "lucide-react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";

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
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="max-w-lg mx-auto mt-12"
      >
        <div className="bg-[var(--card)] border border-[var(--border-color)] rounded-3xl p-10 shadow-sm text-center space-y-8">
          <div className="w-20 h-20 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 flex items-center justify-center mx-auto shadow-sm">
            <CheckCircle2 className="w-10 h-10" />
          </div>
          <div className="space-y-3">
            <h1 className="text-3xl font-semibold text-[var(--foreground)] tracking-tight">Registration Successful!</h1>
            <p className="text-[var(--muted)] text-sm leading-relaxed max-w-[280px] mx-auto">
              Your child has been successfully registered and enrolled at DIL Academy.
            </p>
          </div>
          <div className="p-6 bg-[var(--hover-bg)] rounded-2xl border border-[var(--border-color)]">
            <p className="text-xs text-[var(--muted)] uppercase tracking-wider font-semibold mb-2">Student Admission ID</p>
            <p className="text-3xl font-mono font-bold text-[var(--foreground)] tracking-widest">{success}</p>
          </div>
          <div className="pt-2">
            <Link
              href="/parent/dashboard"
              className="inline-flex items-center justify-center gap-2 w-full py-4 bg-[var(--foreground)] text-[var(--background)] hover:opacity-90 rounded-xl font-medium shadow-sm transition-all text-sm group"
            >
              Go to Parent Dashboard <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-3xl mx-auto space-y-8 pb-12"
    >
      <div>
        <h1 className="text-3xl font-semibold text-[var(--foreground)] flex items-center gap-3 tracking-tight">
          <UserPlus className="w-8 h-8 text-[var(--muted)]" /> Admission Portal
        </h1>
        <p className="text-[var(--muted)] text-sm mt-2 ml-11">Enroll directly into DIL Academy courses.</p>
      </div>

      <div className="bg-[var(--card)] border border-[var(--border-color)] rounded-3xl shadow-sm p-8 md:p-10 space-y-8">
        <AnimatePresence>
          {error && (
            <motion.div 
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="p-4 bg-red-500/10 border border-red-500/20 rounded-2xl flex items-start gap-3"
            >
              <AlertTriangle className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
              <div className="flex-1">
                <p className="text-sm text-red-600 font-semibold">Registration Failed</p>
                <p className="text-sm text-red-600/80 mt-0.5">{error}</p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <form onSubmit={handleSubmit} className="space-y-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="rounded-2xl border border-[var(--border-color)] bg-[var(--hover-bg)] p-5 shadow-sm">
              <p className="text-xs font-semibold uppercase tracking-wider text-[var(--foreground)] mb-2 flex items-center gap-2">
                <Shield className="w-3.5 h-3.5" /> Payment Modes
              </p>
              <p className="text-sm text-[var(--muted)]">Cash, UPI, Cheque, Card Pay</p>
            </div>
            <div className="rounded-2xl border border-[var(--border-color)] bg-[var(--hover-bg)] p-5 shadow-sm">
              <p className="text-xs font-semibold uppercase tracking-wider text-[var(--foreground)] mb-2">Admission Notes</p>
              <ul className="text-xs text-[var(--muted)] space-y-1.5 list-disc list-inside">
                <li>Security Money: ₹1000 (Refunded after 6 months)</li>
                <li>Deposited money is non-refundable.</li>
                <li>Under 18: Parents Aadhar. 18+: Student Aadhar.</li>
              </ul>
            </div>
          </div>

          {/* Section 1: Child Personal Details */}
          <div className="space-y-5">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-[var(--muted)] border-b border-[var(--border-color)] pb-2">Child Details</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div className="space-y-2">
                <label className="text-sm font-medium text-[var(--foreground)]">Full Name <span className="text-red-500">*</span></label>
                <input
                  name="fullName"
                  required
                  type="text"
                  placeholder="Rahul Sharma"
                  className="w-full px-4 py-3 bg-[var(--hover-bg)]/50 border border-[var(--border-color)] hover:border-[var(--foreground)]/30 focus:border-[var(--foreground)] focus:ring-1 focus:ring-[var(--foreground)] rounded-xl text-[var(--foreground)] outline-none transition-all text-sm placeholder:text-[var(--muted)]"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-[var(--foreground)]">Date of Birth <span className="text-red-500">*</span></label>
                <input
                  name="dob"
                  required
                  type="date"
                  className="w-full px-4 py-3 bg-[var(--hover-bg)]/50 border border-[var(--border-color)] hover:border-[var(--foreground)]/30 focus:border-[var(--foreground)] focus:ring-1 focus:ring-[var(--foreground)] rounded-xl text-[var(--foreground)] outline-none transition-all text-sm appearance-none"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-[var(--foreground)]">Gender</label>
                <select
                  name="gender"
                  className="w-full px-4 py-3 bg-[var(--hover-bg)]/50 border border-[var(--border-color)] hover:border-[var(--foreground)]/30 focus:border-[var(--foreground)] focus:ring-1 focus:ring-[var(--foreground)] rounded-xl text-[var(--foreground)] outline-none transition-all text-sm appearance-none"
                >
                  <option value="">Select Gender</option>
                  <option>Male</option>
                  <option>Female</option>
                  <option>Other</option>
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-[var(--foreground)]">Child Phone <span className="text-[var(--muted)] font-normal ml-1">(Optional)</span></label>
                <input
                  name="childPhone"
                  type="tel"
                  placeholder="Student mobile"
                  className="w-full px-4 py-3 bg-[var(--hover-bg)]/50 border border-[var(--border-color)] hover:border-[var(--foreground)]/30 focus:border-[var(--foreground)] focus:ring-1 focus:ring-[var(--foreground)] rounded-xl text-[var(--foreground)] outline-none transition-all text-sm placeholder:text-[var(--muted)]"
                />
              </div>
            </div>
          </div>

          {/* Section 2: Parent/Guardian Details */}
          <div className="pt-2 space-y-5">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-[var(--muted)] border-b border-[var(--border-color)] pb-2">Parent / Guardian Details</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div className="space-y-2">
                <label className="text-sm font-medium text-[var(--foreground)]">Parent Name <span className="text-red-500">*</span></label>
                <input
                  name="parentName"
                  required
                  type="text"
                  placeholder="Ramesh Sharma"
                  className="w-full px-4 py-3 bg-[var(--hover-bg)]/50 border border-[var(--border-color)] hover:border-[var(--foreground)]/30 focus:border-[var(--foreground)] focus:ring-1 focus:ring-[var(--foreground)] rounded-xl text-[var(--foreground)] outline-none transition-all text-sm placeholder:text-[var(--muted)]"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-[var(--foreground)]">Contact Mobile <span className="text-red-500">*</span></label>
                <input
                  name="mobileNumber"
                  required
                  type="tel"
                  placeholder="+91 98765 43210"
                  className="w-full px-4 py-3 bg-[var(--hover-bg)]/50 border border-[var(--border-color)] hover:border-[var(--foreground)]/30 focus:border-[var(--foreground)] focus:ring-1 focus:ring-[var(--foreground)] rounded-xl text-[var(--foreground)] outline-none transition-all text-sm placeholder:text-[var(--muted)]"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-[var(--foreground)]">WhatsApp Mobile <span className="text-[var(--muted)] font-normal ml-1">(Optional)</span></label>
                <input
                  name="whatsappNumber"
                  type="tel"
                  placeholder="+91 98765 43210"
                  className="w-full px-4 py-3 bg-[var(--hover-bg)]/50 border border-[var(--border-color)] hover:border-[var(--foreground)]/30 focus:border-[var(--foreground)] focus:ring-1 focus:ring-[var(--foreground)] rounded-xl text-[var(--foreground)] outline-none transition-all text-sm placeholder:text-[var(--muted)]"
                />
              </div>
            </div>
          </div>

          {/* Section 3: Aadhar Card Details */}
          <div className="pt-2 space-y-5">
            <div>
              <h3 className="text-xs font-semibold uppercase tracking-wider text-[var(--muted)] border-b border-[var(--border-color)] pb-2">Aadhar Card Details</h3>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div className="space-y-2">
                <label className="text-sm font-medium text-[var(--foreground)]">Aadhar Name</label>
                <input
                  name="aadharName"
                  type="text"
                  placeholder="Name as per Aadhar card"
                  className="w-full px-4 py-3 bg-[var(--hover-bg)]/50 border border-[var(--border-color)] hover:border-[var(--foreground)]/30 focus:border-[var(--foreground)] focus:ring-1 focus:ring-[var(--foreground)] rounded-xl text-[var(--foreground)] outline-none transition-all text-sm placeholder:text-[var(--muted)]"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-[var(--foreground)]">Aadhar Number</label>
                <input
                  name="aadharNumber"
                  type="text"
                  inputMode="numeric"
                  pattern="[0-9]{12}"
                  maxLength={12}
                  placeholder="12 digit Aadhar number"
                  className="w-full px-4 py-3 bg-[var(--hover-bg)]/50 border border-[var(--border-color)] hover:border-[var(--foreground)]/30 focus:border-[var(--foreground)] focus:ring-1 focus:ring-[var(--foreground)] rounded-xl text-[var(--foreground)] outline-none transition-all text-sm placeholder:text-[var(--muted)] font-mono"
                />
              </div>
            </div>
          </div>

          {/* Section 4: Course & Class Preferences */}
          <div className="pt-2 space-y-5">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-[var(--muted)] border-b border-[var(--border-color)] pb-2">Course Preferences</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div className="space-y-2">
                <label className="text-sm font-medium text-[var(--foreground)]">Course Preference</label>
                <select
                  name="danceStyle"
                  className="w-full px-4 py-3 bg-[var(--hover-bg)]/50 border border-[var(--border-color)] hover:border-[var(--foreground)]/30 focus:border-[var(--foreground)] focus:ring-1 focus:ring-[var(--foreground)] rounded-xl text-[var(--foreground)] outline-none transition-all text-sm appearance-none"
                >
                  <option value="">Select Course</option>
                  <option>Dance</option>
                  <option>Music</option>
                  <option>Art Zone</option>
                  <option>Kathak</option>
                  <option>Martial Arts</option>
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-[var(--foreground)]">Select Batch</label>
                <select
                  name="batch"
                  className="w-full px-4 py-3 bg-[var(--hover-bg)]/50 border border-[var(--border-color)] hover:border-[var(--foreground)]/30 focus:border-[var(--foreground)] focus:ring-1 focus:ring-[var(--foreground)] rounded-xl text-[var(--foreground)] outline-none transition-all text-sm appearance-none"
                >
                  <option value="">Select Batch</option>
                  {batches.length === 0 ? (
                    <option disabled value="">No batches available</option>
                  ) : (
                    batches.map((b) => (
                      <option key={b.id} value={b.name}>
                        {b.name} ({b.style})
                      </option>
                    ))
                  )}
                </select>
              </div>
            </div>
          </div>

          {/* Section 5: Medical Notes */}
          <div className="pt-2 space-y-3">
            <label className="text-sm font-medium text-[var(--foreground)]">Medical Notes / Allergies <span className="text-[var(--muted)] font-normal ml-1">(Optional)</span></label>
            <textarea
              name="medicalNotes"
              rows={3}
              placeholder="Any medical conditions or injuries the instructors should be aware of?"
              className="w-full px-4 py-3 bg-[var(--hover-bg)]/50 border border-[var(--border-color)] hover:border-[var(--foreground)]/30 focus:border-[var(--foreground)] focus:ring-1 focus:ring-[var(--foreground)] rounded-xl text-[var(--foreground)] outline-none transition-all text-sm resize-none placeholder:text-[var(--muted)]"
            />
          </div>

          <div className="flex flex-col-reverse sm:flex-row justify-end gap-3 pt-6 border-t border-[var(--border-color)]">
            <Link
              href="/parent/dashboard"
              className="px-6 py-3 bg-[var(--hover-bg)] hover:bg-[var(--border-color)] text-[var(--foreground)] rounded-xl font-medium transition-colors text-sm text-center"
            >
              Cancel
            </Link>
            <button
              disabled={isPending}
              type="submit"
              className="px-8 py-3 bg-[var(--foreground)] text-[var(--background)] hover:opacity-90 rounded-xl font-medium shadow-sm transition-all text-sm flex items-center justify-center min-w-[200px] disabled:opacity-70"
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
    </motion.div>
  );
}

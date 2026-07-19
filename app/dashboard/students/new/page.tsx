"use client";

import { ArrowLeft, Upload, CheckCircle2, Loader2, Hash, Sparkles } from "lucide-react";
import Link from "next/link";
import { createStudent, getNextAdmissionNumber } from "@/app/actions/students";
import { fetchBatches } from "@/app/actions/batches";
import { useState, useRef, useEffect } from "react";
import { motion } from "framer-motion";

export default function NewAdmissionPage() {
  const [isPending, setIsPending] = useState(false);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [nextId, setNextId] = useState<string>("Loading...");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [batches, setBatches] = useState<any[]>([]);

  useEffect(() => {
    getNextAdmissionNumber().then(setNextId).catch(() => setNextId("DA-2026-001"));
    fetchBatches().then(setBatches).catch(console.error);
  }, []);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setPreviewImage(url);
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsPending(true);
    const formData = new FormData(e.currentTarget);
    const result = await createStudent(formData);
    setIsPending(false);
    if (result.error) {
      alert(result.error);
    } else {
      alert(`✅ Student admitted successfully!\nAdmission Number: ${result.admissionNumber}`);
      window.location.href = "/dashboard/students";
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-4xl mx-auto space-y-8"
    >
      <div className="flex items-center gap-4">
        <Link href="/dashboard/students" className="p-2 hover:bg-[var(--hover-bg)] rounded-full transition-colors text-[var(--muted)] hover:text-[var(--foreground)]">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-2xl font-semibold text-[var(--foreground)] tracking-tight">New Admission</h1>
          <p className="text-[var(--muted)] text-sm mt-1">Admission Portal</p>
        </div>
      </div>

      <div className="bg-[var(--card)] rounded-3xl border border-[var(--border-color)] shadow-sm overflow-hidden">
        {/* Header with live admission number */}
        <div className="p-8 border-b border-[var(--border-color)] bg-[var(--hover-bg)]/50 flex flex-col sm:flex-row sm:items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[var(--foreground)]/5 flex items-center justify-center">
              <Hash className="w-5 h-5 text-[var(--foreground)]" />
            </div>
            <div>
              <span className="block font-medium text-[var(--foreground)]">Auto-assigned ID</span>
              <span className="text-sm text-[var(--muted)]">Generated securely by the system</span>
            </div>
          </div>
          <div className="flex items-center gap-3 bg-[var(--card)] p-2 pr-4 rounded-2xl border border-[var(--border-color)] shadow-sm">
            <span className="bg-[var(--foreground)] text-[var(--background)] font-semibold px-4 py-1.5 rounded-xl font-mono tracking-widest text-sm">
              {nextId}
            </span>
            <span className="text-xs text-emerald-600 flex items-center gap-1.5 font-medium">
              <CheckCircle2 className="w-3.5 h-3.5" /> Available
            </span>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-10">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="rounded-2xl border border-[var(--foreground)]/5 bg-[var(--hover-bg)]/30 p-6 flex flex-col justify-center">
              <div className="flex items-center gap-2 mb-2">
                <Sparkles className="w-4 h-4 text-[var(--foreground)]" />
                <p className="text-sm font-medium text-[var(--foreground)]">Payment Modes</p>
              </div>
              <p className="text-sm text-[var(--muted)]">Cash, UPI, Cheque, Card Pay</p>
            </div>
            <div className="rounded-2xl border border-amber-500/10 bg-amber-500/5 p-6">
              <p className="text-sm font-medium text-amber-700 mb-3 flex items-center gap-2">
                Admission Notes
              </p>
              <div className="space-y-1">
                <p className="text-sm text-amber-600/80">Security Money: ₹1000. It will be refunded after 6 months.</p>
                <p className="text-xs text-amber-600/60">Note: Deposited money will not be refunded after payment.</p>
                <p className="text-xs text-amber-600/60">Under 18: Parents Aadhar. 18+: Student Aadhar.</p>
              </div>
            </div>
          </div>

          {/* Photo Upload */}
          <div className="flex flex-col sm:flex-row items-center gap-8 p-6 rounded-3xl border border-[var(--border-color)] border-dashed bg-[var(--hover-bg)]/20">
            <input type="file" accept="image/*" className="hidden" ref={fileInputRef} onChange={handleImageUpload} />
            <div
              onClick={() => fileInputRef.current?.click()}
              className="w-28 h-28 rounded-full bg-[var(--card)] shadow-sm border border-[var(--border-color)] flex flex-col items-center justify-center text-[var(--muted)] cursor-pointer hover:bg-[var(--hover-bg)] transition-colors overflow-hidden group relative"
            >
              {previewImage ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={previewImage} alt="Preview" className="w-full h-full object-cover" />
              ) : (
                <>
                  <Upload className="w-6 h-6 mb-2 group-hover:scale-110 transition-transform" />
                  <span className="text-[10px] font-medium uppercase tracking-widest">Photo</span>
                </>
              )}
            </div>
            <div className="text-center sm:text-left">
              <h3 className="font-medium text-[var(--foreground)] text-lg">Student Photo</h3>
              <p className="text-sm text-[var(--muted)] mt-1 max-w-sm leading-relaxed">Upload a clear, passport-size photo. Max 2MB. JPG or PNG.</p>
            </div>
          </div>

          {/* Personal Details */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
            <div className="space-y-2">
              <label className="text-sm font-medium text-[var(--foreground)]">Full Name <span className="text-red-500">*</span></label>
              <input name="fullName" required type="text" placeholder="e.g. Rahul Sharma" className="w-full px-4 py-3 rounded-xl border border-[var(--border-color)] bg-[var(--card)] focus:border-[var(--foreground)] focus:ring-1 focus:ring-[var(--foreground)] outline-none text-sm text-[var(--foreground)] transition-all placeholder:text-[var(--muted)]" />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-[var(--foreground)]">Date of Birth <span className="text-red-500">*</span></label>
              <input name="dob" required type="date" className="w-full px-4 py-3 rounded-xl border border-[var(--border-color)] bg-[var(--card)] focus:border-[var(--foreground)] focus:ring-1 focus:ring-[var(--foreground)] outline-none text-sm text-[var(--foreground)] transition-all [color-scheme:light] dark:[color-scheme:dark]" />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-[var(--foreground)]">Gender</label>
              <select name="gender" className="w-full px-4 py-3 rounded-xl border border-[var(--border-color)] bg-[var(--card)] focus:border-[var(--foreground)] focus:ring-1 focus:ring-[var(--foreground)] outline-none text-sm text-[var(--foreground)] transition-all appearance-none">
                <option value="">Select</option>
                <option>Male</option>
                <option>Female</option>
                <option>Other</option>
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-[var(--foreground)]">Mobile Number <span className="text-red-500">*</span></label>
              <input name="mobileNumber" required type="tel" placeholder="+91 98765 43210" className="w-full px-4 py-3 rounded-xl border border-[var(--border-color)] bg-[var(--card)] focus:border-[var(--foreground)] focus:ring-1 focus:ring-[var(--foreground)] outline-none text-sm text-[var(--foreground)] transition-all placeholder:text-[var(--muted)]" />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-[var(--foreground)]">WhatsApp Number <span className="text-[var(--muted)] text-xs">(Optional)</span></label>
              <input name="whatsappNumber" type="tel" placeholder="+91 98765 43210" className="w-full px-4 py-3 rounded-xl border border-[var(--border-color)] bg-[var(--card)] focus:border-[var(--foreground)] focus:ring-1 focus:ring-[var(--foreground)] outline-none text-sm text-[var(--foreground)] transition-all placeholder:text-[var(--muted)]" />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-[var(--foreground)]">Parent / Guardian Name <span className="text-red-500">*</span></label>
              <input name="parentName" required type="text" placeholder="e.g. Ramesh Sharma" className="w-full px-4 py-3 rounded-xl border border-[var(--border-color)] bg-[var(--card)] focus:border-[var(--foreground)] focus:ring-1 focus:ring-[var(--foreground)] outline-none text-sm text-[var(--foreground)] transition-all placeholder:text-[var(--muted)]" />
            </div>
            <div className="space-y-2 md:col-span-2">
              <label className="text-sm font-medium text-[var(--foreground)]">Residential Address</label>
              <textarea rows={2} name="address" placeholder="Full address" className="w-full px-4 py-3 rounded-xl border border-[var(--border-color)] bg-[var(--card)] focus:border-[var(--foreground)] focus:ring-1 focus:ring-[var(--foreground)] outline-none text-sm text-[var(--foreground)] transition-all placeholder:text-[var(--muted)] resize-none"></textarea>
            </div>
          </div>

          {/* Aadhar Card Details */}
          <div className="pt-8 border-t border-[var(--border-color)] space-y-6">
            <div>
              <h3 className="text-lg font-medium text-[var(--foreground)]">Aadhar Card Details</h3>
              <p className="text-sm text-[var(--muted)] mt-1">Under 18: enter parent Aadhar details. 18+: enter student Aadhar details.</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
              <div className="space-y-2">
                <label className="text-sm font-medium text-[var(--foreground)]">Aadhar Card Holder Name</label>
                <input name="aadharName" type="text" placeholder="Name as per Aadhar card" className="w-full px-4 py-3 rounded-xl border border-[var(--border-color)] bg-[var(--card)] focus:border-[var(--foreground)] focus:ring-1 focus:ring-[var(--foreground)] outline-none text-sm text-[var(--foreground)] transition-all placeholder:text-[var(--muted)]" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-[var(--foreground)]">Aadhar Card Number</label>
                <input name="aadharNumber" type="text" inputMode="numeric" pattern="[0-9]{12}" maxLength={12} placeholder="12 digit Aadhar number" className="w-full px-4 py-3 rounded-xl border border-[var(--border-color)] bg-[var(--card)] focus:border-[var(--foreground)] focus:ring-1 focus:ring-[var(--foreground)] outline-none text-sm text-[var(--foreground)] transition-all placeholder:text-[var(--muted)]" />
              </div>
            </div>
          </div>

          {/* Academy Details */}
          <div className="pt-8 border-t border-[var(--border-color)] grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
            <div className="space-y-2">
              <label className="text-sm font-medium text-[var(--foreground)]">Courses</label>
              <select name="danceStyle" className="w-full px-4 py-3 rounded-xl border border-[var(--border-color)] bg-[var(--card)] focus:border-[var(--foreground)] focus:ring-1 focus:ring-[var(--foreground)] outline-none text-sm text-[var(--foreground)] transition-all appearance-none">
                <option value="">Select Course</option>
                <option>Dance</option>
                <option>Music</option>
                <option>Art Zone</option>
                <option>Kathak</option>
                <option>Martial Arts</option>
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-[var(--foreground)]">Assign Batch</label>
              <select name="batch" className="w-full px-4 py-3 rounded-xl border border-[var(--border-color)] bg-[var(--card)] focus:border-[var(--foreground)] focus:ring-1 focus:ring-[var(--foreground)] outline-none text-sm text-[var(--foreground)] transition-all appearance-none">
                <option value="">Select Batch</option>
                {batches.length === 0 ? (
                  <option disabled value="">⚠️ No batches created. Create one first in Batches module!</option>
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

          {/* Medical Notes */}
          <div className="pt-8 border-t border-[var(--border-color)] space-y-2">
            <label className="text-sm font-medium text-[var(--foreground)]">Medical Notes / Allergies</label>
            <textarea name="medicalNotes" rows={2} placeholder="Any medical conditions we should be aware of?" className="w-full px-4 py-3 rounded-xl border border-[var(--border-color)] bg-[var(--card)] focus:border-[var(--foreground)] focus:ring-1 focus:ring-[var(--foreground)] outline-none text-sm text-[var(--foreground)] transition-all placeholder:text-[var(--muted)] resize-none"></textarea>
          </div>

          {/* Action Buttons */}
          <div className="pt-8 flex flex-col-reverse sm:flex-row justify-end gap-3 sm:gap-4 border-t border-[var(--border-color)]">
            <Link href="/dashboard/students" className="px-8 py-3.5 bg-[var(--hover-bg)] hover:bg-[var(--border-color)] text-[var(--foreground)] rounded-xl font-medium transition-colors text-sm text-center">
              Cancel
            </Link>
            <button
              disabled={isPending}
              type="submit"
              className="px-8 py-3.5 bg-[var(--foreground)] hover:opacity-90 text-[var(--background)] rounded-xl font-medium shadow-md transition-all text-sm flex items-center justify-center min-w-[200px] disabled:opacity-70 disabled:cursor-not-allowed gap-2"
            >
              {isPending ? (
                <><Loader2 className="w-4 h-4 animate-spin" /> Admitting...</>
              ) : (
                <>Complete Admission</>
              )}
            </button>
          </div>
        </form>
      </div>
    </motion.div>
  );
}

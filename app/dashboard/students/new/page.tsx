"use client";

import { ArrowLeft, Upload, CheckCircle2, Loader2, Hash } from "lucide-react";
import Link from "next/link";
import { createStudent, getNextAdmissionNumber } from "@/app/actions/students";
import { useState, useRef, useEffect } from "react";

export default function NewAdmissionPage() {
  const [isPending, setIsPending] = useState(false);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [nextId, setNextId] = useState<string>("Loading...");
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    getNextAdmissionNumber().then(setNextId).catch(() => setNextId("DA-2026-001"));
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
    <div className="space-y-6 animate-in fade-in duration-500 max-w-4xl mx-auto">
      <div className="flex items-center gap-4">
        <Link href="/dashboard/students" className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors">
          <ArrowLeft className="w-5 h-5 text-slate-500" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">New Admission</h1>
          <p className="text-slate-500 text-sm mt-1">Register a new student to the academy.</p>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm overflow-hidden">
        {/* Header with live admission number */}
        <div className="p-6 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/20 flex justify-between items-center flex-wrap gap-4">
          <div className="flex items-center gap-3">
            <Hash className="w-4 h-4 text-slate-400" />
            <span className="text-sm text-slate-500">Auto-assigned Admission Number</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="bg-primary-100 text-primary-700 dark:bg-primary-900/30 dark:text-primary-400 font-bold px-4 py-1.5 rounded-lg font-mono text-base tracking-widest shadow-sm">
              {nextId}
            </span>
            <span className="text-xs text-green-600 flex items-center gap-1 font-medium">
              <CheckCircle2 className="w-3.5 h-3.5" /> Available
            </span>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-8">
          {/* Photo Upload */}
          <div className="flex flex-col sm:flex-row items-center gap-6">
            <input type="file" accept="image/*" className="hidden" ref={fileInputRef} onChange={handleImageUpload} />
            <div
              onClick={() => fileInputRef.current?.click()}
              className="w-24 h-24 rounded-full bg-slate-100 dark:bg-slate-800 border-2 border-dashed border-slate-300 dark:border-slate-600 flex flex-col items-center justify-center text-slate-400 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors overflow-hidden"
            >
              {previewImage ? (
                <img src={previewImage} alt="Preview" className="w-full h-full object-cover" />
              ) : (
                <>
                  <Upload className="w-6 h-6 mb-1" />
                  <span className="text-[10px] font-medium uppercase tracking-wider">Photo</span>
                </>
              )}
            </div>
            <div>
              <h3 className="font-medium text-slate-900 dark:text-white">Student Photo</h3>
              <p className="text-xs text-slate-500 mt-1 max-w-sm">Upload a clear, passport-size photo. Max 2MB. JPG or PNG.</p>
            </div>
          </div>

          {/* Personal Details */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Full Name <span className="text-red-500">*</span></label>
              <input name="fullName" required type="text" placeholder="e.g. Rahul Sharma" className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 focus:border-primary-500 focus:ring-1 focus:ring-primary-500 outline-none text-sm dark:text-slate-200" />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Date of Birth <span className="text-red-500">*</span></label>
              <input name="dob" required type="date" className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 focus:border-primary-500 focus:ring-1 focus:ring-primary-500 outline-none text-sm dark:text-slate-200" />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Gender</label>
              <select name="gender" className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 focus:border-primary-500 outline-none text-sm dark:text-slate-200">
                <option value="">Select</option>
                <option>Male</option>
                <option>Female</option>
                <option>Other</option>
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Mobile Number <span className="text-red-500">*</span></label>
              <input name="mobileNumber" required type="tel" placeholder="+91 98765 43210" className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 focus:border-primary-500 focus:ring-1 focus:ring-primary-500 outline-none text-sm dark:text-slate-200" />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Parent / Guardian Name <span className="text-red-500">*</span></label>
              <input name="parentName" required type="text" placeholder="e.g. Ramesh Sharma" className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 focus:border-primary-500 focus:ring-1 focus:ring-primary-500 outline-none text-sm dark:text-slate-200" />
            </div>
            <div className="space-y-2 md:col-span-2">
              <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Residential Address</label>
              <textarea rows={2} name="address" placeholder="Full address" className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 focus:border-primary-500 focus:ring-1 focus:ring-primary-500 outline-none text-sm dark:text-slate-200"></textarea>
            </div>
          </div>

          {/* Academy Details */}
          <div className="pt-6 border-t border-slate-100 dark:border-slate-800 grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Dance Style</label>
              <select name="danceStyle" className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 focus:border-primary-500 outline-none text-sm dark:text-slate-200">
                <option value="">Select Style</option>
                <option>Hip Hop</option>
                <option>Classical / Kathak</option>
                <option>Bollywood</option>
                <option>Contemporary</option>
                <option>Freestyle</option>
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Assign Batch</label>
              <select name="batch" className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 focus:border-primary-500 outline-none text-sm dark:text-slate-200">
                <option value="">Select Batch</option>
                <option>Junior A (Mon, Wed, Fri)</option>
                <option>Senior B (Tue, Thu, Sat)</option>
                <option>Weekend Pro (Sat, Sun)</option>
              </select>
            </div>
          </div>

          {/* Medical Notes */}
          <div className="pt-6 border-t border-slate-100 dark:border-slate-800 space-y-2">
            <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Medical Notes / Allergies</label>
            <textarea name="medicalNotes" rows={2} placeholder="Any medical conditions we should be aware of?" className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 focus:border-primary-500 focus:ring-1 focus:ring-primary-500 outline-none text-sm dark:text-slate-200"></textarea>
          </div>

          {/* Admission Number Preview at bottom */}
          <div className="pt-4 bg-primary-50 dark:bg-primary-900/20 rounded-xl px-5 py-4 border border-primary-100 dark:border-primary-800/30">
            <p className="text-sm text-primary-700 dark:text-primary-300 font-medium">
              This student will be assigned admission number <span className="font-mono font-bold text-primary-800 dark:text-primary-200 text-base">{nextId}</span> upon submission.
            </p>
          </div>

          {/* Action Buttons */}
          <div className="pt-2 flex justify-end gap-3">
            <Link href="/dashboard/students" className="px-6 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 dark:bg-slate-800 dark:hover:bg-slate-700 dark:text-slate-300 rounded-xl font-medium transition-colors text-sm">
              Cancel
            </Link>
            <button
              disabled={isPending}
              type="submit"
              className="px-6 py-2.5 bg-primary-600 hover:bg-primary-700 text-white rounded-xl font-medium shadow-sm transition-all text-sm flex items-center justify-center min-w-[180px] disabled:opacity-70 disabled:cursor-not-allowed gap-2"
            >
              {isPending ? (
                <><Loader2 className="w-4 h-4 animate-spin" /> Admitting...</>
              ) : (
                <>Complete Admission — {nextId}</>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

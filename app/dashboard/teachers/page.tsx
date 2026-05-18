"use client";

import { useState, useEffect } from "react";
import { Plus, Search, Mail, Phone, Trash2, ShieldAlert, Sparkles, GraduationCap, Loader2, Save, X, BookOpen, UserCheck } from "lucide-react";
import { fetchTeachers, createTeacher, deleteTeacher, Teacher } from "@/app/actions/teachers";
import { toast } from "sonner";

const SPECIALTIES = [
  "Hip Hop",
  "Contemporary",
  "Classical (Kathak/Bharatnatyam)",
  "Salsa & Bachata",
  "Jazz",
  "Zumba & Fitness",
  "Ballet",
  "Bollywood & Folk"
];

export default function TeachersPage() {
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [filtered, setFiltered] = useState<Teacher[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [query, setQuery] = useState("");

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setIsLoading(true);
    const data = await fetchTeachers();
    setTeachers(data);
    setFiltered(data);
    setIsLoading(false);
  };

  useEffect(() => {
    if (query.trim()) {
      const q = query.toLowerCase();
      setFiltered(
        teachers.filter(
          t =>
            t.full_name.toLowerCase().includes(q) ||
            t.email?.toLowerCase().includes(q) ||
            t.phone?.includes(q) ||
            t.specialty?.toLowerCase().includes(q)
        )
      );
    } else {
      setFiltered(teachers);
    }
  }, [query, teachers]);

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to delete the instructor "${name}"? This will revoke their platform access.`)) return;
    
    toast.loading("Deleting teacher...", { id: "delete-teacher-toast" });
    const res = await deleteTeacher(id);
    
    if (res.error) {
      toast.error(res.error, { id: "delete-teacher-toast" });
    } else {
      toast.success("Teacher deleted successfully", { id: "delete-teacher-toast" });
      loadData();
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);

    const formData = new FormData(e.currentTarget);
    const res = await createTeacher(formData);

    setIsSubmitting(false);

    if (res.error) {
      toast.error(res.error);
    } else {
      toast.success("New teacher registered successfully! Welcome aboard.");
      setIsModalOpen(false);
      loadData();
    }
  };

  // Metrics
  const totalTeachers = teachers.length;
  const activeSpecialties = Array.from(new Set(teachers.map(t => t.specialty))).filter(Boolean).length;
  const assignedTeachersCount = teachers.filter(t => t.assigned_batches && t.assigned_batches.length > 0).length;

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <GraduationCap className="w-6 h-6 text-primary-500" /> Teachers & Instructors
          </h1>
          <p className="text-slate-500 text-sm mt-1">Manage instructor credentials, specialties, and class assignments.</p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 px-5 py-2.5 bg-primary-600 hover:bg-primary-700 text-white rounded-xl font-semibold shadow-sm transition-all text-sm self-start"
        >
          <Plus className="w-4 h-4" /> Add Teacher
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 p-5 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-primary-50 dark:bg-primary-900/20 text-primary-600 flex items-center justify-center shrink-0">
            <GraduationCap className="w-6 h-6" />
          </div>
          <div>
            <p className="text-2xl font-bold text-slate-950 dark:text-white">{totalTeachers}</p>
            <p className="text-xs text-slate-500 font-medium uppercase mt-0.5">Total Instructors</p>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 p-5 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-green-50 dark:bg-green-900/20 text-green-600 flex items-center justify-center shrink-0">
            <Sparkles className="w-6 h-6" />
          </div>
          <div>
            <p className="text-2xl font-bold text-slate-950 dark:text-white">{activeSpecialties}</p>
            <p className="text-xs text-slate-500 font-medium uppercase mt-0.5">Dance Specialties</p>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 p-5 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-purple-50 dark:bg-purple-900/20 text-purple-600 flex items-center justify-center shrink-0">
            <UserCheck className="w-6 h-6" />
          </div>
          <div>
            <p className="text-2xl font-bold text-slate-950 dark:text-white">
              {assignedTeachersCount} <span className="text-slate-400 text-xs font-normal">/ {totalTeachers}</span>
            </p>
            <p className="text-xs text-slate-500 font-medium uppercase mt-0.5">Currently Teaching</p>
          </div>
        </div>
      </div>

      {/* Main Section */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm overflow-hidden">
        {/* Search Bar */}
        <div className="p-4 sm:p-5 border-b border-slate-100 dark:border-slate-800 flex gap-3 items-center bg-slate-50/50 dark:bg-slate-800/20">
          <div className="relative flex-1 w-full">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={query}
              onChange={e => setQuery(e.target.value)}
              placeholder="Search by name, email, or specialty style..."
              className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 focus:border-primary-500 outline-none text-sm dark:text-slate-200"
            />
          </div>
        </div>

        {/* Content list */}
        {isLoading ? (
          <div className="text-center py-20 text-slate-400">
            <Loader2 className="w-8 h-8 animate-spin mb-4 text-primary-500 mx-auto" />
            <p className="text-sm">Loading staff directory...</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-20 text-slate-500 flex flex-col items-center">
            <GraduationCap className="w-12 h-12 text-slate-300 dark:text-slate-700 mb-4 opacity-40" />
            <p className="font-semibold text-slate-700 dark:text-slate-300">
              {query ? "No teachers match your search filters." : "No teachers registered yet."}
            </p>
            {!query && (
              <button onClick={() => setIsModalOpen(true)} className="mt-3 text-primary-600 text-sm font-semibold hover:underline">
                + Register your first instructor
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-6">
            {filtered.map(teacher => (
              <div key={teacher.id} className="bg-slate-50/50 dark:bg-slate-800/10 border border-slate-100 dark:border-slate-800/80 rounded-2xl p-5 flex flex-col hover:shadow-md transition-shadow relative group">
                {/* Trash/Delete Action */}
                <button
                  onClick={() => handleDelete(teacher.id, teacher.full_name)}
                  className="absolute top-4 right-4 p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30 rounded-lg transition-colors opacity-0 group-hover:opacity-100"
                  title="Remove Instructor"
                >
                  <Trash2 className="w-4 h-4" />
                </button>

                {/* Avatar/Specialty */}
                <div className="flex items-center gap-3.5 mb-4">
                  <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-primary-500 to-indigo-500 text-white flex items-center justify-center font-bold text-base shadow shrink-0">
                    {teacher.full_name.charAt(0)}
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900 dark:text-white leading-tight">{teacher.full_name}</h3>
                    <span className="inline-block text-[10px] font-bold uppercase tracking-wider text-primary-600 dark:text-primary-400 mt-1">
                      {teacher.specialty}
                    </span>
                  </div>
                </div>

                {/* Contact details */}
                <div className="space-y-2 text-xs text-slate-600 dark:text-slate-400 border-t border-slate-100 dark:border-slate-800/50 pt-3.5 mb-4">
                  <div className="flex items-center gap-2">
                    <Mail className="w-3.5 h-3.5 text-slate-400" />
                    <span className="truncate">{teacher.email}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Phone className="w-3.5 h-3.5 text-slate-400" />
                    <span>{teacher.phone}</span>
                  </div>
                </div>

                {/* Assigned Batches */}
                <div className="mt-auto pt-3 border-t border-slate-100 dark:border-slate-800/50">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-2 flex items-center gap-1">
                    <BookOpen className="w-3 h-3" /> Assigned Batches
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {teacher.assigned_batches && teacher.assigned_batches.length > 0 ? (
                      teacher.assigned_batches.map(batchName => (
                        <span key={batchName} className="text-[10px] font-semibold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 px-2 py-0.5 rounded">
                          {batchName}
                        </span>
                      ))
                    ) : (
                      <span className="text-[10px] italic text-slate-400">
                        No batches assigned
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ── Modal Add Teacher ────────────────────────── */}
      {isModalOpen && (
        <>
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-40" onClick={() => setIsModalOpen(false)} />
          <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-100 dark:border-slate-800 w-full max-w-md animate-in fade-in zoom-in-95 duration-200 overflow-hidden flex flex-col max-h-[90vh]">
              <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100 dark:border-slate-800 shrink-0">
                <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <GraduationCap className="w-5 h-5 text-primary-500" /> Add New Instructor
                </h2>
                <button onClick={() => setIsModalOpen(false)} className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
                  <X className="w-5 h-5 text-slate-500" />
                </button>
              </div>

              <div className="p-6 overflow-y-auto">
                <form id="teacher-form" onSubmit={handleSubmit} className="space-y-4">
                  <div className="space-y-1.5">
                    <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Full Name <span className="text-red-500">*</span></label>
                    <input name="fullName" required placeholder="e.g. Master Terence Lewis" className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 focus:border-primary-500 outline-none text-sm dark:text-white" />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Dance Specialty <span className="text-red-500">*</span></label>
                    <select name="specialty" required className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 focus:border-primary-500 outline-none text-sm dark:text-white">
                      {SPECIALTIES.map(spec => (
                        <option key={spec} value={spec}>{spec}</option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Mobile / Contact Number <span className="text-red-500">*</span></label>
                    <input name="phone" required placeholder="e.g. +91 9876543210" className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 focus:border-primary-500 outline-none text-sm dark:text-white" />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Email Address <span className="text-red-500">*</span></label>
                    <input name="email" type="email" required placeholder="e.g. terence@dil.academy" className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 focus:border-primary-500 outline-none text-sm dark:text-white" />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Login Password</label>
                    <input name="password" type="password" placeholder="DILTeacher123!" className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 focus:border-primary-500 outline-none text-sm dark:text-white" />
                    <p className="text-[10px] text-slate-400">Defaults to <code className="bg-slate-100 px-1 py-0.5 rounded">DILTeacher123!</code> if left empty.</p>
                  </div>
                </form>
              </div>

              <div className="p-6 border-t border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 shrink-0 flex justify-end gap-3">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-sm font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
                  Cancel
                </button>
                <button
                  type="submit"
                  form="teacher-form"
                  disabled={isSubmitting}
                  className="px-5 py-2.5 bg-primary-600 hover:bg-primary-700 text-white rounded-xl text-sm font-semibold flex items-center gap-2 disabled:opacity-70 shadow-sm transition-colors"
                >
                  {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                  {isSubmitting ? "Creating..." : "Save Instructor"}
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

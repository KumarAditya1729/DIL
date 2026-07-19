"use client";

import { useState, useEffect } from "react";
import { Plus, Search, Mail, Phone, Trash2, ShieldAlert, Sparkles, GraduationCap, Loader2, Save, X, BookOpen, UserCheck, ChevronRight } from "lucide-react";
import { fetchTeachers, createTeacher, deleteTeacher, Teacher } from "@/app/actions/teachers";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";

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
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-6xl mx-auto space-y-8 pb-20 animate-in fade-in duration-500"
    >
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-[var(--foreground)] tracking-tight">
            Teachers & Staff
          </h1>
          <p className="text-[var(--muted)] text-sm mt-1">Manage instructor credentials, specialties, and assignments.</p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 px-5 py-2.5 bg-[var(--foreground)] hover:bg-[var(--foreground)]/90 text-[var(--background)] rounded-full font-semibold shadow-sm transition-all text-sm self-start"
        >
          <Plus className="w-4 h-4" /> Add Teacher
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-[var(--card-bg)] rounded-[24px] border border-[var(--border-color)] p-6 shadow-sm flex items-center gap-5">
          <div className="w-12 h-12 rounded-2xl bg-[var(--foreground)]/5 text-[var(--foreground)] flex items-center justify-center shrink-0">
            <GraduationCap className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[var(--muted)] text-xs font-bold uppercase tracking-wider mb-1">Total Instructors</p>
            <p className="text-3xl font-bold text-[var(--foreground)] tracking-tight">{totalTeachers}</p>
          </div>
        </div>

        <div className="bg-[var(--card-bg)] rounded-[24px] border border-[var(--border-color)] p-6 shadow-sm flex items-center gap-5">
          <div className="w-12 h-12 rounded-2xl bg-amber-500/10 text-amber-500 flex items-center justify-center shrink-0">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[var(--muted)] text-xs font-bold uppercase tracking-wider mb-1">Active Specialties</p>
            <p className="text-3xl font-bold text-[var(--foreground)] tracking-tight">{activeSpecialties}</p>
          </div>
        </div>

        <div className="bg-[var(--card-bg)] rounded-[24px] border border-[var(--border-color)] p-6 shadow-sm flex items-center gap-5">
          <div className="w-12 h-12 rounded-2xl bg-green-500/10 text-green-500 flex items-center justify-center shrink-0">
            <UserCheck className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[var(--muted)] text-xs font-bold uppercase tracking-wider mb-1">Teaching Classes</p>
            <p className="text-3xl font-bold text-[var(--foreground)] tracking-tight">
              {assignedTeachersCount} <span className="text-[var(--muted)] text-xl font-normal">/ {totalTeachers}</span>
            </p>
          </div>
        </div>
      </div>

      {/* Main Section */}
      <div className="bg-[var(--card-bg)] rounded-[32px] border border-[var(--border-color)] shadow-sm overflow-hidden flex flex-col">
        {/* Search Bar */}
        <div className="p-4 sm:p-5 border-b border-[var(--border-color)] flex gap-3 items-center bg-[var(--foreground)]/5">
          <div className="relative flex-1 w-full">
            <Search className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-[var(--muted)]" />
            <input
              type="text"
              value={query}
              onChange={e => setQuery(e.target.value)}
              placeholder="Search by name, email, or specialty style..."
              className="w-full pl-11 pr-4 py-3 rounded-2xl border border-[var(--border-color)] bg-[var(--background)] focus:border-[var(--foreground)] outline-none text-sm font-medium transition-all"
            />
          </div>
        </div>

        {/* Content list */}
        {isLoading ? (
          <div className="text-center py-32">
            <Loader2 className="w-8 h-8 animate-spin mb-4 text-[var(--muted)] mx-auto" />
            <p className="text-sm text-[var(--muted)] font-medium">Loading staff directory...</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-32 flex flex-col items-center">
            <div className="w-16 h-16 rounded-2xl bg-[var(--card-bg)] border border-[var(--border-color)] shadow-sm flex items-center justify-center mb-6">
              <GraduationCap className="w-6 h-6 text-[var(--muted)]" />
            </div>
            <p className="font-bold text-lg text-[var(--foreground)]">
              {query ? "No teachers match your search." : "No teachers registered yet."}
            </p>
            {!query && (
              <button onClick={() => setIsModalOpen(true)} className="mt-4 flex items-center justify-center gap-2 text-sm font-semibold text-[var(--foreground)] hover:opacity-70 transition-opacity">
                <Plus className="w-4 h-4" /> Register your first instructor
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-6">
            {filtered.map((teacher, index) => (
              <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.05 }}
                key={teacher.id} 
                className="bg-[var(--background)] border border-[var(--border-color)] rounded-[24px] p-6 flex flex-col hover:border-[var(--foreground)]/30 hover:shadow-md transition-all relative group"
              >
                {/* Trash/Delete Action */}
                <button
                  onClick={() => handleDelete(teacher.id, teacher.full_name)}
                  className="absolute top-4 right-4 p-2 text-[var(--muted)] hover:text-red-500 hover:bg-red-500/10 rounded-xl transition-all opacity-0 group-hover:opacity-100"
                  title="Remove Instructor"
                >
                  <Trash2 className="w-4 h-4" />
                </button>

                {/* Avatar/Specialty */}
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-12 h-12 rounded-[16px] bg-[var(--foreground)] text-[var(--background)] flex items-center justify-center font-bold text-lg shadow-sm shrink-0 border border-[var(--border-color)]">
                    {teacher.full_name.charAt(0)}
                  </div>
                  <div>
                    <h3 className="font-bold text-[var(--foreground)] leading-tight text-lg">{teacher.full_name}</h3>
                    <span className="inline-block text-[10px] font-bold uppercase tracking-widest text-[var(--muted)] mt-1 bg-[var(--foreground)]/5 px-2 py-0.5 rounded-md border border-[var(--border-color)]">
                      {teacher.specialty}
                    </span>
                  </div>
                </div>

                {/* Contact details */}
                <div className="space-y-3 text-sm font-medium text-[var(--muted)] border-t border-[var(--border-color)] pt-5 mb-5">
                  <div className="flex items-center gap-3">
                    <Mail className="w-4 h-4 opacity-50" />
                    <span className="truncate">{teacher.email}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Phone className="w-4 h-4 opacity-50" />
                    <span>{teacher.phone}</span>
                  </div>
                </div>

                {/* Assigned Batches */}
                <div className="mt-auto pt-4 border-t border-[var(--border-color)]">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-[var(--muted)] mb-3 flex items-center gap-1.5">
                    <BookOpen className="w-3.5 h-3.5" /> Assigned Batches
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {teacher.assigned_batches && teacher.assigned_batches.length > 0 ? (
                      teacher.assigned_batches.map(batchName => (
                        <span key={batchName} className="text-xs font-semibold bg-[var(--foreground)]/5 text-[var(--foreground)] px-2.5 py-1 rounded-lg border border-[var(--border-color)]">
                          {batchName}
                        </span>
                      ))
                    ) : (
                      <span className="text-xs italic font-medium text-[var(--muted)]">
                        No batches assigned
                      </span>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* ── Modal Add Teacher ────────────────────────── */}
      <AnimatePresence>
        {isModalOpen && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-[var(--background)]/80 backdrop-blur-sm z-40" 
              onClick={() => setIsModalOpen(false)} 
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ type: "spring", bounce: 0.3, duration: 0.4 }}
              className="fixed inset-0 flex items-center justify-center z-50 p-4 pointer-events-none"
            >
              <div className="bg-[var(--card-bg)] rounded-[32px] shadow-2xl border border-[var(--border-color)] w-full max-w-md pointer-events-auto overflow-hidden flex flex-col max-h-[90vh]">
                <div className="flex items-center justify-between px-8 py-6 border-b border-[var(--border-color)] shrink-0 bg-[var(--foreground)]/5">
                  <h2 className="text-xl font-bold tracking-tight text-[var(--foreground)] flex items-center gap-2">
                    <GraduationCap className="w-5 h-5 opacity-70" /> Add New Instructor
                  </h2>
                  <button onClick={() => setIsModalOpen(false)} className="p-2 rounded-full hover:bg-[var(--background)] transition-colors">
                    <X className="w-5 h-5 text-[var(--muted)]" />
                  </button>
                </div>

                <div className="p-8 overflow-y-auto">
                  <form id="teacher-form" onSubmit={handleSubmit} className="space-y-5">
                    <div className="space-y-2">
                      <label className="text-xs font-bold uppercase tracking-wider text-[var(--muted)]">Full Name <span className="text-red-500">*</span></label>
                      <input name="fullName" required placeholder="e.g. Master Terence Lewis" className="w-full px-4 py-3 rounded-xl border border-[var(--border-color)] bg-[var(--background)] focus:border-[var(--foreground)] focus:ring-1 focus:ring-[var(--foreground)] outline-none text-sm font-medium transition-all" />
                    </div>

                    <div className="space-y-2">
                      <label className="text-xs font-bold uppercase tracking-wider text-[var(--muted)]">Dance Specialty <span className="text-red-500">*</span></label>
                      <select name="specialty" required className="w-full px-4 py-3 rounded-xl border border-[var(--border-color)] bg-[var(--background)] focus:border-[var(--foreground)] focus:ring-1 focus:ring-[var(--foreground)] outline-none text-sm font-medium transition-all appearance-none">
                        {SPECIALTIES.map(spec => (
                          <option key={spec} value={spec}>{spec}</option>
                        ))}
                      </select>
                    </div>

                    <div className="space-y-2">
                      <label className="text-xs font-bold uppercase tracking-wider text-[var(--muted)]">Mobile / Contact Number <span className="text-red-500">*</span></label>
                      <input name="phone" required placeholder="e.g. +91 9876543210" className="w-full px-4 py-3 rounded-xl border border-[var(--border-color)] bg-[var(--background)] focus:border-[var(--foreground)] focus:ring-1 focus:ring-[var(--foreground)] outline-none text-sm font-medium transition-all" />
                    </div>

                    <div className="space-y-2">
                      <label className="text-xs font-bold uppercase tracking-wider text-[var(--muted)]">Email Address <span className="text-red-500">*</span></label>
                      <input name="email" type="email" required placeholder="e.g. terence@dil.academy" className="w-full px-4 py-3 rounded-xl border border-[var(--border-color)] bg-[var(--background)] focus:border-[var(--foreground)] focus:ring-1 focus:ring-[var(--foreground)] outline-none text-sm font-medium transition-all" />
                    </div>

                    <div className="space-y-2">
                      <label className="text-xs font-bold uppercase tracking-wider text-[var(--muted)]">Login Password</label>
                      <input name="password" type="password" placeholder="DILTeacher123!" className="w-full px-4 py-3 rounded-xl border border-[var(--border-color)] bg-[var(--background)] focus:border-[var(--foreground)] focus:ring-1 focus:ring-[var(--foreground)] outline-none text-sm font-medium transition-all" />
                      <p className="text-[10px] text-[var(--muted)] mt-1 font-medium">Defaults to <code className="bg-[var(--foreground)]/10 px-1 py-0.5 rounded text-[var(--foreground)] font-mono">DILTeacher123!</code> if left empty.</p>
                    </div>
                  </form>
                </div>

                <div className="p-6 border-t border-[var(--border-color)] bg-[var(--foreground)]/5 shrink-0 flex justify-end gap-3">
                  <button type="button" onClick={() => setIsModalOpen(false)} className="px-6 py-3 rounded-full border border-transparent text-sm font-semibold text-[var(--foreground)] hover:bg-[var(--background)] transition-colors">
                    Cancel
                  </button>
                  <button
                    type="submit"
                    form="teacher-form"
                    disabled={isSubmitting}
                    className="px-6 py-3 bg-[var(--foreground)] hover:bg-[var(--foreground)]/90 text-[var(--background)] rounded-full text-sm font-semibold flex items-center gap-2 disabled:opacity-70 shadow-sm transition-all"
                  >
                    {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                    {isSubmitting ? "Creating..." : "Save Instructor"}
                  </button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

"use client";

import { useState, useEffect } from "react";
import { Users, Plus, Edit, Trash2, Calendar, Clock, BookOpen, Loader2, Save, X, Phone, UserPlus, ArrowRight } from "lucide-react";
import { fetchBatches, fetchInstructors, createBatch, updateBatch, deleteBatch } from "@/app/actions/batches";
import { toast } from "sonner";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";

type Batch = {
  id: string;
  name: string;
  style: string;
  max_capacity: number;
  instructor_id: string | null;
  instructor?: { full_name: string; id: string };
  schedule: { days: string[]; time: string };
  studentCount?: number; 
};

type Instructor = {
  id: string;
  full_name: string;
};

const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

export default function BatchesPage() {
  const [batches, setBatches] = useState<Batch[]>([]);
  const [instructors, setInstructors] = useState<Instructor[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingBatch, setEditingBatch] = useState<Batch | null>(null);

  // Form State
  const [selectedDays, setSelectedDays] = useState<string[]>([]);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setIsLoading(true);
    const [batchesData, instructorsData] = await Promise.all([
      fetchBatches(),
      fetchInstructors()
    ]);
    
    // Add mock student counts since we don't have a direct join set up yet
    const enrichedBatches = batchesData.map((b: any) => ({
      ...b,
      studentCount: Math.floor(Math.random() * b.max_capacity) // Mock
    }));
    
    setBatches(enrichedBatches);
    setInstructors(instructorsData);
    setIsLoading(false);
  };

  const handleOpenCreate = () => {
    setEditingBatch(null);
    setSelectedDays([]);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (batch: Batch) => {
    setEditingBatch(batch);
    setSelectedDays(batch.schedule?.days || []);
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to delete the batch "${name}"?`)) return;
    const res = await deleteBatch(id);
    if (res.error) toast.error(res.error);
    else {
      toast.success("Batch deleted");
      loadData();
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (selectedDays.length === 0) {
      toast.error("Please select at least one day for the schedule");
      return;
    }

    setIsSubmitting(true);
    const formData = new FormData(e.currentTarget);
    selectedDays.forEach(day => formData.append("days", day));

    const res = editingBatch 
      ? await updateBatch(editingBatch.id, formData)
      : await createBatch(formData);

    setIsSubmitting(false);

    if (res.error) {
      toast.error(res.error);
    } else {
      toast.success(editingBatch ? "Batch updated" : "Batch created");
      setIsModalOpen(false);
      loadData();
    }
  };

  const toggleDay = (day: string) => {
    setSelectedDays(prev => 
      prev.includes(day) ? prev.filter(d => d !== day) : [...prev, day]
    );
  };

  const handleBulkSMS = (batchName: string) => {
    const encoded = encodeURIComponent(`Message to all students in ${batchName}:`);
    window.open(`https://wa.me/?text=${encoded}`, '_blank');
  };

  if (isLoading) {
    return (
      <div className="h-[60vh] flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-[var(--muted)]" />
      </div>
    );
  }

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-6xl mx-auto space-y-8 pb-20"
    >
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-[var(--foreground)] tracking-tight">
            Batches & Classes
          </h1>
          <p className="text-[var(--muted)] text-sm mt-1">Organize schedules and manage academy capacity.</p>
        </div>
        <button
          onClick={handleOpenCreate}
          className="flex items-center gap-2 px-5 py-2.5 bg-[var(--foreground)] hover:bg-[var(--foreground)]/90 text-[var(--background)] rounded-full font-medium shadow-sm transition-all text-sm self-start"
        >
          <Plus className="w-4 h-4" /> Create Batch
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {batches.map((batch, index) => {
          const isFull = (batch.studentCount || 0) >= batch.max_capacity;
          const occupancyPct = Math.min(((batch.studentCount || 0) / batch.max_capacity) * 100, 100);

          return (
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              key={batch.id} 
              className="group bg-[var(--card-bg)] rounded-[24px] border border-[var(--border-color)] shadow-sm hover:shadow-md transition-all flex flex-col overflow-hidden"
            >
              {/* Card Header */}
              <div className="p-6 border-b border-[var(--border-color)] relative bg-[var(--foreground)]/5">
                <div className="absolute top-5 right-5 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button onClick={() => handleOpenEdit(batch)} className="p-1.5 text-[var(--muted)] hover:text-[var(--foreground)] hover:bg-[var(--background)] rounded-lg shadow-sm border border-transparent hover:border-[var(--border-color)] transition-all" title="Edit Batch">
                    <Edit className="w-4 h-4" />
                  </button>
                  <button onClick={() => handleDelete(batch.id, batch.name)} className="p-1.5 text-[var(--muted)] hover:text-red-600 hover:bg-[var(--background)] rounded-lg shadow-sm border border-transparent hover:border-[var(--border-color)] transition-all" title="Delete Batch">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
                
                <span className="inline-block px-3 py-1 text-[10px] font-bold tracking-widest uppercase rounded-full bg-[var(--background)] text-[var(--foreground)] mb-4 border border-[var(--border-color)]">
                  {batch.style}
                </span>
                <h2 className="text-xl font-bold text-[var(--foreground)] tracking-tight pr-16 leading-tight">{batch.name}</h2>
                
                <div className="flex items-center gap-2 mt-4 text-sm font-medium text-[var(--muted)]">
                  <div className="w-6 h-6 rounded-full bg-[var(--foreground)]/10 flex items-center justify-center">
                    <UserPlus className="w-3.5 h-3.5 text-[var(--foreground)]" />
                  </div>
                  {batch.instructor?.full_name || <span className="text-amber-500">Unassigned</span>}
                </div>
              </div>

              {/* Card Body */}
              <div className="p-6 flex-1 space-y-6">
                
                {/* Schedule */}
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-xl bg-[var(--foreground)]/5 flex items-center justify-center shrink-0">
                    <Calendar className="w-5 h-5 text-[var(--muted)]" />
                  </div>
                  <div>
                    <p className="text-[11px] text-[var(--muted)] font-bold uppercase tracking-wider">Schedule</p>
                    <p className="text-sm font-semibold text-[var(--foreground)] mt-0.5">
                      {batch.schedule?.days?.join(", ") || "Unscheduled"}
                    </p>
                    <div className="flex items-center gap-1.5 mt-1.5 text-sm font-medium text-[var(--muted)]">
                      <Clock className="w-3.5 h-3.5" /> {batch.schedule?.time || "TBD"}
                    </div>
                  </div>
                </div>

                {/* Capacity */}
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-xl bg-[var(--foreground)]/5 flex items-center justify-center shrink-0">
                    <Users className="w-5 h-5 text-[var(--muted)]" />
                  </div>
                  <div className="w-full mt-0.5">
                    <div className="flex justify-between items-end mb-2">
                      <p className="text-[11px] text-[var(--muted)] font-bold uppercase tracking-wider">Capacity</p>
                      <p className={`text-xs font-bold ${isFull ? 'text-amber-500' : 'text-[var(--foreground)]'}`}>
                        {batch.studentCount} <span className="text-[var(--muted)]">/ {batch.max_capacity}</span>
                      </p>
                    </div>
                    <div className="h-1.5 w-full bg-[var(--border-color)] rounded-full overflow-hidden">
                      <div 
                        className={`h-full rounded-full transition-all duration-500 ${isFull ? 'bg-amber-500' : 'bg-[var(--foreground)]'}`}
                        style={{ width: `${occupancyPct}%` }}
                      />
                    </div>
                  </div>
                </div>

              </div>

              {/* Card Footer */}
              <div className="p-4 border-t border-[var(--border-color)] flex gap-3 bg-[var(--foreground)]/5">
                <Link href={`/dashboard/attendance?batch=${batch.id}`} className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-[var(--background)] border border-[var(--border-color)] hover:border-[var(--foreground)]/30 rounded-xl text-sm font-semibold text-[var(--foreground)] shadow-sm transition-all group/btn">
                  Mark Attendance <ArrowRight className="w-3.5 h-3.5 text-[var(--muted)] group-hover/btn:text-[var(--foreground)] group-hover/btn:translate-x-0.5 transition-all" />
                </Link>
                <button onClick={() => handleBulkSMS(batch.name)} className="w-11 flex items-center justify-center bg-green-500/10 text-green-600 dark:text-green-400 hover:bg-green-500/20 border border-transparent rounded-xl transition-colors" title="Message Batch via WhatsApp">
                  <Phone className="w-4 h-4" />
                </button>
              </div>
            </motion.div>
          );
        })}

        {batches.length === 0 && (
          <div className="col-span-full py-32 flex flex-col items-center justify-center border-2 border-dashed border-[var(--border-color)] rounded-[32px]">
            <div className="w-16 h-16 rounded-2xl bg-[var(--card-bg)] border border-[var(--border-color)] shadow-sm flex items-center justify-center mb-6">
              <BookOpen className="w-6 h-6 text-[var(--muted)]" />
            </div>
            <p className="text-[var(--foreground)] font-bold text-lg">No batches created</p>
            <p className="text-[var(--muted)] text-sm mt-2 mb-8 font-medium">Create your first class to start managing schedules.</p>
            <button
              onClick={handleOpenCreate}
              className="flex items-center gap-2 px-6 py-3 bg-[var(--foreground)] hover:bg-[var(--foreground)]/90 text-[var(--background)] rounded-full font-semibold shadow-sm transition-all text-sm"
            >
              <Plus className="w-4 h-4" /> Create First Batch
            </button>
          </div>
        )}
      </div>

      {/* ── Modal ─────────────────────────────────────── */}
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
              <div className="bg-[var(--card-bg)] rounded-[32px] shadow-2xl border border-[var(--border-color)] w-full max-w-md overflow-hidden flex flex-col max-h-[90vh] pointer-events-auto relative">
                <div className="flex items-center justify-between px-8 py-6 border-b border-[var(--border-color)]">
                  <h2 className="text-xl font-bold tracking-tight text-[var(--foreground)]">
                    {editingBatch ? "Edit Batch" : "Create Batch"}
                  </h2>
                  <button onClick={() => setIsModalOpen(false)} className="p-2 rounded-full hover:bg-[var(--foreground)]/5 transition-colors">
                    <X className="w-5 h-5 text-[var(--muted)]" />
                  </button>
                </div>

                <div className="p-8 overflow-y-auto">
                  <form id="batch-form" onSubmit={handleSubmit} className="space-y-6">
                    <div className="space-y-2">
                      <label className="text-xs font-bold uppercase tracking-wider text-[var(--muted)]">Batch Name <span className="text-red-500">*</span></label>
                      <input name="name" required defaultValue={editingBatch?.name} placeholder="e.g. Junior Hip-Hop" className="w-full px-4 py-3 rounded-xl border border-[var(--border-color)] bg-[var(--background)] focus:border-[var(--foreground)] focus:ring-1 focus:ring-[var(--foreground)] outline-none text-sm font-medium transition-all" />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="text-xs font-bold uppercase tracking-wider text-[var(--muted)]">Style/Category <span className="text-red-500">*</span></label>
                        <input name="style" required defaultValue={editingBatch?.style} placeholder="e.g. Hip-Hop" className="w-full px-4 py-3 rounded-xl border border-[var(--border-color)] bg-[var(--background)] focus:border-[var(--foreground)] focus:ring-1 focus:ring-[var(--foreground)] outline-none text-sm font-medium transition-all" />
                      </div>
                      <div className="space-y-2">
                        <label className="text-xs font-bold uppercase tracking-wider text-[var(--muted)]">Max Capacity</label>
                        <input name="max_capacity" type="number" min="1" defaultValue={editingBatch?.max_capacity || 30} className="w-full px-4 py-3 rounded-xl border border-[var(--border-color)] bg-[var(--background)] focus:border-[var(--foreground)] focus:ring-1 focus:ring-[var(--foreground)] outline-none text-sm font-medium transition-all" />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="text-xs font-bold uppercase tracking-wider text-[var(--muted)]">Instructor</label>
                      <div className="relative">
                        <select name="instructor_id" defaultValue={editingBatch?.instructor_id || ""} className="w-full px-4 py-3 rounded-xl border border-[var(--border-color)] bg-[var(--background)] focus:border-[var(--foreground)] focus:ring-1 focus:ring-[var(--foreground)] outline-none text-sm font-medium transition-all appearance-none">
                          <option value="">— Unassigned —</option>
                          {instructors.map(inst => (
                            <option key={inst.id} value={inst.id}>{inst.full_name}</option>
                          ))}
                        </select>
                        <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none">
                          <ArrowRight className="w-4 h-4 text-[var(--muted)] rotate-90" />
                        </div>
                      </div>
                    </div>

                    <div className="space-y-4 pt-6 border-t border-[var(--border-color)]">
                      <h3 className="text-sm font-bold text-[var(--foreground)]">Schedule Details</h3>
                      
                      <div className="space-y-3">
                        <label className="text-xs font-bold uppercase tracking-wider text-[var(--muted)]">Days of Week <span className="text-red-500">*</span></label>
                        <div className="flex flex-wrap gap-2">
                          {DAYS.map(day => {
                            const isSelected = selectedDays.includes(day);
                            return (
                              <button
                                key={day}
                                type="button"
                                onClick={() => toggleDay(day)}
                                className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all border ${
                                  isSelected 
                                  ? "bg-[var(--foreground)] border-[var(--foreground)] text-[var(--background)] shadow-md" 
                                  : "bg-[var(--background)] border-[var(--border-color)] text-[var(--muted)] hover:border-[var(--foreground)]/30 hover:text-[var(--foreground)]"
                                }`}
                              >
                                {day}
                              </button>
                            );
                          })}
                        </div>
                      </div>

                      <div className="space-y-2 pt-2">
                        <label className="text-xs font-bold uppercase tracking-wider text-[var(--muted)]">Time Range</label>
                        <input name="time" type="text" placeholder="e.g. 5:00 PM - 6:30 PM" defaultValue={editingBatch?.schedule?.time || ""} className="w-full px-4 py-3 rounded-xl border border-[var(--border-color)] bg-[var(--background)] focus:border-[var(--foreground)] focus:ring-1 focus:ring-[var(--foreground)] outline-none text-sm font-medium transition-all" />
                      </div>
                    </div>
                  </form>
                </div>

                <div className="p-6 border-t border-[var(--border-color)] bg-[var(--foreground)]/5 flex justify-end gap-3 shrink-0">
                  <button type="button" onClick={() => setIsModalOpen(false)} className="px-6 py-3 rounded-full border border-transparent text-sm font-semibold text-[var(--foreground)] hover:bg-[var(--foreground)]/10 transition-all">
                    Cancel
                  </button>
                  <button
                    type="submit"
                    form="batch-form"
                    disabled={isSubmitting}
                    className="px-6 py-3 bg-[var(--foreground)] hover:bg-[var(--foreground)]/90 text-[var(--background)] rounded-full text-sm font-semibold flex items-center gap-2 disabled:opacity-50 shadow-sm transition-all"
                  >
                    {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                    {isSubmitting ? "Saving..." : "Save Batch"}
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

"use client";

import { useState, useEffect } from "react";
import { Users, Plus, Edit, Trash2, Calendar, Clock, BookOpen, Loader2, Save, X, Phone, UserPlus } from "lucide-react";
import { fetchBatches, fetchInstructors, createBatch, updateBatch, deleteBatch } from "@/app/actions/batches";
import { toast } from "sonner";
import Link from "next/link";

type Batch = {
  id: string;
  name: string;
  style: string;
  max_capacity: number;
  instructor_id: string | null;
  instructor?: { full_name: string; id: string };
  schedule: { days: string[]; time: string };
  studentCount?: number; // Mocked for UI, ideally fetched via join
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
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-slate-400">
        <Loader2 className="w-8 h-8 animate-spin mb-4 text-primary-500" />
        <p>Loading batches...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <BookOpen className="w-6 h-6 text-primary-500" /> Batch Management
          </h1>
          <p className="text-slate-500 text-sm mt-1">Organize classes, assign teachers, and manage schedules.</p>
        </div>
        <button
          onClick={handleOpenCreate}
          className="flex items-center gap-2 px-5 py-2.5 bg-primary-600 hover:bg-primary-700 text-white rounded-xl font-semibold shadow-sm transition-all text-sm self-start"
        >
          <Plus className="w-4 h-4" /> Create Batch
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {batches.map(batch => (
          <div key={batch.id} className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm overflow-hidden flex flex-col hover:shadow-md transition-shadow">
            <div className="p-5 border-b border-slate-100 dark:border-slate-800 relative">
              <div className="absolute top-4 right-4 flex gap-1">
                <button onClick={() => handleOpenEdit(batch)} className="p-1.5 text-slate-400 hover:text-primary-600 hover:bg-primary-50 dark:hover:bg-primary-900/20 rounded-md transition-colors" title="Edit Batch">
                  <Edit className="w-4 h-4" />
                </button>
                <button onClick={() => handleDelete(batch.id, batch.name)} className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-md transition-colors" title="Delete Batch">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
              
              <span className="inline-block px-2.5 py-1 text-xs font-semibold rounded-md bg-primary-50 text-primary-700 dark:bg-primary-900/20 dark:text-primary-400 mb-2">
                {batch.style}
              </span>
              <h2 className="text-xl font-bold text-slate-900 dark:text-white pr-16">{batch.name}</h2>
              
              <div className="flex items-center gap-1.5 mt-3 text-sm text-slate-600 dark:text-slate-400">
                <UserPlus className="w-4 h-4 text-slate-400" />
                {batch.instructor?.full_name || <span className="text-orange-500 italic">No teacher assigned</span>}
              </div>
            </div>

            <div className="p-5 flex-1 space-y-4 bg-slate-50/50 dark:bg-slate-800/20">
              <div className="flex items-start gap-3">
                <Calendar className="w-4 h-4 text-slate-400 mt-0.5 shrink-0" />
                <div>
                  <p className="text-xs text-slate-500 font-medium uppercase">Schedule</p>
                  <p className="text-sm text-slate-900 dark:text-white mt-0.5">
                    {batch.schedule?.days?.join(", ") || "No days set"}
                  </p>
                  <div className="flex items-center gap-1.5 mt-1 text-sm text-slate-600 dark:text-slate-400">
                    <Clock className="w-3.5 h-3.5" /> {batch.schedule?.time || "Time not set"}
                  </div>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Users className="w-4 h-4 text-slate-400 mt-0.5 shrink-0" />
                <div className="w-full">
                  <div className="flex justify-between items-end mb-1">
                    <p className="text-xs text-slate-500 font-medium uppercase">Capacity</p>
                    <p className="text-xs font-medium text-slate-900 dark:text-white">{batch.studentCount} / {batch.max_capacity}</p>
                  </div>
                  <div className="h-1.5 w-full bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                    <div 
                      className={`h-full rounded-full transition-all ${
                        (batch.studentCount || 0) >= batch.max_capacity ? 'bg-red-500' : 'bg-primary-500'
                      }`}
                      style={{ width: `${Math.min(((batch.studentCount || 0) / batch.max_capacity) * 100, 100)}%` }}
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="p-4 border-t border-slate-100 dark:border-slate-800 flex gap-2">
              <Link href={`/dashboard/attendance?batch=${batch.id}`} className="flex-1 text-center py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors">
                Attendance
              </Link>
              <button onClick={() => handleBulkSMS(batch.name)} className="px-3 py-2 bg-green-50 text-green-600 dark:bg-green-900/20 dark:text-green-400 border border-green-100 dark:border-green-900/30 rounded-lg hover:bg-green-100 dark:hover:bg-green-900/40 transition-colors" title="Bulk WhatsApp Message">
                <Phone className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}

        {batches.length === 0 && (
          <div className="col-span-full py-16 text-center border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-2xl text-slate-400">
            <BookOpen className="w-10 h-10 mx-auto mb-3 opacity-30" />
            <p>No batches created yet.</p>
          </div>
        )}
      </div>

      {/* ── Modal ─────────────────────────────────────── */}
      {isModalOpen && (
        <>
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-40" onClick={() => setIsModalOpen(false)} />
          <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-100 dark:border-slate-800 w-full max-w-md animate-in fade-in zoom-in-95 duration-200 overflow-hidden flex flex-col max-h-[90vh]">
              <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100 dark:border-slate-800 shrink-0">
                <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                  {editingBatch ? "Edit Batch" : "Create New Batch"}
                </h2>
                <button onClick={() => setIsModalOpen(false)} className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
                  <X className="w-5 h-5 text-slate-500" />
                </button>
              </div>

              <div className="p-6 overflow-y-auto">
                <form id="batch-form" onSubmit={handleSubmit} className="space-y-4">
                  <div className="space-y-1.5">
                    <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Batch Name <span className="text-red-500">*</span></label>
                    <input name="name" required defaultValue={editingBatch?.name} placeholder="e.g. Junior Hip Hop Weekend" className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 focus:border-primary-500 outline-none text-sm dark:text-white" />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Courses <span className="text-red-500">*</span></label>
                      <input name="style" required defaultValue={editingBatch?.style} placeholder="e.g. Hip Hop" className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 focus:border-primary-500 outline-none text-sm dark:text-white" />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Max Capacity</label>
                      <input name="max_capacity" type="number" min="1" defaultValue={editingBatch?.max_capacity || 30} className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 focus:border-primary-500 outline-none text-sm dark:text-white" />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Instructor (Teacher)</label>
                    <select name="instructor_id" defaultValue={editingBatch?.instructor_id || ""} className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 focus:border-primary-500 outline-none text-sm dark:text-white">
                      <option value="">— Unassigned —</option>
                      {instructors.map(inst => (
                        <option key={inst.id} value={inst.id}>{inst.full_name}</option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-3 pt-2 border-t border-slate-100 dark:border-slate-800">
                    <h3 className="text-sm font-bold text-slate-900 dark:text-white">Schedule</h3>
                    
                    <div className="space-y-1.5">
                      <label className="text-xs text-slate-500 font-medium uppercase tracking-wider">Days of Week <span className="text-red-500">*</span></label>
                      <div className="flex flex-wrap gap-2">
                        {DAYS.map(day => {
                          const isSelected = selectedDays.includes(day);
                          return (
                            <button
                              key={day}
                              type="button"
                              onClick={() => toggleDay(day)}
                              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors border ${
                                isSelected 
                                ? "bg-primary-50 border-primary-200 text-primary-700 dark:bg-primary-900/30 dark:border-primary-800/50 dark:text-primary-400" 
                                : "bg-white border-slate-200 text-slate-600 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700"
                              }`}
                            >
                              {day}
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs text-slate-500 font-medium uppercase tracking-wider">Time</label>
                      <input name="time" type="text" placeholder="e.g. 5:00 PM - 6:30 PM" defaultValue={editingBatch?.schedule?.time || ""} className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 focus:border-primary-500 outline-none text-sm dark:text-white" />
                    </div>
                  </div>
                </form>
              </div>

              <div className="p-6 border-t border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 shrink-0 flex justify-end gap-3">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-sm font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
                  Cancel
                </button>
                <button
                  type="submit"
                  form="batch-form"
                  disabled={isSubmitting}
                  className="px-5 py-2.5 bg-primary-600 hover:bg-primary-700 text-white rounded-xl text-sm font-semibold flex items-center gap-2 disabled:opacity-70 shadow-sm transition-colors"
                >
                  {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                  {isSubmitting ? "Saving..." : "Save Batch"}
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

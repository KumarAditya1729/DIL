"use client";

import { Calendar as CalendarIcon, CheckCircle2, XCircle, ChevronLeft, ChevronRight, Loader2, BarChart2, Filter, Download } from "lucide-react";
import { useState, useEffect } from "react";
import { fetchStudentsByBatch, saveDailyAttendance } from "@/app/actions/attendance";
import { fetchBatches } from "@/app/actions/batches";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";

type StudentRow = { id: string, name: string, admissionNumber: string, batch: string, present: boolean | null };

export default function AttendancePage() {
  const [students, setStudents] = useState<StudentRow[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [activeBatch, setActiveBatch] = useState("");
  const [currentDate, setCurrentDate] = useState(new Date());
  const [batches, setBatches] = useState<any[]>([]);

  useEffect(() => {
    const loadBatches = async () => {
      try {
        const data = await fetchBatches();
        setBatches(data);
        if (data && data.length > 0) setActiveBatch(data[0].name);
      } catch (err) {
        console.error("Failed to load batches:", err);
      }
    };
    loadBatches();
  }, []);

  useEffect(() => {
    if (!activeBatch) {
      setIsLoading(false);
      return;
    }
    const loadData = async () => {
      setIsLoading(true);
      try {
        const data = await fetchStudentsByBatch(activeBatch);
        setStudents(data || []);
      } catch (err) {
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };
    loadData();
  }, [activeBatch]);

  const toggleAttendance = (id: string, status: boolean) => {
    setStudents(prev => prev.map(s => s.id === id ? { ...s, present: status } : s));
  };

  const markAll = (status: boolean) => {
    setStudents(prev => prev.map(s => ({ ...s, present: status })));
  };

  const handleSave = async () => {
    setIsSaving(true);
    const records = students.filter(s => s.present !== null).map(s => ({
      studentId: s.id,
      present: s.present as boolean
    }));
    
    if (records.length === 0) {
      toast.error("Please mark attendance for at least one student.");
      setIsSaving(false);
      return;
    }

    const res = await saveDailyAttendance(records, currentDate.toISOString(), activeBatch);
    if (res.success) toast.success("Attendance saved successfully!");
    else toast.error(res.error || "Failed to save attendance");
    setIsSaving(false);
  };

  const formatDate = (date: Date) => date.toLocaleDateString('en-US', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });

  const shiftDate = (days: number) => {
    const newDate = new Date(currentDate);
    newDate.setDate(newDate.getDate() + days);
    setCurrentDate(newDate);
  };

  const percentPresent = students.length ? Math.round((students.filter(s => s.present).length / students.length) * 100) : 0;
  const presentCount = students.filter(s => s.present).length;
  const absentCount = students.filter(s => s.present === false).length;
  const unmarkedCount = students.filter(s => s.present === null).length;

  return (
    <div className="space-y-6 animate-in fade-in duration-500 pb-20">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-[var(--foreground)]">Attendance Register</h1>
          <p className="text-[var(--muted)] text-sm mt-1">Manage daily attendance and view trends.</p>
        </div>
        <div className="flex gap-2">
          <button className="px-4 py-2 border border-[var(--border-color)] bg-[var(--card-bg)] text-[var(--foreground)] rounded-full font-medium transition-all text-sm flex items-center gap-2 shadow-sm hover:bg-[var(--background)]">
            <BarChart2 className="w-4 h-4" /> View Heatmap
          </button>
        </div>
      </div>

      {/* Date & Batch Toolbar */}
      <div className="flex flex-col md:flex-row gap-4 items-center justify-between bg-[var(--card-bg)] p-4 rounded-2xl border border-[var(--border-color)] shadow-sm">
        
        {/* Date Selector */}
        <div className="flex items-center gap-1 bg-[var(--background)] p-1 rounded-xl border border-[var(--border-color)] shadow-sm w-full md:w-auto justify-between md:justify-start">
          <button onClick={() => shiftDate(-1)} className="p-2 hover:bg-[var(--foreground)]/5 rounded-lg transition-colors"><ChevronLeft className="w-4 h-4 text-[var(--foreground)]" /></button>
          <div className="flex items-center gap-2 px-4 font-semibold text-sm text-[var(--foreground)]">
            <CalendarIcon className="w-4 h-4 text-[var(--muted)]" />
            {formatDate(currentDate)}
          </div>
          <button onClick={() => shiftDate(1)} className="p-2 hover:bg-[var(--foreground)]/5 rounded-lg transition-colors"><ChevronRight className="w-4 h-4 text-[var(--foreground)]" /></button>
        </div>

        {/* Batch Selector */}
        <div className="flex w-full md:w-auto overflow-x-auto no-scrollbar gap-2 bg-[var(--background)] p-1 rounded-xl border border-[var(--border-color)] shadow-sm">
          {batches.map((b) => (
            <button 
              key={b.id} 
              onClick={() => setActiveBatch(b.name)}
              className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all whitespace-nowrap ${
                activeBatch === b.name 
                ? "bg-[var(--foreground)] text-[var(--background)] shadow-sm" 
                : "text-[var(--muted)] hover:text-[var(--foreground)] hover:bg-[var(--foreground)]/5"
              }`}
            >
              {b.name}
            </button>
          ))}
        </div>
      </div>

      {/* Stats Overview */}
      {activeBatch && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-[var(--card-bg)] p-5 rounded-2xl border border-[var(--border-color)] shadow-sm flex flex-col justify-between">
            <p className="text-[var(--muted)] text-sm font-medium mb-2">Total Students</p>
            <h3 className="text-3xl font-bold tracking-tighter text-[var(--foreground)]">{students.length}</h3>
          </div>
          <div className="bg-green-50 dark:bg-green-950/20 p-5 rounded-2xl border border-green-100 dark:border-green-900/30 flex flex-col justify-between">
            <p className="text-green-600/70 dark:text-green-400/70 text-sm font-medium mb-2">Present</p>
            <h3 className="text-3xl font-bold tracking-tighter text-green-600 dark:text-green-400">{presentCount}</h3>
          </div>
          <div className="bg-red-50 dark:bg-red-950/20 p-5 rounded-2xl border border-red-100 dark:border-red-900/30 flex flex-col justify-between">
            <p className="text-red-600/70 dark:text-red-400/70 text-sm font-medium mb-2">Absent</p>
            <h3 className="text-3xl font-bold tracking-tighter text-red-600 dark:text-red-400">{absentCount}</h3>
          </div>
          <div className="bg-[var(--background)] p-5 rounded-2xl border border-[var(--border-color)] flex flex-col justify-between">
            <p className="text-[var(--muted)] text-sm font-medium mb-2">Attendance Rate</p>
            <h3 className="text-3xl font-bold tracking-tighter text-[var(--foreground)]">{percentPresent}%</h3>
          </div>
        </div>
      )}

      {/* Main Register Area */}
      <div className="bg-[var(--card-bg)] rounded-[24px] border border-[var(--border-color)] shadow-sm overflow-hidden flex flex-col">
        {!activeBatch ? (
          <div className="flex-1 flex flex-col items-center justify-center py-24 text-[var(--muted)]">
            <CalendarIcon className="w-12 h-12 text-[var(--border-color)] mb-4" />
            <h3 className="text-lg font-bold text-[var(--foreground)] mb-1">No Active Batches</h3>
            <p className="text-sm">Create a batch first to mark student attendance.</p>
          </div>
        ) : (
          <>
            <div className="p-4 border-b border-[var(--border-color)] flex justify-between items-center bg-[var(--background)]">
              <h2 className="font-bold text-sm tracking-widest uppercase text-[var(--muted)]">Student Register</h2>
              <div className="flex gap-2">
                <button onClick={() => markAll(true)} disabled={isLoading || students.length === 0} className="px-4 py-1.5 bg-[var(--background)] text-[var(--foreground)] text-sm font-semibold rounded-lg border border-[var(--border-color)] hover:bg-[var(--foreground)] hover:text-[var(--background)] transition-colors shadow-sm disabled:opacity-50">
                  Mark All Present
                </button>
              </div>
            </div>

            <div className="flex-1 p-0 overflow-y-auto">
              {isLoading ? (
                <div className="w-full h-64 flex flex-col items-center justify-center text-[var(--muted)]">
                  <Loader2 className="w-8 h-8 animate-spin mb-4 text-[var(--foreground)]" />
                  <p className="font-medium text-sm">Loading register...</p>
                </div>
              ) : students.length === 0 ? (
                <div className="w-full h-64 flex flex-col items-center justify-center text-[var(--muted)]">
                  <p className="font-medium text-sm">No students enrolled in this batch.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-0 divide-y divide-x divide-[var(--border-color)] bg-[var(--card-bg)]">
                  {students.map((student) => (
                    <motion.div 
                      key={student.id} 
                      layout
                      className={`p-4 flex items-center justify-between transition-colors ${
                        student.present === true ? 'bg-green-50/50 dark:bg-green-950/10' :
                        student.present === false ? 'bg-red-50/50 dark:bg-red-950/10' : ''
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-[var(--background)] border border-[var(--border-color)] flex items-center justify-center font-bold text-sm text-[var(--foreground)]">
                          {student.name.charAt(0)}
                        </div>
                        <div>
                          <div className="font-semibold text-sm text-[var(--foreground)]">{student.name}</div>
                          <div className="text-[10px] uppercase tracking-widest text-[var(--muted)]">{student.admissionNumber || student.id.slice(0,8)}</div>
                        </div>
                      </div>
                      
                      <div className="flex items-center p-1 bg-[var(--background)] rounded-xl border border-[var(--border-color)] shadow-sm">
                        <button 
                          onClick={() => toggleAttendance(student.id, true)} 
                          className={`w-10 h-8 flex items-center justify-center rounded-lg transition-all ${
                            student.present === true 
                            ? 'bg-green-500 text-white shadow-md' 
                            : 'text-[var(--muted)] hover:bg-[var(--card-bg)] hover:text-green-500'
                          }`}
                        >
                          <CheckCircle2 className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={() => toggleAttendance(student.id, false)} 
                          className={`w-10 h-8 flex items-center justify-center rounded-lg transition-all ${
                            student.present === false 
                            ? 'bg-red-500 text-white shadow-md' 
                            : 'text-[var(--muted)] hover:bg-[var(--card-bg)] hover:text-red-500'
                          }`}
                        >
                          <XCircle className="w-4 h-4" />
                        </button>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>

            <div className="p-4 border-t border-[var(--border-color)] bg-[var(--background)] flex justify-between items-center">
              <p className="text-sm text-[var(--muted)]">
                <span className="font-bold text-[var(--foreground)]">{unmarkedCount}</span> students left to mark
              </p>
              <button 
                onClick={handleSave} 
                disabled={isSaving || students.length === 0} 
                className="px-8 py-3 bg-[var(--foreground)] text-[var(--background)] rounded-full font-semibold shadow-sm transition-all text-sm flex items-center gap-2 hover:bg-[var(--foreground)]/90 disabled:opacity-50"
              >
                {isSaving && <Loader2 className="w-4 h-4 animate-spin" />}
                {isSaving ? "Saving..." : "Save Register"}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

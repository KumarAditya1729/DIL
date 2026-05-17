"use client";

import { Calendar as CalendarIcon, CheckCircle2, XCircle, ChevronLeft, ChevronRight, Loader2 } from "lucide-react";
import { useState, useEffect } from "react";
import { fetchStudentsByBatch, saveDailyAttendance } from "@/app/actions/attendance";

import { toast } from "sonner";

type StudentRow = { id: string, name: string, admissionNumber: string, batch: string, present: boolean | null };

export default function AttendancePage() {
  const [students, setStudents] = useState<StudentRow[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [activeBatch, setActiveBatch] = useState("Junior A");
  const [currentDate, setCurrentDate] = useState(new Date());

  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      try {
        const data = await fetchStudentsByBatch(activeBatch);
        if (data && data.length > 0) {
          setStudents(data);
        } else {
          // Fallback empty state if no real DB rows exist yet
          setStudents([]);
        }
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

  const markAllPresent = () => {
    setStudents(prev => prev.map(s => ({ ...s, present: true })));
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
    if (res.success) {
      toast.success("Attendance saved successfully!");
    } else {
      toast.error(res.error || "Failed to save attendance");
    }
    setIsSaving(false);
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
  };

  const shiftDate = (days: number) => {
    const newDate = new Date(currentDate);
    newDate.setDate(newDate.getDate() + days);
    setCurrentDate(newDate);
  };

  const percentPresent = students.length ? Math.round((students.filter(s => s.present).length / students.length) * 100) : 0;

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Daily Attendance</h1>
          <p className="text-slate-500 text-sm mt-1">Mark and track student attendance.</p>
        </div>
        <div className="flex gap-2">
          <div className="flex items-center gap-4 bg-white dark:bg-slate-900 px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
            <button onClick={() => shiftDate(-1)} className="p-1 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-md"><ChevronLeft className="w-5 h-5 text-slate-500" /></button>
            <div className="flex items-center gap-2 font-medium text-slate-700 dark:text-slate-200 min-w-[120px] justify-center">
              <CalendarIcon className="w-4 h-4 text-primary-600" />
              {formatDate(currentDate)}
            </div>
            <button onClick={() => shiftDate(1)} className="p-1 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-md"><ChevronRight className="w-5 h-5 text-slate-500" /></button>
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm overflow-hidden flex flex-col md:flex-row min-h-[400px]">
        {/* Batch Selection Sidebar */}
        <div className="w-full md:w-64 border-b md:border-b-0 md:border-r border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/20">
          <div className="p-4 border-b border-slate-100 dark:border-slate-800 font-medium text-slate-700 dark:text-slate-200">
            Select Batch
          </div>
          <div className="p-2 space-y-1">
            {['Junior A', 'Senior B', 'Weekend Pro', 'Classical Beginners'].map((batch) => (
              <button 
                key={batch} 
                onClick={() => setActiveBatch(batch)}
                className={`w-full text-left px-4 py-3 rounded-xl text-sm transition-colors ${
                  activeBatch === batch 
                  ? 'bg-white dark:bg-slate-800 shadow-sm text-primary-600 font-medium border border-slate-100 dark:border-slate-700' 
                  : 'text-slate-600 dark:text-slate-400 hover:bg-white/50 dark:hover:bg-slate-800/50'
                }`}
              >
                {batch}
              </button>
            ))}
          </div>
        </div>

        {/* Attendance Marking Area */}
        <div className="flex-1 flex flex-col">
          <div className="p-4 sm:p-6 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center flex-wrap gap-4">
            <div>
              <h2 className="font-bold text-lg text-slate-800 dark:text-slate-200">{activeBatch} Batch</h2>
              <p className="text-sm text-slate-500">{students.length} Students • {percentPresent}% Present</p>
            </div>
            <div className="flex gap-2">
              <button onClick={markAllPresent} disabled={isLoading || students.length === 0} className="px-3 py-1.5 bg-green-50 text-green-700 dark:bg-green-900/30 dark:text-green-400 text-sm font-medium rounded-lg border border-green-200 dark:border-green-800/50 hover:bg-green-100 transition-colors disabled:opacity-50">Mark All Present</button>
            </div>
          </div>

          <div className="flex-1 p-0 overflow-y-auto">
            {isLoading ? (
              <div className="w-full h-48 flex flex-col items-center justify-center text-slate-400">
                <Loader2 className="w-8 h-8 animate-spin mb-4 text-primary-500" />
                <p>Loading database records...</p>
              </div>
            ) : students.length === 0 ? (
              <div className="w-full h-48 flex flex-col items-center justify-center text-slate-400">
                <p>No students enrolled in this batch yet.</p>
              </div>
            ) : (
              <table className="w-full text-sm text-left">
                <thead className="text-xs text-slate-500 uppercase bg-slate-50 dark:bg-slate-800/50">
                  <tr>
                    <th className="px-6 py-3 font-medium">Student</th>
                    <th className="px-6 py-3 font-medium text-center">Status</th>
                    <th className="px-6 py-3 font-medium text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {students.map((student) => (
                    <tr key={student.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/20">
                      <td className="px-6 py-4">
                        <div className="font-medium text-slate-900 dark:text-slate-200">{student.name}</div>
                        <div className="text-xs text-slate-500">{student.admissionNumber || student.id.slice(0,8)}</div>
                      </td>
                      <td className="px-6 py-4 text-center">
                        {student.present === true && <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"><CheckCircle2 className="w-3.5 h-3.5" /> Present</span>}
                        {student.present === false && <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"><XCircle className="w-3.5 h-3.5" /> Absent</span>}
                        {student.present === null && <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400">Not Marked</span>}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="inline-flex rounded-lg border border-slate-200 dark:border-slate-700 overflow-hidden p-1 bg-slate-100 dark:bg-slate-800 gap-1">
                          <button onClick={() => toggleAttendance(student.id, true)} className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${student.present === true ? 'bg-white dark:bg-slate-700 shadow-sm text-green-600' : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'}`}>P</button>
                          <button onClick={() => toggleAttendance(student.id, false)} className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${student.present === false ? 'bg-white dark:bg-slate-700 shadow-sm text-red-600' : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'}`}>A</button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
          <div className="p-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/20 text-right mt-auto">
            <button onClick={handleSave} disabled={isSaving || students.length === 0} className="px-6 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-xl font-medium shadow-sm transition-all text-sm flex items-center gap-2 ml-auto disabled:opacity-50">
              {isSaving && <Loader2 className="w-4 h-4 animate-spin" />}
              {isSaving ? "Saving..." : "Save Attendance"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

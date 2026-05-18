"use client";

import { Calendar as CalendarIcon, CheckCircle2, XCircle, ChevronLeft, ChevronRight, Loader2 } from "lucide-react";
import { useState, useEffect } from "react";
import { fetchStudentsByBatch, saveDailyAttendance } from "@/app/actions/attendance";
import { fetchBatches } from "@/app/actions/batches";

import { toast } from "sonner";

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
        if (data && data.length > 0) {
          setActiveBatch(data[0].name);
        }
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
        if (data && data.length > 0) {
          setStudents(data);
        } else {
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

  const [showDatePicker, setShowDatePicker] = useState(false);
  const [pickerMonth, setPickerMonth] = useState(currentDate.getMonth());
  const [pickerYear, setPickerYear] = useState(currentDate.getFullYear());
  const [pickerDay, setPickerDay] = useState(currentDate.getDate());

  const monthNames = ["January","February","March","April","May","June","July","August","September","October","November","December"];
  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: currentYear - 2010 + 1 }, (_, i) => currentYear - i);

  const applyDate = () => {
    const daysInMonth = new Date(pickerYear, pickerMonth + 1, 0).getDate();
    const safeDay = Math.min(pickerDay, daysInMonth);
    setCurrentDate(new Date(pickerYear, pickerMonth, safeDay));
    setShowDatePicker(false);
  };


  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Daily Attendance</h1>
          <p className="text-slate-500 text-sm mt-1">Mark and track student attendance.</p>
        </div>
        <div className="flex gap-2">
          {/* Date Picker */}
          <div className="relative">
            <div className="flex items-center gap-1 bg-white dark:bg-slate-900 px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
              <button onClick={() => shiftDate(-1)} className="p-1 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-md"><ChevronLeft className="w-4 h-4 text-slate-500" /></button>
              <button 
                onClick={() => { setPickerMonth(currentDate.getMonth()); setPickerYear(currentDate.getFullYear()); setPickerDay(currentDate.getDate()); setShowDatePicker(!showDatePicker); }}
                className="flex items-center gap-2 font-medium text-slate-700 dark:text-slate-200 min-w-[140px] justify-center hover:text-primary-600 transition-colors text-sm"
              >
                <CalendarIcon className="w-4 h-4 text-primary-600" />
                {formatDate(currentDate)}
              </button>
              <button onClick={() => shiftDate(1)} className="p-1 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-md"><ChevronRight className="w-4 h-4 text-slate-500" /></button>
            </div>

            {/* Smart Date Picker Dropdown */}
            {showDatePicker && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setShowDatePicker(false)} />
                <div className="absolute right-0 mt-2 w-72 bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 z-50 p-4 space-y-4">
                  <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Jump to Date</p>
                  
                  {/* Year + Month row */}
                  <div className="grid grid-cols-2 gap-2">
                    <div className="space-y-1">
                      <label className="text-xs text-slate-500">Year</label>
                      <select
                        value={pickerYear}
                        onChange={e => setPickerYear(Number(e.target.value))}
                        className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm text-slate-900 dark:text-white outline-none focus:border-primary-500"
                      >
                        {years.map(y => <option key={y} value={y}>{y}</option>)}
                      </select>
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs text-slate-500">Month</label>
                      <select
                        value={pickerMonth}
                        onChange={e => setPickerMonth(Number(e.target.value))}
                        className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm text-slate-900 dark:text-white outline-none focus:border-primary-500"
                      >
                        {monthNames.map((m, i) => <option key={i} value={i}>{m}</option>)}
                      </select>
                    </div>
                  </div>

                  {/* Day input */}
                  <div className="space-y-1">
                    <label className="text-xs text-slate-500">Day (1–{new Date(pickerYear, pickerMonth + 1, 0).getDate()})</label>
                    <input
                      type="number"
                      min={1}
                      max={new Date(pickerYear, pickerMonth + 1, 0).getDate()}
                      value={pickerDay}
                      onChange={e => setPickerDay(Number(e.target.value))}
                      className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm text-slate-900 dark:text-white outline-none focus:border-primary-500"
                    />
                  </div>

                  {/* Quick shortcuts */}
                  <div className="flex gap-2 flex-wrap">
                    <button onClick={() => { setCurrentDate(new Date()); setShowDatePicker(false); }} className="px-3 py-1 text-xs rounded-lg bg-primary-50 text-primary-600 dark:bg-primary-900/20 dark:text-primary-400 hover:bg-primary-100 transition-colors font-medium">Today</button>
                    <button onClick={() => { const d = new Date(); d.setDate(d.getDate()-7); setCurrentDate(d); setShowDatePicker(false); }} className="px-3 py-1 text-xs rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 transition-colors">-7 days</button>
                    <button onClick={() => { const d = new Date(); d.setMonth(d.getMonth()-1); setCurrentDate(d); setShowDatePicker(false); }} className="px-3 py-1 text-xs rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 transition-colors">Last month</button>
                  </div>

                  <button onClick={applyDate} className="w-full py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-xl text-sm font-medium transition-colors">
                    Go to Date
                  </button>
                </div>
              </>
            )}
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
            {batches.length === 0 ? (
              <div className="p-4 text-xs text-slate-500 dark:text-slate-400 text-center">
                ⚠️ No batches created yet. Create a batch first in Batches!
              </div>
            ) : (
              batches.map((b) => (
                <button 
                  key={b.id} 
                  onClick={() => setActiveBatch(b.name)}
                  className={`w-full text-left px-4 py-3 rounded-xl text-sm transition-colors ${
                    activeBatch === b.name 
                    ? 'bg-white dark:bg-slate-800 shadow-sm text-primary-600 font-medium border border-slate-100 dark:border-slate-700' 
                    : 'text-slate-600 dark:text-slate-400 hover:bg-white/50 dark:hover:bg-slate-800/50'
                  }`}
                >
                  {b.name}
                </button>
              ))
            )}
          </div>
        </div>        {/* Attendance Marking Area */}
        <div className="flex-1 flex flex-col">
          {!activeBatch ? (
            <div className="flex-1 flex flex-col items-center justify-center p-8 text-slate-400">
              <CalendarIcon className="w-12 h-12 text-slate-300 dark:text-slate-600 mb-4" />
              <h3 className="text-lg font-bold text-slate-700 dark:text-slate-300 mb-1">No Active Batches</h3>
              <p className="text-sm text-slate-500 text-center max-w-sm mb-4">You need to create a batch in the Batch Management section first to mark student attendance.</p>
            </div>
          ) : (
            <>
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
                            {student.present === false && <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-green-400"><XCircle className="w-3.5 h-3.5" /> Absent</span>}
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
              <div className="p-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30 text-right mt-auto">
                <button onClick={handleSave} disabled={isSaving || students.length === 0} className="px-6 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-xl font-medium shadow-sm transition-all text-sm flex items-center gap-2 ml-auto disabled:opacity-50">
                  {isSaving && <Loader2 className="w-4 h-4 animate-spin" />}
                  {isSaving ? "Saving..." : "Save Attendance"}
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

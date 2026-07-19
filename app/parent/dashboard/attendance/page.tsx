"use client";

import { useEffect, useState } from "react";
import { fetchChildData, fetchChildAttendance } from "@/app/actions/parent";
import { CalendarCheck, CheckCircle2, XCircle, BarChart3, Loader2, Calendar } from "lucide-react";
import Link from "next/link";
import { motion } from "framer-motion";

export default function ParentAttendancePage() {
  const [child, setChild] = useState<any>(null);
  const [attendance, setAttendance] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      const childData = await fetchChildData();
      setChild(childData);
      if (childData?.id) {
        const att = await fetchChildAttendance(childData.id);
        setAttendance(att);
      }
      setIsLoading(false);
    };
    load();
  }, []);

  const presentCount = attendance.filter(a => a.present).length;
  const absentCount = attendance.filter(a => !a.present).length;
  const pct = attendance.length > 0 ? Math.round((presentCount / attendance.length) * 100) : 0;

  const pctColor = pct >= 75 ? "text-emerald-500" : pct >= 50 ? "text-amber-500" : "text-red-500";
  const barColor = pct >= 75 ? "bg-emerald-500" : pct >= 50 ? "bg-amber-500" : "bg-red-500";

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <Loader2 className="w-8 h-8 animate-spin text-[var(--muted)] mb-4" />
        <p className="text-[var(--muted)] text-sm font-medium">Loading attendance data...</p>
      </div>
    );
  }

  if (!child) {
    return (
      <motion.div 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-center min-h-[60vh]"
      >
        <div className="text-center bg-[var(--card)] border border-[var(--border-color)] rounded-3xl p-10 max-w-sm shadow-sm space-y-6">
          <div className="w-16 h-16 rounded-full bg-[var(--hover-bg)] text-[var(--foreground)] flex items-center justify-center mx-auto border border-[var(--border-color)]">
            <CalendarCheck className="w-8 h-8 opacity-80" />
          </div>
          <div className="space-y-2">
            <h2 className="text-xl font-semibold text-[var(--foreground)] tracking-tight">No Linked Student</h2>
            <p className="text-[var(--muted)] text-sm">
              Please register your child first to track their attendance.
            </p>
          </div>
          <div className="pt-4">
            <Link
              href="/parent/dashboard/register"
              className="inline-flex items-center justify-center w-full py-3 bg-[var(--foreground)] text-[var(--background)] hover:opacity-90 rounded-xl font-medium text-sm transition-all shadow-sm"
            >
              Register Child Now
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
      className="max-w-4xl mx-auto space-y-8 pb-10"
    >
      <div>
        <h1 className="text-3xl font-semibold text-[var(--foreground)] flex items-center gap-3 tracking-tight">
          <CalendarCheck className="w-8 h-8 text-[var(--muted)]" /> Attendance History
        </h1>
        <p className="text-[var(--muted)] text-sm mt-2 ml-11">Complete attendance record for your child.</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-[var(--card)] border border-[var(--border-color)] rounded-3xl p-6 text-center shadow-sm">
          <p className={`text-4xl font-semibold tracking-tight ${pctColor}`}>{pct}%</p>
          <p className="text-xs font-medium uppercase tracking-wider text-[var(--muted)] mt-2">Overall Rate</p>
        </div>
        <div className="bg-[var(--card)] border border-[var(--border-color)] rounded-3xl p-6 text-center shadow-sm">
          <p className="text-4xl font-semibold tracking-tight text-[var(--foreground)]">{presentCount}</p>
          <p className="text-xs font-medium uppercase tracking-wider text-[var(--muted)] mt-2">Present</p>
        </div>
        <div className="bg-[var(--card)] border border-[var(--border-color)] rounded-3xl p-6 text-center shadow-sm">
          <p className="text-4xl font-semibold tracking-tight text-[var(--foreground)]">{absentCount}</p>
          <p className="text-xs font-medium uppercase tracking-wider text-[var(--muted)] mt-2">Absent</p>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="bg-[var(--card)] border border-[var(--border-color)] rounded-3xl p-8 shadow-sm">
        <div className="flex justify-between items-center mb-4">
          <p className="text-sm font-semibold text-[var(--foreground)] flex items-center gap-2">
            <BarChart3 className="w-4 h-4 text-[var(--muted)]" /> Attendance Health
          </p>
          <p className={`text-sm font-semibold ${pctColor}`}>{pct}%</p>
        </div>
        <div className="w-full h-2 bg-[var(--hover-bg)] rounded-full overflow-hidden">
          <motion.div 
            initial={{ width: 0 }}
            animate={{ width: `${pct}%` }}
            transition={{ duration: 1, ease: "easeOut" }}
            className={`h-full ${barColor} rounded-full`} 
          />
        </div>
        <p className="text-xs font-medium text-[var(--muted)] mt-4">
          {pct >= 75 ? "Excellent attendance! Keep it up." : pct >= 50 ? "Attendance is below recommended 75%. Please improve." : "Critical: Attendance is very low. Please contact the academy."}
        </p>
      </div>

      {/* Attendance Records */}
      <div className="bg-[var(--card)] border border-[var(--border-color)] rounded-3xl overflow-hidden shadow-sm">
        <div className="px-8 py-6 border-b border-[var(--border-color)] flex items-center justify-between">
          <h2 className="font-semibold text-[var(--foreground)] text-lg tracking-tight">Attendance Log</h2>
          <span className="text-xs font-medium text-[var(--muted)] bg-[var(--hover-bg)] px-3 py-1 rounded-full border border-[var(--border-color)]">{attendance.length} records</span>
        </div>
        
        {attendance.length === 0 ? (
          <div className="text-center py-16 text-[var(--muted)] space-y-3">
            <Calendar className="w-12 h-12 mx-auto opacity-20" />
            <p className="text-sm">No attendance records available yet.</p>
          </div>
        ) : (
          <div className="divide-y divide-[var(--border-color)]">
            {attendance.map((a, i) => (
              <div key={i} className="flex items-center justify-between px-8 py-5 hover:bg-[var(--hover-bg)] transition-colors">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-[var(--card)] border border-[var(--border-color)] shadow-sm">
                    <Calendar className="w-4 h-4 text-[var(--muted)]" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-[var(--foreground)]">
                      {a.date ? new Date(a.date).toLocaleDateString("en-IN", { weekday: "short", day: "numeric", month: "short", year: "numeric" }) : "Date N/A"}
                    </p>
                    <p className="text-xs text-[var(--muted)] mt-0.5">Regular Class</p>
                  </div>
                </div>
                <div>
                  {a.present ? (
                    <span className="flex items-center gap-1.5 text-xs font-semibold text-emerald-600 bg-emerald-500/10 border border-emerald-500/20 px-3 py-1.5 rounded-lg uppercase tracking-wider">
                      <CheckCircle2 className="w-3.5 h-3.5" /> Present
                    </span>
                  ) : (
                    <span className="flex items-center gap-1.5 text-xs font-semibold text-red-600 bg-red-500/10 border border-red-500/20 px-3 py-1.5 rounded-lg uppercase tracking-wider">
                      <XCircle className="w-3.5 h-3.5" /> Absent
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </motion.div>
  );
}

"use client";

import { useEffect, useState } from "react";
import { fetchChildData, fetchChildAttendance } from "@/app/actions/parent";
import { CalendarCheck, CheckCircle2, XCircle, BarChart3 } from "lucide-react";
import Link from "next/link";

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

  const pctColor = pct >= 75 ? "text-green-400" : pct >= 50 ? "text-orange-400" : "text-red-400";
  const barColor = pct >= 75 ? "from-green-500 to-emerald-400" : pct >= 50 ? "from-orange-500 to-amber-400" : "from-red-500 to-rose-400";

  if (isLoading) {
    return <div className="flex justify-center py-20"><div className="w-10 h-10 border-4 border-primary-500/30 border-t-primary-500 rounded-full animate-spin" /></div>;
  }

  if (!child) {
    return (
      <div className="flex items-center justify-center min-h-[400px] animate-in fade-in duration-500">
        <div className="text-center bg-white/5 border border-white/10 rounded-3xl p-8 max-w-sm shadow-2xl space-y-6">
          <div className="w-16 h-16 rounded-2xl bg-purple-500/10 border border-purple-500/30 text-purple-400 flex items-center justify-center mx-auto">
            <CalendarCheck className="w-8 h-8" />
          </div>
          <div className="space-y-2">
            <h2 className="text-xl font-bold text-white">No Linked Student</h2>
            <p className="text-slate-400 text-sm">
              Please register your child first to track their attendance.
            </p>
          </div>
          <div className="pt-2">
            <Link
              href="/parent/dashboard/register"
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-primary-600 to-pink-600 hover:from-primary-500 hover:to-pink-500 text-white rounded-xl font-semibold text-sm transition-all shadow-lg shadow-purple-500/25"
            >
              Register Child Now
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div>
        <h1 className="text-2xl font-bold text-white flex items-center gap-2">
          <CalendarCheck className="w-6 h-6 text-primary-400" /> Attendance History
        </h1>
        <p className="text-slate-500 text-sm mt-1">Complete attendance record for your child.</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-3 gap-3">
        <div className="bg-white/5 border border-white/10 rounded-2xl p-4 text-center">
          <p className={`text-3xl font-bold ${pctColor}`}>{pct}%</p>
          <p className="text-xs text-slate-500 mt-1">Overall</p>
        </div>
        <div className="bg-green-500/5 border border-green-500/10 rounded-2xl p-4 text-center">
          <p className="text-3xl font-bold text-green-400">{presentCount}</p>
          <p className="text-xs text-slate-500 mt-1">Present</p>
        </div>
        <div className="bg-red-500/5 border border-red-500/10 rounded-2xl p-4 text-center">
          <p className="text-3xl font-bold text-red-400">{absentCount}</p>
          <p className="text-xs text-slate-500 mt-1">Absent</p>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="bg-white/5 border border-white/10 rounded-2xl p-5">
        <div className="flex justify-between items-center mb-3">
          <p className="text-sm font-medium text-white flex items-center gap-2"><BarChart3 className="w-4 h-4 text-primary-400" /> Attendance Rate</p>
          <p className={`text-sm font-bold ${pctColor}`}>{pct}%</p>
        </div>
        <div className="w-full h-3 bg-white/10 rounded-full overflow-hidden">
          <div className={`h-full bg-gradient-to-r ${barColor} rounded-full transition-all duration-700`} style={{ width: `${pct}%` }} />
        </div>
        <p className="text-xs text-slate-600 mt-2">
          {pct >= 75 ? "✅ Excellent attendance! Keep it up." : pct >= 50 ? "⚠️ Attendance is below recommended 75%. Please improve." : "❌ Critical: Attendance is very low. Please contact the academy."}
        </p>
      </div>

      {/* Attendance Records */}
      <div className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden">
        <div className="p-4 border-b border-white/10">
          <h2 className="font-bold text-white text-sm">Attendance Log ({attendance.length} records)</h2>
        </div>
        {attendance.length === 0 ? (
          <div className="text-center py-12 text-slate-500">
            <CalendarCheck className="w-12 h-12 mx-auto mb-3 opacity-30" />
            <p>No attendance records available yet.</p>
          </div>
        ) : (
          <div className="divide-y divide-white/5">
            {attendance.map((a, i) => (
              <div key={i} className="flex items-center justify-between px-5 py-3.5 hover:bg-white/5 transition-colors">
                <div>
                  <p className="text-sm font-medium text-slate-200">
                    {a.date ? new Date(a.date).toLocaleDateString("en-IN", { weekday: "long", day: "numeric", month: "long", year: "numeric" }) : "Date N/A"}
                  </p>
                </div>
                <div>
                  {a.present ? (
                    <span className="flex items-center gap-1.5 text-xs font-semibold text-green-400 bg-green-500/10 border border-green-500/20 px-3 py-1 rounded-full">
                      <CheckCircle2 className="w-3.5 h-3.5" /> Present
                    </span>
                  ) : (
                    <span className="flex items-center gap-1.5 text-xs font-semibold text-red-400 bg-red-500/10 border border-red-500/20 px-3 py-1 rounded-full">
                      <XCircle className="w-3.5 h-3.5" /> Absent
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

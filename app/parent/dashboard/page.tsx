"use client";

import { useEffect, useState } from "react";
import { fetchChildData, fetchChildAttendance, fetchChildInvoices } from "@/app/actions/parent";
import { User, CalendarCheck, CreditCard, TrendingUp, GraduationCap, Clock, AlertCircle } from "lucide-react";
import Link from "next/link";

export default function ParentDashboard() {
  const [child, setChild] = useState<any>(null);
  const [attendance, setAttendance] = useState<any[]>([]);
  const [invoices, setInvoices] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      const childData = await fetchChildData();
      setChild(childData);
      if (childData?.id) {
        const [att, inv] = await Promise.all([
          fetchChildAttendance(childData.id),
          fetchChildInvoices(childData.id),
        ]);
        setAttendance(att);
        setInvoices(inv);
      }
      setIsLoading(false);
    };
    load();
  }, []);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-primary-500/30 border-t-primary-500 rounded-full animate-spin mx-auto mb-4" />
          <p className="text-slate-400 text-sm">Loading your child's profile...</p>
        </div>
      </div>
    );
  }

  if (!child) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center bg-white/5 border border-white/10 rounded-3xl p-10">
          <AlertCircle className="w-12 h-12 text-orange-400 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-white mb-2">No Student Linked</h2>
          <p className="text-slate-400 text-sm max-w-xs">
            No student record found for this account. Please contact the academy to link your child's profile.
          </p>
        </div>
      </div>
    );
  }

  const presentCount = attendance.filter(a => a.present).length;
  const attendancePct = attendance.length > 0 ? Math.round((presentCount / attendance.length) * 100) : 0;
  const pendingInvoices = invoices.filter(i => i.status === "pending");
  const totalPending = pendingInvoices.reduce((sum, i) => sum + parseFloat(i.amount || "0"), 0);

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {/* Child Profile Card */}
      <div className="bg-gradient-to-br from-primary-900/60 to-pink-900/40 border border-primary-500/20 rounded-3xl p-6 flex gap-5 items-center">
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary-500 to-pink-500 flex items-center justify-center flex-shrink-0 shadow-xl shadow-purple-900/40">
          <GraduationCap className="w-8 h-8 text-white" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-white">{child.full_name}</h1>
          <div className="flex flex-wrap gap-3 mt-2">
            <span className="text-xs text-primary-300 bg-primary-500/10 border border-primary-500/20 px-3 py-1 rounded-full font-medium">
              {child.admission_number || "Admission ID N/A"}
            </span>
            <span className="text-xs text-slate-300 bg-white/5 border border-white/10 px-3 py-1 rounded-full">
              {child.dance_style || "Style N/A"}
            </span>
            <span className="text-xs text-slate-300 bg-white/5 border border-white/10 px-3 py-1 rounded-full">
              {child.batch || "Batch N/A"}
            </span>
            <span className={`text-xs px-3 py-1 rounded-full font-medium ${child.status === "active" ? "bg-green-500/10 text-green-400 border border-green-500/20" : "bg-orange-500/10 text-orange-400 border border-orange-500/20"}`}>
              {child.status || "Active"}
            </span>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
        <div className="bg-white/5 border border-white/10 rounded-2xl p-5">
          <CalendarCheck className="w-5 h-5 text-green-400 mb-3" />
          <p className="text-3xl font-bold text-white">{attendancePct}%</p>
          <p className="text-xs text-slate-500 mt-1">Attendance Rate</p>
          <p className="text-xs text-slate-600 mt-0.5">{presentCount}/{attendance.length} classes</p>
        </div>
        <div className="bg-white/5 border border-white/10 rounded-2xl p-5">
          <CreditCard className="w-5 h-5 text-orange-400 mb-3" />
          <p className="text-3xl font-bold text-white">₹{totalPending.toLocaleString()}</p>
          <p className="text-xs text-slate-500 mt-1">Pending Fees</p>
          <p className="text-xs text-slate-600 mt-0.5">{pendingInvoices.length} invoice(s)</p>
        </div>
        <div className="bg-white/5 border border-white/10 rounded-2xl p-5 col-span-2 sm:col-span-1">
          <TrendingUp className="w-5 h-5 text-primary-400 mb-3" />
          <p className="text-3xl font-bold text-white">{invoices.filter(i => i.status === "paid").length}</p>
          <p className="text-xs text-slate-500 mt-1">Fees Paid</p>
          <p className="text-xs text-slate-600 mt-0.5">Total installments</p>
        </div>
      </div>

      {/* Pending Fee Alert */}
      {totalPending > 0 && (
        <div className="bg-orange-500/10 border border-orange-500/20 rounded-2xl p-5 flex items-start gap-4">
          <AlertCircle className="w-5 h-5 text-orange-400 mt-0.5 flex-shrink-0" />
          <div className="flex-1">
            <p className="text-orange-300 font-semibold text-sm">Outstanding Fee Due</p>
            <p className="text-slate-400 text-xs mt-1">You have ₹{totalPending.toLocaleString()} in pending fee(s). Pay online now to avoid late charges.</p>
          </div>
          <Link href="/parent/dashboard/fees" className="px-4 py-2 bg-orange-500 hover:bg-orange-400 text-white text-xs font-bold rounded-xl transition-colors flex-shrink-0">
            Pay Now
          </Link>
        </div>
      )}

      {/* Recent Attendance */}
      <div className="bg-white/5 border border-white/10 rounded-2xl p-5">
        <div className="flex justify-between items-center mb-4">
          <h2 className="font-bold text-white flex items-center gap-2"><Clock className="w-4 h-4 text-primary-400" /> Recent Attendance</h2>
          <Link href="/parent/dashboard/attendance" className="text-xs text-primary-400 hover:text-primary-300">View All →</Link>
        </div>
        {attendance.length === 0 ? (
          <p className="text-slate-500 text-sm text-center py-6">No attendance records found.</p>
        ) : (
          <div className="space-y-2">
            {attendance.slice(0, 6).map((a, i) => (
              <div key={i} className="flex items-center justify-between py-2 border-b border-white/5 last:border-0">
                <span className="text-sm text-slate-400">{a.date ? new Date(a.date).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }) : "N/A"}</span>
                <span className={`text-xs font-semibold px-3 py-1 rounded-full ${a.present ? "bg-green-500/10 text-green-400 border border-green-500/20" : "bg-red-500/10 text-red-400 border border-red-500/20"}`}>
                  {a.present ? "✓ Present" : "✗ Absent"}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

"use client";

import { useEffect, useState } from "react";
import { fetchChildData, fetchChildAttendance, fetchChildInvoices } from "@/app/actions/parent";
import { CalendarCheck, CreditCard, TrendingUp, GraduationCap, Clock, AlertCircle, UserPlus, ArrowRight, Loader2, ChevronRight, FileText } from "lucide-react";
import Link from "next/link";
import { motion } from "framer-motion";

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
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <Loader2 className="w-8 h-8 animate-spin text-[var(--muted)] mb-4" />
        <p className="text-[var(--muted)] text-sm font-medium">Loading child profile...</p>
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
        <div className="text-center bg-[var(--card)] border border-[var(--border-color)] rounded-3xl p-10 max-w-md shadow-sm space-y-6">
          <div className="w-16 h-16 rounded-full bg-[var(--hover-bg)] text-[var(--foreground)] flex items-center justify-center mx-auto border border-[var(--border-color)] shadow-sm">
            <UserPlus className="w-8 h-8 opacity-80" />
          </div>
          <div className="space-y-2">
            <h2 className="text-2xl font-semibold text-[var(--foreground)] tracking-tight">Enroll Your Child</h2>
            <p className="text-[var(--muted)] text-sm leading-relaxed">
              No student is currently linked to your parent account. Get started by registering your child to DIL Academy.
            </p>
          </div>
          <div className="pt-4">
            <Link
              href="/parent/dashboard/register"
              className="inline-flex items-center justify-center gap-2 w-full py-3.5 bg-[var(--foreground)] text-[var(--background)] hover:opacity-90 rounded-xl font-medium shadow-sm transition-all text-sm group"
            >
              Start Student Registration <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
        </div>
      </motion.div>
    );
  }

  const presentCount = attendance.filter(a => a.present).length;
  const attendancePct = attendance.length > 0 ? Math.round((presentCount / attendance.length) * 100) : 0;
  const pendingInvoices = invoices.filter(i => i.status === "pending");
  const totalPending = pendingInvoices.reduce((sum, i) => sum + parseFloat(i.amount || "0"), 0);

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-4xl mx-auto space-y-8 pb-10"
    >
      {/* Welcome Header */}
      <div>
        <p className="text-[var(--muted)] text-sm font-medium mb-1">Welcome back</p>
        <h2 className="text-3xl font-semibold text-[var(--foreground)] tracking-tight">
          Your Child&apos;s Progress
        </h2>
      </div>

      {/* Main Student Card (Premium OS Style) */}
      <div className="bg-[var(--card)] border border-[var(--border-color)] rounded-3xl p-8 shadow-sm relative overflow-hidden group">
        <div className="absolute top-0 right-0 p-8 opacity-5">
          <GraduationCap className="w-48 h-48 -mr-10 -mt-10" />
        </div>
        
        <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div className="flex items-center gap-6">
            <div className="w-20 h-20 rounded-2xl bg-[var(--hover-bg)] flex items-center justify-center border border-[var(--border-color)] shadow-sm">
              <span className="text-3xl font-semibold text-[var(--foreground)] opacity-50">
                {child.full_name?.charAt(0) || "S"}
              </span>
            </div>
            <div>
              <div className="flex items-center gap-3 mb-1">
                <h3 className="font-semibold text-2xl text-[var(--foreground)] tracking-tight">
                  {child.full_name}
                </h3>
                <span className="bg-emerald-500/10 text-emerald-600 border border-emerald-500/20 text-xs font-semibold px-2.5 py-1 rounded-md uppercase tracking-wider">
                  {child.status || "Active"}
                </span>
              </div>
              <p className="text-[var(--muted)] text-sm font-medium">
                {child.dance_style || "Dance Class"} • {child.batch || "General Batch"}
              </p>
            </div>
          </div>
          
          <div className="w-full md:w-auto">
            <Link 
              href="/parent/dashboard/attendance" 
              className="inline-flex w-full md:w-auto items-center justify-center gap-2 px-6 py-3 bg-[var(--hover-bg)] text-[var(--foreground)] hover:bg-[var(--foreground)] hover:text-[var(--background)] border border-[var(--border-color)] hover:border-[var(--foreground)] rounded-xl font-medium transition-all text-sm group shadow-sm"
            >
              View Full Profile <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </div>

      {/* KPI Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Link 
          href="/parent/dashboard/attendance" 
          className="bg-[var(--card)] rounded-3xl p-6 border border-[var(--border-color)] shadow-sm hover:border-[var(--foreground)]/30 hover:shadow-md transition-all group flex items-start justify-between"
        >
          <div>
            <div className="flex items-center gap-2 text-[var(--muted)] mb-4">
              <CalendarCheck className="w-4 h-4" />
              <span className="text-sm font-medium uppercase tracking-wider">Attendance Rate</span>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-4xl font-semibold text-[var(--foreground)] tracking-tight">{attendancePct}%</span>
            </div>
          </div>
          <div className="w-10 h-10 rounded-full bg-[var(--hover-bg)] flex items-center justify-center group-hover:bg-[var(--foreground)] group-hover:text-[var(--background)] transition-colors border border-[var(--border-color)]">
            <ChevronRight className="w-5 h-5" />
          </div>
        </Link>
        
        <Link 
          href="/parent/dashboard/fees" 
          className={`bg-[var(--card)] rounded-3xl p-6 border shadow-sm hover:shadow-md transition-all group flex items-start justify-between ${
            totalPending > 0 ? "border-amber-500/30 hover:border-amber-500" : "border-[var(--border-color)] hover:border-[var(--foreground)]/30"
          }`}
        >
          <div>
            <div className={`flex items-center gap-2 mb-4 ${totalPending > 0 ? "text-amber-600" : "text-[var(--muted)]"}`}>
              <CreditCard className="w-4 h-4" />
              <span className="text-sm font-medium uppercase tracking-wider">Pending Fees</span>
            </div>
            <div className="flex items-baseline gap-2">
              <span className={`text-4xl font-semibold tracking-tight ${totalPending > 0 ? "text-amber-600" : "text-[var(--foreground)]"}`}>
                ₹{totalPending.toLocaleString()}
              </span>
            </div>
          </div>
          <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors border ${
            totalPending > 0 ? "bg-amber-500/10 text-amber-600 border-amber-500/20 group-hover:bg-amber-500 group-hover:text-white" : "bg-[var(--hover-bg)] text-[var(--foreground)] border-[var(--border-color)] group-hover:bg-[var(--foreground)] group-hover:text-[var(--background)]"
          }`}>
            <ChevronRight className="w-5 h-5" />
          </div>
        </Link>
      </div>

      {/* Recent Activity List */}
      <div className="bg-[var(--card)] border border-[var(--border-color)] rounded-3xl p-8 shadow-sm">
        <div className="flex justify-between items-center mb-6 pb-4 border-b border-[var(--border-color)]">
          <h4 className="font-semibold text-[var(--foreground)] text-lg tracking-tight">Recent Activity</h4>
          <Link href="/parent/dashboard/attendance" className="text-sm font-medium text-[var(--muted)] hover:text-[var(--foreground)] transition-colors flex items-center gap-1">
            See All <ArrowRight className="w-3 h-3" />
          </Link>
        </div>
        
        {attendance.length === 0 ? (
          <div className="py-8 text-center text-[var(--muted)] text-sm">
            No recent activity found.
          </div>
        ) : (
          <div className="space-y-4">
            {attendance.slice(0, 3).map((a, i) => (
              <div key={i} className="group flex items-center justify-between p-4 rounded-2xl hover:bg-[var(--hover-bg)] border border-transparent hover:border-[var(--border-color)] transition-all">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-[var(--card)] border border-[var(--border-color)] shadow-sm">
                    <Clock className="w-4 h-4 text-[var(--muted)]" />
                  </div>
                  <div>
                    <p className="font-medium text-[var(--foreground)] text-sm">Class Session</p>
                    <p className="text-xs text-[var(--muted)] mt-0.5">{a.date ? new Date(a.date).toLocaleDateString("en-IN", { weekday: "short", day: "numeric", month: "short" }) : "N/A"}</p>
                  </div>
                </div>
                <span className={`text-xs font-semibold px-3 py-1.5 rounded-lg border ${
                  a.present 
                    ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/20" 
                    : "bg-red-500/10 text-red-600 border-red-500/20"
                }`}>
                  {a.present ? "Present" : "Absent"}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </motion.div>
  );
}

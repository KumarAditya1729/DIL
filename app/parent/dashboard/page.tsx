"use client";

import { useEffect, useState } from "react";
import { fetchChildData, fetchChildAttendance, fetchChildInvoices } from "@/app/actions/parent";
import { CalendarCheck, CreditCard, TrendingUp, GraduationCap, Clock, AlertCircle, UserPlus, ArrowRight } from "lucide-react";
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
          <p className="text-slate-400 text-sm">Loading your child&apos;s profile...</p>
        </div>
      </div>
    );
  }

  if (!child) {
    return (
      <div className="flex items-center justify-center min-h-[450px] animate-in fade-in duration-500">
        <div className="text-center bg-white/5 border border-white/10 rounded-3xl p-8 md:p-12 max-w-md shadow-2xl space-y-6">
          <div className="w-16 h-16 rounded-2xl bg-purple-500/10 border border-purple-500/30 text-purple-400 flex items-center justify-center mx-auto shadow-lg shadow-purple-950/20">
            <UserPlus className="w-8 h-8" />
          </div>
          <div className="space-y-2">
            <h2 className="text-2xl font-bold text-white">Enroll Your Child</h2>
            <p className="text-slate-400 text-sm leading-relaxed">
              No student is currently linked to your parent account. Get started by registering your child to DIL Academy!
            </p>
          </div>
          <div className="pt-2">
            <Link
              href="/parent/dashboard/register"
              className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-primary-600 to-pink-600 hover:from-primary-500 hover:to-pink-500 text-white rounded-xl font-semibold shadow-lg shadow-purple-500/25 transition-all text-sm group"
            >
              Start Student Registration <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const presentCount = attendance.filter(a => a.present).length;
  const attendancePct = attendance.length > 0 ? Math.round((presentCount / attendance.length) * 100) : 0;
  const pendingInvoices = invoices.filter(i => i.status === "pending");
  const totalPending = pendingInvoices.reduce((sum, i) => sum + parseFloat(i.amount || "0"), 0);

  return (
    <div className="px-6 py-4 space-y-8 pb-20 animate-in fade-in duration-500 bg-white min-h-full">
      {/* Welcome Header */}
      <div className="mt-2">
        <p className="text-slate-400 text-sm font-medium">Welcome back,</p>
        <h2 className="text-2xl font-black text-slate-800">
          Your Child&apos;s <span className="text-[#FF2A55]">Progress</span>
        </h2>
      </div>

      {/* Main Class/Course Card (Mimicking Dribbble Image) */}
      <div className="relative group perspective">
        <div className="w-full rounded-[2.5rem] bg-gradient-to-b from-white to-pink-50 border-[6px] border-slate-900 shadow-2xl p-6 flex flex-col items-center justify-between min-h-[360px] relative overflow-hidden transition-transform duration-500 group-hover:scale-[1.02]">
          {/* Top Info */}
          <div className="w-full flex justify-between items-start z-10">
            <span className="bg-slate-900 text-white text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-wider">
              {child.status || "Active"}
            </span>
            <div className="w-8 h-8 rounded-full bg-pink-100 flex items-center justify-center">
              <GraduationCap className="w-4 h-4 text-[#FF2A55]" />
            </div>
          </div>

          {/* Center Graphic/Typography */}
          <div className="flex flex-col items-center justify-center flex-1 z-10 mt-4 mb-6">
            <div className="w-32 h-32 rounded-full bg-gradient-to-tr from-[#FF2A55] to-[#FF4B72] flex items-center justify-center shadow-xl shadow-pink-500/40 mb-6">
              <h1 className="text-white font-black text-3xl italic tracking-tighter mix-blend-overlay">Dance<br/>Tuts</h1>
            </div>
            <h3 className="font-extrabold text-2xl text-slate-800 text-center leading-tight">
              {child.dance_style || "Dance Class"}
            </h3>
            <p className="text-slate-500 text-sm font-medium mt-2 text-center max-w-[80%]">
              {child.batch || "General Batch"} • {child.full_name}
            </p>
          </div>

          {/* Bottom Button */}
          <div className="w-full z-10">
            <Link href="/parent/dashboard/attendance" className="w-full py-4 bg-gradient-to-r from-[#FF2A55] to-[#FF4B72] text-white rounded-3xl font-bold shadow-lg shadow-pink-500/30 flex items-center justify-center gap-2 hover:opacity-90 transition-opacity">
              View Attendance <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          {/* Decorative background circles */}
          <div className="absolute top-[-20%] left-[-20%] w-64 h-64 bg-pink-200/50 rounded-full blur-3xl" />
          <div className="absolute bottom-[-10%] right-[-10%] w-48 h-48 bg-pink-300/40 rounded-full blur-2xl" />
        </div>
      </div>

      {/* Quick Stats Row */}
      <div className="grid grid-cols-2 gap-4">
        <Link href="/parent/dashboard/attendance" className="bg-slate-50 rounded-3xl p-5 border border-slate-100 flex flex-col items-center justify-center text-center hover:bg-pink-50 transition-colors">
          <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center mb-3">
            <CalendarCheck className="w-5 h-5 text-green-500" />
          </div>
          <p className="text-2xl font-black text-slate-800">{attendancePct}%</p>
          <p className="text-xs text-slate-400 font-bold mt-1">Attendance</p>
        </Link>
        <Link href="/parent/dashboard/fees" className={`rounded-3xl p-5 border flex flex-col items-center justify-center text-center transition-colors ${totalPending > 0 ? "bg-orange-50 border-orange-100 hover:bg-orange-100" : "bg-slate-50 border-slate-100 hover:bg-pink-50"}`}>
          <div className={`w-12 h-12 rounded-full flex items-center justify-center mb-3 ${totalPending > 0 ? "bg-orange-200 text-orange-600" : "bg-slate-200 text-slate-500"}`}>
            <CreditCard className="w-5 h-5" />
          </div>
          <p className={`text-2xl font-black ${totalPending > 0 ? "text-orange-600" : "text-slate-800"}`}>₹{totalPending.toLocaleString()}</p>
          <p className="text-xs text-slate-400 font-bold mt-1">Pending Fees</p>
        </Link>
      </div>

      {/* Recent Activity List */}
      <div className="pt-2">
        <div className="flex justify-between items-center mb-4">
          <h4 className="font-bold text-slate-800">Recent Activity</h4>
          <Link href="/parent/dashboard/attendance" className="text-xs font-bold text-[#FF2A55] uppercase tracking-wider">See All</Link>
        </div>
        <div className="space-y-3">
          {attendance.slice(0, 3).map((a, i) => (
            <div key={i} className="bg-slate-50 border border-slate-100 rounded-2xl p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${a.present ? 'bg-green-100' : 'bg-red-100'}`}>
                  <Clock className={`w-4 h-4 ${a.present ? 'text-green-500' : 'text-red-500'}`} />
                </div>
                <div>
                  <p className="font-bold text-slate-700 text-sm">Class Session</p>
                  <p className="text-xs text-slate-400 font-medium">{a.date ? new Date(a.date).toLocaleDateString("en-IN", { day: "numeric", month: "short" }) : "N/A"}</p>
                </div>
              </div>
              <span className={`text-xs font-bold px-3 py-1.5 rounded-full ${a.present ? "bg-green-100 text-green-600" : "bg-red-100 text-red-600"}`}>
                {a.present ? "Present" : "Absent"}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

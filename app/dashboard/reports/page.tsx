import { Download, TrendingUp, Users, CalendarCheck, IndianRupee, AlertCircle } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { RevenueBarChart } from "@/components/charts/RevenueBarChart";
import { AttendancePieChart } from "@/components/charts/AttendancePieChart";
import { StudentGrowthChart } from "@/components/charts/StudentGrowthChart";

export default async function ReportsPage() {
  const supabase = createClient();

  // ─── Core Stats ──────────────────────────────────────────
  const [
    { count: totalStudents },
    { count: activeStudents },
    { data: invoices },
    { data: attendanceRecords },
    { data: allStudents },
  ] = await Promise.all([
    supabase.from("students").select("*", { count: "exact", head: true }),
    supabase.from("students").select("*", { count: "exact", head: true }).eq("status", "active"),
    supabase.from("invoices").select("amount, status, created_at, month"),
    supabase.from("attendance_records").select("status"),
    supabase.from("students").select("created_at, status").order("created_at"),
  ]);

  const totalRevenue = invoices?.filter(i => i.status === "paid").reduce((s, i) => s + Number(i.amount || 0), 0) || 0;
  const pendingDues  = invoices?.filter(i => i.status !== "paid").reduce((s, i) => s + Number(i.amount || 0), 0) || 0;
  const presentCount = attendanceRecords?.filter(r => r.status === "present").length || 0;
  const totalMarked  = attendanceRecords?.length || 0;
  const attendancePct = totalMarked > 0 ? Math.round((presentCount / totalMarked) * 100) : 0;

  // ─── Monthly Revenue (last 6 months) ─────────────────────
  const monthlyRevenue: Record<string, number> = {};
  const now = new Date();
  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const key = d.toLocaleDateString("en-IN", { month: "short", year: "2-digit" });
    monthlyRevenue[key] = 0;
  }
  (invoices || [])
    .filter(i => i.status === "paid")
    .forEach(i => {
      const d = new Date(i.created_at);
      const key = d.toLocaleDateString("en-IN", { month: "short", year: "2-digit" });
      if (key in monthlyRevenue) monthlyRevenue[key] += Number(i.amount || 0);
    });

  const revenueData = Object.entries(monthlyRevenue).map(([month, amount]) => ({ month, amount }));

  // ─── Student Growth (by join month) ──────────────────────
  const growthMap: Record<string, number> = {};
  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const key = d.toLocaleDateString("en-IN", { month: "short", year: "2-digit" });
    growthMap[key] = 0;
  }
  (allStudents || []).forEach(s => {
    const d = new Date(s.created_at);
    const key = d.toLocaleDateString("en-IN", { month: "short", year: "2-digit" });
    if (key in growthMap) growthMap[key]++;
  });
  const growthData = Object.entries(growthMap).map(([month, count]) => ({ month, count }));

  // ─── Attendance Breakdown ─────────────────────────────────
  const attendanceData = [
    { label: "Present", value: presentCount, color: "#22c55e" },
    { label: "Absent",  value: totalMarked - presentCount, color: "#f87171" },
  ];

  const stats = [
    { label: "Total Students",  value: String(totalStudents || 0),                               icon: Users,         color: "bg-blue-50 dark:bg-blue-900/20 text-blue-600",    trend: null },
    { label: "Active Enrolments", value: String(activeStudents || 0),                            icon: CalendarCheck, color: "bg-green-50 dark:bg-green-900/20 text-green-600",  trend: null },
    { label: "Total Revenue",   value: `₹${totalRevenue.toLocaleString("en-IN")}`,               icon: IndianRupee,   color: "bg-purple-50 dark:bg-purple-900/20 text-purple-600", trend: null },
    { label: "Pending Dues",    value: `₹${pendingDues.toLocaleString("en-IN")}`,                icon: AlertCircle,   color: "bg-orange-50 dark:bg-orange-900/20 text-orange-600", trend: null },
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Reports &amp; Analytics</h1>
          <p className="text-slate-500 text-sm mt-1">Academy performance overview and financial summary.</p>
        </div>
        <a
          href={`/api/reports/export`}
          className="px-4 py-2 bg-white border border-slate-200 dark:border-slate-700 dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 rounded-xl font-medium shadow-sm transition-all text-sm flex items-center justify-center gap-2 self-start"
        >
          <Download className="w-4 h-4" /> Export CSV
        </a>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <div key={stat.label} className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm hover:shadow-md transition-shadow">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-4 ${stat.color}`}>
                <Icon className="w-5 h-5" />
              </div>
              <p className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">{stat.value}</p>
              <p className="text-sm font-medium text-slate-500 mt-1">{stat.label}</p>
            </div>
          );
        })}
      </div>

      {/* Charts Row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Revenue Bar Chart (takes 2/3) */}
        <div className="lg:col-span-2 bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm p-6">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h3 className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-primary-500" /> Monthly Revenue
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">Last 6 months · Paid invoices only</p>
            </div>
            <div className="text-right">
              <p className="text-lg font-bold text-slate-900 dark:text-white">₹{totalRevenue.toLocaleString("en-IN")}</p>
              <p className="text-xs text-slate-500">Total collected</p>
            </div>
          </div>
          <RevenueBarChart data={revenueData} />
        </div>

        {/* Attendance Pie */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm p-6">
          <div className="mb-4">
            <h3 className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <CalendarCheck className="w-4 h-4 text-green-500" /> Attendance
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">Overall · All batches</p>
          </div>
          <AttendancePieChart data={attendanceData} percentage={attendancePct} />
        </div>
      </div>

      {/* Student Growth Chart */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm p-6">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h3 className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Users className="w-4 h-4 text-blue-500" /> New Student Enrolments
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">New students joining per month</p>
          </div>
        </div>
        <StudentGrowthChart data={growthData} />
      </div>

      {/* Invoice Status Breakdown */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm p-6">
        <h3 className="font-bold text-slate-900 dark:text-white mb-5">Fee Collection Summary</h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[
            { label: "Paid Invoices",    count: invoices?.filter(i => i.status === "paid").length || 0,    amount: totalRevenue, color: "bg-green-500" },
            { label: "Pending Invoices", count: invoices?.filter(i => i.status === "pending").length || 0, amount: pendingDues,  color: "bg-orange-400" },
            { label: "Total Invoices",   count: invoices?.length || 0,                                      amount: totalRevenue + pendingDues, color: "bg-primary-500" },
          ].map(item => (
            <div key={item.label} className="flex items-center gap-4 p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50">
              <div className={`w-2 h-12 rounded-full ${item.color}`} />
              <div>
                <p className="text-2xl font-bold text-slate-900 dark:text-white">{item.count}</p>
                <p className="text-xs text-slate-500 mt-0.5">{item.label}</p>
                <p className="text-sm font-semibold text-slate-700 dark:text-slate-300 mt-1">₹{item.amount.toLocaleString("en-IN")}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

import { Download, TrendingUp, Users, CalendarCheck, IndianRupee, AlertCircle, ArrowUpRight, BarChart2 } from "lucide-react";
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
    { label: "Present", value: presentCount, color: "#171717" }, // Using foreground color
    { label: "Absent",  value: totalMarked - presentCount, color: "#e5e5e5" }, // Using border color
  ];

  const stats = [
    { label: "Total Students",  value: String(totalStudents || 0),                               icon: Users,         color: "text-[var(--foreground)]", bg: "bg-[var(--foreground)]/5" },
    { label: "Active Enrolments", value: String(activeStudents || 0),                            icon: CalendarCheck, color: "text-[var(--foreground)]", bg: "bg-[var(--foreground)]/5" },
    { label: "Total Revenue",   value: `₹${totalRevenue.toLocaleString("en-IN")}`,               icon: IndianRupee,   color: "text-green-600 dark:text-green-400", bg: "bg-green-500/10" },
    { label: "Pending Dues",    value: `₹${pendingDues.toLocaleString("en-IN")}`,                icon: AlertCircle,   color: "text-amber-600 dark:text-amber-400", bg: "bg-amber-500/10" },
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-20">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-[var(--foreground)]">Analytics & Reports</h1>
          <p className="text-[var(--muted)] text-sm mt-1">Key metrics and performance overview.</p>
        </div>
        <a
          href={`/api/reports/export`}
          className="px-4 py-2 bg-[var(--foreground)] hover:bg-[var(--foreground)]/90 text-[var(--background)] rounded-full font-semibold shadow-sm transition-all text-sm flex items-center gap-2"
        >
          <Download className="w-4 h-4" /> Export Data
        </a>
      </div>

      {/* Primary KPI Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, i) => {
          const Icon = stat.icon;
          return (
            <div key={stat.label} className="bg-[var(--card-bg)] p-6 rounded-[24px] border border-[var(--border-color)] shadow-sm flex flex-col justify-between group">
              <div className="flex items-center justify-between mb-8">
                <div className={`w-10 h-10 rounded-2xl flex items-center justify-center ${stat.bg}`}>
                  <Icon className={`w-5 h-5 ${stat.color}`} />
                </div>
                <ArrowUpRight className="w-5 h-5 text-[var(--border-color)] group-hover:text-[var(--foreground)] transition-colors" />
              </div>
              <div>
                <p className="text-[var(--muted)] text-sm font-medium mb-1">{stat.label}</p>
                <p className="text-3xl font-bold tracking-tighter text-[var(--foreground)]">{stat.value}</p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Main Charts Area */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Revenue Trends */}
        <div className="lg:col-span-2 bg-[var(--card-bg)] rounded-[24px] border border-[var(--border-color)] shadow-sm p-6 sm:p-8">
          <div className="flex justify-between items-center mb-8">
            <div>
              <h3 className="font-bold text-[var(--foreground)] flex items-center gap-2 text-lg">
                <BarChart2 className="w-5 h-5 text-[var(--muted)]" /> Revenue Trends
              </h3>
              <p className="text-xs text-[var(--muted)] mt-1 font-medium uppercase tracking-wider">Last 6 months</p>
            </div>
            <div className="text-right">
              <p className="text-2xl font-bold tracking-tighter text-[var(--foreground)]">₹{totalRevenue.toLocaleString("en-IN")}</p>
              <p className="text-xs text-[var(--muted)] font-medium">Total collected</p>
            </div>
          </div>
          <div className="h-[300px]">
             <RevenueBarChart data={revenueData} />
          </div>
        </div>

        {/* Attendance Breakdown */}
        <div className="bg-[var(--card-bg)] rounded-[24px] border border-[var(--border-color)] shadow-sm p-6 sm:p-8 flex flex-col">
          <div className="mb-8">
            <h3 className="font-bold text-[var(--foreground)] flex items-center gap-2 text-lg">
              <Users className="w-5 h-5 text-[var(--muted)]" /> Attendance
            </h3>
            <p className="text-xs text-[var(--muted)] mt-1 font-medium uppercase tracking-wider">Overall Average</p>
          </div>
          <div className="flex-1 flex flex-col justify-center items-center">
            <div className="h-[200px] w-full">
              <AttendancePieChart data={attendanceData} percentage={attendancePct} />
            </div>
            <div className="mt-6 text-center">
              <div className="text-4xl font-bold tracking-tighter text-[var(--foreground)]">{attendancePct}%</div>
              <p className="text-sm text-[var(--muted)] font-medium">Average Present Rate</p>
            </div>
          </div>
        </div>

      </div>

      {/* Bottom Data Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Growth Chart */}
        <div className="bg-[var(--card-bg)] rounded-[24px] border border-[var(--border-color)] shadow-sm p-6 sm:p-8">
          <div className="flex justify-between items-center mb-8">
            <div>
              <h3 className="font-bold text-[var(--foreground)] flex items-center gap-2 text-lg">
                <TrendingUp className="w-5 h-5 text-[var(--muted)]" /> Growth
              </h3>
              <p className="text-xs text-[var(--muted)] mt-1 font-medium uppercase tracking-wider">New students joining per month</p>
            </div>
          </div>
          <div className="h-[250px]">
            <StudentGrowthChart data={growthData} />
          </div>
        </div>

        {/* Collection Summary */}
        <div className="bg-[var(--foreground)] text-[var(--background)] rounded-[24px] shadow-sm p-6 sm:p-8 flex flex-col justify-between relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3"></div>
          
          <div className="relative z-10 mb-8">
            <h3 className="font-bold text-[var(--background)] flex items-center gap-2 text-lg">
              <IndianRupee className="w-5 h-5 opacity-70" /> Fee Collection Summary
            </h3>
            <p className="text-xs text-[var(--background)]/50 mt-1 font-medium uppercase tracking-wider">Lifetime Overview</p>
          </div>

          <div className="space-y-6 relative z-10">
            <div className="flex items-center justify-between border-b border-[var(--background)]/10 pb-4">
              <div>
                <p className="text-[var(--background)]/70 text-sm font-medium mb-1">Total Invoices</p>
                <p className="text-2xl font-bold">{invoices?.length || 0}</p>
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold">₹{(totalRevenue + pendingDues).toLocaleString("en-IN")}</p>
                <p className="text-[var(--background)]/70 text-sm font-medium mt-1">Total Billed</p>
              </div>
            </div>
            
            <div className="flex items-center justify-between border-b border-[var(--background)]/10 pb-4">
              <div>
                <p className="text-green-400 text-sm font-medium mb-1">Paid ({invoices?.filter(i => i.status === "paid").length || 0})</p>
                <p className="text-2xl font-bold text-green-400">₹{totalRevenue.toLocaleString("en-IN")}</p>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <p className="text-amber-400 text-sm font-medium mb-1">Pending ({invoices?.filter(i => i.status === "pending").length || 0})</p>
                <p className="text-2xl font-bold text-amber-400">₹{pendingDues.toLocaleString("en-IN")}</p>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}

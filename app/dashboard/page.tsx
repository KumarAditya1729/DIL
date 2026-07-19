import { Calendar, TrendingUp, Users, CreditCard, ChevronRight, Bell, Zap, Clock, ShieldCheck, Megaphone, ArrowUpRight } from "lucide-react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";

export default async function Dashboard() {
  const supabase = createClient();
  const { data: user } = await supabase.auth.getUser();
  const userName = user?.user?.email?.split("@")[0] || "Admin";

  // ─── Parallel data fetches ────────────────────────────────
  const [
    { data: recentAdmissions },
    { data: invoices },
    { data: attendanceToday },
    { data: batches },
  ] = await Promise.all([
    supabase.from("students").select("full_name, status, join_date, admission_number").order("created_at", { ascending: false }).limit(4),
    supabase.from("invoices").select("amount, status"),
    supabase.from("attendance_records").select("status, attendance!inner(date)").eq("attendance.date", new Date().toISOString().split("T")[0]),
    supabase.from("batches").select("*").limit(3),
  ]);

  // ─── Computed values ──────────────────────────────────────
  let pendingFees = 0, monthlyRevenue = 0;
  let pendingCount = 0;
  (invoices || []).forEach(inv => {
    if (inv.status === "pending") {
      pendingFees += parseFloat(inv.amount || "0");
      pendingCount++;
    }
    else if (inv.status === "paid") monthlyRevenue += parseFloat(inv.amount || "0");
  });

  const presentToday = (attendanceToday || []).filter(r => r.status === "present").length;
  const totalMarkedToday = (attendanceToday || []).length;
  const attendanceRate = totalMarkedToday > 0 ? Math.round((presentToday / totalMarkedToday) * 100) : 0;

  const upcomingEvents = (batches || []).map(b => ({
    name: b.name,
    time: "4:00 PM - 5:30 PM", // Mock time for UI sake
    trainer: "Elena M.",
  }));

  const today = new Date();

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-20">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-[var(--foreground)]">Command Center</h1>
          <p className="text-[var(--muted)] text-sm mt-1">
            {today.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Link href="/dashboard/students/new" className="px-4 py-2 bg-[var(--foreground)] hover:bg-[var(--foreground)]/90 text-[var(--background)] rounded-full text-sm font-semibold transition-all flex items-center gap-2 shadow-sm">
            <Zap className="w-4 h-4" /> Quick Actions
          </Link>
          <button className="w-9 h-9 rounded-full border border-[var(--border-color)] bg-[var(--card-bg)] flex items-center justify-center text-[var(--foreground)] hover:bg-[var(--background)] transition-colors relative">
            <Bell className="w-4 h-4" />
            <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-red-500 border-2 border-[var(--card-bg)]"></span>
          </button>
        </div>
      </div>

      {/* Bento Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 lg:grid-rows-3 gap-6 auto-rows-[minmax(180px,auto)]">
        
        {/* 1. Live Revenue (Span 2 cols) */}
        <div className="lg:col-span-2 lg:row-span-1 bg-[var(--foreground)] text-[var(--background)] rounded-[24px] p-6 relative overflow-hidden flex flex-col justify-between group">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3"></div>
          <div className="flex justify-between items-start relative z-10">
            <div className="w-10 h-10 rounded-2xl bg-[var(--background)]/10 flex items-center justify-center backdrop-blur-md">
              <TrendingUp className="w-5 h-5 text-[var(--background)]" />
            </div>
            <span className="px-3 py-1 bg-[var(--background)]/10 backdrop-blur-md rounded-full text-xs font-semibold">+14% this month</span>
          </div>
          <div className="relative z-10">
            <p className="text-[var(--background)]/70 text-sm font-medium mb-1">Monthly Revenue</p>
            <h2 className="text-4xl lg:text-5xl font-bold tracking-tighter">₹{monthlyRevenue.toLocaleString("en-IN")}</h2>
          </div>
        </div>

        {/* 2. Today's Classes */}
        <div className="lg:col-span-1 lg:row-span-2 bg-[var(--card-bg)] border border-[var(--border-color)] rounded-[24px] p-6 shadow-sm flex flex-col">
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-semibold text-[var(--foreground)] flex items-center gap-2"><Calendar className="w-4 h-4 text-[var(--muted)]"/> Classes</h3>
            <span className="px-2 py-0.5 rounded-full bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 text-[10px] font-bold uppercase tracking-wider">Live</span>
          </div>
          <div className="space-y-4 flex-1 overflow-y-auto">
            {upcomingEvents.map((evt, i) => (
              <div key={i} className="flex gap-4 p-3 rounded-xl hover:bg-[var(--background)] transition-colors border border-transparent hover:border-[var(--border-color)] group">
                <div className="w-1.5 rounded-full bg-[var(--foreground)]"></div>
                <div className="flex-1">
                  <p className="text-sm font-bold text-[var(--foreground)] group-hover:text-primary-600 transition-colors">{evt.name}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <Clock className="w-3 h-3 text-[var(--muted)]" />
                    <span className="text-xs text-[var(--muted)]">{evt.time}</span>
                  </div>
                  <div className="text-[10px] font-medium text-[var(--muted)] mt-1.5 uppercase tracking-wider">Trainer: {evt.trainer}</div>
                </div>
              </div>
            ))}
            {upcomingEvents.length === 0 && <p className="text-sm text-[var(--muted)]">No classes today.</p>}
          </div>
        </div>

        {/* 3. Pending Fees */}
        <div className="lg:col-span-1 lg:row-span-1 bg-red-50 dark:bg-red-950/20 border border-red-100 dark:border-red-900/30 rounded-[24px] p-6 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <div className="w-10 h-10 rounded-2xl bg-red-100 dark:bg-red-900/50 flex items-center justify-center">
              <CreditCard className="w-5 h-5 text-red-600 dark:text-red-400" />
            </div>
          </div>
          <div>
            <p className="text-red-600/70 dark:text-red-400/70 text-sm font-medium mb-1">Pending Fees</p>
            <h2 className="text-3xl font-bold tracking-tighter text-red-600 dark:text-red-400">₹{pendingFees.toLocaleString("en-IN")}</h2>
            <Link href="/dashboard/fees" className="text-xs font-semibold text-red-600 dark:text-red-400 flex items-center gap-1 mt-2 hover:underline">
              {pendingCount} invoices overdue <ArrowUpRight className="w-3 h-3" />
            </Link>
          </div>
        </div>

        {/* 4. Attendance Heatmap/Stats (Span 2 cols) */}
        <div className="lg:col-span-2 lg:row-span-1 bg-[var(--card-bg)] border border-[var(--border-color)] rounded-[24px] p-6 shadow-sm flex items-center gap-8">
          <div className="flex-1">
            <h3 className="font-semibold text-[var(--foreground)] flex items-center gap-2 mb-4"><Users className="w-4 h-4 text-[var(--muted)]"/> Attendance</h3>
            <div className="flex items-end gap-2">
              <span className="text-5xl font-bold tracking-tighter text-[var(--foreground)]">{attendanceRate}%</span>
              <span className="text-sm text-[var(--muted)] font-medium mb-1">Today</span>
            </div>
            <Link href="/dashboard/attendance" className="text-sm font-medium text-[var(--foreground)] flex items-center gap-1 mt-4 hover:underline">
              Mark registers <ArrowUpRight className="w-3 h-3" />
            </Link>
          </div>
          
          {/* Mini Heatmap Visualization (Mock) */}
          <div className="hidden sm:grid grid-cols-7 grid-rows-3 gap-1.5 flex-1 max-w-[200px]">
            {Array.from({ length: 21 }).map((_, i) => (
              <div key={i} className={`w-full aspect-square rounded-sm ${Math.random() > 0.3 ? 'bg-[var(--foreground)]' : 'bg-[var(--border-color)]'} opacity-${Math.floor(Math.random() * 5 + 5) * 10}`}></div>
            ))}
          </div>
        </div>

        {/* 5. Trainer Availability */}
        <div className="lg:col-span-1 lg:row-span-1 bg-[var(--card-bg)] border border-[var(--border-color)] rounded-[24px] p-6 shadow-sm flex flex-col justify-between">
          <h3 className="font-semibold text-[var(--foreground)] flex items-center gap-2 mb-4"><ShieldCheck className="w-4 h-4 text-[var(--muted)]"/> Trainers</h3>
          <div className="flex -space-x-2 overflow-hidden mb-2">
            {[1,2,3,4].map((i) => (
              <div key={i} className="inline-block h-10 w-10 rounded-full ring-2 ring-[var(--card-bg)] bg-[var(--foreground)] flex items-center justify-center text-[var(--background)] font-bold text-xs">
                T{i}
              </div>
            ))}
          </div>
          <p className="text-sm text-[var(--muted)]">4 of 5 trainers available today.</p>
        </div>

        {/* 6. Recent Activity / Announcements (Span 2 cols) */}
        <div className="lg:col-span-2 lg:row-span-1 bg-[var(--card-bg)] border border-[var(--border-color)] rounded-[24px] p-6 shadow-sm overflow-hidden flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-[var(--foreground)] flex items-center gap-2"><Megaphone className="w-4 h-4 text-[var(--muted)]"/> Announcements</h3>
            <button className="text-xs font-semibold text-[var(--muted)] hover:text-[var(--foreground)]">View All</button>
          </div>
          <div className="bg-[var(--background)] rounded-xl p-4 border border-[var(--border-color)]">
            <div className="flex items-center gap-2 text-xs font-semibold text-primary-600 mb-1">
              <span className="w-2 h-2 rounded-full bg-primary-600 animate-pulse"></span> SYSTEM UPDATE
            </div>
            <p className="text-sm text-[var(--foreground)] font-medium">Summer Camp registrations are now open. Ensure all batches are configured correctly by Friday.</p>
          </div>
        </div>

        {/* 7. Quick Student List */}
        <div className="lg:col-span-2 lg:row-span-1 bg-[var(--card-bg)] border border-[var(--border-color)] rounded-[24px] p-6 shadow-sm overflow-hidden flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-[var(--foreground)]">Recent Enrollments</h3>
            <Link href="/dashboard/students" className="text-xs font-semibold text-[var(--muted)] hover:text-[var(--foreground)]">View Directory</Link>
          </div>
          <div className="space-y-3">
            {recentAdmissions?.slice(0, 3).map((student, i) => (
              <Link key={i} href={`/dashboard/students/${student.admission_number}`} className="flex items-center justify-between p-2 hover:bg-[var(--background)] rounded-xl transition-colors group">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-[var(--border-color)] flex items-center justify-center text-xs font-bold text-[var(--foreground)]">
                    {student.full_name.charAt(0)}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-[var(--foreground)] group-hover:underline">{student.full_name}</p>
                    <p className="text-[10px] text-[var(--muted)] uppercase tracking-wider">{student.admission_number}</p>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-[var(--muted)] opacity-0 group-hover:opacity-100 transition-opacity" />
              </Link>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}

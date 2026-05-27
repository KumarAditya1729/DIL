import { Users, UserCheck, IndianRupee, TrendingUp, ChevronRight, UserPlus, CreditCard, Calendar, Cake, CheckCircle2, BarChart2, Bell } from "lucide-react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";

export default async function Dashboard() {
  const supabase = createClient();

  const { data: user } = await supabase.auth.getUser();
  const userName = user?.user?.email?.split("@")[0] || "Admin";

  // ─── Parallel data fetches ────────────────────────────────
  const [
    { count: totalStudents },
    { count: activeCount },
    { data: recentAdmissions },
    { data: invoices },
    { data: allStudents },
    { data: attendanceToday },
    { data: batches },
  ] = await Promise.all([
    supabase.from("students").select("*", { count: "exact", head: true }),
    supabase.from("students").select("*", { count: "exact", head: true }).eq("status", "active"),
    supabase.from("students").select("full_name, status, join_date, admission_number").order("created_at", { ascending: false }).limit(5),
    supabase.from("invoices").select("amount, status"),
    supabase.from("students").select("full_name, date_of_birth, admission_number").eq("status", "active"),
    supabase
      .from("attendance_records")
      .select("status, attendance!inner(date)")
      .eq("attendance.date", new Date().toISOString().split("T")[0]),
    supabase.from("batches").select("*").limit(3),
  ]);

  // ─── Computed values ──────────────────────────────────────
  let pendingFees = 0, monthlyRevenue = 0;
  (invoices || []).forEach(inv => {
    if (inv.status === "pending") pendingFees += parseFloat(inv.amount || "0");
    else if (inv.status === "paid") monthlyRevenue += parseFloat(inv.amount || "0");
  });

  // Today's attendance
  const presentToday = (attendanceToday || []).filter(r => r.status === "present").length;
  const totalMarkedToday = (attendanceToday || []).length;

  // Birthday reminders — students with birthday in next 7 days
  const today = new Date();
  const upcomingBirthdays = (allStudents || [])
    .filter(s => {
      if (!s.date_of_birth) return false;
      const dob = new Date(s.date_of_birth);
      const thisYear = new Date(today.getFullYear(), dob.getMonth(), dob.getDate());
      const diff = (thisYear.getTime() - today.getTime()) / (1000 * 60 * 60 * 24);
      return diff >= 0 && diff <= 7;
    })
    .map(s => {
      const dob = new Date(s.date_of_birth);
      const thisYear = new Date(today.getFullYear(), dob.getMonth(), dob.getDate());
      const diff = Math.round((thisYear.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
      return { name: s.full_name, id: s.admission_number, daysUntil: diff };
    })
    .sort((a, b) => a.daysUntil - b.daysUntil)
    .slice(0, 3);

  const upcomingEvents = (batches || []).map(b => ({
    name: b.name,
    time: "Today",
    batch: b.style || "General",
  }));

  const stats = [
    { label: "Total Students",   value: String(totalStudents || 0),                     icon: Users,        color: "bg-blue-500",    href: "/dashboard/students",  ring: "ring-blue-200 dark:ring-blue-800" },
    { label: "Active This Month", value: String(activeCount || 0),                       icon: UserCheck,    color: "bg-green-500",   href: "/dashboard/students",  ring: "ring-green-200 dark:ring-green-800" },
    { label: "Pending Fees",      value: `₹${pendingFees.toLocaleString("en-IN")}`,      icon: IndianRupee,  color: "bg-orange-500",  href: "/dashboard/fees",      ring: "ring-orange-200 dark:ring-orange-800" },
    { label: "Total Revenue",     value: `₹${monthlyRevenue.toLocaleString("en-IN")}`,   icon: TrendingUp,   color: "bg-primary-500", href: "/dashboard/reports",   ring: "ring-purple-200 dark:ring-purple-800" },
  ];

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white tracking-tight">
            Welcome back, {userName}! 👋
          </h1>
          <p className="text-slate-500 mt-1 text-sm">
            {today.toLocaleDateString("en-IN", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}
          </p>
        </div>
        <div className="flex gap-2">
          <Link href="/dashboard/students/new" className="px-5 py-2.5 bg-gradient-to-r from-primary-600 to-primary-500 hover:from-primary-700 hover:to-primary-600 text-white rounded-xl font-medium shadow-lg shadow-primary-500/30 transition-all text-sm flex items-center gap-2">
            <UserPlus className="w-4 h-4" /> New Admission
          </Link>
          <Link href="/dashboard/fees" className="px-5 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:bg-slate-50 text-slate-700 dark:text-slate-200 rounded-xl font-medium shadow-sm transition-all text-sm flex items-center gap-2">
            <CreditCard className="w-4 h-4" /> Collect Fee
          </Link>
        </div>
      </div>

      {/* Birthday Reminder Banner */}
      {upcomingBirthdays.length > 0 && (
        <div className="bg-gradient-to-r from-pink-50 to-rose-50 dark:from-pink-900/20 dark:to-rose-900/10 border border-pink-200 dark:border-pink-800/30 rounded-2xl p-4 flex items-start gap-3">
          <div className="w-9 h-9 rounded-xl bg-pink-100 dark:bg-pink-900/30 flex items-center justify-center flex-shrink-0 text-pink-500">
            <Cake className="w-5 h-5" />
          </div>
          <div className="flex-1">
            <p className="font-semibold text-pink-900 dark:text-pink-300 text-sm">🎂 Upcoming Birthdays</p>
            <div className="flex flex-wrap gap-3 mt-1.5">
              {upcomingBirthdays.map((b, i) => (
                <span key={i} className="text-xs text-pink-700 dark:text-pink-400 bg-pink-100 dark:bg-pink-900/30 px-2.5 py-1 rounded-full font-medium">
                  {b.name} · {b.daysUntil === 0 ? "🎉 Today!" : `in ${b.daysUntil} day${b.daysUntil > 1 ? "s" : ""}`}
                </span>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Stats Grid — each card is clickable */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, i) => {
          const Icon = stat.icon;
          return (
            <Link key={i} href={stat.href} className={`bg-white/60 dark:bg-slate-900/40 backdrop-blur-xl border border-slate-200/50 dark:border-white/5 shadow-lg rounded-3xl p-6 hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 group relative overflow-hidden`}>
              <div className={`absolute top-0 right-0 w-28 h-28 ${stat.color} opacity-5 rounded-full blur-2xl -mr-8 -mt-8 group-hover:opacity-15 transition-opacity duration-500`} />
              <div className="flex justify-between items-start relative z-10">
                <div className="space-y-2">
                  <p className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">{stat.label}</p>
                  <p className="text-3xl font-bold text-slate-900 dark:text-white tracking-tight">{stat.value}</p>
                </div>
                <div className={`p-3 rounded-xl text-white ${stat.color} shadow-lg`}>
                  <Icon className="w-5 h-5" />
                </div>
              </div>
              <div className="mt-4 text-xs text-slate-400 flex items-center gap-1 group-hover:text-primary-500 transition-colors">
                View details <ChevronRight className="w-3 h-3" />
              </div>
            </Link>
          );
        })}
      </div>

      {/* Today's Quick Stats Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white/60 dark:bg-slate-900/40 backdrop-blur-xl border border-slate-200/50 dark:border-white/5 shadow-md rounded-3xl p-5 flex items-center gap-4 hover:-translate-y-1 transition-all duration-300">
          <div className="w-10 h-10 rounded-xl bg-green-50 dark:bg-green-900/20 flex items-center justify-center">
            <CheckCircle2 className="w-5 h-5 text-green-500" />
          </div>
          <div>
            <p className="text-2xl font-bold text-slate-900 dark:text-white">{presentToday}<span className="text-sm font-normal text-slate-400">/{totalMarkedToday}</span></p>
            <p className="text-xs text-slate-500 mt-0.5">Present today</p>
          </div>
        </div>
        <div className="bg-white/60 dark:bg-slate-900/40 backdrop-blur-xl border border-slate-200/50 dark:border-white/5 shadow-md rounded-3xl p-5 flex items-center gap-4 hover:-translate-y-1 transition-all duration-300">
          <div className="w-10 h-10 rounded-xl bg-primary-50 dark:bg-primary-900/20 flex items-center justify-center">
            <BarChart2 className="w-5 h-5 text-primary-500" />
          </div>
          <div>
            <p className="text-2xl font-bold text-slate-900 dark:text-white">
              {totalMarkedToday > 0 ? Math.round((presentToday / totalMarkedToday) * 100) : 0}%
            </p>
            <p className="text-xs text-slate-500 mt-0.5">Today&apos;s attendance rate</p>
          </div>
        </div>
        <div className="bg-white/60 dark:bg-slate-900/40 backdrop-blur-xl border border-slate-200/50 dark:border-white/5 shadow-md rounded-3xl p-5 flex items-center gap-4 hover:-translate-y-1 transition-all duration-300">
          <div className="w-10 h-10 rounded-xl bg-orange-50 dark:bg-orange-900/20 flex items-center justify-center">
            <Bell className="w-5 h-5 text-orange-500" />
          </div>
          <div>
            <p className="text-2xl font-bold text-slate-900 dark:text-white">
              {(invoices || []).filter(i => i.status === "pending").length}
            </p>
            <p className="text-xs text-slate-500 mt-0.5">Pending invoices</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Admissions */}
        <div className="lg:col-span-2 bg-white/60 dark:bg-slate-900/40 backdrop-blur-xl border border-slate-200/50 dark:border-white/5 shadow-xl rounded-3xl p-6">
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-base font-bold text-slate-900 dark:text-white">Recent Admissions</h2>
            <Link href="/dashboard/students" className="text-sm font-medium text-primary-600 hover:text-primary-700 flex items-center gap-1">
              View All <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
          {(!recentAdmissions || recentAdmissions.length === 0) ? (
            <div className="text-center py-10 text-slate-400 space-y-2">
              <Users className="w-10 h-10 mx-auto opacity-30" />
              <p className="text-sm">No students yet.</p>
              <Link href="/dashboard/students/new" className="text-primary-600 text-sm font-medium hover:underline">Add your first student →</Link>
            </div>
          ) : (
            <div className="divide-y divide-slate-100 dark:divide-slate-800">
              {recentAdmissions.map((student, i) => (
                <Link key={i} href={`/dashboard/students/${student.admission_number}`} className="flex items-center justify-between py-3 hover:bg-slate-50 dark:hover:bg-slate-800/30 -mx-2 px-2 rounded-xl transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center font-bold text-primary-600 text-sm flex-shrink-0">
                      {student.full_name.charAt(0)}
                    </div>
                    <div>
                      <p className="font-medium text-slate-900 dark:text-slate-200 text-sm">{student.full_name}</p>
                      <p className="text-xs text-slate-500">{student.admission_number}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <p className="text-xs text-slate-400 hidden sm:block">
                      {student.join_date ? new Date(student.join_date).toLocaleDateString("en-IN", { day: "numeric", month: "short" }) : "N/A"}
                    </p>
                    <span className={`px-2.5 py-1 text-xs font-medium rounded-full ${student.status === "active" ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400" : "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400"}`}>
                      {student.status || "Active"}
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* Today's Schedule */}
        <div className="bg-gradient-to-br from-primary-500 to-primary-700 rounded-3xl p-6 text-white shadow-2xl shadow-primary-500/30 relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4 opacity-10 transform translate-x-4 -translate-y-4">
            <Calendar className="w-28 h-28" />
          </div>
          <h2 className="text-lg font-bold mb-1 relative z-10">Today&apos;s Schedule</h2>
          <p className="text-primary-200 text-xs mb-5 relative z-10">
            {upcomingEvents.length === 0 ? "No batches scheduled" : `${upcomingEvents.length} batch${upcomingEvents.length > 1 ? "es" : ""} today`}
          </p>
          <div className="space-y-3 relative z-10">
            {upcomingEvents.length === 0 ? (
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-3 border border-white/10 text-sm text-primary-100">
                Enjoy your day off or schedule a new batch.
              </div>
            ) : (
              upcomingEvents.map((event, i) => (
                <div key={i} className="bg-white/10 backdrop-blur-sm rounded-xl p-3 border border-white/10">
                  <p className="font-medium text-sm">{event.name}</p>
                  <div className="flex justify-between items-center mt-1.5 text-xs text-primary-200">
                    <span>{event.time}</span>
                    <span className="bg-white/20 px-2 py-0.5 rounded-full">{event.batch}</span>
                  </div>
                </div>
              ))
            )}
          </div>
          <Link href="/dashboard/attendance" className="mt-5 flex items-center gap-2 text-xs text-primary-200 hover:text-white transition-colors relative z-10">
            Mark today&apos;s attendance <ChevronRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>
    </div>
  );
}

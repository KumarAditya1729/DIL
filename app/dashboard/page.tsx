import { Users, UserCheck, IndianRupee, TrendingUp, ChevronRight, UserPlus, CreditCard, Calendar } from "lucide-react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";

export default async function Dashboard() {
  const supabase = createClient();
  
  // Real DB Fetches
  const { data: user } = await supabase.auth.getUser();
  const userName = user?.user?.email?.split('@')[0] || "Admin";

  const { data: students, count: totalStudents } = await supabase.from('students').select('*', { count: 'exact' });
  const { data: activeStudents, count: activeCount } = await supabase.from('students').select('*', { count: 'exact' }).eq('status', 'active');
  const { data: recentAdmissions } = await supabase.from('students').select('full_name, status, join_date').order('created_at', { ascending: false }).limit(5);
  
  const studentCount = totalStudents || 0;
  const activeStudentCount = activeCount || 0;

  const { data: invoices } = await supabase.from('invoices').select('amount, status');
  let pendingFees = 0;
  let monthlyRevenue = 0;

  if (invoices) {
    invoices.forEach(inv => {
      if (inv.status === 'pending') {
        pendingFees += parseFloat(inv.amount || '0');
      } else if (inv.status === 'paid') {
        monthlyRevenue += parseFloat(inv.amount || '0');
      }
    });
  }

  const stats = [
    { label: "Total Students", value: studentCount.toString(), trend: studentCount > 0 ? "+0" : "0", icon: Users, color: "bg-blue-500" },
    { label: "Active This Month", value: activeStudentCount.toString(), trend: "0", icon: UserCheck, color: "bg-green-500" },
    { label: "Pending Fees", value: `₹${pendingFees.toLocaleString()}`, trend: "0%", icon: IndianRupee, color: "bg-orange-500" },
    { label: "Monthly Revenue", value: `₹${monthlyRevenue.toLocaleString()}`, trend: "0%", icon: TrendingUp, color: "bg-primary-500" },
  ];

  const { data: batchesToday } = await supabase.from('batches').select('*').limit(3);
  const upcomingEvents = (batchesToday || []).map(b => ({
    name: b.name,
    time: "Schedule Details", // Actual parsing would depend on schedule JSON structure
    batch: b.style
  }));

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white tracking-tight">
            Welcome back, {userName}! 👋
          </h1>
          <p className="text-slate-500 mt-1">Here&apos;s what&apos;s happening at your academy today.</p>
        </div>
        <div className="flex gap-2">
          <Link href="/dashboard/students/new" className="px-5 py-2.5 bg-gradient-to-r from-primary-600 to-primary-500 hover:from-primary-700 hover:to-primary-600 text-white rounded-xl font-medium shadow-lg shadow-primary-500/30 hover:shadow-primary-500/50 transition-all duration-300 text-sm flex items-center gap-2 hover-lift">
            <UserPlus className="w-4 h-4" />
            New Admission
          </Link>
          <Link href="/dashboard/fees" className="px-5 py-2.5 bg-white/80 dark:bg-slate-900/60 backdrop-blur-xl border border-slate-200 dark:border-slate-800 hover:bg-slate-50 hover-lift text-slate-700 dark:text-slate-200 rounded-xl font-medium shadow-sm transition-all text-sm flex items-center gap-2">
            <CreditCard className="w-4 h-4" />
            Collect Fee
          </Link>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, i) => {
          const Icon = stat.icon;
          return (
            <div key={i} className="bg-white/80 dark:bg-slate-900/60 backdrop-blur-xl border border-slate-200 dark:border-slate-800 shadow-sm rounded-3xl p-6 hover-lift relative overflow-hidden group">
              <div className={`absolute top-0 right-0 w-32 h-32 ${stat.color} opacity-5 rounded-full blur-3xl -mr-10 -mt-10 group-hover:opacity-20 transition-opacity duration-500`}></div>
              <div className="flex justify-between items-start relative z-10">
                <div className="space-y-2">
                  <p className="text-sm font-medium text-slate-500 dark:text-slate-400">{stat.label}</p>
                  <p className="text-3xl font-bold text-slate-900 dark:text-white tracking-tight">{stat.value}</p>
                </div>
                <div className={`p-3 rounded-2xl text-white ${stat.color} shadow-lg shadow-black/5`}>
                  <Icon className="w-6 h-6" />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Quick Actions & Recent */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white/80 dark:bg-slate-900/60 backdrop-blur-xl border border-slate-200 dark:border-slate-800 shadow-sm rounded-3xl p-6 lg:p-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">Recent Admissions</h2>
              <Link href="/dashboard/students" className="text-sm font-medium text-primary-600 hover:text-primary-700 flex items-center">
                View All <ChevronRight className="w-4 h-4 ml-1" />
              </Link>
            </div>
            <div className="overflow-x-auto">
              {(!recentAdmissions || recentAdmissions.length === 0) ? (
                <div className="text-center py-8 text-slate-500">
                  <p>No recent admissions found.</p>
                  <Link href="/dashboard/students/new" className="text-primary-600 text-sm font-medium hover:underline mt-2 inline-block">Add your first student</Link>
                </div>
              ) : (
                <table className="w-full text-sm text-left">
                  <thead className="text-xs text-slate-500 uppercase bg-slate-50 dark:bg-slate-800/50 rounded-lg">
                    <tr>
                      <th className="px-4 py-3 rounded-l-lg font-medium">Student Name</th>
                      <th className="px-4 py-3 font-medium">Join Date</th>
                      <th className="px-4 py-3 rounded-r-lg font-medium">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {recentAdmissions.map((student, i) => (
                      <tr key={i} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/20 transition-colors">
                        <td className="px-4 py-3 font-medium text-slate-900 dark:text-slate-200">{student.full_name}</td>
                        <td className="px-4 py-3 text-slate-500">{new Date(student.join_date).toLocaleDateString()}</td>
                        <td className="px-4 py-3">
                          <span className={`px-2.5 py-1 text-xs font-medium rounded-full ${
                            student.status === 'active' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' : 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400'
                          }`}>
                            {student.status || 'Active'}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        </div>

        {/* Sidebar / Widgets */}
        <div className="space-y-6">
          <div className="bg-gradient-to-br from-primary-600 to-primary-900 rounded-3xl p-6 lg:p-8 text-white shadow-xl shadow-primary-900/20 relative overflow-hidden hover-lift">
            <div className="absolute top-0 right-0 p-4 opacity-10 transform translate-x-4 -translate-y-4">
              <Calendar className="w-32 h-32" />
            </div>
            <h2 className="text-xl font-bold mb-1 relative z-10">Today&apos;s Schedule</h2>
            <p className="text-primary-100 text-sm mb-6 relative z-10">
              {upcomingEvents.length === 0 ? "No batches scheduled today" : `You have ${upcomingEvents.length} batches today`}
            </p>
            
            <div className="space-y-4 relative z-10">
              {upcomingEvents.length === 0 && (
                <div className="bg-white/10 backdrop-blur-sm rounded-xl p-3 border border-white/10 text-sm">
                  Enjoy your day off or schedule a new batch.
                </div>
              )}
              {upcomingEvents.map((event, i) => (
                <div key={i} className="bg-white/10 backdrop-blur-sm rounded-xl p-3 border border-white/10">
                  <p className="font-medium text-sm">{event.name}</p>
                  <div className="flex justify-between items-center mt-2 text-xs text-primary-100">
                    <span>{event.time}</span>
                    <span className="bg-white/20 px-2 py-0.5 rounded-full">{event.batch}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

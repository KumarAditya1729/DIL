import { BarChart, LineChart, Download, TrendingUp, Users, CalendarCheck, IndianRupee } from "lucide-react";
import { createClient } from "@/lib/supabase/server";

export default async function ReportsPage() {
  const supabase = createClient();

  const { count: totalStudents } = await supabase.from('students').select('*', { count: 'exact', head: true });
  const { count: activeStudents } = await supabase.from('students').select('*', { count: 'exact', head: true }).eq('status', 'active');
  const { data: invoices } = await supabase.from('invoices').select('amount, status');

  const totalRevenue = invoices?.filter(i => i.status === 'paid').reduce((sum, i) => sum + Number(i.amount || 0), 0) || 0;
  const pendingDues = invoices?.filter(i => i.status !== 'paid').reduce((sum, i) => sum + Number(i.amount || 0), 0) || 0;

  const stats = [
    { label: "Total Students", value: (totalStudents || 0).toString(), icon: Users, color: "text-blue-600" },
    { label: "Active Students", value: (activeStudents || 0).toString(), icon: CalendarCheck, color: "text-green-600" },
    { label: "Total Revenue", value: `₹${totalRevenue.toLocaleString('en-IN')}`, icon: IndianRupee, color: "text-primary-600" },
    { label: "Pending Dues", value: `₹${pendingDues.toLocaleString('en-IN')}`, icon: TrendingUp, color: "text-amber-600" },
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-500 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Reports & Analytics</h1>
          <p className="text-slate-500 text-sm mt-1">Academy performance overview and financial summary.</p>
        </div>
        <button className="px-4 py-2 bg-white border border-slate-200 dark:border-slate-700 dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 rounded-lg font-medium shadow-sm transition-all text-sm flex items-center justify-center gap-2">
          <Download className="w-4 h-4" />
          Export Report
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
        {stats.map((stat, i) => {
          const Icon = stat.icon;
          return (
            <div key={i} className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-sm font-medium text-slate-500">{stat.label}</p>
                  <p className="text-3xl font-bold text-slate-900 dark:text-white mt-2">{stat.value}</p>
                </div>
                <Icon className={`w-6 h-6 ${stat.color} opacity-70`} />
              </div>
            </div>
          );
        })}
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm p-6">
        <div className="flex justify-between items-center mb-6">
          <h3 className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <LineChart className="w-5 h-5 text-primary-500" />
            Monthly Revenue Trend
          </h3>
        </div>

        {totalRevenue === 0 ? (
          <div className="h-[200px] flex flex-col items-center justify-center text-slate-400 border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-xl">
            <BarChart className="w-10 h-10 mb-3 opacity-40" />
            <p className="text-sm">No revenue data yet. Charts will appear once payments are recorded.</p>
          </div>
        ) : (
          <div className="h-[200px] flex items-center justify-center text-slate-500 text-sm">
            Revenue chart will render here using real invoice data.
          </div>
        )}
      </div>
    </div>
  );
}

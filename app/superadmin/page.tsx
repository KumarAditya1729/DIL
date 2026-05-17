import { Building2, Plus, ArrowRight } from "lucide-react";
import Link from "next/link";

export default function SuperAdminDashboard() {
  const academies = [
    { name: "Dance Is Life Art & Study Center", slug: "dance-is-life", students: 342, plan: "Pro Plan", mrr: "₹15,000", status: "Active" },
    { name: "Beat Masters Studio", slug: "beat-masters", students: 128, plan: "Starter Plan", mrr: "₹5,000", status: "Active" },
    { name: "Classic Steps Institute", slug: "classic-steps", students: 89, plan: "Trial", mrr: "₹0", status: "Trialing" },
    { name: "Urban Groove", slug: "urban-groove", students: 450, plan: "Enterprise", mrr: "₹35,000", status: "Active" },
  ];

  return (
    <div className="space-y-6 animate-in fade-in duration-500 max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
      <div className="flex flex-col sm:flex-row justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
            <Building2 className="w-8 h-8 text-primary-600" />
            Platform HQ
          </h1>
          <p className="text-slate-500 mt-1">Super Admin Dashboard • Manage your SaaS tenants and MRR.</p>
        </div>
        <div className="flex gap-2">
          <button className="px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg font-medium shadow-sm transition-all text-sm flex items-center gap-2">
            <Plus className="w-4 h-4" />
            Onboard New Academy
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-100 dark:border-slate-800 shadow-sm">
          <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Total Academies</p>
          <p className="text-3xl font-bold text-slate-900 dark:text-white mt-2">124</p>
          <span className="text-green-600 text-xs font-medium mt-1 inline-block">+12 this month</span>
        </div>
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-100 dark:border-slate-800 shadow-sm">
          <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Total SaaS MRR</p>
          <p className="text-3xl font-bold text-slate-900 dark:text-white mt-2">₹1.8M</p>
          <span className="text-green-600 text-xs font-medium mt-1 inline-block">+8.4% growth</span>
        </div>
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-100 dark:border-slate-800 shadow-sm">
          <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Active Students</p>
          <p className="text-3xl font-bold text-slate-900 dark:text-white mt-2">15,420</p>
          <span className="text-slate-500 text-xs font-medium mt-1 inline-block">Across all tenants</span>
        </div>
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-100 dark:border-slate-800 shadow-sm">
          <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Trial Conversions</p>
          <p className="text-3xl font-bold text-slate-900 dark:text-white mt-2">68%</p>
          <span className="text-green-600 text-xs font-medium mt-1 inline-block">+2% from last quarter</span>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-slate-50/50 dark:bg-slate-800/20">
          <h2 className="text-lg font-bold text-slate-900 dark:text-white">Tenant Directory</h2>
          <input 
            type="text" 
            placeholder="Search academies..." 
            className="w-64 px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 focus:border-primary-500 focus:ring-1 focus:ring-primary-500 outline-none text-sm dark:text-slate-200"
          />
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-slate-500 uppercase bg-slate-50 dark:bg-slate-800/50">
              <tr>
                <th className="px-6 py-4 font-medium">Academy Info</th>
                <th className="px-6 py-4 font-medium">Domain/Slug</th>
                <th className="px-6 py-4 font-medium">Plan & MRR</th>
                <th className="px-6 py-4 font-medium">Usage</th>
                <th className="px-6 py-4 font-medium">Status</th>
                <th className="px-6 py-4 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {academies.map((acc, i) => (
                <tr key={i} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/20">
                  <td className="px-6 py-4">
                    <p className="font-medium text-slate-900 dark:text-slate-200">{acc.name}</p>
                    <p className="text-xs text-slate-500">Joined 2026</p>
                  </td>
                  <td className="px-6 py-4 text-slate-500 font-mono text-xs">{acc.slug}.danceapp.io</td>
                  <td className="px-6 py-4">
                    <p className="font-medium text-slate-900 dark:text-slate-200">{acc.plan}</p>
                    <p className="text-xs text-slate-500">{acc.mrr}/mo</p>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <div className="w-16 h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                        <div className="h-full bg-primary-500" style={{ width: `${Math.min((acc.students / 500) * 100, 100)}%` }}></div>
                      </div>
                      <span className="text-xs text-slate-500">{acc.students} stds</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2.5 py-1 text-xs font-medium rounded-full ${
                      acc.status === 'Active' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' : 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400'
                    }`}>
                      {acc.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button className="text-sm font-medium text-primary-600 hover:text-primary-700">Manage</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

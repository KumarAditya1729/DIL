"use client";

import { useState, useEffect, useCallback } from "react";
import { generateReceiptPDF } from "@/lib/pdfGenerator";
import { createInvoice, markInvoicePaid } from "@/app/actions/fees";
import {
  Receipt, Printer, Send, Loader2, Plus, X, Save,
  IndianRupee, Clock, CheckCircle2, AlertTriangle, TrendingUp,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";
import { getUserRole } from "@/app/actions/auth";
import { useRouter } from "next/navigation";

const MONTHS = [
  "January","February","March","April","May","June",
  "July","August","September","October","November","December",
];

export default function FeesPage() {
  const [isGenerating, setIsGenerating]     = useState(false);
  const [feeRecords, setFeeRecords]         = useState<any[]>([]);
  const [students, setStudents]             = useState<any[]>([]);
  const [isLoading, setIsLoading]           = useState(true);
  const [isCreateOpen, setIsCreateOpen]     = useState(false);
  const [isCreating, setIsCreating]         = useState(false);
  const [markingPaid, setMarkingPaid]       = useState<string | null>(null);
  const [filterStatus, setFilterStatus]     = useState<"all" | "pending" | "paid" | "overdue">("all");
  const [hasAccess, setHasAccess]           = useState(true);
  const router = useRouter();

  const fetchData = useCallback(async () => {
    const supabase = createClient();
    const [{ data: invoices }, { data: studentsData }] = await Promise.all([
      supabase
        .from("invoices")
        .select("*, students(full_name, admission_number)")
        .order("created_at", { ascending: false }),
      supabase
        .from("students")
        .select("id, full_name, admission_number, batch")
        .eq("status", "active")
        .order("full_name"),
    ]);

    setStudents(studentsData || []);

    const now = new Date();
    setFeeRecords(
      (invoices || []).map((d) => {
        const isOverdue =
          d.status === "pending" && d.due_date && new Date(d.due_date) < now;
        return {
          id:        d.invoice_number,
          dbId:      d.id,
          student:   d.students?.full_name || "Unknown",
          studentId: d.students?.admission_number || d.student_id,
          batch:     d.students?.batch || "N/A",
          amount:    d.amount,
          date:      new Date(d.created_at).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }),
          dueDate:   d.due_date ? new Date(d.due_date).toLocaleDateString("en-IN", { day: "numeric", month: "short" }) : null,
          month:     d.month,
          description: d.description || `Tuition Fee – ${d.month}`,
          status:    isOverdue ? "overdue" : d.status,
          method:    d.razorpay_payment_id ? "Online" : "Cash",
        };
      })
    );
    setIsLoading(false);
  }, []);

  useEffect(() => { 
    getUserRole().then(role => {
      if (role === 'teacher') {
        setHasAccess(false);
        router.push('/dashboard');
      } else {
        fetchData(); 
      }
    });
  }, [fetchData, router]);

  if (!hasAccess) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-slate-500">
        <AlertTriangle className="w-12 h-12 text-red-500 mb-4" />
        <h2 className="text-xl font-bold text-slate-900 dark:text-white">Access Denied</h2>
        <p className="mt-2 text-sm">You do not have permission to view financial records.</p>
      </div>
    );
  }

  const handleDownload = (record: any) => {
    setIsGenerating(true);
    generateReceiptPDF({
      receiptNumber: record.id,
      date:          record.date,
      studentName:   record.student,
      studentId:     record.studentId,
      batch:         record.batch,
      paymentMethod: record.method,
      month:         record.month,
      amount:        record.amount,
    });
    toast.success("Receipt opened in new window.");
    setIsGenerating(false);
  };

  const handleWhatsApp = (record: any) => {
    const msg = `Hello from Dance Is Life Art & Study Center!\n\nFee receipt for *${record.student}*:\n• Receipt: ${record.id}\n• Month: ${record.month}\n• Amount: ₹${record.amount}\n• Status: ${record.status}\n\nThank you! 🎶`;
    window.open(`https://wa.me/?text=${encodeURIComponent(msg)}`, "_blank");
  };

  const handleMarkPaid = async (record: any) => {
    setMarkingPaid(record.id);
    const res = await markInvoicePaid(record.id);
    if (res.error) {
      toast.error(res.error);
    } else {
      toast.success(`Invoice ${record.id} marked as paid!`);
      await fetchData();
    }
    setMarkingPaid(null);
  };

  const handleCreateInvoice = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsCreating(true);
    const formData = new FormData(e.currentTarget);
    const res = await createInvoice(formData);
    setIsCreating(false);
    if (res.error) {
      toast.error(res.error);
    } else {
      toast.success(`Invoice ${res.invoiceNumber} created successfully!`);
      setIsCreateOpen(false);
      await fetchData();
    }
  };

  // Stats
  const totalPaid      = feeRecords.filter(r => r.status === "paid").reduce((s, r) => s + parseFloat(r.amount), 0);
  const totalPending   = feeRecords.filter(r => r.status === "pending").reduce((s, r) => s + parseFloat(r.amount), 0);
  const totalOverdue   = feeRecords.filter(r => r.status === "overdue").reduce((s, r) => s + parseFloat(r.amount), 0);
  const totalRevenue   = totalPaid;

  const filtered = filterStatus === "all"
    ? feeRecords
    : feeRecords.filter(r => r.status === filterStatus);

  const statusStyle: Record<string, string> = {
    paid:    "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
    pending: "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400",
    overdue: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Fee Management</h1>
          <p className="text-slate-500 text-sm mt-1">Track payments, issue receipts, and manage dues.</p>
        </div>
        <button
          onClick={() => setIsCreateOpen(true)}
          className="flex items-center gap-2 px-5 py-2.5 bg-primary-600 hover:bg-primary-700 text-white rounded-xl font-semibold shadow-sm transition-all text-sm self-start"
        >
          <Plus className="w-4 h-4" /> Create Invoice
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: "Total Revenue",  value: `₹${totalRevenue.toLocaleString("en-IN")}`,  icon: TrendingUp,     color: "text-primary-600 bg-primary-50 dark:bg-primary-900/20" },
          { label: "Collected",      value: `₹${totalPaid.toLocaleString("en-IN")}`,      icon: CheckCircle2,   color: "text-green-600 bg-green-50 dark:bg-green-900/20" },
          { label: "Pending",        value: `₹${totalPending.toLocaleString("en-IN")}`,   icon: Clock,          color: "text-orange-600 bg-orange-50 dark:bg-orange-900/20" },
          { label: "Overdue",        value: `₹${totalOverdue.toLocaleString("en-IN")}`,   icon: AlertTriangle,  color: "text-red-600 bg-red-50 dark:bg-red-900/20" },
        ].map(({ label, value, icon: Icon, color }) => (
          <div key={label} className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm p-5 flex items-center gap-4">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${color}`}>
              <Icon className="w-5 h-5" />
            </div>
            <div>
              <p className="text-lg font-bold text-slate-900 dark:text-white">{value}</p>
              <p className="text-xs text-slate-500">{label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Table */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm overflow-hidden">
        {/* Table Header */}
        <div className="p-4 sm:p-5 border-b border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
          <h2 className="font-bold text-slate-800 dark:text-slate-200">
            Invoices
            <span className="ml-2 text-sm font-normal text-slate-400">({filtered.length})</span>
          </h2>
          {/* Filter Tabs */}
          <div className="flex gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl text-xs font-medium">
            {(["all", "pending", "overdue", "paid"] as const).map(s => (
              <button
                key={s}
                onClick={() => setFilterStatus(s)}
                className={`px-3 py-1.5 rounded-lg capitalize transition-colors ${filterStatus === s ? "bg-white dark:bg-slate-700 shadow text-slate-900 dark:text-white" : "text-slate-500 hover:text-slate-700"}`}
              >
                {s}
                <span className="ml-1 opacity-60">
                  ({s === "all" ? feeRecords.length : feeRecords.filter(r => r.status === s).length})
                </span>
              </button>
            ))}
          </div>
        </div>

        <div className="overflow-x-auto min-h-[300px]">
          {isLoading ? (
            <div className="w-full flex flex-col items-center justify-center text-slate-400 py-16">
              <Loader2 className="w-8 h-8 animate-spin mb-4 text-primary-500" />
              <p>Loading invoices...</p>
            </div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-16 text-slate-400 space-y-3">
              <IndianRupee className="w-12 h-12 mx-auto opacity-30" />
              <p className="font-medium">No invoices found</p>
              <p className="text-sm">
                {filterStatus === "all"
                  ? "Click \"Create Invoice\" above to issue the first fee."
                  : `No ${filterStatus} invoices.`}
              </p>
            </div>
          ) : (
            <table className="w-full text-sm text-left">
              <thead className="text-xs text-slate-500 uppercase bg-slate-50 dark:bg-slate-800/50">
                <tr>
                  <th className="px-6 py-4 font-medium">Invoice</th>
                  <th className="px-6 py-4 font-medium">Student</th>
                  <th className="px-6 py-4 font-medium">Amount</th>
                  <th className="px-6 py-4 font-medium">Status</th>
                  <th className="px-6 py-4 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {filtered.map((record) => (
                  <tr key={record.id} className={`hover:bg-slate-50/50 dark:hover:bg-slate-800/20 ${record.status === "overdue" ? "bg-red-50/30 dark:bg-red-900/5" : ""}`}>
                    <td className="px-6 py-4">
                      <div className="font-mono font-medium text-slate-900 dark:text-slate-200 text-xs">{record.id}</div>
                      <div className="text-xs text-slate-500 mt-0.5">{record.description}</div>
                      <div className="text-xs text-slate-400">{record.date} · {record.method}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-medium text-slate-800 dark:text-slate-300">{record.student}</div>
                      <div className="text-xs text-slate-500">{record.studentId} · {record.batch}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-bold text-slate-900 dark:text-slate-200">₹{parseFloat(record.amount).toLocaleString("en-IN")}</div>
                      {record.dueDate && record.status !== "paid" && (
                        <div className={`text-xs mt-0.5 ${record.status === "overdue" ? "text-red-500 font-medium" : "text-slate-400"}`}>
                          Due: {record.dueDate}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2.5 py-1 text-xs font-semibold rounded-full capitalize ${statusStyle[record.status] || statusStyle.pending}`}>
                        {record.status === "overdue" ? "⚠ Overdue" : record.status}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end gap-1.5">
                        {record.status !== "paid" && (
                          <button
                            onClick={() => handleMarkPaid(record)}
                            disabled={markingPaid === record.id}
                            className="px-3 py-1.5 text-xs font-semibold bg-green-100 hover:bg-green-200 text-green-700 dark:bg-green-900/30 dark:text-green-400 rounded-lg transition-colors flex items-center gap-1 disabled:opacity-60"
                            title="Mark as Paid"
                          >
                            {markingPaid === record.id ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <CheckCircle2 className="w-3.5 h-3.5" />}
                            Collect
                          </button>
                        )}
                        <button
                          onClick={() => handleDownload(record)}
                          disabled={isGenerating}
                          className="p-2 text-slate-400 hover:text-primary-600 rounded-lg hover:bg-primary-50 dark:hover:bg-primary-900/20 transition-colors"
                          title="Download Receipt"
                        >
                          <Printer className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleWhatsApp(record)}
                          className="p-2 text-slate-400 hover:text-green-600 rounded-lg hover:bg-green-50 dark:hover:bg-green-900/20 transition-colors"
                          title="Send WhatsApp"
                        >
                          <Send className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* ── Create Invoice Modal ─────────────────────────── */}
      {isCreateOpen && (
        <>
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-40" onClick={() => setIsCreateOpen(false)} />
          <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-100 dark:border-slate-800 w-full max-w-lg animate-in fade-in zoom-in-95 duration-200">
              {/* Modal Header */}
              <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100 dark:border-slate-800">
                <div>
                  <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    <Receipt className="w-5 h-5 text-primary-600" /> Create Invoice
                  </h2>
                  <p className="text-xs text-slate-500 mt-0.5">Issue a new fee invoice to a student</p>
                </div>
                <button onClick={() => setIsCreateOpen(false)} className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
                  <X className="w-5 h-5 text-slate-500" />
                </button>
              </div>

              {/* Modal Form */}
              <form onSubmit={handleCreateInvoice} className="p-6 space-y-4">
                {/* Student selector */}
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
                    Student <span className="text-red-500">*</span>
                  </label>
                  <select
                    name="studentId"
                    required
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 focus:border-primary-500 outline-none text-sm dark:text-white"
                  >
                    <option value="">— Select a student —</option>
                    {students.map(s => (
                      <option key={s.id} value={s.admission_number}>
                        {s.full_name} ({s.admission_number})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  {/* Amount */}
                  <div className="space-y-1.5">
                    <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
                      Amount (₹) <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 text-sm font-medium">₹</span>
                      <input
                        name="amount"
                        type="number"
                        required
                        min="1"
                        placeholder="2000"
                        className="w-full pl-7 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 focus:border-primary-500 outline-none text-sm dark:text-white"
                      />
                    </div>
                  </div>

                  {/* Month */}
                  <div className="space-y-1.5">
                    <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
                      Fee Month <span className="text-red-500">*</span>
                    </label>
                    <select
                      name="month"
                      required
                      defaultValue={MONTHS[new Date().getMonth()]}
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 focus:border-primary-500 outline-none text-sm dark:text-white"
                    >
                      {MONTHS.map(m => <option key={m}>{m} {new Date().getFullYear()}</option>)}
                    </select>
                  </div>
                </div>

                {/* Description */}
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Description</label>
                  <input
                    name="description"
                    placeholder="e.g. Monthly tuition fee – Hip Hop batch"
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 focus:border-primary-500 outline-none text-sm dark:text-white"
                  />
                </div>

                {/* Due Date */}
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Due Date <span className="text-slate-400">(optional)</span></label>
                  <input
                    name="dueDate"
                    type="date"
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 focus:border-primary-500 outline-none text-sm dark:text-white"
                  />
                </div>

                {/* Actions */}
                <div className="flex justify-end gap-3 pt-2">
                  <button type="button" onClick={() => setIsCreateOpen(false)} className="px-5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-sm font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isCreating}
                    className="px-5 py-2.5 bg-primary-600 hover:bg-primary-700 text-white rounded-xl text-sm font-semibold flex items-center gap-2 disabled:opacity-70 shadow-sm transition-colors"
                  >
                    {isCreating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                    {isCreating ? "Creating..." : "Create Invoice"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

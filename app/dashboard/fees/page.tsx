"use client";

import { useState, useEffect, useCallback } from "react";
import { generateReceiptPDF } from "@/lib/pdfGenerator";
import { createInvoice, markInvoicePaid } from "@/app/actions/fees";
import {
  Receipt, Printer, Send, Loader2, Plus, X, Save,
  Clock, CheckCircle2, AlertTriangle, TrendingUp, Download, ArrowUpRight
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";
import { getUserRole } from "@/app/actions/auth";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";

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
      (invoices || []).map((d: any) => {
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
      <div className="h-[60vh] flex flex-col items-center justify-center text-[var(--muted)] gap-4">
        <AlertTriangle className="w-12 h-12 opacity-50" />
        <h2 className="text-xl font-medium text-[var(--foreground)]">Access Denied</h2>
        <p className="text-sm">You do not have permission to view financial records.</p>
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
    const msg = `Hello from DIL Academy!\n\nFee receipt for *${record.student}*:\n• Receipt: ${record.id}\n• Month: ${record.month}\n• Amount: ₹${record.amount}\n• Status: ${record.status.toUpperCase()}\n\nThank you!`;
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
  const totalPaid      = feeRecords.filter((r: any) => r.status === "paid").reduce((s: any, r: any) => s + parseFloat(r.amount), 0);
  const totalPending   = feeRecords.filter((r: any) => r.status === "pending").reduce((s: any, r: any) => s + parseFloat(r.amount), 0);
  const totalOverdue   = feeRecords.filter((r: any) => r.status === "overdue").reduce((s: any, r: any) => s + parseFloat(r.amount), 0);
  const totalRevenue   = totalPaid;

  const filtered = filterStatus === "all"
    ? feeRecords
    : feeRecords.filter((r: any) => r.status === filterStatus);

  return (
    <div className="space-y-6 animate-in fade-in duration-500 pb-20">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-[var(--foreground)]">Billing & Invoices</h1>
          <p className="text-[var(--muted)] text-sm mt-1">Manage dues, collect payments, and track revenue.</p>
        </div>
        <div className="flex items-center gap-2">
          <button className="px-4 py-2 border border-[var(--border-color)] bg-[var(--card-bg)] text-[var(--foreground)] rounded-full font-medium transition-all text-sm flex items-center gap-2 shadow-sm hover:bg-[var(--background)]">
            <Download className="w-4 h-4" /> Export
          </button>
          <button
            onClick={() => setIsCreateOpen(true)}
            className="flex items-center gap-2 px-5 py-2.5 bg-[var(--foreground)] hover:bg-[var(--foreground)]/90 text-[var(--background)] rounded-full font-semibold shadow-sm transition-all text-sm"
          >
            <Plus className="w-4 h-4" /> New Invoice
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Total Revenue", value: `₹${totalRevenue.toLocaleString("en-IN")}`, icon: TrendingUp, color: "text-[var(--foreground)]", bg: "bg-[var(--foreground)]/5" },
          { label: "Collected", value: `₹${totalPaid.toLocaleString("en-IN")}`, icon: CheckCircle2, color: "text-green-600 dark:text-green-400", bg: "bg-green-500/10" },
          { label: "Pending", value: `₹${totalPending.toLocaleString("en-IN")}`, icon: Clock, color: "text-amber-600 dark:text-amber-400", bg: "bg-amber-500/10" },
          { label: "Overdue", value: `₹${totalOverdue.toLocaleString("en-IN")}`, icon: AlertTriangle, color: "text-red-600 dark:text-red-400", bg: "bg-red-500/10" },
        ].map(({ label, value, icon: Icon, color, bg }, i) => (
          <div key={label} className="bg-[var(--card-bg)] rounded-[24px] border border-[var(--border-color)] shadow-sm p-6 relative overflow-hidden group">
            <div className={`absolute top-0 right-0 w-32 h-32 ${bg} rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 transition-transform duration-500 group-hover:scale-150`}></div>
            <div className="flex items-start justify-between relative z-10 mb-8">
              <div className={`w-10 h-10 rounded-[14px] ${bg} flex items-center justify-center`}>
                <Icon className={`w-5 h-5 ${color}`} />
              </div>
            </div>
            <div className="relative z-10">
              <h3 className="text-3xl font-semibold tracking-tighter text-[var(--foreground)]">{value}</h3>
              <p className="text-sm font-medium text-[var(--muted)] mt-1">{label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Modern Data Grid */}
      <div className="bg-[var(--card-bg)] rounded-[24px] border border-[var(--border-color)] shadow-sm overflow-hidden flex flex-col">
        {/* Table Toolbar */}
        <div className="p-4 border-b border-[var(--border-color)] flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-[var(--background)]">
          <div className="flex bg-[var(--card-bg)] p-1 rounded-xl w-full sm:w-auto overflow-x-auto no-scrollbar border border-[var(--border-color)] shadow-sm">
            {(["all", "pending", "overdue", "paid"] as const).map(s => (
              <button
                key={s}
                onClick={() => setFilterStatus(s)}
                className={`px-4 py-1.5 rounded-lg text-sm font-semibold transition-all whitespace-nowrap capitalize ${
                  filterStatus === s
                    ? "bg-[var(--foreground)] text-[var(--background)] shadow-sm"
                    : "text-[var(--muted)] hover:text-[var(--foreground)] hover:bg-[var(--foreground)]/5"
                }`}
              >
                {s} <span className="opacity-50 text-xs ml-1">({s === "all" ? feeRecords.length : feeRecords.filter((r: any) => r.status === s).length})</span>
              </button>
            ))}
          </div>
        </div>

        <div className="overflow-x-auto">
          {isLoading ? (
            <div className="h-64 w-full flex items-center justify-center">
              <Loader2 className="w-8 h-8 animate-spin text-[var(--muted)]" />
            </div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-24 text-[var(--muted)] flex flex-col items-center">
              <Receipt className="w-12 h-12 text-[var(--border-color)] mb-4" />
              <p className="font-semibold text-[var(--foreground)] text-lg">No invoices found</p>
              <p className="text-sm mt-1">
                {filterStatus === "all" ? "Create an invoice to get started." : `No ${filterStatus} invoices.`}
              </p>
            </div>
          ) : (
            <table className="w-full text-sm text-left">
              <thead className="text-xs text-[var(--muted)] bg-[var(--background)] border-b border-[var(--border-color)]">
                <tr>
                  <th className="px-6 py-4 font-semibold tracking-wider">INVOICE</th>
                  <th className="px-6 py-4 font-semibold tracking-wider">STUDENT</th>
                  <th className="px-6 py-4 font-semibold tracking-wider">AMOUNT</th>
                  <th className="px-6 py-4 font-semibold tracking-wider">STATUS</th>
                  <th className="px-6 py-4 font-semibold tracking-wider text-right">ACTIONS</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--border-color)]">
                <AnimatePresence>
                  {filtered.map((record: any) => (
                    <motion.tr 
                      layout
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      key={record.id} 
                      className="hover:bg-[var(--background)] transition-colors group"
                    >
                      <td className="px-6 py-5">
                        <div className="font-mono font-bold text-[var(--foreground)] text-xs bg-[var(--background)] px-2 py-1 rounded-md border border-[var(--border-color)] inline-block mb-1">
                          {record.id}
                        </div>
                        <div className="text-xs font-medium text-[var(--foreground)]">{record.description}</div>
                        <div className="text-[10px] uppercase tracking-wider text-[var(--muted)] mt-0.5">{record.date}</div>
                      </td>
                      <td className="px-6 py-5">
                        <Link href={`/dashboard/students/${record.studentId}`} className="font-bold text-[var(--foreground)] hover:underline flex items-center gap-1">
                          {record.student} <ArrowUpRight className="w-3 h-3 text-[var(--muted)]" />
                        </Link>
                        <div className="text-xs text-[var(--muted)] mt-0.5 font-medium">{record.batch}</div>
                      </td>
                      <td className="px-6 py-5">
                        <div className="font-bold text-lg text-[var(--foreground)] tracking-tight">₹{parseFloat(record.amount).toLocaleString("en-IN")}</div>
                        {record.dueDate && record.status !== "paid" && (
                          <div className={`text-[10px] uppercase tracking-wider mt-1 font-bold ${record.status === "overdue" ? "text-red-500" : "text-[var(--muted)]"}`}>
                            Due {record.dueDate}
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-5">
                        <div className="flex items-center gap-2">
                          {record.status === 'paid' && (
                            <span className="flex items-center gap-1.5 px-2.5 py-1 text-xs font-bold rounded-full bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400">
                              <CheckCircle2 className="w-3.5 h-3.5" /> Paid
                            </span>
                          )}
                          {record.status === 'pending' && (
                            <span className="flex items-center gap-1.5 px-2.5 py-1 text-xs font-bold rounded-full bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400">
                              <Clock className="w-3.5 h-3.5" /> Pending
                            </span>
                          )}
                          {record.status === 'overdue' && (
                            <span className="flex items-center gap-1.5 px-2.5 py-1 text-xs font-bold rounded-full bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400">
                              <AlertTriangle className="w-3.5 h-3.5" /> Overdue
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-5 text-right">
                        <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          {record.status !== "paid" && (
                            <button
                              onClick={() => handleMarkPaid(record)}
                              disabled={markingPaid === record.id}
                              className="px-3 py-1.5 text-xs font-bold bg-[var(--foreground)] text-[var(--background)] rounded-xl transition-all flex items-center gap-1.5 disabled:opacity-50 shadow-sm hover:scale-105"
                              title="Mark as Paid"
                            >
                              {markingPaid === record.id ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : "Collect"}
                            </button>
                          )}
                          <button
                            onClick={() => handleDownload(record)}
                            disabled={isGenerating}
                            className="p-2 text-[var(--muted)] hover:text-[var(--foreground)] bg-[var(--background)] border border-transparent hover:border-[var(--border-color)] rounded-xl transition-all shadow-sm"
                            title="Download Receipt"
                          >
                            <Printer className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleWhatsApp(record)}
                            className="p-2 text-[var(--muted)] hover:text-[#25D366] bg-[var(--background)] border border-transparent hover:border-[#25D366]/30 rounded-xl transition-all shadow-sm"
                            title="Send WhatsApp"
                          >
                            <Send className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </motion.tr>
                  ))}
                </AnimatePresence>
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Create Invoice Modal */}
      <AnimatePresence>
        {isCreateOpen && (
          <>
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 bg-[var(--background)]/80 backdrop-blur-sm z-40" 
              onClick={() => setIsCreateOpen(false)} 
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="fixed inset-0 flex items-center justify-center z-50 p-4 pointer-events-none"
            >
              <div className="bg-[var(--card-bg)] rounded-[32px] shadow-2xl border border-[var(--border-color)] w-full max-w-lg overflow-hidden flex flex-col pointer-events-auto">
                <div className="flex items-center justify-between px-8 py-6 border-b border-[var(--border-color)]">
                  <div>
                    <h2 className="text-xl font-bold text-[var(--foreground)] tracking-tight">New Invoice</h2>
                    <p className="text-sm text-[var(--muted)] mt-1">Issue a fee receipt</p>
                  </div>
                  <button onClick={() => setIsCreateOpen(false)} className="p-2 rounded-full hover:bg-[var(--background)] transition-all">
                    <X className="w-5 h-5 text-[var(--muted)] hover:text-[var(--foreground)]" />
                  </button>
                </div>

                <div className="p-8">
                  <form id="invoice-form" onSubmit={handleCreateInvoice} className="space-y-6">
                    <div className="space-y-2">
                      <label className="text-xs font-bold uppercase tracking-wider text-[var(--muted)]">Student *</label>
                      <select name="studentId" required className="w-full px-4 py-3 rounded-xl border border-[var(--border-color)] bg-[var(--background)] text-[var(--foreground)] focus:border-[var(--foreground)] focus:ring-1 focus:ring-[var(--foreground)] outline-none text-sm font-medium transition-all appearance-none">
                        <option value="">— Select a student —</option>
                        {students.map((s: any) => (
                          <option key={s.id} value={s.admission_number}>{s.full_name} ({s.admission_number})</option>
                        ))}
                      </select>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="text-xs font-bold uppercase tracking-wider text-[var(--muted)]">Amount (₹) *</label>
                        <input name="amount" type="number" required min="1" placeholder="2000" className="w-full px-4 py-3 rounded-xl border border-[var(--border-color)] bg-[var(--background)] text-[var(--foreground)] focus:border-[var(--foreground)] focus:ring-1 focus:ring-[var(--foreground)] outline-none text-sm font-medium transition-all" />
                      </div>
                      <div className="space-y-2">
                        <label className="text-xs font-bold uppercase tracking-wider text-[var(--muted)]">Fee Month *</label>
                        <select name="month" required defaultValue={MONTHS[new Date().getMonth()]} className="w-full px-4 py-3 rounded-xl border border-[var(--border-color)] bg-[var(--background)] text-[var(--foreground)] focus:border-[var(--foreground)] focus:ring-1 focus:ring-[var(--foreground)] outline-none text-sm font-medium transition-all appearance-none">
                          {MONTHS.map(m => <option key={m}>{m} {new Date().getFullYear()}</option>)}
                        </select>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="text-xs font-bold uppercase tracking-wider text-[var(--muted)]">Description</label>
                      <input name="description" placeholder="e.g. Monthly tuition fee" className="w-full px-4 py-3 rounded-xl border border-[var(--border-color)] bg-[var(--background)] text-[var(--foreground)] focus:border-[var(--foreground)] focus:ring-1 focus:ring-[var(--foreground)] outline-none text-sm font-medium transition-all" />
                    </div>

                    <div className="space-y-2">
                      <label className="text-xs font-bold uppercase tracking-wider text-[var(--muted)]">Due Date <span className="opacity-50">(optional)</span></label>
                      <input name="dueDate" type="date" className="w-full px-4 py-3 rounded-xl border border-[var(--border-color)] bg-[var(--background)] text-[var(--foreground)] focus:border-[var(--foreground)] focus:ring-1 focus:ring-[var(--foreground)] outline-none text-sm font-medium transition-all" />
                    </div>
                  </form>
                </div>

                <div className="px-8 py-6 border-t border-[var(--border-color)] bg-[var(--background)] flex justify-end gap-3">
                  <button type="button" onClick={() => setIsCreateOpen(false)} className="px-6 py-3 rounded-xl font-medium text-[var(--foreground)] hover:bg-[var(--card-bg)] transition-all text-sm">
                    Cancel
                  </button>
                  <button type="submit" form="invoice-form" disabled={isCreating} className="px-6 py-3 bg-[var(--foreground)] text-[var(--background)] rounded-xl text-sm font-semibold flex items-center gap-2 disabled:opacity-50 shadow-sm hover:scale-[1.02] transition-all">
                    {isCreating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                    {isCreating ? "Creating..." : "Create Invoice"}
                  </button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}

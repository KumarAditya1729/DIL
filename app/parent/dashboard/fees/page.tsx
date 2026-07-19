"use client";

import { useEffect, useState } from "react";
import { fetchChildData, fetchChildInvoices, createRazorpayOrder, verifyParentPayment } from "@/app/actions/parent";
import { CreditCard, CheckCircle2, Clock, AlertCircle, IndianRupee, Loader2, ExternalLink, ShieldCheck } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";

declare global {
  interface Window { Razorpay: any; }
}

export default function ParentFeesPage() {
  const [child, setChild] = useState<any>(null);
  const [invoices, setInvoices] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [payingId, setPayingId] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      const childData = await fetchChildData();
      setChild(childData);
      if (childData?.id) {
        const inv = await fetchChildInvoices(childData.id);
        setInvoices(inv);
      }
      setIsLoading(false);
    };
    load();
  }, []);

  const loadRazorpay = () =>
    new Promise<void>((resolve) => {
      if (window.Razorpay) return resolve();
      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.onload = () => resolve();
      document.body.appendChild(script);
    });

  const handlePayNow = async (invoice: any) => {
    try {
      setPayingId(invoice.id);
      await loadRazorpay();

      // 1. Generate Razorpay Order securely on the server
      const order = await createRazorpayOrder(invoice.id, parseFloat(invoice.amount));

      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || "rzp_test_placeholder",
        amount: order.amount,
        currency: order.currency,
        name: "Dance Is Life Academy",
        description: `Fee Payment - ${invoice.description || invoice.id?.slice(0,8)}`,
        image: "/logo.png",
        order_id: order.id,
        handler: async (response: any) => {
          toast.loading("Verifying payment securely...", { id: "pay-toast" });
          
          // 2. Verify payment & update invoice state in Supabase via server action
          const res = await verifyParentPayment(invoice.id, response.razorpay_payment_id);
          
          if (res.error) {
            toast.error(`Verification Failed: ${res.error}`, { id: "pay-toast" });
          } else {
            toast.success("✅ Payment Successful! Fee recorded.", { id: "pay-toast" });
            setInvoices(prev => prev.map(i => i.id === invoice.id ? { ...i, status: "paid" } : i));
          }
          setPayingId(null);
        },
        prefill: {
          name: child?.parent_name || child?.full_name,
          email: child?.email || "",
          contact: child?.mobile_number || "",
        },
        theme: { color: "#111111" },
        modal: { ondismiss: () => setPayingId(null) },
      };

      const rzp = new window.Razorpay(options);
      rzp.on("payment.failed", (res: any) => {
        toast.error(`❌ Payment Failed: ${res.error.description}`);
        setPayingId(null);
      });
      rzp.open();
    } catch (error: any) {
      console.error("Checkout initiation failed:", error);
      toast.error("Failed to initialize checkout. Please try again.");
      setPayingId(null);
    }
  };

  const totalPaid = invoices.filter(i => i.status === "paid").reduce((s, i) => s + parseFloat(i.amount || "0"), 0);
  const totalPending = invoices.filter(i => i.status === "pending").reduce((s, i) => s + parseFloat(i.amount || "0"), 0);

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <Loader2 className="w-8 h-8 animate-spin text-[var(--muted)] mb-4" />
        <p className="text-[var(--muted)] text-sm font-medium">Loading financial records...</p>
      </div>
    );
  }

  if (!child) {
    return (
      <motion.div 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-center min-h-[60vh]"
      >
        <div className="text-center bg-[var(--card)] border border-[var(--border-color)] rounded-3xl p-10 max-w-sm shadow-sm space-y-6">
          <div className="w-16 h-16 rounded-full bg-[var(--hover-bg)] text-[var(--foreground)] flex items-center justify-center mx-auto border border-[var(--border-color)]">
            <CreditCard className="w-8 h-8 opacity-80" />
          </div>
          <div className="space-y-2">
            <h2 className="text-xl font-semibold text-[var(--foreground)] tracking-tight">No Linked Student</h2>
            <p className="text-[var(--muted)] text-sm">
              Please register your child first to view and pay outstanding fees.
            </p>
          </div>
          <div className="pt-4">
            <Link
              href="/parent/dashboard/register"
              className="inline-flex items-center justify-center w-full py-3 bg-[var(--foreground)] text-[var(--background)] hover:opacity-90 rounded-xl font-medium text-sm transition-all shadow-sm"
            >
              Register Child Now
            </Link>
          </div>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-4xl mx-auto space-y-8 pb-10"
    >
      <div>
        <h1 className="text-3xl font-semibold text-[var(--foreground)] flex items-center gap-3 tracking-tight">
          <CreditCard className="w-8 h-8 text-[var(--muted)]" /> Fees & Payments
        </h1>
        <p className="text-[var(--muted)] text-sm mt-2 ml-11">View invoices and pay fees securely online.</p>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-[var(--card)] border border-[var(--border-color)] rounded-3xl p-6 shadow-sm">
          <div className="flex items-center gap-2 text-[var(--muted)] mb-3">
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
            <span className="text-xs font-medium uppercase tracking-wider">Total Paid</span>
          </div>
          <p className="text-4xl font-semibold tracking-tight text-[var(--foreground)]">₹{totalPaid.toLocaleString()}</p>
        </div>
        <div className={`rounded-3xl p-6 shadow-sm border ${totalPending > 0 ? "bg-amber-500/5 border-amber-500/20" : "bg-[var(--card)] border-[var(--border-color)]"}`}>
          <div className={`flex items-center gap-2 mb-3 ${totalPending > 0 ? "text-amber-600" : "text-[var(--muted)]"}`}>
            <Clock className="w-4 h-4" />
            <span className="text-xs font-medium uppercase tracking-wider">Pending</span>
          </div>
          <p className={`text-4xl font-semibold tracking-tight ${totalPending > 0 ? "text-amber-600" : "text-[var(--foreground)]"}`}>
            ₹{totalPending.toLocaleString()}
          </p>
        </div>
      </div>

      {/* Secure Badge */}
      <div className="flex items-center gap-3 bg-[var(--hover-bg)] border border-[var(--border-color)] rounded-2xl px-5 py-3.5 shadow-sm">
        <ShieldCheck className="w-5 h-5 text-emerald-500 flex-shrink-0" />
        <p className="text-sm text-[var(--foreground)] font-medium">
          Payments are processed securely via <strong className="font-semibold">Razorpay</strong>. Your card details are never stored.
        </p>
      </div>

      {/* Invoice List */}
      <div className="bg-[var(--card)] border border-[var(--border-color)] rounded-3xl overflow-hidden shadow-sm">
        <div className="px-8 py-6 border-b border-[var(--border-color)] flex items-center justify-between">
          <h2 className="font-semibold text-[var(--foreground)] text-lg tracking-tight">All Invoices</h2>
          <span className="text-xs font-medium text-[var(--muted)] bg-[var(--hover-bg)] px-3 py-1 rounded-full border border-[var(--border-color)]">{invoices.length}</span>
        </div>

        {invoices.length === 0 ? (
          <div className="text-center py-16 text-[var(--muted)] space-y-3">
            <IndianRupee className="w-12 h-12 mx-auto opacity-20" />
            <p className="text-sm">No invoices found for this student.</p>
          </div>
        ) : (
          <div className="divide-y divide-[var(--border-color)]">
            <AnimatePresence>
              {invoices.map((inv) => {
                const isPending = inv.status === "pending";
                return (
                  <motion.div 
                    layout
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    key={inv.id} 
                    className="flex flex-col sm:flex-row sm:items-center justify-between px-8 py-5 hover:bg-[var(--hover-bg)] transition-colors gap-4"
                  >
                    <div className="flex-1 min-w-0">
                      <p className="text-base font-medium text-[var(--foreground)] truncate">
                        {inv.description || `Invoice #${inv.id?.slice(0, 8)}`}
                      </p>
                      <div className="flex items-center gap-3 mt-1.5">
                        <p className="text-sm text-[var(--muted)]">
                          {inv.created_at ? new Date(inv.created_at).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }) : "N/A"}
                        </p>
                        {inv.due_date && (
                          <>
                            <span className="text-[var(--muted)] opacity-50">·</span>
                            <p className="text-sm text-[var(--muted)]">Due {new Date(inv.due_date).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}</p>
                          </>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center justify-between sm:justify-end gap-5 flex-shrink-0 mt-2 sm:mt-0 pt-2 sm:pt-0 border-t sm:border-0 border-[var(--border-color)]">
                      <p className="text-xl font-semibold text-[var(--foreground)] tracking-tight">
                        ₹{parseFloat(inv.amount || "0").toLocaleString()}
                      </p>

                      {isPending ? (
                        <button
                          onClick={() => handlePayNow(inv)}
                          disabled={payingId === inv.id}
                          className="flex items-center justify-center gap-2 px-6 py-2.5 bg-[var(--foreground)] hover:opacity-90 text-[var(--background)] text-sm font-medium rounded-xl shadow-sm transition-all disabled:opacity-60 min-w-[120px]"
                        >
                          {payingId === inv.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <CreditCard className="w-4 h-4" />}
                          Pay Now
                        </button>
                      ) : (
                        <span className="flex items-center justify-center gap-1.5 text-xs font-semibold text-emerald-600 bg-emerald-500/10 border border-emerald-500/20 px-4 py-2.5 rounded-xl uppercase tracking-wider min-w-[120px]">
                          <CheckCircle2 className="w-4 h-4" /> Paid
                        </span>
                      )}
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        )}
      </div>

      {/* Help Note */}
      <div className="flex items-start gap-3 bg-[var(--card)] border border-[var(--border-color)] rounded-2xl p-5 shadow-sm">
        <AlertCircle className="w-5 h-5 text-[var(--muted)] mt-0.5 flex-shrink-0" />
        <p className="text-sm text-[var(--muted)] leading-relaxed">
          Having trouble with payment? Contact us at{" "}
          <a href="mailto:admin@danceislife.academy" className="text-[var(--foreground)] font-medium hover:underline">admin@danceislife.academy</a>{" "}
          or call your academy directly. We accept UPI, cards, net banking and wallets.
        </p>
      </div>
    </motion.div>
  );
}

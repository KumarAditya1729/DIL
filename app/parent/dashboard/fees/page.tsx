"use client";

import { useEffect, useState } from "react";
import { fetchChildData, fetchChildInvoices } from "@/app/actions/parent";
import { CreditCard, CheckCircle2, Clock, AlertCircle, IndianRupee, Loader2, ExternalLink } from "lucide-react";

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
    setPayingId(invoice.id);
    await loadRazorpay();

    const options = {
      key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || "rzp_test_placeholder",
      amount: Math.round(parseFloat(invoice.amount) * 100), // paise
      currency: "INR",
      name: "Dance Is Life Academy",
      description: `Fee Payment - ${invoice.description || invoice.id}`,
      image: "/logo.png",
      handler: (response: any) => {
        alert(`✅ Payment Successful!\nPayment ID: ${response.razorpay_payment_id}\n\nYour fee has been recorded. Thank you!`);
        setInvoices(prev => prev.map(i => i.id === invoice.id ? { ...i, status: "paid" } : i));
      },
      prefill: {
        name: child?.parent_name || child?.full_name,
        email: child?.email || "",
        contact: child?.mobile_number || "",
      },
      theme: { color: "#7c3aed" },
      modal: { ondismiss: () => setPayingId(null) },
    };

    const rzp = new window.Razorpay(options);
    rzp.on("payment.failed", (res: any) => {
      alert(`❌ Payment Failed: ${res.error.description}`);
      setPayingId(null);
    });
    rzp.open();
    setPayingId(null);
  };

  const totalPaid = invoices.filter(i => i.status === "paid").reduce((s, i) => s + parseFloat(i.amount || "0"), 0);
  const totalPending = invoices.filter(i => i.status === "pending").reduce((s, i) => s + parseFloat(i.amount || "0"), 0);

  if (isLoading) {
    return <div className="flex justify-center py-20"><div className="w-10 h-10 border-4 border-primary-500/30 border-t-primary-500 rounded-full animate-spin" /></div>;
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div>
        <h1 className="text-2xl font-bold text-white flex items-center gap-2">
          <CreditCard className="w-6 h-6 text-primary-400" /> Fees & Payments
        </h1>
        <p className="text-slate-500 text-sm mt-1">View invoices and pay fees securely online.</p>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-green-500/5 border border-green-500/10 rounded-2xl p-5">
          <CheckCircle2 className="w-5 h-5 text-green-400 mb-3" />
          <p className="text-3xl font-bold text-green-400">₹{totalPaid.toLocaleString()}</p>
          <p className="text-xs text-slate-500 mt-1">Total Paid</p>
        </div>
        <div className="bg-orange-500/5 border border-orange-500/10 rounded-2xl p-5">
          <Clock className="w-5 h-5 text-orange-400 mb-3" />
          <p className="text-3xl font-bold text-orange-400">₹{totalPending.toLocaleString()}</p>
          <p className="text-xs text-slate-500 mt-1">Pending</p>
        </div>
      </div>

      {/* Secure Badge */}
      <div className="flex items-center gap-2 text-xs text-slate-600 bg-white/5 border border-white/5 rounded-xl px-4 py-2.5">
        <ExternalLink className="w-3.5 h-3.5 text-green-500" />
        <span>Payments are processed securely via <strong className="text-slate-400">Razorpay</strong>. Your card details are never stored.</span>
      </div>

      {/* Invoice List */}
      <div className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden">
        <div className="p-4 border-b border-white/10">
          <h2 className="font-bold text-white text-sm">All Invoices ({invoices.length})</h2>
        </div>

        {invoices.length === 0 ? (
          <div className="text-center py-12 text-slate-500">
            <IndianRupee className="w-12 h-12 mx-auto mb-3 opacity-30" />
            <p>No invoices found for this student.</p>
          </div>
        ) : (
          <div className="divide-y divide-white/5">
            {invoices.map((inv) => {
              const isPending = inv.status === "pending";
              return (
                <div key={inv.id} className="flex items-center justify-between px-5 py-4 hover:bg-white/5 transition-colors gap-4">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-slate-200 truncate">
                      {inv.description || `Invoice #${inv.id?.slice(0, 8)}`}
                    </p>
                    <div className="flex items-center gap-3 mt-1">
                      <p className="text-xs text-slate-500">
                        {inv.created_at ? new Date(inv.created_at).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }) : "N/A"}
                      </p>
                      {inv.due_date && (
                        <p className="text-xs text-slate-600">Due: {new Date(inv.due_date).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}</p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-3 flex-shrink-0">
                    <p className="text-base font-bold text-white">₹{parseFloat(inv.amount || "0").toLocaleString()}</p>

                    {isPending ? (
                      <button
                        onClick={() => handlePayNow(inv)}
                        disabled={payingId === inv.id}
                        className="flex items-center gap-1.5 px-4 py-2 bg-gradient-to-r from-primary-600 to-pink-600 hover:from-primary-500 hover:to-pink-500 text-white text-xs font-bold rounded-xl shadow-lg shadow-purple-900/30 transition-all disabled:opacity-60"
                      >
                        {payingId === inv.id ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <CreditCard className="w-3.5 h-3.5" />}
                        Pay Now
                      </button>
                    ) : (
                      <span className="flex items-center gap-1.5 text-xs font-semibold text-green-400 bg-green-500/10 border border-green-500/20 px-3 py-2 rounded-xl">
                        <CheckCircle2 className="w-3.5 h-3.5" /> Paid
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Help Note */}
      <div className="flex items-start gap-3 bg-white/5 border border-white/5 rounded-2xl p-4">
        <AlertCircle className="w-4 h-4 text-primary-400 mt-0.5 flex-shrink-0" />
        <p className="text-xs text-slate-500 leading-relaxed">
          Having trouble with payment? Contact us at{" "}
          <a href="mailto:admin@danceislife.academy" className="text-primary-400 hover:underline">admin@danceislife.academy</a>{" "}
          or call your academy directly. We accept UPI, cards, net banking and wallets.
        </p>
      </div>
    </div>
  );
}

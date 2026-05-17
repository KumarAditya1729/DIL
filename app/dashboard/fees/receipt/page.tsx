"use client";

import { useSearchParams } from "next/navigation";
import { useEffect, Suspense } from "react";

function ReceiptContent() {
  const p = useSearchParams();
  const receipt = p.get("receipt") || "N/A";
  const date    = p.get("date") || new Date().toLocaleDateString();
  const name    = p.get("name") || "N/A";
  const id      = p.get("id") || "N/A";
  const batch   = p.get("batch") || "N/A";
  const method  = p.get("method") || "Cash";
  const month   = p.get("month") || "N/A";
  const amount  = parseFloat(p.get("amount") || "0");

  useEffect(() => {
    // Give the page a moment to render fully, then open print dialog
    const timer = setTimeout(() => window.print(), 600);
    return () => clearTimeout(timer);
  }, []);

  return (
    <>
      {/* Print styles injected into head via style tag */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: 'Inter', sans-serif; background: #f1f5f9; }
        .page { background: white; max-width: 720px; margin: 40px auto; border-radius: 16px; overflow: hidden; box-shadow: 0 20px 60px rgba(0,0,0,0.12); }
        @media print {
          body { background: white; }
          .page { margin: 0; border-radius: 0; box-shadow: none; max-width: 100%; }
          .no-print { display: none !important; }
        }
      `}</style>

      {/* Print / Download button — hidden when printing */}
      <div className="no-print fixed top-4 right-4 flex gap-2 z-50">
        <button
          onClick={() => window.print()}
          className="px-5 py-2.5 bg-purple-600 hover:bg-purple-700 text-white rounded-xl font-semibold text-sm shadow-lg flex items-center gap-2 transition-colors"
        >
          🖨️ Print / Save as PDF
        </button>
        <button
          onClick={() => window.close()}
          className="px-4 py-2.5 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-xl font-medium text-sm shadow transition-colors"
        >
          ✕ Close
        </button>
      </div>

      {/* Receipt */}
      <div className="page">
        {/* Header Banner */}
        <div style={{ background: "linear-gradient(135deg, #7c3aed 0%, #a855f7 100%)", padding: "36px 40px", color: "white" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
            <div>
              <div style={{ fontSize: 11, fontWeight: 600, letterSpacing: "0.12em", textTransform: "uppercase", opacity: 0.8, marginBottom: 6 }}>
                Dance Is Life
              </div>
              <div style={{ fontSize: 26, fontWeight: 800, lineHeight: 1.1 }}>Art &amp; Study Center</div>
              <div style={{ fontSize: 12, opacity: 0.75, marginTop: 8, lineHeight: 1.6 }}>
                Certified Dance Academy · Est. 2015<br />
                dance-is-life.academy
              </div>
            </div>
            <div style={{ textAlign: "right" }}>
              <div style={{ fontSize: 11, fontWeight: 600, letterSpacing: "0.12em", textTransform: "uppercase", opacity: 0.8, marginBottom: 4 }}>Receipt</div>
              <div style={{ fontSize: 28, fontWeight: 800, fontFamily: "monospace", letterSpacing: 1 }}>#{receipt}</div>
              <div style={{ fontSize: 12, opacity: 0.75, marginTop: 6 }}>{date}</div>
            </div>
          </div>
        </div>

        {/* Status Badge */}
        <div style={{ background: "#f0fdf4", borderBottom: "1px solid #dcfce7", padding: "12px 40px", display: "flex", alignItems: "center", gap: 8 }}>
          <span style={{ width: 8, height: 8, borderRadius: "50%", background: "#22c55e", display: "inline-block" }} />
          <span style={{ fontSize: 13, fontWeight: 600, color: "#15803d" }}>Payment Confirmed</span>
          <span style={{ marginLeft: "auto", fontSize: 12, color: "#15803d" }}>via {method}</span>
        </div>

        {/* Body */}
        <div style={{ padding: "36px 40px" }}>
          {/* Student Info + Amount Side by Side */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 32, marginBottom: 32 }}>
            <div>
              <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: "#94a3b8", marginBottom: 12 }}>Paid By</div>
              <div style={{ fontSize: 18, fontWeight: 700, color: "#0f172a", marginBottom: 4 }}>{name}</div>
              <div style={{ fontSize: 13, color: "#64748b", fontFamily: "monospace" }}>Admission No. {id}</div>
              <div style={{ fontSize: 13, color: "#64748b", marginTop: 2 }}>Batch: {batch}</div>
            </div>
            <div style={{ textAlign: "right" }}>
              <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: "#94a3b8", marginBottom: 12 }}>Amount Paid</div>
              <div style={{ fontSize: 42, fontWeight: 800, color: "#7c3aed", lineHeight: 1 }}>
                ₹{amount.toLocaleString("en-IN")}
              </div>
              <div style={{ fontSize: 13, color: "#64748b", marginTop: 6 }}>Indian Rupees</div>
            </div>
          </div>

          {/* Divider */}
          <div style={{ height: 1, background: "#e2e8f0", margin: "0 0 28px" }} />

          {/* Payment Details Table */}
          <div style={{ marginBottom: 32 }}>
            <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: "#94a3b8", marginBottom: 14 }}>Payment Details</div>
            {[
              ["Description", `Tuition Fee – ${month}`],
              ["Fee Month", month],
              ["Payment Method", method],
              ["Payment Date", date],
              ["Receipt No.", receipt],
            ].map(([label, value]) => (
              <div key={label} style={{ display: "flex", justifyContent: "space-between", padding: "10px 0", borderBottom: "1px solid #f1f5f9" }}>
                <span style={{ fontSize: 13, color: "#64748b" }}>{label}</span>
                <span style={{ fontSize: 13, fontWeight: 600, color: "#0f172a" }}>{value}</span>
              </div>
            ))}
          </div>

          {/* Total Row */}
          <div style={{ background: "#faf5ff", border: "1px solid #e9d5ff", borderRadius: 12, padding: "16px 20px", display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 32 }}>
            <span style={{ fontWeight: 700, color: "#7c3aed", fontSize: 15 }}>Total Amount Paid</span>
            <span style={{ fontWeight: 800, color: "#7c3aed", fontSize: 20 }}>₹{amount.toLocaleString("en-IN")}</span>
          </div>

          {/* Footer Note */}
          <div style={{ background: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: 10, padding: "14px 18px", fontSize: 12, color: "#64748b", lineHeight: 1.6 }}>
            This is a computer-generated receipt and does not require a physical signature. For queries, contact your academy administrator. Keep this receipt for your records.
          </div>
        </div>

        {/* Footer */}
        <div style={{ borderTop: "1px solid #f1f5f9", padding: "20px 40px", display: "flex", justifyContent: "space-between", alignItems: "center", background: "#fafafa" }}>
          <div style={{ fontSize: 12, color: "#94a3b8" }}>© {new Date().getFullYear()} Dance Is Life Art &amp; Study Center</div>
          <div style={{ fontSize: 12, color: "#94a3b8", fontFamily: "monospace" }}>DIL-{receipt}</div>
        </div>
      </div>
    </>
  );
}

export default function ReceiptPage() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center min-h-screen text-slate-500">Generating receipt...</div>}>
      <ReceiptContent />
    </Suspense>
  );
}

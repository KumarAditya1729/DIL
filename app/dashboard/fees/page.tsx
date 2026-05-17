"use client";

import { useState, useEffect } from "react";
import { generateReceiptPDF } from "@/lib/pdfGenerator";
import { Receipt, Printer, Send, Search, Loader2 } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

import { toast } from "sonner";

export default function FeesPage() {
  const [isGenerating, setIsGenerating] = useState(false);
  const [feeRecords, setFeeRecords] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchInvoices = async () => {
      const supabase = createClient();
      
      // In a real prod setup we'd inner join students, but for simplicity:
      const { data, error } = await supabase
        .from('invoices')
        .select(`
          *,
          students ( full_name, admission_number )
        `)
        .order('created_at', { ascending: false });

      if (data && data.length > 0) {
        setFeeRecords(data.map(d => ({
          id: d.invoice_number,
          student: d.students?.full_name || 'Unknown',
          studentId: d.students?.admission_number || d.student_id,
          batch: "Assigned Batch", // from batches
          amount: d.amount,
          date: new Date(d.created_at).toLocaleDateString(),
          month: d.month,
          status: d.status,
          method: d.razorpay_payment_id ? "Online" : "Cash"
        })));
      } else {
        setFeeRecords([]);
      }
      setIsLoading(false);
    };
    fetchInvoices();
  }, []);

  const handleDownload = (record: any) => {
    setIsGenerating(true);
    toast.info(`Generating PDF for ${record.id}...`);
    setTimeout(() => {
      generateReceiptPDF({
        receiptNumber: record.id,
        date: record.date,
        studentName: record.student,
        studentId: record.studentId,
        batch: record.batch,
        paymentMethod: record.method,
        month: record.month,
        amount: record.amount
      });
      toast.success("Receipt downloaded successfully!");
      setIsGenerating(false);
    }, 1000);
  };

  const handleWhatsApp = (record: any) => {
    const message = `Hello, this is Dance Is Life Art & Study Center. We have received your fee payment of INR ${record.amount} for ${record.month}. Receipt No: ${record.id}. Thank you!`;
    const encodedMessage = encodeURIComponent(message);
    window.open(`https://wa.me/?text=${encodedMessage}`, '_blank');
    toast.success("Redirecting to WhatsApp...");
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Fee Management</h1>
          <p className="text-slate-500 text-sm mt-1">Track payments, issue receipts, and manage dues.</p>
        </div>
      </div>
      
      {/* List of Receipts */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm overflow-hidden">
        <div className="p-4 sm:p-6 border-b border-slate-100 dark:border-slate-800">
          <h2 className="font-bold text-lg text-slate-800 dark:text-slate-200">Recent Transactions</h2>
        </div>
        <div className="overflow-x-auto min-h-[300px]">
          {isLoading ? (
            <div className="w-full h-full flex flex-col items-center justify-center text-slate-400 py-12">
              <Loader2 className="w-8 h-8 animate-spin mb-4 text-primary-500" />
              <p>Loading transactions...</p>
            </div>
          ) : feeRecords.length === 0 ? (
            <div className="text-center py-12 text-slate-500">
              <p>No fee records found in the database.</p>
            </div>
          ) : (
            <table className="w-full text-sm text-left">
              <thead className="text-xs text-slate-500 uppercase bg-slate-50 dark:bg-slate-800/50">
                <tr>
                  <th className="px-6 py-4 font-medium">Receipt Info</th>
                  <th className="px-6 py-4 font-medium">Student</th>
                  <th className="px-6 py-4 font-medium">Amount</th>
                  <th className="px-6 py-4 font-medium">Status</th>
                  <th className="px-6 py-4 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {feeRecords.map((record, i) => (
                  <tr key={i} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/20">
                    <td className="px-6 py-4">
                      <div className="font-medium text-slate-900 dark:text-slate-200">{record.id}</div>
                      <div className="text-xs text-slate-500">{record.date} • {record.method}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-medium text-slate-800 dark:text-slate-300">{record.student}</div>
                      <div className="text-xs text-slate-500">{record.batch}</div>
                    </td>
                    <td className="px-6 py-4 font-semibold text-slate-900 dark:text-slate-200">₹{record.amount}</td>
                    <td className="px-6 py-4">
                      <span className={`px-2.5 py-1 text-xs font-medium rounded-full ${record.status === 'paid' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' : 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400'}`}>
                        {record.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button 
                          onClick={() => handleDownload(record)}
                          disabled={isGenerating}
                          className="p-2 text-slate-400 hover:text-primary-600 rounded-md hover:bg-primary-50 dark:hover:bg-primary-900/20" 
                          title="Download Receipt"
                        >
                          <Printer className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={() => handleWhatsApp(record)}
                          className="p-2 text-slate-400 hover:text-green-600 rounded-md hover:bg-green-50 dark:hover:bg-green-900/20" 
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
    </div>
  );
}

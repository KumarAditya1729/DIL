// Proper receipt printer — opens a dedicated receipt page and triggers browser print
// No jsPDF dependency needed; the browser renders the HTML + CSS into a perfect PDF

export const generateReceiptPDF = (receiptData: {
  receiptNumber: string;
  date: string;
  studentName: string;
  studentId: string;
  batch: string;
  paymentMethod: string;
  month: string;
  amount: number | string;
}) => {
  // Encode the data as URL params and open the receipt page
  const params = new URLSearchParams({
    receipt: receiptData.receiptNumber || "N/A",
    date: receiptData.date || new Date().toLocaleDateString(),
    name: receiptData.studentName || "N/A",
    id: receiptData.studentId || "N/A",
    batch: receiptData.batch || "N/A",
    method: receiptData.paymentMethod || "Cash",
    month: receiptData.month || "N/A",
    amount: String(receiptData.amount || 0),
  });

  const url = `/dashboard/fees/receipt?${params.toString()}`;
  window.open(url, "_blank", "width=860,height=700");
};

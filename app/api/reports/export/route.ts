import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function GET() {
  const supabase = createClient();

  const { data: user } = await supabase.auth.getUser();
  if (!user?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { data: invoices } = await supabase
    .from("invoices")
    .select("*, students(full_name, admission_number)")
    .order("created_at", { ascending: false });

  const rows = (invoices || []).map(i => ({
    invoice_number: i.invoice_number,
    student:        i.students?.full_name || "Unknown",
    admission_no:   i.students?.admission_number || "",
    amount:         i.amount,
    month:          i.month,
    status:         i.status,
    date:           new Date(i.created_at).toLocaleDateString("en-IN"),
    method:         i.razorpay_payment_id ? "Online" : "Cash",
  }));

  const headers = ["Invoice No", "Student", "Admission No", "Amount (₹)", "Month", "Status", "Date", "Method"];
  const csv = [
    headers.join(","),
    ...rows.map(r =>
      [r.invoice_number, `"${r.student}"`, r.admission_no, r.amount, r.month, r.status, r.date, r.method].join(",")
    ),
  ].join("\n");

  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="DIL-Report-${new Date().toISOString().split("T")[0]}.csv"`,
    },
  });
}

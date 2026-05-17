"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function createInvoice(formData: FormData) {
  const supabase = createClient();
  const { data: user } = await supabase.auth.getUser();
  if (!user?.user) return { error: "Unauthorized." };

  const { data: profile } = await supabase
    .from("profiles")
    .select("academy_id")
    .eq("id", user.user.id)
    .single();

  const studentAdmNo = formData.get("studentId") as string;
  const amount       = parseFloat(formData.get("amount") as string);
  const description  = formData.get("description") as string;
  const month        = formData.get("month") as string;
  const dueDate      = formData.get("dueDate") as string || null;

  if (!studentAdmNo || !amount || !month) {
    return { error: "Student, amount and month are required." };
  }

  // Resolve student UUID from admission number
  const { data: student } = await supabase
    .from("students")
    .select("id")
    .eq("admission_number", studentAdmNo)
    .single();

  if (!student) return { error: "Student not found. Check the admission number." };

  // Generate invoice number: INV-YYYY-MM-NNN
  const now = new Date();
  const prefix = `INV-${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-`;
  const { data: lastInv } = await supabase
    .from("invoices")
    .select("invoice_number")
    .like("invoice_number", `${prefix}%`)
    .order("invoice_number", { ascending: false })
    .limit(1);

  const lastNum = lastInv?.[0]
    ? parseInt(lastInv[0].invoice_number.replace(prefix, ""), 10)
    : 0;
  const invoiceNumber = `${prefix}${String(lastNum + 1).padStart(3, "0")}`;

  const { error } = await supabase.from("invoices").insert({
    invoice_number: invoiceNumber,
    student_id:     student.id,
    academy_id:     profile?.academy_id ?? null,
    amount,
    description,
    month,
    due_date:       dueDate || null,
    status:         "pending",
  });

  if (error) return { error: error.message };

  revalidatePath("/dashboard/fees");
  return { success: true, invoiceNumber };
}

export async function markInvoicePaid(invoiceId: string) {
  const supabase = createClient();
  const { data: user } = await supabase.auth.getUser();
  if (!user?.user) return { error: "Unauthorized." };

  const { error } = await supabase
    .from("invoices")
    .update({ status: "paid", paid_at: new Date().toISOString() })
    .eq("invoice_number", invoiceId);

  if (error) return { error: error.message };
  revalidatePath("/dashboard/fees");
  return { success: true };
}

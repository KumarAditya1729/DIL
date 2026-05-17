"use server";

import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export async function parentLogin(formData: FormData) {
  const supabase = createClient();
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;

  const { error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) return { error: error.message };

  redirect("/parent/dashboard");
}

export async function parentLogout() {
  const supabase = createClient();
  await supabase.auth.signOut();
  redirect("/parent/login");
}

export async function fetchChildData() {
  const supabase = createClient();
  const { data: user } = await supabase.auth.getUser();
  if (!user?.user) return null;

  // Look up student linked to this parent's mobile/email
  const { data: student } = await supabase
    .from("students")
    .select("*")
    .or(`email.eq.${user.user.email},mobile_number.eq.${user.user.phone || ""}`)
    .limit(1)
    .maybeSingle();

  // Fallback: find by parent email stored in metadata
  if (!student) {
    const parentEmail = user.user.email;
    const { data: linked } = await supabase
      .from("students")
      .select("*")
      .ilike("email", parentEmail || "")
      .limit(1)
      .maybeSingle();
    return linked || null;
  }

  return student;
}

export async function fetchChildAttendance(studentId: string) {
  const supabase = createClient();
  const { data } = await supabase
    .from("attendance_records")
    .select("present, attendance(date)")
    .eq("student_id", studentId)
    .order("created_at", { ascending: false })
    .limit(30);

  return (data || []).map((r: any) => ({
    date: r.attendance?.date,
    present: r.present,
  }));
}

export async function fetchChildInvoices(studentId: string) {
  const supabase = createClient();
  const { data } = await supabase
    .from("invoices")
    .select("*")
    .eq("student_id", studentId)
    .order("created_at", { ascending: false });

  return data || [];
}

export async function createRazorpayOrder(invoiceId: string, amount: number) {
  // In production: call Razorpay API to create an order
  // Returning a mock order object for now
  return {
    id: `order_${Date.now()}`,
    amount: amount * 100, // in paise
    currency: "INR",
    invoiceId,
  };
}

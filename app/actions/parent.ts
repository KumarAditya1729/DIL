"use server";

import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { getNextAdmissionNumber } from "@/app/actions/students";

export async function parentLogin(formData: FormData) {
  const supabase = createClient();
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;

  const { error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) return { error: error.message };

  redirect("/parent/dashboard");
}

import { createAdminClient } from "@/lib/supabase/admin";

export async function parentRegister(formData: FormData) {
  const supabase = createClient();
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;

  const adminClient = createAdminClient();
  if (adminClient) {
    // Automatically confirm email during signup to avoid "Email not confirmed" blocks
    const { error: authError } = await adminClient.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: { role: "parent" }
    });
    if (authError) return { error: authError.message };
  } else {
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          role: "parent",
        }
      }
    });
    if (error) return { error: error.message };
  }

  // Log in immediately after sign up
  const { error: loginError } = await supabase.auth.signInWithPassword({ email, password });
  if (loginError) return { error: loginError.message };

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
    .select("status, attendance(date)")
    .eq("student_id", studentId)
    .limit(30);

  return (data || []).map((r: any) => ({
    date: r.attendance?.date,
    present: r.status === "present",
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
  const keyId = process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID;
  const keySecret = process.env.RAZORPAY_KEY_SECRET;

  if (!keyId || !keySecret) {
    // Sandbox Mock Mode fallback
    console.warn("Razorpay API keys not found in environment. Running in Mock Sandbox mode.");
    return {
      id: `mock_order_${Math.random().toString(36).substring(7)}`,
      amount: Math.round(amount * 100),
      currency: "INR",
      isMock: true
    };
  }

  try {
    const basicAuth = Buffer.from(`${keyId}:${keySecret}`).toString("base64");
    const res = await fetch("https://api.razorpay.com/v1/orders", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Basic ${basicAuth}`,
      },
      body: JSON.stringify({
        amount: Math.round(amount * 100), // paise
        currency: "INR",
        receipt: invoiceId,
      }),
    });

    const order = await res.json();
    if (order.error) {
      throw new Error(order.error.description || "Razorpay API error");
    }

    return {
      id: order.id,
      amount: order.amount,
      currency: order.currency,
      isMock: false
    };
  } catch (err: any) {
    console.error("Razorpay order creation failed:", err);
    return {
      id: `mock_order_failed_${Date.now()}`,
      amount: Math.round(amount * 100),
      currency: "INR",
      isMock: true
    };
  }
}

export async function verifyParentPayment(invoiceId: string, razorpayPaymentId?: string) {
  const supabase = createClient();
  const { data: user } = await supabase.auth.getUser();
  if (!user?.user) return { error: "Unauthorized." };

  const { error } = await supabase
    .from("invoices")
    .update({ 
      status: "paid",
      razorpay_payment_id: razorpayPaymentId || null,
      paid_at: new Date().toISOString(),
      payment_method: "Razorpay Online",
      transaction_id: razorpayPaymentId || `TXN_${Date.now()}`
    })
    .eq("id", invoiceId);

  if (error) return { error: error.message };
  return { success: true };
}

export async function registerChild(formData: FormData) {
  const supabase = createClient();
  const { data: auth } = await supabase.auth.getUser();
  if (!auth?.user) return { error: "Unauthorized. Please log in." };

  const fullName = formData.get("fullName") as string;
  const parentName = formData.get("parentName") as string;
  const mobileNumber = formData.get("mobileNumber") as string;
  const whatsappNumber = formData.get("whatsappNumber") as string || null;
  const aadharName = formData.get("aadharName") as string;
  const aadharNumber = formData.get("aadharNumber") as string;
  const dob = formData.get("dob") as string;
  const gender = formData.get("gender") as string;
  const danceStyle = formData.get("danceStyle") as string;
  const batch = formData.get("batch") as string;
  const medicalNotes = formData.get("medicalNotes") as string;

  if (!fullName || !mobileNumber || !parentName) {
    return { error: "Full Name, Parent Name, and Mobile Number are required." };
  }

  try {
    // 1. Get current academy id
    const { data: academy } = await supabase.from("academies").select("id").limit(1).maybeSingle();
    if (!academy) {
      return { error: "No active academy found in the system." };
    }

    // 2. Generate admission number
    const admissionNumber = await getNextAdmissionNumber();

    // 3. Insert student record linked to parent email
    const { error: dbError } = await supabase.from("students").insert({
      academy_id: academy.id,
      admission_number: admissionNumber,
      full_name: fullName,
      parent_name: parentName,
      mobile_number: mobileNumber,
      whatsapp_number: whatsappNumber,
      aadhar_name: aadharName || null,
      aadhar_number: aadharNumber || null,
      email: auth.user.email, // Link to the parent email
      date_of_birth: dob || null,
      gender: gender || null,
      dance_style: danceStyle || null,
      batch: batch || null,
      medical_notes: medicalNotes || null,
      status: "active",
    });

    if (dbError) throw dbError;

    return { success: true, admissionNumber };
  } catch (error: any) {
    console.error("Failed to register child:", error);
    return { error: error.message || "Failed to register. Please try again." };
  }
}

export async function fetchParentBatches() {
  const supabase = createClient();
  
  // Resolve current active academy_id (DIL Academy)
  const { data: academy } = await supabase
    .from("academies")
    .select("id")
    .limit(1)
    .single();

  if (!academy?.id) return [];

  const { data: batches } = await supabase
    .from("batches")
    .select("*")
    .eq("academy_id", academy.id)
    .order("name", { ascending: true });

  return batches || [];
}

import { NextResponse } from "next/server";
import crypto from "crypto";
import { createClient } from "@/lib/supabase/server";

const RAZORPAY_WEBHOOK_SECRET = process.env.RAZORPAY_WEBHOOK_SECRET || '';

export async function POST(req: Request) {
  try {
    const rawBody = await req.text();
    const signature = req.headers.get("x-razorpay-signature");

    if (!signature) {
      return NextResponse.json({ error: "Missing signature" }, { status: 400 });
    }

    // Verify webhook signature
    const expectedSignature = crypto
      .createHmac("sha256", RAZORPAY_WEBHOOK_SECRET)
      .update(rawBody)
      .digest("hex");

    if (expectedSignature !== signature) {
      return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
    }

    const event = JSON.parse(rawBody);
    const supabase = createClient();

    // Handle different Razorpay events
    switch (event.event) {
      case "subscription.charged":
        await handleSubscriptionCharged(supabase, event.payload.subscription.entity);
        break;
      
      case "subscription.halted":
      case "subscription.cancelled":
        await handleSubscriptionHalted(supabase, event.payload.subscription.entity);
        break;

      case "payment.captured":
        await handleStudentFeePayment(supabase, event.payload.payment.entity);
        break;
    }

    return NextResponse.json({ received: true }, { status: 200 });
  } catch (error) {
    console.error("Webhook processing failed:", error);
    return NextResponse.json({ error: "Webhook handler failed" }, { status: 500 });
  }
}

async function handleSubscriptionCharged(supabase: any, subscriptionData: any) {
  // Extract academy ID from subscription notes
  const academyId = subscriptionData.notes?.academy_id;
  if (!academyId) return;

  // Update academy subscription status
  await supabase
    .from("academies")
    .update({ 
      subscription_status: "active",
      is_active: true
    })
    .eq("id", academyId);
    
  // Log audit trail
  await supabase.from("audit_logs").insert({
    academy_id: academyId,
    action: "subscription.renewed",
    entity_type: "subscription",
    metadata: { payment_id: subscriptionData.payment_id }
  });
}

async function handleSubscriptionHalted(supabase: any, subscriptionData: any) {
  const academyId = subscriptionData.notes?.academy_id;
  if (!academyId) return;

  await supabase
    .from("academies")
    .update({ subscription_status: "past_due" })
    .eq("id", academyId);
}

async function handleStudentFeePayment(supabase: any, paymentData: any) {
  const invoiceId = paymentData.notes?.invoice_id;
  if (!invoiceId) return;

  await supabase
    .from("invoices")
    .update({ 
      status: "paid",
      razorpay_payment_id: paymentData.id,
      paid_at: new Date().toISOString()
    })
    .eq("id", invoiceId);
}

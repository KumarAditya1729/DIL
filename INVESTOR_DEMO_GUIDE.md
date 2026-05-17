# Investor & Client Demo Walkthrough Guide

## 1. Demo Credentials
If you are presenting to investors, use the following credentials to instantly access the fully populated "Dance Is Life" dashboard:
- **URL**: `https://localhost:3000/login`
- **Click**: "Auto-Login as Demo Academy"
*(This injects the demo email and bypasses authentication).*

## 2. Recommended Walkthrough Flow

### Step 1: The Landing Page (`/`)
Showcase the premium, multi-tenant SaaS value proposition. Highlight the PWA capabilities and the Dark Mode / Deep Purple aesthetic. Note that academies can sign up instantly.

### Step 2: Super Admin Dashboard (`/superadmin`)
Demonstrate the SaaS perspective. Show how the platform manages multiple academies (e.g., Beat Masters, Dance Is Life) and tracks the total Monthly Recurring Revenue (MRR).

### Step 3: Tenant Dashboard (`/dashboard`)
Login via the Demo button. 
- Emphasize the **Global Trial Banner** showing monetization urgency.
- Show the **Metrics Cards** (Monthly Revenue, Pending Fees) which visualize financial health.

### Step 4: Enterprise QR Attendance (`/dashboard/attendance`)
Switch to the Attendance tab. Show the "Student Kiosk Mode" QR code generator. Explain how academies set up a tablet at the door, completely automating roll-call.

### Step 5: Webhook Billing Engine (`/dashboard/fees`)
Highlight the WhatsApp integration for fee reminders. Explain the underlying architecture: Razorpay Webhooks automatically reconcile pending invoices in the PostgreSQL database without human intervention.

### Step 6: Upsell/Feature Gating (`/dashboard/reports`)
If asked about scaling, show the **Predictive Analytics** section (or the Trial/Pro locks). Explain that advanced features are mathematically gated by the `<FeatureGate>` component, driving SaaS expansion revenue.

## 3. Empty State Reset
If you want to demo the onboarding flow for a brand new client:
- Navigate to `/onboarding`
- Go through the 3-step setup (Branding, Details, Trial Activation).

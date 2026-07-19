<div align="center">
  <img src="public/logo.png" alt="Dance Is Life OS Logo" width="120" />
  
  # Dance Is Life OS
  
  **The Premium Operating System for Dance Academies**

  <p>
    <a href="#features">Features</a> •
    <a href="#tech-stack">Tech Stack</a> •
    <a href="#getting-started">Getting Started</a> •
    <a href="#architecture">Architecture</a>
  </p>
</div>

---

**Dance Is Life OS (DIL)** is an enterprise-grade, multi-tenant SaaS platform engineered specifically for dance academies. Designed with a meticulously crafted interface inspired by the design philosophies of Apple, Linear, and Stripe, it provides a seamless, world-class experience for both academy administrators and parents.

This is not a generic admin dashboard—it is a **premium operating system** designed to run an entire academy with effortless precision.

## ✨ Design Philosophy

- **Apple Simplicity**: Intuitive, clutter-free user flows.
- **Linear Precision**: Micro-animations, exact typography, and distinct spatial hierarchy.
- **Stripe Polish**: Premium glassmorphism, soft shadows, and frictionless payment integrations.
- **Monochrome & Minimal**: Focus on content and workflow rather than unnecessary decoration.

## 🚀 Key Features

### 🏢 Academy Admin Hub
- **Student Management**: Seamless onboarding, active/inactive/alumni tracking, and progression notes.
- **Batch Orchestration**: Dynamic batch creation, instructor assignment, and capacity limits.
- **Smart Attendance**: Real-time attendance tracking with interactive visual graphs.
- **Financial Engine**: Automated fee generation, receipt creation, overdue detection, and real-time revenue analytics.
- **Communication Center**: Broadcast announcements directly to specific batches.
- **Event Management**: Organize showcases, track RSVPs, and maintain post-event photo galleries.

### 👪 Parent Portal
- **Secure Access**: A dedicated, isolated portal for parents to monitor their child's dance journey.
- **Self-Service Registration**: Beautiful onboarding flow for new student enrollments.
- **Live Attendance**: Parents can track classes attended vs. missed.
- **Frictionless Payments**: Integrated Razorpay gateway for 1-click fee payments.

## 🛠 Tech Stack

- **Framework**: [Next.js 14](https://nextjs.org/) (App Router, Server Actions)
- **Styling**: [Tailwind CSS v4](https://tailwindcss.com/) + [Framer Motion](https://www.framer.com/motion/)
- **Database & Auth**: [Supabase](https://supabase.com/) (PostgreSQL + RLS)
- **Payments**: Razorpay
- **Icons**: [Lucide React](https://lucide.dev/)
- **Validation**: Zod

## 🛡️ Enterprise Security

1. **Row Level Security (RLS)**: Enforced directly in PostgreSQL to perfectly isolate tenant (`academy_id`) data. Cross-tenant leakage is strictly prevented at the database level.
2. **Server Actions**: Secured via centralized `lib/supabase/server.ts` checking active JWT sessions and roles.
3. **Webhook Verification**: Razorpay webhooks are heavily verified via HMAC SHA256 signatures to prevent fraudulent payment state updates.

## ⚙️ Getting Started

### 1. Clone the repository
```bash
git clone https://github.com/KumarAditya1729/DIL.git
cd DIL
```

### 2. Install dependencies
```bash
npm install
```

### 3. Environment Variables
Create a `.env.local` file based on the provided `.env.example`:
```env
NEXT_PUBLIC_SUPABASE_URL=your-project-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

RAZORPAY_KEY_ID=your-razorpay-key
RAZORPAY_KEY_SECRET=your-razorpay-secret
RAZORPAY_WEBHOOK_SECRET=your-webhook-secret
```

### 4. Database Provisioning
Execute `supabase/schema.sql` and `supabase/seed.sql` in your Supabase SQL Editor to instantly generate all SaaS tables, RLS policies, and sample mock data.

### 5. Run the local development server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) to view the Admin application. Open [http://localhost:3000/parent/login](http://localhost:3000/parent/login) to view the Parent Portal.

## 🏗️ Folder Architecture

```text
├── app/
│   ├── actions/          # Next.js Server Actions (Auth, CRUD, DB interactions)
│   ├── api/              # Route handlers (Razorpay Webhooks)
│   ├── dashboard/        # Admin Application (Students, Fees, Reports)
│   ├── parent/           # Isolated Parent Portal
│   ├── onboarding/       # Multi-tenant academy provisioning flow
│   └── layout.tsx        # Root layout with global providers
├── components/           # Reusable UI components (Sidebar, TopNav, Charts)
├── lib/                  # Utilities (Supabase SSR, PDF generators, wrappers)
├── supabase/             # Database schema, RLS policies, and seed data
└── public/               # Logos, PWA manifests, static assets
```

## 📝 License
Proprietary software. All rights reserved.

# Rhythm & Soul SaaS: Dance Academy Operating System

A robust, enterprise-grade, multi-tenant SaaS platform built for Dance Academies to manage students, batches, attendance, billing, and events. 

## 🚀 Tech Stack

- **Framework**: [Next.js 14 App Router](https://nextjs.org/)
- **Styling**: Tailwind CSS v4
- **Database & Auth**: [Supabase](https://supabase.com/) (PostgreSQL + RLS)
- **Payments**: Razorpay Integration
- **Components**: Native responsive components (Lucide icons)
- **Forms & Validation**: Zod + React Hook Form + Server Actions

## 🏗️ Folder Architecture

```
├── app/
│   ├── actions/          # Next.js Server Actions (Auth, CRUD)
│   ├── api/              # Route handlers (Webhooks, External APIs)
│   ├── dashboard/        # Main tenant application (Students, Fees, Reports)
│   ├── superadmin/       # SaaS platform owner dashboard
│   ├── onboarding/       # Multi-tenant provisioning flow
│   └── layout.tsx        # Root layout with Providers & Command Palette
├── components/           # Reusable UI components (Sidebar, TopNav)
├── lib/                  # Utilities (Supabase SSR, PDF gen, formatters)
├── supabase/             # Database schema, RLS policies, migrations
└── public/               # PWA manifests, icons, static assets
```

## 🛡️ Enterprise Security Features

1. **Row Level Security (RLS)**: Enforced directly in PostgreSQL to isolate tenant (`academy_id`) data. Cross-tenant leakage is strictly prevented at the database level.
2. **Server Actions**: Secured via `lib/supabase/server.ts` checking active JWT sessions.
3. **Webhooks**: Razorpay webhooks verified via HMAC SHA256 signatures.

## ⚙️ Setup & Deployment

1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Environment Variables**
   Create a `.env.local` file:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=your-project-url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
   RAZORPAY_WEBHOOK_SECRET=your-webhook-secret
   ```

3. **Database Provisioning**
   Execute `supabase/schema.sql` in your Supabase SQL Editor to generate all SaaS tables and RLS policies.

4. **Run Locally**
   ```bash
   npm run dev
   ```

## 🚢 CI/CD Pipeline

The platform uses GitHub Actions (`.github/workflows/production.yml`) to automatically enforce:
- Type checking (`tsc --noEmit`)
- Linting
- npm audit security checks
- Vercel Preview Deployments (on PR)
- Vercel Production Deployments (on merge to main)

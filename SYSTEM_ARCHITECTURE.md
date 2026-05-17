# System Architecture

## Overview
Rhythm & Soul SaaS is an enterprise-grade, multi-tenant B2B platform designed for dance academies. It employs a modern Next.js App Router architecture integrated with Supabase for backend-as-a-service (BaaS) and PostgreSQL for robust relational data handling.

## Core Tech Stack
* **Frontend**: Next.js 14, React 18, Tailwind CSS v4, Lucide Icons.
* **Backend**: Next.js Server Actions, Route Handlers (Edge/Node).
* **Database**: PostgreSQL (via Supabase).
* **Authentication**: Supabase Auth (SSR via HTTP-only cookies).
* **Storage**: Supabase Storage Buckets.
* **Payments**: Razorpay.
* **Deployment**: Vercel (Frontend/API), Supabase Cloud (DB/Auth).

## Tenancy Model
We use **Logical Database Segregation** (Row Level Security).
Every core table contains an `academy_id` column.
PostgreSQL RLS policies mathematically restrict queries so users can only read, update, or delete rows where the `academy_id` matches their verified session token.

### Request Flow
1. **Client** requests a page (`/dashboard/students`).
2. **Next.js Middleware** validates the JWT session via `@supabase/ssr`. Unauthenticated requests redirect to `/login`.
3. **Server Component** fetches data natively or calls a **Server Action**.
4. **Supabase Client** applies RLS automatically using the user's secure token.
5. **PostgreSQL** returns only the tenant's isolated data.
6. **Next.js** renders the UI and streams it to the client.

## Folder Structure
* `app/(marketing)`: Landing page, Pricing. Publicly cacheable.
* `app/dashboard/`: Core SaaS application. Protected by middleware.
* `app/superadmin/`: Platform owner analytics. Protected by RBAC.
* `app/actions/`: Reusable server actions for forms.
* `app/api/webhooks/`: Razorpay and external event handlers.
* `lib/`: Configuration, wrappers (Supabase clients), and utilities (PDF gen).

## Automation (Cron Jobs)
Scheduled tasks are executed via Vercel Cron targeting `/api/cron/*` endpoints. These handles:
* Fee reminder dispatches.
* Trial expiration checks.
* Automated database backups.

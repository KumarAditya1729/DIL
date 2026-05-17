# Launch Readiness Checklist

## 1. Environment & Infrastructure
- [ ] Vercel Project linked to GitHub `main` branch.
- [ ] Supabase production project provisioned.
- [ ] PostgreSQL Schema (`supabase/schema.sql`) executed in Supabase.
- [ ] Database Seed (`supabase/seed.sql`) executed for initial Super Admin / Demo Academy.
- [ ] Custom Domains configured in Vercel (`www.danceapp.io`, `app.danceapp.io`).
- [ ] SSL Certificates provisioned automatically by Vercel.

## 2. Environment Variables (Vercel settings)
- [ ] `NEXT_PUBLIC_SUPABASE_URL` (Production)
- [ ] `NEXT_PUBLIC_SUPABASE_ANON_KEY` (Production)
- [ ] `RAZORPAY_WEBHOOK_SECRET` (For live billing events)
- [ ] `CRON_SECRET` (For triggering `/api/cron/*` endpoints)
- [ ] `NODE_ENV` set to `production`

## 3. Security & Compliance
- [ ] All Row Level Security (RLS) policies verified active in Supabase.
- [ ] No `public` buckets available in Supabase Storage without strict policies.
- [ ] CORS policies verified if separating backend/frontend.
- [ ] GitHub Actions configured to block PRs failing `npm audit` or TypeScript checks.

## 4. Performance & UX
- [ ] Mobile PWA manifest verified (Lighthouse audit > 90 on PWA).
- [ ] Supabase indices (`idx_students_academy`, etc.) verified for tenant query speeds.
- [ ] Error boundaries properly intercepting 500s instead of crashing.
- [ ] Custom `toast` fallback tested.

## 5. Automation
- [ ] Vercel Cron configured via `vercel.json` to hit `/api/cron/reminders`.
- [ ] Razorpay Webhooks linked to `https://app.danceapp.io/api/webhooks/razorpay`.

# Deployment Guide for Rhythm & Soul Dance Academy System

This application is built with the Next.js App Router, Tailwind CSS v4, and Supabase. Follow these steps to deploy to Vercel and set up your production database.

## 1. Supabase Setup

1. Create a new project on [Supabase](https://supabase.com/).
2. Once provisioned, navigate to the **SQL Editor** in your Supabase dashboard.
3. Copy the contents of `/supabase/schema.sql` and run the script to create all necessary tables, indexes, and relationships.
4. Go to **Authentication -> Policies** and configure RLS (Row Level Security) if you want strict multi-tenant data access.
5. In **Authentication -> Providers**, ensure Email/Password login is enabled.

## 2. Environment Variables

Create a `.env.local` file (or add these to Vercel's Environment Variables panel):

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://<YOUR_PROJECT_REF>.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<YOUR_ANON_KEY>
```

*(Note: During local development without internet, the app will bypass auth. Add valid keys for production to enforce security).*

## 3. Deployment to Vercel

1. Push this repository to GitHub/GitLab/Bitbucket.
2. Log in to [Vercel](https://vercel.com/) and click **Add New -> Project**.
3. Import your repository.
4. Set the **Framework Preset** to Next.js.
5. In the **Environment Variables** section, paste your Supabase variables.
6. Click **Deploy**.

Vercel will automatically detect the build scripts (`npm run build`) and deploy your application globally.

## 4. Post-Deployment

- **Progressive Web App (PWA):** The `manifest.json` is configured. Simply visit the site on Safari (iOS) or Chrome (Android) and select "Add to Home Screen" to install it as an app.
- **Initial Admin:** Sign up your first user via Supabase dashboard (Auth -> Users) and manually set their role to `admin` in the `profiles` table to bootstrap access.

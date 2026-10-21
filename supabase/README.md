# EveryGyan Supabase Database Architecture & Setup

This directory contains the production database architecture, Row-Level Security (RLS) policies, and triggers for **EveryGyan**.

---

## 1. Quick Setup in Supabase Dashboard

1. **Open Supabase Console**: Navigate to your Supabase project at [https://supabase.com/dashboard](https://supabase.com/dashboard).
2. **Access SQL Editor**: Click on **SQL Editor** from the left navigation sidebar.
3. **Run Schema Script**:
   - Open [`supabase/schema.sql`](./schema.sql).
   - Copy the entire SQL content and paste it into a new query tab in the Supabase SQL Editor.
   - Click **Run** (or `Ctrl + Enter` / `Cmd + Enter`).
4. **Verify Tables**:
   Navigate to the **Table Editor** to confirm all 7 tables have been created:
   - `profiles`
   - `posts`
   - `comments`
   - `bookmarks`
   - `subscribers`
   - `newsletters`
   - `api_keys`

---

## 2. Promoting an Account to Administrator

Whenever a user registers via Email/Password or Google OAuth, the `on_auth_user_created` trigger automatically provisions a corresponding row in `public.profiles` with `role = 'user'`.

To elevate your account to **Super Administrator**:

```sql
-- Replace 'your_email@example.com' with your actual account email
UPDATE public.profiles
SET role = 'admin'
WHERE email = 'your_email@example.com';
```

Verify your role:
```sql
SELECT id, email, full_name, role
FROM public.profiles
WHERE email = 'your_email@example.com';
```

Once updated, `public.is_admin()` evaluates to `TRUE`, granting full administrative access to `/admin`, drafts, post authoring, newsletter scheduling, and API key generation.

---

## 3. Environment Variables Configuration

Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```

Set your Supabase project credentials (retrieved from **Project Settings > API**):
```ini
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

> [!NOTE]
> The EveryGyan application features a graceful fallback mock engine. If these keys are left empty during initial development, the client runs in offline test mode seamlessly.

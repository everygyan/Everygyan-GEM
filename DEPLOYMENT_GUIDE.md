# EveryGyan Production Deployment & Continuous Integration Guide

This guide details how to deploy **EveryGyan** to **Hostinger** with automatic CI/CD on every GitHub `main` push, configure Supabase Edge Functions, and connect n8n automation pipelines.

---

## Architecture Overview

```
[ Git Push to 'main' ]
         │
         ▼
[ GitHub Actions CI Runner ]
  ├── 1. npm ci (Clean Dependency Install)
  ├── 2. npm test -- --run (15 Suites / 55+ Unit Tests)
  ├── 3. npm run build (Vite Bundler + Manual Chunks + .htaccess)
  └── 4. FTP-Deploy-Action (Sync ./dist/ -> Hostinger public_html)
         │
         ▼
[ Hostinger Apache Web Server ] ───> Global Readers (<100ms TTFB)
         │
         ├── REST / RLS Queries ───> [ Supabase PostgreSQL & Auth ]
         └── Webhook Ingest ───────> [ Supabase Edge Functions / n8n ]
```

---

## Option A: GitHub Actions FTP Continuous Deployment (Recommended)

This approach works on **ALL Hostinger hosting plans** (Single, Premium, Business, Cloud, and WordPress hosting) without needing SSH or root access.

### Step 1: Obtain Hostinger FTP Credentials

1. Log into your [Hostinger hPanel](https://hpanel.hostinger.com).
2. Go to **Websites** &rarr; Select your EveryGyan domain &rarr; Click **Manage**.
3. In the search bar or left sidebar, navigate to **Files &rarr; FTP Accounts**.
4. You will see:
   - **FTP Host / IP**: (e.g. `ftp.yourdomain.com` or `185.xxx.xxx.xxx`)
   - **FTP Username**: (e.g. `u123456789`)
   - **FTP Password**: (Click *Change Password* if you do not remember it)
   - **Port**: `21`

---

### Step 2: Add GitHub Repository Secrets

1. Open your repository on GitHub: [`https://github.com/everygyan/Everygyan-GEM`](https://github.com/everygyan/Everygyan-GEM).
2. Click **Settings** (top tab) &rarr; **Secrets and variables** &rarr; **Actions**.
3. Under **Repository secrets**, click **New repository secret** and add the following 5 secrets:

| Secret Name | Value Example | Description |
| :--- | :--- | :--- |
| `FTP_SERVER` | `ftp.everygyan.com` or `185.xxx.xxx.xxx` | Your Hostinger FTP Host IP |
| `FTP_USERNAME` | `u123456789` | Your Hostinger FTP Account Username |
| `FTP_PASSWORD` | `YourStrongFtpPassword!` | Your Hostinger FTP Account Password |
| `VITE_SUPABASE_URL` | `https://xxxxxx.supabase.co` | Your Supabase Project API URL |
| `VITE_SUPABASE_ANON_KEY` | `eyJhbGciOi...` | Your Supabase Public Anon Key |
| `FTP_SERVER_DIR` *(Optional)* | `public_html/` | Target folder (defaults to `public_html/`) |

---

### Step 3: Trigger Automated Deployment

1. Make any change or commit and push to branch `main`:
   ```bash
   git push origin main
   ```
2. Navigate to the **Actions** tab in your GitHub repository.
3. You will see the **Deploy EveryGyan to Hostinger** workflow run:
   - Sets up Node 20
   - Runs automated test suite
   - Builds optimized production assets (`/dist`)
   - Syncs all HTML, CSS, JS, images, and `.htaccess` directly into Hostinger's `public_html` directory.
4. Your website is live!

---

## Option B: Hostinger hPanel Git / Node.js Web App (Alternative)

If you are using a Hostinger Cloud or VPS plan with Git integration enabled:

1. In hPanel, go to **Advanced &rarr; Git**.
2. Paste your repository URL: `https://github.com/everygyan/Everygyan-GEM.git`.
3. Set branch to: `main`.
4. Set install directory to: `public_html`.
5. Under Webhook, copy the Hostinger Webhook URL and paste it into GitHub:
   - GitHub Repo &rarr; **Settings** &rarr; **Webhooks** &rarr; **Add webhook**.
   - Paste URL, select `application/json`, and choose "Just the push event".

---

## SPA Routing & Hostinger `.htaccess` Setup

EveryGyan uses client-side routing via React Router. To ensure that refreshing subpages (like `/blog`, `/travel`, or `/admin`) does not produce a `404 Not Found` error, the project includes [`public/.htaccess`](file:///C:/Users/Devansh/.gemini/antigravity/scratch/everygyan/public/.htaccess).

Vite automatically copies this file into the root of `dist/` during build time:

```apache
<IfModule mod_rewrite.c>
  RewriteEngine On
  RewriteBase /
  RewriteRule ^index\.html$ - [L]
  RewriteCond %{REQUEST_FILENAME} !-f
  RewriteCond %{REQUEST_FILENAME} !-d
  RewriteCond %{REQUEST_FILENAME} !-l
  RewriteRule . /index.html [L]
</IfModule>
```

---

## Deploying Supabase Edge Functions

### 1. Install Supabase CLI
```bash
npm install -g supabase
```

### 2. Login to Supabase
```bash
npx supabase login
```

### 3. Link Project
```bash
npx supabase link --project-ref <YOUR-PROJECT-ID>
```

### 4. Set Function Secrets
Set your n8n authentication secret and email provider keys:
```bash
npx supabase secrets set N8N_INGEST_SECRET="everygyan_secure_token_abc123"
npx supabase secrets set RESEND_API_KEY="re_123456789"
```

### 5. Deploy Functions
```bash
# Deploy autonomous article ingest webhook
npx supabase functions deploy n8n-ingest --no-verify-jwt

# Deploy weekly newsletter dispatcher
npx supabase functions deploy send-newsletter
```

---

## Connecting n8n Autonomous Workflow

1. Navigate to `/admin/integrations` inside the EveryGyan Admin Command Center.
2. Click **"Copy Sample n8n Workflow"**.
3. Open your n8n instance &rarr; Click **"Import from Clipboard"**.
4. In the HTTP Request node:
   - Set URL: `https://<YOUR-PROJECT-REF>.supabase.co/functions/v1/n8n-ingest`
   - Set Header `x-api-key`: Your secret value from `N8N_INGEST_SECRET`.
5. Activate the workflow!

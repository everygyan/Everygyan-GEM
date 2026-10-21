# Project Context: EveryGyan

## 1. Project Identity
- **Name:** EveryGyan
- **Pillars:**
  1. **Blog:** Modern engineering, thoughts, architecture, and technology reviews.
  2. **Learning:** Interactive and progressive learning roadmaps, tutorials, and practical developer tracks.
  3. **Travel:** Destination itineraries, travel guides, exploration logs, and cultural insights.

## 2. Core Architecture & Tech Stack
- **Client Layer:**
  - React 19 + TypeScript + Vite.
  - Tailwind CSS (v4) with high-performance utility compilation.
  - Client-side navigation via `react-router-dom`.
  - Utility toolkit: `clsx`, `tailwind-merge`, `lucide-react`, `date-fns`.
  - Markdown engine: `react-markdown` + `remark-gfm` for rendering rich posts and guides.
- **Backend-as-a-Service (Supabase):**
  - **Auth:** Managed user authentication, sessions, and role management.
  - **Postgres Database:** High-reliability SQL database with strict Row Level Security (RLS).
  - **Storage:** S3-compatible buckets for user uploads, media, and article imagery.
  - **Edge Functions:** Serverless compute for webhooks, external integrations, and heavy transformations.
- **Testing:**
  - `vitest` with `@testing-library/react` and `jsdom` for fast unit and component verification.

## 3. Hosting & Deployment Strategy
- **Target:** Hostinger Web Hosting (Static / SPA mode).
- **Deployment Pipeline:** GitHub Actions triggering automated build (`npm run build`) and deploying `dist/` directly via FTP / rsync / Git Webhook.
- **SPA Routing Support:**
  - Apache `mod_rewrite` rules are maintained in `public/.htaccess`.
  - Vite automatically copies this into `dist/.htaccess` upon build.
  - Handles client-side route refreshes (e.g. `/blog/post-slug`, `/learning/track-1`) gracefully without 404 HTTP errors.

## 4. Engineering Standards & Design System
- **TypeScript:** Strict type checks enabled across all configs (`strict: true`, no implicit any).
- **Directory Conventions:**
  - `src/components/`: Modular, reusable presentation UI elements.
  - `src/pages/`: Page views mapped to application routes.
  - `src/lib/`: Library singletons (`supabase.ts`), utility helpers (`utils.ts`).
  - `src/hooks/`: Reusable React hooks.
  - `src/types/`: Shared interfaces, schemas, and data structures.
  - `src/test/`: Test setup, test runners, and helpers.
- **Breakpoints (Mobile-First):**
  - Mobile: `< 768px` (default)
  - Tablet: `768px - 1024px` (`md:`)
  - Desktop: `> 1024px` (`lg:`, `xl:`)
- **Theming:** Seamless dark/light mode toggle and adaptive color tokens.

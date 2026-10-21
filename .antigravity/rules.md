# EveryGyan Architecture & Coding Rules

## 1. Project Overview
- **Project Name:** EveryGyan
- **Vision:** High-performance unified portal offering deep knowledge across three core pillars:
  - **Blog:** Tech insights, architectural deep dives, editorial opinions.
  - **Learning:** Structured tutorials, tracks, and hands-on developer guides.
  - **Travel:** Destination guides, travel stories, and cultural discovery.

## 2. Tech Stack
- **Frontend Framework:** React 19 (SPA) with TypeScript
- **Build Tool & Bundler:** Vite
- **Styling:** Tailwind CSS (v4) with mobile-first responsive utilities
- **State & Routing:** `react-router-dom` (client-side routing)
- **Backend & Database:** Supabase
  - **Authentication:** Supabase Auth (Email magic link, OAuth, JWT sessions)
  - **Database:** Supabase PostgreSQL with Row Level Security (RLS)
  - **Storage:** Supabase Storage for media, avatars, and cover images
  - **Compute:** Supabase Edge Functions (Deno/TypeScript) for background & secure API jobs
- **Icons & UI:** `lucide-react`, `clsx`, `tailwind-merge`
- **Markdown & Content:** `react-markdown`, `remark-gfm`
- **Date Handling:** `date-fns`
- **Testing:** `vitest` + `@testing-library/react` + `jsdom`

## 3. Hosting & Deployment Target
- **Platform:** Hostinger Static / SPA deployment via automated GitHub Actions CI/CD.
- **Artifact:** Standard Vite production build output in `dist/`.
- **Routing Engine:** Apache HTTP Server with `mod_rewrite`.
  - Configured in `public/.htaccess` which is copied cleanly into `dist/.htaccess` during build.
  - Rewrites all deep routes (e.g., `/blog/my-post`, `/learning`, `/admin`) back to `/index.html` to prevent 404s on page refresh.

## 4. Coding & Architecture Standards
- **Strict TypeScript:**
  - `strict: true` in tsconfig.
  - Explicit typing for props, state, API payloads, and Supabase database schemas.
  - No `any` type escapes without justification.
- **Directory Structure:**
  - `src/components/`: Reusable, atomic UI components (Navbar, Footer, Card, Modal, etc.).
  - `src/pages/`: Route-level container components (Home, Blog, Learning, Travel, etc.).
  - `src/lib/`: External service clients, helpers (e.g., `supabase.ts`, `utils.ts`).
  - `src/hooks/`: Custom React hooks (e.g., `useAuth`, `useTheme`, `useArticles`).
  - `src/types/`: Global and domain TypeScript interfaces and type definitions.
  - `src/test/`: Unit and integration test configurations and mock setups.
- **Responsive Design (Mobile-First):**
  - **Mobile:** `< 768px` (base styling default)
  - **Tablet:** `768px – 1024px` (`md:` prefix)
  - **Desktop:** `> 1024px` (`lg:` and `xl:` prefix)
- **Theme Support:**
  - First-class Light & Dark theme support using Tailwind's `dark:` variant and CSS custom variables.
- **Security & Integrity:**
  - Never commit secret API keys or service role keys to client code or source control.
  - Restrict Supabase anonymous keys to RLS-enforced queries only.

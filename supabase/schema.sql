-- ==============================================================================
-- EveryGyan Production Database Schema & Security Policies (Phase 2)
-- Architecture: PostgreSQL + Supabase Auth + Row-Level Security (RLS)
-- Idempotent Migration: Safe to run repeatedly in Supabase SQL Editor
-- ==============================================================================

-- ==============================================================================
-- 1. EXTENSIONS
-- ==============================================================================
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ==============================================================================
-- 2. CORE TABLES (Created first to satisfy foreign keys & function dependencies)
-- ==============================================================================

-- Table 1: PROFILES (User Profiles linked to auth.users)
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  full_name TEXT,
  avatar_url TEXT,
  role TEXT NOT NULL DEFAULT 'user' CHECK (role IN ('user', 'admin')),
  bio TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Table 2: POSTS (Pillars: Blog, Learning, Travel)
CREATE TABLE IF NOT EXISTS public.posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  excerpt TEXT,
  content TEXT NOT NULL,
  cover_image TEXT,
  category TEXT NOT NULL CHECK (category IN ('blog', 'learning', 'travel')),
  tags TEXT[] NOT NULL DEFAULT '{}',
  reading_time_minutes INT NOT NULL DEFAULT 5,
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'archived')),
  featured BOOLEAN NOT NULL DEFAULT FALSE,
  views_count INT NOT NULL DEFAULT 0,
  author_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  published_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Table 3: COMMENTS (Threaded discussion per post)
CREATE TABLE IF NOT EXISTS public.comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id UUID NOT NULL REFERENCES public.posts(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  parent_id UUID REFERENCES public.comments(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'approved' CHECK (status IN ('pending', 'approved', 'spam')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Table 4: BOOKMARKS (User Saved Articles)
CREATE TABLE IF NOT EXISTS public.bookmarks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  post_id UUID NOT NULL REFERENCES public.posts(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT unique_user_post_bookmark UNIQUE (user_id, post_id)
);

-- Table 5: SUBSCRIBERS (Newsletter Audience)
CREATE TABLE IF NOT EXISTS public.subscribers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT NOT NULL UNIQUE,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'unsubscribed')),
  preferences JSONB NOT NULL DEFAULT '{"blog": true, "learning": true, "travel": true}'::jsonb,
  source TEXT NOT NULL DEFAULT 'website',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Table 6: NEWSLETTERS (Weekly Letters & Announcement Editions)
CREATE TABLE IF NOT EXISTS public.newsletters (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  subject TEXT NOT NULL,
  preview_text TEXT,
  content_html TEXT,
  content_markdown TEXT,
  type TEXT NOT NULL DEFAULT 'weekly_letter' CHECK (type IN ('weekly_letter', 'announcement')),
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'scheduled', 'sent')),
  sent_count INT NOT NULL DEFAULT 0,
  sent_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Table 7: API_KEYS (Secure Automation & n8n Integrations)
CREATE TABLE IF NOT EXISTS public.api_keys (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  key_hash TEXT NOT NULL UNIQUE,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  last_used_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ==============================================================================
-- 3. INDEXES FOR HIGH-PERFORMANCE QUERYING
-- ==============================================================================
CREATE INDEX IF NOT EXISTS idx_posts_status_published ON public.posts(status) WHERE status = 'published';
CREATE INDEX IF NOT EXISTS idx_posts_category ON public.posts(category);
CREATE INDEX IF NOT EXISTS idx_posts_slug ON public.posts(slug);
CREATE INDEX IF NOT EXISTS idx_posts_tags ON public.posts USING GIN (tags);
CREATE INDEX IF NOT EXISTS idx_posts_metadata ON public.posts USING GIN (metadata);
CREATE INDEX IF NOT EXISTS idx_comments_post_id ON public.comments(post_id);
CREATE INDEX IF NOT EXISTS idx_bookmarks_user_id ON public.bookmarks(user_id);
CREATE INDEX IF NOT EXISTS idx_subscribers_email ON public.subscribers(email);
CREATE INDEX IF NOT EXISTS idx_newsletters_status ON public.newsletters(status);

-- ==============================================================================
-- 4. FUNCTIONS & TRIGGERS
-- ==============================================================================

-- Function to check if the executing user has the 'admin' role
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
STABLE
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1
    FROM public.profiles
    WHERE id = auth.uid()
      AND role = 'admin'
  );
END;
$$;

-- Function to automatically set updated_at on record changes
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

-- Trigger to update updated_at on posts
DROP TRIGGER IF EXISTS trg_posts_updated_at ON public.posts;
CREATE TRIGGER trg_posts_updated_at
  BEFORE UPDATE ON public.posts
  FOR EACH ROW
  EXECUTE FUNCTION public.set_updated_at();

-- Trigger Function: Automatic Profile Creation on auth.users Sign Up
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, avatar_url, role)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', SPLIT_PART(NEW.email, '@', 1)),
    COALESCE(NEW.raw_user_meta_data->>'avatar_url', NULL),
    'user'
  )
  ON CONFLICT (id) DO UPDATE
  SET email = EXCLUDED.email,
      full_name = COALESCE(EXCLUDED.full_name, public.profiles.full_name),
      avatar_url = COALESCE(EXCLUDED.avatar_url, public.profiles.avatar_url);
  RETURN NEW;
END;
$$;

-- Bind Trigger to auth.users
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- Helper Function to increment post view count securely
CREATE OR REPLACE FUNCTION public.increment_post_view(post_slug TEXT)
RETURNS VOID
LANGUAGE sql
SECURITY DEFINER
AS $$
  UPDATE public.posts
  SET views_count = views_count + 1
  WHERE slug = post_slug;
$$;

-- ==============================================================================
-- 5. ROW-LEVEL SECURITY (RLS) POLICIES
-- ==============================================================================

-- Enable RLS across all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bookmarks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscribers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.newsletters ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.api_keys ENABLE ROW LEVEL SECURITY;

-- ------------------------------------------------------------------------------
-- PROFILES POLICIES
-- ------------------------------------------------------------------------------
DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON public.profiles;
CREATE POLICY "Public profiles are viewable by everyone"
  ON public.profiles FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
CREATE POLICY "Users can update their own profile"
  ON public.profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (
    auth.uid() = id AND
    (
      -- Prevent non-admins from self-promoting to admin
      role = (SELECT role FROM public.profiles WHERE id = auth.uid()) OR
      public.is_admin()
    )
  );

DROP POLICY IF EXISTS "Admins have full access to profiles" ON public.profiles;
CREATE POLICY "Admins have full access to profiles"
  ON public.profiles FOR ALL
  TO authenticated
  USING (public.is_admin());

-- ------------------------------------------------------------------------------
-- POSTS POLICIES
-- ------------------------------------------------------------------------------
DROP POLICY IF EXISTS "Published posts are viewable by anyone" ON public.posts;
CREATE POLICY "Published posts are viewable by anyone"
  ON public.posts FOR SELECT
  USING (status = 'published' OR public.is_admin());

DROP POLICY IF EXISTS "Admins can insert posts" ON public.posts;
CREATE POLICY "Admins can insert posts"
  ON public.posts FOR INSERT
  TO authenticated
  WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "Admins can update posts" ON public.posts;
CREATE POLICY "Admins can update posts"
  ON public.posts FOR UPDATE
  TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "Admins can delete posts" ON public.posts;
CREATE POLICY "Admins can delete posts"
  ON public.posts FOR DELETE
  TO authenticated
  USING (public.is_admin());

-- ------------------------------------------------------------------------------
-- COMMENTS POLICIES
-- ------------------------------------------------------------------------------
DROP POLICY IF EXISTS "Approved comments are viewable by anyone" ON public.comments;
CREATE POLICY "Approved comments are viewable by anyone"
  ON public.comments FOR SELECT
  USING (status = 'approved' OR public.is_admin() OR (auth.uid() IS NOT NULL AND auth.uid() = user_id));

DROP POLICY IF EXISTS "Authenticated users can insert their own comments" ON public.comments;
CREATE POLICY "Authenticated users can insert their own comments"
  ON public.comments FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update their own comments" ON public.comments;
CREATE POLICY "Users can update their own comments"
  ON public.comments FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id OR public.is_admin())
  WITH CHECK (auth.uid() = user_id OR public.is_admin());

DROP POLICY IF EXISTS "Users can delete their own comments" ON public.comments;
CREATE POLICY "Users can delete their own comments"
  ON public.comments FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id OR public.is_admin());

-- ------------------------------------------------------------------------------
-- BOOKMARKS POLICIES
-- ------------------------------------------------------------------------------
DROP POLICY IF EXISTS "Users can view their own bookmarks" ON public.bookmarks;
CREATE POLICY "Users can view their own bookmarks"
  ON public.bookmarks FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can create their own bookmarks" ON public.bookmarks;
CREATE POLICY "Users can create their own bookmarks"
  ON public.bookmarks FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete their own bookmarks" ON public.bookmarks;
CREATE POLICY "Users can delete their own bookmarks"
  ON public.bookmarks FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- ------------------------------------------------------------------------------
-- SUBSCRIBERS POLICIES
-- ------------------------------------------------------------------------------
DROP POLICY IF EXISTS "Anyone can subscribe" ON public.subscribers;
CREATE POLICY "Anyone can subscribe"
  ON public.subscribers FOR INSERT
  WITH CHECK (true);

DROP POLICY IF EXISTS "Users can view their own subscription" ON public.subscribers;
CREATE POLICY "Users can view their own subscription"
  ON public.subscribers FOR SELECT
  USING (
    (auth.jwt()->>'email' = email) OR
    public.is_admin()
  );

DROP POLICY IF EXISTS "Users can update their own subscription" ON public.subscribers;
CREATE POLICY "Users can update their own subscription"
  ON public.subscribers FOR UPDATE
  USING (
    (auth.jwt()->>'email' = email) OR
    public.is_admin()
  );

DROP POLICY IF EXISTS "Admins can delete subscribers" ON public.subscribers;
CREATE POLICY "Admins can delete subscribers"
  ON public.subscribers FOR DELETE
  TO authenticated
  USING (public.is_admin());

-- ------------------------------------------------------------------------------
-- NEWSLETTERS POLICIES
-- ------------------------------------------------------------------------------
DROP POLICY IF EXISTS "Anyone can view sent newsletters" ON public.newsletters;
CREATE POLICY "Anyone can view sent newsletters"
  ON public.newsletters FOR SELECT
  USING (status = 'sent' OR public.is_admin());

DROP POLICY IF EXISTS "Admins have full CRUD on newsletters" ON public.newsletters;
CREATE POLICY "Admins have full CRUD on newsletters"
  ON public.newsletters FOR ALL
  TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- ------------------------------------------------------------------------------
-- API KEYS POLICIES
-- ------------------------------------------------------------------------------
DROP POLICY IF EXISTS "Only admins can manage API keys" ON public.api_keys;
CREATE POLICY "Only admins can manage API keys"
  ON public.api_keys FOR ALL
  TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import {
  Sparkles,
  ArrowRight,
  Clock,
  Calendar,
  BookOpen,
  Compass,
  Mail,
  CheckCircle2,
  TrendingUp,
} from 'lucide-react'
import { Badge } from '../components/ui/Badge'
import { Button } from '../components/ui/Button'
import { Card } from '../components/ui/Card'
import { Input } from '../components/ui/Input'

interface Post {
  id: string
  title: string
  pillar: 'blog' | 'learning' | 'travel'
  excerpt: string
  author: {
    name: string
    avatar: string
    role: string
  }
  readTime: string
  date: string
  badgeText: string
  imagePlaceholder?: string
  slug: string
}

const ALL_POSTS: Post[] = [
  {
    id: '1',
    title: 'The Architectural Shift: Why We Replaced Microservices with Serverless Edge Functions',
    pillar: 'blog',
    excerpt:
      'How modern edge runtimes and distributed PostgreSQL databases enabled 95ms global p99 latencies without the operational complexity of Kubernetes fleets.',
    author: {
      name: 'Devansh K.',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80',
      role: 'Principal Architect',
    },
    readTime: '8 min read',
    date: 'Oct 21, 2026',
    badgeText: 'Architecture & Scalability',
    slug: 'architectural-shift-edge-functions',
  },
  {
    id: '2',
    title: 'React 19 Concurrent UI & Actions in Production',
    pillar: 'learning',
    excerpt:
      'A deep-dive tutorial into useActionState, useOptimistic, and zero-flicker transitions for resilient full-stack applications.',
    author: {
      name: 'Sarah Chen',
      avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=150&q=80',
      role: 'Senior Staff Engineer',
    },
    readTime: '12 min read',
    date: 'Oct 19, 2026',
    badgeText: 'Curriculum • 4 Modules',
    slug: 'react-19-production-actions',
  },
  {
    id: '3',
    title: 'Kyoto Off-The-Beaten-Path: Hidden Temples, Zen Gardens & Moss Forests',
    pillar: 'travel',
    excerpt:
      'A curated 7-day slow travel guide through Northern Higashiyama and Uji, steering clear of tourist crowded corridors.',
    author: {
      name: 'Kenji Sato',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80',
      role: 'Culture & Travel Fellow',
    },
    readTime: '6 min read',
    date: 'Oct 17, 2026',
    badgeText: '7-Day Itinerary',
    slug: 'kyoto-hidden-temples-guide',
  },
  {
    id: '4',
    title: 'Supabase PostgreSQL Security: Row Level Security (RLS) Without Latency Traps',
    pillar: 'blog',
    excerpt:
      'Avoiding the most notorious subquery pitfalls in RLS policies while keeping your multi-tenant SaaS ironclad.',
    author: {
      name: 'Devansh K.',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80',
      role: 'Principal Architect',
    },
    readTime: '7 min read',
    date: 'Oct 14, 2026',
    badgeText: 'Security & Database',
    slug: 'supabase-rls-performance-security',
  },
  {
    id: '5',
    title: 'Mastering TypeScript 6.0: Template Literals & Advanced Metaprogramming',
    pillar: 'learning',
    excerpt:
      'Build strictly-typed API client generators and compile-time state machine verifiers with modern TS language features.',
    author: {
      name: 'Elena Rostova',
      avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=150&q=80',
      role: 'Compiler Specialist',
    },
    readTime: '15 min read',
    date: 'Oct 10, 2026',
    badgeText: 'Interactive Workshop',
    slug: 'typescript-6-template-literals',
  },
  {
    id: '6',
    title: 'Arctic Expedition: Traversing Norway’s Lofoten Archipelago in Winter',
    pillar: 'travel',
    excerpt:
      'Essential gear, ferry connections, aurora borealis photography setups, and Arctic driving safety tips.',
    author: {
      name: 'Freja Lind',
      avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=150&q=80',
      role: 'Expedition Guide',
    },
    readTime: '9 min read',
    date: 'Oct 05, 2026',
    badgeText: 'Arctic Route & Gear',
    slug: 'lofoten-islands-winter-expedition',
  },
]

export const Home: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'all' | 'blog' | 'learning' | 'travel'>('all')
  const [newsletterEmail, setNewsletterEmail] = useState('')
  const [newsletterSubscribed, setNewsletterSubscribed] = useState(false)

  const featuredStory = ALL_POSTS[0]
  const spotlightLearning = ALL_POSTS[1]
  const spotlightTravel = ALL_POSTS[2]

  const filteredPosts =
    activeTab === 'all' ? ALL_POSTS : ALL_POSTS.filter((post) => post.pillar === activeTab)

  const handleNewsletterSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (newsletterEmail.trim()) {
      setNewsletterSubscribed(true)
    }
  }

  return (
    <div className="w-full">
      {/* 1. HERO BENTO SECTION */}
      <section className="mx-auto max-w-7xl px-4 py-8 sm:px-6 sm:py-12 lg:px-8">
        {/* Editorial Subheader */}
        <div className="mb-8 flex flex-col justify-between gap-4 md:flex-row md:items-end">
          <div>
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
              <Sparkles className="h-4 w-4" />
              <span>Neo-Editorial Platform</span>
            </div>
            <h1 className="mt-2 text-3xl font-extrabold tracking-tight text-foreground sm:text-4xl lg:text-5xl font-sans">
              Curated Knowledge for Curious Builders
            </h1>
            <p className="mt-2 text-base text-foreground-muted max-w-2xl font-sans">
              Discover engineering deep dives, hands-on learning roadmaps, and authentic global travel logs.
            </p>
          </div>
          <div className="flex items-center gap-2 text-xs font-medium text-foreground-muted">
            <span className="flex h-2 w-2 rounded-full bg-emerald-500" />
            <span>Updated Daily across 3 Pillars</span>
          </div>
        </div>

        {/* Bento Grid: 1 col (mobile), 2 col (tablet), 12-col asymmetric (desktop) */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-6">
          {/* Card 1: Featured Story (Primary Headline) */}
          <div className="col-span-1 md:col-span-2 lg:col-span-7 flex flex-col justify-between rounded-3xl border border-border bg-surface p-6 sm:p-8 shadow-xs hover:shadow-md transition-all">
            <div>
              <div className="flex items-center justify-between gap-2">
                <Badge variant="blog" size="md" dot>
                  Featured Story • Blog
                </Badge>
                <span className="text-xs text-foreground-muted flex items-center gap-1">
                  <Clock className="h-3.5 w-3.5" />
                  {featuredStory.readTime}
                </span>
              </div>

              <h2 className="mt-6 text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight text-foreground font-serif leading-snug">
                <Link to="/blog" className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">
                  {featuredStory.title}
                </Link>
              </h2>

              <p className="mt-4 text-base text-foreground-muted font-sans leading-relaxed">
                {featuredStory.excerpt}
              </p>
            </div>

            <div className="mt-8 pt-6 border-t border-border/80 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <img
                  src={featuredStory.author.avatar}
                  alt={featuredStory.author.name}
                  className="h-10 w-10 rounded-full object-cover border border-border"
                />
                <div>
                  <p className="text-sm font-bold text-foreground">{featuredStory.author.name}</p>
                  <p className="text-xs text-foreground-muted">{featuredStory.author.role}</p>
                </div>
              </div>
              <Link to="/blog">
                <Button variant="blog" size="sm" rightIcon={<ArrowRight className="h-4 w-4" />}>
                  Read Deep Dive
                </Button>
              </Link>
            </div>
          </div>

          {/* Secondary Spotlight Column (Stacked on Desktop) */}
          <div className="col-span-1 md:col-span-2 lg:col-span-5 flex flex-col gap-6">
            {/* Card 2: Learning Spotlight */}
            <div className="flex-1 rounded-3xl border border-border bg-surface p-6 shadow-xs hover:shadow-md transition-all flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between">
                  <Badge variant="learning" size="md" dot>
                    Learning Hub
                  </Badge>
                  <span className="text-xs text-foreground-muted flex items-center gap-1">
                    <BookOpen className="h-3.5 w-3.5 text-emerald-500" />
                    Interactive
                  </span>
                </div>
                <h3 className="mt-4 text-xl font-bold text-foreground font-serif leading-snug">
                  <Link to="/learning" className="hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors">
                    {spotlightLearning.title}
                  </Link>
                </h3>
                <p className="mt-2 text-sm text-foreground-muted font-sans line-clamp-2">
                  {spotlightLearning.excerpt}
                </p>
              </div>

              <div className="mt-6 flex items-center justify-between border-t border-border/80 pt-4">
                <div className="flex items-center gap-2 text-xs text-foreground-muted">
                  <Clock className="h-3.5 w-3.5" />
                  <span>{spotlightLearning.readTime}</span>
                </div>
                <Link to="/learning">
                  <Button variant="outline" size="sm" rightIcon={<ArrowRight className="h-3.5 w-3.5" />}>
                    Explore Track
                  </Button>
                </Link>
              </div>
            </div>

            {/* Card 3: Travel Spotlight */}
            <div className="flex-1 rounded-3xl border border-border bg-surface p-6 shadow-xs hover:shadow-md transition-all flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between">
                  <Badge variant="travel" size="md" dot>
                    Travel Logs
                  </Badge>
                  <span className="text-xs text-foreground-muted flex items-center gap-1">
                    <Compass className="h-3.5 w-3.5 text-amber-500" />
                    Itinerary
                  </span>
                </div>
                <h3 className="mt-4 text-xl font-bold text-foreground font-serif leading-snug">
                  <Link to="/travel" className="hover:text-amber-600 dark:hover:text-amber-400 transition-colors">
                    {spotlightTravel.title}
                  </Link>
                </h3>
                <p className="mt-2 text-sm text-foreground-muted font-sans line-clamp-2">
                  {spotlightTravel.excerpt}
                </p>
              </div>

              <div className="mt-6 flex items-center justify-between border-t border-border/80 pt-4">
                <div className="flex items-center gap-2 text-xs text-foreground-muted">
                  <Calendar className="h-3.5 w-3.5" />
                  <span>{spotlightTravel.date}</span>
                </div>
                <Link to="/travel">
                  <Button variant="outline" size="sm" rightIcon={<ArrowRight className="h-3.5 w-3.5" />}>
                    View Route
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. PILLAR FILTER TABS & ARTICLES FEED */}
      <section className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-4">
          <div>
            <h2 className="text-2xl font-bold tracking-tight text-foreground font-sans">
              Latest Publications & Releases
            </h2>
            <p className="text-sm text-foreground-muted">Filter by pillar or browse everything in sequence</p>
          </div>

          {/* Interactive Filter Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto rounded-2xl border border-border bg-surface p-1 shadow-2xs">
            {(
              [
                { id: 'all', label: 'All Stories', count: ALL_POSTS.length },
                { id: 'blog', label: 'Blog', count: 2 },
                { id: 'learning', label: 'Learning', count: 2 },
                { id: 'travel', label: 'Travel', count: 2 },
              ] as const
            ).map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-1.5 rounded-xl px-3.5 py-1.5 text-xs font-semibold transition-all cursor-pointer whitespace-nowrap ${
                  activeTab === tab.id
                    ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-xs'
                    : 'text-foreground-muted hover:text-foreground hover:bg-surface-subtle'
                }`}
              >
                <span>{tab.label}</span>
                <span
                  className={`rounded-full px-1.5 py-0.2 text-[10px] ${
                    activeTab === tab.id
                      ? 'bg-white/20 dark:bg-slate-900/20 text-white dark:text-slate-900'
                      : 'bg-surface-subtle text-foreground-muted'
                  }`}
                >
                  {tab.count}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Dynamic Articles Grid */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredPosts.map((post) => (
            <Card
              key={post.id}
              className="flex flex-col justify-between hover:-translate-y-1 hover:shadow-md transition-all duration-200"
            >
              <div className="p-6">
                <div className="flex items-center justify-between gap-2">
                  <Badge variant={post.pillar} size="sm">
                    {post.pillar}
                  </Badge>
                  <span className="text-xs text-foreground-muted flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    {post.readTime}
                  </span>
                </div>

                <h3 className="mt-4 text-xl font-bold text-foreground font-serif leading-snug line-clamp-2">
                  <Link to={`/${post.pillar}`} className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">
                    {post.title}
                  </Link>
                </h3>

                <p className="mt-2 text-sm text-foreground-muted font-sans line-clamp-3">
                  {post.excerpt}
                </p>
              </div>

              <div className="border-t border-border/80 p-6 pt-4 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <img
                    src={post.author.avatar}
                    alt={post.author.name}
                    className="h-7 w-7 rounded-full object-cover border border-border"
                  />
                  <div className="text-xs">
                    <p className="font-semibold text-foreground">{post.author.name}</p>
                    <p className="text-foreground-muted">{post.date}</p>
                  </div>
                </div>

                <Link
                  to={`/${post.pillar}`}
                  className="rounded-lg p-2 text-foreground-muted hover:bg-surface-subtle hover:text-foreground transition-colors"
                  aria-label={`Read ${post.title}`}
                >
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            </Card>
          ))}
        </div>
      </section>

      {/* 3. HIGH-CONVERSION "WEEKLY GYAN LETTER" SUBSCRIPTION BANNER */}
      <section id="newsletter" className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="relative overflow-hidden rounded-3xl border border-indigo-200/80 bg-gradient-to-br from-indigo-50 via-white to-amber-50/40 p-8 sm:p-12 dark:border-indigo-900/60 dark:from-slate-900 dark:via-slate-900 dark:to-indigo-950/40 shadow-sm">
          {/* Decorative Sparkle Glow */}
          <div className="pointer-events-none absolute -right-12 -top-12 h-64 w-64 rounded-full bg-indigo-500/10 blur-3xl" />
          <div className="pointer-events-none absolute -left-12 -bottom-12 h-64 w-64 rounded-full bg-amber-500/10 blur-3xl" />

          <div className="relative z-10 max-w-3xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 rounded-full border border-indigo-300/60 bg-white/80 px-3 py-1 text-xs font-bold uppercase tracking-wider text-indigo-700 shadow-2xs dark:border-indigo-700/60 dark:bg-indigo-950/80 dark:text-indigo-300">
              <Mail className="h-3.5 w-3.5" />
              <span>The Weekly Gyan Letter</span>
            </div>

            <h2 className="mt-4 text-3xl font-extrabold tracking-tight text-foreground sm:text-4xl font-serif">
              Curated Knowledge Delivered Every Sunday
            </h2>

            <p className="mt-3 text-base text-foreground-muted font-sans">
              Join 15,000+ senior developers, architects, and curious explorers. Every Sunday, we deliver 1 architectural deep dive, 1 hands-on tutorial, and 1 travel photo essay. Zero spam.
            </p>

            {newsletterSubscribed ? (
              <div className="mt-8 rounded-2xl border border-emerald-300 bg-emerald-50/80 p-6 text-emerald-800 dark:border-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-200 flex items-center justify-center gap-3">
                <CheckCircle2 className="h-6 w-6 text-emerald-600 dark:text-emerald-400 shrink-0" />
                <div className="text-left">
                  <p className="font-bold text-sm">Welcome aboard the Gyan Letter!</p>
                  <p className="text-xs">We sent a verification confirmation to your inbox. Check your email to confirm.</p>
                </div>
              </div>
            ) : (
              <form onSubmit={handleNewsletterSubmit} className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3 max-w-lg mx-auto">
                <Input
                  type="email"
                  placeholder="Enter your email address..."
                  value={newsletterEmail}
                  onChange={(e) => setNewsletterEmail(e.target.value)}
                  required
                  className="w-full bg-white dark:bg-slate-800 shadow-xs"
                />
                <Button type="submit" variant="blog" size="md" className="w-full sm:w-auto shrink-0 shadow-xs">
                  Subscribe Free
                </Button>
              </form>
            )}

            <div className="mt-6 flex flex-wrap items-center justify-center gap-6 text-xs text-foreground-muted">
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
                No ads or promotional sponsors
              </span>
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
                1-click unsubscribe anytime
              </span>
              <span className="flex items-center gap-1.5">
                <TrendingUp className="h-3.5 w-3.5 text-indigo-500" />
                15,400+ weekly readers
              </span>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}

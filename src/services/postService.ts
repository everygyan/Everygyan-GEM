import { supabase, isSupabaseConfigured } from '../lib/supabase'
import type { Post, PostFilterParams, PaginatedPosts, PillarType } from '../types'

export const FALLBACK_SEED_POSTS: Post[] = [
  {
    id: 'post-b1',
    slug: 'architectural-shift-edge-functions',
    title: 'The Architectural Shift: Why We Replaced Microservices with Serverless Edge Functions',
    excerpt:
      'How modern edge runtimes and distributed PostgreSQL databases enabled 95ms global p99 latencies without the operational complexity of Kubernetes fleets.',
    pillar: 'blog',
    tags: ['Architecture', 'Edge Computing', 'Supabase', 'DevOps'],
    author: {
      name: 'Devansh K.',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
      role: 'Principal Architect',
      bio: 'Leading distributed systems and web platform architecture at EveryGyan.',
    },
    publishedAt: '2026-10-21',
    readTime: '8 min read',
    views: 3420,
    coverImage: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=1200&q=80',
    featured: true,
    content: `
## The Distributed Dilemma

In early 2025, our microservices architecture spanned twelve standalone container services running across an orchestrated Kubernetes cluster. While separation of concerns was pristine on whiteboard diagrams, real-world operational costs were staggering.

Inter-service latency, serialization overhead, and network hop failures plagued our p99 response times.

> "Premature distribution is the root of modern infrastructure debt. When every function call crosses a network boundary, your code stops behaving like software and starts behaving like an erratic network."

### Latency Benchmark Comparison

Below is the observed latency across global request regions during our migration benchmark:

| Topology Architecture | p50 Latency (ms) | p95 Latency (ms) | p99 Latency (ms) | Cloud Cost ($/mo) |
| :--- | :--- | :--- | :--- | :--- |
| Kubernetes Cluster (Centralized US-East) | 145ms | 380ms | 820ms | $4,850 |
| Hybrid Regional Containers | 85ms | 210ms | 490ms | $3,200 |
| **Supabase Edge Functions (Global Runtimes)** | **18ms** | **52ms** | **94ms** | **$480** |

## Consolidating into Serverless Edge Compute

By colocating computation at CDN edge locations and routing write operations through connection-pooled PostgreSQL, we eliminated 80% of our network hops.

Here is how our edge authentication and payload verification middleware is authored:

\`\`\`typescript
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"

serve(async (req: Request) => {
  const authHeader = req.headers.get("Authorization")
  if (!authHeader) {
    return new Response(JSON.stringify({ error: "Unauthorized access token" }), {
      status: 401,
      headers: { "Content-Type": "application/json" }
    })
  }

  const supabase = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_ANON_KEY") ?? "",
    { global: { headers: { Authorization: authHeader } } }
  )

  const { data: { user }, error } = await supabase.auth.getUser()
  if (error || !user) {
    return new Response(JSON.stringify({ error: "Session invalid or expired" }), { status: 403 })
  }

  return new Response(JSON.stringify({ status: "ok", userId: user.id }), { status: 200 })
})
\`\`\`

### Key Architectural Lessons

1. **Keep Write Paths Simple**: Route write transactions directly to read-write primaries with transaction pooling.
2. **Cache Queries Aggressively**: Read-heavy queries should be cached with stale-while-revalidate headers.
3. **Minimize Cold Starts**: Lightweight Deno/V8 isolates execute within 5–15 milliseconds compared to container warmups.

![Architecture Topology Comparison](https://images.unsplash.com/photo-1558494949-ef010cbdcc31?auto=format&fit=crop&w=1200&q=80)

## Conclusion

Simplifying our platform not only saved thousands in monthly cloud compute bills, but eliminated 90% of on-call paging alarms.
`,
  },
  {
    id: 'post-b2',
    slug: 'supabase-rls-performance-security',
    title: 'Supabase PostgreSQL Security: Row Level Security (RLS) Without Latency Traps',
    excerpt:
      'Avoiding the most notorious subquery pitfalls in RLS policies while keeping your multi-tenant SaaS ironclad.',
    pillar: 'blog',
    tags: ['Security', 'PostgreSQL', 'Supabase', 'Database'],
    author: {
      name: 'Devansh K.',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
      role: 'Principal Architect',
    },
    publishedAt: '2026-10-18',
    readTime: '7 min read',
    views: 2190,
    coverImage: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&w=1200&q=80',
    content: `
## Why Row Level Security Matters

PostgreSQL Row Level Security (RLS) acts as a cryptographic fortress right at the storage layer. Unlike application-level authorization gates that can be bypassed by an erroneous backend query, RLS guarantees that queries only return rows authorized for the authenticated user context.

### The Indexing Pitfall

Consider this seemingly innocent policy:

\`\`\`sql
-- Anti-pattern: Unindexed correlated subquery
CREATE POLICY "Users can only read team workspaces"
ON workspaces
FOR SELECT
USING (
  id IN (
    SELECT workspace_id FROM team_members
    WHERE user_id = auth.uid()
  )
);
\`\`\`

When executing sequential scans across tables with hundreds of thousands of rows, evaluating this subquery per row multiplies latency exponentially.

### The Optimized Pattern

Wrap your security definitions using pre-computed JWT claims or index-backed foreign keys:

\`\`\`sql
-- Optimized: Index-backed membership filter
CREATE INDEX CONCURRENTLY idx_team_members_user_workspace 
ON team_members (user_id, workspace_id);

CREATE POLICY "Optimized workspace read access"
ON workspaces
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM team_members
    WHERE team_members.workspace_id = workspaces.id
      AND team_members.user_id = (SELECT auth.uid())
  )
);
\`\`\`

## Auditing Policy Execution

Always verify policies using \`EXPLAIN ANALYZE\` in your Supabase SQL editor to ensure index scans are utilized rather than costly sequential table scans.
`,
  },
  {
    id: 'post-l1',
    slug: 'react-19-production-actions',
    title: 'React 19 Concurrent UI & Actions in Production',
    excerpt:
      'A deep-dive tutorial into useActionState, useOptimistic, and zero-flicker transitions for resilient full-stack applications.',
    pillar: 'learning',
    tags: ['React 19', 'TypeScript', 'Frontend', 'Tutorial'],
    author: {
      name: 'Sarah Chen',
      avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=200&q=80',
      role: 'Senior Staff Engineer',
      bio: 'React core contributor and frontend systems educator.',
    },
    publishedAt: '2026-10-19',
    readTime: '12 min read',
    views: 4580,
    coverImage: 'https://images.unsplash.com/photo-1633356122544-f134324a6cee?auto=format&fit=crop&w=1200&q=80',
    featured: true,
    metadata: {
      difficulty: 'Intermediate',
      moduleNumber: 1,
      totalModules: 5,
      prerequisites: ['Basic React Hooks (useState, useEffect)', 'TypeScript fundamentals', 'Asynchronous JavaScript & Promises'],
      takeaways: [
        'Master useActionState for form handling without manual loading flags',
        'Implement instantaneous optimistic mutations with useOptimistic',
        'Prevent hydration mismatches with server transitions',
      ],
      estimatedHours: '2.5 Hours',
    },
    content: `
## Welcome to Module 1: Modern Actions & Transitions

React 19 introduces a fundamental paradigm shift: form actions and asynchronous transitions are now first-class language citizens. Gone are the days of orchestrating \`isLoading\`, \`error\`, and \`success\` states across three separate \`useState\` hooks.

### What You Will Build

In this lesson, you will build an optimistic task assignment panel that updates user interfaces immediately before server confirmation.

## Understanding useActionState

The \`useActionState\` hook abstracts form submission lifecycle into a unified state tuple.

\`\`\`typescript
import { useActionState } from 'react'

interface TaskState {
  tasks: string[]
  error: string | null
}

async function addTaskAction(previousState: TaskState, formData: FormData): Promise<TaskState> {
  const newTask = formData.get('taskName') as string
  if (!newTask || newTask.trim().length === 0) {
    return { ...previousState, error: 'Task title cannot be empty' }
  }

  // Simulated backend call
  await new Promise((resolve) => setTimeout(resolve, 600))
  return {
    tasks: [...previousState.tasks, newTask],
    error: null,
  }
}

export function TaskList() {
  const [state, formAction, isPending] = useActionState(addTaskAction, {
    tasks: ['Configure Vitest', 'Design UI Primitives'],
    error: null,
  })

  return (
    <form action={formAction} className="space-y-4">
      <input name="taskName" placeholder="Enter task name..." className="border p-2 rounded" />
      <button type="submit" disabled={isPending}>
        {isPending ? 'Saving...' : 'Add Task'}
      </button>
      {state.error && <p className="text-red-500">{state.error}</p>}
    </form>
  )
}
\`\`\`

## Zero-Flicker Optimistic Updates

With \`useOptimistic\`, state mutations reflect instantaneously on the screen. If the backend mutation fails, React cleanly rolls back the optimistic value.

### Step-by-Step Exercise

1. Fork the sandbox template provided in the resources tab.
2. Implement an optimistic like counter using \`useOptimistic\`.
3. Simulate a network drop by throwing an error and observe the automatic rollback.
`,
  },
  {
    id: 'post-l2',
    slug: 'typescript-6-template-literals',
    title: 'Mastering TypeScript 6.0: Template Literals & Advanced Metaprogramming',
    excerpt:
      'Build strictly-typed API client generators and compile-time state machine verifiers with modern TS language features.',
    pillar: 'learning',
    tags: ['TypeScript', 'Metaprogramming', 'Advanced Code'],
    author: {
      name: 'Elena Rostova',
      avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=200&q=80',
      role: 'Compiler Specialist',
    },
    publishedAt: '2026-10-12',
    readTime: '15 min read',
    views: 3820,
    coverImage: 'https://images.unsplash.com/photo-1516116211227-bbc0429f5f08?auto=format&fit=crop&w=1200&q=80',
    metadata: {
      difficulty: 'Advanced',
      moduleNumber: 2,
      totalModules: 5,
      prerequisites: ['TypeScript Generics', 'Keyof & Type Mapping', 'AST Concepts'],
      takeaways: [
        'Parse URL route strings into strictly typed path parameter records',
        'Construct validated state machine event handlers at compile-time',
        'Eliminate runtime schema validation overhead where types suffice',
      ],
      estimatedHours: '3.0 Hours',
    },
    content: `
## The Power of Template Literal Types

TypeScript's template literal types allow string manipulation and schema validation directly inside the compiler's type inference loop.

### Parsing REST Routes at Compile Time

Consider extracting all dynamic route parameters from a string path:

\`\`\`typescript
type ExtractRouteParams<T extends string> =
  T extends \`\${infer _Start}:\${infer Param}/\${infer Rest}\`
    ? { [K in Param | keyof ExtractRouteParams<\`/\${Rest}\`>]: string }
    : T extends \`\${infer _Start}:\${infer Param}\`
    ? { [K in Param]: string }
    : Record<string, never>

// Example Usage:
type BlogPostParams = ExtractRouteParams<"/posts/:category/:slug/comments/:commentId">
// Resulting type is strictly:
// { category: string; slug: string; commentId: string }
\`\`\`

## Compile-Time State Machine Constraints

By chaining recursive conditional types, you can enforce that state machines only permit legal state transitions, completely removing the possibility of runtime invalid states.
`,
  },
  {
    id: 'post-t1',
    slug: 'kyoto-hidden-temples-guide',
    title: 'Kyoto Off-The-Beaten-Path: Hidden Temples, Zen Gardens & Moss Forests',
    excerpt:
      'A curated 7-day slow travel guide through Northern Higashiyama and Uji, steering clear of tourist crowded corridors.',
    pillar: 'travel',
    tags: ['Japan', 'Kyoto', 'Slow Travel', 'Culture'],
    author: {
      name: 'Kenji Sato',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80',
      role: 'Culture & Travel Fellow',
      bio: 'Documenting centuries-old artisanal craft and slow travel routes across East Asia.',
    },
    publishedAt: '2026-10-17',
    readTime: '9 min read',
    views: 5120,
    coverImage: 'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?auto=format&fit=crop&w=1200&q=80',
    featured: true,
    metadata: {
      location: 'Kyoto, Japan',
      bestSeason: 'Autumn (Oct–Nov) or Spring (April)',
      budgetLevel: '$$$',
      duration: '7 Days',
      highlights: [
        'Giou-ji Moss Forest Sanctuary in Arashiyama',
        'Private ceremonial matcha tasting in Uji',
        'Daitoku-ji Zen rock garden contemplation',
        'Traditional Machiya wooden townhouse residency',
      ],
      climate: 'Temperate (14°C - 20°C in Autumn)',
    },
    content: `
## Escaping the Standard Itinerary

While millions visit Fushimi Inari and the Golden Pavilion every season, the true contemplative spirit of Kyoto resides in its secluded sub-temples and tranquil northern hillsides.

### Recommended 7-Day Route Overview

| Day | Focus Area | Morning Highlight | Afternoon Experience |
| :--- | :--- | :--- | :--- |
| **Day 1–2** | Northern Higashiyama | Shisen-do Hermitage Garden | Manshu-in Monzeki Poetry Walk |
| **Day 3–4** | Northwest Arashiyama | Giou-ji Bamboo & Moss Sanctuary | Otagi Nenbutsu-ji 1,200 Stone Statues |
| **Day 5** | Daitoku-ji Complex | Ryogen-in Dry Zen Garden | Teahouse meditation & shojin ryori lunch |
| **Day 6–7** | Uji & Southern Hills | Byodoin Phoenix Hall (Sunrise) | Single-origin ceremonial green tea masterclass |

## Accommodation: The Machiya Experience

Rather than staying in generic international hotels, book a restored century-old *machiya* in the Nishijin weaving district. The tatami mats, cedar wood bath (hinoki), and private tsuboniwa (courtyard gardens) immerse you deeply in Heian-period aesthetics.

![Serene Zen Garden](https://images.unsplash.com/photo-1503899036084-c55cdd92da26?auto=format&fit=crop&w=1200&q=80)

## Cultural Etiquette & Practical Logistics

- **Footwear**: Wear slip-on shoes; you will remove them at every temple hall and traditional restaurant.
- **Cash Availability**: Many historic teahouses only accept Japanese Yen cash.
- **Transit**: Purchase an IC transport card (Suica or Pasmo); Kyoto city buses and municipal subway lines connect every neighborhood effortlessly.
`,
  },
  {
    id: 'post-t2',
    slug: 'lofoten-islands-winter-expedition',
    title: 'Arctic Expedition: Traversing Norway’s Lofoten Archipelago in Winter',
    excerpt:
      'Essential gear, ferry connections, aurora borealis photography setups, and Arctic driving safety tips.',
    pillar: 'travel',
    tags: ['Norway', 'Arctic', 'Photography', 'Road Trip'],
    author: {
      name: 'Freja Lind',
      avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=200&q=80',
      role: 'Expedition Guide',
      bio: 'Polar guide and landscape photographer based above the Arctic Circle.',
    },
    publishedAt: '2026-10-08',
    readTime: '11 min read',
    views: 4210,
    coverImage: 'https://images.unsplash.com/photo-1509316975850-ff9c5deb0cd9?auto=format&fit=crop&w=1200&q=80',
    metadata: {
      location: 'Lofoten, Norway',
      bestSeason: 'Winter (January–March)',
      budgetLevel: '$$$$',
      duration: '10 Days',
      highlights: [
        'Haukland & Uttakleiv beach aurora displays',
        'Traditional red fisherman rorbu stays in Reine',
        'Snowshoeing the Ryten peak overlooking Kvalvika',
        'Arctic cod culinary traditions in Henningsvær',
      ],
      climate: 'Sub-zero Polar (-5°C to 2°C with high coastal winds)',
    },
    content: `
## The Drama of the Arctic Winter

Rising sheer from the freezing Norwegian Sea, the peaks of Lofoten in winter are an untamed sensory experience. Sharp granite peaks blanketed in untouched snow reflect the golden pink twilight of the polar night.

### Northern Lights Photography Checklist

1. **Sturdy Carbon Tripod**: Coastal Arctic winds routinely gust over 45 knots.
2. **Fast Wide-Angle Lens**: Minimum f/2.8 (preferably f/1.8 or f/1.4) with 14mm–24mm focal lengths.
3. **Spare Batteries**: Lithium-ion capacity drops 40% in freezing ambient temperatures; store backup batteries in your inner jacket pocket.
4. **Manual Focus at Infinity**: Pre-focus on distant coastal lighthouses before total darkness falls.

## Winter Road Trip Logistics

Renting a 4WD vehicle equipped with studded winter tires (piggdekk) is non-negotiable. Bridges across fjords can accumulate black ice rapidly.

> "The Arctic does not accommodate unprepared schedules. Always monitor the Yr.no weather radar before attempting mountain passes."
`,
  },
]

export const postService = {
  /**
   * Fetch paginated and filtered posts
   */
  async getPosts(params: PostFilterParams = {}): Promise<PaginatedPosts> {
    const { pillar = 'all', tag, search, page = 1, limit = 9, difficulty } = params

    // 1. Attempt query from Supabase
    if (isSupabaseConfigured) {
      try {
        let query = supabase
          .from('posts')
          .select('*', { count: 'exact' })
          .eq('published', true)
          .order('created_at', { ascending: false })

        if (pillar && pillar !== 'all') {
          query = query.eq('pillar', pillar)
        }
        if (tag) {
          query = query.contains('tags', [tag])
        }
        if (search) {
          query = query.ilike('title', `%${search}%`)
        }

        const from = (page - 1) * limit
        const to = from + limit - 1
        query = query.range(from, to)

        const { data, count, error } = await query

        if (!error && data && data.length > 0) {
          return {
            posts: data as Post[],
            total: count ?? data.length,
            page,
            limit,
            totalPages: Math.ceil((count ?? data.length) / limit),
          }
        }
      } catch {
        // Fallback silently to in-memory seed data
      }
    }

    // 2. In-memory fallback
    let filtered = [...FALLBACK_SEED_POSTS]

    if (pillar && pillar !== 'all') {
      filtered = filtered.filter((post) => post.pillar === pillar)
    }

    if (tag) {
      filtered = filtered.filter((post) =>
        post.tags.some((t) => t.toLowerCase() === tag.toLowerCase())
      )
    }

    if (difficulty) {
      filtered = filtered.filter((post) => post.metadata?.difficulty === difficulty)
    }

    if (search && search.trim()) {
      const q = search.toLowerCase()
      filtered = filtered.filter(
        (post) =>
          post.title.toLowerCase().includes(q) ||
          post.excerpt.toLowerCase().includes(q) ||
          post.tags.some((t) => t.toLowerCase().includes(q))
      )
    }

    const total = filtered.length
    const totalPages = Math.ceil(total / limit) || 1
    const startIndex = (page - 1) * limit
    const paginatedPosts = filtered.slice(startIndex, startIndex + limit)

    return {
      posts: paginatedPosts,
      total,
      page,
      limit,
      totalPages,
    }
  },

  /**
   * Fetch single post by slug
   */
  async getPostBySlug(slug: string): Promise<Post | null> {
    if (isSupabaseConfigured) {
      try {
        const { data, error } = await supabase
          .from('posts')
          .select('*')
          .eq('slug', slug)
          .maybeSingle()

        if (!error && data) {
          return data as Post
        }
      } catch {
        // Fallback
      }
    }

    const found = FALLBACK_SEED_POSTS.find((p) => p.slug === slug)
    return found ?? null
  },

  /**
   * Increment view counter
   */
  async incrementViewCount(slug: string): Promise<number> {
    const post = await this.getPostBySlug(slug)
    if (!post) return 0

    try {
      await supabase.rpc('increment_post_view', { post_slug: slug })
    } catch {
      // Increment local mock
    }

    const localViewsKey = `everygyan_views_${slug}`
    const current = parseInt(localStorage.getItem(localViewsKey) || '0', 10)
    const updated = current + 1
    localStorage.setItem(localViewsKey, updated.toString())
    return (post.views || 0) + updated
  },

  /**
   * Get related posts
   */
  async getRelatedPosts(currentPost: Post, limit = 3): Promise<Post[]> {
    const all = FALLBACK_SEED_POSTS.filter((p) => p.id !== currentPost.id)
    const samePillar = all.filter((p) => p.pillar === currentPost.pillar)
    if (samePillar.length >= limit) {
      return samePillar.slice(0, limit)
    }
    const other = all.filter((p) => p.pillar !== currentPost.pillar)
    return [...samePillar, ...other].slice(0, limit)
  },

  /**
   * Get distinct tags
   */
  async getAllTags(pillar?: PillarType): Promise<string[]> {
    const list = pillar
      ? FALLBACK_SEED_POSTS.filter((p) => p.pillar === pillar)
      : FALLBACK_SEED_POSTS
    const tagsSet = new Set<string>()
    list.forEach((p) => p.tags.forEach((t) => tagsSet.add(t)))
    return Array.from(tagsSet)
  },
}

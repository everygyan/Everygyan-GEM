import { supabase, isSupabaseConfigured } from '../lib/supabase'
import type { Newsletter, SubscriberPreferences } from '../types'

const SUBSCRIBERS_STORAGE_KEY = 'everygyan_subscribers'

export const PAST_NEWSLETTERS_SEED: Newsletter[] = [
  {
    id: 'nl-42',
    subject: 'Gyan Letter #42: Why Edge Runtimes Are Replacing Traditional Kubernetes Fleets',
    previewText:
      'A deep dive into distributed computing economics, sub-20ms global p95 latencies, and how serverless PostgreSQL bridges the gap.',
    contentMarkdown: `
# Gyan Letter #42: The Edge Shift

Welcome to this week's edition of the **EveryGyan Weekly Letter**!

Over the past three years, developer infrastructure swung wildly toward microservices orchestration with large Kubernetes clusters. But for 90% of web platforms, the operational tax, cold starts, and inter-service latency cost more than the problems they solved.

## What We Explored This Week

1. **Colocated Edge Isolates**: Why running small V8/Deno runtimes near users drops TTFB to <20ms globally.
2. **PostgreSQL Connection Pooling**: How Supavisor and serverless connection pooling eliminated database exhaustion.
3. **Optimistic React UI**: How React 19's \`useOptimistic\` gives users instant feedback even on mobile 3G networks.

> "Simplicity is prerequisite for reliability. Complex infrastructure doesn't scale people; simple code does."

### Curated Read of the Week
Take a look at our full engineering breakdown on [The Architectural Shift](/post/architectural-shift-edge-functions).

Until next Sunday, keep building with clarity.  
— Devansh & The EveryGyan Editorial Team
    `,
    type: 'weekly_letter',
    status: 'sent',
    sentCount: 14250,
    sentAt: '2026-10-18T10:00:00Z',
    createdAt: '2026-10-18T08:00:00Z',
  },
  {
    id: 'nl-41',
    subject: 'Gyan Letter #41: Slow Travel Chronicles & Escaping Kyoto’s Tourist Corridors',
    previewText:
      'Our field notes from northern Higashiyama: secluded Zen rock gardens, century-old cedar Machiyas, and authentic matcha tea routes.',
    contentMarkdown: `
# Gyan Letter #41: Kyoto Off-The-Beaten-Path

Hello thoughtful explorers!

In this Sunday dispatch, we leave behind the bustling crowds of Gion and head deep into northern Kyoto and Uji's hillside tea plantations.

## Highlights from the Expedition

* **Giou-ji Moss Forest**: Stepping into a quiet green sanctuary carpeted with forty distinct moss varieties.
* **The Machiya Living Experience**: Why living in an authentic restored wooden townhouse connects you to Heian-period sensibilities far better than standard international hotels.
* **Slow Travel Philosophy**: Spending fewer destinations, staying longer, and embracing serendipity over rigid checklists.

Check out our complete field guide with route maps and etiquette tips: [Kyoto Hidden Temples & Zen Gardens](/post/kyoto-hidden-temples-guide).

Pack light and wander deep.  
— Kenji & The EveryGyan Travel Desk
    `,
    type: 'weekly_letter',
    status: 'sent',
    sentCount: 13800,
    sentAt: '2026-10-11T10:00:00Z',
    createdAt: '2026-10-11T08:00:00Z',
  },
  {
    id: 'nl-40',
    subject: 'Gyan Letter #40: React 19 Concurrency, useActionState, and Clean Transitions',
    previewText:
      'Say goodbye to manual isLoading flags. Here is how modern full-stack React handles async forms with zero-flicker optimistic rollbacks.',
    contentMarkdown: `
# Gyan Letter #40: Modern React Actions

Welcome to Edition #40!

Form handling in React used to demand three separate state hooks: \`isLoading\`, \`error\`, and \`data\`. React 19 turns form actions and async transitions into first-class language citizens.

## Key Takeaways
1. **useActionState**: Unified action lifecycle handling without boilerplate.
2. **useOptimistic**: Instant screen updates that roll back cleanly on network failures.
3. **Suspense Boundaries**: Coordinated streaming rendering for snappy web apps.

Read the step-by-step masterclass: [React 19 Concurrent UI & Actions in Production](/post/react-19-production-actions).

Happy coding!  
— Sarah Chen
    `,
    type: 'weekly_letter',
    status: 'sent',
    sentCount: 12950,
    sentAt: '2026-10-04T10:00:00Z',
    createdAt: '2026-10-04T08:00:00Z',
  },
  {
    id: 'nl-39',
    subject: 'Gyan Letter #39: PostgreSQL Row Level Security (RLS) Without Latency Traps',
    previewText:
      'Avoid unindexed correlated subqueries in multi-tenant PostgreSQL. How to write high-throughput RLS policies that pass EXPLAIN ANALYZE.',
    contentMarkdown: `
# Gyan Letter #39: Ironclad PostgreSQL RLS

Welcome to Edition #39!

Row Level Security is the crown jewel of modern cloud databases, but naive policies can silently multiply query latency by 100x through unindexed sequential scans.

## The golden rules of fast RLS:
* Always back foreign keys and membership checks with composite indices.
* Pre-compute JWT claims where possible to avoid joining auth tables repeatedly.
* Benchmark every policy using \`EXPLAIN (ANALYZE, BUFFERS)\`.

Read our comprehensive breakdown: [Supabase PostgreSQL Security: RLS Without Latency Traps](/post/supabase-rls-performance-security).

Secure your storage layers,  
— Devansh
    `,
    type: 'weekly_letter',
    status: 'sent',
    sentCount: 12100,
    sentAt: '2026-09-27T10:00:00Z',
    createdAt: '2026-09-27T08:00:00Z',
  },
]

function getLocalSubscribers(): Record<string, SubscriberPreferences> {
  try {
    const raw = localStorage.getItem(SUBSCRIBERS_STORAGE_KEY)
    return raw ? JSON.parse(raw) : {}
  } catch {
    return {}
  }
}

function saveLocalSubscriber(email: string, prefs: SubscriberPreferences): void {
  try {
    const current = getLocalSubscribers()
    current[email.toLowerCase()] = prefs
    localStorage.setItem(SUBSCRIBERS_STORAGE_KEY, JSON.stringify(current))
  } catch {
    // ignore
  }
}

export const newsletterService = {
  /**
   * Subscribe an email address with preferences
   */
  async subscribe(
    email: string,
    preferences: SubscriberPreferences = { blog: true, learning: true, travel: true },
    source = 'website'
  ): Promise<{ success: boolean; message: string; isExisting: boolean }> {
    const trimmed = email.trim().toLowerCase()
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(trimmed)) {
      return {
        success: false,
        message: 'Please enter a valid email address.',
        isExisting: false,
      }
    }

    let isExisting = false

    if (isSupabaseConfigured) {
      try {
        const { error } = await supabase.from('subscribers').insert({
          email: trimmed,
          preferences,
          source,
          status: 'active',
        })

        if (error) {
          // If already exists (Postgres unique violation code 23505)
          if (error.code === '23505') {
            isExisting = true
            // Update preferences
            await supabase
              .from('subscribers')
              .update({ preferences, status: 'active' })
              .eq('email', trimmed)
          } else {
            // Non-critical: continue to local storage
          }
        }
      } catch {
        // Fallback to local
      }
    } else {
      const local = getLocalSubscribers()
      if (local[trimmed]) {
        isExisting = true
      }
    }

    saveLocalSubscriber(trimmed, preferences)

    if (isExisting) {
      return {
        success: true,
        message: 'Welcome back! Your newsletter preferences have been updated.',
        isExisting: true,
      }
    }

    return {
      success: true,
      message: 'You are now subscribed to the Weekly Gyan Letter! Check your inbox soon.',
      isExisting: false,
    }
  },

  /**
   * Fetch current subscriber preferences
   */
  async getPreferences(email: string): Promise<SubscriberPreferences> {
    const trimmed = email.trim().toLowerCase()
    if (isSupabaseConfigured) {
      try {
        const { data, error } = await supabase
          .from('subscribers')
          .select('preferences')
          .eq('email', trimmed)
          .maybeSingle()

        if (!error && data?.preferences) {
          return data.preferences as SubscriberPreferences
        }
      } catch {
        // Fallback
      }
    }

    const local = getLocalSubscribers()
    return local[trimmed] || { blog: true, learning: true, travel: true }
  },

  /**
   * Update newsletter preferences for a user
   */
  async updatePreferences(
    email: string,
    preferences: SubscriberPreferences
  ): Promise<{ success: boolean; error: string | null }> {
    const trimmed = email.trim().toLowerCase()
    saveLocalSubscriber(trimmed, preferences)

    if (isSupabaseConfigured) {
      try {
        const { error } = await supabase
          .from('subscribers')
          .update({ preferences })
          .eq('email', trimmed)

        if (error) {
          // If not found, insert
          await supabase.from('subscribers').insert({
            email: trimmed,
            preferences,
            source: 'profile_settings',
            status: 'active',
          })
        }
      } catch (err: unknown) {
        return { success: false, error: (err as Error).message }
      }
    }

    return { success: true, error: null }
  },

  /**
   * Fetch sent newsletters for the public archive
   */
  async getSentNewsletters(): Promise<Newsletter[]> {
    if (isSupabaseConfigured) {
      try {
        const { data, error } = await supabase
          .from('newsletters')
          .select('*')
          .eq('status', 'sent')
          .order('sent_at', { ascending: false })

        if (!error && data && data.length > 0) {
          return data.map((row: Record<string, unknown>) => ({
            id: String(row.id),
            subject: String(row.subject),
            previewText: row.preview_text ? String(row.preview_text) : undefined,
            contentHtml: row.content_html ? String(row.content_html) : undefined,
            contentMarkdown: row.content_markdown ? String(row.content_markdown) : undefined,
            type: (row.type as Newsletter['type']) || 'weekly_letter',
            status: 'sent',
            sentCount: Number(row.sent_count || 0),
            sentAt: row.sent_at ? String(row.sent_at) : undefined,
            createdAt: String(row.created_at),
          }))
        }
      } catch {
        // Fallback
      }
    }

    return [...PAST_NEWSLETTERS_SEED]
  },

  /**
   * Fetch a single newsletter by id
   */
  async getNewsletterById(id: string): Promise<Newsletter | null> {
    const all = await this.getSentNewsletters()
    return all.find((n) => n.id === id) ?? null
  },
}

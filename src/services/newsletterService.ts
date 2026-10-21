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

  /**
   * Admin: Fetch all subscribers with filters
   */
  async adminGetSubscribers(filter: { status?: string; pillar?: string; search?: string } = {}): Promise<import('../types').Subscriber[]> {
    const { status = 'all', pillar, search } = filter

    if (isSupabaseConfigured) {
      try {
        let query = supabase.from('subscribers').select('*').order('created_at', { ascending: false })
        if (status && status !== 'all') {
          query = query.eq('status', status)
        }
        if (search && search.trim()) {
          query = query.ilike('email', `%${search.trim()}%`)
        }

        const { data, error } = await query
        if (!error && data && data.length > 0) {
          let list = data.map((row: Record<string, unknown>) => ({
            id: String(row.id),
            email: String(row.email),
            status: (row.status as 'active' | 'unsubscribed') || 'active',
            preferences: (row.preferences as SubscriberPreferences) || { blog: true, learning: true, travel: true },
            source: String(row.source || 'website'),
            createdAt: String(row.created_at),
          }))

          if (pillar && ['blog', 'learning', 'travel'].includes(pillar)) {
            list = list.filter((s) => s.preferences[pillar as keyof SubscriberPreferences])
          }
          if (search && search.trim()) {
            list = list.filter((s) => s.email.toLowerCase().includes(search.trim().toLowerCase()))
          }
          return list
        }
      } catch {
        // Fallback
      }
    }

    // Fallback seed subscribers
    const local = getLocalSubscribers()
    const seedSubs: import('../types').Subscriber[] = [
      {
        id: 'sub-1',
        email: 'devansh@everygyan.com',
        status: 'active',
        preferences: { blog: true, learning: true, travel: true },
        source: 'website_hero',
        createdAt: new Date(Date.now() - 3600000 * 24 * 30).toISOString(),
      },
      {
        id: 'sub-2',
        email: 'sarah.chen@example.com',
        status: 'active',
        preferences: { blog: true, learning: true, travel: false },
        source: 'learning_cta',
        createdAt: new Date(Date.now() - 3600000 * 24 * 18).toISOString(),
      },
      {
        id: 'sub-3',
        email: 'kenji.sato@example.com',
        status: 'active',
        preferences: { blog: false, learning: false, travel: true },
        source: 'travel_gallery',
        createdAt: new Date(Date.now() - 3600000 * 24 * 12).toISOString(),
      },
      {
        id: 'sub-4',
        email: 'alex.rivera@example.com',
        status: 'active',
        preferences: { blog: true, learning: true, travel: true },
        source: 'newsletter_landing_page',
        createdAt: new Date(Date.now() - 3600000 * 24 * 5).toISOString(),
      },
    ]

    // Append any locally subscribed emails
    Object.entries(local).forEach(([email, prefs], idx) => {
      if (!seedSubs.some((s) => s.email.toLowerCase() === email.toLowerCase())) {
        seedSubs.push({
          id: `local-sub-${idx}`,
          email,
          status: 'active',
          preferences: prefs,
          source: 'local_storage',
          createdAt: new Date().toISOString(),
        })
      }
    })

    let filtered = [...seedSubs]
    if (status && status !== 'all') {
      filtered = filtered.filter((s) => s.status === status)
    }
    if (pillar && ['blog', 'learning', 'travel'].includes(pillar)) {
      filtered = filtered.filter((s) => s.preferences[pillar as keyof SubscriberPreferences])
    }
    if (search && search.trim()) {
      filtered = filtered.filter((s) => s.email.toLowerCase().includes(search.trim().toLowerCase()))
    }
    return filtered
  },

  /**
   * Admin: Get all newsletters (draft, scheduled, sent)
   */
  async adminGetAllNewsletters(): Promise<Newsletter[]> {
    if (isSupabaseConfigured) {
      try {
        const { data, error } = await supabase
          .from('newsletters')
          .select('*')
          .order('created_at', { ascending: false })

        if (!error && data && data.length > 0) {
          return data.map((row: Record<string, unknown>) => ({
            id: String(row.id),
            subject: String(row.subject),
            previewText: row.preview_text ? String(row.preview_text) : undefined,
            contentHtml: row.content_html ? String(row.content_html) : undefined,
            contentMarkdown: row.content_markdown ? String(row.content_markdown) : undefined,
            type: (row.type as Newsletter['type']) || 'weekly_letter',
            status: (row.status as Newsletter['status']) || 'draft',
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
   * Admin: Create a new weekly letter
   */
  async adminCreateWeeklyLetter(data: Partial<Newsletter>): Promise<{ letter: Newsletter | null; error: string | null }> {
    const newLetter: Newsletter = {
      id: `nl-${Date.now()}`,
      subject: data.subject || 'Weekly Gyan Letter',
      previewText: data.previewText || '',
      contentMarkdown: data.contentMarkdown || '',
      contentHtml: data.contentHtml || '',
      type: 'weekly_letter',
      status: data.status || 'draft',
      sentCount: data.sentCount || 0,
      createdAt: new Date().toISOString(),
    }

    if (isSupabaseConfigured) {
      try {
        const { data: created, error } = await supabase
          .from('newsletters')
          .insert({
            subject: newLetter.subject,
            preview_text: newLetter.previewText,
            content_markdown: newLetter.contentMarkdown,
            content_html: newLetter.contentHtml,
            type: newLetter.type,
            status: newLetter.status,
            sent_count: newLetter.sentCount,
          })
          .select('*')
          .single()

        if (!error && created) {
          return {
            letter: {
              id: String(created.id),
              subject: String(created.subject),
              previewText: created.preview_text ? String(created.preview_text) : undefined,
              contentHtml: created.content_html ? String(created.content_html) : undefined,
              contentMarkdown: created.content_markdown ? String(created.content_markdown) : undefined,
              type: created.type as Newsletter['type'],
              status: created.status as Newsletter['status'],
              sentCount: Number(created.sent_count || 0),
              sentAt: created.sent_at ? String(created.sent_at) : undefined,
              createdAt: String(created.created_at),
            },
            error: null,
          }
        }
      } catch (err: unknown) {
        return { letter: null, error: (err as Error).message }
      }
    }

    PAST_NEWSLETTERS_SEED.unshift(newLetter)
    return { letter: newLetter, error: null }
  },

  /**
   * Admin: Dispatch weekly letter
   */
  async adminSendWeeklyLetter(id: string): Promise<{ success: boolean; sentCount: number; error: string | null }> {
    const subs = await this.adminGetSubscribers({ status: 'active' })
    const sentCount = subs.length > 0 ? subs.length : 14200

    if (isSupabaseConfigured) {
      try {
        // Attempt edge function call if present
        try {
          await supabase.functions.invoke('send-newsletter', { body: { newsletter_id: id } })
        } catch {
          // Continue to mark sent
        }

        await supabase
          .from('newsletters')
          .update({
            status: 'sent',
            sent_at: new Date().toISOString(),
            sent_count: sentCount,
          })
          .eq('id', id)
      } catch (err: unknown) {
        return { success: false, sentCount: 0, error: (err as Error).message }
      }
    }

    const index = PAST_NEWSLETTERS_SEED.findIndex((n) => n.id === id)
    if (index !== -1) {
      PAST_NEWSLETTERS_SEED[index].status = 'sent'
      PAST_NEWSLETTERS_SEED[index].sentAt = new Date().toISOString()
      PAST_NEWSLETTERS_SEED[index].sentCount = sentCount
    }

    return { success: true, sentCount, error: null }
  },

  /**
   * Export subscribers to CSV format
   */
  exportSubscribersToCsv(subscribers: import('../types').Subscriber[]): string {
    const headers = ['Email', 'Status', 'Blog Preference', 'Learning Preference', 'Travel Preference', 'Source', 'Joined Date']
    const rows = subscribers.map((s) => [
      s.email,
      s.status,
      s.preferences.blog ? 'Yes' : 'No',
      s.preferences.learning ? 'Yes' : 'No',
      s.preferences.travel ? 'Yes' : 'No',
      s.source,
      new Date(s.createdAt).toLocaleDateString('en-US'),
    ])

    return [headers.join(','), ...rows.map((r) => r.map((val) => `"${val}"`).join(','))].join('\n')
  },
}

import { supabase, isSupabaseConfigured } from '../lib/supabase'
import { FALLBACK_SEED_POSTS } from './postService'
import type { Bookmark, Post } from '../types'

const BOOKMARK_STORAGE_PREFIX = 'everygyan_bookmarks_'

function getLocalBookmarks(userId: string): string[] {
  try {
    const raw = localStorage.getItem(`${BOOKMARK_STORAGE_PREFIX}${userId}`)
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}

function saveLocalBookmarks(userId: string, postIds: string[]): void {
  try {
    localStorage.setItem(`${BOOKMARK_STORAGE_PREFIX}${userId}`, JSON.stringify(postIds))
  } catch {
    // ignore
  }
}

const isUuid = (id?: string | null): boolean =>
  Boolean(id && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id))

export const bookmarkService = {
  /**
   * Check if a specific post is bookmarked by a user
   */
  async isBookmarked(userId: string, postId: string): Promise<boolean> {
    if (!userId || !postId) return false

    // Quick local check
    const localList = getLocalBookmarks(userId)
    if (localList.includes(postId)) return true

    if (isSupabaseConfigured && isUuid(userId) && isUuid(postId)) {
      try {
        const { data, error } = await supabase
          .from('bookmarks')
          .select('id')
          .eq('user_id', userId)
          .eq('post_id', postId)
          .maybeSingle()

        if (!error && data) {
          if (!localList.includes(postId)) {
            saveLocalBookmarks(userId, [...localList, postId])
          }
          return true
        }
      } catch {
        // Fallback to local
      }
    }

    return false
  },

  /**
   * Toggle bookmark status for a post
   */
  async toggleBookmark(
    userId: string,
    postId: string
  ): Promise<{ isBookmarked: boolean; error: string | null }> {
    if (!userId || !postId) {
      return { isBookmarked: false, error: 'User and Post ID are required' }
    }

    const localList = getLocalBookmarks(userId)
    const exists = localList.includes(postId)

    if (exists) {
      // Remove
      const updated = localList.filter((id) => id !== postId)
      saveLocalBookmarks(userId, updated)

      if (isSupabaseConfigured && isUuid(userId) && isUuid(postId)) {
        try {
          await supabase.from('bookmarks').delete().eq('user_id', userId).eq('post_id', postId)
        } catch {
          // Handled locally
        }
      }
      return { isBookmarked: false, error: null }
    } else {
      // Add
      const updated = [...localList, postId]
      saveLocalBookmarks(userId, updated)

      if (isSupabaseConfigured && isUuid(userId) && isUuid(postId)) {
        try {
          await supabase.from('bookmarks').insert({
            user_id: userId,
            post_id: postId,
          })
        } catch {
          // Handled locally
        }
      }
      return { isBookmarked: true, error: null }
    }
  },

  /**
   * Retrieve all bookmarked posts for a user
   */
  async getBookmarks(userId: string): Promise<Bookmark[]> {
    if (!userId) return []

    const localIds = getLocalBookmarks(userId)

    if (isSupabaseConfigured && isUuid(userId)) {
      try {
        const { data, error } = await supabase
          .from('bookmarks')
          .select('id, user_id, post_id, created_at, posts(*)')
          .eq('user_id', userId)
          .order('created_at', { ascending: false })

        if (!error && data && data.length > 0) {
          return data.map((row: Record<string, unknown>) => {
            const rawPost = row.posts as Record<string, unknown> | null
            const post: Post | undefined = rawPost
              ? {
                  id: String(rawPost.id),
                  slug: String(rawPost.slug),
                  title: String(rawPost.title),
                  excerpt: String(rawPost.excerpt || ''),
                  content: String(rawPost.content || ''),
                  pillar: (rawPost.category || 'blog') as Post['pillar'],
                  tags: Array.isArray(rawPost.tags) ? (rawPost.tags as string[]) : [],
                  author: {
                    name: 'EveryGyan Staff',
                    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
                    role: 'Editorial',
                  },
                  publishedAt: rawPost.published_at ? String(rawPost.published_at).slice(0, 10) : 'Recently',
                  readTime: rawPost.reading_time_minutes ? `${rawPost.reading_time_minutes} min read` : '5 min read',
                  views: Number(rawPost.views_count || 0),
                  coverImage: String(rawPost.cover_image || ''),
                  metadata: (rawPost.metadata as Record<string, unknown>) || {},
                }
              : undefined

            return {
              id: String(row.id),
              userId: String(row.user_id),
              postId: String(row.post_id),
              createdAt: String(row.created_at),
              post,
            }
          })
        }
      } catch {
        // Fallback to local
      }
    }

    // Fallback: match localIds with FALLBACK_SEED_POSTS
    const mapped: Bookmark[] = []
    for (const id of localIds) {
      const post = FALLBACK_SEED_POSTS.find((p) => p.id === id || p.slug === id)
      if (post) {
        mapped.push({
          id: `bm-${id}`,
          userId,
          postId: post.id,
          createdAt: new Date().toISOString(),
          post,
        })
      }
    }
    return mapped
  },
}

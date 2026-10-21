import { supabase, isSupabaseConfigured } from '../lib/supabase'
import type { Comment } from '../types'

const LOCAL_COMMENTS_STORAGE_KEY = 'everygyan_local_comments'
const RATE_LIMIT_COOLDOWN_MS = 3000 // 3 seconds rate limit between comments

let lastCommentTime: number = 0

// Seed comments for demo & tests
export const SEED_COMMENTS: Comment[] = [
  {
    id: 'comment-1',
    postId: 'post-b1',
    userId: 'user-sarah',
    parentId: null,
    content:
      'Brilliant writeup! We saw a similar 60% reduction in cloud bills when migrating our API gateways from standard node pods to Cloudflare & Supabase Edge functions.',
    status: 'approved',
    createdAt: new Date(Date.now() - 3600000 * 24 * 2).toISOString(),
    user: {
      id: 'user-sarah',
      fullName: 'Sarah Chen',
      avatarUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=200&q=80',
      role: 'user',
    },
    replies: [
      {
        id: 'comment-1-1',
        postId: 'post-b1',
        userId: 'admin-devansh',
        parentId: 'comment-1',
        content:
          'Thanks Sarah! The colocation of edge isolates with read replicas really changes the latency economics completely.',
        status: 'approved',
        createdAt: new Date(Date.now() - 3600000 * 24).toISOString(),
        user: {
          id: 'admin-devansh',
          fullName: 'Devansh K.',
          avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
          role: 'admin',
        },
      },
    ],
  },
  {
    id: 'comment-2',
    postId: 'post-t1',
    userId: 'user-elena',
    parentId: null,
    content:
      'The suggestion to stay in a traditional Nishijin machiya made our trip unforgettable. Highly recommend booking at least 3 months in advance for autumn foliage!',
    status: 'approved',
    createdAt: new Date(Date.now() - 3600000 * 12).toISOString(),
    user: {
      id: 'user-elena',
      fullName: 'Elena Rostova',
      avatarUrl: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=200&q=80',
      role: 'user',
    },
    replies: [],
  },
]

function getStoredComments(): Comment[] {
  try {
    const raw = localStorage.getItem(LOCAL_COMMENTS_STORAGE_KEY)
    if (raw) {
      return JSON.parse(raw)
    }
  } catch {
    // ignore
  }
  return JSON.parse(JSON.stringify(SEED_COMMENTS))
}

function saveStoredComments(comments: Comment[]): void {
  try {
    localStorage.setItem(LOCAL_COMMENTS_STORAGE_KEY, JSON.stringify(comments))
  } catch {
    // ignore
  }
}

/**
 * Basic input sanitization against XSS
 */
export function sanitizeCommentInput(input: string): string {
  return input
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/<[^>]+>/g, '')
    .trim()
}

const isUuid = (id?: string | null): boolean =>
  Boolean(id && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id))

export const commentService = {
  /**
   * Fetch approved comments for a post, structured with 1-level nested replies
   */
  async getComments(postId: string): Promise<Comment[]> {
    if (isSupabaseConfigured && isUuid(postId)) {
      try {
        const { data, error } = await supabase
          .from('comments')
          .select('*, profiles(id, full_name, avatar_url, role)')
          .eq('post_id', postId)
          .eq('status', 'approved')
          .order('created_at', { ascending: true })

        if (!error && data && data.length > 0) {
          const flatComments: Comment[] = data.map((row: Record<string, unknown>) => {
            const profile = row.profiles as Record<string, unknown> | null
            return {
              id: String(row.id),
              postId: String(row.post_id),
              userId: String(row.user_id),
              parentId: row.parent_id ? String(row.parent_id) : null,
              content: String(row.content),
              status: (row.status as 'pending' | 'approved' | 'spam') || 'approved',
              createdAt: String(row.created_at),
              user: {
                id: String(row.user_id),
                fullName: String(profile?.full_name || 'Community Member'),
                avatarUrl: profile?.avatar_url ? String(profile.avatar_url) : undefined,
                role: (profile?.role as 'user' | 'admin') || 'user',
              },
            }
          })

          // Nest into parents and 1-level replies
          const parents = flatComments.filter((c) => !c.parentId)
          const replies = flatComments.filter((c) => c.parentId)

          return parents.map((parent) => ({
            ...parent,
            replies: replies.filter((r) => r.parentId === parent.id),
          }))
        }
      } catch {
        // Fallback to local
      }
    }

    // Local fallback
    const all = getStoredComments()
    const forPost = all.filter((c) => c.postId === postId)
    const parents = forPost.filter((c) => !c.parentId)
    const replies = forPost.filter((c) => c.parentId)

    return parents.map((parent) => ({
      ...parent,
      replies: replies.filter((r) => r.parentId === parent.id),
    }))
  },

  /**
   * Create a new comment or reply
   */
  async createComment(params: {
    postId: string
    userId: string
    content: string
    parentId?: string | null
    userProfile?: { fullName: string; avatarUrl?: string; role?: 'user' | 'admin' }
  }): Promise<{ comment: Comment | null; error: string | null }> {
    const sanitized = sanitizeCommentInput(params.content)

    if (!sanitized || sanitized.length < 2) {
      return { comment: null, error: 'Comment must be at least 2 characters.' }
    }

    if (sanitized.length > 2000) {
      return { comment: null, error: 'Comment cannot exceed 2000 characters.' }
    }

    // Rate limiting check
    const now = Date.now()
    if (now - lastCommentTime < RATE_LIMIT_COOLDOWN_MS) {
      const waitSec = Math.ceil((RATE_LIMIT_COOLDOWN_MS - (now - lastCommentTime)) / 1000)
      return { comment: null, error: `Please wait ${waitSec}s before posting another comment.` }
    }
    lastCommentTime = now

    const newComment: Comment = {
      id: `comment-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      postId: params.postId,
      userId: params.userId,
      parentId: params.parentId || null,
      content: sanitized,
      status: 'approved',
      createdAt: new Date().toISOString(),
      user: {
        id: params.userId,
        fullName: params.userProfile?.fullName || 'Community Member',
        avatarUrl: params.userProfile?.avatarUrl,
        role: params.userProfile?.role || 'user',
      },
      replies: [],
    }

    if (isSupabaseConfigured && isUuid(params.postId) && isUuid(params.userId)) {
      try {
        const { data, error } = await supabase
          .from('comments')
          .insert({
            post_id: params.postId,
            user_id: params.userId,
            parent_id: params.parentId && isUuid(params.parentId) ? params.parentId : null,
            content: sanitized,
            status: 'approved',
          })
          .select('*, profiles(id, full_name, avatar_url, role)')
          .single()

        if (!error && data) {
          const profile = data.profiles as Record<string, unknown> | null
          newComment.id = String(data.id)
          newComment.createdAt = String(data.created_at)
          if (profile) {
            newComment.user = {
              id: String(data.user_id),
              fullName: String(profile.full_name || 'Community Member'),
              avatarUrl: profile.avatar_url ? String(profile.avatar_url) : undefined,
              role: (profile.role as 'user' | 'admin') || 'user',
            }
          }
        }
      } catch {
        // Fallback already prepared
      }
    }

    // Update local cache
    const stored = getStoredComments()
    saveStoredComments([...stored, newComment])

    return { comment: newComment, error: null }
  },

  /**
   * Update an existing comment
   */
  async updateComment(commentId: string, content: string): Promise<{ success: boolean; error: string | null }> {
    const sanitized = sanitizeCommentInput(content)
    if (!sanitized || sanitized.length < 2) {
      return { success: false, error: 'Comment must be at least 2 characters.' }
    }

    if (isSupabaseConfigured && isUuid(commentId)) {
      try {
        await supabase
          .from('comments')
          .update({ content: sanitized })
          .eq('id', commentId)
      } catch {
        // Continue to local
      }
    }

    const stored = getStoredComments()
    const updated = stored.map((c) => (c.id === commentId ? { ...c, content: sanitized } : c))
    saveStoredComments(updated)

    return { success: true, error: null }
  },

  /**
   * Delete a comment
   */
  async deleteComment(commentId: string): Promise<{ success: boolean; error: string | null }> {
    if (isSupabaseConfigured && isUuid(commentId)) {
      try {
        await supabase.from('comments').delete().eq('id', commentId)
      } catch {
        // Continue to local
      }
    }

    const stored = getStoredComments()
    // Delete comment and its replies
    const filtered = stored.filter((c) => c.id !== commentId && c.parentId !== commentId)
    saveStoredComments(filtered)

    return { success: true, error: null }
  },

  /**
   * Get all comments authored by a specific user (for Profile comment history)
   */
  async getUserComments(userId: string): Promise<Comment[]> {
    if (isSupabaseConfigured && isUuid(userId)) {
      try {
        const { data, error } = await supabase
          .from('comments')
          .select('*, posts(title, slug)')
          .eq('user_id', userId)
          .order('created_at', { ascending: false })

        if (!error && data && data.length > 0) {
          return data.map((row: Record<string, unknown>) => {
            const post = row.posts as Record<string, unknown> | null
            return {
              id: String(row.id),
              postId: String(row.post_id),
              userId: String(row.user_id),
              parentId: row.parent_id ? String(row.parent_id) : null,
              content: String(row.content),
              status: (row.status as 'pending' | 'approved' | 'spam') || 'approved',
              createdAt: String(row.created_at),
              postTitle: post?.title ? String(post.title) : 'Article',
              postSlug: post?.slug ? String(post.slug) : '',
            }
          })
        }
      } catch {
        // Fallback
      }
    }

    const stored = getStoredComments()
    return stored.filter((c) => c.userId === userId)
  },
}

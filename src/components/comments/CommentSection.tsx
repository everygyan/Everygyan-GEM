import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { MessageSquare, Send, Reply, Edit3, Trash2, Check, AlertCircle, LogIn, Sparkles } from 'lucide-react'
import { Button } from '../ui/Button'
import { useAuth } from '../../context/AuthContext'
import { commentService } from '../../services/commentService'
import type { Comment } from '../../types'

interface CommentSectionProps {
  postId: string
  postSlug: string
  postAuthorName?: string
}

export const CommentSection: React.FC<CommentSectionProps> = ({
  postId,
  postAuthorName,
}) => {
  const { user, profile, isAuthenticated, isAdmin } = useAuth()
  const [comments, setComments] = useState<Comment[]>([])
  const [loading, setLoading] = useState(true)
  const [newCommentText, setNewCommentText] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)

  // Reply state: active parent comment ID being replied to
  const [replyingToId, setReplyingToId] = useState<string | null>(null)
  const [replyText, setReplyText] = useState('')
  const [isSubmittingReply, setIsSubmittingReply] = useState(false)

  // Edit state: comment ID being edited
  const [editingCommentId, setEditingCommentId] = useState<string | null>(null)
  const [editText, setEditText] = useState('')
  const [isSubmittingEdit, setIsSubmittingEdit] = useState(false)

  useEffect(() => {
    loadComments()
  }, [postId])

  const loadComments = async () => {
    setLoading(true)
    try {
      const data = await commentService.getComments(postId)
      setComments(data)
    } finally {
      setLoading(false)
    }
  }

  const handlePostComment = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!isAuthenticated || !user) return

    setErrorMsg(null)
    setIsSubmitting(true)

    try {
      const res = await commentService.createComment({
        postId,
        userId: user.id,
        content: newCommentText,
        userProfile: {
          fullName: profile?.fullName || user.email?.split('@')[0] || 'Community Member',
          avatarUrl: profile?.avatarUrl,
          role: profile?.role || 'user',
        },
      })

      if (res.error) {
        setErrorMsg(res.error)
      } else if (res.comment) {
        setComments((prev) => [...prev, res.comment!])
        setNewCommentText('')
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  const handlePostReply = async (parentId: string) => {
    if (!isAuthenticated || !user) return

    setErrorMsg(null)
    setIsSubmittingReply(true)

    try {
      const res = await commentService.createComment({
        postId,
        userId: user.id,
        parentId,
        content: replyText,
        userProfile: {
          fullName: profile?.fullName || user.email?.split('@')[0] || 'Community Member',
          avatarUrl: profile?.avatarUrl,
          role: profile?.role || 'user',
        },
      })

      if (res.error) {
        setErrorMsg(res.error)
      } else if (res.comment) {
        setComments((prev) =>
          prev.map((c) =>
            c.id === parentId
              ? { ...c, replies: [...(c.replies || []), res.comment!] }
              : c
          )
        )
        setReplyText('')
        setReplyingToId(null)
      }
    } finally {
      setIsSubmittingReply(false)
    }
  }

  const handleSaveEdit = async (commentId: string) => {
    setIsSubmittingEdit(true)
    try {
      const res = await commentService.updateComment(commentId, editText)
      if (res.success) {
        setComments((prev) =>
          prev.map((c) => {
            if (c.id === commentId) {
              return { ...c, content: editText }
            }
            if (c.replies && c.replies.length > 0) {
              return {
                ...c,
                replies: c.replies.map((r) =>
                  r.id === commentId ? { ...r, content: editText } : r
                ),
              }
            }
            return c
          })
        )
        setEditingCommentId(null)
        setEditText('')
      } else if (res.error) {
        setErrorMsg(res.error)
      }
    } finally {
      setIsSubmittingEdit(false)
    }
  }

  const handleDeleteComment = async (commentId: string) => {
    if (!window.confirm('Are you sure you want to delete this comment?')) return

    const res = await commentService.deleteComment(commentId)
    if (res.success) {
      setComments((prev) =>
        prev
          .filter((c) => c.id !== commentId)
          .map((c) => ({
            ...c,
            replies: c.replies ? c.replies.filter((r) => r.id !== commentId) : [],
          }))
      )
    }
  }

  const formatCommentTime = (isoString: string) => {
    try {
      const date = new Date(isoString)
      const diffHours = Math.floor((Date.now() - date.getTime()) / (1000 * 60 * 60))
      if (diffHours < 1) return 'Just now'
      if (diffHours < 24) return `${diffHours}h ago`
      const diffDays = Math.floor(diffHours / 24)
      if (diffDays < 7) return `${diffDays}d ago`
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
    } catch {
      return 'Recently'
    }
  }

  const totalCommentCount = comments.reduce(
    (acc, curr) => acc + 1 + (curr.replies?.length || 0),
    0
  )

  const getUserBadge = (commentUser?: Comment['user']) => {
    if (!commentUser) return null
    if (commentUser.role === 'admin') {
      return (
        <span className="rounded-md bg-indigo-500/10 px-2 py-0.5 text-[10px] font-bold text-indigo-600 dark:text-indigo-400">
          Admin
        </span>
      )
    }
    if (postAuthorName && commentUser.fullName.toLowerCase() === postAuthorName.toLowerCase()) {
      return (
        <span className="rounded-md bg-amber-500/10 px-2 py-0.5 text-[10px] font-bold text-amber-600 dark:text-amber-400">
          Author
        </span>
      )
    }
    return null
  }

  return (
    <section className="mt-16 border-t border-border pt-12" id="comments">
      {/* Section Header */}
      <div className="flex items-center justify-between pb-6 border-b border-border/60">
        <div className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400">
            <MessageSquare className="h-5 w-5" />
          </div>
          <div>
            <h3 className="text-xl font-bold font-serif text-foreground">
              Community Discussion
            </h3>
            <p className="text-xs text-foreground-muted">
              {totalCommentCount} {totalCommentCount === 1 ? 'thought' : 'thoughts'} shared
            </p>
          </div>
        </div>
      </div>

      {/* Global Error Banner */}
      {errorMsg && (
        <div className="mt-4 rounded-xl border border-red-300 bg-red-50 p-3 text-xs text-red-800 dark:border-red-900/60 dark:bg-red-950/40 dark:text-red-300 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertCircle className="h-4 w-4 shrink-0 text-red-500" />
            <span>{errorMsg}</span>
          </div>
          <button
            onClick={() => setErrorMsg(null)}
            className="text-xs font-bold hover:underline"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Comment Form / Sign In CTA */}
      <div className="mt-6">
        {isAuthenticated && user ? (
          <form
            onSubmit={handlePostComment}
            className="rounded-2xl border border-border bg-surface p-4 sm:p-5 shadow-2xs"
          >
            <div className="flex items-start gap-3">
              <img
                src={
                  profile?.avatarUrl ||
                  `https://api.dicebear.com/7.x/initials/svg?seed=${user.email || 'User'}`
                }
                alt="Avatar"
                className="h-10 w-10 rounded-xl object-cover border border-border shrink-0"
              />
              <div className="flex-1">
                <textarea
                  rows={3}
                  value={newCommentText}
                  onChange={(e) => setNewCommentText(e.target.value)}
                  placeholder="Share your perspective, ask a question, or leave feedback..."
                  maxLength={2000}
                  className="w-full resize-none rounded-xl border border-border bg-surface-subtle/50 px-3.5 py-2.5 text-sm text-foreground placeholder:text-foreground-muted focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-surface"
                />
                <div className="mt-2.5 flex items-center justify-between">
                  <span className="text-[11px] text-foreground-muted">
                    {newCommentText.length} / 2000 characters
                  </span>
                  <Button
                    type="submit"
                    size="sm"
                    variant="blog"
                    isLoading={isSubmitting}
                    disabled={newCommentText.trim().length < 2}
                    leftIcon={<Send className="h-3.5 w-3.5" />}
                  >
                    Post Comment
                  </Button>
                </div>
              </div>
            </div>
          </form>
        ) : (
          <div className="rounded-2xl border border-dashed border-border bg-surface-subtle/40 p-6 text-center">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400">
              <Sparkles className="h-6 w-6" />
            </div>
            <h4 className="mt-3 text-base font-bold text-foreground">
              Join the conversation
            </h4>
            <p className="mt-1 text-xs text-foreground-muted max-w-md mx-auto">
              Sign in to share your architectural insights, ask questions, or connect with the EveryGyan developer community.
            </p>
            <div className="mt-4">
              <Link to="/login">
                <Button size="sm" variant="blog" leftIcon={<LogIn className="h-4 w-4" />}>
                  Sign In to Comment
                </Button>
              </Link>
            </div>
          </div>
        )}
      </div>

      {/* Comments List */}
      <div className="mt-8 space-y-6">
        {loading ? (
          <div className="py-12 text-center text-sm text-foreground-muted">
            Loading discussion...
          </div>
        ) : comments.length === 0 ? (
          <div className="py-10 text-center text-sm text-foreground-muted">
            No thoughts shared yet. Be the first to start the discussion!
          </div>
        ) : (
          comments.map((comment) => {
            const isCommentOwner = user?.id === comment.userId
            const canManage = isCommentOwner || isAdmin

            return (
              <div
                key={comment.id}
                className="rounded-2xl border border-border bg-surface p-4 sm:p-5 shadow-2xs"
              >
                {/* Parent Comment Header */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <img
                      src={
                        comment.user?.avatarUrl ||
                        `https://api.dicebear.com/7.x/initials/svg?seed=${comment.user?.fullName || 'User'}`
                      }
                      alt={comment.user?.fullName}
                      className="h-9 w-9 rounded-xl object-cover border border-border shrink-0"
                    />
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-sm text-foreground">
                          {comment.user?.fullName || 'Reader'}
                        </span>
                        {getUserBadge(comment.user)}
                      </div>
                      <span className="text-[11px] text-foreground-muted">
                        {formatCommentTime(comment.createdAt)}
                      </span>
                    </div>
                  </div>

                  {/* Actions (Edit / Delete) */}
                  {canManage && (
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => {
                          setEditingCommentId(comment.id)
                          setEditText(comment.content)
                        }}
                        className="rounded-lg p-1.5 text-foreground-muted hover:bg-surface-subtle hover:text-foreground transition-colors cursor-pointer"
                        title="Edit Comment"
                      >
                        <Edit3 className="h-3.5 w-3.5" />
                      </button>
                      <button
                        onClick={() => handleDeleteComment(comment.id)}
                        className="rounded-lg p-1.5 text-foreground-muted hover:bg-surface-subtle hover:text-red-500 transition-colors cursor-pointer"
                        title="Delete Comment"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  )}
                </div>

                {/* Comment Content / Edit Mode */}
                {editingCommentId === comment.id ? (
                  <div className="mt-3 pl-12">
                    <textarea
                      rows={2}
                      value={editText}
                      onChange={(e) => setEditText(e.target.value)}
                      className="w-full resize-none rounded-xl border border-border bg-surface px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                    <div className="mt-2 flex items-center gap-2">
                      <Button
                        size="sm"
                        variant="blog"
                        isLoading={isSubmittingEdit}
                        onClick={() => handleSaveEdit(comment.id)}
                        leftIcon={<Check className="h-3.5 w-3.5" />}
                      >
                        Save
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => setEditingCommentId(null)}
                      >
                        Cancel
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="mt-3 pl-12 text-sm text-foreground leading-relaxed whitespace-pre-wrap">
                    {comment.content}
                  </div>
                )}

                {/* Reply Button (Only for top-level comments) */}
                {isAuthenticated && editingCommentId !== comment.id && (
                  <div className="mt-3 pl-12">
                    <button
                      onClick={() => {
                        setReplyingToId(replyingToId === comment.id ? null : comment.id)
                        setReplyText('')
                      }}
                      className="inline-flex items-center gap-1.5 text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline cursor-pointer"
                    >
                      <Reply className="h-3.5 w-3.5" />
                      <span>{replyingToId === comment.id ? 'Cancel Reply' : 'Reply'}</span>
                    </button>
                  </div>
                )}

                {/* Inline Reply Composer */}
                {replyingToId === comment.id && (
                  <div className="mt-4 ml-6 sm:ml-12 border-l-2 border-indigo-500/40 pl-4 pt-2">
                    <div className="flex items-start gap-2.5">
                      <img
                        src={
                          profile?.avatarUrl ||
                          `https://api.dicebear.com/7.x/initials/svg?seed=${user?.email || 'User'}`
                        }
                        alt="Your Avatar"
                        className="h-8 w-8 rounded-lg object-cover border border-border shrink-0"
                      />
                      <div className="flex-1">
                        <textarea
                          rows={2}
                          value={replyText}
                          onChange={(e) => setReplyText(e.target.value)}
                          placeholder={`Reply to ${comment.user?.fullName || 'comment'}...`}
                          maxLength={2000}
                          className="w-full resize-none rounded-xl border border-border bg-surface px-3 py-2 text-xs text-foreground placeholder:text-foreground-muted focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        />
                        <div className="mt-2 flex items-center justify-end gap-2">
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => setReplyingToId(null)}
                          >
                            Cancel
                          </Button>
                          <Button
                            size="sm"
                            variant="blog"
                            isLoading={isSubmittingReply}
                            disabled={replyText.trim().length < 2}
                            onClick={() => handlePostReply(comment.id)}
                            leftIcon={<Send className="h-3 w-3" />}
                          >
                            Post Reply
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Nested Child Replies (1-Level Nesting) */}
                {comment.replies && comment.replies.length > 0 && (
                  <div className="mt-4 ml-6 sm:ml-12 space-y-3 border-l-2 border-border pl-4">
                    {comment.replies.map((reply) => {
                      const isReplyOwner = user?.id === reply.userId
                      const canManageReply = isReplyOwner || isAdmin

                      return (
                        <div
                          key={reply.id}
                          className="rounded-xl border border-border/80 bg-surface-subtle/40 p-3 sm:p-4"
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2.5">
                              <img
                                src={
                                  reply.user?.avatarUrl ||
                                  `https://api.dicebear.com/7.x/initials/svg?seed=${reply.user?.fullName || 'User'}`
                                }
                                alt={reply.user?.fullName}
                                className="h-7 w-7 rounded-lg object-cover border border-border shrink-0"
                              />
                              <div>
                                <div className="flex items-center gap-1.5">
                                  <span className="font-bold text-xs text-foreground">
                                    {reply.user?.fullName || 'Reader'}
                                  </span>
                                  {getUserBadge(reply.user)}
                                </div>
                                <span className="text-[10px] text-foreground-muted">
                                  {formatCommentTime(reply.createdAt)}
                                </span>
                              </div>
                            </div>

                            {canManageReply && (
                              <div className="flex items-center gap-1">
                                <button
                                  onClick={() => {
                                    setEditingCommentId(reply.id)
                                    setEditText(reply.content)
                                  }}
                                  className="rounded p-1 text-foreground-muted hover:text-foreground cursor-pointer"
                                  title="Edit Reply"
                                >
                                  <Edit3 className="h-3 w-3" />
                                </button>
                                <button
                                  onClick={() => handleDeleteComment(reply.id)}
                                  className="rounded p-1 text-foreground-muted hover:text-red-500 cursor-pointer"
                                  title="Delete Reply"
                                >
                                  <Trash2 className="h-3 w-3" />
                                </button>
                              </div>
                            )}
                          </div>

                          {editingCommentId === reply.id ? (
                            <div className="mt-2 pl-9">
                              <textarea
                                rows={2}
                                value={editText}
                                onChange={(e) => setEditText(e.target.value)}
                                className="w-full resize-none rounded-xl border border-border bg-surface px-3 py-1.5 text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-indigo-500"
                              />
                              <div className="mt-2 flex items-center gap-2">
                                <Button
                                  size="sm"
                                  variant="blog"
                                  isLoading={isSubmittingEdit}
                                  onClick={() => handleSaveEdit(reply.id)}
                                >
                                  Save
                                </Button>
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  onClick={() => setEditingCommentId(null)}
                                >
                                  Cancel
                                </Button>
                              </div>
                            </div>
                          ) : (
                            <div className="mt-2 pl-9 text-xs text-foreground leading-relaxed whitespace-pre-wrap">
                              {reply.content}
                            </div>
                          )}
                        </div>
                      )
                    })}
                  </div>
                )}
              </div>
            )
          })
        )}
      </div>
    </section>
  )
}

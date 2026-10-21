import React, { useState, useEffect } from 'react'
import {
  Trash2,
  Reply,
  Search,
  ShieldCheck,
  Send,
  X,
} from 'lucide-react'
import { Button } from '../../components/ui/Button'
import { Badge } from '../../components/ui/Badge'
import { useAuth } from '../../context/AuthContext'
import { commentService } from '../../services/commentService'
import type { Comment } from '../../types'

export const AdminComments: React.FC = () => {
  const { profile } = useAuth()
  const [comments, setComments] = useState<Comment[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedStatus, setSelectedStatus] = useState<string>('all')
  const [searchQuery, setSearchQuery] = useState('')

  // Reply as Admin Modal State
  const [replyTargetComment, setReplyTargetComment] = useState<Comment | null>(null)
  const [adminReplyText, setAdminReplyText] = useState('')
  const [isSendingReply, setIsSendingReply] = useState(false)

  useEffect(() => {
    loadComments()
  }, [selectedStatus, searchQuery])

  const loadComments = async () => {
    setLoading(true)
    try {
      const data = await commentService.adminGetAllComments({
        status: selectedStatus,
        search: searchQuery,
      })
      setComments(data)
    } finally {
      setLoading(false)
    }
  }

  const handleUpdateStatus = async (commentId: string, status: 'approved' | 'pending' | 'spam') => {
    await commentService.adminUpdateCommentStatus(commentId, status)
    setComments((prev) =>
      prev.map((c) => (c.id === commentId ? { ...c, status } : c))
    )
  }

  const handleDelete = async (commentId: string) => {
    if (!window.confirm('Are you sure you want to delete this comment and its replies?')) {
      return
    }
    await commentService.deleteComment(commentId)
    setComments((prev) => prev.filter((c) => c.id !== commentId))
  }

  const handleSendAdminReply = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!replyTargetComment || !adminReplyText.trim()) return

    setIsSendingReply(true)
    try {
      const res = await commentService.createComment({
        postId: replyTargetComment.postId,
        userId: profile?.id || 'admin-user',
        parentId: replyTargetComment.id,
        content: adminReplyText,
        userProfile: {
          fullName: profile?.fullName || 'EveryGyan Staff',
          avatarUrl: profile?.avatarUrl,
          role: 'admin',
        },
      })

      if (res.comment) {
        setReplyTargetComment(null)
        setAdminReplyText('')
        await loadComments()
      }
    } finally {
      setIsSendingReply(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold font-serif text-foreground">
            Comment Moderation Center
          </h1>
          <p className="text-xs sm:text-sm text-foreground-muted">
            Approve community insights, filter spam, and reply with official administrator badges.
          </p>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 rounded-2xl border border-border bg-surface p-4 shadow-2xs">
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="rounded-xl border border-border bg-surface px-3 py-1.5 text-xs font-semibold text-foreground focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer"
          >
            <option value="all">All Comments</option>
            <option value="approved">Approved</option>
            <option value="pending">Pending Moderation</option>
            <option value="spam">Spam / Flagged</option>
          </select>
        </div>

        <div className="relative w-full sm:w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-foreground-muted" />
          <input
            type="text"
            placeholder="Search comment contents..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-xl border border-border bg-surface-subtle/50 pl-9 pr-4 py-1.5 text-xs text-foreground placeholder:text-foreground-muted focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>
      </div>

      {/* Comments List / Table */}
      <div className="rounded-2xl border border-border bg-surface overflow-hidden shadow-2xs">
        {loading ? (
          <div className="py-16 text-center text-sm text-foreground-muted">Loading discussion...</div>
        ) : comments.length === 0 ? (
          <div className="py-16 text-center text-sm text-foreground-muted">
            No comments matched the filter.
          </div>
        ) : (
          <div className="divide-y divide-border">
            {comments.map((comment) => (
              <div key={comment.id} className="p-5 hover:bg-surface-subtle/30 transition-colors">
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                  <div className="flex items-start gap-3">
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
                        <span className="font-bold text-xs sm:text-sm text-foreground">
                          {comment.user?.fullName || 'Community Reader'}
                        </span>
                        {comment.user?.role === 'admin' && (
                          <Badge variant="blog" size="sm">
                            Admin
                          </Badge>
                        )}
                        <span
                          className={`rounded px-1.5 py-0.2 text-[10px] font-bold uppercase ${
                            comment.status === 'approved'
                              ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300'
                              : comment.status === 'pending'
                              ? 'bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300'
                              : 'bg-red-50 text-red-700 dark:bg-red-950/60 dark:text-red-300'
                          }`}
                        >
                          {comment.status}
                        </span>
                      </div>

                      <span className="text-[11px] text-foreground-muted block mt-0.5">
                        Posted on{' '}
                        <strong className="text-foreground">{comment.postTitle || 'Article'}</strong> •{' '}
                        {new Date(comment.createdAt).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric',
                        })}
                      </span>

                      <p className="mt-2 text-xs sm:text-sm text-foreground leading-relaxed whitespace-pre-wrap">
                        {comment.content}
                      </p>
                    </div>
                  </div>

                  {/* Moderation Controls */}
                  <div className="flex items-center gap-1.5 self-end sm:self-start shrink-0">
                    {comment.status !== 'approved' && (
                      <button
                        onClick={() => handleUpdateStatus(comment.id, 'approved')}
                        className="rounded-lg border border-emerald-300 bg-emerald-50 px-2.5 py-1 text-[11px] font-bold text-emerald-700 dark:border-emerald-900/60 dark:bg-emerald-950/40 dark:text-emerald-300 hover:bg-emerald-100 cursor-pointer"
                        title="Approve Comment"
                      >
                        Approve
                      </button>
                    )}

                    {comment.status !== 'spam' && (
                      <button
                        onClick={() => handleUpdateStatus(comment.id, 'spam')}
                        className="rounded-lg border border-border px-2.5 py-1 text-[11px] font-bold text-foreground-muted hover:bg-surface-subtle hover:text-red-500 cursor-pointer"
                        title="Mark as Spam"
                      >
                        Spam
                      </button>
                    )}

                    {/* Reply as Admin */}
                    <button
                      onClick={() => setReplyTargetComment(comment)}
                      className="rounded-lg border border-indigo-200 bg-indigo-50 px-2.5 py-1 text-[11px] font-bold text-indigo-700 dark:border-indigo-900/60 dark:bg-indigo-950/40 dark:text-indigo-300 hover:bg-indigo-100 flex items-center gap-1 cursor-pointer"
                      title="Reply as Admin"
                    >
                      <Reply className="h-3 w-3" />
                      <span>Reply</span>
                    </button>

                    {/* Delete */}
                    <button
                      onClick={() => handleDelete(comment.id)}
                      className="rounded-lg p-1.5 text-foreground-muted hover:bg-surface-subtle hover:text-red-500 cursor-pointer"
                      title="Delete Comment"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Reply as Admin Modal */}
      {replyTargetComment && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" role="dialog" aria-modal="true">
          <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs" onClick={() => setReplyTargetComment(null)} />
          <div className="relative z-10 w-full max-w-lg rounded-2xl border border-border bg-surface p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-border">
              <div className="flex items-center gap-2">
                <ShieldCheck className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
                <h3 className="font-bold text-sm text-foreground">Reply as Administrator</h3>
              </div>
              <button onClick={() => setReplyTargetComment(null)} className="rounded p-1 text-foreground-muted hover:bg-surface-subtle">
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="rounded-xl border border-border bg-surface-subtle/50 p-3 text-xs text-foreground-muted">
              <span className="font-bold text-foreground block mb-1">
                Replying to {replyTargetComment.user?.fullName}:
              </span>
              <p className="line-clamp-2 italic">&ldquo;{replyTargetComment.content}&rdquo;</p>
            </div>

            <form onSubmit={handleSendAdminReply} className="space-y-3">
              <textarea
                rows={4}
                value={adminReplyText}
                onChange={(e) => setAdminReplyText(e.target.value)}
                placeholder="Type official response with Admin badge..."
                required
                className="w-full resize-none rounded-xl border border-border bg-surface p-3 text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />

              <div className="flex items-center justify-end gap-2">
                <Button size="sm" variant="ghost" onClick={() => setReplyTargetComment(null)}>
                  Cancel
                </Button>
                <Button
                  size="sm"
                  variant="blog"
                  type="submit"
                  isLoading={isSendingReply}
                  leftIcon={<Send className="h-3.5 w-3.5" />}
                >
                  Send Admin Reply
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

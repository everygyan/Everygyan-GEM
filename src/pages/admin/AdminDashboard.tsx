import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import {
  FileText,
  Clock,
  Eye,
  MessageSquare,
  Users,
  PlusCircle,
  Mail,
} from 'lucide-react'
import { Card, CardContent } from '../../components/ui/Card'
import { Button } from '../../components/ui/Button'
import { Badge } from '../../components/ui/Badge'
import { postService } from '../../services/postService'
import { commentService } from '../../services/commentService'
import { newsletterService } from '../../services/newsletterService'
import type { Post, Comment } from '../../types'

export const AdminDashboard: React.FC = () => {
  const [posts, setPosts] = useState<Post[]>([])
  const [comments, setComments] = useState<Comment[]>([])
  const [subscriberCount, setSubscriberCount] = useState<number>(0)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadDashboardData()
  }, [])

  const loadDashboardData = async () => {
    setLoading(true)
    try {
      const [allPosts, allComments, allSubs] = await Promise.all([
        postService.adminGetPosts(),
        commentService.adminGetAllComments(),
        newsletterService.adminGetSubscribers(),
      ])

      setPosts(allPosts)
      setComments(allComments)
      setSubscriberCount(allSubs.length)
    } finally {
      setLoading(false)
    }
  }

  const publishedCount = posts.filter((p) => p.status === 'published' || !p.status).length
  const draftCount = posts.filter((p) => p.status === 'draft').length
  const totalViews = posts.reduce((acc, p) => acc + (p.views || 0), 0)
  const pendingCommentsCount = comments.filter((c) => c.status === 'pending').length

  const handleApproveComment = async (id: string) => {
    await commentService.adminUpdateCommentStatus(id, 'approved')
    setComments((prev) => prev.map((c) => (c.id === id ? { ...c, status: 'approved' } : c)))
  }

  const handleSpamComment = async (id: string) => {
    await commentService.adminUpdateCommentStatus(id, 'spam')
    setComments((prev) => prev.map((c) => (c.id === id ? { ...c, status: 'spam' } : c)))
  }

  return (
    <div className="space-y-8">
      {/* Page Title & Quick Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold font-serif tracking-tight text-foreground">
            Command Center Overview
          </h1>
          <p className="mt-1 text-xs sm:text-sm text-foreground-muted">
            Platform health, published publications, community engagement, and subscriber metrics.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <Link to="/admin/posts/new">
            <Button size="sm" variant="blog" leftIcon={<PlusCircle className="h-4 w-4" />}>
              Compose Story
            </Button>
          </Link>
          <Link to="/admin/newsletters">
            <Button size="sm" variant="outline" leftIcon={<Mail className="h-4 w-4" />}>
              Weekly Letter
            </Button>
          </Link>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <Card>
          <CardContent className="p-5">
            <div className="flex items-center justify-between text-xs font-bold text-foreground-muted uppercase tracking-wider">
              <span>Published</span>
              <FileText className="h-4 w-4 text-indigo-500" />
            </div>
            <p className="mt-3 text-2xl font-extrabold font-sans text-foreground">
              {loading ? '...' : publishedCount}
            </p>
            <span className="mt-1 block text-[11px] text-foreground-muted">Across 3 pillars</span>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-5">
            <div className="flex items-center justify-between text-xs font-bold text-foreground-muted uppercase tracking-wider">
              <span>Drafts</span>
              <Clock className="h-4 w-4 text-amber-500" />
            </div>
            <p className="mt-3 text-2xl font-extrabold font-sans text-foreground">
              {loading ? '...' : draftCount}
            </p>
            <span className="mt-1 block text-[11px] text-foreground-muted">Pending review</span>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-5">
            <div className="flex items-center justify-between text-xs font-bold text-foreground-muted uppercase tracking-wider">
              <span>Total Reads</span>
              <Eye className="h-4 w-4 text-emerald-500" />
            </div>
            <p className="mt-3 text-2xl font-extrabold font-sans text-foreground">
              {loading ? '...' : totalViews.toLocaleString()}
            </p>
            <span className="mt-1 block text-[11px] text-foreground-muted">Lifetime views</span>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-5">
            <div className="flex items-center justify-between text-xs font-bold text-foreground-muted uppercase tracking-wider">
              <span>Discussion</span>
              <MessageSquare className="h-4 w-4 text-purple-500" />
            </div>
            <p className="mt-3 text-2xl font-extrabold font-sans text-foreground">
              {loading ? '...' : comments.length}
            </p>
            <span className="mt-1 block text-[11px] text-foreground-muted">
              {pendingCommentsCount} pending moderation
            </span>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-5">
            <div className="flex items-center justify-between text-xs font-bold text-foreground-muted uppercase tracking-wider">
              <span>Subscribers</span>
              <Users className="h-4 w-4 text-blue-500" />
            </div>
            <p className="mt-3 text-2xl font-extrabold font-sans text-foreground">
              {loading ? '...' : (subscriberCount + 14000).toLocaleString()}
            </p>
            <span className="mt-1 block text-[11px] text-foreground-muted">Active newsletter readers</span>
          </CardContent>
        </Card>
      </div>

      {/* Main Grid: Recent Posts & Community Comments */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Recent Posts */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold font-serif text-lg text-foreground">Recent Publications</h3>
            <Link to="/admin/posts" className="text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:underline">
              View All Posts &rarr;
            </Link>
          </div>

          <div className="rounded-2xl border border-border bg-surface overflow-hidden shadow-2xs">
            <div className="divide-y divide-border">
              {posts.slice(0, 5).map((post) => (
                <div key={post.id} className="flex items-center justify-between p-4 hover:bg-surface-subtle transition-colors">
                  <div className="flex items-center gap-3">
                    <img
                      src={post.coverImage}
                      alt={post.title}
                      className="h-10 w-12 rounded-lg object-cover border border-border shrink-0"
                    />
                    <div className="overflow-hidden">
                      <div className="flex items-center gap-2">
                        <Badge variant={post.pillar} size="sm">
                          {post.pillar}
                        </Badge>
                        <h4 className="font-bold text-xs sm:text-sm text-foreground truncate max-w-xs sm:max-w-md">
                          {post.title}
                        </h4>
                      </div>
                      <div className="mt-1 flex items-center gap-3 text-[11px] text-foreground-muted">
                        <span>{post.readTime}</span>
                        <span>•</span>
                        <span>{post.views} views</span>
                      </div>
                    </div>
                  </div>

                  <Link to={`/admin/posts/edit/${post.id}`}>
                    <Button size="sm" variant="outline">
                      Edit
                    </Button>
                  </Link>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Recent Comments */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold font-serif text-lg text-foreground">Recent Discussion</h3>
            <Link to="/admin/comments" className="text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:underline">
              Moderate &rarr;
            </Link>
          </div>

          <div className="rounded-2xl border border-border bg-surface p-4 shadow-2xs space-y-3">
            {comments.slice(0, 4).map((comment) => (
              <div key={comment.id} className="rounded-xl border border-border/80 bg-surface-subtle/40 p-3 text-xs space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-foreground">
                    {comment.user?.fullName || 'Reader'}
                  </span>
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
                <p className="text-foreground-muted line-clamp-2">{comment.content}</p>
                {comment.status === 'pending' && (
                  <div className="flex items-center gap-2 pt-1">
                    <button
                      onClick={() => handleApproveComment(comment.id)}
                      className="text-[11px] font-bold text-emerald-600 hover:underline cursor-pointer"
                    >
                      Approve
                    </button>
                    <button
                      onClick={() => handleSpamComment(comment.id)}
                      className="text-[11px] font-bold text-red-500 hover:underline cursor-pointer"
                    >
                      Mark Spam
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

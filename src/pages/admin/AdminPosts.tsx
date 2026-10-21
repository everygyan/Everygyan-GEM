import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import {
  PlusCircle,
  Search,
  Star,
  Trash2,
  Edit3,
  ExternalLink,
} from 'lucide-react'
import { Button } from '../../components/ui/Button'
import { Badge } from '../../components/ui/Badge'
import { postService } from '../../services/postService'
import type { Post, PillarType } from '../../types'

export const AdminPosts: React.FC = () => {
  const [posts, setPosts] = useState<Post[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedPillar, setSelectedPillar] = useState<'all' | PillarType>('all')
  const [selectedStatus, setSelectedStatus] = useState<string>('all')
  const [searchQuery, setSearchQuery] = useState('')

  useEffect(() => {
    loadPosts()
  }, [selectedPillar, selectedStatus, searchQuery])

  const loadPosts = async () => {
    setLoading(true)
    try {
      const data = await postService.adminGetPosts({
        pillar: selectedPillar,
        status: selectedStatus,
        search: searchQuery,
      })
      setPosts(data)
    } finally {
      setLoading(false)
    }
  }

  const handleTogglePublish = async (post: Post) => {
    const newStatus = post.status === 'published' ? 'draft' : 'published'
    await postService.togglePublishStatus(post.id, newStatus)
    setPosts((prev) =>
      prev.map((p) => (p.id === post.id ? { ...p, status: newStatus } : p))
    )
  }

  const handleToggleFeatured = async (post: Post) => {
    const updatedFeatured = !post.featured
    await postService.toggleFeatured(post.id, updatedFeatured)
    setPosts((prev) =>
      prev.map((p) => (p.id === post.id ? { ...p, featured: updatedFeatured } : p))
    )
  }

  const handleDeletePost = async (id: string, title: string) => {
    if (!window.confirm(`Are you sure you want to permanently delete "${title}"?`)) {
      return
    }

    const res = await postService.deletePost(id)
    if (res.success) {
      setPosts((prev) => prev.filter((p) => p.id !== id))
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold font-serif text-foreground">
            Articles & Pillar Content
          </h1>
          <p className="text-xs sm:text-sm text-foreground-muted">
            Manage, edit, publish, and feature publications across Blog, Learning, and Travel.
          </p>
        </div>

        <Link to="/admin/posts/new">
          <Button size="sm" variant="blog" leftIcon={<PlusCircle className="h-4 w-4" />}>
            New Article
          </Button>
        </Link>
      </div>

      {/* Filter Toolbar */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-3 rounded-2xl border border-border bg-surface p-4 shadow-2xs">
        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
          {/* Pillar Selector */}
          <select
            value={selectedPillar}
            onChange={(e) => setSelectedPillar(e.target.value as 'all' | PillarType)}
            className="rounded-xl border border-border bg-surface px-3 py-1.5 text-xs font-semibold text-foreground focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer"
          >
            <option value="all">All Pillars</option>
            <option value="blog">Blog (Tech)</option>
            <option value="learning">Learning Hub</option>
            <option value="travel">Travel Guides</option>
          </select>

          {/* Status Selector */}
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="rounded-xl border border-border bg-surface px-3 py-1.5 text-xs font-semibold text-foreground focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer"
          >
            <option value="all">All Statuses</option>
            <option value="published">Published</option>
            <option value="draft">Draft</option>
            <option value="archived">Archived</option>
          </select>
        </div>

        {/* Search */}
        <div className="relative w-full md:w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-foreground-muted" />
          <input
            type="text"
            placeholder="Search by title or tags..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-xl border border-border bg-surface-subtle/50 pl-9 pr-4 py-1.5 text-xs text-foreground placeholder:text-foreground-muted focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>
      </div>

      {/* Posts Table */}
      <div className="overflow-x-auto rounded-2xl border border-border bg-surface shadow-2xs">
        <table className="w-full text-left text-xs">
          <thead className="border-b border-border bg-surface-subtle/50 text-foreground-muted uppercase tracking-wider font-bold">
            <tr>
              <th className="py-3 px-4">Publication</th>
              <th className="py-3 px-4">Pillar</th>
              <th className="py-3 px-4">Status</th>
              <th className="py-3 px-4">Views</th>
              <th className="py-3 px-4">Date</th>
              <th className="py-3 px-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {loading ? (
              <tr>
                <td colSpan={6} className="py-12 text-center text-foreground-muted">
                  Loading publications...
                </td>
              </tr>
            ) : posts.length === 0 ? (
              <tr>
                <td colSpan={6} className="py-12 text-center text-foreground-muted">
                  No publications matched the current filters.
                </td>
              </tr>
            ) : (
              posts.map((post) => (
                <tr key={post.id} className="hover:bg-surface-subtle/40 transition-colors">
                  <td className="py-3.5 px-4 max-w-sm">
                    <div className="flex items-center gap-3">
                      <img
                        src={post.coverImage}
                        alt={post.title}
                        className="h-10 w-12 rounded-lg object-cover border border-border shrink-0"
                      />
                      <div className="overflow-hidden">
                        <span className="font-bold text-foreground block truncate">
                          {post.title}
                        </span>
                        <span className="text-[11px] text-foreground-muted block truncate font-mono">
                          /{post.slug}
                        </span>
                      </div>
                    </div>
                  </td>

                  <td className="py-3.5 px-4">
                    <Badge variant={post.pillar} size="sm">
                      {post.pillar}
                    </Badge>
                  </td>

                  <td className="py-3.5 px-4">
                    <span
                      className={`inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-[10px] font-bold uppercase ${
                        post.status === 'draft'
                          ? 'bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300'
                          : post.status === 'archived'
                          ? 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300'
                          : 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300'
                      }`}
                    >
                      {post.status || 'published'}
                    </span>
                  </td>

                  <td className="py-3.5 px-4 text-foreground-muted font-medium">
                    {post.views?.toLocaleString() || 0}
                  </td>

                  <td className="py-3.5 px-4 text-foreground-muted">
                    {post.publishedAt || 'Recently'}
                  </td>

                  <td className="py-3.5 px-4 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      {/* Featured Toggle */}
                      <button
                        onClick={() => handleToggleFeatured(post)}
                        className={`rounded-lg p-1.5 transition-colors cursor-pointer ${
                          post.featured
                            ? 'text-amber-500 bg-amber-50 dark:bg-amber-950/50'
                            : 'text-foreground-muted hover:text-foreground'
                        }`}
                        title={post.featured ? 'Unfeature Story' : 'Feature Story'}
                      >
                        <Star className={`h-4 w-4 ${post.featured ? 'fill-current' : ''}`} />
                      </button>

                      {/* Publish Toggle */}
                      <button
                        onClick={() => handleTogglePublish(post)}
                        className={`rounded-lg px-2 py-1 text-[11px] font-bold transition-colors cursor-pointer ${
                          post.status === 'published'
                            ? 'bg-surface-subtle text-foreground-muted hover:text-foreground'
                            : 'bg-emerald-600 text-white'
                        }`}
                        title={post.status === 'published' ? 'Unpublish to Draft' : 'Publish Article'}
                      >
                        {post.status === 'published' ? 'Draft' : 'Publish'}
                      </button>

                      {/* Edit */}
                      <Link to={`/admin/posts/edit/${post.id}`}>
                        <button
                          className="rounded-lg p-1.5 text-foreground-muted hover:bg-surface-subtle hover:text-indigo-600 cursor-pointer"
                          title="Edit Article"
                        >
                          <Edit3 className="h-4 w-4" />
                        </button>
                      </Link>

                      {/* View Live */}
                      <Link to={`/post/${post.slug}`} target="_blank" rel="noreferrer">
                        <button
                          className="rounded-lg p-1.5 text-foreground-muted hover:bg-surface-subtle hover:text-foreground cursor-pointer"
                          title="View Live Post"
                        >
                          <ExternalLink className="h-4 w-4" />
                        </button>
                      </Link>

                      {/* Delete */}
                      <button
                        onClick={() => handleDeletePost(post.id, post.title)}
                        className="rounded-lg p-1.5 text-foreground-muted hover:bg-surface-subtle hover:text-red-500 cursor-pointer"
                        title="Delete Article"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}

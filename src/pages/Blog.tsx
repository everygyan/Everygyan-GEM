import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { FileText, Clock, Calendar, ArrowRight, Eye, Search, Tag, Sparkles } from 'lucide-react'
import { Badge } from '../components/ui/Badge'
import { Button } from '../components/ui/Button'
import { Card } from '../components/ui/Card'
import { postService } from '../services/postService'
import type { Post } from '../types'

export const Blog: React.FC = () => {
  const [posts, setPosts] = useState<Post[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedTag, setSelectedTag] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [allTags, setAllTags] = useState<string[]>([])

  useEffect(() => {
    loadBlogData()
  }, [selectedTag, searchQuery])

  const loadBlogData = async () => {
    setLoading(true)
    try {
      const [postsRes, tagsRes] = await Promise.all([
        postService.getPosts({
          pillar: 'blog',
          tag: selectedTag ?? undefined,
          search: searchQuery || undefined,
        }),
        postService.getAllTags('blog'),
      ])
      setPosts(postsRes.posts)
      setAllTags(tagsRes)
    } finally {
      setLoading(false)
    }
  }

  const featuredPost = posts.find((p) => p.featured) || posts[0]
  const listPosts = featuredPost ? posts.filter((p) => p.id !== featuredPost.id) : posts

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Blog Pillar Header */}
      <div className="border-b border-border pb-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 rounded-lg bg-indigo-500/10 px-3 py-1 text-xs font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
              <FileText className="h-4 w-4" />
              <span>Pillar 1 • Engineering & Editorial</span>
            </div>
            <h1 className="mt-3 text-3xl font-extrabold tracking-tight text-foreground sm:text-4xl lg:text-5xl font-serif">
              The Architecture & Systems Blog
            </h1>
            <p className="mt-2 text-base text-foreground-muted max-w-2xl font-sans">
              Critical thinking, distributed system paradigms, and battle-tested architectural lessons from the front lines of web development.
            </p>
          </div>

          {/* Search bar inside Blog */}
          <div className="relative w-full sm:w-72">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-foreground-muted" />
            <input
              type="text"
              placeholder="Search blog topics..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-xl border border-border bg-surface pl-10 pr-4 py-2 text-sm text-foreground placeholder:text-foreground-muted focus:outline-none focus:ring-2 focus:ring-indigo-500 shadow-2xs"
            />
          </div>
        </div>

        {/* Tag Filters */}
        <div className="mt-6 flex flex-wrap items-center gap-2">
          <span className="text-xs font-semibold text-foreground-muted flex items-center gap-1 mr-1">
            <Tag className="h-3 w-3" />
            Topics:
          </span>
          <button
            onClick={() => setSelectedTag(null)}
            className={`rounded-lg px-3 py-1 text-xs font-medium transition-colors cursor-pointer ${
              selectedTag === null
                ? 'bg-indigo-600 text-white shadow-2xs'
                : 'bg-surface-subtle text-foreground-muted hover:text-foreground'
            }`}
          >
            All Topics
          </button>
          {allTags.map((tag) => (
            <button
              key={tag}
              onClick={() => setSelectedTag(tag === selectedTag ? null : tag)}
              className={`rounded-lg px-3 py-1 text-xs font-medium transition-colors cursor-pointer ${
                selectedTag === tag
                  ? 'bg-indigo-600 text-white shadow-2xs'
                  : 'bg-surface-subtle text-foreground-muted hover:text-foreground'
              }`}
            >
              #{tag}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="py-24 text-center text-foreground-muted text-sm">Loading blog publications...</div>
      ) : posts.length === 0 ? (
        <div className="py-24 text-center">
          <p className="text-base text-foreground">No posts matching your criteria.</p>
          <Button variant="outline" size="sm" className="mt-4" onClick={() => { setSelectedTag(null); setSearchQuery('') }}>
            Reset Filters
          </Button>
        </div>
      ) : (
        <div className="mt-8 space-y-12">
          {/* Featured Editorial Post */}
          {featuredPost && (
            <div className="group relative overflow-hidden rounded-3xl border border-border bg-surface p-6 sm:p-10 shadow-xs hover:shadow-md transition-all">
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
                <div className="lg:col-span-7 space-y-4">
                  <div className="flex items-center gap-2">
                    <Badge variant="blog" size="md" dot>
                      Lead Architecture Story
                    </Badge>
                    <span className="text-xs text-foreground-muted flex items-center gap-1">
                      <Clock className="h-3.5 w-3.5" />
                      {featuredPost.readTime}
                    </span>
                  </div>

                  <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold font-serif tracking-tight text-foreground group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                    <Link to={`/post/${featuredPost.slug}`}>{featuredPost.title}</Link>
                  </h2>

                  <p className="text-base text-foreground-muted font-sans leading-relaxed">
                    {featuredPost.excerpt}
                  </p>

                  <div className="pt-4 flex flex-wrap items-center justify-between gap-4 border-t border-border/80">
                    <div className="flex items-center gap-3">
                      <img
                        src={featuredPost.author.avatar}
                        alt={featuredPost.author.name}
                        className="h-10 w-10 rounded-full object-cover border border-border"
                      />
                      <div className="text-xs">
                        <p className="font-bold text-foreground">{featuredPost.author.name}</p>
                        <p className="text-foreground-muted">{featuredPost.author.role}</p>
                      </div>
                    </div>

                    <Link to={`/post/${featuredPost.slug}`}>
                      <Button variant="blog" size="sm" rightIcon={<ArrowRight className="h-4 w-4" />}>
                        Read Deep Dive
                      </Button>
                    </Link>
                  </div>
                </div>

                <div className="lg:col-span-5 overflow-hidden rounded-2xl">
                  <img
                    src={featuredPost.coverImage}
                    alt={featuredPost.title}
                    className="h-64 sm:h-80 w-full object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                </div>
              </div>
            </div>
          )}

          {/* List of Other Articles */}
          {listPosts.length > 0 && (
            <div>
              <h2 className="text-xl font-bold font-sans tracking-tight text-foreground mb-6 flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-indigo-500" />
                More Architectural Insights
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {listPosts.map((post) => (
                  <Card key={post.id} className="flex flex-col justify-between hover:-translate-y-1 transition-all">
                    <div className="overflow-hidden rounded-t-2xl">
                      <img
                        src={post.coverImage}
                        alt={post.title}
                        className="h-48 w-full object-cover hover:scale-105 transition-transform duration-300"
                      />
                    </div>
                    <div className="p-6 flex-1 flex flex-col justify-between">
                      <div>
                        <div className="flex items-center justify-between gap-2 text-xs text-foreground-muted">
                          <span className="flex items-center gap-1">
                            <Calendar className="h-3.5 w-3.5" />
                            {post.publishedAt}
                          </span>
                          <span className="flex items-center gap-1">
                            <Clock className="h-3.5 w-3.5" />
                            {post.readTime}
                          </span>
                        </div>

                        <h3 className="mt-3 text-lg font-bold font-serif text-foreground line-clamp-2 hover:text-indigo-600 transition-colors">
                          <Link to={`/post/${post.slug}`}>{post.title}</Link>
                        </h3>

                        <p className="mt-2 text-sm text-foreground-muted font-sans line-clamp-3">
                          {post.excerpt}
                        </p>
                      </div>

                      <div className="mt-6 pt-4 border-t border-border flex items-center justify-between text-xs text-foreground-muted">
                        <span className="flex items-center gap-1">
                          <Eye className="h-3.5 w-3.5" />
                          {post.views} views
                        </span>
                        <Link
                          to={`/post/${post.slug}`}
                          className="font-semibold text-indigo-600 dark:text-indigo-400 flex items-center gap-1 hover:underline"
                        >
                          Read <ArrowRight className="h-3.5 w-3.5" />
                        </Link>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

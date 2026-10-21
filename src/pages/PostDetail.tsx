import React, { useState, useEffect, useMemo } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import {
  Clock,
  Calendar,
  Eye,
  Copy,
  Check,
  Compass,
  BookOpen,
  ChevronRight,
  ListOrdered,
  Type,
  ArrowLeft,
  ArrowRight,
  Layers,
  Award,
  Bookmark,
} from 'lucide-react'
import { Badge } from '../components/ui/Badge'
import { Button } from '../components/ui/Button'
import { Card } from '../components/ui/Card'
import { useAuth } from '../context/AuthContext'
import { postService } from '../services/postService'
import { bookmarkService } from '../services/bookmarkService'
import { CommentSection } from '../components/comments/CommentSection'
import type { Post } from '../types'

interface TocItem {
  id: string
  text: string
  level: number
}

// Social Icons
const TwitterXIcon: React.FC<{ className?: string }> = ({ className = 'h-4 w-4' }) => (
  <svg className={className} fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
  </svg>
)

const LinkedinIcon: React.FC<{ className?: string }> = ({ className = 'h-4 w-4' }) => (
  <svg className={className} fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
    <path
      fillRule="evenodd"
      d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"
      clipRule="evenodd"
    />
  </svg>
)

// WhatsApp icon
const WhatsAppIcon: React.FC<{ className?: string }> = ({ className = 'h-4 w-4' }) => (
  <svg className={className} fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.885-9.884 9.885m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
  </svg>
)

export const PostDetail: React.FC = () => {
  const { slug } = useParams<{ slug: string }>()
  const navigate = useNavigate()
  const { user, isAuthenticated } = useAuth()
  const [post, setPost] = useState<Post | null>(null)
  const [relatedPosts, setRelatedPosts] = useState<Post[]>([])
  const [loading, setLoading] = useState(true)
  const [copiedLink, setCopiedLink] = useState(false)
  const [copiedCodeId, setCopiedCodeId] = useState<string | null>(null)
  const [scrollProgress, setScrollProgress] = useState(0)
  const [isBookmarked, setIsBookmarked] = useState(false)
  const [bookmarkFeedback, setBookmarkFeedback] = useState<string | null>(null)

  // Typography Preferences
  const [fontFamily, setFontFamily] = useState<'serif' | 'sans'>('serif')
  const [fontSize, setFontSize] = useState<'base' | 'lg' | 'xl'>('lg')
  const [isMobileTocOpen, setIsMobileTocOpen] = useState(false)

  useEffect(() => {
    if (slug) {
      loadPost(slug)
      window.scrollTo(0, 0)
    }
  }, [slug, user?.id])

  // Scroll Progress Listener
  useEffect(() => {
    const handleScroll = () => {
      const totalHeight = document.documentElement.scrollHeight - window.innerHeight
      if (totalHeight > 0) {
        const currentProgress = (window.scrollY / totalHeight) * 100
        setScrollProgress(Math.min(100, Math.max(0, currentProgress)))
      }
    }
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const loadPost = async (postSlug: string) => {
    setLoading(true)
    try {
      const data = await postService.getPostBySlug(postSlug)
      if (data) {
        setPost(data)
        const [related] = await Promise.all([
          postService.getRelatedPosts(data, 3),
          postService.incrementViewCount(postSlug),
        ])
        setRelatedPosts(related)

        if (user) {
          const bookmarked = await bookmarkService.isBookmarked(user.id, data.id)
          setIsBookmarked(bookmarked)
        }
      }
    } finally {
      setLoading(false)
    }
  }

  const handleToggleBookmark = async () => {
    if (!isAuthenticated || !user) {
      navigate('/login')
      return
    }
    if (!post) return

    const res = await bookmarkService.toggleBookmark(user.id, post.id)
    setIsBookmarked(res.isBookmarked)
    setBookmarkFeedback(res.isBookmarked ? 'Saved to reading list!' : 'Removed from reading list.')
    setTimeout(() => setBookmarkFeedback(null), 2500)
  }

  // Extract Table of Contents from Markdown headings
  const tableOfContents = useMemo<TocItem[]>(() => {
    if (!post?.content) return []
    const lines = post.content.split('\n')
    const items: TocItem[] = []

    lines.forEach((line) => {
      const h2Match = line.match(/^##\s+(.+)$/)
      const h3Match = line.match(/^###\s+(.+)$/)

      if (h2Match) {
        const text = h2Match[1].trim()
        const id = text.toLowerCase().replace(/[^\w\s-]/g, '').replace(/\s+/g, '-')
        items.push({ id, text, level: 2 })
      } else if (h3Match) {
        const text = h3Match[1].trim()
        const id = text.toLowerCase().replace(/[^\w\s-]/g, '').replace(/\s+/g, '-')
        items.push({ id, text, level: 3 })
      }
    })

    return items
  }, [post?.content])

  const copyToClipboard = () => {
    navigator.clipboard.writeText(window.location.href)
    setCopiedLink(true)
    setTimeout(() => setCopiedLink(false), 2000)
  }

  const copyCodeSnippet = (codeString: string, id: string) => {
    navigator.clipboard.writeText(codeString)
    setCopiedCodeId(id)
    setTimeout(() => setCopiedCodeId(null), 2000)
  }

  if (loading) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-24 text-center">
        <div className="h-8 w-48 mx-auto bg-surface-subtle animate-pulse rounded-md" />
        <div className="mt-4 h-4 w-72 mx-auto bg-surface-subtle animate-pulse rounded-md" />
        <div className="mt-12 h-64 w-full bg-surface-subtle animate-pulse rounded-2xl" />
      </div>
    )
  }

  if (!post) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-24 text-center">
        <h1 className="text-2xl font-bold text-foreground">Article Not Found</h1>
        <p className="mt-2 text-foreground-muted">The requested publication could not be found.</p>
        <div className="mt-6">
          <Link to="/">
            <Button size="sm" leftIcon={<ArrowLeft className="h-4 w-4" />}>
              Return Home
            </Button>
          </Link>
        </div>
      </div>
    )
  }

  const getPillarProgressColor = () => {
    switch (post.pillar) {
      case 'blog':
        return 'bg-indigo-600'
      case 'learning':
        return 'bg-emerald-600'
      case 'travel':
        return 'bg-amber-500'
    }
  }

  const fontSizeClass = {
    base: 'text-base leading-relaxed',
    lg: 'text-lg leading-relaxed',
    xl: 'text-xl leading-relaxed',
  }[fontSize]

  const fontClass = fontFamily === 'serif' ? 'font-serif' : 'font-sans'

  const meta = post.metadata

  return (
    <div className="relative w-full">
      {/* 1. TOP SCROLL READING PROGRESS BAR */}
      <div
        className="fixed top-0 left-0 right-0 z-50 h-1 bg-border/40"
        aria-hidden="true"
      >
        <div
          className={`h-full transition-all duration-75 ${getPillarProgressColor()}`}
          style={{ width: `${scrollProgress}%` }}
        />
      </div>

      {/* Floating Mobile TOC Pill */}
      <div className="fixed bottom-20 right-4 z-40 lg:hidden">
        <button
          onClick={() => setIsMobileTocOpen(true)}
          className="flex items-center gap-2 rounded-full border border-border bg-surface/90 backdrop-blur-md px-4 py-2.5 text-xs font-bold text-foreground shadow-lg cursor-pointer"
        >
          <ListOrdered className="h-4 w-4 text-indigo-500" />
          <span>Outline</span>
        </button>
      </div>

      {/* Mobile TOC Drawer Modal */}
      {isMobileTocOpen && (
        <div className="fixed inset-0 z-50 flex items-end justify-center lg:hidden" role="dialog">
          <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs" onClick={() => setIsMobileTocOpen(false)} />
          <div className="relative z-10 w-full max-h-[70vh] overflow-y-auto rounded-t-3xl border-t border-border bg-surface p-6 shadow-2xl animate-in slide-in-from-bottom">
            <div className="flex items-center justify-between pb-3 border-b border-border">
              <h3 className="font-bold text-base text-foreground flex items-center gap-2">
                <ListOrdered className="h-4 w-4 text-indigo-500" />
                Table of Contents
              </h3>
              <button
                onClick={() => setIsMobileTocOpen(false)}
                className="rounded-lg p-1 text-foreground-muted hover:bg-surface-subtle"
              >
                ✕
              </button>
            </div>
            <div className="mt-4 space-y-2">
              {tableOfContents.map((item) => (
                <a
                  key={item.id}
                  href={`#${item.id}`}
                  onClick={() => setIsMobileTocOpen(false)}
                  className={`block text-sm transition-colors py-1 ${
                    item.level === 3 ? 'pl-4 text-foreground-muted' : 'font-semibold text-foreground'
                  }`}
                >
                  {item.text}
                </a>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Hero Header */}
      <header className="mx-auto max-w-4xl px-4 pt-8 sm:px-6 lg:px-8">
        {/* Navigation Breadcrumb */}
        <div className="flex items-center gap-2 text-xs text-foreground-muted mb-6">
          <Link to="/" className="hover:text-foreground">Home</Link>
          <ChevronRight className="h-3.5 w-3.5" />
          <Link to={`/${post.pillar}`} className="capitalize hover:text-foreground">{post.pillar}</Link>
          <ChevronRight className="h-3.5 w-3.5" />
          <span className="truncate max-w-[200px] text-foreground font-medium">{post.title}</span>
        </div>

        {/* Pillar Accent & Reading Metadata */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <Badge variant={post.pillar} size="md" dot>
            {post.pillar}
          </Badge>
          <div className="flex flex-wrap items-center gap-4 text-xs text-foreground-muted">
            <span className="flex items-center gap-1">
              <Calendar className="h-3.5 w-3.5" />
              {post.publishedAt}
            </span>
            <span className="flex items-center gap-1">
              <Clock className="h-3.5 w-3.5" />
              {post.readTime}
            </span>
            <span className="flex items-center gap-1">
              <Eye className="h-3.5 w-3.5" />
              {post.views} views
            </span>
            <button
              onClick={handleToggleBookmark}
              className={`inline-flex items-center gap-1.5 rounded-xl border px-3 py-1 text-xs font-semibold transition-all cursor-pointer shadow-2xs ${
                isBookmarked
                  ? 'border-indigo-500 bg-indigo-50 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300'
                  : 'border-border bg-surface text-foreground-muted hover:text-foreground hover:bg-surface-subtle'
              }`}
              title={isBookmarked ? 'Remove from bookmarks' : 'Save to bookmarks'}
            >
              <Bookmark className={`h-3.5 w-3.5 ${isBookmarked ? 'fill-current text-indigo-600 dark:text-indigo-400' : ''}`} />
              <span>{isBookmarked ? 'Saved' : 'Save'}</span>
            </button>
          </div>
        </div>

        {/* Main Article Title */}
        <h1 className="mt-6 text-3xl sm:text-4xl md:text-5xl font-extrabold font-serif tracking-tight text-foreground leading-tight">
          {post.title}
        </h1>

        {/* Excerpt */}
        <p className="mt-4 text-lg text-foreground-muted font-sans leading-relaxed">
          {post.excerpt}
        </p>

        {/* Author Bio Bar */}
        <div className="mt-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-y border-border py-4">
          <div className="flex items-center gap-3">
            <img
              src={post.author.avatar}
              alt={post.author.name}
              className="h-12 w-12 rounded-full object-cover border border-border"
            />
            <div>
              <p className="font-bold text-sm text-foreground">{post.author.name}</p>
              <p className="text-xs text-foreground-muted">{post.author.role}</p>
            </div>
          </div>

          {/* Typography Controls */}
          <div className="flex items-center gap-2 rounded-xl border border-border bg-surface p-1 shadow-2xs">
            <span className="text-[11px] font-bold text-foreground-muted px-2 flex items-center gap-1">
              <Type className="h-3 w-3" />
              Reading:
            </span>
            {/* Serif / Sans Toggle */}
            <button
              onClick={() => setFontFamily((prev) => (prev === 'serif' ? 'sans' : 'serif'))}
              className="rounded-lg px-2 py-1 text-xs font-semibold hover:bg-surface-subtle transition-colors cursor-pointer text-foreground"
              title="Toggle Serif / Sans-serif typography"
            >
              {fontFamily === 'serif' ? 'Serif' : 'Sans'}
            </button>
            {/* Font size toggles */}
            {(['base', 'lg', 'xl'] as const).map((sz) => (
              <button
                key={sz}
                onClick={() => setFontSize(sz)}
                className={`rounded-lg px-2 py-1 text-xs font-semibold cursor-pointer ${
                  fontSize === sz ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900' : 'text-foreground-muted hover:text-foreground'
                }`}
              >
                {sz === 'base' ? 'A' : sz === 'lg' ? 'A+' : 'A++'}
              </button>
            ))}
          </div>
        </div>

        {/* Cover Image */}
        <div className="mt-8 overflow-hidden rounded-3xl border border-border">
          <img
            src={post.coverImage}
            alt={post.title}
            className="w-full max-h-[500px] object-cover"
          />
        </div>
      </header>

      {/* Main Content Layout with Sticky Sidebar (Desktop) */}
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          {/* Main Article Column */}
          <main className="lg:col-span-8 lg:order-1">
            {/* 2. SPECIALIZED METADATA CALLOUT BOXES */}
            {post.pillar === 'travel' && meta && (
              <div className="mb-10 rounded-2xl border border-amber-300/80 bg-amber-50/50 p-6 sm:p-8 dark:border-amber-900/60 dark:bg-amber-950/20 shadow-xs">
                <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-amber-700 dark:text-amber-400">
                  <Compass className="h-4 w-4" />
                  <span>Trip Quick Facts & Itinerary Summary</span>
                </div>
                <div className="mt-4 grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
                  <div>
                    <span className="text-foreground-muted">Location</span>
                    <p className="font-bold text-foreground mt-0.5">{meta.location}</p>
                  </div>
                  <div>
                    <span className="text-foreground-muted">Best Season</span>
                    <p className="font-bold text-foreground mt-0.5">{meta.bestSeason}</p>
                  </div>
                  <div>
                    <span className="text-foreground-muted">Budget Level</span>
                    <p className="font-bold text-foreground mt-0.5">{meta.budgetLevel}</p>
                  </div>
                  <div>
                    <span className="text-foreground-muted">Duration</span>
                    <p className="font-bold text-foreground mt-0.5">{meta.duration}</p>
                  </div>
                </div>

                {meta.highlights && meta.highlights.length > 0 && (
                  <div className="mt-4 pt-4 border-t border-amber-200 dark:border-amber-900/60">
                    <span className="text-xs font-bold text-amber-800 dark:text-amber-300">
                      Curated Highlights:
                    </span>
                    <ul className="mt-2 grid grid-cols-1 sm:grid-cols-2 gap-1.5 text-xs text-foreground">
                      {meta.highlights.map((item, idx) => (
                        <li key={idx} className="flex items-center gap-1.5">
                          <Check className="h-3.5 w-3.5 text-amber-500 shrink-0" />
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}

            {post.pillar === 'learning' && meta && (
              <div className="mb-10 rounded-2xl border border-emerald-300/80 bg-emerald-50/50 p-6 sm:p-8 dark:border-emerald-900/60 dark:bg-emerald-950/20 shadow-xs">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-400">
                    <BookOpen className="h-4 w-4" />
                    <span>Prerequisites & Key Takeaways</span>
                  </div>
                  <span className="rounded-md bg-emerald-600 px-2 py-0.5 text-[10px] font-bold text-white">
                    Module {meta.moduleNumber ?? 1}
                  </span>
                </div>

                <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-6 text-xs">
                  {meta.prerequisites && (
                    <div>
                      <p className="font-bold text-foreground mb-1.5 flex items-center gap-1">
                        <Layers className="h-3.5 w-3.5 text-emerald-500" />
                        Prerequisites:
                      </p>
                      <ul className="space-y-1 text-foreground-muted">
                        {meta.prerequisites.map((p, i) => (
                          <li key={i}>• {p}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {meta.takeaways && (
                    <div>
                      <p className="font-bold text-foreground mb-1.5 flex items-center gap-1">
                        <Award className="h-3.5 w-3.5 text-emerald-500" />
                        Key Outcomes:
                      </p>
                      <ul className="space-y-1 text-foreground-muted">
                        {meta.takeaways.map((t, i) => (
                          <li key={i}>• {t}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Markdown Article Body */}
            <article className={`prose dark:prose-invert max-w-none text-foreground ${fontClass} ${fontSizeClass}`}>
              <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                components={{
                  h2: ({ children }) => {
                    const text = String(children)
                    const id = text.toLowerCase().replace(/[^\w\s-]/g, '').replace(/\s+/g, '-')
                    return (
                      <h2 id={id} className="mt-10 mb-4 text-2xl sm:text-3xl font-bold font-serif text-foreground scroll-mt-24 border-b border-border/60 pb-2">
                        {children}
                      </h2>
                    )
                  },
                  h3: ({ children }) => {
                    const text = String(children)
                    const id = text.toLowerCase().replace(/[^\w\s-]/g, '').replace(/\s+/g, '-')
                    return (
                      <h3 id={id} className="mt-8 mb-3 text-xl font-bold font-serif text-foreground scroll-mt-24">
                        {children}
                      </h3>
                    )
                  },
                  blockquote: ({ children }) => (
                    <blockquote className="my-6 border-l-4 border-indigo-500 bg-surface-subtle/50 px-6 py-4 italic text-foreground rounded-r-2xl font-serif">
                      {children}
                    </blockquote>
                  ),
                  table: ({ children }) => (
                    <div className="my-6 w-full overflow-x-auto rounded-2xl border border-border">
                      <table className="w-full text-left text-sm">{children}</table>
                    </div>
                  ),
                  th: ({ children }) => (
                    <th className="bg-surface-subtle px-4 py-3 font-bold text-foreground border-b border-border">
                      {children}
                    </th>
                  ),
                  td: ({ children }) => (
                    <td className="px-4 py-3 text-foreground-muted border-b border-border/60">
                      {children}
                    </td>
                  ),
                  code: ({ className, children, ...props }) => {
                    const isInline = !className
                    const codeString = String(children).replace(/\n$/, '')
                    const snippetId = `snippet-${Math.random().toString(36).substring(2, 7)}`

                    if (isInline) {
                      return (
                        <code className="rounded bg-surface-subtle px-1.5 py-0.5 font-mono text-sm text-indigo-600 dark:text-indigo-400 font-semibold" {...props}>
                          {children}
                        </code>
                      )
                    }

                    const lang = className ? className.replace('language-', '') : 'code'

                    return (
                      <div className="relative my-6 overflow-hidden rounded-2xl border border-border bg-slate-900 text-slate-100 shadow-md">
                        <div className="flex items-center justify-between bg-slate-950/80 px-4 py-2 text-xs font-mono text-slate-400 border-b border-slate-800">
                          <span className="uppercase tracking-wider font-bold">{lang}</span>
                          <button
                            onClick={() => copyCodeSnippet(codeString, snippetId)}
                            className="flex items-center gap-1 rounded px-2 py-1 hover:bg-slate-800 text-slate-300 transition-colors cursor-pointer"
                            title="Copy code"
                          >
                            {copiedCodeId === snippetId ? (
                              <>
                                <Check className="h-3.5 w-3.5 text-emerald-400" />
                                <span className="text-[11px] text-emerald-400">Copied</span>
                              </>
                            ) : (
                              <>
                                <Copy className="h-3.5 w-3.5" />
                                <span className="text-[11px]">Copy</span>
                              </>
                            )}
                          </button>
                        </div>
                        <pre className="overflow-x-auto p-4 font-mono text-sm leading-relaxed text-slate-200">
                          <code>{children}</code>
                        </pre>
                      </div>
                    )
                  },
                  img: ({ src, alt }) => (
                    <img
                      src={src}
                      alt={alt}
                      className="my-8 rounded-2xl border border-border w-full max-h-[480px] object-cover"
                    />
                  ),
                }}
              >
                {post.content}
              </ReactMarkdown>
            </article>

            {/* Tags and Social Share Bar */}
            <div className="mt-12 pt-8 border-t border-border">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-xs font-bold text-foreground-muted">Tagged in:</span>
                  {post.tags.map((tag) => (
                    <span
                      key={tag}
                      className="rounded-lg bg-surface-subtle px-2.5 py-1 text-xs font-medium text-foreground-muted"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>

                {/* Social Share & Action Buttons */}
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-foreground-muted mr-1">Share:</span>
                  <button
                    onClick={handleToggleBookmark}
                    className={`rounded-xl border p-2 transition-colors cursor-pointer shadow-2xs ${
                      isBookmarked
                        ? 'border-indigo-500 bg-indigo-50 text-indigo-600 dark:bg-indigo-950/60 dark:text-indigo-400'
                        : 'border-border text-foreground-muted hover:bg-surface-subtle hover:text-foreground'
                    }`}
                    title={isBookmarked ? 'Remove Bookmark' : 'Bookmark Article'}
                  >
                    <Bookmark className={`h-4 w-4 ${isBookmarked ? 'fill-current' : ''}`} />
                  </button>
                  <button
                    onClick={copyToClipboard}
                    className="rounded-xl border border-border p-2 text-foreground-muted hover:bg-surface-subtle hover:text-foreground transition-colors cursor-pointer shadow-2xs"
                    title="Copy Link to Clipboard"
                  >
                    {copiedLink ? <Check className="h-4 w-4 text-emerald-500" /> : <Copy className="h-4 w-4" />}
                  </button>
                  <a
                    href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(post.title)}&url=${encodeURIComponent(window.location.href)}`}
                    target="_blank"
                    rel="noreferrer"
                    className="rounded-xl border border-border p-2 text-foreground-muted hover:bg-surface-subtle hover:text-indigo-500 transition-colors shadow-2xs"
                    title="Share on X / Twitter"
                  >
                    <TwitterXIcon className="h-4 w-4" />
                  </a>
                  <a
                    href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(window.location.href)}`}
                    target="_blank"
                    rel="noreferrer"
                    className="rounded-xl border border-border p-2 text-foreground-muted hover:bg-surface-subtle hover:text-blue-500 transition-colors shadow-2xs"
                    title="Share on LinkedIn"
                  >
                    <LinkedinIcon className="h-4 w-4" />
                  </a>
                  <a
                    href={`https://api.whatsapp.com/send?text=${encodeURIComponent(`${post.title} - ${window.location.href}`)}`}
                    target="_blank"
                    rel="noreferrer"
                    className="rounded-xl border border-border p-2 text-foreground-muted hover:bg-surface-subtle hover:text-emerald-500 transition-colors shadow-2xs"
                    title="Share on WhatsApp"
                  >
                    <WhatsAppIcon className="h-4 w-4" />
                  </a>
                </div>
              </div>

              {bookmarkFeedback && (
                <div className="mt-3 text-right text-xs font-semibold text-indigo-600 dark:text-indigo-400">
                  {bookmarkFeedback}
                </div>
              )}

              {/* 3. COMMUNITY COMMENTS & DISCUSSION */}
              <CommentSection
                postId={post.id}
                postSlug={post.slug}
                postAuthorName={post.author.name}
              />
            </div>
          </main>

          {/* Sticky Desktop Table of Contents Sidebar */}
          <aside className="hidden lg:block lg:col-span-4 lg:order-2">
            <div className="sticky top-24 space-y-6">
              {tableOfContents.length > 0 && (
                <div className="rounded-2xl border border-border bg-surface p-6 shadow-xs">
                  <h3 className="font-bold text-sm text-foreground flex items-center gap-2 pb-3 border-b border-border">
                    <ListOrdered className="h-4 w-4 text-indigo-500" />
                    Table of Contents
                  </h3>
                  <nav className="mt-4 space-y-2 max-h-[60vh] overflow-y-auto">
                    {tableOfContents.map((item) => (
                      <a
                        key={item.id}
                        href={`#${item.id}`}
                        className={`block text-xs transition-colors hover:text-indigo-600 dark:hover:text-indigo-400 ${
                          item.level === 3 ? 'pl-3 text-foreground-muted' : 'font-semibold text-foreground'
                        }`}
                      >
                        {item.text}
                      </a>
                    ))}
                  </nav>
                </div>
              )}

              {/* Author Card Widget */}
              <div className="rounded-2xl border border-border bg-surface p-6 shadow-xs">
                <p className="text-xs font-bold uppercase tracking-wider text-foreground-muted mb-3">Written by</p>
                <div className="flex items-center gap-3">
                  <img
                    src={post.author.avatar}
                    alt={post.author.name}
                    className="h-12 w-12 rounded-full object-cover border border-border"
                  />
                  <div>
                    <h4 className="font-bold text-sm text-foreground">{post.author.name}</h4>
                    <p className="text-xs text-foreground-muted">{post.author.role}</p>
                  </div>
                </div>
                {post.author.bio && (
                  <p className="mt-3 text-xs text-foreground-muted leading-relaxed font-sans">
                    {post.author.bio}
                  </p>
                )}
              </div>
            </div>
          </aside>
        </div>
      </div>

      {/* Related Articles Section */}
      {relatedPosts.length > 0 && (
        <section className="border-t border-border bg-surface-subtle/30 py-16">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h3 className="text-2xl font-bold font-serif text-foreground">
                  Continue Reading
                </h3>
                <p className="text-xs text-foreground-muted mt-1">Recommended articles from the EveryGyan knowledge base</p>
              </div>
              <Link to={`/${post.pillar}`} className="text-xs font-bold text-indigo-600 dark:text-indigo-400 flex items-center gap-1">
                Explore All {post.pillar} <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {relatedPosts.map((item) => (
                <Card key={item.id} className="flex flex-col justify-between hover:-translate-y-1 transition-all">
                  <div className="overflow-hidden rounded-t-2xl">
                    <img
                      src={item.coverImage}
                      alt={item.title}
                      className="h-44 w-full object-cover"
                    />
                  </div>
                  <div className="p-6 flex-1 flex flex-col justify-between">
                    <div>
                      <Badge variant={item.pillar} size="sm">
                        {item.pillar}
                      </Badge>
                      <h4 className="mt-3 font-bold font-serif text-base text-foreground line-clamp-2 hover:text-indigo-600 transition-colors">
                        <Link to={`/post/${item.slug}`}>{item.title}</Link>
                      </h4>
                      <p className="mt-2 text-xs text-foreground-muted line-clamp-2">
                        {item.excerpt}
                      </p>
                    </div>

                    <div className="mt-4 pt-3 border-t border-border flex items-center justify-between text-xs text-foreground-muted">
                      <span>{item.readTime}</span>
                      <Link to={`/post/${item.slug}`} className="font-semibold text-indigo-600 dark:text-indigo-400 flex items-center gap-1">
                        Read <ArrowRight className="h-3 w-3" />
                      </Link>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        </section>
      )}
    </div>
  )
}

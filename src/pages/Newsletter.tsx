import React, { useState, useEffect } from 'react'
import {
  Mail,
  Sparkles,
  Check,
  Calendar,
  Users,
  ArrowRight,
  Search,
  BookOpen,
  X,
  Copy,
} from 'lucide-react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { Button } from '../components/ui/Button'
import { Input } from '../components/ui/Input'
import { Badge } from '../components/ui/Badge'
import { newsletterService } from '../services/newsletterService'
import type { Newsletter as NewsletterType, SubscriberPreferences } from '../types'

// Social Share Icons
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

export const Newsletter: React.FC = () => {
  const [email, setEmail] = useState('')
  const [preferences, setPreferences] = useState<SubscriberPreferences>({
    blog: true,
    learning: true,
    travel: true,
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  // Past Editions Archive
  const [editions, setEditions] = useState<NewsletterType[]>([])
  const [loadingEditions, setLoadingEditions] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')

  // Reader Modal State
  const [selectedEdition, setSelectedEdition] = useState<NewsletterType | null>(null)
  const [copiedLink, setCopiedLink] = useState(false)

  useEffect(() => {
    loadArchive()
  }, [])

  const loadArchive = async () => {
    setLoadingEditions(true)
    try {
      const data = await newsletterService.getSentNewsletters()
      setEditions(data)
    } finally {
      setLoadingEditions(false)
    }
  }

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault()
    setStatusMessage(null)
    setIsSubmitting(true)

    try {
      const res = await newsletterService.subscribe(email, preferences, 'newsletter_landing_page')
      if (res.success) {
        setStatusMessage({ type: 'success', text: res.message })
        setEmail('')
      } else {
        setStatusMessage({ type: 'error', text: res.message })
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  const filteredEditions = editions.filter(
    (ed) =>
      ed.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (ed.previewText && ed.previewText.toLowerCase().includes(searchQuery.toLowerCase()))
  )

  const copyEditionLink = () => {
    navigator.clipboard.writeText(window.location.href)
    setCopiedLink(true)
    setTimeout(() => setCopiedLink(false), 2000)
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      {/* 1. HERO & SUBSCRIPTION SECTION */}
      <div className="relative overflow-hidden rounded-3xl border border-indigo-200/80 bg-gradient-to-b from-indigo-50/70 via-surface to-surface p-8 sm:p-12 lg:p-16 dark:border-indigo-900/50 dark:from-indigo-950/30 shadow-xs">
        <div className="mx-auto max-w-3xl text-center">
          <div className="inline-flex items-center gap-2 rounded-xl bg-indigo-500/10 px-3.5 py-1.5 text-xs font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
            <Sparkles className="h-4 w-4" />
            <span>The Weekly Gyan Dispatch</span>
          </div>

          <h1 className="mt-4 text-3xl font-extrabold font-serif tracking-tight text-foreground sm:text-5xl lg:text-6xl">
            Signal, Not Noise. Delivered Every Sunday.
          </h1>

          <p className="mt-4 text-base sm:text-lg text-foreground-muted leading-relaxed font-sans">
            Join over 14,000 engineers, architects, and slow travelers. We curate one architectural deep dive, one hands-on coding tutorial, and one authentic travel itinerary straight to your inbox.
          </p>

          {/* Subscription Card Form */}
          <form onSubmit={handleSubscribe} className="mt-8 text-left">
            <div className="rounded-2xl border border-border bg-surface p-6 shadow-md">
              <span className="block text-xs font-bold uppercase tracking-wider text-foreground mb-3">
                Choose what you want to receive:
              </span>

              {/* Topic Selectors */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-5">
                <label className="flex items-center gap-2.5 rounded-xl border border-border/80 p-3 hover:bg-surface-subtle transition-colors cursor-pointer text-xs font-semibold text-foreground">
                  <input
                    type="checkbox"
                    checked={preferences.blog}
                    onChange={(e) =>
                      setPreferences((prev) => ({ ...prev, blog: e.target.checked }))
                    }
                    className="h-4 w-4 rounded border-border text-indigo-600 focus:ring-indigo-500"
                  />
                  <span>Architecture Blog</span>
                </label>

                <label className="flex items-center gap-2.5 rounded-xl border border-border/80 p-3 hover:bg-surface-subtle transition-colors cursor-pointer text-xs font-semibold text-foreground">
                  <input
                    type="checkbox"
                    checked={preferences.learning}
                    onChange={(e) =>
                      setPreferences((prev) => ({ ...prev, learning: e.target.checked }))
                    }
                    className="h-4 w-4 rounded border-border text-emerald-600 focus:ring-emerald-500"
                  />
                  <span>Learning Tracks</span>
                </label>

                <label className="flex items-center gap-2.5 rounded-xl border border-border/80 p-3 hover:bg-surface-subtle transition-colors cursor-pointer text-xs font-semibold text-foreground">
                  <input
                    type="checkbox"
                    checked={preferences.travel}
                    onChange={(e) =>
                      setPreferences((prev) => ({ ...prev, travel: e.target.checked }))
                    }
                    className="h-4 w-4 rounded border-border text-amber-500 focus:ring-amber-500"
                  />
                  <span>Travel Logs</span>
                </label>
              </div>

              {/* Email Input & Subscribe Button */}
              <div className="flex flex-col sm:flex-row gap-3">
                <div className="relative flex-1">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-foreground-muted" />
                  <Input
                    type="email"
                    required
                    placeholder="Enter your personal email address..."
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <Button
                  type="submit"
                  variant="blog"
                  isLoading={isSubmitting}
                  className="sm:w-auto"
                >
                  Join the Gyan Letter
                </Button>
              </div>

              {/* Status Message */}
              {statusMessage && (
                <div
                  className={`mt-4 rounded-xl p-3 text-xs flex items-center gap-2 ${
                    statusMessage.type === 'success'
                      ? 'border border-emerald-300 bg-emerald-50 text-emerald-800 dark:border-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300'
                      : 'border border-red-300 bg-red-50 text-red-800 dark:border-red-900/60 dark:bg-red-950/40 dark:text-red-300'
                  }`}
                >
                  {statusMessage.type === 'success' && <Check className="h-4 w-4 text-emerald-600 shrink-0" />}
                  <span>{statusMessage.text}</span>
                </div>
              )}

              <p className="mt-3 text-[11px] text-foreground-muted text-center sm:text-left">
                Strict privacy guarantee. No third-party tracking. Unsubscribe with 1-click at any time.
              </p>
            </div>
          </form>
        </div>
      </div>

      {/* 2. PAST WEEKLY LETTERS ARCHIVE */}
      <section className="mt-16">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-6 border-b border-border">
          <div>
            <div className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
              <BookOpen className="h-4 w-4" />
              <span>Public Edition Library</span>
            </div>
            <h2 className="mt-1.5 text-2xl sm:text-3xl font-extrabold font-serif text-foreground">
              Past Weekly Letters Archive
            </h2>
            <p className="mt-1 text-xs text-foreground-muted">
              Browse, read, and share all previous editions of the EveryGyan Weekly Letter.
            </p>
          </div>

          {/* Search Archive */}
          <div className="relative w-full sm:w-72">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-foreground-muted" />
            <input
              type="text"
              placeholder="Search previous editions..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-xl border border-border bg-surface pl-10 pr-4 py-2 text-xs text-foreground placeholder:text-foreground-muted focus:outline-none focus:ring-2 focus:ring-indigo-500 shadow-2xs"
            />
          </div>
        </div>

        {/* Archive Cards Grid */}
        <div className="mt-8">
          {loadingEditions ? (
            <div className="py-16 text-center text-sm text-foreground-muted">Loading editions archive...</div>
          ) : filteredEditions.length === 0 ? (
            <div className="py-16 text-center text-sm text-foreground-muted">
              No editions matched &ldquo;{searchQuery}&rdquo;.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {filteredEditions.map((edition) => (
                <div
                  key={edition.id}
                  className="group flex flex-col justify-between rounded-2xl border border-border bg-surface p-6 shadow-2xs hover:shadow-md hover:border-indigo-500/40 transition-all"
                >
                  <div>
                    <div className="flex items-center justify-between gap-2 text-xs text-foreground-muted">
                      <span className="flex items-center gap-1">
                        <Calendar className="h-3.5 w-3.5" />
                        {edition.sentAt ? new Date(edition.sentAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'Recently'}
                      </span>
                      <span className="flex items-center gap-1 rounded-md bg-surface-subtle px-2 py-0.5 text-[11px] font-semibold">
                        <Users className="h-3 w-3 text-indigo-500" />
                        {(edition.sentCount / 1000).toFixed(1)}k readers
                      </span>
                    </div>

                    <h3 className="mt-3 font-bold font-serif text-lg text-foreground group-hover:text-indigo-600 transition-colors">
                      {edition.subject}
                    </h3>

                    <p className="mt-2 text-xs text-foreground-muted leading-relaxed line-clamp-2">
                      {edition.previewText}
                    </p>
                  </div>

                  <div className="mt-6 pt-4 border-t border-border flex items-center justify-between">
                    <button
                      onClick={() => setSelectedEdition(edition)}
                      className="inline-flex items-center gap-1.5 text-xs font-bold text-indigo-600 dark:text-indigo-400 group-hover:underline cursor-pointer"
                    >
                      <span>Read Letter Online</span>
                      <ArrowRight className="h-3.5 w-3.5" />
                    </button>
                    <Badge variant="blog" size="sm">
                      Weekly Letter
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* 3. LETTER VIEWER MODAL */}
      {selectedEdition && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6"
          role="dialog"
          aria-modal="true"
        >
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-slate-950/70 backdrop-blur-xs transition-opacity"
            onClick={() => setSelectedEdition(null)}
          />

          {/* Modal Container */}
          <div className="relative z-10 w-full max-w-3xl max-h-[85vh] overflow-y-auto rounded-3xl border border-border bg-surface p-6 sm:p-8 shadow-2xl">
            {/* Modal Header */}
            <div className="flex items-start justify-between pb-4 border-b border-border">
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
                  EveryGyan Weekly Dispatch
                </span>
                <h2 className="mt-1 text-xl sm:text-2xl font-bold font-serif text-foreground">
                  {selectedEdition.subject}
                </h2>
                <div className="mt-2 flex items-center gap-3 text-xs text-foreground-muted">
                  <span className="flex items-center gap-1">
                    <Calendar className="h-3.5 w-3.5" />
                    {selectedEdition.sentAt
                      ? new Date(selectedEdition.sentAt).toLocaleDateString('en-US', {
                          month: 'long',
                          day: 'numeric',
                          year: 'numeric',
                        })
                      : 'Recently'}
                  </span>
                  <span>•</span>
                  <span>{selectedEdition.sentCount.toLocaleString()} Subscribers</span>
                </div>
              </div>

              <button
                onClick={() => setSelectedEdition(null)}
                className="rounded-xl border border-border p-2 text-foreground-muted hover:bg-surface-subtle hover:text-foreground cursor-pointer"
                title="Close Viewer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Markdown Body */}
            <div className="prose dark:prose-invert max-w-none py-6 font-serif text-foreground text-sm sm:text-base leading-relaxed">
              <ReactMarkdown remarkPlugins={[remarkGfm]}>
                {selectedEdition.contentMarkdown || selectedEdition.previewText || ''}
              </ReactMarkdown>
            </div>

            {/* Modal Footer / Share Actions */}
            <div className="flex items-center justify-between pt-4 border-t border-border">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-foreground-muted">Share Edition:</span>
                <button
                  onClick={copyEditionLink}
                  className="rounded-lg border border-border p-1.5 text-foreground-muted hover:bg-surface-subtle hover:text-foreground transition-colors cursor-pointer"
                  title="Copy link"
                >
                  {copiedLink ? <Check className="h-3.5 w-3.5 text-emerald-500" /> : <Copy className="h-3.5 w-3.5" />}
                </button>
                <a
                  href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(selectedEdition.subject)}&url=${encodeURIComponent(window.location.href)}`}
                  target="_blank"
                  rel="noreferrer"
                  className="rounded-lg border border-border p-1.5 text-foreground-muted hover:bg-surface-subtle hover:text-indigo-500 transition-colors"
                  title="Share on X"
                >
                  <TwitterXIcon className="h-3.5 w-3.5" />
                </a>
                <a
                  href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(window.location.href)}`}
                  target="_blank"
                  rel="noreferrer"
                  className="rounded-lg border border-border p-1.5 text-foreground-muted hover:bg-surface-subtle hover:text-blue-500 transition-colors"
                  title="Share on LinkedIn"
                >
                  <LinkedinIcon className="h-3.5 w-3.5" />
                </a>
              </div>

              <Button size="sm" onClick={() => setSelectedEdition(null)}>
                Close Reader
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

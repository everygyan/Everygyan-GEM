import React, { useState, useEffect } from 'react'
import {
  Mail,
  Download,
  Send,
  Save,
  CheckCircle,
  Copy,
  Users,
  Search,
  BookOpen,
  Compass,
  FileText,
  Check,
  Calendar,
  Bold,
  Italic,
  Heading,
  Code,
  Quote,
  List,
  Eye,
  RefreshCw,
} from 'lucide-react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { Button } from '../../components/ui/Button'
import { Input } from '../../components/ui/Input'
import { Badge } from '../../components/ui/Badge'
import { Modal } from '../../components/ui/Modal'
import { newsletterService } from '../../services/newsletterService'
import type { Subscriber, Newsletter } from '../../types'

export const AdminNewsletters: React.FC = () => {
  const [activeMainTab, setActiveMainTab] = useState<'subscribers' | 'studio' | 'archive'>('subscribers')

  // --- Subscribers State ---
  const [subscribers, setSubscribers] = useState<Subscriber[]>([])
  const [subLoading, setSubLoading] = useState(true)
  const [subSearch, setSubSearch] = useState('')
  const [subPillar, setSubPillar] = useState<'all' | 'blog' | 'learning' | 'travel'>('all')
  const [subStatus, setSubStatus] = useState<string>('all')
  const [copiedCsvToast, setCopiedCsvToast] = useState(false)

  // --- Studio State ---
  const [subject, setSubject] = useState('Gyan Letter: Inside Distributed Systems & Slow Travel')
  const [previewText, setPreviewText] = useState('A handpicked weekly digest on software craftsmanship, learning paths, and scenic horizons.')
  const [contentMarkdown, setContentMarkdown] = useState(`
# The Art of Intentional Engineering

Welcome to this Sunday's edition of the **EveryGyan Weekly Letter**!

Every week, we pause the relentless cycle of rapid ship-and-break to reflect on what makes code resilient, learning durable, and travel authentic.

## What's in this Edition

1. **Architecture Spotlight**: Why monolithic simplicity often outperforms premature microservice splits.
2. **Learning Roadmap**: Understanding Database indexing from B-Trees to LSM Trees.
3. **Wanderlust**: 3 quiet seaside towns in southern Portugal to work remotely.

> "Simplicity is prerequisite for reliability." — Edsger W. Dijkstra

Until next week, keep building with clarity.  
— Devansh & The EveryGyan Editorial Team
`.trim())
  const [studioTab, setStudioTab] = useState<'write' | 'preview'>('write')
  const [isSavingDraft, setIsSavingDraft] = useState(false)
  const [draftSavedMsg, setDraftSavedMsg] = useState(false)
  const [isSending, setIsSending] = useState(false)
  const [sendModalOpen, setSendModalOpen] = useState(false)
  const [sendSuccessMsg, setSendSuccessMsg] = useState<string | null>(null)
  const [copiedHtmlToast, setCopiedHtmlToast] = useState(false)

  // --- Archive State ---
  const [newsletters, setNewsletters] = useState<Newsletter[]>([])
  const [archiveLoading, setArchiveLoading] = useState(true)

  // Load subscribers
  useEffect(() => {
    loadSubscribers()
  }, [subPillar, subStatus, subSearch])

  // Load archive
  useEffect(() => {
    loadArchive()
  }, [])

  const loadSubscribers = async () => {
    setSubLoading(true)
    try {
      const data = await newsletterService.adminGetSubscribers({
        status: subStatus,
        pillar: subPillar,
        search: subSearch,
      })
      setSubscribers(data)
    } finally {
      setSubLoading(false)
    }
  }

  const loadArchive = async () => {
    setArchiveLoading(true)
    try {
      const data = await newsletterService.adminGetAllNewsletters()
      setNewsletters(data)
    } finally {
      setArchiveLoading(false)
    }
  }

  const handleExportCsv = () => {
    const csvContent = newsletterService.exportSubscribersToCsv(subscribers)
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.setAttribute('download', `everygyan_subscribers_${new Date().toISOString().slice(0, 10)}.csv`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)

    setCopiedCsvToast(true)
    setTimeout(() => setCopiedCsvToast(false), 3000)
  }

  const handleSaveDraft = async () => {
    setIsSavingDraft(true)
    try {
      await newsletterService.adminCreateWeeklyLetter({
        subject,
        previewText,
        contentMarkdown,
        status: 'draft',
      })
      setDraftSavedMsg(true)
      loadArchive()
      setTimeout(() => setDraftSavedMsg(false), 3000)
    } finally {
      setIsSavingDraft(false)
    }
  }

  const handleSendBroadcast = async () => {
    setIsSending(true)
    try {
      // First ensure draft is recorded
      const created = await newsletterService.adminCreateWeeklyLetter({
        subject,
        previewText,
        contentMarkdown,
        status: 'draft',
      })

      if (created.letter) {
        const res = await newsletterService.adminSendWeeklyLetter(created.letter.id)
        if (res.success) {
          setSendModalOpen(false)
          setSendSuccessMsg(`Successfully broadcasted to ${res.sentCount.toLocaleString()} subscribers!`)
          loadArchive()
          setTimeout(() => setSendSuccessMsg(null), 5000)
        }
      }
    } finally {
      setIsSending(false)
    }
  }

  // Generate Email-Ready HTML
  const generateEmailHtml = () => {
    return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${subject}</title>
</head>
<body style="margin: 0; padding: 32px 16px; background-color: #FAF9F6; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #0F172A;">
  <div style="max-width: 600px; margin: 0 auto; background-color: #FFFFFF; border: 1px solid #E2E8F0; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.03);">
    <div style="background-color: #4F46E5; padding: 24px; text-align: center;">
      <h1 style="color: #FFFFFF; margin: 0; font-size: 22px; font-weight: 800; letter-spacing: -0.5px;">EveryGyan</h1>
      <p style="color: #E0E7FF; margin: 6px 0 0 0; font-size: 13px; font-weight: 500;">Weekly Wisdom & Field Dispatches</p>
    </div>
    <div style="padding: 32px 28px; line-height: 1.7; font-size: 16px;">
      <h2 style="margin-top: 0; font-size: 22px; color: #0F172A;">${subject}</h2>
      ${previewText ? `<p style="color: #64748B; font-size: 14px; font-style: italic; border-left: 3px solid #4F46E5; padding-left: 12px; margin-bottom: 24px;">${previewText}</p>` : ''}
      <div style="color: #334155;">
        ${contentMarkdown.replace(/\n\n/g, '<br/><br/>')}
      </div>
    </div>
    <div style="background-color: #F8FAFC; border-top: 1px solid #E2E8F0; padding: 20px 24px; text-align: center; font-size: 12px; color: #64748B;">
      <p style="margin: 0 0 8px 0;">You received this email because you subscribed to the EveryGyan Weekly Letter.</p>
      <p style="margin: 0;">
        <a href="https://everygyan.com" style="color: #4F46E5; text-decoration: none; font-weight: 600;">Visit EveryGyan</a> &bull; 
        <a href="https://everygyan.com/newsletter" style="color: #4F46E5; text-decoration: none; font-weight: 600;">Update Preferences</a> &bull; 
        <a href="https://everygyan.com/unsubscribe" style="color: #94A3B8; text-decoration: underline;">Unsubscribe</a>
      </p>
    </div>
  </div>
</body>
</html>`
  }

  const handleCopyEmailHtml = () => {
    const html = generateEmailHtml()
    navigator.clipboard.writeText(html)
    setCopiedHtmlToast(true)
    setTimeout(() => setCopiedHtmlToast(false), 3000)
  }

  const insertMarkdown = (prefix: string, suffix = '') => {
    const textarea = document.getElementById('newsletter-markdown-area') as HTMLTextAreaElement
    if (!textarea) return

    const start = textarea.selectionStart
    const end = textarea.selectionEnd
    const selected = contentMarkdown.substring(start, end)
    const replacement = prefix + (selected || 'text') + suffix

    const updated = contentMarkdown.substring(0, start) + replacement + contentMarkdown.substring(end)
    setContentMarkdown(updated)

    setTimeout(() => {
      textarea.focus()
      textarea.setSelectionRange(start + prefix.length, start + prefix.length + (selected || 'text').length)
    }, 10)
  }

  // Active subscribers count
  const activeSubsCount = subscribers.filter((s) => s.status === 'active').length

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold font-serif text-foreground">
            Newsletter & Subscriber Studio
          </h1>
          <p className="text-sm text-foreground-muted mt-1">
            Manage your audience, inspect interest by pillar, compose Weekly Letters, and export callsets.
          </p>
        </div>

        {/* Global Toast Alerts */}
        {copiedCsvToast && (
          <div className="flex items-center gap-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20 px-3.5 py-2 text-xs font-bold text-emerald-600 dark:text-emerald-400">
            <Check className="h-4 w-4" />
            <span>CSV downloaded successfully!</span>
          </div>
        )}
        {draftSavedMsg && (
          <div className="flex items-center gap-2 rounded-xl bg-indigo-500/10 border border-indigo-500/20 px-3.5 py-2 text-xs font-bold text-indigo-600 dark:text-indigo-400">
            <Check className="h-4 w-4" />
            <span>Draft saved to database!</span>
          </div>
        )}
        {copiedHtmlToast && (
          <div className="flex items-center gap-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20 px-3.5 py-2 text-xs font-bold text-emerald-600 dark:text-emerald-400">
            <Check className="h-4 w-4" />
            <span>Email HTML copied to clipboard!</span>
          </div>
        )}
      </div>

      {sendSuccessMsg && (
        <div className="rounded-xl bg-emerald-500/10 border border-emerald-500/20 p-4 text-sm font-semibold text-emerald-600 dark:text-emerald-400 flex items-center gap-3">
          <CheckCircle className="h-5 w-5 shrink-0" />
          <span>{sendSuccessMsg}</span>
        </div>
      )}

      {/* Main Tab Bar */}
      <div className="flex items-center gap-2 border-b border-border pb-2">
        <button
          onClick={() => setActiveMainTab('subscribers')}
          className={`flex items-center gap-2 rounded-xl px-4 py-2.5 text-xs font-bold transition-colors cursor-pointer ${
            activeMainTab === 'subscribers'
              ? 'bg-indigo-600 text-white shadow-xs'
              : 'text-foreground-muted hover:bg-surface-subtle hover:text-foreground'
          }`}
        >
          <Users className="h-4 w-4" />
          <span>Subscribers ({subscribers.length})</span>
        </button>

        <button
          onClick={() => setActiveMainTab('studio')}
          className={`flex items-center gap-2 rounded-xl px-4 py-2.5 text-xs font-bold transition-colors cursor-pointer ${
            activeMainTab === 'studio'
              ? 'bg-indigo-600 text-white shadow-xs'
              : 'text-foreground-muted hover:bg-surface-subtle hover:text-foreground'
          }`}
        >
          <Mail className="h-4 w-4" />
          <span>Weekly Letter Composer</span>
        </button>

        <button
          onClick={() => setActiveMainTab('archive')}
          className={`flex items-center gap-2 rounded-xl px-4 py-2.5 text-xs font-bold transition-colors cursor-pointer ${
            activeMainTab === 'archive'
              ? 'bg-indigo-600 text-white shadow-xs'
              : 'text-foreground-muted hover:bg-surface-subtle hover:text-foreground'
          }`}
        >
          <Calendar className="h-4 w-4" />
          <span>Past Editions Archive ({newsletters.length})</span>
        </button>
      </div>

      {/* TAB 1: SUBSCRIBERS */}
      {activeMainTab === 'subscribers' && (
        <div className="space-y-6">
          {/* Quick Metrics Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="rounded-2xl border border-border bg-surface p-4">
              <span className="text-xs text-foreground-muted font-medium">Total Active</span>
              <p className="text-2xl font-bold font-serif text-foreground mt-1">
                {activeSubsCount.toLocaleString()}
              </p>
            </div>
            <div className="rounded-2xl border border-border bg-surface p-4">
              <span className="text-xs text-foreground-muted font-medium">Tech & Architecture</span>
              <p className="text-2xl font-bold font-serif text-indigo-600 dark:text-indigo-400 mt-1">
                {subscribers.filter((s) => s.preferences.blog).length}
              </p>
            </div>
            <div className="rounded-2xl border border-border bg-surface p-4">
              <span className="text-xs text-foreground-muted font-medium">Learning Tutorials</span>
              <p className="text-2xl font-bold font-serif text-emerald-600 dark:text-emerald-400 mt-1">
                {subscribers.filter((s) => s.preferences.learning).length}
              </p>
            </div>
            <div className="rounded-2xl border border-border bg-surface p-4">
              <span className="text-xs text-foreground-muted font-medium">Travel & Itineraries</span>
              <p className="text-2xl font-bold font-serif text-amber-600 dark:text-amber-400 mt-1">
                {subscribers.filter((s) => s.preferences.travel).length}
              </p>
            </div>
          </div>

          {/* Filter Bar & Export */}
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 rounded-2xl border border-border bg-surface p-4">
            <div className="flex flex-wrap items-center gap-3 flex-1">
              <div className="relative w-full sm:w-64">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-foreground-muted" />
                <Input
                  value={subSearch}
                  onChange={(e) => setSubSearch(e.target.value)}
                  placeholder="Filter by email..."
                  className="pl-9 h-9 text-xs"
                />
              </div>

              {/* Pillar Preference Filter */}
              <div className="flex items-center gap-1 rounded-xl border border-border bg-surface-subtle p-1 text-xs">
                {(['all', 'blog', 'learning', 'travel'] as const).map((p) => (
                  <button
                    key={p}
                    onClick={() => setSubPillar(p)}
                    className={`rounded-lg px-2.5 py-1 font-semibold capitalize transition-colors cursor-pointer ${
                      subPillar === p
                        ? 'bg-surface text-foreground shadow-xs'
                        : 'text-foreground-muted hover:text-foreground'
                    }`}
                  >
                    {p}
                  </button>
                ))}
              </div>

              {/* Status Filter */}
              <select
                value={subStatus}
                onChange={(e) => setSubStatus(e.target.value)}
                className="h-9 rounded-xl border border-border bg-surface px-3 text-xs font-medium text-foreground focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="all">All Statuses</option>
                <option value="active">Active Only</option>
                <option value="unsubscribed">Unsubscribed</option>
              </select>
            </div>

            <Button
              onClick={handleExportCsv}
              variant="outline"
              size="sm"
              leftIcon={<Download className="h-4 w-4" />}
            >
              Export CSV ({subscribers.length})
            </Button>
          </div>

          {/* Subscribers Table */}
          <div className="overflow-hidden rounded-2xl border border-border bg-surface shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="border-b border-border bg-surface-subtle text-[11px] font-bold uppercase tracking-wider text-foreground-muted">
                  <tr>
                    <th className="px-5 py-3.5">Email Address</th>
                    <th className="px-5 py-3.5">Status</th>
                    <th className="px-5 py-3.5">Pillar Preferences</th>
                    <th className="px-5 py-3.5">Acquisition Source</th>
                    <th className="px-5 py-3.5">Subscribed Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {subLoading ? (
                    <tr>
                      <td colSpan={5} className="py-12 text-center text-foreground-muted">
                        <RefreshCw className="h-5 w-5 animate-spin mx-auto mb-2 text-indigo-500" />
                        <span>Loading subscribers...</span>
                      </td>
                    </tr>
                  ) : subscribers.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="py-12 text-center text-foreground-muted">
                        No subscribers match the current filter.
                      </td>
                    </tr>
                  ) : (
                    subscribers.map((sub) => (
                      <tr key={sub.id} className="hover:bg-surface-subtle/50 transition-colors">
                        <td className="px-5 py-3.5 font-medium text-foreground">
                          {sub.email}
                        </td>
                        <td className="px-5 py-3.5">
                          {sub.status === 'active' ? (
                            <Badge variant="learning" size="sm">Active</Badge>
                          ) : (
                            <Badge variant="outline" size="sm">Unsubscribed</Badge>
                          )}
                        </td>
                        <td className="px-5 py-3.5">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            {sub.preferences.blog && (
                              <span className="inline-flex items-center gap-1 rounded-md bg-indigo-500/10 px-2 py-0.5 text-[10px] font-bold text-indigo-600 dark:text-indigo-400">
                                <FileText className="h-3 w-3" />
                                Blog
                              </span>
                            )}
                            {sub.preferences.learning && (
                              <span className="inline-flex items-center gap-1 rounded-md bg-emerald-500/10 px-2 py-0.5 text-[10px] font-bold text-emerald-600 dark:text-emerald-400">
                                <BookOpen className="h-3 w-3" />
                                Learning
                              </span>
                            )}
                            {sub.preferences.travel && (
                              <span className="inline-flex items-center gap-1 rounded-md bg-amber-500/10 px-2 py-0.5 text-[10px] font-bold text-amber-600 dark:text-amber-400">
                                <Compass className="h-3 w-3" />
                                Travel
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="px-5 py-3.5 text-foreground-muted font-mono capitalize">
                          {sub.source}
                        </td>
                        <td className="px-5 py-3.5 text-foreground-muted">
                          {new Date(sub.createdAt).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric',
                          })}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: WEEKLY LETTER STUDIO */}
      {activeMainTab === 'studio' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Composer Form */}
          <div className="lg:col-span-2 space-y-6">
            <div className="rounded-2xl border border-border bg-surface p-5 space-y-4">
              <div>
                <label className="block text-xs font-bold text-foreground mb-1.5">
                  Edition Subject Line *
                </label>
                <Input
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  placeholder="e.g. Gyan Letter #43: The Evolution of Serverless Architecture"
                  className="font-medium text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-foreground mb-1.5">
                  Inbox Preview Text / Preheader
                </label>
                <Input
                  value={previewText}
                  onChange={(e) => setPreviewText(e.target.value)}
                  placeholder="Displayed in email client notifications (120-150 chars)"
                  className="text-xs text-foreground-muted"
                />
              </div>

              {/* Write vs Preview Tabs */}
              <div>
                <div className="flex items-center justify-between border-b border-border pb-2 mb-3">
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setStudioTab('write')}
                      className={`rounded-lg px-3 py-1.5 text-xs font-bold transition-colors cursor-pointer ${
                        studioTab === 'write'
                          ? 'bg-surface-subtle text-foreground'
                          : 'text-foreground-muted hover:text-foreground'
                      }`}
                    >
                      Write Markdown
                    </button>
                    <button
                      type="button"
                      onClick={() => setStudioTab('preview')}
                      className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-bold transition-colors cursor-pointer ${
                        studioTab === 'preview'
                          ? 'bg-surface-subtle text-foreground'
                          : 'text-foreground-muted hover:text-foreground'
                      }`}
                    >
                      <Eye className="h-3.5 w-3.5" />
                      <span>Live Inbox Preview</span>
                    </button>
                  </div>

                  {studioTab === 'write' && (
                    <div className="flex items-center gap-1 flex-wrap">
                      <button
                        type="button"
                        onClick={() => insertMarkdown('**', '**')}
                        title="Bold"
                        className="rounded-lg p-1.5 text-foreground-muted hover:bg-surface-subtle hover:text-foreground cursor-pointer"
                      >
                        <Bold className="h-3.5 w-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => insertMarkdown('*', '*')}
                        title="Italic"
                        className="rounded-lg p-1.5 text-foreground-muted hover:bg-surface-subtle hover:text-foreground cursor-pointer"
                      >
                        <Italic className="h-3.5 w-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => insertMarkdown('## ')}
                        title="Heading"
                        className="rounded-lg p-1.5 text-foreground-muted hover:bg-surface-subtle hover:text-foreground cursor-pointer"
                      >
                        <Heading className="h-3.5 w-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => insertMarkdown('> ')}
                        title="Quote"
                        className="rounded-lg p-1.5 text-foreground-muted hover:bg-surface-subtle hover:text-foreground cursor-pointer"
                      >
                        <Quote className="h-3.5 w-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => insertMarkdown('`', '`')}
                        title="Code"
                        className="rounded-lg p-1.5 text-foreground-muted hover:bg-surface-subtle hover:text-foreground cursor-pointer"
                      >
                        <Code className="h-3.5 w-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => insertMarkdown('* ')}
                        title="Bullet List"
                        className="rounded-lg p-1.5 text-foreground-muted hover:bg-surface-subtle hover:text-foreground cursor-pointer"
                      >
                        <List className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  )}
                </div>

                {studioTab === 'write' ? (
                  <textarea
                    id="newsletter-markdown-area"
                    value={contentMarkdown}
                    onChange={(e) => setContentMarkdown(e.target.value)}
                    rows={16}
                    placeholder="Write the weekly gyan dispatch in Markdown..."
                    className="w-full rounded-xl border border-border bg-background p-4 font-mono text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-indigo-500 leading-relaxed resize-y"
                  />
                ) : (
                  <div className="rounded-xl border border-border bg-background p-6">
                    {/* Simulated Email Envelope */}
                    <div className="rounded-xl border border-border bg-surface p-4 mb-4 text-xs space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-foreground-muted">From:</span>
                        <span className="text-foreground">Devansh &bull; EveryGyan &lt;hello@everygyan.com&gt;</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-foreground-muted">Subject:</span>
                        <span className="text-foreground font-semibold">{subject}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-foreground-muted">Preheader:</span>
                        <span className="text-foreground-muted italic">{previewText}</span>
                      </div>
                    </div>

                    <div className="prose prose-slate dark:prose-invert max-w-none text-sm leading-relaxed">
                      <ReactMarkdown remarkPlugins={[remarkGfm]}>
                        {contentMarkdown}
                      </ReactMarkdown>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Sidebar Actions & Dispatch Control */}
          <div className="space-y-6">
            <div className="rounded-2xl border border-border bg-surface p-5 space-y-4">
              <h2 className="text-sm font-bold font-serif text-foreground">
                Dispatch Broadcast
              </h2>
              <p className="text-xs text-foreground-muted leading-relaxed">
                Dispatching will send this Weekly Letter to all active subscribers with matching topic preferences.
              </p>

              <div className="rounded-xl bg-surface-subtle border border-border p-3 text-xs space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-foreground-muted">Active Recipients:</span>
                  <span className="font-bold text-foreground font-mono">
                    {activeSubsCount.toLocaleString()}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-foreground-muted">Estimated Delivery:</span>
                  <span className="font-bold text-emerald-600 dark:text-emerald-400">
                    &lt; 30 seconds
                  </span>
                </div>
              </div>

              <div className="space-y-2.5 pt-2">
                <Button
                  onClick={() => setSendModalOpen(true)}
                  variant="blog"
                  className="w-full"
                  leftIcon={<Send className="h-4 w-4" />}
                >
                  Publish & Broadcast
                </Button>

                <Button
                  onClick={handleSaveDraft}
                  disabled={isSavingDraft}
                  variant="outline"
                  className="w-full"
                  leftIcon={<Save className="h-4 w-4" />}
                >
                  {isSavingDraft ? 'Saving Draft...' : 'Save as Draft'}
                </Button>
              </div>
            </div>

            <div className="rounded-2xl border border-border bg-surface p-5 space-y-3">
              <h3 className="text-xs font-bold text-foreground uppercase tracking-wider">
                External Dispatcher
              </h3>
              <p className="text-xs text-foreground-muted leading-relaxed">
                Need to dispatch via Mailchimp, Substack, Resend, or SendGrid? Copy self-contained inline-styled HTML ready to paste.
              </p>

              <Button
                onClick={handleCopyEmailHtml}
                variant="outline"
                size="sm"
                className="w-full"
                leftIcon={<Copy className="h-4 w-4" />}
              >
                Copy Email HTML
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: ARCHIVE */}
      {activeMainTab === 'archive' && (
        <div className="rounded-2xl border border-border bg-surface shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-border bg-surface-subtle text-[11px] font-bold uppercase tracking-wider text-foreground-muted">
                <tr>
                  <th className="px-5 py-3.5">Edition Subject</th>
                  <th className="px-5 py-3.5">Status</th>
                  <th className="px-5 py-3.5">Broadcast Count</th>
                  <th className="px-5 py-3.5">Sent Date</th>
                  <th className="px-5 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {archiveLoading ? (
                  <tr>
                    <td colSpan={5} className="py-12 text-center text-foreground-muted">
                      <RefreshCw className="h-5 w-5 animate-spin mx-auto mb-2 text-indigo-500" />
                      <span>Loading newsletter archive...</span>
                    </td>
                  </tr>
                ) : newsletters.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-12 text-center text-foreground-muted">
                      No broadcast editions found in database.
                    </td>
                  </tr>
                ) : (
                  newsletters.map((nl) => (
                    <tr key={nl.id} className="hover:bg-surface-subtle/50 transition-colors">
                      <td className="px-5 py-3.5 font-medium text-foreground max-w-md truncate">
                        {nl.subject}
                      </td>
                      <td className="px-5 py-3.5">
                        {nl.status === 'sent' ? (
                          <Badge variant="learning" size="sm">Sent</Badge>
                        ) : (
                          <Badge variant="outline" size="sm">Draft</Badge>
                        )}
                      </td>
                      <td className="px-5 py-3.5 font-mono text-foreground-muted">
                        {nl.sentCount ? `${nl.sentCount.toLocaleString()} readers` : '—'}
                      </td>
                      <td className="px-5 py-3.5 text-foreground-muted">
                        {nl.sentAt
                          ? new Date(nl.sentAt).toLocaleDateString('en-US', {
                              month: 'short',
                              day: 'numeric',
                              year: 'numeric',
                            })
                          : 'Not Sent Yet'}
                      </td>
                      <td className="px-5 py-3.5 text-right">
                        <Button
                          onClick={() => {
                            setSubject(nl.subject)
                            setPreviewText(nl.previewText || '')
                            setContentMarkdown(nl.contentMarkdown || '')
                            setActiveMainTab('studio')
                          }}
                          variant="ghost"
                          size="sm"
                        >
                          Load in Studio
                        </Button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Broadcast Confirmation Modal */}
      <Modal
        isOpen={sendModalOpen}
        onClose={() => setSendModalOpen(false)}
        title="Confirm Broadcast Dispatch"
      >
        <div className="space-y-4">
          <p className="text-sm text-foreground">
            You are about to dispatch <strong>"{subject}"</strong> to{' '}
            <strong className="text-indigo-600 dark:text-indigo-400">
              {activeSubsCount.toLocaleString()} active subscribers
            </strong>.
          </p>
          <div className="rounded-xl bg-amber-500/10 border border-amber-500/20 p-3 text-xs text-amber-700 dark:text-amber-300">
            Once sent, this edition will be visible on the public Weekly Letters Archive at <code>/newsletter</code>.
          </div>
          <div className="flex justify-end gap-3 pt-3">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setSendModalOpen(false)}
              disabled={isSending}
            >
              Cancel
            </Button>
            <Button
              variant="blog"
              size="sm"
              onClick={handleSendBroadcast}
              disabled={isSending}
              leftIcon={<Send className="h-4 w-4" />}
            >
              {isSending ? 'Sending Dispatch...' : 'Yes, Send Broadcast Now'}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  )
}

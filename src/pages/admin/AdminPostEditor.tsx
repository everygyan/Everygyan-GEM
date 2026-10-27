import React, { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import {
  ArrowLeft,
  Save,
  Check,
  AlertCircle,
  Bold,
  Italic,
  Heading,
  Code,
  Quote,
  List,
  Compass,
  BookOpen,
  X,
  Plus,
  Image as ImageIcon,
  Link as LinkIcon,
  Sparkles,
  UploadCloud,
} from 'lucide-react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { Button } from '../../components/ui/Button'
import { Input } from '../../components/ui/Input'
import { Badge } from '../../components/ui/Badge'
import { ImageUploader } from '../../components/admin/ImageUploader'
import { InlineImageModal } from '../../components/admin/InlineImageModal'
import { compressImageToWebP, uploadImageToStorage } from '../../lib/imageCompressor'
import { postService } from '../../services/postService'
import type { Post, PillarType, DifficultyLevel, BudgetLevel } from '../../types'

export const AdminPostEditor: React.FC = () => {
  const { id } = useParams<{ id: string }>()
  const isEditing = Boolean(id)
  const navigate = useNavigate()

  const [title, setTitle] = useState('')
  const [slug, setSlug] = useState('')
  const [pillar, setPillar] = useState<PillarType>('blog')
  const [status, setStatus] = useState<'draft' | 'published' | 'archived'>('published')
  const [featured, setFeatured] = useState(false)
  const [excerpt, setExcerpt] = useState('')
  const [content, setContent] = useState('')
  const [coverImage, setCoverImage] = useState('')
  const [tags, setTags] = useState<string[]>(['Architecture', 'Systems'])
  const [newTagInput, setNewTagInput] = useState('')
  const [readTime, setReadTime] = useState('5 min read')

  // Dynamic Metadata: Travel
  const [travelLocation, setTravelLocation] = useState('')
  const [travelSeason, setTravelSeason] = useState('')
  const [travelBudget, setTravelBudget] = useState<BudgetLevel>('$$$')
  const [travelDuration, setTravelDuration] = useState('7 Days')
  const [travelHighlights, setTravelHighlights] = useState<string[]>([])
  const [newHighlight, setNewHighlight] = useState('')

  // Dynamic Metadata: Learning
  const [learningDifficulty, setLearningDifficulty] = useState<DifficultyLevel>('Intermediate')
  const [learningModule, setLearningModule] = useState(1)
  const [learningTotalModules, setLearningTotalModules] = useState(5)
  const [learningHours, setLearningHours] = useState('2.5 Hours')
  const [learningPrereqs, setLearningPrereqs] = useState<string[]>([])
  const [newPrereq, setNewPrereq] = useState('')
  const [learningTakeaways, setLearningTakeaways] = useState<string[]>([])

  // View state
  const [activeTab, setActiveTab] = useState<'editor' | 'preview'>('editor')
  const [isSaving, setIsSaving] = useState(false)
  const [saveSuccess, setSaveSuccess] = useState(false)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)

  // Inline Image & Editor interaction states
  const [isImageModalOpen, setIsImageModalOpen] = useState(false)
  const [savedSelection, setSavedSelection] = useState<{ start: number; end: number } | null>(null)
  const [isDraggingOverEditor, setIsDraggingOverEditor] = useState(false)
  const [editorStatusToast, setEditorStatusToast] = useState<string | null>(null)

  useEffect(() => {
    if (isEditing && id) {
      loadPost(id)
    }
  }, [id])

  // Auto-calculate reading time on content changes
  useEffect(() => {
    const wordCount = content.trim().split(/\s+/).filter(Boolean).length
    const minutes = Math.max(1, Math.ceil(wordCount / 200))
    setReadTime(`${minutes} min read`)
  }, [content])

  const loadPost = async (postId: string) => {
    const post = await postService.getPostById(postId)
    if (post) {
      setTitle(post.title)
      setSlug(post.slug)
      setPillar(post.pillar)
      setStatus(post.status || 'published')
      setFeatured(Boolean(post.featured))
      setExcerpt(post.excerpt)
      setContent(post.content)
      setCoverImage(post.coverImage)
      setTags(post.tags)
      setReadTime(post.readTime)

      // Metadata
      if (post.pillar === 'travel' && post.metadata) {
        setTravelLocation(post.metadata.location || '')
        setTravelSeason(post.metadata.bestSeason || '')
        setTravelBudget((post.metadata.budgetLevel as BudgetLevel) || '$$$')
        setTravelDuration(post.metadata.duration || '7 Days')
        setTravelHighlights(post.metadata.highlights || [])
      } else if (post.pillar === 'learning' && post.metadata) {
        setLearningDifficulty((post.metadata.difficulty as DifficultyLevel) || 'Intermediate')
        setLearningModule(post.metadata.moduleNumber || 1)
        setLearningTotalModules(post.metadata.totalModules || 5)
        setLearningHours(post.metadata.estimatedHours || '2.5 Hours')
        setLearningPrereqs(post.metadata.prerequisites || [])
        setLearningTakeaways(post.metadata.takeaways || [])
      }
    }
  }

  const handleTitleChange = (newTitle: string) => {
    setTitle(newTitle)
    if (!isEditing || !slug) {
      const generatedSlug = newTitle
        .toLowerCase()
        .replace(/[^\w\s-]/g, '')
        .replace(/\s+/g, '-')
      setSlug(generatedSlug)
    }
  }

  const handleAddTag = (e: React.KeyboardEvent) => {
    if ((e.key === 'Enter' || e.key === ',') && newTagInput.trim()) {
      e.preventDefault()
      const clean = newTagInput.trim().replace(/^#/, '')
      if (!tags.includes(clean)) {
        setTags([...tags, clean])
      }
      setNewTagInput('')
    }
  }

  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter((t) => t !== tagToRemove))
  }

  const insertMarkdown = (before: string, after: string = '') => {
    const textarea = document.getElementById('post-markdown-editor') as HTMLTextAreaElement
    if (!textarea) return

    const start = textarea.selectionStart
    const end = textarea.selectionEnd
    const selected = content.substring(start, end)
    const replacement = `${before}${selected || 'text'}${after}`

    const updated = content.substring(0, start) + replacement + content.substring(end)
    setContent(updated)

    setTimeout(() => {
      textarea.focus()
      textarea.setSelectionRange(start + before.length, start + before.length + (selected ? selected.length : 4))
    }, 10)
  }

  const insertTextAtCursor = (textToInsert: string, customStart?: number, customEnd?: number) => {
    const textarea = document.getElementById('post-markdown-editor') as HTMLTextAreaElement
    const start = customStart ?? textarea?.selectionStart ?? content.length
    const end = customEnd ?? textarea?.selectionEnd ?? content.length

    const updated = content.substring(0, start) + textToInsert + content.substring(end)
    setContent(updated)

    if (textarea) {
      setTimeout(() => {
        textarea.focus()
        const newPos = start + textToInsert.length
        textarea.setSelectionRange(newPos, newPos)
      }, 10)
    }
  }

  const handleOpenImageModal = () => {
    const textarea = document.getElementById('post-markdown-editor') as HTMLTextAreaElement
    if (textarea) {
      setSavedSelection({
        start: textarea.selectionStart,
        end: textarea.selectionEnd,
      })
    } else {
      setSavedSelection(null)
    }
    setIsImageModalOpen(true)
  }

  const handleInsertImageFromModal = (imageMarkdown: string) => {
    if (savedSelection) {
      insertTextAtCursor(imageMarkdown, savedSelection.start, savedSelection.end)
    } else {
      insertTextAtCursor(imageMarkdown)
    }
    setEditorStatusToast('✓ Inline image added to article')
    setTimeout(() => setEditorStatusToast(null), 3000)
  }

  const handleInsertLink = () => {
    const textarea = document.getElementById('post-markdown-editor') as HTMLTextAreaElement
    if (!textarea) return

    const start = textarea.selectionStart
    const end = textarea.selectionEnd
    const selected = content.substring(start, end)

    const url = window.prompt('Enter link URL (e.g. https://...):', 'https://')
    if (!url) return

    const label = selected.trim() || 'Link text'
    const linkMarkdown = `[${label}](${url})`
    insertTextAtCursor(linkMarkdown, start, end)
  }

  const handleEditorPaste = async (e: React.ClipboardEvent<HTMLTextAreaElement>) => {
    const items = e.clipboardData?.items
    if (!items) return

    let imageFile: File | null = null
    for (let i = 0; i < items.length; i++) {
      if (items[i].type.startsWith('image/')) {
        imageFile = items[i].getAsFile()
        break
      }
    }

    if (!imageFile) return // Standard text paste

    e.preventDefault()

    const textarea = e.currentTarget
    const start = textarea.selectionStart
    const end = textarea.selectionEnd
    const placeholder = `\n![Uploading image (${imageFile.name || 'clipboard'})...]()\n`

    const before = content.substring(0, start)
    const after = content.substring(end)
    setContent(before + placeholder + after)
    setEditorStatusToast('Compressing & uploading pasted image...')

    try {
      const compressed = await compressImageToWebP(imageFile, {
        maxWidth: 1600,
        maxHeight: 1600,
        quality: 0.82,
      })

      const uploadRes = await uploadImageToStorage(compressed.file, 'media', 'articles')
      if (uploadRes.error) throw new Error(uploadRes.error)

      const markdownSnippet = `\n![Image](${uploadRes.url})\n\n`
      setContent((prev) => prev.replace(placeholder, markdownSnippet))
      setEditorStatusToast(`✓ Pasted image uploaded (${Math.round(compressed.compressedSize / 1024)} KB WebP)`)
      setTimeout(() => setEditorStatusToast(null), 4000)
    } catch (err: unknown) {
      const msg = (err as Error)?.message || 'Failed to process pasted image'
      setContent((prev) => prev.replace(placeholder, `\n<!-- Image upload failed: ${msg} -->\n`))
      setErrorMsg(`Paste error: ${msg}`)
    }
  }

  const handleEditorDragOver = (e: React.DragEvent<HTMLTextAreaElement>) => {
    if (e.dataTransfer.types.includes('Files')) {
      e.preventDefault()
      setIsDraggingOverEditor(true)
    }
  }

  const handleEditorDragLeave = (e: React.DragEvent<HTMLTextAreaElement>) => {
    e.preventDefault()
    setIsDraggingOverEditor(false)
  }

  const handleEditorDrop = async (e: React.DragEvent<HTMLTextAreaElement>) => {
    e.preventDefault()
    setIsDraggingOverEditor(false)

    const files = e.dataTransfer.files
    if (!files || files.length === 0) return

    const imageFile = Array.from(files).find((f) => f.type.startsWith('image/'))
    if (!imageFile) return

    const textarea = e.currentTarget
    const start = textarea.selectionStart
    const end = textarea.selectionEnd
    const placeholder = `\n![Uploading dropped image (${imageFile.name})...]()\n`

    const before = content.substring(0, start)
    const after = content.substring(end)
    setContent(before + placeholder + after)
    setEditorStatusToast('Uploading dropped image to WebP...')

    try {
      const compressed = await compressImageToWebP(imageFile, {
        maxWidth: 1600,
        maxHeight: 1600,
        quality: 0.82,
      })

      const uploadRes = await uploadImageToStorage(compressed.file, 'media', 'articles')
      if (uploadRes.error) throw new Error(uploadRes.error)

      const cleanAlt = imageFile.name
        .replace(/\.[^/.]+$/, '')
        .replace(/[-_]/g, ' ')
        .replace(/\b\w/g, (c) => c.toUpperCase())
      const markdownSnippet = `\n![${cleanAlt}](${uploadRes.url})\n\n`
      setContent((prev) => prev.replace(placeholder, markdownSnippet))
      setEditorStatusToast(`✓ Dropped image added (${Math.round(compressed.compressedSize / 1024)} KB WebP)`)
      setTimeout(() => setEditorStatusToast(null), 4000)
    } catch (err: unknown) {
      const msg = (err as Error)?.message || 'Failed to process dropped image'
      setContent((prev) => prev.replace(placeholder, `\n<!-- Image upload failed: ${msg} -->\n`))
      setErrorMsg(`Drop error: ${msg}`)
    }
  }

  const handleSave = async (targetStatus?: 'draft' | 'published') => {
    setErrorMsg(null)
    if (!title.trim()) {
      setErrorMsg('Please enter an article title.')
      return
    }

    setIsSaving(true)

    const finalStatus = targetStatus || status

    // Construct dynamic metadata
    let metadata: Record<string, unknown> = {}
    if (pillar === 'travel') {
      metadata = {
        location: travelLocation || 'Global',
        bestSeason: travelSeason || 'Year-round',
        budgetLevel: travelBudget,
        duration: travelDuration,
        highlights: travelHighlights,
      }
    } else if (pillar === 'learning') {
      metadata = {
        difficulty: learningDifficulty,
        moduleNumber: learningModule,
        totalModules: learningTotalModules,
        estimatedHours: learningHours,
        prerequisites: learningPrereqs,
        takeaways: learningTakeaways,
      }
    }

    const postPayload: Partial<Post> = {
      title,
      slug: slug || title.toLowerCase().replace(/[^\w\s-]/g, '').replace(/\s+/g, '-'),
      pillar,
      status: finalStatus,
      featured,
      excerpt,
      content,
      coverImage:
        coverImage ||
        'https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=1200&q=80',
      tags,
      readTime,
      metadata,
    }

    try {
      if (isEditing && id) {
        const res = await postService.updatePost(id, postPayload)
        if (res.error) {
          setErrorMsg(res.error)
        } else {
          setSaveSuccess(true)
          setTimeout(() => setSaveSuccess(false), 2500)
        }
      } else {
        const res = await postService.createPost(postPayload)
        if (res.error) {
          setErrorMsg(res.error)
        } else {
          setSaveSuccess(true)
          setTimeout(() => {
            navigate('/admin/posts')
          }, 1200)
        }
      }
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Top Bar with Status and Action Buttons */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-border">
        <div className="flex items-center gap-3">
          <Link to="/admin/posts" className="rounded-xl border border-border p-2 text-foreground-muted hover:bg-surface-subtle">
            <ArrowLeft className="h-4 w-4" />
          </Link>
          <div>
            <h1 className="text-xl sm:text-2xl font-bold font-serif text-foreground">
              {isEditing ? 'Edit Publication' : 'Create New Publication'}
            </h1>
            <p className="text-xs text-foreground-muted">
              Auto-saved locally with live Markdown rendering and WebP compression.
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {saveSuccess && (
            <span className="flex items-center gap-1.5 text-xs font-bold text-emerald-600 dark:text-emerald-400 mr-2">
              <Check className="h-4 w-4" />
              Saved successfully!
            </span>
          )}

          {/* Mode Switcher */}
          <div className="flex items-center rounded-xl border border-border bg-surface p-1">
            <button
              onClick={() => setActiveTab('editor')}
              className={`rounded-lg px-3 py-1 text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'editor' ? 'bg-indigo-600 text-white shadow-2xs' : 'text-foreground-muted hover:text-foreground'
              }`}
            >
              Editor
            </button>
            <button
              onClick={() => setActiveTab('preview')}
              className={`rounded-lg px-3 py-1 text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'preview' ? 'bg-indigo-600 text-white shadow-2xs' : 'text-foreground-muted hover:text-foreground'
              }`}
            >
              Live Preview
            </button>
          </div>

          <Button
            size="sm"
            variant="outline"
            isLoading={isSaving}
            onClick={() => handleSave('draft')}
          >
            Save Draft
          </Button>

          <Button
            size="sm"
            variant="blog"
            isLoading={isSaving}
            onClick={() => handleSave('published')}
            leftIcon={<Save className="h-4 w-4" />}
          >
            {status === 'published' ? 'Update & Publish' : 'Publish Article'}
          </Button>
        </div>
      </div>

      {errorMsg && (
        <div className="rounded-xl border border-red-300 bg-red-50 p-3 text-xs text-red-800 dark:border-red-900/60 dark:bg-red-950/40 dark:text-red-300 flex items-center gap-2">
          <AlertCircle className="h-4 w-4 shrink-0 text-red-500" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Editor Main Content Area */}
      {activeTab === 'editor' ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left 2 Columns: Core Article Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Title */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-foreground mb-1.5">
                Article Title
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => handleTitleChange(e.target.value)}
                placeholder="Enter compelling publication title..."
                className="w-full rounded-2xl border border-border bg-surface px-4 py-3 text-lg sm:text-xl font-bold font-serif text-foreground placeholder:text-foreground-muted focus:outline-none focus:ring-2 focus:ring-indigo-500 shadow-2xs"
              />
            </div>

            {/* Slug & Reading Time */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-foreground mb-1">
                  URL Slug
                </label>
                <div className="flex items-center rounded-xl border border-border bg-surface px-3 py-2 text-xs font-mono shadow-2xs">
                  <span className="text-foreground-muted mr-1">/post/</span>
                  <input
                    type="text"
                    value={slug}
                    onChange={(e) => setSlug(e.target.value)}
                    className="w-full bg-transparent text-foreground focus:outline-none font-bold"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-foreground mb-1">
                  Estimated Reading Time
                </label>
                <Input
                  type="text"
                  value={readTime}
                  onChange={(e) => setReadTime(e.target.value)}
                  className="font-mono text-xs"
                />
              </div>
            </div>

            {/* SEO Excerpt */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-foreground mb-1.5">
                SEO Excerpt & Social Card Summary
              </label>
              <textarea
                rows={2}
                value={excerpt}
                onChange={(e) => setExcerpt(e.target.value)}
                placeholder="Brief editorial summary displayed on social shares, search feeds, and preview cards..."
                className="w-full rounded-xl border border-border bg-surface px-3.5 py-2.5 text-xs text-foreground placeholder:text-foreground-muted focus:outline-none focus:ring-2 focus:ring-indigo-500 shadow-2xs"
              />
            </div>

            {/* Markdown Toolbar & Content Area */}
            <div>
              <div className="flex flex-wrap items-center justify-between gap-2 pb-2 border-b border-border/80">
                <div className="flex items-center gap-2">
                  <label className="text-xs font-bold uppercase tracking-wider text-foreground">
                    Markdown Article Body
                  </label>
                  {editorStatusToast && (
                    <span className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400 animate-in fade-in flex items-center gap-1 bg-emerald-50 dark:bg-emerald-950/60 px-2 py-0.5 rounded-md border border-emerald-200 dark:border-emerald-900/60">
                      <Sparkles className="h-3 w-3" />
                      {editorStatusToast}
                    </span>
                  )}
                </div>

                <div className="flex flex-wrap items-center gap-1 text-foreground-muted">
                  <button
                    type="button"
                    onClick={() => insertMarkdown('**', '**')}
                    className="p-1.5 rounded hover:bg-surface-subtle hover:text-foreground transition-colors cursor-pointer"
                    title="Bold (**text**)"
                  >
                    <Bold className="h-3.5 w-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => insertMarkdown('*', '*')}
                    className="p-1.5 rounded hover:bg-surface-subtle hover:text-foreground transition-colors cursor-pointer"
                    title="Italic (*text*)"
                  >
                    <Italic className="h-3.5 w-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => insertMarkdown('## ')}
                    className="p-1.5 rounded hover:bg-surface-subtle hover:text-foreground transition-colors cursor-pointer"
                    title="Heading (## Title)"
                  >
                    <Heading className="h-3.5 w-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => insertMarkdown('```typescript\n', '\n```')}
                    className="p-1.5 rounded hover:bg-surface-subtle hover:text-foreground transition-colors cursor-pointer"
                    title="Code Block (```...```)"
                  >
                    <Code className="h-3.5 w-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => insertMarkdown('> ')}
                    className="p-1.5 rounded hover:bg-surface-subtle hover:text-foreground transition-colors cursor-pointer"
                    title="Blockquote (> text)"
                  >
                    <Quote className="h-3.5 w-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => insertMarkdown('- ')}
                    className="p-1.5 rounded hover:bg-surface-subtle hover:text-foreground transition-colors cursor-pointer"
                    title="Bulleted List (- item)"
                  >
                    <List className="h-3.5 w-3.5" />
                  </button>

                  <div className="h-4 w-px bg-border mx-1" />

                  {/* Insert Hyperlink */}
                  <button
                    type="button"
                    onClick={handleInsertLink}
                    className="p-1.5 rounded hover:bg-surface-subtle hover:text-foreground transition-colors cursor-pointer"
                    title="Insert Link [text](url)"
                  >
                    <LinkIcon className="h-3.5 w-3.5 text-indigo-500" />
                  </button>

                  {/* Insert Image Button */}
                  <button
                    type="button"
                    onClick={handleOpenImageModal}
                    className="flex items-center gap-1.5 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200 dark:border-indigo-800/60 px-2.5 py-1 text-xs font-bold text-indigo-700 dark:text-indigo-300 hover:bg-indigo-100 dark:hover:bg-indigo-900/60 transition-colors shadow-2xs cursor-pointer ml-1"
                    title="Insert Inline Image (Upload WebP or Link URL)"
                  >
                    <ImageIcon className="h-3.5 w-3.5 text-indigo-600 dark:text-indigo-400" />
                    <span>Insert Image</span>
                  </button>
                </div>
              </div>

              {/* Textarea with Drag & Drop Overlay */}
              <div className="relative mt-2">
                {isDraggingOverEditor && (
                  <div className="absolute inset-0 z-20 flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-indigo-500 bg-indigo-50/95 dark:bg-indigo-950/95 backdrop-blur-xs transition-all pointer-events-none">
                    <UploadCloud className="h-10 w-10 text-indigo-600 dark:text-indigo-400 animate-bounce" />
                    <p className="mt-2 text-sm font-bold text-indigo-900 dark:text-indigo-100">
                      Drop image to insert into article body
                    </p>
                    <p className="text-xs text-indigo-700 dark:text-indigo-300">
                      Auto-compressed to WebP &lt;150KB and uploaded to Supabase Storage
                    </p>
                  </div>
                )}

                <textarea
                  id="post-markdown-editor"
                  rows={18}
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  onPaste={handleEditorPaste}
                  onDrop={handleEditorDrop}
                  onDragOver={handleEditorDragOver}
                  onDragLeave={handleEditorDragLeave}
                  placeholder="Draft in GitHub Flavored Markdown (headings, code blocks, tables, lists, links)... You can paste screenshots or drop images directly into this editor!"
                  className={`w-full rounded-2xl border bg-surface p-4 font-mono text-xs sm:text-sm text-foreground leading-relaxed placeholder:text-foreground-muted focus:outline-none focus:ring-2 focus:ring-indigo-500 shadow-2xs transition-colors ${
                    isDraggingOverEditor ? 'border-indigo-500 ring-2 ring-indigo-500/20' : 'border-border'
                  }`}
                />

                <div className="flex flex-wrap items-center justify-between text-[11px] text-foreground-muted px-1 mt-1.5 gap-2">
                  <span className="flex items-center gap-1">
                    <Sparkles className="h-3 w-3 text-indigo-500 shrink-0" />
                    <span>
                      Tip: Press <kbd className="px-1.5 py-0.5 rounded bg-surface-subtle font-mono text-[10px] border border-border">Ctrl+V</kbd> to paste images directly from clipboard or drag image files onto the editor.
                    </span>
                  </span>
                  <span>{content.length} characters</span>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Settings, Metadata & Image Upload */}
          <div className="space-y-6">
            {/* Pillar Selector */}
            <div className="rounded-2xl border border-border bg-surface p-5 shadow-2xs space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-foreground mb-2">
                  Knowledge Pillar
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {(['blog', 'learning', 'travel'] as const).map((p) => (
                    <button
                      key={p}
                      type="button"
                      onClick={() => setPillar(p)}
                      className={`rounded-xl py-2 text-xs font-bold capitalize transition-all cursor-pointer ${
                        pillar === p
                          ? p === 'blog'
                            ? 'bg-indigo-600 text-white shadow-2xs'
                            : p === 'learning'
                            ? 'bg-emerald-600 text-white shadow-2xs'
                            : 'bg-amber-500 text-white shadow-2xs'
                          : 'bg-surface-subtle text-foreground-muted hover:text-foreground'
                      }`}
                    >
                      {p}
                    </button>
                  ))}
                </div>
              </div>

              {/* Status & Featured */}
              <div className="grid grid-cols-2 gap-3 pt-2 border-t border-border">
                <div>
                  <label className="block text-xs font-bold text-foreground mb-1">Status</label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value as any)}
                    className="w-full rounded-xl border border-border bg-surface px-3 py-1.5 text-xs font-semibold text-foreground focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer"
                  >
                    <option value="published">Published</option>
                    <option value="draft">Draft</option>
                    <option value="archived">Archived</option>
                  </select>
                </div>

                <div className="flex flex-col justify-end">
                  <label className="flex items-center gap-2 text-xs font-bold text-foreground cursor-pointer pb-2">
                    <input
                      type="checkbox"
                      checked={featured}
                      onChange={(e) => setFeatured(e.target.checked)}
                      className="h-4 w-4 rounded border-border text-indigo-600 focus:ring-indigo-500"
                    />
                    <span>Feature on Hero</span>
                  </label>
                </div>
              </div>
            </div>

            {/* WebP Image Compressor & Uploader */}
            <div className="rounded-2xl border border-border bg-surface p-5 shadow-2xs">
              <ImageUploader
                currentImageUrl={coverImage}
                onImageUploaded={(url) => setCoverImage(url)}
                label="Article Cover Artwork (WebP <150KB)"
              />
            </div>

            {/* Inline Media Library Card */}
            <div className="rounded-2xl border border-border bg-surface p-5 shadow-2xs space-y-3">
              <div className="flex items-center justify-between">
                <label className="block text-xs font-bold uppercase tracking-wider text-foreground">
                  Inline Media & Story Assets
                </label>
                <span className="text-[11px] font-medium text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                  <Sparkles className="h-3 w-3" />
                  WebP Ready
                </span>
              </div>
              <p className="text-[11px] text-foreground-muted leading-relaxed">
                Need to add screenshots, charts, or diagrams throughout your article? Click below to upload with auto-WebP compression, or paste directly into the editor (<kbd className="px-1 py-0.5 rounded bg-surface-subtle font-mono text-[10px] border border-border">Ctrl+V</kbd>).
              </p>
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="w-full text-xs font-semibold"
                onClick={handleOpenImageModal}
                leftIcon={<ImageIcon className="h-3.5 w-3.5 text-indigo-500" />}
              >
                Insert Inline Image...
              </Button>
            </div>

            {/* Tags Manager */}
            <div className="rounded-2xl border border-border bg-surface p-5 shadow-2xs space-y-3">
              <label className="block text-xs font-bold uppercase tracking-wider text-foreground">
                Tags & Topic Categorization
              </label>

              <div className="flex flex-wrap gap-1.5">
                {tags.map((t) => (
                  <span
                    key={t}
                    className="inline-flex items-center gap-1 rounded-lg bg-surface-subtle px-2.5 py-1 text-xs font-medium text-foreground"
                  >
                    #{t}
                    <button
                      type="button"
                      onClick={() => handleRemoveTag(t)}
                      className="text-foreground-muted hover:text-red-500"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </span>
                ))}
              </div>

              <input
                type="text"
                placeholder="Type tag and press Enter..."
                value={newTagInput}
                onChange={(e) => setNewTagInput(e.target.value)}
                onKeyDown={handleAddTag}
                className="w-full rounded-xl border border-border bg-surface-subtle/50 px-3 py-1.5 text-xs text-foreground placeholder:text-foreground-muted focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            {/* Dynamic Pillar Metadata: Travel */}
            {pillar === 'travel' && (
              <div className="rounded-2xl border border-amber-300/80 bg-amber-50/40 dark:border-amber-900/60 dark:bg-amber-950/20 p-5 shadow-2xs space-y-3">
                <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-amber-700 dark:text-amber-400">
                  <Compass className="h-4 w-4" />
                  <span>Travel Itinerary Quick Facts</span>
                </div>

                <div className="space-y-2 text-xs">
                  <div>
                    <label className="block font-bold text-foreground mb-1">Destination Location</label>
                    <Input
                      type="text"
                      placeholder="e.g. Kyoto, Japan"
                      value={travelLocation}
                      onChange={(e) => setTravelLocation(e.target.value)}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block font-bold text-foreground mb-1">Duration</label>
                      <Input
                        type="text"
                        placeholder="e.g. 7 Days"
                        value={travelDuration}
                        onChange={(e) => setTravelDuration(e.target.value)}
                      />
                    </div>
                    <div>
                      <label className="block font-bold text-foreground mb-1">Budget Level</label>
                      <select
                        value={travelBudget}
                        onChange={(e) => setTravelBudget(e.target.value as BudgetLevel)}
                        className="w-full rounded-xl border border-border bg-surface px-2.5 py-2 text-xs font-bold"
                      >
                        <option value="$">$ (Budget)</option>
                        <option value="$$">$$ (Moderate)</option>
                        <option value="$$$">$$$ (Upscale)</option>
                        <option value="$$$$">$$$$ (Luxury)</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block font-bold text-foreground mb-1">Best Season</label>
                    <Input
                      type="text"
                      placeholder="e.g. Autumn (Oct–Nov)"
                      value={travelSeason}
                      onChange={(e) => setTravelSeason(e.target.value)}
                    />
                  </div>

                  {/* Highlights */}
                  <div className="pt-2">
                    <label className="block font-bold text-foreground mb-1">Route Highlights</label>
                    <div className="flex gap-1.5 mb-2">
                      <input
                        type="text"
                        placeholder="Add destination highlight..."
                        value={newHighlight}
                        onChange={(e) => setNewHighlight(e.target.value)}
                        className="flex-1 rounded-xl border border-border bg-surface px-2.5 py-1 text-xs"
                      />
                      <Button
                        size="sm"
                        variant="outline"
                        type="button"
                        onClick={() => {
                          if (newHighlight.trim()) {
                            setTravelHighlights([...travelHighlights, newHighlight.trim()])
                            setNewHighlight('')
                          }
                        }}
                      >
                        <Plus className="h-3 w-3" />
                      </Button>
                    </div>
                    <ul className="space-y-1 text-foreground-muted">
                      {travelHighlights.map((h, i) => (
                        <li key={i} className="flex items-center justify-between">
                          <span>• {h}</span>
                          <button
                            type="button"
                            onClick={() => setTravelHighlights(travelHighlights.filter((_, idx) => idx !== i))}
                            className="text-red-500 hover:underline"
                          >
                            ✕
                          </button>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            )}

            {/* Dynamic Pillar Metadata: Learning */}
            {pillar === 'learning' && (
              <div className="rounded-2xl border border-emerald-300/80 bg-emerald-50/40 dark:border-emerald-900/60 dark:bg-emerald-950/20 p-5 shadow-2xs space-y-3">
                <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-400">
                  <BookOpen className="h-4 w-4" />
                  <span>Curriculum & Code Module Metadata</span>
                </div>

                <div className="space-y-2 text-xs">
                  <div>
                    <label className="block font-bold text-foreground mb-1">Difficulty</label>
                    <select
                      value={learningDifficulty}
                      onChange={(e) => setLearningDifficulty(e.target.value as DifficultyLevel)}
                      className="w-full rounded-xl border border-border bg-surface px-2.5 py-2 text-xs font-bold"
                    >
                      <option value="Beginner">Beginner</option>
                      <option value="Intermediate">Intermediate</option>
                      <option value="Advanced">Advanced</option>
                    </select>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block font-bold text-foreground mb-1">Module #</label>
                      <Input
                        type="number"
                        value={learningModule}
                        onChange={(e) => setLearningModule(parseInt(e.target.value, 10) || 1)}
                      />
                    </div>
                    <div>
                      <label className="block font-bold text-foreground mb-1">Total Modules</label>
                      <Input
                        type="number"
                        value={learningTotalModules}
                        onChange={(e) => setLearningTotalModules(parseInt(e.target.value, 10) || 1)}
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block font-bold text-foreground mb-1">Estimated Hours</label>
                    <Input
                      type="text"
                      placeholder="e.g. 2.5 Hours"
                      value={learningHours}
                      onChange={(e) => setLearningHours(e.target.value)}
                    />
                  </div>

                  {/* Prerequisites */}
                  <div className="pt-2">
                    <label className="block font-bold text-foreground mb-1">Prerequisites</label>
                    <div className="flex gap-1.5 mb-2">
                      <input
                        type="text"
                        placeholder="Add prerequisite..."
                        value={newPrereq}
                        onChange={(e) => setNewPrereq(e.target.value)}
                        className="flex-1 rounded-xl border border-border bg-surface px-2.5 py-1 text-xs"
                      />
                      <Button
                        size="sm"
                        variant="outline"
                        type="button"
                        onClick={() => {
                          if (newPrereq.trim()) {
                            setLearningPrereqs([...learningPrereqs, newPrereq.trim()])
                            setNewPrereq('')
                          }
                        }}
                      >
                        <Plus className="h-3 w-3" />
                      </Button>
                    </div>
                    <ul className="space-y-1 text-foreground-muted">
                      {learningPrereqs.map((p, i) => (
                        <li key={i} className="flex items-center justify-between">
                          <span>• {p}</span>
                          <button
                            type="button"
                            onClick={() => setLearningPrereqs(learningPrereqs.filter((_, idx) => idx !== i))}
                            className="text-red-500"
                          >
                            ✕
                          </button>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      ) : (
        /* Live Preview Mode */
        <div className="rounded-3xl border border-border bg-surface p-6 sm:p-10 shadow-xs max-w-4xl mx-auto">
          <Badge variant={pillar} size="md">
            {pillar}
          </Badge>
          <h1 className="mt-4 text-3xl sm:text-4xl font-extrabold font-serif text-foreground">
            {title || 'Untitled Publication'}
          </h1>
          <p className="mt-3 text-base text-foreground-muted leading-relaxed font-sans">
            {excerpt || 'No excerpt summary provided.'}
          </p>

          {coverImage && (
            <img
              src={coverImage}
              alt="Cover"
              className="mt-6 h-64 sm:h-96 w-full object-cover rounded-2xl border border-border"
            />
          )}

          {/* Dynamic Metadata Preview Card */}
          {pillar === 'travel' && travelLocation && (
            <div className="my-8 rounded-2xl border border-amber-300 bg-amber-50/50 p-6 dark:border-amber-900/60 dark:bg-amber-950/20">
              <span className="text-xs font-bold uppercase tracking-wider text-amber-700 dark:text-amber-400">
                Trip Quick Facts & Itinerary Summary
              </span>
              <div className="mt-3 grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs font-bold">
                <div>
                  <span className="text-foreground-muted block font-normal">Location</span>
                  {travelLocation}
                </div>
                <div>
                  <span className="text-foreground-muted block font-normal">Season</span>
                  {travelSeason || 'All Season'}
                </div>
                <div>
                  <span className="text-foreground-muted block font-normal">Budget</span>
                  {travelBudget}
                </div>
                <div>
                  <span className="text-foreground-muted block font-normal">Duration</span>
                  {travelDuration}
                </div>
              </div>
            </div>
          )}

          {pillar === 'learning' && (
            <div className="my-8 rounded-2xl border border-emerald-300 bg-emerald-50/50 p-6 dark:border-emerald-900/60 dark:bg-emerald-950/20">
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-400">
                Prerequisites & Outcomes (Module {learningModule} of {learningTotalModules})
              </span>
              <div className="mt-3 text-xs space-y-1 text-foreground-muted">
                <p>• Difficulty: <strong className="text-foreground">{learningDifficulty}</strong></p>
                <p>• Estimated Time: <strong className="text-foreground">{learningHours}</strong></p>
              </div>
            </div>
          )}

          {/* Markdown Content */}
          <div className="mt-8 prose dark:prose-invert max-w-none font-serif text-foreground leading-relaxed">
            <ReactMarkdown
              remarkPlugins={[remarkGfm]}
              components={{
                img: ({ src, alt, ...props }) => (
                  <span className="block my-8">
                    <img
                      src={src}
                      alt={alt || 'Article visual'}
                      className="w-full rounded-2xl border border-border shadow-sm object-cover max-h-[550px]"
                      loading="lazy"
                      {...props}
                    />
                    {alt && alt !== 'image' && alt !== 'Image' && alt !== 'Article visual' && (
                      <span className="block mt-2.5 text-center text-xs text-foreground-muted italic font-sans">
                        {alt}
                      </span>
                    )}
                  </span>
                ),
              }}
            >
              {content || '*No content written yet.*'}
            </ReactMarkdown>
          </div>
        </div>
      )}

      {/* Inline Image Modal */}
      <InlineImageModal
        isOpen={isImageModalOpen}
        onClose={() => setIsImageModalOpen(false)}
        onInsert={handleInsertImageFromModal}
      />
    </div>
  )
}

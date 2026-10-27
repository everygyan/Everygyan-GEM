import React, { useState, useRef } from 'react'
import {
  UploadCloud,
  Image as ImageIcon,
  Link as LinkIcon,
  Sparkles,
  Check,
  AlertCircle,
  RefreshCw,
  ExternalLink,
} from 'lucide-react'
import { Modal } from '../ui/Modal'
import { Button } from '../ui/Button'
import { Input } from '../ui/Input'
import {
  compressImageToWebP,
  uploadImageToStorage,
  type CompressionResult,
} from '../../lib/imageCompressor'

interface InlineImageModalProps {
  isOpen: boolean
  onClose: () => void
  onInsert: (markdown: string) => void
}

export const InlineImageModal: React.FC<InlineImageModalProps> = ({
  isOpen,
  onClose,
  onInsert,
}) => {
  const [activeTab, setActiveTab] = useState<'upload' | 'url'>('upload')
  const [imageUrl, setImageUrl] = useState('')
  const [altText, setAltText] = useState('')
  const [caption, setCaption] = useState('')
  const [isCompressing, setIsCompressing] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const [compressionStats, setCompressionStats] = useState<CompressionResult | null>(null)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleReset = () => {
    setImageUrl('')
    setAltText('')
    setCaption('')
    setCompressionStats(null)
    setErrorMsg(null)
    setIsCompressing(false)
    setIsUploading(false)
  }

  const handleClose = () => {
    handleReset()
    onClose()
  }

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setErrorMsg(null)
    setIsCompressing(true)
    setCompressionStats(null)

    // Default alt text to clean file name
    const defaultAlt = file.name
      .replace(/\.[^/.]+$/, '')
      .replace(/[-_]/g, ' ')
      .replace(/\b\w/g, (c) => c.toUpperCase())
    if (!altText) {
      setAltText(defaultAlt)
    }

    try {
      // 1. Client-Side WebP Compression
      const result = await compressImageToWebP(file, {
        maxWidth: 1600,
        maxHeight: 1600,
        quality: 0.82,
      })
      setCompressionStats(result)
      setIsCompressing(false)

      // 2. Upload to Storage media bucket
      setIsUploading(true)
      const uploadRes = await uploadImageToStorage(result.file, 'media', 'articles')
      setIsUploading(false)

      if (uploadRes.error) {
        setErrorMsg(uploadRes.error)
      } else {
        setImageUrl(uploadRes.url)
      }
    } catch (err: unknown) {
      setIsCompressing(false)
      setIsUploading(false)
      setErrorMsg((err as Error).message || 'Failed to process and compress image.')
    }
  }

  const handleInsert = () => {
    if (!imageUrl.trim()) {
      setErrorMsg('Please select an image file or provide an image URL.')
      return
    }

    const cleanAlt = altText.trim() || 'Article visual'
    let markdown = `\n![${cleanAlt}](${imageUrl.trim()})\n`
    if (caption.trim()) {
      markdown += `*${caption.trim()}*\n\n`
    } else {
      markdown += `\n`
    }

    onInsert(markdown)
    handleClose()
  }

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 B'
    const k = 1024
    const sizes = ['B', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title={
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-500/10 text-indigo-600 dark:text-indigo-400">
            <ImageIcon className="h-4 w-4" />
          </div>
          <span>Insert Image into Article</span>
        </div>
      }
      description="Add inline images, infographics, and diagrams with auto-WebP compression and responsive styling."
      maxWidth="lg"
    >
      <div className="space-y-4">
        {/* Tab Selection */}
        <div className="flex rounded-xl border border-border bg-surface-subtle p-1">
          <button
            type="button"
            onClick={() => setActiveTab('upload')}
            className={`flex-1 rounded-lg py-1.5 text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
              activeTab === 'upload'
                ? 'bg-surface text-foreground shadow-2xs'
                : 'text-foreground-muted hover:text-foreground'
            }`}
          >
            <UploadCloud className="h-3.5 w-3.5" />
            <span>Upload Image (Auto-WebP)</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('url')}
            className={`flex-1 rounded-lg py-1.5 text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
              activeTab === 'url'
                ? 'bg-surface text-foreground shadow-2xs'
                : 'text-foreground-muted hover:text-foreground'
            }`}
          >
            <LinkIcon className="h-3.5 w-3.5" />
            <span>Image by URL</span>
          </button>
        </div>

        {errorMsg && (
          <div className="rounded-xl border border-red-300 bg-red-50 p-3 text-xs text-red-800 dark:border-red-900/60 dark:bg-red-950/40 dark:text-red-300 flex items-center gap-2">
            <AlertCircle className="h-4 w-4 shrink-0 text-red-500" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Tab 1: Upload */}
        {activeTab === 'upload' && (
          <div className="space-y-4">
            <div
              onClick={() => fileInputRef.current?.click()}
              className="group relative flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-border p-6 text-center hover:border-indigo-500 hover:bg-surface-subtle/50 transition-all cursor-pointer bg-surface"
            >
              <input
                ref={fileInputRef}
                type="file"
                accept="image/png, image/jpeg, image/webp, image/jpg, image/gif, image/avif"
                onChange={handleFileChange}
                className="hidden"
              />

              {isCompressing ? (
                <div className="py-4 text-center">
                  <RefreshCw className="mx-auto h-7 w-7 text-indigo-500 animate-spin" />
                  <p className="mt-2 text-xs font-bold text-foreground">
                    Compressing with HTML5 Canvas to WebP...
                  </p>
                  <p className="text-[11px] text-foreground-muted">Optimizing payload under 150KB</p>
                </div>
              ) : isUploading ? (
                <div className="py-4 text-center">
                  <RefreshCw className="mx-auto h-7 w-7 text-emerald-500 animate-spin" />
                  <p className="mt-2 text-xs font-bold text-foreground">
                    Uploading to Supabase Storage CDN...
                  </p>
                </div>
              ) : imageUrl ? (
                <div className="w-full space-y-2">
                  <div className="relative h-44 w-full overflow-hidden rounded-xl border border-border bg-slate-950/5">
                    <img
                      src={imageUrl}
                      alt="Uploaded preview"
                      className="h-full w-full object-contain"
                    />
                    <div className="absolute inset-0 bg-slate-950/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white text-xs font-bold">
                      Click to choose a different image
                    </div>
                  </div>
                  <p className="text-[11px] text-emerald-600 dark:text-emerald-400 font-bold flex items-center justify-center gap-1">
                    <Check className="h-3.5 w-3.5" />
                    Image ready for insertion
                  </p>
                </div>
              ) : (
                <div className="py-3">
                  <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400">
                    <UploadCloud className="h-5 w-5" />
                  </div>
                  <p className="mt-2 text-xs font-bold text-foreground">
                    Click to browse or drop image file here
                  </p>
                  <p className="mt-1 text-[11px] text-foreground-muted">
                    Supports PNG, JPG, WebP, GIF. Automatically compressed to WebP.
                  </p>
                </div>
              )}
            </div>

            {/* Compression Stats */}
            {compressionStats && (
              <div className="flex items-center justify-between rounded-xl border border-emerald-200 bg-emerald-50/50 p-2.5 text-xs dark:border-emerald-900/60 dark:bg-emerald-950/30">
                <span className="flex items-center gap-1.5 font-bold text-emerald-700 dark:text-emerald-300">
                  <Sparkles className="h-3.5 w-3.5" />
                  WebP Saved {compressionStats.reductionPercentage}%
                </span>
                <span className="text-[11px] text-foreground-muted">
                  {formatBytes(compressionStats.originalSize)} &rarr;{' '}
                  <strong className="text-foreground">{formatBytes(compressionStats.compressedSize)}</strong>
                </span>
              </div>
            )}
          </div>
        )}

        {/* Tab 2: URL */}
        {activeTab === 'url' && (
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-foreground mb-1">
                Image Web URL (HTTPS)
              </label>
              <div className="flex gap-2">
                <Input
                  type="url"
                  placeholder="https://images.unsplash.com/photo-..."
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                  className="text-xs"
                />
                {imageUrl && (
                  <a
                    href={imageUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center justify-center rounded-xl border border-border px-3 text-foreground-muted hover:text-foreground"
                    title="Open image in new tab"
                  >
                    <ExternalLink className="h-4 w-4" />
                  </a>
                )}
              </div>
              <p className="mt-1 text-[11px] text-foreground-muted">
                Paste any publicly accessible image link from Unsplash, Wikimedia, AWS S3, etc.
              </p>
            </div>

            {imageUrl && (
              <div className="relative h-40 w-full overflow-hidden rounded-xl border border-border bg-slate-950/5">
                <img
                  src={imageUrl}
                  alt="URL Preview"
                  className="h-full w-full object-contain"
                  onError={() => setErrorMsg('Failed to load image from URL. Please check the address.')}
                />
              </div>
            )}
          </div>
        )}

        {/* Common Fields: Alt Text & Caption */}
        <div className="space-y-3 pt-2 border-t border-border">
          <div>
            <label className="block text-xs font-bold text-foreground mb-1">
              Alt Text / Description (SEO & Accessibility)
            </label>
            <Input
              type="text"
              placeholder="e.g. Distributed database replication topology"
              value={altText}
              onChange={(e) => setAltText(e.target.value)}
              className="text-xs"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-foreground mb-1">
              Caption (Optional — displayed beneath image)
            </label>
            <Input
              type="text"
              placeholder="e.g. Figure 2: Master-follower write synchronization latency"
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
              className="text-xs"
            />
          </div>
        </div>

        {/* Modal Actions */}
        <div className="flex items-center justify-end gap-2 pt-3 border-t border-border">
          <Button type="button" variant="ghost" size="sm" onClick={handleClose}>
            Cancel
          </Button>
          <Button
            type="button"
            variant="blog"
            size="sm"
            onClick={handleInsert}
            disabled={!imageUrl || isCompressing || isUploading}
            leftIcon={<Check className="h-4 w-4" />}
          >
            Insert into Article
          </Button>
        </div>
      </div>
    </Modal>
  )
}

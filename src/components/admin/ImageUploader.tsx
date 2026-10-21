import React, { useState, useRef } from 'react'
import { UploadCloud, Check, Copy, AlertCircle, RefreshCw, Sparkles } from 'lucide-react'
import { compressImageToWebP, uploadImageToStorage, type CompressionResult } from '../../lib/imageCompressor'

interface ImageUploaderProps {
  onImageUploaded: (url: string) => void
  currentImageUrl?: string
  label?: string
}

export const ImageUploader: React.FC<ImageUploaderProps> = ({
  onImageUploaded,
  currentImageUrl,
  label = 'Cover Image or Media Upload',
}) => {
  const [isCompressing, setIsCompressing] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const [compressionStats, setCompressionStats] = useState<CompressionResult | null>(null)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)
  const [copiedSnippet, setCopiedSnippet] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileSelected = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setErrorMsg(null)
    setIsCompressing(true)
    setCompressionStats(null)

    try {
      // 1. Client-Side WebP Compression
      const result = await compressImageToWebP(file, { maxWidth: 1600, maxHeight: 1600, quality: 0.82 })
      setCompressionStats(result)
      setIsCompressing(false)

      // 2. Upload to Storage
      setIsUploading(true)
      const uploadRes = await uploadImageToStorage(result.file, 'media', 'articles')
      setIsUploading(false)

      if (uploadRes.error) {
        setErrorMsg(uploadRes.error)
      } else {
        onImageUploaded(uploadRes.url)
      }
    } catch (err: unknown) {
      setIsCompressing(false)
      setIsUploading(false)
      setErrorMsg((err as Error).message || 'Failed to process image.')
    }
  }

  const copyMarkdownSnippet = (url: string) => {
    navigator.clipboard.writeText(`![Image description](${url})`)
    setCopiedSnippet(true)
    setTimeout(() => setCopiedSnippet(false), 2000)
  }

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 B'
    const k = 1024
    const sizes = ['B', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <label className="block text-xs font-bold text-foreground">{label}</label>
        <span className="text-[11px] font-medium text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
          <Sparkles className="h-3 w-3" />
          Auto-WebP Compression Active
        </span>
      </div>

      {errorMsg && (
        <div className="rounded-xl border border-red-300 bg-red-50 p-3 text-xs text-red-800 dark:border-red-900/60 dark:bg-red-950/40 dark:text-red-300 flex items-center gap-2">
          <AlertCircle className="h-4 w-4 shrink-0 text-red-500" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Upload Dropzone */}
      <div
        onClick={() => fileInputRef.current?.click()}
        className="group relative flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-border p-6 text-center hover:border-indigo-500 hover:bg-surface-subtle/40 transition-all cursor-pointer bg-surface"
      >
        <input
          ref={fileInputRef}
          type="file"
          accept="image/png, image/jpeg, image/webp, image/jpg"
          onChange={handleFileSelected}
          className="hidden"
        />

        {isCompressing ? (
          <div className="py-4 text-center">
            <RefreshCw className="mx-auto h-8 w-8 text-indigo-500 animate-spin" />
            <p className="mt-2 text-xs font-bold text-foreground">
              Compressing with HTML5 Canvas (WebP &lt; 150KB)...
            </p>
          </div>
        ) : isUploading ? (
          <div className="py-4 text-center">
            <RefreshCw className="mx-auto h-8 w-8 text-emerald-500 animate-spin" />
            <p className="mt-2 text-xs font-bold text-foreground">Uploading to Supabase Storage...</p>
          </div>
        ) : currentImageUrl ? (
          <div className="w-full">
            <div className="relative h-44 w-full overflow-hidden rounded-xl border border-border">
              <img src={currentImageUrl} alt="Uploaded" className="h-full w-full object-cover" />
              <div className="absolute inset-0 bg-slate-950/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white text-xs font-bold">
                Click to Replace Image
              </div>
            </div>
          </div>
        ) : (
          <div className="py-2">
            <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400">
              <UploadCloud className="h-5 w-5" />
            </div>
            <p className="mt-2 text-xs font-bold text-foreground">
              Click to upload JPG, PNG, or WebP
            </p>
            <p className="mt-0.5 text-[11px] text-foreground-muted">
              Images are automatically resized (max 1600px) and converted to optimized WebP.
            </p>
          </div>
        )}
      </div>

      {/* Compression Statistics pill */}
      {compressionStats && (
        <div className="rounded-xl border border-emerald-200 bg-emerald-50/50 p-3 text-xs dark:border-emerald-900/60 dark:bg-emerald-950/30">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <span className="rounded-md bg-emerald-600 px-2 py-0.5 text-[10px] font-bold text-white">
                WebP Saved {compressionStats.reductionPercentage}%
              </span>
              <span className="text-foreground-muted text-[11px]">
                {formatBytes(compressionStats.originalSize)} &rarr;{' '}
                <strong className="text-foreground">{formatBytes(compressionStats.compressedSize)}</strong>
              </span>
            </div>

            {currentImageUrl && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation()
                  copyMarkdownSnippet(currentImageUrl)
                }}
                className="inline-flex items-center gap-1 text-[11px] font-bold text-indigo-600 dark:text-indigo-400 hover:underline cursor-pointer"
              >
                {copiedSnippet ? (
                  <>
                    <Check className="h-3 w-3 text-emerald-500" />
                    <span>Copied Markdown</span>
                  </>
                ) : (
                  <>
                    <Copy className="h-3 w-3" />
                    <span>Copy Markdown Embed</span>
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

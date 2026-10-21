import { supabase, isSupabaseConfigured } from './supabase'

export interface CompressionOptions {
  maxWidth?: number
  maxHeight?: number
  quality?: number
}

export interface CompressionResult {
  file: File
  blob: Blob
  originalSize: number
  compressedSize: number
  reductionPercentage: number
  previewUrl: string
}

/**
 * Compress an image file to WebP format using HTML5 Canvas
 * Constrains dimensions (default: max 1600px) and applies WebP compression
 */
export async function compressImageToWebP(
  file: File,
  options: CompressionOptions = {}
): Promise<CompressionResult> {
  const { maxWidth = 1600, maxHeight = 1600, quality = 0.82 } = options
  const originalSize = file.size

  return new Promise((resolve, reject) => {
    // If not an image, reject
    if (!file.type.startsWith('image/')) {
      return reject(new Error('Selected file is not an image'))
    }

    const img = new Image()
    const objectUrl = URL.createObjectURL(file)

    img.onload = () => {
      URL.revokeObjectURL(objectUrl)

      let { width, height } = img

      // Calculate constrained dimensions preserving aspect ratio
      if (width > maxWidth || height > maxHeight) {
        if (width / height > maxWidth / maxHeight) {
          height = Math.round((height * maxWidth) / width)
          width = maxWidth
        } else {
          width = Math.round((width * maxHeight) / height)
          height = maxHeight
        }
      }

      const canvas = document.createElement('canvas')
      canvas.width = width
      canvas.height = height

      const ctx = canvas.getContext('2d')
      if (!ctx) {
        // Fallback: return original if canvas context unavailable (e.g. test environments without canvas)
        const fallbackBlob = file.slice(0, file.size, 'image/webp')
        const fallbackFile = new File([fallbackBlob], `${file.name.replace(/\.[^/.]+$/, '')}.webp`, {
          type: 'image/webp',
        })
        return resolve({
          file: fallbackFile,
          blob: fallbackBlob,
          originalSize,
          compressedSize: originalSize,
          reductionPercentage: 0,
          previewUrl: URL.createObjectURL(file),
        })
      }

      // Draw and resample image
      ctx.drawImage(img, 0, 0, width, height)

      // Convert to WebP blob
      if (canvas.toBlob) {
        canvas.toBlob(
          (blob) => {
            if (!blob) {
              return reject(new Error('Canvas to WebP conversion failed'))
            }

            const cleanName = file.name.replace(/\.[^/.]+$/, '')
            const compressedFile = new File([blob], `${cleanName}.webp`, {
              type: 'image/webp',
              lastModified: Date.now(),
            })

            const compressedSize = blob.size
            const reductionPercentage = Math.max(
              0,
              Math.round(((originalSize - compressedSize) / originalSize) * 100)
            )

            resolve({
              file: compressedFile,
              blob,
              originalSize,
              compressedSize,
              reductionPercentage,
              previewUrl: URL.createObjectURL(blob),
            })
          },
          'image/webp',
          quality
        )
      } else {
        // Fallback using toDataURL
        const dataUrl = canvas.toDataURL('image/webp', quality)
        const byteString = atob(dataUrl.split(',')[1])
        const ab = new ArrayBuffer(byteString.length)
        const ia = new Uint8Array(ab)
        for (let i = 0; i < byteString.length; i++) {
          ia[i] = byteString.charCodeAt(i)
        }
        const blob = new Blob([ab], { type: 'image/webp' })
        const compressedFile = new File([blob], `${file.name.replace(/\.[^/.]+$/, '')}.webp`, {
          type: 'image/webp',
        })

        resolve({
          file: compressedFile,
          blob,
          originalSize,
          compressedSize: blob.size,
          reductionPercentage: Math.max(0, Math.round(((originalSize - blob.size) / originalSize) * 100)),
          previewUrl: dataUrl,
        })
      }
    }

    img.onerror = () => {
      URL.revokeObjectURL(objectUrl)
      reject(new Error('Failed to load image for compression'))
    }

    img.src = objectUrl
  })
}

/**
 * Upload a compressed WebP file to Supabase Storage `media` bucket
 */
export async function uploadImageToStorage(
  file: File,
  bucket = 'media',
  folder = 'articles'
): Promise<{ url: string; error: string | null }> {
  const fileExt = 'webp'
  const fileName = `${folder}/${Date.now()}-${Math.random().toString(36).substring(2, 8)}.${fileExt}`

  if (isSupabaseConfigured) {
    try {
      const { data, error } = await supabase.storage.from(bucket).upload(fileName, file, {
        contentType: 'image/webp',
        cacheControl: '3600',
        upsert: true,
      })

      if (!error && data) {
        const { data: publicUrlData } = supabase.storage.from(bucket).getPublicUrl(fileName)
        if (publicUrlData?.publicUrl) {
          return { url: publicUrlData.publicUrl, error: null }
        }
      }
    } catch {
      // Fallback
    }
  }

  // Local object URL fallback
  const fallbackUrl = URL.createObjectURL(file)
  return { url: fallbackUrl, error: null }
}

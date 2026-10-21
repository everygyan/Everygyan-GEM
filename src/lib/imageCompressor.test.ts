import { describe, it, expect, vi, beforeEach } from 'vitest'
import { compressImageToWebP, uploadImageToStorage } from './imageCompressor'

describe('Client-Side WebP Image Compressor', () => {
  beforeEach(() => {
    vi.restoreAllMocks()
    global.URL.createObjectURL = vi.fn().mockReturnValue('blob:http://localhost/mock-preview')
    global.URL.revokeObjectURL = vi.fn()
  })

  it('rejects non-image files with clear error message', async () => {
    const textFile = new File(['hello world'], 'document.txt', { type: 'text/plain' })
    await expect(compressImageToWebP(textFile)).rejects.toThrow('Selected file is not an image')
  })

  it('handles image compression and calculates dimension constraints gracefully', async () => {
    // Mock Image object
    class MockImage {
      onload: (() => void) | null = null
      onerror: (() => void) | null = null
      width = 2400
      height = 1600
      set src(_value: string) {
        setTimeout(() => {
          if (this.onload) this.onload()
        }, 10)
      }
    }
    vi.stubGlobal('Image', MockImage)

    // Mock Canvas & 2D context
    const mockToBlob = vi.fn((callback: (blob: Blob | null) => void) => {
      const mockWebpBlob = new Blob(['compressed webp bytes'], { type: 'image/webp' })
      callback(mockWebpBlob)
    })

    const mockDrawImage = vi.fn()
    const mockGetContext = vi.fn().mockReturnValue({
      drawImage: mockDrawImage,
    })

    const originalCreateElement = document.createElement.bind(document)
    vi.spyOn(document, 'createElement').mockImplementation((tagName: string) => {
      if (tagName === 'canvas') {
        return {
          width: 0,
          height: 0,
          getContext: mockGetContext,
          toBlob: mockToBlob,
        } as unknown as HTMLCanvasElement
      }
      return originalCreateElement(tagName)
    })

    const rawFile = new File([new Uint8Array(200000)], 'hero-photo.png', { type: 'image/png' })
    const result = await compressImageToWebP(rawFile, { maxWidth: 1600, maxHeight: 1600, quality: 0.8 })

    expect(result.file.name).toBe('hero-photo.webp')
    expect(result.file.type).toBe('image/webp')
    expect(result.originalSize).toBe(200000)
    expect(result.previewUrl).toContain('mock-preview')
    expect(mockDrawImage).toHaveBeenCalled()
  })

  it('uploadImageToStorage returns a valid URL string without throwing', async () => {
    const mockWebpFile = new File(['webp bytes'], 'sample.webp', { type: 'image/webp' })
    const res = await uploadImageToStorage(mockWebpFile, 'media', 'articles')
    expect(res.url).toBeDefined()
    expect(typeof res.url).toBe('string')
    expect(res.error).toBeNull()
  })
})

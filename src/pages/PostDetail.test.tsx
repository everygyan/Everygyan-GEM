import { describe, it, expect, beforeEach, vi } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { MemoryRouter, Routes, Route } from 'react-router-dom'
import { ThemeProvider } from '../context/ThemeContext'
import { AuthProvider } from '../context/AuthContext'
import { PostDetail } from './PostDetail'

describe('PostDetail (Ultimate Article Reader)', () => {
  beforeEach(() => {
    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      value: vi.fn().mockImplementation((query) => ({
        matches: false,
        media: query,
        onchange: null,
        addListener: vi.fn(),
        removeListener: vi.fn(),
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        dispatchEvent: vi.fn(),
      })),
    })

    // Mock clipboard API
    Object.assign(navigator, {
      clipboard: {
        writeText: vi.fn().mockImplementation(() => Promise.resolve()),
      },
    })
  })

  it('renders Markdown content with GFM tables, code blocks, blockquotes, and images for blog article', async () => {
    render(
      <ThemeProvider defaultTheme="light">
        <AuthProvider>
          <MemoryRouter initialEntries={['/post/architectural-shift-edge-functions']}>
            <Routes>
              <Route path="/post/:slug" element={<PostDetail />} />
            </Routes>
          </MemoryRouter>
        </AuthProvider>
      </ThemeProvider>
    )

    // Wait for post to load
    await waitFor(() => {
      expect(screen.getByRole('heading', { level: 1, name: /The Architectural Shift/i })).toBeInTheDocument()
    })

    // GFM Table rendering
    expect(screen.getByText(/Topology Architecture/i)).toBeInTheDocument()
    expect(screen.getByText(/p99 Latency/i)).toBeInTheDocument()

    // Blockquote
    expect(screen.getByText(/Premature distribution is the root of modern infrastructure debt/i)).toBeInTheDocument()

    // Code block with Copy button
    expect(screen.getByText('typescript')).toBeInTheDocument()
    const copyButtons = screen.getAllByTitle(/Copy code/i)
    expect(copyButtons.length).toBeGreaterThan(0)

    // Click copy code
    fireEvent.click(copyButtons[0])
    expect(navigator.clipboard.writeText).toHaveBeenCalled()

    // Table of Contents on Desktop (heading and TOC link)
    expect(screen.getAllByText(/The Distributed Dilemma/i).length).toBeGreaterThan(1)

    // Discussion Section is present
    expect(screen.getByText(/Community Discussion/i)).toBeInTheDocument()
  })

  it('renders Learning Hub specialized callout box (Prerequisites & Key Takeaways)', async () => {
    render(
      <ThemeProvider defaultTheme="light">
        <AuthProvider>
          <MemoryRouter initialEntries={['/post/react-19-production-actions']}>
            <Routes>
              <Route path="/post/:slug" element={<PostDetail />} />
            </Routes>
          </MemoryRouter>
        </AuthProvider>
      </ThemeProvider>
    )

    await waitFor(() => {
      expect(screen.getByText(/Prerequisites & Key Takeaways/i)).toBeInTheDocument()
    })

    expect(screen.getByText(/Basic React Hooks/i)).toBeInTheDocument()
    expect(screen.getByText(/Master useActionState/i)).toBeInTheDocument()
  })

  it('renders Travel specialized callout box (Trip Quick Facts & Itinerary Summary)', async () => {
    render(
      <ThemeProvider defaultTheme="light">
        <AuthProvider>
          <MemoryRouter initialEntries={['/post/kyoto-hidden-temples-guide']}>
            <Routes>
              <Route path="/post/:slug" element={<PostDetail />} />
            </Routes>
          </MemoryRouter>
        </AuthProvider>
      </ThemeProvider>
    )

    await waitFor(() => {
      expect(screen.getByText(/Trip Quick Facts & Itinerary Summary/i)).toBeInTheDocument()
    })

    expect(screen.getByText(/Kyoto, Japan/i)).toBeInTheDocument()
    expect(screen.getByText(/7 Days/i)).toBeInTheDocument()
    expect(screen.getByText(/Curated Highlights:/i)).toBeInTheDocument()
  })

  it('toggles typography controls (Serif vs Sans and font sizes)', async () => {
    render(
      <ThemeProvider defaultTheme="light">
        <AuthProvider>
          <MemoryRouter initialEntries={['/post/architectural-shift-edge-functions']}>
            <Routes>
              <Route path="/post/:slug" element={<PostDetail />} />
            </Routes>
          </MemoryRouter>
        </AuthProvider>
      </ThemeProvider>
    )

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /Serif/i })).toBeInTheDocument()
    })

    // Toggle to Sans
    fireEvent.click(screen.getByRole('button', { name: /Serif/i }))
    expect(screen.getByRole('button', { name: /Sans/i })).toBeInTheDocument()

    // Change font size
    fireEvent.click(screen.getByRole('button', { name: 'A++' }))
    const article = document.querySelector('article')
    expect(article).toHaveClass('text-xl')
  })
})

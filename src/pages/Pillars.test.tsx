import { describe, it, expect, beforeEach, vi } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'
import { ThemeProvider } from '../context/ThemeContext'
import { Blog } from './Blog'
import { Learning } from './Learning'
import { Travel } from './Travel'

describe('Pillar Listing Experiences', () => {
  beforeEach(() => {
    localStorage.clear()
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
  })

  it('renders Blog pillar with editorial layout, reading times, and topic tags', async () => {
    render(
      <ThemeProvider defaultTheme="light">
        <BrowserRouter>
          <Blog />
        </BrowserRouter>
      </ThemeProvider>
    )

    await waitFor(() => {
      expect(screen.getByText(/Lead Architecture Story/i)).toBeInTheDocument()
    })

    expect(screen.getByPlaceholderText(/Search blog topics.../i)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /All Topics/i })).toBeInTheDocument()
  })

  it('renders Learning Hub with difficulty filters, module sequence, and interactive progress tracker', async () => {
    render(
      <ThemeProvider defaultTheme="light">
        <BrowserRouter>
          <Learning />
        </BrowserRouter>
      </ThemeProvider>
    )

    await waitFor(() => {
      expect(screen.getAllByRole('button', { name: /Mark Complete/i }).length).toBeGreaterThan(0)
    })

    expect(screen.getByText(/Track Completion/i)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /Beginner/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /Intermediate/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /Advanced/i })).toBeInTheDocument()

    // Interactive Mark Complete button
    const markButtons = screen.getAllByRole('button', { name: /Mark Complete/i })
    fireEvent.click(markButtons[0])
    expect(screen.getByRole('button', { name: /Completed/i })).toBeInTheDocument()
  })

  it('renders Travel gallery with destination metadata cards (Location, Season, Budget, Duration)', async () => {
    render(
      <ThemeProvider defaultTheme="light">
        <BrowserRouter>
          <Travel />
        </BrowserRouter>
      </ThemeProvider>
    )

    await waitFor(() => {
      expect(screen.getByText(/Kyoto, Japan/i)).toBeInTheDocument()
    })

    expect(screen.getByText(/Autumn \(Oct–Nov\) or Spring \(April\)/i)).toBeInTheDocument()
    expect(screen.getByText('$$$')).toBeInTheDocument()
    expect(screen.getAllByText(/Route Highlights:/i).length).toBeGreaterThan(0)
  })
})

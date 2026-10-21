import { describe, it, expect, beforeEach, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'
import { ThemeProvider } from '../context/ThemeContext'
import { AuthProvider } from '../context/AuthContext'
import { Navbar } from './Navbar'

describe('Navbar Component', () => {
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

  it('renders EveryGyan brand logo and link to home', () => {
    render(
      <ThemeProvider defaultTheme="light">
        <AuthProvider>
          <BrowserRouter>
            <Navbar />
          </BrowserRouter>
        </AuthProvider>
      </ThemeProvider>
    )

    expect(screen.getByText('Every')).toBeInTheDocument()
    expect(screen.getByText('Gyan')).toBeInTheDocument()
  })

  it('renders all core pillar navigation links in desktop navbar', () => {
    render(
      <ThemeProvider defaultTheme="light">
        <AuthProvider>
          <BrowserRouter>
            <Navbar />
          </BrowserRouter>
        </AuthProvider>
      </ThemeProvider>
    )

    // Main links in desktop nav
    expect(screen.getByRole('link', { name: /^Home$/i })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /^Blog$/i })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /^Learning$/i })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /^Travel$/i })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /^Newsletter$/i })).toBeInTheDocument()
  })

  it('renders search trigger with keyboard shortcut and theme toggle button', () => {
    render(
      <ThemeProvider defaultTheme="light">
        <AuthProvider>
          <BrowserRouter>
            <Navbar />
          </BrowserRouter>
        </AuthProvider>
      </ThemeProvider>
    )

    expect(screen.getByLabelText(/Search EveryGyan/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/Toggle theme/i)).toBeInTheDocument()
    expect(screen.getByText('Sign In')).toBeInTheDocument()
  })
})

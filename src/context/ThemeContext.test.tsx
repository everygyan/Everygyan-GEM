import { describe, it, expect, beforeEach, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { ThemeProvider, useTheme } from './ThemeContext'

// Test Consumer Component
const TestThemeComponent = () => {
  const { theme, resolvedTheme, setTheme, toggleTheme } = useTheme()
  return (
    <div>
      <span data-testid="current-theme">{theme}</span>
      <span data-testid="resolved-theme">{resolvedTheme}</span>
      <button onClick={() => setTheme('light')}>Set Light</button>
      <button onClick={() => setTheme('dark')}>Set Dark</button>
      <button onClick={toggleTheme}>Toggle</button>
    </div>
  )
}

describe('ThemeProvider', () => {
  beforeEach(() => {
    localStorage.clear()
    document.documentElement.className = ''
    vi.restoreAllMocks()

    // Mock matchMedia
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

  it('initializes with default light or system theme and renders properly', () => {
    render(
      <ThemeProvider defaultTheme="light">
        <TestThemeComponent />
      </ThemeProvider>
    )

    expect(screen.getByTestId('current-theme').textContent).toBe('light')
    expect(screen.getByTestId('resolved-theme').textContent).toBe('light')
    expect(document.documentElement.classList.contains('dark')).toBe(false)
  })

  it('switches to dark theme, adds .dark class to root, and persists in localStorage', () => {
    render(
      <ThemeProvider defaultTheme="light">
        <TestThemeComponent />
      </ThemeProvider>
    )

    fireEvent.click(screen.getByText('Set Dark'))

    expect(screen.getByTestId('current-theme').textContent).toBe('dark')
    expect(screen.getByTestId('resolved-theme').textContent).toBe('dark')
    expect(document.documentElement.classList.contains('dark')).toBe(true)
    expect(localStorage.getItem('everygyan-theme')).toBe('dark')
  })

  it('switches to light theme and removes .dark class from root', () => {
    render(
      <ThemeProvider defaultTheme="dark">
        <TestThemeComponent />
      </ThemeProvider>
    )

    expect(document.documentElement.classList.contains('dark')).toBe(true)

    fireEvent.click(screen.getByText('Set Light'))

    expect(screen.getByTestId('current-theme').textContent).toBe('light')
    expect(document.documentElement.classList.contains('dark')).toBe(false)
    expect(localStorage.getItem('everygyan-theme')).toBe('light')
  })

  it('toggleTheme switches between dark and light', () => {
    render(
      <ThemeProvider defaultTheme="light">
        <TestThemeComponent />
      </ThemeProvider>
    )

    fireEvent.click(screen.getByText('Toggle'))
    expect(screen.getByTestId('current-theme').textContent).toBe('dark')
    expect(document.documentElement.classList.contains('dark')).toBe(true)

    fireEvent.click(screen.getByText('Toggle'))
    expect(screen.getByTestId('current-theme').textContent).toBe('light')
    expect(document.documentElement.classList.contains('dark')).toBe(false)
  })
})

import { describe, it, expect, beforeEach, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'
import { ThemeProvider } from '../context/ThemeContext'
import { AuthProvider } from '../context/AuthContext'
import { Home } from './Home'
import { BottomNav } from '../components/BottomNav'

describe('Homepage & Layout Shell', () => {
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

  it('renders Bento Grid with mobile 1-col, tablet 2-col, and desktop 12-col responsive classes', () => {
    const { container } = render(
      <ThemeProvider defaultTheme="light">
        <AuthProvider>
          <BrowserRouter>
            <Home />
          </BrowserRouter>
        </AuthProvider>
      </ThemeProvider>
    )

    const bentoGrid = container.querySelector('.grid.grid-cols-1.md\\:grid-cols-2.lg\\:grid-cols-12')
    expect(bentoGrid).not.toBeNull()

    // Featured Story Card
    const featuredCard = container.querySelector('.col-span-1.md\\:col-span-2.lg\\:col-span-7')
    expect(featuredCard).not.toBeNull()

    // Secondary Spotlight Column
    const secondaryCol = container.querySelector('.col-span-1.md\\:col-span-2.lg\\:col-span-5')
    expect(secondaryCol).not.toBeNull()
  })

  it('filters posts accurately when clicking pillar tabs', () => {
    render(
      <ThemeProvider defaultTheme="light">
        <AuthProvider>
          <BrowserRouter>
            <Home />
          </BrowserRouter>
        </AuthProvider>
      </ThemeProvider>
    )

    expect(screen.getByText('All Stories')).toBeInTheDocument()

    // Click "Travel" tab
    fireEvent.click(screen.getByRole('button', { name: /Travel/i }))
    expect(screen.getAllByText(/Kyoto Off-The-Beaten-Path/i).length).toBeGreaterThan(0)
    expect(screen.getByText(/Arctic Expedition/i)).toBeInTheDocument()
  })

  it('subscribes successfully to Weekly Gyan Letter', () => {
    render(
      <ThemeProvider defaultTheme="light">
        <AuthProvider>
          <BrowserRouter>
            <Home />
          </BrowserRouter>
        </AuthProvider>
      </ThemeProvider>
    )

    const emailInput = screen.getByPlaceholderText(/Enter your email address/i)
    fireEvent.change(emailInput, { target: { value: 'architect@everygyan.com' } })

    fireEvent.click(screen.getByRole('button', { name: /Subscribe Free/i }))

    expect(screen.getByText(/Welcome aboard the Gyan Letter!/i)).toBeInTheDocument()
  })

  it('renders BottomNav with mobile thumb-friendly actions and md:hidden class', () => {
    render(
      <ThemeProvider defaultTheme="light">
        <AuthProvider>
          <BrowserRouter>
            <BottomNav />
          </BrowserRouter>
        </AuthProvider>
      </ThemeProvider>
    )

    const nav = screen.getByLabelText('Mobile Bottom Navigation')
    expect(nav).toHaveClass('md:hidden')
    expect(screen.getByText('Home')).toBeInTheDocument()
    expect(screen.getByText('Pillars')).toBeInTheDocument()
    expect(screen.getByText('Search')).toBeInTheDocument()
    expect(screen.getByText('Saved')).toBeInTheDocument()
    expect(screen.getByText('Account')).toBeInTheDocument()
  })
})

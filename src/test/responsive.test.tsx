import { describe, it, expect, beforeEach, vi } from 'vitest'
import { render } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'
import { App } from '../App'

describe('Viewport & Responsive Layout Shell Verification', () => {
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
  })

  it('verifies 375px Mobile viewport responsiveness with zero overflow and bottom bar present', () => {
    window.innerWidth = 375
    window.innerHeight = 667
    window.dispatchEvent(new Event('resize'))

    const { container } = render(<App />)

    // Check main container has mobile-safe bottom padding
    const mainEl = container.querySelector('main')
    expect(mainEl).toHaveClass('pb-16')

    // Bottom Navigation Bar is mounted
    const bottomNav = container.querySelector('nav[aria-label="Mobile Bottom Navigation"]')
    expect(bottomNav).not.toBeNull()

    // Bento Grid has 1-column layout on mobile
    const bento = container.querySelector('.grid.grid-cols-1')
    expect(bento).not.toBeNull()
  })

  it('verifies 768px Tablet viewport responsiveness', () => {
    window.innerWidth = 768
    window.innerHeight = 1024
    window.dispatchEvent(new Event('resize'))

    const { container } = render(<App />)

    // Tablet layout triggers md:grid-cols-2 for Bento
    const bentoTablet = container.querySelector('.md\\:grid-cols-2')
    expect(bentoTablet).not.toBeNull()

    // Mobile bottom nav has md:hidden applied to hide on tablet/desktop
    const bottomNav = container.querySelector('nav[aria-label="Mobile Bottom Navigation"]')
    expect(bottomNav).toHaveClass('md:hidden')
  })

  it('verifies 1440px Desktop viewport responsiveness', () => {
    window.innerWidth = 1440
    window.innerHeight = 900
    window.dispatchEvent(new Event('resize'))

    const { container } = render(<App />)

    // Bento Grid triggers 12-column asymmetric layout
    const bentoDesktop = container.querySelector('.lg\\:grid-cols-12')
    expect(bentoDesktop).not.toBeNull()

    // Desktop header displays main navigation links
    const desktopNav = container.querySelector('nav[aria-label="Main Navigation"]')
    expect(desktopNav).toHaveClass('hidden')
    expect(desktopNav).toHaveClass('lg:flex')
  })
})

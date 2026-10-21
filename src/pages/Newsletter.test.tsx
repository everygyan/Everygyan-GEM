import { describe, it, expect, beforeEach, vi } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { ThemeProvider } from '../context/ThemeContext'
import { AuthProvider } from '../context/AuthContext'
import { Newsletter } from './Newsletter'
import { newsletterService } from '../services/newsletterService'

describe('Newsletter Page (Weekly Gyan Letter & Public Archive)', () => {
  beforeEach(() => {
    localStorage.clear()
    vi.clearAllMocks()
    Object.assign(navigator, {
      clipboard: {
        writeText: vi.fn().mockImplementation(() => Promise.resolve()),
      },
    })
  })

  it('renders landing page with subscription hero and past weekly letters archive', async () => {
    render(
      <ThemeProvider defaultTheme="light">
        <AuthProvider>
          <MemoryRouter>
            <Newsletter />
          </MemoryRouter>
        </AuthProvider>
      </ThemeProvider>
    )

    expect(screen.getByText(/The Weekly Gyan Dispatch/i)).toBeInTheDocument()
    expect(screen.getByPlaceholderText(/Enter your personal email address/i)).toBeInTheDocument()

    // Past Archive Header
    expect(screen.getByText(/Past Weekly Letters Archive/i)).toBeInTheDocument()

    // Past editions loaded
    await waitFor(() => {
      expect(screen.getByText(/Gyan Letter #42/i)).toBeInTheDocument()
      expect(screen.getByText(/Gyan Letter #41/i)).toBeInTheDocument()
    })
  })

  it('validates subscription form and handles successful subscription', async () => {
    const subscribeSpy = vi.spyOn(newsletterService, 'subscribe').mockResolvedValueOnce({
      success: true,
      message: 'You are now subscribed to the Weekly Gyan Letter! Check your inbox soon.',
      isExisting: false,
    })

    render(
      <ThemeProvider defaultTheme="light">
        <AuthProvider>
          <MemoryRouter>
            <Newsletter />
          </MemoryRouter>
        </AuthProvider>
      </ThemeProvider>
    )

    const emailInput = screen.getByPlaceholderText(/Enter your personal email address/i)
    const submitBtn = screen.getByRole('button', { name: /Join the Gyan Letter/i })

    fireEvent.change(emailInput, { target: { value: 'builder@everygyan.com' } })
    fireEvent.click(submitBtn)

    await waitFor(() => {
      expect(subscribeSpy).toHaveBeenCalledWith(
        'builder@everygyan.com',
        expect.any(Object),
        'newsletter_landing_page'
      )
      expect(screen.getByText(/You are now subscribed to the Weekly Gyan Letter/i)).toBeInTheDocument()
    })
  })

  it('handles duplicate subscription gracefully by updating preferences', async () => {
    vi.spyOn(newsletterService, 'subscribe').mockResolvedValueOnce({
      success: true,
      message: 'Welcome back! Your newsletter preferences have been updated.',
      isExisting: true,
    })

    render(
      <ThemeProvider defaultTheme="light">
        <AuthProvider>
          <MemoryRouter>
            <Newsletter />
          </MemoryRouter>
        </AuthProvider>
      </ThemeProvider>
    )

    const emailInput = screen.getByPlaceholderText(/Enter your personal email address/i)
    const submitBtn = screen.getByRole('button', { name: /Join the Gyan Letter/i })

    fireEvent.change(emailInput, { target: { value: 'existing@everygyan.com' } })
    fireEvent.click(submitBtn)

    await waitFor(() => {
      expect(screen.getByText(/Welcome back! Your newsletter preferences have been updated/i)).toBeInTheDocument()
    })
  })

  it('opens edition reader modal and copies edition link', async () => {
    render(
      <ThemeProvider defaultTheme="light">
        <AuthProvider>
          <MemoryRouter>
            <Newsletter />
          </MemoryRouter>
        </AuthProvider>
      </ThemeProvider>
    )

    await waitFor(() => {
      expect(screen.getByText(/Gyan Letter #42/i)).toBeInTheDocument()
    })

    const readButtons = screen.getAllByRole('button', { name: /Read Letter Online/i })
    fireEvent.click(readButtons[0])

    // Modal opens
    await waitFor(() => {
      expect(screen.getByRole('dialog')).toBeInTheDocument()
    })
    expect(screen.getByText(/Close Reader/i)).toBeInTheDocument()

    // Copy link
    const copyBtn = screen.getByTitle(/Copy link/i)
    fireEvent.click(copyBtn)
    expect(navigator.clipboard.writeText).toHaveBeenCalled()

    // Close modal
    fireEvent.click(screen.getByRole('button', { name: /Close Reader/i }))
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  })
})

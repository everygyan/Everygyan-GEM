import { describe, it, expect, beforeEach, vi } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { ThemeProvider } from '../context/ThemeContext'
import * as AuthContextModule from '../context/AuthContext'
import { Profile } from './Profile'
import { bookmarkService } from '../services/bookmarkService'

describe('Profile Page (Account, Bookmarks, Comments, Newsletter Preferences)', () => {
  beforeEach(() => {
    localStorage.clear()
    vi.clearAllMocks()
  })

  it('renders account information and allows editing profile', async () => {
    const updateProfileMock = vi.fn().mockResolvedValue({ success: true, error: null })
    vi.spyOn(AuthContextModule, 'useAuth').mockReturnValue({
      user: { id: 'test-user-1', email: 'dev@everygyan.com' } as any,
      profile: {
        id: 'test-user-1',
        email: 'dev@everygyan.com',
        fullName: 'Devansh K.',
        bio: 'Architectural engineer',
        role: 'user',
      },
      session: null,
      isLoading: false,
      isAuthenticated: true,
      isAdmin: false,
      signIn: vi.fn(),
      signUp: vi.fn(),
      signOut: vi.fn(),
      updateProfile: updateProfileMock,
    })

    render(
      <ThemeProvider defaultTheme="light">
        <MemoryRouter>
          <Profile />
        </MemoryRouter>
      </ThemeProvider>
    )

    expect(screen.getByText('Devansh K.')).toBeInTheDocument()
    expect(screen.getByText('dev@everygyan.com')).toBeInTheDocument()
    expect(screen.getByDisplayValue('Devansh K.')).toBeInTheDocument()

    // Edit full name
    const nameInput = screen.getByDisplayValue('Devansh K.')
    fireEvent.change(nameInput, { target: { value: 'Devansh Kumar' } })

    const saveBtn = screen.getByRole('button', { name: /Save Changes/i })
    fireEvent.click(saveBtn)

    await waitFor(() => {
      expect(updateProfileMock).toHaveBeenCalledWith(
        expect.objectContaining({ fullName: 'Devansh Kumar' })
      )
      expect(screen.getByText(/Profile updated successfully/i)).toBeInTheDocument()
    })
  })

  it('renders Saved Bookmarks tab with saved articles and allows removal', async () => {
    // Pre-save bookmark
    await bookmarkService.toggleBookmark('test-user-1', 'post-b1')

    vi.spyOn(AuthContextModule, 'useAuth').mockReturnValue({
      user: { id: 'test-user-1', email: 'dev@everygyan.com' } as any,
      profile: { id: 'test-user-1', email: 'dev@everygyan.com', fullName: 'Devansh K.', role: 'user' },
      session: null,
      isLoading: false,
      isAuthenticated: true,
      isAdmin: false,
      signIn: vi.fn(),
      signUp: vi.fn(),
      signOut: vi.fn(),
      updateProfile: vi.fn(),
    })

    render(
      <ThemeProvider defaultTheme="light">
        <MemoryRouter initialEntries={['/profile?tab=bookmarks']}>
          <Profile />
        </MemoryRouter>
      </ThemeProvider>
    )

    // Switch or verify bookmarks tab
    await waitFor(() => {
      expect(screen.getByText(/Your Saved Reading List/i)).toBeInTheDocument()
    })

    // Bookmarked post is rendered
    await waitFor(() => {
      expect(screen.getByText(/The Architectural Shift/i)).toBeInTheDocument()
    })

    // Remove bookmark
    const removeBtn = screen.getByTitle(/Remove bookmark/i)
    fireEvent.click(removeBtn)

    await waitFor(() => {
      expect(screen.getByText(/No saved articles yet/i)).toBeInTheDocument()
    })
  })

  it('renders Newsletter Preferences tab and allows updating subscriptions', async () => {
    vi.spyOn(AuthContextModule, 'useAuth').mockReturnValue({
      user: { id: 'test-user-1', email: 'dev@everygyan.com' } as any,
      profile: { id: 'test-user-1', email: 'dev@everygyan.com', fullName: 'Devansh K.', role: 'user' },
      session: null,
      isLoading: false,
      isAuthenticated: true,
      isAdmin: false,
      signIn: vi.fn(),
      signUp: vi.fn(),
      signOut: vi.fn(),
      updateProfile: vi.fn(),
    })

    render(
      <ThemeProvider defaultTheme="light">
        <MemoryRouter initialEntries={['/profile?tab=newsletter']}>
          <Profile />
        </MemoryRouter>
      </ThemeProvider>
    )

    await waitFor(() => {
      expect(screen.getByText(/Weekly Gyan Letter Preferences/i)).toBeInTheDocument()
    })

    const updatePrefsBtn = screen.getByRole('button', { name: /Update Preferences/i })
    fireEvent.click(updatePrefsBtn)

    await waitFor(() => {
      expect(screen.getByText(/Newsletter preferences updated successfully/i)).toBeInTheDocument()
    })
  })
})

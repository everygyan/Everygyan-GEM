import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { CommentSection } from './CommentSection'
import * as AuthContextModule from '../../context/AuthContext'
import { commentService } from '../../services/commentService'

describe('CommentSection Component', () => {
  beforeEach(() => {
    localStorage.clear()
    vi.clearAllMocks()
  })

  it('renders sign in prompt when user is unauthenticated', async () => {
    vi.spyOn(AuthContextModule, 'useAuth').mockReturnValue({
      user: null,
      profile: null,
      session: null,
      isLoading: false,
      isAuthenticated: false,
      isAdmin: false,
      signIn: vi.fn(),
      signUp: vi.fn(),
      signOut: vi.fn(),
      updateProfile: vi.fn(),
    })

    render(
      <MemoryRouter>
        <CommentSection postId="post-b1" postSlug="architectural-shift-edge-functions" />
      </MemoryRouter>
    )

    expect(screen.getByText(/Community Discussion/i)).toBeInTheDocument()

    // Unauthenticated prompt
    expect(screen.getByText(/Join the conversation/i)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /Sign In to Comment/i })).toBeInTheDocument()

    // Seed comments load
    await waitFor(() => {
      expect(screen.getByText(/Brilliant writeup!/i)).toBeInTheDocument()
    })
  })

  it('allows authenticated user to create a new comment', async () => {
    vi.spyOn(AuthContextModule, 'useAuth').mockReturnValue({
      user: { id: 'test-user-123', email: 'alex@example.com' } as any,
      profile: { id: 'test-user-123', email: 'alex@example.com', fullName: 'Alex Rivera', role: 'user' },
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
      <MemoryRouter>
        <CommentSection postId="post-b1" postSlug="architectural-shift-edge-functions" />
      </MemoryRouter>
    )

    const textarea = screen.getByPlaceholderText(/Share your perspective/i)
    fireEvent.change(textarea, {
      target: { value: 'This architecture breakdown matches our edge migration exactly!' },
    })

    const postBtn = screen.getByRole('button', { name: /Post Comment/i })
    fireEvent.click(postBtn)

    await waitFor(() => {
      expect(
        screen.getByText(/This architecture breakdown matches our edge migration exactly!/i)
      ).toBeInTheDocument()
    })
  })

  it('allows authenticated owner to edit their comment', async () => {
    vi.spyOn(AuthContextModule, 'useAuth').mockReturnValue({
      user: { id: 'user-sarah', email: 'sarah@example.com' } as any,
      profile: { id: 'user-sarah', email: 'sarah@example.com', fullName: 'Sarah Chen', role: 'user' },
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
      <MemoryRouter>
        <CommentSection postId="post-b1" postSlug="architectural-shift-edge-functions" />
      </MemoryRouter>
    )

    await waitFor(() => {
      expect(screen.getByText(/Brilliant writeup!/i)).toBeInTheDocument()
    })

    const editBtn = screen.getByTitle(/Edit Comment/i)
    fireEvent.click(editBtn)

    const editTextarea = screen.getByDisplayValue(/Brilliant writeup!/i)
    fireEvent.change(editTextarea, { target: { value: 'Updated comment text with more details.' } })

    const saveBtn = screen.getByRole('button', { name: /Save/i })
    fireEvent.click(saveBtn)

    await waitFor(() => {
      expect(screen.getByText(/Updated comment text with more details./i)).toBeInTheDocument()
    })
  })

  it('allows authenticated owner to delete their comment', async () => {
    vi.spyOn(window, 'confirm').mockReturnValue(true)
    vi.spyOn(AuthContextModule, 'useAuth').mockReturnValue({
      user: { id: 'user-sarah', email: 'sarah@example.com' } as any,
      profile: { id: 'user-sarah', email: 'sarah@example.com', fullName: 'Sarah Chen', role: 'user' },
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
      <MemoryRouter>
        <CommentSection postId="post-b1" postSlug="architectural-shift-edge-functions" />
      </MemoryRouter>
    )

    await waitFor(() => {
      expect(screen.getByText(/Brilliant writeup!/i)).toBeInTheDocument()
    })

    const deleteBtn = screen.getByTitle(/Delete Comment/i)
    fireEvent.click(deleteBtn)

    await waitFor(() => {
      expect(screen.queryByText(/Brilliant writeup!/i)).not.toBeInTheDocument()
    })
  })
})

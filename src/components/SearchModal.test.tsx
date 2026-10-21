import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { SearchModal } from './SearchModal'

const mockNavigate = vi.fn()
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom')
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  }
})

describe('SearchModal Component', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders nothing when isOpen is false', () => {
    const { container } = render(
      <MemoryRouter>
        <SearchModal isOpen={false} onClose={vi.fn()} />
      </MemoryRouter>
    )
    expect(container.firstChild).toBeNull()
  })

  it('renders search input and initial results when opened', async () => {
    render(
      <MemoryRouter>
        <SearchModal isOpen={true} onClose={vi.fn()} />
      </MemoryRouter>
    )

    expect(screen.getByPlaceholderText(/Search stories, learning tracks/i)).toBeInTheDocument()

    await waitFor(() => {
      expect(screen.getByText(/The Architectural Shift/i)).toBeInTheDocument()
    })
  })

  it('filters results when searching by query text', async () => {
    render(
      <MemoryRouter>
        <SearchModal isOpen={true} onClose={vi.fn()} />
      </MemoryRouter>
    )

    await waitFor(() => {
      expect(screen.getByText(/The Architectural Shift/i)).toBeInTheDocument()
    })

    const input = screen.getByPlaceholderText(/Search stories, learning tracks/i)
    fireEvent.change(input, { target: { value: 'Kyoto' } })

    await waitFor(() => {
      expect(screen.getByText(/Kyoto Off-The-Beaten-Path/i)).toBeInTheDocument()
    })

    expect(screen.queryByText(/The Architectural Shift/i)).not.toBeInTheDocument()
  })

  it('filters results when clicking pillar filter buttons', async () => {
    render(
      <MemoryRouter>
        <SearchModal isOpen={true} onClose={vi.fn()} />
      </MemoryRouter>
    )

    await waitFor(() => {
      expect(screen.getByText(/The Architectural Shift/i)).toBeInTheDocument()
    })

    // Click 'travel' filter
    const travelFilterBtn = screen.getByRole('button', { name: /^travel$/i })
    fireEvent.click(travelFilterBtn)

    await waitFor(() => {
      expect(screen.getByText(/Kyoto Off-The-Beaten-Path/i)).toBeInTheDocument()
    })

    expect(screen.queryByText(/The Architectural Shift/i)).not.toBeInTheDocument()
  })

  it('navigates to post on clicking a result and closes modal', async () => {
    const onClose = vi.fn()
    render(
      <MemoryRouter>
        <SearchModal isOpen={true} onClose={onClose} />
      </MemoryRouter>
    )

    await waitFor(() => {
      expect(screen.getByText(/The Architectural Shift/i)).toBeInTheDocument()
    })

    fireEvent.click(screen.getByText(/The Architectural Shift/i))

    expect(mockNavigate).toHaveBeenCalledWith('/post/architectural-shift-edge-functions')
    expect(onClose).toHaveBeenCalled()
  })
})

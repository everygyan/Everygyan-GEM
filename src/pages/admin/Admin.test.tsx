import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { MemoryRouter, Routes, Route } from 'react-router-dom'
import { AuthProvider } from '../../context/AuthContext'
import { AdminLayout } from './AdminLayout'
import { AdminDashboard } from './AdminDashboard'
import { AdminPosts } from './AdminPosts'
import { AdminPostEditor } from './AdminPostEditor'
import { AdminComments } from './AdminComments'
import { AdminNewsletters } from './AdminNewsletters'

const setupAdminSession = () => {
  localStorage.setItem(
    'everygyan_mock_session',
    JSON.stringify({
      user: { id: 'admin-1', email: 'admin@everygyan.com' },
      profile: {
        id: 'admin-1',
        email: 'admin@everygyan.com',
        role: 'admin',
        fullName: 'Devansh Admin',
        createdAt: '2026-01-01T00:00:00Z',
      },
    })
  )
}

const renderWithProviders = (ui: React.ReactNode, initialEntries = ['/admin']) => {
  setupAdminSession()
  return render(
    <AuthProvider>
      <MemoryRouter initialEntries={initialEntries}>
        {ui}
      </MemoryRouter>
    </AuthProvider>
  )
}

describe('Phase 5: Protected Admin Command Center', () => {
  beforeEach(() => {
    localStorage.clear()
    vi.restoreAllMocks()
    window.confirm = vi.fn().mockReturnValue(true)
  })

  it('renders AdminLayout with sidebar navigation and admin identity', async () => {
    renderWithProviders(
      <Routes>
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<div>Dashboard Child</div>} />
        </Route>
      </Routes>
    )

    await waitFor(
      () => {
        expect(screen.getAllByText(/Admin Center/i)[0]).toBeInTheDocument()
        expect(screen.getAllByText(/Overview/i)[0]).toBeInTheDocument()
        expect(screen.getAllByText(/Articles & Content/i)[0]).toBeInTheDocument()
        expect(screen.getAllByText(/Write New Post/i)[0]).toBeInTheDocument()
        expect(screen.getAllByText(/Comment Moderation/i)[0]).toBeInTheDocument()
        expect(screen.getAllByText(/Newsletter & Subscribers/i)[0]).toBeInTheDocument()
        expect(screen.getAllByText(/n8n & Automations/i)[0]).toBeInTheDocument()
        expect(screen.getByText('Dashboard Child')).toBeInTheDocument()
      },
      { timeout: 3000 }
    )
  })

  it('renders AdminDashboard with 5 KPI metrics cards and quick action links', async () => {
    renderWithProviders(<AdminDashboard />)

    await waitFor(
      () => {
        expect(screen.getByText(/Command Center Overview/i)).toBeInTheDocument()
        expect(screen.getByText(/^Published$/i)).toBeInTheDocument()
        expect(screen.getByText(/^Drafts$/i)).toBeInTheDocument()
        expect(screen.getByText(/^Total Reads$/i)).toBeInTheDocument()
        expect(screen.getByText(/^Discussion$/i)).toBeInTheDocument()
        expect(screen.getByText(/^Subscribers$/i)).toBeInTheDocument()
      },
      { timeout: 3000 }
    )

    expect(screen.getByText(/Compose Story/i)).toBeInTheDocument()
    expect(screen.getByText(/Weekly Letter/i)).toBeInTheDocument()
  })

  it('renders AdminPosts manager with filterable table and publish/featured toggles', async () => {
    renderWithProviders(<AdminPosts />)

    await waitFor(
      () => {
        expect(screen.getByText(/Articles & Pillar Content/i)).toBeInTheDocument()
        expect(screen.getByText(/Kyoto Off-The-Beaten-Path/i)).toBeInTheDocument()
      },
      { timeout: 3000 }
    )

    // Filter selects exist
    const selects = screen.getAllByRole('combobox')
    const pillarSelect = selects[0]

    // Filter by travel pillar
    fireEvent.change(pillarSelect, { target: { value: 'travel' } })

    await waitFor(
      () => {
        expect(screen.getByText(/Kyoto Off-The-Beaten-Path/i)).toBeInTheDocument()
      },
      { timeout: 3000 }
    )
  })

  it('renders AdminPostEditor with auto-slug generation, dynamic metadata, and preview tab', async () => {
    renderWithProviders(
      <Routes>
        <Route path="/admin/posts/new" element={<AdminPostEditor />} />
      </Routes>,
      ['/admin/posts/new']
    )

    await waitFor(
      () => {
        expect(screen.getByPlaceholderText(/Enter compelling publication title.../i)).toBeInTheDocument()
      },
      { timeout: 3000 }
    )

    // Fill Title
    const titleInput = screen.getByPlaceholderText(/Enter compelling publication title.../i)
    fireEvent.change(titleInput, { target: { value: 'Mastering PostgreSQL Internals' } })

    // Auto-slug generated
    const slugInput = screen.getByDisplayValue('mastering-postgresql-internals')
    expect(slugInput).toBeInTheDocument()

    // Switch pillar to Travel to verify dynamic metadata
    const travelPillarBtn = screen.getByRole('button', { name: /^travel$/i })
    fireEvent.click(travelPillarBtn)

    expect(screen.getByText(/Travel Itinerary Quick Facts/i)).toBeInTheDocument()
    expect(screen.getByPlaceholderText(/e.g. Kyoto, Japan/i)).toBeInTheDocument()

    // Switch pillar to Learning to verify learning metadata
    const learningPillarBtn = screen.getByRole('button', { name: /^learning$/i })
    fireEvent.click(learningPillarBtn)

    expect(screen.getByText(/Curriculum & Code Module Metadata/i)).toBeInTheDocument()
    expect(screen.getByText(/Difficulty/i)).toBeInTheDocument()

    // Switch to Live Preview
    const previewBtn = screen.getByRole('button', { name: /Live Preview/i })
    fireEvent.click(previewBtn)
    expect(screen.getByText('Mastering PostgreSQL Internals')).toBeInTheDocument()
  })

  it('renders AdminComments moderation center with status filtering and reply action', async () => {
    renderWithProviders(<AdminComments />)

    await waitFor(
      () => {
        expect(screen.getByText(/Comment Moderation Center/i)).toBeInTheDocument()
      },
      { timeout: 3000 }
    )

    // Filter by approved
    const statusSelect = screen.getByRole('combobox')
    fireEvent.change(statusSelect, { target: { value: 'approved' } })

    await waitFor(
      () => {
        expect(screen.getAllByText(/approved/i).length).toBeGreaterThan(0)
      },
      { timeout: 3000 }
    )
  })

  it('renders AdminNewsletters with subscriber management, CSV export, and weekly composer', async () => {
    // Mock navigator.clipboard
    Object.assign(navigator, {
      clipboard: {
        writeText: vi.fn().mockResolvedValue(undefined),
      },
    })

    renderWithProviders(<AdminNewsletters />)

    await waitFor(
      () => {
        expect(screen.getByText(/Newsletter & Subscriber Studio/i)).toBeInTheDocument()
        expect(screen.getByText(/Total Active/i)).toBeInTheDocument()
      },
      { timeout: 3000 }
    )

    // Export CSV button
    const exportBtn = screen.getByRole('button', { name: /Export CSV/i })
    expect(exportBtn).toBeInTheDocument()

    // Switch to Weekly Letter Composer tab
    const composerTabBtn = screen.getByRole('button', { name: /Weekly Letter Composer/i })
    fireEvent.click(composerTabBtn)

    expect(screen.getByText(/Edition Subject Line/i)).toBeInTheDocument()
    expect(screen.getByText(/Dispatch Broadcast/i)).toBeInTheDocument()

    // Switch to Live Inbox Preview
    const livePreviewBtn = screen.getByRole('button', { name: /Live Inbox Preview/i })
    fireEvent.click(livePreviewBtn)
    expect(screen.getByText(/From:/i)).toBeInTheDocument()

    // Copy Email HTML for External Sender
    const copyHtmlBtn = screen.getByRole('button', { name: /Copy Email HTML/i })
    fireEvent.click(copyHtmlBtn)
    expect(navigator.clipboard.writeText).toHaveBeenCalled()
  })
})

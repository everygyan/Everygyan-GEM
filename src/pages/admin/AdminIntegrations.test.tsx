import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { AdminIntegrations } from './AdminIntegrations'
import { AuthProvider } from '../../context/AuthContext'

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

const renderWithProviders = (ui: React.ReactNode) => {
  setupAdminSession()
  return render(
    <AuthProvider>
      <MemoryRouter>
        {ui}
      </MemoryRouter>
    </AuthProvider>
  )
}

describe('AdminIntegrations Component (n8n & Webhooks)', () => {
  beforeEach(() => {
    localStorage.clear()
    vi.restoreAllMocks()
    Object.assign(navigator, {
      clipboard: {
        writeText: vi.fn().mockResolvedValue(undefined),
      },
    })
  })

  it('renders n8n integration header, connection endpoints, and step-by-step guide', () => {
    renderWithProviders(<AdminIntegrations />)

    expect(screen.getByText(/n8n Automation & Ingest Webhook/i)).toBeInTheDocument()
    expect(screen.getByText(/Webhook Endpoint/i)).toBeInTheDocument()
    expect(screen.getByText(/Security Header/i)).toBeInTheDocument()
    expect(screen.getByText(/Supported Pillars/i)).toBeInTheDocument()
    expect(screen.getByText(/How to Setup Your n8n Autonomous Workflow in 3 Steps/i)).toBeInTheDocument()
  })

  it('copies sample n8n workflow JSON when clicking copy button', () => {
    renderWithProviders(<AdminIntegrations />)

    const copyBtn = screen.getByRole('button', { name: /Copy Sample n8n Workflow/i })
    fireEvent.click(copyBtn)

    expect(navigator.clipboard.writeText).toHaveBeenCalled()
    expect(screen.getByText(/Copied n8n Workflow JSON!/i)).toBeInTheDocument()
  })

  it('switches payload templates when selecting different pillar presets', () => {
    renderWithProviders(<AdminIntegrations />)

    // Switch to learning preset
    const learningBtn = screen.getByRole('button', { name: /learning Template/i })
    fireEvent.click(learningBtn)

    const textarea = screen.getByRole('textbox', { name: /JSON Request Body/i }) as HTMLTextAreaElement
    expect(textarea.value).toContain('Tutorial: Building Resilient Webhooks with Supabase & n8n')

    // Switch to travel preset
    const travelBtn = screen.getByRole('button', { name: /travel Template/i })
    fireEvent.click(travelBtn)
    expect(textarea.value).toContain('Field Notes: The Secluded Coastal Trails of Algarve')
  })

  it('runs interactive test webhook and renders 200 OK result with post URL', async () => {
    renderWithProviders(<AdminIntegrations />)

    const sendBtn = screen.getByRole('button', { name: /Send Test Ingest/i })
    fireEvent.click(sendBtn)

    await waitFor(
      () => {
        expect(screen.getByText(/200 OK/i)).toBeInTheDocument()
        expect(screen.getByText(/Article ingested successfully via n8n automation webhook/i)).toBeInTheDocument()
      },
      { timeout: 3000 }
    )
  })

  it('displays 401 Unauthorized when API key is empty', async () => {
    renderWithProviders(<AdminIntegrations />)

    // Clear API key input
    const apiKeyInput = screen.getByPlaceholderText(/Enter API Key secret.../i)
    fireEvent.change(apiKeyInput, { target: { value: '' } })

    const sendBtn = screen.getByRole('button', { name: /Send Test Ingest/i })
    fireEvent.click(sendBtn)

    await waitFor(
      () => {
        expect(screen.getByText(/401 Error/i)).toBeInTheDocument()
        expect(screen.getByText(/Missing 'x-api-key' header/i)).toBeInTheDocument()
      },
      { timeout: 3000 }
    )
  })
})

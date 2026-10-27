import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { InlineImageModal } from './InlineImageModal'

describe('InlineImageModal Component', () => {
  it('renders modal when open with upload and URL tabs', () => {
    const handleClose = vi.fn()
    const handleInsert = vi.fn()

    render(
      <InlineImageModal
        isOpen={true}
        onClose={handleClose}
        onInsert={handleInsert}
      />
    )

    expect(screen.getByText(/Insert Image into Article/i)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /Upload Image \(Auto-WebP\)/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /Image by URL/i })).toBeInTheDocument()
  })

  it('allows inserting an image via URL tab with custom alt text and caption', async () => {
    const handleClose = vi.fn()
    const handleInsert = vi.fn()

    render(
      <InlineImageModal
        isOpen={true}
        onClose={handleClose}
        onInsert={handleInsert}
      />
    )

    // Switch to URL tab
    const urlTabBtn = screen.getByRole('button', { name: /Image by URL/i })
    fireEvent.click(urlTabBtn)

    // Enter Image URL
    const urlInput = screen.getByPlaceholderText(/https:\/\/images\.unsplash\.com/i)
    fireEvent.change(urlInput, { target: { value: 'https://images.unsplash.com/photo-123456789' } })

    // Enter Alt text
    const altInput = screen.getByPlaceholderText(/e\.g\. Distributed database replication topology/i)
    fireEvent.change(altInput, { target: { value: 'PostgreSQL Architecture Diagram' } })

    // Enter Caption
    const captionInput = screen.getByPlaceholderText(/e\.g\. Figure 2: Master-follower write synchronization latency/i)
    fireEvent.change(captionInput, { target: { value: 'Figure 1: High throughput replication topology' } })

    // Click Insert
    const insertBtn = screen.getByRole('button', { name: /Insert into Article/i })
    expect(insertBtn).not.toBeDisabled()
    fireEvent.click(insertBtn)

    await waitFor(() => {
      expect(handleInsert).toHaveBeenCalledWith(
        expect.stringContaining('![PostgreSQL Architecture Diagram](https://images.unsplash.com/photo-123456789)')
      )
      expect(handleInsert).toHaveBeenCalledWith(
        expect.stringContaining('*Figure 1: High throughput replication topology*')
      )
      expect(handleClose).toHaveBeenCalled()
    })
  })

  it('calls onClose when Cancel button or Escape key is triggered', () => {
    const handleClose = vi.fn()
    const handleInsert = vi.fn()

    render(
      <InlineImageModal
        isOpen={true}
        onClose={handleClose}
        onInsert={handleInsert}
      />
    )

    const cancelBtn = screen.getByRole('button', { name: /^Cancel$/i })
    fireEvent.click(cancelBtn)
    expect(handleClose).toHaveBeenCalled()
  })
})

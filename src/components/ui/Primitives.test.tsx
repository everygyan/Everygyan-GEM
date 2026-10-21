import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { Button } from './Button'
import { Badge } from './Badge'
import { Card, CardTitle } from './Card'
import { Input } from './Input'

describe('UI Primitives', () => {
  it('renders Button with variants and handles loading state', () => {
    const { rerender } = render(<Button variant="blog">Blog Button</Button>)
    expect(screen.getByRole('button', { name: /Blog Button/i })).toHaveClass('bg-indigo-600')

    rerender(<Button isLoading>Loading Button</Button>)
    expect(screen.getByRole('button')).toBeDisabled()
  })

  it('renders Badge with pillar accents', () => {
    const { rerender } = render(<Badge variant="learning">Learning Track</Badge>)
    expect(screen.getByText('Learning Track')).toHaveClass('text-emerald-700')

    rerender(<Badge variant="travel">Travel Log</Badge>)
    expect(screen.getByText('Travel Log')).toHaveClass('text-amber-700')
  })

  it('renders Card and Input primitives cleanly', () => {
    render(
      <Card data-testid="test-card">
        <CardTitle>Editorial Title</CardTitle>
        <Input placeholder="Search term..." />
      </Card>
    )

    expect(screen.getByTestId('test-card')).toBeInTheDocument()
    expect(screen.getByText('Editorial Title')).toBeInTheDocument()
    expect(screen.getByPlaceholderText('Search term...')).toBeInTheDocument()
  })
})

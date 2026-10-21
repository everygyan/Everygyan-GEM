import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Search, FileText, BookOpen, Compass, ArrowRight, X } from 'lucide-react'
import { Badge } from './ui/Badge'

interface SearchItem {
  id: string
  title: string
  pillar: 'blog' | 'learning' | 'travel'
  description: string
  path: string
}

const SAMPLE_SEARCH_DATA: SearchItem[] = [
  {
    id: '1',
    title: 'Architecting Scalable Edge Functions with Supabase',
    pillar: 'blog',
    description: 'Learn how to deploy latency-sensitive background logic globally.',
    path: '/blog',
  },
  {
    id: '2',
    title: 'Complete Masterclass: React 19 Concurrent Rendering',
    pillar: 'learning',
    description: 'Master Actions, optimistic updates, and useTransition hooks.',
    path: '/learning',
  },
  {
    id: '3',
    title: 'Kyoto Off-The-Beaten-Path: Hidden Temples & Teahouses',
    pillar: 'travel',
    description: 'A 7-day serene itinerary beyond the bustling tourist tracks.',
    path: '/travel',
  },
  {
    id: '4',
    title: 'Designing Resilient Micro-Frontends with Vite Module Federation',
    pillar: 'blog',
    description: 'Strategies for enterprise web architecture without performance regressions.',
    path: '/blog',
  },
  {
    id: '5',
    title: 'TypeScript 6.0 Type Gymnastics for Production Systems',
    pillar: 'learning',
    description: 'Const generics, template literal types, and custom utility schemas.',
    path: '/learning',
  },
  {
    id: '6',
    title: 'Nordic Road Trip: Fjord Crossing & Northern Lights Guide',
    pillar: 'travel',
    description: 'Practical logistics, EV charging stations, and photography spots in Tromsø.',
    path: '/travel',
  },
]

interface SearchModalProps {
  isOpen: boolean
  onClose: () => void
}

export const SearchModal: React.FC<SearchModalProps> = ({ isOpen, onClose }) => {
  const [query, setQuery] = useState('')
  const [selectedPillar, setSelectedPillar] = useState<'all' | 'blog' | 'learning' | 'travel'>('all')
  const navigate = useNavigate()

  useEffect(() => {
    if (!isOpen) {
      setQuery('')
      setSelectedPillar('all')
    }
  }, [isOpen])

  const filteredItems = SAMPLE_SEARCH_DATA.filter((item) => {
    const matchesPillar = selectedPillar === 'all' || item.pillar === selectedPillar
    const matchesQuery =
      item.title.toLowerCase().includes(query.toLowerCase()) ||
      item.description.toLowerCase().includes(query.toLowerCase())
    return matchesPillar && matchesQuery
  })

  const getPillarIcon = (pillar: 'blog' | 'learning' | 'travel') => {
    switch (pillar) {
      case 'blog':
        return <FileText className="h-4 w-4 text-indigo-500" />
      case 'learning':
        return <BookOpen className="h-4 w-4 text-emerald-500" />
      case 'travel':
        return <Compass className="h-4 w-4 text-amber-500" />
    }
  }

  if (!isOpen) return null

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center p-4 pt-16 sm:pt-24"
      role="dialog"
      aria-modal="true"
      aria-label="Instant Search"
    >
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      {/* Search Container */}
      <div className="relative z-10 w-full max-w-2xl overflow-hidden rounded-2xl border border-border bg-surface shadow-2xl transition-all">
        {/* Search Input Bar */}
        <div className="flex items-center border-b border-border px-4 py-3">
          <Search className="h-5 w-5 text-foreground-muted shrink-0" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search stories, learning tracks, and travel guides..."
            autoFocus
            className="w-full bg-transparent px-3 text-base text-foreground placeholder:text-foreground-muted focus:outline-none"
          />
          {query && (
            <button
              onClick={() => setQuery('')}
              className="rounded-md p-1 text-foreground-muted hover:bg-surface-subtle hover:text-foreground"
            >
              <X className="h-4 w-4" />
            </button>
          )}
          <kbd className="ml-2 hidden rounded border border-border bg-surface-subtle px-2 py-0.5 text-[10px] font-mono text-foreground-muted sm:inline-block">
            ESC
          </kbd>
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-1.5 border-b border-border/60 bg-surface-subtle/50 px-4 py-2 text-xs">
          <span className="text-foreground-muted font-medium mr-1">Filter:</span>
          {(['all', 'blog', 'learning', 'travel'] as const).map((pillar) => (
            <button
              key={pillar}
              onClick={() => setSelectedPillar(pillar)}
              className={`rounded-lg px-2.5 py-1 font-medium capitalize transition-all cursor-pointer ${
                selectedPillar === pillar
                  ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-xs'
                  : 'text-foreground-muted hover:text-foreground hover:bg-surface'
              }`}
            >
              {pillar}
            </button>
          ))}
        </div>

        {/* Search Results List */}
        <div className="max-h-96 overflow-y-auto p-2">
          {filteredItems.length === 0 ? (
            <div className="py-12 text-center">
              <p className="text-sm text-foreground-muted">No results found for &ldquo;{query}&rdquo;</p>
              <p className="mt-1 text-xs text-foreground-muted">Try searching with broader terms or clear filter.</p>
            </div>
          ) : (
            <div className="space-y-1">
              {filteredItems.map((item) => (
                <div
                  key={item.id}
                  onClick={() => {
                    navigate(item.path)
                    onClose()
                  }}
                  className="group flex cursor-pointer items-center justify-between rounded-xl p-3 transition-colors hover:bg-surface-subtle"
                >
                  <div className="flex items-start gap-3">
                    <div className="mt-0.5 rounded-lg border border-border p-2 bg-surface">
                      {getPillarIcon(item.pillar)}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-sm text-foreground group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                          {item.title}
                        </span>
                        <Badge variant={item.pillar} size="sm">
                          {item.pillar}
                        </Badge>
                      </div>
                      <p className="mt-0.5 text-xs text-foreground-muted line-clamp-1">
                        {item.description}
                      </p>
                    </div>
                  </div>
                  <ArrowRight className="h-4 w-4 text-foreground-muted opacity-0 group-hover:opacity-100 transition-opacity shrink-0 ml-2" />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer shortcuts */}
        <div className="flex items-center justify-between border-t border-border bg-surface-subtle/30 px-4 py-2.5 text-[11px] text-foreground-muted">
          <span>Search EveryGyan Knowledge Base</span>
          <span>Press ESC to close</span>
        </div>
      </div>
    </div>
  )
}

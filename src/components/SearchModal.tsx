import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Search, FileText, BookOpen, Compass, ArrowRight, X, Clock, Eye } from 'lucide-react'
import { Badge } from './ui/Badge'
import { postService } from '../services/postService'
import type { Post, PillarType } from '../types'

interface SearchModalProps {
  isOpen: boolean
  onClose: () => void
}

export const SearchModal: React.FC<SearchModalProps> = ({ isOpen, onClose }) => {
  const [query, setQuery] = useState('')
  const [selectedPillar, setSelectedPillar] = useState<'all' | PillarType>('all')
  const [results, setResults] = useState<Post[]>([])
  const [loading, setLoading] = useState(false)
  const requestIdRef = React.useRef(0)
  const navigate = useNavigate()

  useEffect(() => {
    if (!isOpen) {
      setQuery('')
      setSelectedPillar('all')
      setResults([])
      return
    }

    // Load initial suggestions
    loadSearchResults('', 'all')
  }, [isOpen])

  const loadSearchResults = async (searchQuery: string, pillar: 'all' | PillarType) => {
    const currentReq = ++requestIdRef.current
    setLoading(true)
    try {
      const response = await postService.getPosts({
        search: searchQuery,
        pillar: pillar !== 'all' ? pillar : undefined,
        limit: 8,
      })
      if (currentReq === requestIdRef.current) {
        setResults(response.posts)
      }
    } finally {
      if (currentReq === requestIdRef.current) {
        setLoading(false)
      }
    }
  }

  const handleQueryChange = (val: string) => {
    setQuery(val)
    loadSearchResults(val, selectedPillar)
  }

  const handlePillarChange = (pillar: 'all' | PillarType) => {
    setSelectedPillar(pillar)
    loadSearchResults(query, pillar)
  }

  const getPillarIcon = (pillar: PillarType) => {
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
        className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs transition-opacity"
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
            onChange={(e) => handleQueryChange(e.target.value)}
            placeholder="Search stories, learning tracks, and travel guides..."
            autoFocus
            className="w-full bg-transparent px-3 text-base text-foreground placeholder:text-foreground-muted focus:outline-none"
          />
          {query && (
            <button
              onClick={() => handleQueryChange('')}
              className="rounded-md p-1 text-foreground-muted hover:bg-surface-subtle hover:text-foreground cursor-pointer"
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
              onClick={() => handlePillarChange(pillar)}
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
          {loading ? (
            <div className="py-8 text-center text-sm text-foreground-muted">Searching knowledge base...</div>
          ) : results.length === 0 ? (
            <div className="py-12 text-center">
              <p className="text-sm text-foreground-muted">No results found for &ldquo;{query}&rdquo;</p>
              <p className="mt-1 text-xs text-foreground-muted">Try searching with broader keywords or clear filter.</p>
            </div>
          ) : (
            <div className="space-y-1">
              {results.map((item) => (
                <div
                  key={item.id}
                  onClick={() => {
                    navigate(`/post/${item.slug}`)
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
                        {item.excerpt}
                      </p>
                      <div className="mt-1.5 flex items-center gap-3 text-[11px] text-foreground-muted">
                        <span className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {item.readTime}
                        </span>
                        <span className="flex items-center gap-1">
                          <Eye className="h-3 w-3" />
                          {item.views} views
                        </span>
                      </div>
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

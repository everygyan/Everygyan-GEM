import React, { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { Home, Compass, Search, Bookmark, User, X, FileText, BookOpen, ArrowRight } from 'lucide-react'
import { SearchModal } from './SearchModal'
import { Button } from './ui/Button'
import { useAuth } from '../context/AuthContext'

export const BottomNav: React.FC = () => {
  const location = useLocation()
  const navigate = useNavigate()
  const { isAuthenticated } = useAuth()
  const [isSearchOpen, setIsSearchOpen] = useState(false)
  const [isExploreOpen, setIsExploreOpen] = useState(false)
  const [isSavedOpen, setIsSavedOpen] = useState(false)

  const isHome = location.pathname === '/'

  return (
    <>
      <nav
        className="fixed bottom-0 inset-x-0 z-40 flex h-16 items-center justify-around border-t border-border bg-surface/90 backdrop-blur-lg px-2 text-xs md:hidden"
        aria-label="Mobile Bottom Navigation"
      >
        {/* Home */}
        <Link
          to="/"
          className={`flex flex-col items-center gap-1 rounded-xl px-3 py-1.5 transition-colors ${
            isHome
              ? 'text-indigo-600 dark:text-indigo-400 font-bold'
              : 'text-foreground-muted hover:text-foreground'
          }`}
        >
          <Home className="h-5 w-5" />
          <span className="text-[10px]">Home</span>
        </Link>

        {/* Explore Pillars */}
        <button
          onClick={() => setIsExploreOpen(true)}
          className={`flex flex-col items-center gap-1 rounded-xl px-3 py-1.5 transition-colors cursor-pointer ${
            ['/blog', '/learning', '/travel'].includes(location.pathname)
              ? 'text-indigo-600 dark:text-indigo-400 font-bold'
              : 'text-foreground-muted hover:text-foreground'
          }`}
        >
          <Compass className="h-5 w-5" />
          <span className="text-[10px]">Pillars</span>
        </button>

        {/* Search */}
        <button
          onClick={() => setIsSearchOpen(true)}
          className="flex flex-col items-center gap-1 rounded-xl px-3 py-1.5 text-foreground-muted hover:text-foreground transition-colors cursor-pointer"
        >
          <Search className="h-5 w-5" />
          <span className="text-[10px]">Search</span>
        </button>

        {/* Saved */}
        <button
          onClick={() => {
            if (isAuthenticated) {
              navigate('/profile?tab=bookmarks')
            } else {
              setIsSavedOpen(true)
            }
          }}
          className={`flex flex-col items-center gap-1 rounded-xl px-3 py-1.5 transition-colors cursor-pointer ${
            location.search.includes('tab=bookmarks')
              ? 'text-indigo-600 dark:text-indigo-400 font-bold'
              : 'text-foreground-muted hover:text-foreground'
          }`}
        >
          <Bookmark className="h-5 w-5" />
          <span className="text-[10px]">Saved</span>
        </button>

        {/* Account */}
        <button
          onClick={() => navigate(isAuthenticated ? '/profile' : '/login')}
          className={`flex flex-col items-center gap-1 rounded-xl px-3 py-1.5 transition-colors cursor-pointer ${
            ['/login', '/signup', '/profile', '/admin'].includes(location.pathname)
              ? 'text-indigo-600 dark:text-indigo-400 font-bold'
              : 'text-foreground-muted hover:text-foreground'
          }`}
        >
          <User className="h-5 w-5" />
          <span className="text-[10px]">{isAuthenticated ? 'Profile' : 'Account'}</span>
        </button>
      </nav>

      {/* Explore Pillars Bottom Sheet */}
      {isExploreOpen && (
        <div className="fixed inset-0 z-50 flex items-end justify-center md:hidden" role="dialog" aria-modal="true">
          <div
            className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs"
            onClick={() => setIsExploreOpen(false)}
          />
          <div className="relative z-10 w-full rounded-t-3xl border-t border-border bg-surface p-6 shadow-2xl animate-in slide-in-from-bottom">
            <div className="flex items-center justify-between pb-3 border-b border-border">
              <h3 className="font-bold text-base text-foreground">Explore EveryGyan Pillars</h3>
              <button
                onClick={() => setIsExploreOpen(false)}
                className="rounded-lg p-1 text-foreground-muted hover:bg-surface-subtle"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="mt-4 space-y-3 pb-4">
              <Link
                to="/blog"
                onClick={() => setIsExploreOpen(false)}
                className="flex items-center justify-between rounded-2xl border border-indigo-200/60 bg-indigo-50/50 p-4 dark:border-indigo-900/60 dark:bg-indigo-950/30"
              >
                <div className="flex items-center gap-3">
                  <div className="rounded-xl bg-indigo-600 p-2 text-white">
                    <FileText className="h-5 w-5" />
                  </div>
                  <div>
                    <h4 className="font-bold text-sm text-foreground">Blog</h4>
                    <p className="text-xs text-foreground-muted">Deep architectural & tech perspectives</p>
                  </div>
                </div>
                <ArrowRight className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
              </Link>

              <Link
                to="/learning"
                onClick={() => setIsExploreOpen(false)}
                className="flex items-center justify-between rounded-2xl border border-emerald-200/60 bg-emerald-50/50 p-4 dark:border-emerald-900/60 dark:bg-emerald-950/30"
              >
                <div className="flex items-center gap-3">
                  <div className="rounded-xl bg-emerald-600 p-2 text-white">
                    <BookOpen className="h-5 w-5" />
                  </div>
                  <div>
                    <h4 className="font-bold text-sm text-foreground">Learning Hub</h4>
                    <p className="text-xs text-foreground-muted">Hands-on tutorials, roadmaps & guides</p>
                  </div>
                </div>
                <ArrowRight className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
              </Link>

              <Link
                to="/travel"
                onClick={() => setIsExploreOpen(false)}
                className="flex items-center justify-between rounded-2xl border border-amber-200/60 bg-amber-50/50 p-4 dark:border-amber-900/60 dark:bg-amber-950/30"
              >
                <div className="flex items-center gap-3">
                  <div className="rounded-xl bg-amber-500 p-2 text-white">
                    <Compass className="h-5 w-5" />
                  </div>
                  <div>
                    <h4 className="font-bold text-sm text-foreground">Travel Guides</h4>
                    <p className="text-xs text-foreground-muted">Itineraries, routes & culture</p>
                  </div>
                </div>
                <ArrowRight className="h-4 w-4 text-amber-600 dark:text-amber-400" />
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* Saved / Bookmarks Modal */}
      {isSavedOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 md:hidden" role="dialog" aria-modal="true">
          <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs" onClick={() => setIsSavedOpen(false)} />
          <div className="relative z-10 w-full max-w-sm rounded-2xl border border-border bg-surface p-6 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-border">
              <h3 className="font-bold text-base text-foreground">Reading List & Bookmarks</h3>
              <button onClick={() => setIsSavedOpen(false)} className="rounded-lg p-1 text-foreground-muted hover:bg-surface-subtle">
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="py-8 text-center">
              <Bookmark className="mx-auto h-10 w-10 text-foreground-muted" />
              <p className="mt-3 text-sm font-semibold text-foreground">No saved articles yet</p>
              <p className="mt-1 text-xs text-foreground-muted">
                Save articles and learning tracks to read offline or review later.
              </p>
              <div className="mt-6">
                <Button size="sm" onClick={() => setIsSavedOpen(false)}>
                  Start Exploring
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Search Modal */}
      <SearchModal isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />
    </>
  )
}

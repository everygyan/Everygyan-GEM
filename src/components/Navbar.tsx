import React, { useState, useEffect } from 'react'
import { Link, useLocation } from 'react-router-dom'
import {
  Sparkles,
  Search,
  Menu,
  X,
  FileText,
  BookOpen,
  Compass,
  Mail,
  User,
  ArrowRight,
  LayoutDashboard,
} from 'lucide-react'
import { ThemeToggle } from './ThemeToggle'
import { Button } from './ui/Button'
import { SearchModal } from './SearchModal'
import { useAuth } from '../context/AuthContext'

export const Navbar: React.FC = () => {
  const location = useLocation()
  const { isAuthenticated, profile, isAdmin } = useAuth()
  const [isDrawerOpen, setIsDrawerOpen] = useState(false)
  const [isSearchOpen, setIsSearchOpen] = useState(false)

  // Global shortcut for Cmd/Ctrl + K
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault()
        setIsSearchOpen((prev) => !prev)
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [])

  // Close drawer on route change
  useEffect(() => {
    setIsDrawerOpen(false)
  }, [location.pathname])

  const navLinks = [
    { name: 'Home', path: '/' },
    { name: 'Blog', path: '/blog', badge: 'Tech & Architecture', color: 'text-indigo-500' },
    { name: 'Learning', path: '/learning', badge: 'Roadmaps & Code', color: 'text-emerald-500' },
    { name: 'Travel', path: '/travel', badge: 'Itineraries', color: 'text-amber-500' },
    { name: 'Newsletter', path: '#newsletter' },
  ]

  return (
    <>
      <header className="sticky top-0 z-40 w-full border-b border-border/80 bg-surface/85 backdrop-blur-md transition-colors">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          {/* Brand Logo */}
          <div className="flex items-center gap-3">
            <Link
              to="/"
              className="group flex items-center gap-2.5 text-xl font-bold tracking-tight text-foreground transition-all"
            >
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-tr from-indigo-600 to-indigo-400 text-white shadow-xs group-hover:scale-105 transition-transform">
                <Sparkles className="h-5 w-5" />
              </div>
              <span className="font-extrabold tracking-tight">
                Every<span className="text-indigo-600 dark:text-indigo-400">Gyan</span>
              </span>
            </Link>
          </div>

          {/* Desktop Navigation Links (>1024px) */}
          <nav className="hidden lg:flex items-center gap-1.5" aria-label="Main Navigation">
            {navLinks.map((link) => {
              const isExternalOrAnchor = link.path.startsWith('#')
              const isActive = !isExternalOrAnchor && location.pathname === link.path

              if (isExternalOrAnchor) {
                return (
                  <a
                    key={link.name}
                    href={link.path}
                    className="rounded-xl px-3.5 py-2 text-sm font-medium text-foreground-muted hover:bg-surface-subtle hover:text-foreground transition-colors"
                  >
                    {link.name}
                  </a>
                )
              }

              return (
                <Link
                  key={link.name}
                  to={link.path}
                  className={`rounded-xl px-3.5 py-2 text-sm font-medium transition-colors ${
                    isActive
                      ? 'bg-surface-subtle font-semibold text-foreground shadow-2xs'
                      : 'text-foreground-muted hover:bg-surface-subtle hover:text-foreground'
                  }`}
                >
                  {link.name}
                </Link>
              )
            })}
          </nav>

          {/* Right Action Utilities */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Instant Search Trigger */}
            <button
              onClick={() => setIsSearchOpen(true)}
              className="flex items-center gap-2 rounded-xl border border-border/70 bg-surface-subtle/80 px-3 py-1.5 text-xs text-foreground-muted hover:border-indigo-400 hover:text-foreground transition-all cursor-pointer shadow-2xs"
              aria-label="Search EveryGyan (Press Ctrl+K)"
            >
              <Search className="h-3.5 w-3.5 text-foreground-muted" />
              <span className="hidden sm:inline">Search Gyan...</span>
              <kbd className="hidden sm:inline-flex rounded border border-border bg-surface px-1.5 py-0.5 text-[10px] font-mono font-medium">
                ⌘K
              </kbd>
            </button>

            {/* Theme Toggle Button */}
            <ThemeToggle />

            {/* Desktop Auth / Profile CTA */}
            <div className="hidden lg:flex items-center gap-2">
              {isAuthenticated ? (
                <div className="flex items-center gap-2">
                  {isAdmin && (
                    <Link to="/admin">
                      <Button variant="ghost" size="sm" leftIcon={<LayoutDashboard className="h-3.5 w-3.5 text-indigo-500" />}>
                        Admin
                      </Button>
                    </Link>
                  )}
                  <Link to="/profile">
                    <Button variant="outline" size="sm" leftIcon={<User className="h-3.5 w-3.5" />}>
                      {profile?.fullName || 'Profile'}
                    </Button>
                  </Link>
                </div>
              ) : (
                <Link to="/login">
                  <Button variant="outline" size="sm" leftIcon={<User className="h-3.5 w-3.5" />}>
                    Sign In
                  </Button>
                </Link>
              )}
            </div>

            {/* Tablet / Mobile Hamburger Menu Button (hidden on desktop) */}
            <button
              onClick={() => setIsDrawerOpen(true)}
              className="flex lg:hidden items-center justify-center rounded-xl p-2 text-foreground-muted hover:bg-surface-subtle hover:text-foreground border border-border/60 cursor-pointer"
              aria-label="Open Navigation Menu"
            >
              <Menu className="h-5 w-5" />
            </button>
          </div>
        </div>
      </header>

      {/* Tablet & Mobile Slide-Over Drawer */}
      {isDrawerOpen && (
        <div className="fixed inset-0 z-50 lg:hidden" role="dialog" aria-modal="true">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs transition-opacity"
            onClick={() => setIsDrawerOpen(false)}
          />

          {/* Drawer Menu */}
          <div className="fixed inset-y-0 right-0 z-10 w-full max-w-xs sm:max-w-sm bg-surface p-6 shadow-2xl border-l border-border flex flex-col justify-between">
            <div>
              {/* Header inside drawer */}
              <div className="flex items-center justify-between pb-4 border-b border-border">
                <div className="flex items-center gap-2">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-600 text-white">
                    <Sparkles className="h-4 w-4" />
                  </div>
                  <span className="font-bold text-lg text-foreground">EveryGyan</span>
                </div>
                <button
                  onClick={() => setIsDrawerOpen(false)}
                  className="rounded-lg p-1.5 text-foreground-muted hover:bg-surface-subtle cursor-pointer"
                  aria-label="Close Navigation Menu"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {/* Navigation Items in Drawer */}
              <div className="mt-6 space-y-1.5">
                <Link
                  to="/"
                  className="flex items-center justify-between rounded-xl px-4 py-3 text-sm font-semibold text-foreground hover:bg-surface-subtle transition-colors"
                >
                  <span>Home</span>
                  <ArrowRight className="h-4 w-4 text-foreground-muted" />
                </Link>
                <Link
                  to="/blog"
                  className="flex items-center justify-between rounded-xl px-4 py-3 text-sm font-semibold text-foreground hover:bg-surface-subtle transition-colors"
                >
                  <div className="flex items-center gap-2.5">
                    <FileText className="h-4 w-4 text-indigo-500" />
                    <span>Blog</span>
                  </div>
                  <span className="text-[11px] font-medium text-indigo-600 dark:text-indigo-400">Pillar 1</span>
                </Link>
                <Link
                  to="/learning"
                  className="flex items-center justify-between rounded-xl px-4 py-3 text-sm font-semibold text-foreground hover:bg-surface-subtle transition-colors"
                >
                  <div className="flex items-center gap-2.5">
                    <BookOpen className="h-4 w-4 text-emerald-500" />
                    <span>Learning Hub</span>
                  </div>
                  <span className="text-[11px] font-medium text-emerald-600 dark:text-emerald-400">Pillar 2</span>
                </Link>
                <Link
                  to="/travel"
                  className="flex items-center justify-between rounded-xl px-4 py-3 text-sm font-semibold text-foreground hover:bg-surface-subtle transition-colors"
                >
                  <div className="flex items-center gap-2.5">
                    <Compass className="h-4 w-4 text-amber-500" />
                    <span>Travel Guides</span>
                  </div>
                  <span className="text-[11px] font-medium text-amber-600 dark:text-amber-400">Pillar 3</span>
                </Link>
                <a
                  href="#newsletter"
                  onClick={() => setIsDrawerOpen(false)}
                  className="flex items-center justify-between rounded-xl px-4 py-3 text-sm font-semibold text-foreground hover:bg-surface-subtle transition-colors"
                >
                  <div className="flex items-center gap-2.5">
                    <Mail className="h-4 w-4 text-sky-500" />
                    <span>Weekly Newsletter</span>
                  </div>
                  <span className="text-[11px] font-medium text-foreground-muted">Weekly</span>
                </a>
              </div>
            </div>

            {/* Bottom Actions in Drawer */}
            <div className="border-t border-border pt-6 space-y-3">
              {isAuthenticated ? (
                <div className="space-y-2">
                  {isAdmin && (
                    <Link to="/admin" onClick={() => setIsDrawerOpen(false)}>
                      <Button variant="blog" className="w-full mb-2" leftIcon={<LayoutDashboard className="h-4 w-4" />}>
                        Admin Console
                      </Button>
                    </Link>
                  )}
                  <Link to="/profile" onClick={() => setIsDrawerOpen(false)}>
                    <Button variant="outline" className="w-full" leftIcon={<User className="h-4 w-4" />}>
                      My Profile ({profile?.fullName || 'User'})
                    </Button>
                  </Link>
                </div>
              ) : (
                <Link to="/login" onClick={() => setIsDrawerOpen(false)}>
                  <Button variant="primary" className="w-full" leftIcon={<User className="h-4 w-4" />}>
                    Sign In to EveryGyan
                  </Button>
                </Link>
              )}
              <div className="flex items-center justify-between px-2 text-xs text-foreground-muted">
                <span>Theme Mode</span>
                <ThemeToggle showLabel />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Global Search Modal */}
      <SearchModal isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />
    </>
  )
}

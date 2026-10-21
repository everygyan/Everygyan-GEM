import React, { useState } from 'react'
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom'
import {
  LayoutDashboard,
  FileText,
  PlusCircle,
  MessageSquare,
  Mail,
  ArrowLeft,
  Menu,
  X,
  LogOut,
  ExternalLink,
  Sparkles,
} from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import { Button } from '../../components/ui/Button'
import { Badge } from '../../components/ui/Badge'

export const AdminLayout: React.FC = () => {
  const { profile, signOut } = useAuth()
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false)
  const location = useLocation()
  const navigate = useNavigate()

  const navItems = [
    { name: 'Overview', path: '/admin', icon: LayoutDashboard, exact: true },
    { name: 'Articles & Content', path: '/admin/posts', icon: FileText },
    { name: 'Write New Post', path: '/admin/posts/new', icon: PlusCircle },
    { name: 'Comment Moderation', path: '/admin/comments', icon: MessageSquare },
    { name: 'Newsletter & Subscribers', path: '/admin/newsletters', icon: Mail },
  ]

  const isLinkActive = (path: string, exact?: boolean) => {
    if (exact) {
      return location.pathname === path
    }
    return location.pathname.startsWith(path) && (path !== '/admin' || location.pathname === '/admin')
  }

  const handleSignOut = async () => {
    await signOut()
    navigate('/')
  }

  return (
    <div className="flex min-h-screen bg-background">
      {/* 1. Desktop Sidebar */}
      <aside className="hidden lg:flex w-64 flex-col justify-between border-r border-border bg-surface p-4">
        <div>
          {/* Admin Header */}
          <div className="flex items-center gap-2.5 px-3 py-3 border-b border-border">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-600 text-white shadow-xs">
              <Sparkles className="h-4 w-4" />
            </div>
            <div>
              <span className="font-extrabold text-sm tracking-tight text-foreground">
                Every<span className="text-indigo-600 dark:text-indigo-400">Gyan</span>
              </span>
              <span className="block text-[10px] font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
                Admin Center
              </span>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="mt-6 space-y-1.5">
            {navItems.map((item) => {
              const Icon = item.icon
              const active = isLinkActive(item.path, item.exact)

              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-xs font-bold transition-all ${
                    active
                      ? 'bg-indigo-600 text-white shadow-xs'
                      : 'text-foreground-muted hover:bg-surface-subtle hover:text-foreground'
                  }`}
                >
                  <Icon className="h-4 w-4 shrink-0" />
                  <span>{item.name}</span>
                </Link>
              )
            })}
          </nav>
        </div>

        {/* Sidebar Footer / User Identity */}
        <div className="space-y-3 border-t border-border pt-4">
          <Link
            to="/"
            className="flex items-center gap-2 rounded-xl px-3.5 py-2 text-xs font-semibold text-foreground-muted hover:bg-surface-subtle hover:text-foreground transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Return to Public Site</span>
          </Link>

          <div className="rounded-2xl border border-border bg-surface-subtle/50 p-3">
            <div className="flex items-center gap-2.5">
              <img
                src={
                  profile?.avatarUrl ||
                  `https://api.dicebear.com/7.x/initials/svg?seed=${profile?.email || 'Admin'}`
                }
                alt="Avatar"
                className="h-8 w-8 rounded-lg object-cover border border-border"
              />
              <div className="overflow-hidden">
                <span className="block font-bold text-xs text-foreground truncate">
                  {profile?.fullName || 'Administrator'}
                </span>
                <span className="block text-[10px] text-foreground-muted truncate">
                  {profile?.email}
                </span>
              </div>
            </div>

            <button
              onClick={handleSignOut}
              className="mt-2.5 w-full flex items-center justify-center gap-1.5 rounded-lg border border-border py-1 text-[11px] font-semibold text-red-500 hover:bg-red-50 dark:hover:bg-red-950/40 transition-colors cursor-pointer"
            >
              <LogOut className="h-3 w-3" />
              <span>Sign Out</span>
            </button>
          </div>
        </div>
      </aside>

      {/* 2. Mobile Drawer Navigation */}
      {isMobileSidebarOpen && (
        <div className="fixed inset-0 z-50 flex lg:hidden" role="dialog" aria-modal="true">
          <div
            className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs"
            onClick={() => setIsMobileSidebarOpen(false)}
          />
          <div className="relative z-10 w-72 max-w-[80vw] flex flex-col justify-between border-r border-border bg-surface p-5 shadow-2xl">
            <div>
              <div className="flex items-center justify-between pb-4 border-b border-border">
                <div className="flex items-center gap-2">
                  <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-indigo-600 text-white">
                    <Sparkles className="h-4 w-4" />
                  </div>
                  <span className="font-extrabold text-sm text-foreground">Command Center</span>
                </div>
                <button
                  onClick={() => setIsMobileSidebarOpen(false)}
                  className="rounded-lg p-1 text-foreground-muted hover:bg-surface-subtle"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <nav className="mt-6 space-y-1.5">
                {navItems.map((item) => {
                  const Icon = item.icon
                  const active = isLinkActive(item.path, item.exact)
                  return (
                    <Link
                      key={item.path}
                      to={item.path}
                      onClick={() => setIsMobileSidebarOpen(false)}
                      className={`flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-xs font-bold transition-all ${
                        active
                          ? 'bg-indigo-600 text-white shadow-xs'
                          : 'text-foreground-muted hover:bg-surface-subtle hover:text-foreground'
                      }`}
                    >
                      <Icon className="h-4 w-4 shrink-0" />
                      <span>{item.name}</span>
                    </Link>
                  )
                })}
              </nav>
            </div>

            <div className="border-t border-border pt-4">
              <Link
                to="/"
                onClick={() => setIsMobileSidebarOpen(false)}
                className="flex items-center gap-2 text-xs font-semibold text-foreground-muted"
              >
                <ArrowLeft className="h-4 w-4" />
                <span>Return to Public Site</span>
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* 3. Main Body Content */}
      <div className="flex flex-1 flex-col overflow-x-hidden">
        {/* Top Navbar */}
        <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-border bg-surface/85 backdrop-blur-md px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsMobileSidebarOpen(true)}
              className="rounded-xl border border-border p-2 text-foreground-muted hover:bg-surface-subtle hover:text-foreground lg:hidden cursor-pointer"
            >
              <Menu className="h-5 w-5" />
            </button>
            <div className="flex items-center gap-2">
              <Badge variant="blog" size="sm" dot>
                Admin RLS Active
              </Badge>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Link to="/admin/posts/new">
              <Button size="sm" variant="blog" leftIcon={<PlusCircle className="h-4 w-4" />}>
                New Post
              </Button>
            </Link>
            <Link to="/" target="_blank" rel="noreferrer">
              <Button size="sm" variant="outline" rightIcon={<ExternalLink className="h-3.5 w-3.5" />}>
                Live Portal
              </Button>
            </Link>
          </div>
        </header>

        {/* Nested Route View */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  )
}

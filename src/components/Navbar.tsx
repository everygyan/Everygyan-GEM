import React from 'react'
import { Link, useLocation } from 'react-router-dom'
import { BookOpen, Compass, FileText, Sparkles } from 'lucide-react'

export const Navbar: React.FC = () => {
  const location = useLocation()

  const navItems = [
    { name: 'Home', path: '/', icon: Sparkles },
    { name: 'Blog', path: '/blog', icon: FileText },
    { name: 'Learning', path: '/learning', icon: BookOpen },
    { name: 'Travel', path: '/travel', icon: Compass },
  ]

  return (
    <header className="sticky top-0 z-50 w-full border-b border-slate-200 bg-white/95 backdrop-blur dark:border-slate-800 dark:bg-slate-900/95">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6 lg:px-8">
        <Link to="/" className="flex items-center gap-2 text-xl font-bold tracking-tight text-indigo-600 dark:text-indigo-400">
          <Sparkles className="h-6 w-6" />
          <span>EveryGyan</span>
        </Link>
        <nav className="flex items-center gap-1 sm:gap-4">
          {navItems.map((item) => {
            const Icon = item.icon
            const isActive = location.pathname === item.path
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-indigo-50 text-indigo-600 dark:bg-indigo-950/60 dark:text-indigo-400'
                    : 'text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800'
                }`}
              >
                <Icon className="h-4 w-4" />
                <span className="hidden sm:inline">{item.name}</span>
              </Link>
            )
          })}
        </nav>
      </div>
    </header>
  )
}

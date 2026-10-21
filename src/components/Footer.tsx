import React from 'react'
import { Link } from 'react-router-dom'
import { Sparkles, Rss, ArrowUpRight } from 'lucide-react'

// Brand Icons
const GithubIcon: React.FC<{ className?: string }> = ({ className = 'h-4 w-4' }) => (
  <svg className={className} fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
    <path
      fillRule="evenodd"
      d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"
      clipRule="evenodd"
    />
  </svg>
)

const TwitterXIcon: React.FC<{ className?: string }> = ({ className = 'h-4 w-4' }) => (
  <svg className={className} fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
  </svg>
)

const LinkedinIcon: React.FC<{ className?: string }> = ({ className = 'h-4 w-4' }) => (
  <svg className={className} fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
    <path
      fillRule="evenodd"
      d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"
      clipRule="evenodd"
    />
  </svg>
)

export const Footer: React.FC = () => {
  return (
    <footer className="mt-auto border-t border-border bg-surface text-foreground transition-colors">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-10 md:grid-cols-2 lg:grid-cols-5">
          {/* Brand Info */}
          <div className="lg:col-span-2">
            <Link to="/" className="flex items-center gap-2.5 text-xl font-bold tracking-tight text-foreground">
              <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-indigo-600 text-white shadow-xs">
                <Sparkles className="h-4 w-4" />
              </div>
              <span className="font-extrabold tracking-tight">
                Every<span className="text-indigo-600 dark:text-indigo-400">Gyan</span>
              </span>
            </Link>
            <p className="mt-4 max-w-sm text-sm text-foreground-muted leading-relaxed font-sans">
              EveryGyan is an editorial-first knowledge portal. We craft architectural deep dives, curated learning roadmaps, and authentic travel logs for curious builders.
            </p>
            {/* Social Links */}
            <div className="mt-6 flex items-center gap-3">
              <a
                href="https://github.com/everygyan/Everygyan-GEM"
                target="_blank"
                rel="noreferrer"
                className="rounded-xl border border-border p-2 text-foreground-muted hover:bg-surface-subtle hover:text-foreground transition-colors"
                aria-label="GitHub Repository"
              >
                <GithubIcon className="h-4 w-4" />
              </a>
              <a
                href="https://twitter.com"
                target="_blank"
                rel="noreferrer"
                className="rounded-xl border border-border p-2 text-foreground-muted hover:bg-surface-subtle hover:text-foreground transition-colors"
                aria-label="Twitter Profile"
              >
                <TwitterXIcon className="h-4 w-4" />
              </a>
              <a
                href="https://linkedin.com"
                target="_blank"
                rel="noreferrer"
                className="rounded-xl border border-border p-2 text-foreground-muted hover:bg-surface-subtle hover:text-foreground transition-colors"
                aria-label="LinkedIn Profile"
              >
                <LinkedinIcon className="h-4 w-4" />
              </a>
              <a
                href="/rss.xml"
                className="rounded-xl border border-border p-2 text-foreground-muted hover:bg-surface-subtle hover:text-amber-500 transition-colors"
                aria-label="RSS Feed"
              >
                <Rss className="h-4 w-4" />
              </a>
            </div>
          </div>

          {/* Pillar 1: Blog */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
              Blog & Stories
            </h4>
            <ul className="mt-4 space-y-2.5 text-sm text-foreground-muted">
              <li>
                <Link to="/blog" className="hover:text-foreground transition-colors">
                  System Architecture
                </Link>
              </li>
              <li>
                <Link to="/blog" className="hover:text-foreground transition-colors">
                  Edge & Cloud Native
                </Link>
              </li>
              <li>
                <Link to="/blog" className="hover:text-foreground transition-colors">
                  Modern Frontends
                </Link>
              </li>
              <li>
                <Link to="/blog" className="hover:text-foreground transition-colors">
                  Database Scalability
                </Link>
              </li>
            </ul>
          </div>

          {/* Pillar 2: Learning */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
              Learning Tracks
            </h4>
            <ul className="mt-4 space-y-2.5 text-sm text-foreground-muted">
              <li>
                <Link to="/learning" className="hover:text-foreground transition-colors">
                  React 19 Deep Dive
                </Link>
              </li>
              <li>
                <Link to="/learning" className="hover:text-foreground transition-colors">
                  Supabase & Postgres
                </Link>
              </li>
              <li>
                <Link to="/learning" className="hover:text-foreground transition-colors">
                  TypeScript Mastery
                </Link>
              </li>
              <li>
                <Link to="/learning" className="hover:text-foreground transition-colors">
                  API Security
                </Link>
              </li>
            </ul>
          </div>

          {/* Pillar 3: Travel */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400">
              Travel Expeditions
            </h4>
            <ul className="mt-4 space-y-2.5 text-sm text-foreground-muted">
              <li>
                <Link to="/travel" className="hover:text-foreground transition-colors">
                  Asian Itineraries
                </Link>
              </li>
              <li>
                <Link to="/travel" className="hover:text-foreground transition-colors">
                  Nordic Landscapes
                </Link>
              </li>
              <li>
                <Link to="/travel" className="hover:text-foreground transition-colors">
                  Solo Road Trips
                </Link>
              </li>
              <li>
                <Link to="/travel" className="hover:text-foreground transition-colors">
                  Nomad Packing Gear
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Sub-bar */}
        <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-border pt-8 text-xs text-foreground-muted sm:flex-row">
          <div className="flex items-center gap-2">
            <span className="flex h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>All EveryGyan Systems Operational</span>
          </div>
          <div className="flex items-center gap-6">
            <span>&copy; {new Date().getFullYear()} EveryGyan Platform.</span>
            <a href="https://github.com/everygyan/Everygyan-GEM" target="_blank" rel="noreferrer" className="hover:text-foreground flex items-center gap-1">
              Source on GitHub <ArrowUpRight className="h-3 w-3" />
            </a>
          </div>
        </div>
      </div>
    </footer>
  )
}

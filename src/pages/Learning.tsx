import React from 'react'
import { BookOpen } from 'lucide-react'

export const Learning: React.FC = () => {
  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <div className="flex items-center gap-3">
        <div className="rounded-lg bg-emerald-500/10 p-2 text-emerald-600 dark:text-emerald-400">
          <BookOpen className="h-6 w-6" />
        </div>
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">Learning Hub</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">Structured lessons, technical guides, and tutorials</p>
        </div>
      </div>

      <div className="mt-8 rounded-xl border border-slate-200 bg-white p-8 text-center dark:border-slate-800 dark:bg-slate-900">
        <p className="text-slate-600 dark:text-slate-300">Curated educational courses and hands-on tracks.</p>
      </div>
    </div>
  )
}

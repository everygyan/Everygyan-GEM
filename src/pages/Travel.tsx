import React from 'react'
import { Compass } from 'lucide-react'

export const Travel: React.FC = () => {
  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <div className="flex items-center gap-3">
        <div className="rounded-lg bg-amber-500/10 p-2 text-amber-600 dark:text-amber-400">
          <Compass className="h-6 w-6" />
        </div>
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">Travel Logs</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">Guides, itineraries, and stories from across destinations</p>
        </div>
      </div>

      <div className="mt-8 rounded-xl border border-slate-200 bg-white p-8 text-center dark:border-slate-800 dark:bg-slate-900">
        <p className="text-slate-600 dark:text-slate-300">Destination guides, travel itineraries, and cultural insights.</p>
      </div>
    </div>
  )
}

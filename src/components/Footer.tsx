import React from 'react'

export const Footer: React.FC = () => {
  return (
    <footer className="mt-auto border-t border-slate-200 bg-white py-6 text-center text-sm text-slate-500 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-400">
      <div className="mx-auto max-w-7xl px-4">
        <p>&copy; {new Date().getFullYear()} EveryGyan — Knowledge, Exploration & Discovery. All rights reserved.</p>
      </div>
    </footer>
  )
}

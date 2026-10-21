import React from 'react'
import { Link } from 'react-router-dom'
import { Home as HomeIcon } from 'lucide-react'

export const NotFound: React.FC = () => {
  return (
    <div className="mx-auto flex max-w-7xl flex-col items-center justify-center px-4 py-24 text-center">
      <h1 className="text-6xl font-extrabold text-indigo-600 dark:text-indigo-400">404</h1>
      <h2 className="mt-4 text-2xl font-bold text-slate-900 dark:text-white">Page Not Found</h2>
      <p className="mt-2 text-slate-600 dark:text-slate-400">
        The route you are looking for does not exist or has been moved.
      </p>
      <div className="mt-6">
        <Link
          to="/"
          className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-indigo-500"
        >
          <HomeIcon className="h-4 w-4" />
          Back to Home
        </Link>
      </div>
    </div>
  )
}

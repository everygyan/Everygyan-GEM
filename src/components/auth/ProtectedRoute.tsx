import React from 'react'
import { Navigate, useLocation, Link } from 'react-router-dom'
import { ShieldAlert, ArrowLeft, Loader2 } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import { Button } from '../ui/Button'

interface ProtectedRouteProps {
  children?: React.ReactNode
  requireAdmin?: boolean
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  requireAdmin = false,
}) => {
  const { isAuthenticated, isAdmin, isLoading } = useAuth()
  const location = useLocation()

  if (isLoading) {
    return (
      <div className="flex min-h-[50vh] flex-col items-center justify-center p-6 text-center">
        <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
        <p className="mt-3 text-sm text-foreground-muted">Verifying session credentials...</p>
      </div>
    )
  }

  // Not authenticated -> redirect to /login
  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  // Admin access required but user is not admin -> Access Denied screen
  if (requireAdmin && !isAdmin) {
    return (
      <div className="mx-auto flex max-w-xl flex-col items-center justify-center px-4 py-20 text-center">
        <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-red-600 dark:border-red-900/60 dark:bg-red-950/40 dark:text-red-400">
          <ShieldAlert className="h-10 w-10" />
        </div>
        <h1 className="mt-6 text-3xl font-extrabold tracking-tight text-foreground font-serif">
          Access Denied
        </h1>
        <p className="mt-3 text-base text-foreground-muted font-sans max-w-md">
          Administrator privileges are required to view this area. Your account is currently authenticated as a standard reader.
        </p>
        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          <Link to="/">
            <Button variant="outline" size="sm" leftIcon={<ArrowLeft className="h-4 w-4" />}>
              Back to Home
            </Button>
          </Link>
          <Link to="/profile">
            <Button size="sm">
              View Profile
            </Button>
          </Link>
        </div>
      </div>
    )
  }

  return <>{children}</>
}

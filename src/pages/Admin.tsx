import React from 'react'
import { Link } from 'react-router-dom'
import {
  ShieldCheck,
  FileText,
  Users,
  Mail,
  Key,
  Database,
  PlusCircle,
} from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../components/ui/Card'
import { Button } from '../components/ui/Button'
import { Badge } from '../components/ui/Badge'

export const Admin: React.FC = () => {
  const { profile } = useAuth()

  const stats = [
    { label: 'Published Articles', value: '18', icon: FileText, color: 'text-indigo-500' },
    { label: 'Active Subscribers', value: '15,420', icon: Users, color: 'text-emerald-500' },
    { label: 'Sent Newsletters', value: '42', icon: Mail, color: 'text-amber-500' },
    { label: 'Active API Keys', value: '3', icon: Key, color: 'text-purple-500' },
  ]

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      {/* Admin Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-8">
        <div>
          <div className="flex items-center gap-2">
            <span className="flex h-2.5 w-2.5 rounded-full bg-emerald-500 animate-pulse" />
            <Badge variant="blog" size="sm" dot>
              Admin Console
            </Badge>
          </div>
          <h1 className="mt-2 text-3xl font-extrabold tracking-tight text-foreground font-serif">
            System Administration
          </h1>
          <p className="mt-1 text-sm text-foreground-muted">
            Authenticated as <strong className="text-foreground">{profile?.email}</strong> with full PostgreSQL RLS privileges.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link to="/post/create">
            <Button variant="blog" size="sm" leftIcon={<PlusCircle className="h-4 w-4" />}>
              Create Article
            </Button>
          </Link>
          <Link to="/profile">
            <Button variant="outline" size="sm">
              Account Profile
            </Button>
          </Link>
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => {
          const Icon = stat.icon
          return (
            <Card key={stat.label}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-foreground-muted uppercase tracking-wider">
                    {stat.label}
                  </span>
                  <Icon className={`h-5 w-5 ${stat.color}`} />
                </div>
                <p className="mt-4 text-3xl font-extrabold text-foreground font-sans">
                  {stat.value}
                </p>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Security & RLS Health Summary Card */}
      <div className="mt-8 grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg font-bold flex items-center gap-2">
                <ShieldCheck className="h-5 w-5 text-emerald-500" />
                Row-Level Security (RLS) Policy Status
              </CardTitle>
              <CardDescription>
                Verified against schema definition at supabase/schema.sql
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="divide-y divide-border text-xs">
                <div className="flex items-center justify-between py-2.5">
                  <span className="font-mono font-medium text-foreground">public.posts</span>
                  <span className="rounded-md bg-emerald-50 dark:bg-emerald-950/60 px-2 py-0.5 text-emerald-700 dark:text-emerald-300 font-bold">
                    RLS Active (is_admin() required for write)
                  </span>
                </div>
                <div className="flex items-center justify-between py-2.5">
                  <span className="font-mono font-medium text-foreground">public.comments</span>
                  <span className="rounded-md bg-emerald-50 dark:bg-emerald-950/60 px-2 py-0.5 text-emerald-700 dark:text-emerald-300 font-bold">
                    RLS Active (Owner write, Public approved read)
                  </span>
                </div>
                <div className="flex items-center justify-between py-2.5">
                  <span className="font-mono font-medium text-foreground">public.subscribers</span>
                  <span className="rounded-md bg-emerald-50 dark:bg-emerald-950/60 px-2 py-0.5 text-emerald-700 dark:text-emerald-300 font-bold">
                    RLS Active (Public insert, Admin select)
                  </span>
                </div>
                <div className="flex items-center justify-between py-2.5">
                  <span className="font-mono font-medium text-foreground">public.api_keys</span>
                  <span className="rounded-md bg-emerald-50 dark:bg-emerald-950/60 px-2 py-0.5 text-emerald-700 dark:text-emerald-300 font-bold">
                    RLS Active (Restricted to is_admin())
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Database & Supabase connection info */}
        <div>
          <Card>
            <CardHeader>
              <CardTitle className="text-lg font-bold flex items-center gap-2">
                <Database className="h-5 w-5 text-indigo-500" />
                Database Engine
              </CardTitle>
              <CardDescription>PostgreSQL connection state</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 text-xs text-foreground-muted">
              <p>
                Connected via Supabase client with JWT session encryption and connection pooling.
              </p>
              <div className="rounded-xl border border-border bg-surface-subtle p-3">
                <p className="font-mono text-[11px] text-foreground">
                  Trigger: on_auth_user_created (Active)
                </p>
                <p className="font-mono text-[11px] text-foreground mt-1">
                  Helper: public.is_admin() (Verified)
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Mail, ShieldCheck, LogOut, Check, LayoutDashboard } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { Button } from '../components/ui/Button'
import { Input } from '../components/ui/Input'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../components/ui/Card'
import { Badge } from '../components/ui/Badge'

export const Profile: React.FC = () => {
  const { user, profile, isAdmin, signOut, updateProfile } = useAuth()
  const [fullName, setFullName] = useState(profile?.fullName || '')
  const [bio, setBio] = useState(profile?.bio || '')
  const [savedSuccess, setSavedSuccess] = useState(false)
  const [isUpdating, setIsUpdating] = useState(false)
  const navigate = useNavigate()

  if (!user && !profile) {
    return (
      <div className="mx-auto max-w-xl px-4 py-20 text-center">
        <h2 className="text-2xl font-bold font-serif text-foreground">Sign In Required</h2>
        <p className="mt-2 text-sm text-foreground-muted">Please sign in to view and manage your profile.</p>
        <div className="mt-6">
          <Link to="/login">
            <Button size="sm">Sign In</Button>
          </Link>
        </div>
      </div>
    )
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsUpdating(true)
    await updateProfile({ fullName, bio })
    setIsUpdating(false)
    setSavedSuccess(true)
    setTimeout(() => setSavedSuccess(false), 2500)
  }

  const handleSignOut = async () => {
    await signOut()
    navigate('/')
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8">
      {/* Profile Header */}
      <div className="rounded-3xl border border-border bg-surface p-6 sm:p-8 shadow-xs">
        <div className="flex flex-col sm:flex-row items-center sm:items-start justify-between gap-6">
          <div className="flex flex-col sm:flex-row items-center gap-5 text-center sm:text-left">
            <div className="relative">
              <img
                src={
                  profile?.avatarUrl ||
                  `https://api.dicebear.com/7.x/initials/svg?seed=${profile?.email || 'User'}`
                }
                alt="Avatar"
                className="h-20 w-20 rounded-2xl object-cover border-2 border-indigo-500/20 shadow-xs"
              />
              {isAdmin && (
                <div
                  className="absolute -bottom-2 -right-2 rounded-lg bg-indigo-600 p-1 text-white shadow-xs"
                  title="Verified Administrator"
                >
                  <ShieldCheck className="h-4 w-4" />
                </div>
              )}
            </div>

            <div>
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2.5">
                <h1 className="text-2xl font-bold font-serif text-foreground">
                  {profile?.fullName || user?.email?.split('@')[0]}
                </h1>
                <Badge variant={isAdmin ? 'blog' : 'learning'} size="sm" dot>
                  {isAdmin ? 'Administrator' : 'Reader'}
                </Badge>
              </div>
              <p className="mt-1 text-sm text-foreground-muted flex items-center justify-center sm:justify-start gap-1.5">
                <Mail className="h-3.5 w-3.5" />
                {profile?.email || user?.email}
              </p>
            </div>
          </div>

          {/* Action CTAs */}
          <div className="flex items-center gap-2.5">
            {isAdmin && (
              <Link to="/admin">
                <Button variant="blog" size="sm" leftIcon={<LayoutDashboard className="h-4 w-4" />}>
                  Admin Console
                </Button>
              </Link>
            )}
            <Button
              variant="outline"
              size="sm"
              leftIcon={<LogOut className="h-4 w-4 text-red-500" />}
              onClick={handleSignOut}
            >
              Sign Out
            </Button>
          </div>
        </div>
      </div>

      {/* Profile Details Edit Form */}
      <div className="mt-8">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg font-bold font-sans">Account Information</CardTitle>
            <CardDescription>Update your personal details and author bio.</CardDescription>
          </CardHeader>
          <CardContent>
            {savedSuccess && (
              <div className="mb-4 rounded-xl border border-emerald-300 bg-emerald-50 p-3 text-xs text-emerald-800 dark:border-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300 flex items-center gap-2">
                <Check className="h-4 w-4 text-emerald-600" />
                <span>Profile updated successfully!</span>
              </div>
            )}

            <form onSubmit={handleSave} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-foreground mb-1.5">Full Name</label>
                <Input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Your full name"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-foreground mb-1.5">Bio</label>
                <textarea
                  rows={3}
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  placeholder="Tell the EveryGyan community a little about yourself..."
                  className="w-full rounded-xl border border-border bg-surface px-4 py-2 text-sm text-foreground placeholder:text-foreground-muted focus:outline-none focus:ring-2 focus:ring-indigo-500 shadow-2xs"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-foreground mb-1.5">Role (Assigned via Supabase RLS)</label>
                <Input
                  type="text"
                  value={profile?.role || 'user'}
                  disabled
                  className="bg-surface-subtle font-mono text-xs uppercase"
                />
              </div>

              <div className="pt-2">
                <Button type="submit" size="sm" isLoading={isUpdating}>
                  Save Changes
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

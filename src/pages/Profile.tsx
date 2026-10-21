import React, { useState, useEffect } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import {
  Mail,
  ShieldCheck,
  LogOut,
  Check,
  LayoutDashboard,
  User,
  Bookmark,
  MessageSquare,
  Bell,
  Trash2,
  ArrowRight,
} from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { Button } from '../components/ui/Button'
import { Input } from '../components/ui/Input'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../components/ui/Card'
import { Badge } from '../components/ui/Badge'
import { bookmarkService } from '../services/bookmarkService'
import { commentService } from '../services/commentService'
import { newsletterService } from '../services/newsletterService'
import type { Bookmark as BookmarkType, Comment, SubscriberPreferences } from '../types'

type ProfileTab = 'account' | 'bookmarks' | 'comments' | 'newsletter'

export const Profile: React.FC = () => {
  const { user, profile, isAdmin, signOut, updateProfile } = useAuth()
  const [searchParams, setSearchParams] = useSearchParams()
  const initialTab = (searchParams.get('tab') as ProfileTab) || 'account'
  const [activeTab, setActiveTab] = useState<ProfileTab>(initialTab)

  // Account details state
  const [fullName, setFullName] = useState(profile?.fullName || '')
  const [bio, setBio] = useState(profile?.bio || '')
  const [savedSuccess, setSavedSuccess] = useState(false)
  const [isUpdating, setIsUpdating] = useState(false)

  // Bookmarks state
  const [bookmarks, setBookmarks] = useState<BookmarkType[]>([])
  const [loadingBookmarks, setLoadingBookmarks] = useState(false)

  // Comments history state
  const [userComments, setUserComments] = useState<Comment[]>([])
  const [loadingComments, setLoadingComments] = useState(false)

  // Newsletter preferences state
  const [preferences, setPreferences] = useState<SubscriberPreferences>({
    blog: true,
    learning: true,
    travel: true,
  })
  const [prefsUpdating, setPrefsUpdating] = useState(false)
  const [prefsSuccess, setPrefsSuccess] = useState(false)

  const navigate = useNavigate()

  useEffect(() => {
    if (user?.id) {
      loadBookmarks()
      loadComments()
      loadPreferences()
    }
  }, [user?.id])

  useEffect(() => {
    const tabParam = searchParams.get('tab') as ProfileTab
    if (tabParam && ['account', 'bookmarks', 'comments', 'newsletter'].includes(tabParam)) {
      setActiveTab(tabParam)
    }
  }, [searchParams])

  const handleTabChange = (tab: ProfileTab) => {
    setActiveTab(tab)
    setSearchParams({ tab })
  }

  const loadBookmarks = async () => {
    if (!user?.id) return
    setLoadingBookmarks(true)
    try {
      const data = await bookmarkService.getBookmarks(user.id)
      setBookmarks(data)
    } finally {
      setLoadingBookmarks(false)
    }
  }

  const loadComments = async () => {
    if (!user?.id) return
    setLoadingComments(true)
    try {
      const data = await commentService.getUserComments(user.id)
      setUserComments(data)
    } finally {
      setLoadingComments(false)
    }
  }

  const loadPreferences = async () => {
    if (!user?.email) return
    const prefs = await newsletterService.getPreferences(user.email)
    setPreferences(prefs)
  }

  const handleRemoveBookmark = async (postId: string) => {
    if (!user?.id) return
    await bookmarkService.toggleBookmark(user.id, postId)
    setBookmarks((prev) => prev.filter((b) => b.postId !== postId))
  }

  const handleDeleteUserComment = async (commentId: string) => {
    if (!window.confirm('Are you sure you want to delete this comment?')) return
    await commentService.deleteComment(commentId)
    setUserComments((prev) => prev.filter((c) => c.id !== commentId))
  }

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsUpdating(true)
    await updateProfile({ fullName, bio })
    setIsUpdating(false)
    setSavedSuccess(true)
    setTimeout(() => setSavedSuccess(false), 2500)
  }

  const handleSavePreferences = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user?.email) return
    setPrefsUpdating(true)
    await newsletterService.updatePreferences(user.email, preferences)
    setPrefsUpdating(false)
    setPrefsSuccess(true)
    setTimeout(() => setPrefsSuccess(false), 2500)
  }

  const handleSignOut = async () => {
    await signOut()
    navigate('/')
  }

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

  return (
    <div className="mx-auto max-w-5xl px-4 py-12 sm:px-6 lg:px-8">
      {/* Profile Header */}
      <div className="rounded-3xl border border-border bg-surface p-6 sm:p-8 shadow-xs">
        <div className="flex flex-col sm:flex-row items-center sm:items-start justify-between gap-6">
          <div className="flex flex-col sm:flex-row items-center gap-5 text-center sm:text-left">
            <div className="relative">
              <img
                src={
                  profile?.avatarUrl ||
                  `https://api.dicebear.com/7.x/initials/svg?seed=${profile?.email || user?.email || 'User'}`
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
              {profile?.bio && (
                <p className="mt-2 text-xs text-foreground-muted max-w-md line-clamp-2">
                  {profile.bio}
                </p>
              )}
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

        {/* Dashboard Tabs */}
        <div className="mt-8 flex flex-wrap gap-2 border-t border-border pt-4">
          <button
            onClick={() => handleTabChange('account')}
            className={`flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'account'
                ? 'bg-indigo-600 text-white shadow-2xs'
                : 'text-foreground-muted hover:bg-surface-subtle hover:text-foreground'
            }`}
          >
            <User className="h-4 w-4" />
            <span>Account Details</span>
          </button>

          <button
            onClick={() => handleTabChange('bookmarks')}
            className={`flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'bookmarks'
                ? 'bg-indigo-600 text-white shadow-2xs'
                : 'text-foreground-muted hover:bg-surface-subtle hover:text-foreground'
            }`}
          >
            <Bookmark className="h-4 w-4" />
            <span>Saved Bookmarks</span>
            {bookmarks.length > 0 && (
              <span
                className={`rounded-full px-2 py-0.2 text-[10px] ${
                  activeTab === 'bookmarks' ? 'bg-white/20 text-white' : 'bg-surface-subtle text-foreground'
                }`}
              >
                {bookmarks.length}
              </span>
            )}
          </button>

          <button
            onClick={() => handleTabChange('comments')}
            className={`flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'comments'
                ? 'bg-indigo-600 text-white shadow-2xs'
                : 'text-foreground-muted hover:bg-surface-subtle hover:text-foreground'
            }`}
          >
            <MessageSquare className="h-4 w-4" />
            <span>Comment History</span>
            {userComments.length > 0 && (
              <span
                className={`rounded-full px-2 py-0.2 text-[10px] ${
                  activeTab === 'comments' ? 'bg-white/20 text-white' : 'bg-surface-subtle text-foreground'
                }`}
              >
                {userComments.length}
              </span>
            )}
          </button>

          <button
            onClick={() => handleTabChange('newsletter')}
            className={`flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'newsletter'
                ? 'bg-indigo-600 text-white shadow-2xs'
                : 'text-foreground-muted hover:bg-surface-subtle hover:text-foreground'
            }`}
          >
            <Bell className="h-4 w-4" />
            <span>Newsletter Preferences</span>
          </button>
        </div>
      </div>

      {/* Tab 1: Account Details */}
      {activeTab === 'account' && (
        <div className="mt-8">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg font-bold font-sans">Account Information</CardTitle>
              <CardDescription>Update your personal details, display name, and bio.</CardDescription>
            </CardHeader>
            <CardContent>
              {savedSuccess && (
                <div className="mb-4 rounded-xl border border-emerald-300 bg-emerald-50 p-3 text-xs text-emerald-800 dark:border-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300 flex items-center gap-2">
                  <Check className="h-4 w-4 text-emerald-600" />
                  <span>Profile updated successfully!</span>
                </div>
              )}

              <form onSubmit={handleSaveProfile} className="space-y-4">
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
                  <label className="block text-xs font-bold text-foreground mb-1.5">
                    Account Role (Enforced via Supabase RLS)
                  </label>
                  <Input
                    type="text"
                    value={profile?.role || 'user'}
                    disabled
                    className="bg-surface-subtle font-mono text-xs uppercase"
                  />
                </div>

                <div className="pt-2">
                  <Button type="submit" size="sm" variant="blog" isLoading={isUpdating}>
                    Save Changes
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Tab 2: Saved Bookmarks */}
      {activeTab === 'bookmarks' && (
        <div className="mt-8 space-y-4">
          <div className="flex items-center justify-between pb-2">
            <div>
              <h3 className="text-lg font-bold font-serif text-foreground">
                Your Saved Reading List
              </h3>
              <p className="text-xs text-foreground-muted">
                Articles, code tutorials, and travel routes saved for offline reference.
              </p>
            </div>
            <Link to="/blog">
              <Button size="sm" variant="outline" rightIcon={<ArrowRight className="h-3.5 w-3.5" />}>
                Explore Content
              </Button>
            </Link>
          </div>

          {loadingBookmarks ? (
            <div className="py-16 text-center text-sm text-foreground-muted">Loading your bookmarks...</div>
          ) : bookmarks.length === 0 ? (
            <Card className="py-12 text-center">
              <Bookmark className="mx-auto h-10 w-10 text-foreground-muted opacity-60" />
              <h4 className="mt-3 text-base font-bold text-foreground">No saved articles yet</h4>
              <p className="mt-1 text-xs text-foreground-muted max-w-sm mx-auto">
                Click the &ldquo;Save&rdquo; button on any Blog story, Learning module, or Travel guide to keep it in your personal reading list.
              </p>
              <div className="mt-6 flex justify-center gap-3">
                <Link to="/blog">
                  <Button size="sm" variant="blog">Browse Blog</Button>
                </Link>
                <Link to="/learning">
                  <Button size="sm" variant="learning">Learning Hub</Button>
                </Link>
              </div>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {bookmarks.map((bm) => {
                const post = bm.post
                if (!post) return null

                return (
                  <div
                    key={bm.id}
                    className="group relative flex flex-col justify-between overflow-hidden rounded-2xl border border-border bg-surface p-5 shadow-2xs hover:shadow-md transition-all"
                  >
                    <div>
                      <div className="flex items-center justify-between gap-2">
                        <Badge variant={post.pillar} size="sm">
                          {post.pillar}
                        </Badge>
                        <button
                          onClick={() => handleRemoveBookmark(post.id)}
                          className="rounded-lg p-1 text-foreground-muted hover:bg-surface-subtle hover:text-red-500 transition-colors cursor-pointer"
                          title="Remove bookmark"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>

                      <h4 className="mt-3 font-bold font-serif text-base text-foreground group-hover:text-indigo-600 transition-colors line-clamp-2">
                        <Link to={`/post/${post.slug}`}>{post.title}</Link>
                      </h4>
                      <p className="mt-1.5 text-xs text-foreground-muted line-clamp-2">
                        {post.excerpt}
                      </p>
                    </div>

                    <div className="mt-4 pt-3 border-t border-border flex items-center justify-between text-xs text-foreground-muted">
                      <span>{post.readTime}</span>
                      <Link
                        to={`/post/${post.slug}`}
                        className="font-bold text-indigo-600 dark:text-indigo-400 flex items-center gap-1 hover:underline"
                      >
                        Read Article <ArrowRight className="h-3 w-3" />
                      </Link>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      )}

      {/* Tab 3: Comment History */}
      {activeTab === 'comments' && (
        <div className="mt-8 space-y-4">
          <div>
            <h3 className="text-lg font-bold font-serif text-foreground">
              Your Comments & Contributions
            </h3>
            <p className="text-xs text-foreground-muted">
              Thoughts and discussion responses you have posted across EveryGyan.
            </p>
          </div>

          {loadingComments ? (
            <div className="py-16 text-center text-sm text-foreground-muted">Loading comment history...</div>
          ) : userComments.length === 0 ? (
            <Card className="py-12 text-center">
              <MessageSquare className="mx-auto h-10 w-10 text-foreground-muted opacity-60" />
              <h4 className="mt-3 text-base font-bold text-foreground">No comments posted yet</h4>
              <p className="mt-1 text-xs text-foreground-muted max-w-sm mx-auto">
                Engage with article authors and fellow developers by leaving comments on any post.
              </p>
            </Card>
          ) : (
            <div className="space-y-3">
              {userComments.map((c) => (
                <div
                  key={c.id}
                  className="rounded-2xl border border-border bg-surface p-4 sm:p-5 shadow-2xs"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-foreground-muted">
                      Commented on{' '}
                      <Link
                        to={`/post/${c.postSlug || c.postId}`}
                        className="font-bold text-indigo-600 dark:text-indigo-400 hover:underline"
                      >
                        {c.postTitle || 'Article'}
                      </Link>
                    </span>
                    <button
                      onClick={() => handleDeleteUserComment(c.id)}
                      className="rounded p-1 text-foreground-muted hover:text-red-500 cursor-pointer"
                      title="Delete comment"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                  <p className="mt-2 text-sm text-foreground leading-relaxed whitespace-pre-wrap">
                    {c.content}
                  </p>
                  <span className="mt-2 block text-[10px] text-foreground-muted">
                    {new Date(c.createdAt).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric',
                    })}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Tab 4: Newsletter Preferences */}
      {activeTab === 'newsletter' && (
        <div className="mt-8">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg font-bold font-sans">
                Weekly Gyan Letter Preferences
              </CardTitle>
              <CardDescription>
                Customize which pillar topics you want delivered to your inbox every Sunday.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {prefsSuccess && (
                <div className="mb-4 rounded-xl border border-emerald-300 bg-emerald-50 p-3 text-xs text-emerald-800 dark:border-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300 flex items-center gap-2">
                  <Check className="h-4 w-4 text-emerald-600" />
                  <span>Newsletter preferences updated successfully!</span>
                </div>
              )}

              <form onSubmit={handleSavePreferences} className="space-y-6">
                <div className="space-y-4">
                  {/* Blog Preference */}
                  <label className="flex items-start gap-3 rounded-2xl border border-border p-4 hover:bg-surface-subtle transition-colors cursor-pointer">
                    <input
                      type="checkbox"
                      checked={preferences.blog}
                      onChange={(e) =>
                        setPreferences((prev) => ({ ...prev, blog: e.target.checked }))
                      }
                      className="mt-1 h-4 w-4 rounded border-border text-indigo-600 focus:ring-indigo-500"
                    />
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-sm text-foreground">
                          Architecture & Software Design Blog
                        </span>
                        <Badge variant="blog" size="sm">
                          Blog
                        </Badge>
                      </div>
                      <p className="mt-1 text-xs text-foreground-muted">
                        In-depth architectural post-mortems, edge compute benchmarks, and system scalability.
                      </p>
                    </div>
                  </label>

                  {/* Learning Preference */}
                  <label className="flex items-start gap-3 rounded-2xl border border-border p-4 hover:bg-surface-subtle transition-colors cursor-pointer">
                    <input
                      type="checkbox"
                      checked={preferences.learning}
                      onChange={(e) =>
                        setPreferences((prev) => ({ ...prev, learning: e.target.checked }))
                      }
                      className="mt-1 h-4 w-4 rounded border-border text-emerald-600 focus:ring-emerald-500"
                    />
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-sm text-foreground">
                          Learning Hub & Developer Masterclasses
                        </span>
                        <Badge variant="learning" size="sm">
                          Learning
                        </Badge>
                      </div>
                      <p className="mt-1 text-xs text-foreground-muted">
                        Interactive tutorials, code exercises, React 19 deep dives, and TypeScript guides.
                      </p>
                    </div>
                  </label>

                  {/* Travel Preference */}
                  <label className="flex items-start gap-3 rounded-2xl border border-border p-4 hover:bg-surface-subtle transition-colors cursor-pointer">
                    <input
                      type="checkbox"
                      checked={preferences.travel}
                      onChange={(e) =>
                        setPreferences((prev) => ({ ...prev, travel: e.target.checked }))
                      }
                      className="mt-1 h-4 w-4 rounded border-border text-amber-500 focus:ring-amber-500"
                    />
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-sm text-foreground">
                          Slow Travel & Cultural Expeditions
                        </span>
                        <Badge variant="travel" size="sm">
                          Travel
                        </Badge>
                      </div>
                      <p className="mt-1 text-xs text-foreground-muted">
                        Curated multi-day itineraries, secluded retreats, photography logistics, and culture.
                      </p>
                    </div>
                  </label>
                </div>

                <div className="flex items-center justify-between pt-2">
                  <span className="text-xs text-foreground-muted">
                    Subscribed as: <strong className="text-foreground">{user?.email}</strong>
                  </span>
                  <Button type="submit" size="sm" variant="blog" isLoading={prefsUpdating}>
                    Update Preferences
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}

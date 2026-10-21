import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Compass, MapPin, Calendar, DollarSign, ArrowRight, Sparkles } from 'lucide-react'
import { Badge } from '../components/ui/Badge'
import { Button } from '../components/ui/Button'
import { postService } from '../services/postService'
import type { Post } from '../types'

export const Travel: React.FC = () => {
  const [posts, setPosts] = useState<Post[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadTravelData()
  }, [])

  const loadTravelData = async () => {
    setLoading(true)
    try {
      const response = await postService.getPosts({ pillar: 'travel' })
      setPosts(response.posts)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Travel Pillar Header */}
      <div className="border-b border-border pb-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 rounded-lg bg-amber-500/10 px-3 py-1 text-xs font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400">
              <Compass className="h-4 w-4" />
              <span>Pillar 3 • Global Expeditions</span>
            </div>
            <h1 className="mt-3 text-3xl font-extrabold tracking-tight text-foreground sm:text-4xl lg:text-5xl font-serif">
              Authentic Travel Logs & Routes
            </h1>
            <p className="mt-2 text-base text-foreground-muted max-w-2xl font-sans">
              Slow travel itineraries, remote cultural sanctuaries, and comprehensive logistics tailored for thoughtful explorers.
            </p>
          </div>

          <div className="flex items-center gap-2 text-xs font-medium text-foreground-muted">
            <span className="flex h-2 w-2 rounded-full bg-amber-500" />
            <span>Field-Tested Itineraries</span>
          </div>
        </div>
      </div>

      {/* Visual Destination Cards Gallery */}
      {loading ? (
        <div className="py-24 text-center text-foreground-muted text-sm">Loading travel logs...</div>
      ) : posts.length === 0 ? (
        <div className="py-24 text-center text-foreground-muted">No travel guides found.</div>
      ) : (
        <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-8">
          {posts.map((post) => {
            const meta = post.metadata

            return (
              <div
                key={post.id}
                className="group overflow-hidden rounded-3xl border border-border bg-surface shadow-xs hover:shadow-xl transition-all duration-300 flex flex-col justify-between"
              >
                <div>
                  {/* Photo with Overlay Badges */}
                  <div className="relative h-72 sm:h-80 w-full overflow-hidden">
                    <img
                      src={post.coverImage}
                      alt={post.title}
                      className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-slate-950/20 to-transparent" />

                    {/* Top Floating Badge */}
                    <div className="absolute top-4 left-4">
                      <Badge variant="travel" size="md" dot>
                        {meta?.duration || 'Field Guide'}
                      </Badge>
                    </div>

                    {/* Bottom Metadata Pill Overlay */}
                    <div className="absolute bottom-4 inset-x-4 flex flex-wrap items-center gap-2 text-xs text-white">
                      {meta?.location && (
                        <span className="flex items-center gap-1 rounded-lg bg-black/60 backdrop-blur-md px-2.5 py-1">
                          <MapPin className="h-3.5 w-3.5 text-amber-400" />
                          {meta.location}
                        </span>
                      )}
                      {meta?.bestSeason && (
                        <span className="flex items-center gap-1 rounded-lg bg-black/60 backdrop-blur-md px-2.5 py-1">
                          <Calendar className="h-3.5 w-3.5 text-amber-400" />
                          {meta.bestSeason}
                        </span>
                      )}
                      {meta?.budgetLevel && (
                        <span className="flex items-center gap-1 rounded-lg bg-black/60 backdrop-blur-md px-2.5 py-1">
                          <DollarSign className="h-3.5 w-3.5 text-amber-400" />
                          {meta.budgetLevel}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Body Content */}
                  <div className="p-6 sm:p-8">
                    <h2 className="text-2xl font-bold font-serif text-foreground group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors">
                      <Link to={`/post/${post.slug}`}>{post.title}</Link>
                    </h2>

                    <p className="mt-3 text-sm text-foreground-muted font-sans leading-relaxed">
                      {post.excerpt}
                    </p>

                    {/* Highlights Pills */}
                    {meta?.highlights && meta.highlights.length > 0 && (
                      <div className="mt-6 pt-6 border-t border-border">
                        <p className="text-xs font-bold text-foreground mb-2 flex items-center gap-1.5">
                          <Sparkles className="h-3.5 w-3.5 text-amber-500" />
                          Route Highlights:
                        </p>
                        <div className="flex flex-wrap gap-1.5">
                          {meta.highlights.map((h, i) => (
                            <span
                              key={i}
                              className="rounded-lg bg-surface-subtle px-2.5 py-1 text-xs text-foreground-muted font-medium"
                            >
                              {h}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Footer action */}
                <div className="border-t border-border px-6 py-4 bg-surface-subtle/40 flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <img
                      src={post.author.avatar}
                      alt={post.author.name}
                      className="h-8 w-8 rounded-full object-cover border border-border"
                    />
                    <div className="text-xs">
                      <p className="font-semibold text-foreground">{post.author.name}</p>
                      <p className="text-foreground-muted">{post.author.role}</p>
                    </div>
                  </div>

                  <Link to={`/post/${post.slug}`}>
                    <Button variant="travel" size="sm" rightIcon={<ArrowRight className="h-4 w-4" />}>
                      View Route & Guide
                    </Button>
                  </Link>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

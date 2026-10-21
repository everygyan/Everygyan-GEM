import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { BookOpen, CheckCircle, Circle, Clock, Award, ArrowRight, Layers, Sparkles } from 'lucide-react'
import { Button } from '../components/ui/Button'
import { postService } from '../services/postService'
import type { Post, DifficultyLevel } from '../types'

const COMPLETED_LESSONS_KEY = 'everygyan_completed_lessons'

export const Learning: React.FC = () => {
  const [posts, setPosts] = useState<Post[]>([])
  const [loading, setLoading] = useState(true)
  const [difficultyFilter, setDifficultyFilter] = useState<'All' | DifficultyLevel>('All')
  const [completedIds, setCompletedIds] = useState<string[]>(() => {
    try {
      const stored = localStorage.getItem(COMPLETED_LESSONS_KEY)
      return stored ? JSON.parse(stored) : []
    } catch {
      return []
    }
  })

  useEffect(() => {
    loadLearningData()
  }, [difficultyFilter])

  const loadLearningData = async () => {
    setLoading(true)
    try {
      const response = await postService.getPosts({
        pillar: 'learning',
        difficulty: difficultyFilter === 'All' ? undefined : difficultyFilter,
      })
      setPosts(response.posts)
    } finally {
      setLoading(false)
    }
  }

  const toggleLessonComplete = (postId: string) => {
    const updated = completedIds.includes(postId)
      ? completedIds.filter((id) => id !== postId)
      : [...completedIds, postId]
    setCompletedIds(updated)
    try {
      localStorage.setItem(COMPLETED_LESSONS_KEY, JSON.stringify(updated))
    } catch {
      // ignore storage error
    }
  }

  const totalLessons = posts.length
  const completedCount = posts.filter((p) => completedIds.includes(p.id)).length
  const progressPercent = totalLessons > 0 ? Math.round((completedCount / totalLessons) * 100) : 0

  const getDifficultyBadge = (difficulty?: DifficultyLevel) => {
    switch (difficulty) {
      case 'Beginner':
        return <span className="rounded-md bg-teal-50 px-2.5 py-1 text-xs font-bold text-teal-700 dark:bg-teal-950/60 dark:text-teal-300">Beginner</span>
      case 'Intermediate':
        return <span className="rounded-md bg-emerald-50 px-2.5 py-1 text-xs font-bold text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300">Intermediate</span>
      case 'Advanced':
        return <span className="rounded-md bg-indigo-50 px-2.5 py-1 text-xs font-bold text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300">Advanced</span>
      default:
        return null
    }
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Learning Pillar Header */}
      <div className="border-b border-border pb-8">
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-2 rounded-lg bg-emerald-500/10 px-3 py-1 text-xs font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
              <BookOpen className="h-4 w-4" />
              <span>Pillar 2 • Guided Curriculum</span>
            </div>
            <h1 className="mt-3 text-3xl font-extrabold tracking-tight text-foreground sm:text-4xl lg:text-5xl font-serif">
              The Learning Hub & Code Tracks
            </h1>
            <p className="mt-2 text-base text-foreground-muted max-w-2xl font-sans">
              Practical, modular lessons engineered to elevate your engineering craftsmanship. Step-by-step masterclasses with verifiable code exercises.
            </p>
          </div>

          {/* Progress Tracker Card */}
          <div className="rounded-2xl border border-emerald-200/80 bg-emerald-50/50 p-5 dark:border-emerald-900/60 dark:bg-emerald-950/30 w-full lg:w-80 shadow-2xs">
            <div className="flex items-center justify-between text-xs font-bold text-emerald-800 dark:text-emerald-300">
              <span className="flex items-center gap-1.5">
                <Award className="h-4 w-4" />
                Track Completion
              </span>
              <span>{progressPercent}% Done</span>
            </div>
            <div className="mt-3 h-2 w-full overflow-hidden rounded-full bg-emerald-200/60 dark:bg-emerald-900/60">
              <div
                className="h-full rounded-full bg-emerald-600 transition-all duration-500"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
            <p className="mt-2 text-[11px] text-emerald-700 dark:text-emerald-400">
              {completedCount} of {totalLessons} curriculum lessons mastered
            </p>
          </div>
        </div>

        {/* Difficulty Filter Tabs */}
        <div className="mt-8 flex items-center gap-2 overflow-x-auto pb-1">
          <span className="text-xs font-semibold text-foreground-muted mr-1">Difficulty:</span>
          {(['All', 'Beginner', 'Intermediate', 'Advanced'] as const).map((level) => (
            <button
              key={level}
              onClick={() => setDifficultyFilter(level)}
              className={`rounded-xl px-3.5 py-1.5 text-xs font-semibold transition-all cursor-pointer whitespace-nowrap ${
                difficultyFilter === level
                  ? 'bg-emerald-600 text-white shadow-2xs'
                  : 'bg-surface border border-border text-foreground-muted hover:text-foreground hover:bg-surface-subtle'
              }`}
            >
              {level}
            </button>
          ))}
        </div>
      </div>

      {/* Curriculum Module Cards Grid */}
      {loading ? (
        <div className="py-24 text-center text-foreground-muted text-sm">Loading learning curriculum...</div>
      ) : posts.length === 0 ? (
        <div className="py-24 text-center text-foreground-muted">
          No lessons found matching this level.
        </div>
      ) : (
        <div className="mt-8 space-y-6">
          {posts.map((post) => {
            const isCompleted = completedIds.includes(post.id)
            const meta = post.metadata

            return (
              <div
                key={post.id}
                className={`group relative overflow-hidden rounded-2xl border transition-all ${
                  isCompleted
                    ? 'border-emerald-300 bg-emerald-50/20 dark:border-emerald-900/60 dark:bg-emerald-950/10'
                    : 'border-border bg-surface hover:shadow-md'
                }`}
              >
                <div className="p-6 sm:p-8">
                  <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-6">
                    <div className="flex-1 space-y-3">
                      {/* Top Badges */}
                      <div className="flex flex-wrap items-center gap-2.5">
                        <span className="flex items-center gap-1 text-xs font-bold font-mono text-emerald-600 dark:text-emerald-400">
                          <Layers className="h-3.5 w-3.5" />
                          Module {meta?.moduleNumber ?? 1} of {meta?.totalModules ?? 5}
                        </span>
                        {getDifficultyBadge(meta?.difficulty)}
                        <span className="flex items-center gap-1 text-xs text-foreground-muted">
                          <Clock className="h-3.5 w-3.5" />
                          {meta?.estimatedHours || post.readTime}
                        </span>
                      </div>

                      {/* Title */}
                      <h2 className="text-xl sm:text-2xl font-bold font-serif text-foreground group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                        <Link to={`/post/${post.slug}`}>{post.title}</Link>
                      </h2>

                      {/* Excerpt */}
                      <p className="text-sm text-foreground-muted font-sans leading-relaxed">
                        {post.excerpt}
                      </p>

                      {/* Prerequisites & Takeaways */}
                      {meta?.takeaways && meta.takeaways.length > 0 && (
                        <div className="mt-4 pt-4 border-t border-border/60">
                          <p className="text-xs font-bold text-foreground mb-1.5">Key Outcomes:</p>
                          <ul className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 text-xs text-foreground-muted">
                            {meta.takeaways.map((outcome, idx) => (
                              <li key={idx} className="flex items-start gap-1.5">
                                <Sparkles className="h-3 w-3 text-emerald-500 shrink-0 mt-0.5" />
                                <span>{outcome}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>

                    {/* Right Action Column */}
                    <div className="flex lg:flex-col items-center justify-between lg:justify-center gap-4 shrink-0 pt-4 lg:pt-0 border-t lg:border-t-0 border-border">
                      <button
                        onClick={() => toggleLessonComplete(post.id)}
                        className={`flex items-center gap-2 rounded-xl px-3.5 py-2 text-xs font-semibold transition-all cursor-pointer border ${
                          isCompleted
                            ? 'border-emerald-500 bg-emerald-600 text-white shadow-2xs'
                            : 'border-border bg-surface text-foreground-muted hover:text-foreground hover:bg-surface-subtle'
                        }`}
                        title={isCompleted ? 'Mark as incomplete' : 'Mark as completed'}
                      >
                        {isCompleted ? (
                          <>
                            <CheckCircle className="h-4 w-4" />
                            <span>Completed</span>
                          </>
                        ) : (
                          <>
                            <Circle className="h-4 w-4" />
                            <span>Mark Complete</span>
                          </>
                        )}
                      </button>

                      <Link to={`/post/${post.slug}`}>
                        <Button variant="learning" size="sm" rightIcon={<ArrowRight className="h-4 w-4" />}>
                          Start Lesson
                        </Button>
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

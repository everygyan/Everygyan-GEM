import React from 'react'
import { Link } from 'react-router-dom'
import { BookOpen, Compass, FileText, ArrowRight } from 'lucide-react'

export const Home: React.FC = () => {
  const pillars = [
    {
      title: 'Blog',
      description: 'Insightful thoughts, deep dives, modern engineering, and tech perspectives.',
      link: '/blog',
      icon: FileText,
      color: 'bg-blue-500',
    },
    {
      title: 'Learning',
      description: 'Structured tutorials, guides, and practical skills for modern developers.',
      link: '/learning',
      icon: BookOpen,
      color: 'bg-emerald-500',
    },
    {
      title: 'Travel',
      description: 'Curated itineraries, travel tales, culture, and destinations across the globe.',
      link: '/travel',
      icon: Compass,
      color: 'bg-amber-500',
    },
  ]

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <div className="text-center">
        <h1 className="text-4xl font-extrabold tracking-tight text-slate-900 sm:text-5xl md:text-6xl dark:text-white">
          Welcome to <span className="text-indigo-600 dark:text-indigo-400">EveryGyan</span>
        </h1>
        <p className="mx-auto mt-4 max-w-2xl text-lg text-slate-600 dark:text-slate-300">
          A high-performance portal uniting Blog insights, Learning roadmaps, and Travel experiences.
        </p>
      </div>

      <div className="mt-12 grid grid-cols-1 gap-8 md:grid-cols-3">
        {pillars.map((pillar) => {
          const Icon = pillar.icon
          return (
            <div
              key={pillar.title}
              className="flex flex-col justify-between rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition-all hover:shadow-md dark:border-slate-800 dark:bg-slate-900"
            >
              <div>
                <div className={`inline-flex rounded-xl p-3 text-white ${pillar.color}`}>
                  <Icon className="h-6 w-6" />
                </div>
                <h3 className="mt-4 text-xl font-bold text-slate-900 dark:text-white">
                  {pillar.title}
                </h3>
                <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
                  {pillar.description}
                </p>
              </div>
              <div className="mt-6">
                <Link
                  to={pillar.link}
                  className="inline-flex items-center gap-1.5 text-sm font-semibold text-indigo-600 hover:text-indigo-500 dark:text-indigo-400"
                >
                  Explore {pillar.title}
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

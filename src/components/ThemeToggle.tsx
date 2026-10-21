import React from 'react'
import { Sun, Moon, Laptop } from 'lucide-react'
import { useTheme } from '../context/ThemeContext'

interface ThemeToggleProps {
  className?: string
  showLabel?: boolean
}

export const ThemeToggle: React.FC<ThemeToggleProps> = ({ className, showLabel = false }) => {
  const { theme, resolvedTheme, setTheme } = useTheme()

  const cycleTheme = () => {
    if (theme === 'light') setTheme('dark')
    else if (theme === 'dark') setTheme('system')
    else setTheme('light')
  }

  return (
    <button
      onClick={cycleTheme}
      className={`inline-flex items-center justify-center rounded-xl p-2 text-foreground-muted hover:bg-surface-subtle hover:text-foreground transition-colors cursor-pointer border border-border/50 bg-surface/50 shadow-2xs ${className || ''}`}
      title={`Current: ${theme} mode (Click to change)`}
      aria-label="Toggle theme"
    >
      {theme === 'system' ? (
        <Laptop className="h-4 w-4" />
      ) : resolvedTheme === 'dark' ? (
        <Moon className="h-4 w-4 text-indigo-400" />
      ) : (
        <Sun className="h-4 w-4 text-amber-500" />
      )}
      {showLabel && (
        <span className="ml-2 text-xs font-medium capitalize">
          {theme} ({resolvedTheme})
        </span>
      )}
    </button>
  )
}

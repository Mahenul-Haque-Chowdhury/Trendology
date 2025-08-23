"use client"
import { useEffect, useState, useCallback } from 'react'
import { Moon, Sun } from 'lucide-react'

const STORAGE_KEY = 'trendology.theme'

export function ThemeToggle({ className = '' }: { className?: string }) {
  const [mode, setMode] = useState<'light' | 'dark' | 'system'>('light')
  const [mounted, setMounted] = useState(false)

  // Initialize
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY) as 'light' | 'dark' | 'system' | null
      if (saved) setMode(saved)
      setMounted(true)
    } catch { setMounted(true) }
  }, [])

  // Apply theme
  useEffect(() => {
    if (!mounted) return
    const root = document.documentElement
    const desired = mode === 'system'
      ? (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light')
      : mode
    // Apply dark mode class to both <html> and <body>
    const isDark = desired === 'dark'
    root.classList.toggle('dark', isDark)
    document.body.classList.toggle('dark', isDark)
    try { localStorage.setItem(STORAGE_KEY, mode) } catch {}
  }, [mode, mounted])

  // React to system changes when in system mode
  useEffect(() => {
    if (mode !== 'system') return
    const mql = window.matchMedia('(prefers-color-scheme: dark)')
    const handler = () => {
      const root = document.documentElement
      root.classList.toggle('dark', mql.matches)
      document.body.classList.toggle('dark', mql.matches)
    }
    mql.addEventListener('change', handler)
    return () => mql.removeEventListener('change', handler)
  }, [mode])

  const cycle = useCallback(() => {
    setMode((prev) => prev === 'light' ? 'dark' : prev === 'dark' ? 'system' : 'light')
  }, [])

  const label = mode === 'light' ? 'Switch to dark mode' : mode === 'dark' ? 'Use system theme' : 'Switch to light mode'
  const icon = mode === 'light' ? <Moon size={18} /> : mode === 'dark' ? <Sun size={18} /> : <Sun size={18} />

  return (
    <button type="button" onClick={cycle} aria-label={label} title={label} className={`btn-icon relative ${className}`}>
      {icon}
      <span className="sr-only">{label}</span>
      {mode === 'system' && (
        <span className="absolute -bottom-1 -right-1 text-[9px] px-1 py-0.5 rounded bg-brand text-white leading-none">A</span>
      )}
    </button>
  )
}

export default ThemeToggle

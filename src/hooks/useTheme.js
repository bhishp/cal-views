import { useState, useEffect } from 'react'

const THEME_KEY = 'cal_views_theme'

// Possible values: 'dark', 'light', 'system'
function getInitialPreference() {
  const stored = localStorage.getItem(THEME_KEY)
  if (stored === 'dark' || stored === 'light' || stored === 'system') return stored
  return 'system'
}

function getSystemTheme() {
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
}

function applyTheme(resolved) {
  document.documentElement.classList.toggle('dark', resolved === 'dark')
}

export function useTheme() {
  const [preference, setPreference] = useState(getInitialPreference)

  const resolved = preference === 'system' ? getSystemTheme() : preference

  // Apply on mount and when preference changes
  useEffect(() => {
    applyTheme(resolved)
  }, [resolved])

  // Listen for system theme changes when in 'system' mode
  useEffect(() => {
    if (preference !== 'system') return
    const mq = window.matchMedia('(prefers-color-scheme: dark)')
    const handler = () => applyTheme(getSystemTheme())
    mq.addEventListener('change', handler)
    return () => mq.removeEventListener('change', handler)
  }, [preference])

  const setTheme = (value) => {
    setPreference(value)
    localStorage.setItem(THEME_KEY, value)
  }

  return { preference, resolved, setTheme }
}

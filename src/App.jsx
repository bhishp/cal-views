import { useState, useEffect } from 'react'
import { useGoogleAuth } from './hooks/useGoogleAuth'
import { useTheme } from './hooks/useTheme'
import WeekendStrip from './components/WeekendStrip'
import LoginScreen from './components/LoginScreen'
import ThemeToggle from './components/ThemeToggle'

function useOnlineStatus() {
  const [online, setOnline] = useState(navigator.onLine)
  useEffect(() => {
    const goOnline = () => setOnline(true)
    const goOffline = () => setOnline(false)
    window.addEventListener('online', goOnline)
    window.addEventListener('offline', goOffline)
    return () => {
      window.removeEventListener('online', goOnline)
      window.removeEventListener('offline', goOffline)
    }
  }, [])
  return online
}

function App() {
  const { isSignedIn, isInitializing, signIn, signOut, accessToken } = useGoogleAuth()
  const { preference, setTheme } = useTheme()
  const online = useOnlineStatus()

  if (isInitializing) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="flex items-center gap-3 text-gray-400 dark:text-gray-500">
          <svg className="w-6 h-6 animate-spin" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
          <span className="text-sm">Signing in…</span>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 font-sans transition-colors">
      {isSignedIn ? (
        <>
          <header className="flex items-center justify-between px-6 py-3 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 shadow-sm">
            <div className="flex items-center gap-3">
              <svg className="w-6 h-6 text-blue-600 dark:text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <span className="text-lg font-medium text-gray-800 dark:text-gray-100">cal views</span>
              {!online && (
                <span className="text-xs px-2 py-0.5 rounded-full bg-amber-100 text-amber-700 dark:bg-amber-900 dark:text-amber-300">
                  offline
                </span>
              )}
            </div>
            <div className="flex items-center gap-4">
              <ThemeToggle preference={preference} setTheme={setTheme} />
              <button
                onClick={signOut}
                className="text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 transition-colors"
              >
                Sign out
              </button>
            </div>
          </header>
          <WeekendStrip accessToken={accessToken} />
        </>
      ) : (
        <LoginScreen onSignIn={signIn} />
      )}
    </div>
  )
}

export default App

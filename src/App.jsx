import { useState, useEffect } from 'react'
import { useGoogleAuth } from './hooks/useGoogleAuth'
import WeekendStrip from './components/WeekendStrip'
import LoginScreen from './components/LoginScreen'

function App() {
  const { isSignedIn, signIn, signOut, accessToken } = useGoogleAuth()

  return (
    <div className="min-h-screen bg-gray-50 font-sans">
      {isSignedIn ? (
        <>
          <header className="flex items-center justify-between px-6 py-3 bg-white border-b border-gray-200 shadow-sm">
            <div className="flex items-center gap-3">
              <svg className="w-6 h-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <span className="text-lg font-medium text-gray-800">cal views</span>
            </div>
            <button
              onClick={signOut}
              className="text-sm text-gray-500 hover:text-gray-700 transition-colors"
            >
              Sign out
            </button>
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

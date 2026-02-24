import { useState, useEffect, useCallback } from 'react'

const CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID
const SCOPES = 'https://www.googleapis.com/auth/calendar'

// Google Identity Services token client (no backend needed)
let tokenClient = null

export function useGoogleAuth() {
  const [isSignedIn, setIsSignedIn] = useState(false)
  const [accessToken, setAccessToken] = useState(null)

  // Load the GIS script once
  useEffect(() => {
    const script = document.createElement('script')
    script.src = 'https://accounts.google.com/gsi/client'
    script.async = true
    script.defer = true
    document.head.appendChild(script)

    return () => {
      document.head.removeChild(script)
    }
  }, [])

  const signIn = useCallback(() => {
    if (!window.google) {
      console.error('Google Identity Services not loaded yet')
      return
    }

    tokenClient = window.google.accounts.oauth2.initTokenClient({
      client_id: CLIENT_ID,
      scope: SCOPES,
      callback: (response) => {
        if (response.error) {
          console.error('Auth error:', response.error)
          return
        }
        setAccessToken(response.access_token)
        setIsSignedIn(true)
      },
    })

    tokenClient.requestAccessToken()
  }, [])

  const signOut = useCallback(() => {
    if (accessToken) {
      window.google?.accounts.oauth2.revoke(accessToken, () => {})
    }
    setAccessToken(null)
    setIsSignedIn(false)
  }, [accessToken])

  return { isSignedIn, signIn, signOut, accessToken }
}

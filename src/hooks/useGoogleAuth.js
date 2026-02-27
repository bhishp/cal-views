import { useState, useEffect, useCallback } from 'react'

const CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID
const SCOPES = 'https://www.googleapis.com/auth/calendar'
const TOKEN_KEY = 'cal_views_token'
const EXPIRY_KEY = 'cal_views_token_expiry'

// Google Identity Services token client (no backend needed)
let tokenClient = null

function saveToken(token, expiresIn) {
  localStorage.setItem(TOKEN_KEY, token)
  localStorage.setItem(EXPIRY_KEY, String(Date.now() + expiresIn * 1000))
}

function loadToken() {
  const token = localStorage.getItem(TOKEN_KEY)
  const expiry = localStorage.getItem(EXPIRY_KEY)
  if (token && expiry && Date.now() < Number(expiry)) {
    return token
  }
  localStorage.removeItem(TOKEN_KEY)
  localStorage.removeItem(EXPIRY_KEY)
  return null
}

function clearToken() {
  localStorage.removeItem(TOKEN_KEY)
  localStorage.removeItem(EXPIRY_KEY)
}

export function useGoogleAuth() {
  const cached = loadToken()
  const [isSignedIn, setIsSignedIn] = useState(!!cached)
  const [accessToken, setAccessToken] = useState(cached)
  // True while we're loading GIS + attempting silent refresh (only when no cached token)
  const [isInitializing, setIsInitializing] = useState(!cached)

  const handleTokenResponse = useCallback((response) => {
    if (response.error) {
      console.error('Auth error:', response.error)
      setIsInitializing(false)
      return
    }
    saveToken(response.access_token, response.expires_in)
    setAccessToken(response.access_token)
    setIsSignedIn(true)
    setIsInitializing(false)
  }, [])

  // Load the GIS script and attempt silent token refresh
  useEffect(() => {
    // Already have a valid token, nothing to do
    if (loadToken()) {
      setIsInitializing(false)
      return
    }

    const script = document.createElement('script')
    script.src = 'https://accounts.google.com/gsi/client'
    script.async = true
    script.defer = true
    script.onload = () => {
      // Try to silently get a token (works if user previously granted consent)
      try {
        const client = window.google.accounts.oauth2.initTokenClient({
          client_id: CLIENT_ID,
          scope: SCOPES,
          prompt: '',
          callback: handleTokenResponse,
          error_callback: () => {
            // Silent refresh failed (e.g. popup blocked, ITP, no prior consent)
            setIsInitializing(false)
          },
        })
        client.requestAccessToken({ prompt: '' })
      } catch {
        setIsInitializing(false)
      }
    }
    script.onerror = () => {
      setIsInitializing(false)
    }
    document.head.appendChild(script)

    return () => {
      document.head.removeChild(script)
    }
  }, [handleTokenResponse])

  const signIn = useCallback(() => {
    if (!window.google) {
      console.error('Google Identity Services not loaded yet')
      return
    }

    tokenClient = window.google.accounts.oauth2.initTokenClient({
      client_id: CLIENT_ID,
      scope: SCOPES,
      callback: handleTokenResponse,
    })

    tokenClient.requestAccessToken()
  }, [handleTokenResponse])

  const signOut = useCallback(() => {
    if (accessToken) {
      window.google?.accounts.oauth2.revoke(accessToken, () => {})
    }
    clearToken()
    setAccessToken(null)
    setIsSignedIn(false)
  }, [accessToken])

  return { isSignedIn, isInitializing, signIn, signOut, accessToken }
}

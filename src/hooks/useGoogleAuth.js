import { useState, useEffect, useCallback } from 'react'

const CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID
const SCOPES = 'https://www.googleapis.com/auth/calendar'
const TOKEN_KEY = 'cal_views_token'
const EXPIRY_KEY = 'cal_views_token_expiry'

// Google Identity Services token client (no backend needed)
let tokenClient = null

function saveToken(token, expiresIn) {
  sessionStorage.setItem(TOKEN_KEY, token)
  sessionStorage.setItem(EXPIRY_KEY, String(Date.now() + expiresIn * 1000))
}

function loadToken() {
  const token = sessionStorage.getItem(TOKEN_KEY)
  const expiry = sessionStorage.getItem(EXPIRY_KEY)
  if (token && expiry && Date.now() < Number(expiry)) {
    return token
  }
  sessionStorage.removeItem(TOKEN_KEY)
  sessionStorage.removeItem(EXPIRY_KEY)
  return null
}

function clearToken() {
  sessionStorage.removeItem(TOKEN_KEY)
  sessionStorage.removeItem(EXPIRY_KEY)
}

export function useGoogleAuth() {
  const cached = loadToken()
  const [isSignedIn, setIsSignedIn] = useState(!!cached)
  const [accessToken, setAccessToken] = useState(cached)

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
        saveToken(response.access_token, response.expires_in)
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
    clearToken()
    setAccessToken(null)
    setIsSignedIn(false)
  }, [accessToken])

  return { isSignedIn, signIn, signOut, accessToken }
}

const CACHE_NAME = 'cal-views-v1'
const API_CACHE_NAME = 'cal-views-api-v1'

self.addEventListener('install', () => {
  self.skipWaiting()
})

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys
          .filter((key) => key !== CACHE_NAME && key !== API_CACHE_NAME)
          .map((key) => caches.delete(key))
      )
    )
  )
  self.clients.claim()
})

self.addEventListener('fetch', (event) => {
  const { request } = event
  const url = new URL(request.url)

  // Skip non-GET requests
  if (request.method !== 'GET') return

  // Google Calendar API: network-first, cache fallback for offline
  if (
    url.hostname === 'www.googleapis.com' &&
    url.pathname.includes('/calendar/')
  ) {
    event.respondWith(networkFirst(request, API_CACHE_NAME))
    return
  }

  // Skip other third-party requests (Google Identity Services, etc.)
  if (url.origin !== self.location.origin) return

  // Hashed static assets (Vite output): cache-first (immutable content hashes)
  if (url.pathname.startsWith('/assets/')) {
    event.respondWith(cacheFirst(request))
    return
  }

  // Navigation & other same-origin: network-first
  event.respondWith(networkFirst(request, CACHE_NAME))
})

async function networkFirst(request, cacheName) {
  try {
    const response = await fetch(request)
    if (response.ok) {
      const cache = await caches.open(cacheName)
      cache.put(request, response.clone())
    }
    return response
  } catch {
    const cached = await caches.match(request)
    if (cached) return cached
    // For navigation requests, serve cached index.html (SPA fallback)
    if (request.mode === 'navigate') {
      const fallback = await caches.match('/')
      if (fallback) return fallback
    }
    return new Response('Offline', { status: 503, statusText: 'Offline' })
  }
}

async function cacheFirst(request) {
  const cached = await caches.match(request)
  if (cached) return cached

  try {
    const response = await fetch(request)
    if (response.ok) {
      const cache = await caches.open(CACHE_NAME)
      cache.put(request, response.clone())
    }
    return response
  } catch {
    return new Response('Offline', { status: 503, statusText: 'Offline' })
  }
}

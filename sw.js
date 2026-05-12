/**
 * Kreathur CRM service worker.
 * Minimal: caches static assets, network-first for everything else.
 * NO offline-mode for the CRM itself (auth + real-time data wouldn't work offline anyway).
 * The point of the SW is to be PWA-installable on phone.
 */
const CACHE = 'kreathur-crm-v1'
const STATIC_ASSETS = [
  '/manifest.json',
  '/icon-192.svg',
]

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE).then((c) => c.addAll(STATIC_ASSETS)).catch(() => {})
  )
  self.skipWaiting()
})

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k)))
    )
  )
  self.clients.claim()
})

self.addEventListener('fetch', (event) => {
  const req = event.request
  if (req.method !== 'GET') return

  // Network-first for everything (CRM needs live data)
  event.respondWith(
    fetch(req)
      .then((res) => {
        // Only cache static assets, not API or HTML
        if (STATIC_ASSETS.some((path) => req.url.endsWith(path))) {
          const clone = res.clone()
          caches.open(CACHE).then((c) => c.put(req, clone)).catch(() => {})
        }
        return res
      })
      .catch(() => caches.match(req))
  )
})

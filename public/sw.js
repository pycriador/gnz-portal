const CACHE_NAME = 'gnz-horti-shell-v1'

const PRECACHE_REL_PATHS = [
  './',
  './index.html',
  './manifest.webmanifest',
  './icons/apple-touch-icon-180.png',
  './icons/icon-192.png',
  './icons/icon-512.png',
  './icons/icon-maskable-512.png',
]

function isSupabaseOrApiRequest(url) {
  const host = url.hostname.toLowerCase()
  const path = url.pathname.toLowerCase()

  if (host.includes('supabase.co') || host.includes('supabase.in')) {
    return true
  }

  if (
    path.includes('/rest/v1/') ||
    path.includes('/rpc/') ||
    path.includes('/realtime/') ||
    path.includes('/auth/v1/') ||
    path.includes('/storage/v1/')
  ) {
    return true
  }

  return false
}

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches
      .open(CACHE_NAME)
      .then((cache) => {
        const base = self.location.href.replace(/\/sw\.js(\?.*)?$/, '/')
        const urls = PRECACHE_REL_PATHS.map((rel) => new URL(rel, base).href)
        return Promise.allSettled(
          urls.map((u) =>
            fetch(u, { cache: 'reload' }).then((res) => {
              if (res.ok) {
                return cache.put(u, res)
              }
            })
          )
        )
      })
      .then(() => self.skipWaiting())
  )
})

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(
          keys.map((key) => {
            if (key !== CACHE_NAME) {
              return caches.delete(key)
            }
          })
        )
      )
      .then(() => self.clients.claim())
  )
})

self.addEventListener('fetch', (event) => {
  const { request } = event

  if (request.method !== 'GET') return

  let url
  try {
    url = new URL(request.url)
  } catch {
    return
  }

  if (url.protocol !== 'http:' && url.protocol !== 'https:') return

  // REGRA CRÍTICA: Jamais cachear chamadas do Supabase (preços, estoque e status de pedido)
  if (isSupabaseOrApiRequest(url)) {
    return
  }

  if (url.origin !== self.location.origin) {
    return
  }

  // Navegação HTML: Network-first com fallback para o App Shell em cache
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request)
        .then((response) => {
          if (response && response.ok) {
            const copy = response.clone()
            caches.open(CACHE_NAME).then((cache) => cache.put(request, copy))
          }
          return response
        })
        .catch(async () => {
          const cache = await caches.open(CACHE_NAME)
          const base = self.location.href.replace(/\/sw\.js(\?.*)?$/, '/')
          return (
            (await cache.match(request)) ||
            (await cache.match(new URL('./index.html', base).href)) ||
            (await cache.match(new URL('./', base).href)) ||
            Response.error()
          )
        })
    )
    return
  }

  // Ativos estáticos: Stale-While-Revalidate
  const isStaticAsset =
    url.pathname.includes('/assets/') ||
    url.pathname.includes('/icons/') ||
    url.pathname.endsWith('.webmanifest') ||
    url.pathname.endsWith('.png') ||
    url.pathname.endsWith('.svg') ||
    url.pathname.endsWith('.css') ||
    url.pathname.endsWith('.js')

  if (isStaticAsset) {
    event.respondWith(
      caches.open(CACHE_NAME).then(async (cache) => {
        const cached = await cache.match(request)
        const networkPromise = fetch(request)
          .then((response) => {
            if (response && response.ok) {
              cache.put(request, response.clone())
            }
            return response
          })
          .catch(() => cached)

        return cached || networkPromise
      })
    )
  }
})

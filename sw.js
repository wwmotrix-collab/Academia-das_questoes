// ═══════════════════════════════════════════════════════
// Academia das Questões V3.7 — Service Worker
// ═══════════════════════════════════════════════════════

const CACHE_NAME = 'academia-v37-cache-v1';

const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/evolution/index.html',
  '/styles/main.css',
  '/styles/animations.css',
  '/styles/evolution.css',
  '/styles/mimo-evolution.css',   // V3.7 — replaces mimo.css
  '/scripts/data.js',
  '/scripts/db.js',
  '/scripts/auth.js',
  '/scripts/gamification.js',
  '/scripts/ui.js',
  '/scripts/evolution_data.js',
  '/scripts/evolution_db.js',
  '/scripts/evolution_widget.js',
  '/scripts/mimo-evolution.js',   // V3.7 — replaces mimo.js
  '/scripts/app.js',
  '/manifest.json',
  '/assets/mascots/mimo-base.webp',
  '/assets/mascots/mimo-mammal.webp',
  '/assets/mascots/mimo-reptile.webp',
  '/assets/mascots/mimo-bird.webp',
];

// Install — pre-cache all static assets
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(STATIC_ASSETS))
      .then(() => self.skipWaiting())
      .catch(err => {
        console.warn('[SW] Pre-cache partial failure (non-fatal):', err);
        return self.skipWaiting();
      })
  );
});

// Activate — delete old caches
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys()
      .then(keys => Promise.all(
        keys
          .filter(k => k !== CACHE_NAME)
          .map(k => caches.delete(k))
      ))
      .then(() => self.clients.claim())
  );
});

// Fetch strategy
self.addEventListener('fetch', event => {
  const url = new URL(event.request.url);

  // Supabase API — network first, silent fallback
  if (url.hostname.includes('supabase.co')) {
    event.respondWith(
      fetch(event.request).catch(() =>
        new Response(JSON.stringify({ error: 'offline' }), {
          status: 503,
          headers: { 'Content-Type': 'application/json' },
        })
      )
    );
    return;
  }

  // Google Fonts — cache first
  if (
    url.hostname.includes('fonts.googleapis.com') ||
    url.hostname.includes('fonts.gstatic.com')
  ) {
    event.respondWith(
      caches.match(event.request).then(cached => {
        if (cached) return cached;
        return fetch(event.request).then(res => {
          const clone = res.clone();
          caches.open(CACHE_NAME).then(c => c.put(event.request, clone));
          return res;
        });
      })
    );
    return;
  }

  // Mimo WebP assets — cache first (high priority)
  if (url.pathname.includes('/assets/mascots/')) {
    event.respondWith(
      caches.match(event.request).then(cached => {
        if (cached) return cached;
        return fetch(event.request).then(res => {
          if (res.ok) {
            const clone = res.clone();
            caches.open(CACHE_NAME).then(c => c.put(event.request, clone));
          }
          return res;
        }).catch(() => {
          // Return empty transparent PNG as ultimate fallback
          return new Response('', { status: 404 });
        });
      })
    );
    return;
  }

  // All other static — cache first, network fallback
  event.respondWith(
    caches.match(event.request).then(cached => {
      if (cached) return cached;
      return fetch(event.request).then(res => {
        if (!res || res.status !== 200 || res.type !== 'basic') return res;
        const clone = res.clone();
        caches.open(CACHE_NAME).then(c => c.put(event.request, clone));
        return res;
      }).catch(() => {
        // Offline: try to return index for navigation requests
        if (event.request.mode === 'navigate') {
          return caches.match('/index.html');
        }
      });
    })
  );
});

// Background sync
self.addEventListener('sync', event => {
  if (event.tag === 'sync-results') {
    event.waitUntil(
      self.clients.matchAll().then(clients =>
        clients.forEach(c => c.postMessage({ type: 'SYNC_RESULTS' }))
      )
    );
  }
});

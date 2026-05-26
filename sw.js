// ═══════════════════════════════════════════════════════
// Academia das Questões V3.7.1 — Service Worker
// ═══════════════════════════════════════════════════════

const CACHE_NAME = 'academia-v371-cache-v1';

const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/evolution/index.html',
  '/styles/main.css',
  '/styles/animations.css',
  '/styles/evolution.css',
  '/styles/mimo-evolution.css',
  '/scripts/data.js',
  '/scripts/db.js',
  '/scripts/auth.js',
  '/scripts/gamification.js',
  '/scripts/ui.js',
  '/scripts/evolution_data.js',
  '/scripts/evolution_db.js',
  '/scripts/evolution_widget.js',
  '/scripts/mimo-evolution.js',
  '/scripts/app.js',
  '/manifest.json',
  '/assets/mascots/mimo-base.webp',
  '/assets/mascots/mimo-mammal.webp',
  '/assets/mascots/mimo-reptile.webp',
  '/assets/mascots/mimo-bird.webp',
];

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

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys()
      .then(keys => Promise.all(
        keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k))
      ))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', event => {
  const url = new URL(event.request.url);

  // Supabase — network first, silent offline fallback
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

  // Fonts — cache first
  if (url.hostname.includes('fonts.googleapis.com') ||
      url.hostname.includes('fonts.gstatic.com')) {
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

  // Mascot images — cache first (high priority offline)
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
        }).catch(() => new Response('', { status: 404 }));
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
        if (event.request.mode === 'navigate') {
          return caches.match('/index.html');
        }
      });
    })
  );
});

self.addEventListener('sync', event => {
  if (event.tag === 'sync-results') {
    event.waitUntil(
      self.clients.matchAll().then(clients =>
        clients.forEach(c => c.postMessage({ type: 'SYNC_RESULTS' }))
      )
    );
  }
});

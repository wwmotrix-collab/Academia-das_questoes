// ═══════════════════════════════════════════════════════
// Academia das Questões V3 — Service Worker
// ═══════════════════════════════════════════════════════

const CACHE_NAME = 'academia-v3-cache-v1';
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/evolution/index.html',
  '/styles/main.css',
  '/styles/animations.css',
  '/styles/evolution.css',
  '/scripts/data.js',
  '/scripts/db.js',
  '/scripts/auth.js',
  '/scripts/gamification.js',
  '/scripts/ui.js',
  '/scripts/evolution_data.js',
  '/scripts/evolution_db.js',
  '/scripts/evolution_widget.js',
  '/scripts/app.js',
  '/manifest.json',
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(STATIC_ASSETS))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)))
    ).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', event => {
  const url = new URL(event.request.url);

  // Supabase — network first
  if (url.hostname.includes('supabase.co')) {
    event.respondWith(
      fetch(event.request).catch(() =>
        new Response(JSON.stringify({ error: 'offline' }), {
          headers: { 'Content-Type': 'application/json' },
        })
      )
    );
    return;
  }

  // Google Fonts — cache first
  if (url.hostname.includes('fonts.googleapis.com') || url.hostname.includes('fonts.gstatic.com')) {
    event.respondWith(
      caches.match(event.request).then(cached =>
        cached || fetch(event.request).then(res => {
          const clone = res.clone();
          caches.open(CACHE_NAME).then(c => c.put(event.request, clone));
          return res;
        })
      )
    );
    return;
  }

  // Static — cache first
  event.respondWith(
    caches.match(event.request).then(cached => {
      if (cached) return cached;
      return fetch(event.request).then(res => {
        if (!res || res.status !== 200 || res.type !== 'basic') return res;
        const clone = res.clone();
        caches.open(CACHE_NAME).then(c => c.put(event.request, clone));
        return res;
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

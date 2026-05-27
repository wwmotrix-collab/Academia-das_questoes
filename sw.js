// ═══════════════════════════════════════════════════════
// Academia das Questões V3.8 — Service Worker
// ═══════════════════════════════════════════════════════

const CACHE_NAME = 'academia-v38-cache-v1';

const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/evolution/index.html',
  '/styles/main.css',
  '/styles/animations.css',
  '/styles/evolution.css',
  '/styles/mimo-evolution.css',
  '/styles/mascot-bar.css',         // V3.8 new
  '/scripts/data.js',
  '/scripts/db.js',
  '/scripts/auth.js',
  '/scripts/gamification.js',
  '/scripts/ui.js',
  '/scripts/evolution_data.js',
  '/scripts/evolution_db.js',
  '/scripts/evolution_widget.js',
  '/scripts/mimo-evolution.js',
  '/scripts/xp-engine.js',          // V3.8 new
  '/scripts/mascot-resolver.js',    // V3.8 new
  '/scripts/app.js',
  '/manifest.json',
  // Stage-0 always cached
  '/assets/mascots/mimo/stage-0/origem.png',
  // Stage-1 class assets
  '/assets/mascots/mimo/stage-1/mamifero.png',
  '/assets/mascots/mimo/stage-1/reptil.png',
  '/assets/mascots/mimo/stage-1/ave.png',
  // Fallback companion images (V3.7)
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
        // Non-fatal: some assets may not exist yet
        console.warn('[SW V3.8] Pre-cache partial:', err);
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

  // Supabase — network first, silent fallback
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

  // Mascot assets — cache first, lazy-cache new ones
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

  // Everything else — cache first
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

const CACHE = 'recipe-exit-pack-v3';
// Vite replaces this marker in dist/sw.js with every hashed JS, CSS, and
// landing-page asset referenced by the current app shell. Keeping the base
// shell here also makes this source file safe when Vite serves it in dev.
const SHELL = ['/', '/privacy/', '/terms/', '/legal.css', '/favicon.svg', '/site.webmanifest', '/assets/hero-recipe-jailbreak-720.webp'
  // __PRECACHE_ASSETS__
];
self.addEventListener('install', (event) => event.waitUntil(caches.open(CACHE).then((cache) => cache.addAll(SHELL)).then(() => self.skipWaiting())));
self.addEventListener('activate', (event) => event.waitUntil(caches.keys().then((keys) => Promise.all(keys.filter((key) => key !== CACHE).map((key) => caches.delete(key)))).then(() => self.clients.claim())));
self.addEventListener('fetch', (event) => {
  const request = event.request;
  if (request.method !== 'GET' || new URL(request.url).origin !== location.origin) return;
  if (request.mode === 'navigate') {
    event.respondWith(fetch(request).then((response) => { const copy = response.clone(); caches.open(CACHE).then((cache) => cache.put(request, copy)); return response; }).catch(async () => (await caches.match(request)) || caches.match('/')));
    return;
  }
  event.respondWith(caches.match(request).then((cached) => cached || fetch(request).then((response) => { if (response.ok) { const copy = response.clone(); caches.open(CACHE).then((cache) => cache.put(request, copy)); } return response; })));
});

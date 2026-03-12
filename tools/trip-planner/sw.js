const CACHE_NAME = 'trip-planner-v7';
const PRECACHE_URLS = [
    './',
    './index.html',
    './manifest.json',
    './icon-48.png',
    './icon-192.png',
    './icon-512.png',
    'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css',
    'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js',
];

self.addEventListener('install', (e) => {
    e.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => cache.addAll(PRECACHE_URLS))
            .then(() => self.skipWaiting())
    );
});

self.addEventListener('activate', (e) => {
    e.waitUntil(
        caches.keys().then(keys =>
            Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)))
        ).then(() => self.clients.claim())
    );
});

self.addEventListener('fetch', (e) => {
    const url = new URL(e.request.url);

    // Handle share_target POST: extract shared file, redirect to app with file in cache
    if (e.request.method === 'POST' && url.pathname.endsWith('/tools/trip-planner/')) {
        e.respondWith((async () => {
            const formData = await e.request.formData();
            const file = formData.get('file');
            if (file) {
                // Store file in a temporary cache for the app to pick up
                const cache = await caches.open('share-target');
                await cache.put('shared-file', new Response(file, {
                    headers: { 'Content-Type': file.type, 'X-File-Name': file.name }
                }));
            }
            // Redirect to the app (GET) with a flag so the app knows to check for shared file
            return Response.redirect(url.pathname + '?shared=1', 303);
        })());
        return;
    }

    // HTML navigation: network-first, fall back to cache for offline
    if (e.request.mode === 'navigate') {
        e.respondWith(
            fetch(e.request.url, { cache: 'no-cache' }).then(res => {
                const clone = res.clone();
                caches.open(CACHE_NAME).then(c => c.put(e.request, clone));
                return res;
            }).catch(() =>
                caches.match(e.request).then(r => r || caches.match('./index.html'))
            )
        );
        return;
    }
    // Other resources: cache-first, fetch and cache on miss
    e.respondWith(
        caches.match(e.request).then(cached => {
            if (cached) return cached;
            return fetch(e.request).then(res => {
                if (res.ok && e.request.method === 'GET') {
                    const clone = res.clone();
                    caches.open(CACHE_NAME).then(c => c.put(e.request, clone));
                }
                return res;
            });
        })
    );
});

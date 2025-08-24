self.addEventListener('install', () => self.skipWaiting());
self.addEventListener('activate', (e) => e.waitUntil(self.clients.claim()));
self.addEventListener('fetch', (event) => {
  const req = event.request;
  if (req.method !== 'GET') return;
  event.respondWith((async () => {
    const cache = await caches.open('excuseme-v1');
    const cached = await cache.match(req);
    const network = fetch(req).then(res => { cache.put(req, res.clone()).catch(()=>{}); return res; }).catch(()=>null);
    return cached || network || new Response('Offline', { status: 503 });
  })());
});

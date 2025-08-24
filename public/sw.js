// === SERVICE WORKER ДЛЯ NEXT.JS 15 ===
// Версия кэша для принудительного обновления при деплое
const CACHE_VERSION = 'v2.0.0';
const CACHE_NAME = `excuseme-${CACHE_VERSION}`;

// Статические ресурсы для кэширования
const STATIC_ASSETS = [
  '/',
  '/manifest.webmanifest',
  '/icons/icon-192.png',
  '/icons/icon-512.png',
  '/icons/icon-16.png',
  '/icons/icon-32.png',
];

// API эндпоинты для кэширования
const API_CACHE_PATTERNS = [
  '/api/health',
  '/api/generate',
  '/api/tts',
];

// === УСТАНОВКА SERVICE WORKER ===
self.addEventListener('install', (event) => {
  console.log(`[SW] Installing version ${CACHE_VERSION}`);
  
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log(`[SW] Caching static assets for ${CACHE_VERSION}`);
        return cache.addAll(STATIC_ASSETS);
      })
      .then(() => {
        console.log(`[SW] Skip waiting for version ${CACHE_VERSION}`);
        return self.skipWaiting();
      })
      .catch((error) => {
        console.error(`[SW] Install failed:`, error);
      })
  );
});

// === АКТИВАЦИЯ SERVICE WORKER ===
self.addEventListener('activate', (event) => {
  console.log(`[SW] Activating version ${CACHE_VERSION}`);
  
  event.waitUntil(
    caches.keys()
      .then((cacheNames) => {
        // Удаляем старые версии кэша
        return Promise.all(
          cacheNames
            .filter((cacheName) => {
              return cacheName.startsWith('excuseme-') && cacheName !== CACHE_NAME;
            })
            .map((cacheName) => {
              console.log(`[SW] Deleting old cache: ${cacheName}`);
              return caches.delete(cacheName);
            })
        );
      })
      .then(() => {
        console.log(`[SW] Claiming clients for version ${CACHE_VERSION}`);
        return self.clients.claim();
      })
      .catch((error) => {
        console.error(`[SW] Activation failed:`, error);
      })
  );
});

// === ОБРАБОТКА ЗАПРОСОВ ===
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);
  
  // Пропускаем не-GET запросы
  if (request.method !== 'GET') {
    return;
  }
  
  // Пропускаем chrome-extension и другие не-HTTP запросы
  if (!url.protocol.startsWith('http')) {
    return;
  }
  
  // Пропускаем аналитику и отладочные запросы
  if (url.pathname.includes('_next/webpack-hmr') || 
      url.pathname.includes('_next/static/chunks') ||
      url.pathname.includes('analytics') ||
      url.pathname.includes('debug')) {
    return;
  }
  
  event.respondWith(handleFetch(request));
});

// === СТРАТЕГИЯ КЭШИРОВАНИЯ ===
async function handleFetch(request) {
  const url = new URL(request.url);
  
  try {
    // === СТАТИЧЕСКИЕ РЕСУРСЫ (Cache First) ===
    if (isStaticAsset(url.pathname)) {
      return await cacheFirst(request);
    }
    
    // === API ЗАПРОСЫ (Network First с fallback) ===
    if (isApiRequest(url.pathname)) {
      return await networkFirst(request);
    }
    
    // === HTML СТРАНИЦЫ (Network First) ===
    if (url.pathname.endsWith('.html') || 
        url.pathname === '/' || 
        !url.pathname.includes('.')) {
      return await networkFirst(request);
    }
    
    // === ОСТАЛЬНЫЕ РЕСУРСЫ (Stale While Revalidate) ===
    return await staleWhileRevalidate(request);
    
  } catch (error) {
    console.error(`[SW] Fetch error for ${request.url}:`, error);
    
    // Fallback для критических ресурсов
    if (isStaticAsset(url.pathname)) {
      const cache = await caches.open(CACHE_NAME);
      const cached = await cache.match(request);
      if (cached) {
        return cached;
      }
    }
    
    // Офлайн страница
    return new Response(
      JSON.stringify({
        error: 'Offline',
        message: 'Нет подключения к интернету',
        timestamp: new Date().toISOString(),
        version: CACHE_VERSION
      }),
      {
        status: 503,
        statusText: 'Service Unavailable',
        headers: {
          'Content-Type': 'application/json',
          'Cache-Control': 'no-cache'
        }
      }
    );
  }
}

// === СТРАТЕГИИ КЭШИРОВАНИЯ ===

// Cache First для статических ресурсов
async function cacheFirst(request) {
  const cache = await caches.open(CACHE_NAME);
  const cached = await cache.match(request);
  
  if (cached) {
    return cached;
  }
  
  try {
    const response = await fetch(request);
    if (response.ok) {
      cache.put(request, response.clone());
    }
    return response;
  } catch (error) {
    throw error;
  }
}

// Network First для API и HTML
async function networkFirst(request) {
  const cache = await caches.open(CACHE_NAME);
  
  try {
    const response = await fetch(request);
    
    // Кэшируем успешные ответы
    if (response.ok) {
      cache.put(request, response.clone());
    }
    
    return response;
  } catch (error) {
    // Fallback на кэш
    const cached = await cache.match(request);
    if (cached) {
      return cached;
    }
    throw error;
  }
}

// Stale While Revalidate для остальных ресурсов
async function staleWhileRevalidate(request) {
  const cache = await caches.open(CACHE_NAME);
  const cached = await cache.match(request);
  
  // Возвращаем кэшированный ответ сразу
  const fetchPromise = fetch(request).then((response) => {
    if (response.ok) {
      cache.put(request, response.clone());
    }
    return response;
  });
  
  return cached || fetchPromise;
}

// === ВСПОМОГАТЕЛЬНЫЕ ФУНКЦИИ ===

function isStaticAsset(pathname) {
  return STATIC_ASSETS.includes(pathname) ||
         pathname.startsWith('/icons/') ||
         pathname.startsWith('/_next/static/') ||
         pathname.includes('.png') ||
         pathname.includes('.jpg') ||
         pathname.includes('.jpeg') ||
         pathname.includes('.gif') ||
         pathname.includes('.svg') ||
         pathname.includes('.woff') ||
         pathname.includes('.woff2') ||
         pathname.includes('.ttf') ||
         pathname.includes('.eot');
}

function isApiRequest(pathname) {
  return pathname.startsWith('/api/') ||
         API_CACHE_PATTERNS.some(pattern => pathname.includes(pattern));
}

// === СИНХРОНИЗАЦИЯ С ОСНОВНЫМ ПОТОКОМ ===
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
  
  if (event.data && event.data.type === 'GET_VERSION') {
    event.ports[0].postMessage({ version: CACHE_VERSION });
  }
});

// === ПЕРИОДИЧЕСКАЯ СИНХРОНИЗАЦИЯ ===
self.addEventListener('sync', (event) => {
  if (event.tag === 'background-sync') {
    event.waitUntil(doBackgroundSync());
  }
});

async function doBackgroundSync() {
  console.log(`[SW] Background sync for version ${CACHE_VERSION}`);
  
  try {
    // Проверяем обновления кэша
    const cache = await caches.open(CACHE_NAME);
    
    // Обновляем критически важные ресурсы
    for (const asset of STATIC_ASSETS) {
      try {
        const response = await fetch(asset);
        if (response.ok) {
          await cache.put(asset, response);
        }
      } catch (error) {
        console.warn(`[SW] Failed to update ${asset}:`, error);
      }
    }
    
    console.log(`[SW] Background sync completed for ${CACHE_VERSION}`);
  } catch (error) {
    console.error(`[SW] Background sync failed:`, error);
  }
}

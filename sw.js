const CACHE_NAME = 'travel-planner-v13';
const STATIC_ASSETS = [
  './',
  './index.html',
  './style.css',
  './trip-data.js',
  './app.js',
  './icon-192.png',
  './icon-512.png',
  'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css',
  'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js',
  'https://fonts.googleapis.com/css2?family=Noto+Sans+KR:wght@400;500;600;700;800&display=swap'
];

const TILE_CACHE = 'travel-tiles-v2';
const TILE_MAX = 2500; // 최대 타일 수 — 4도시 × 4줌 × 라이트/다크 커버

self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE_NAME)
      .then(c => c.addAll(STATIC_ASSETS))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE_NAME && k !== TILE_CACHE).map(k => caches.delete(k)))
    ).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', e => {
  const url = e.request.url;

  // Firebase/Google auth — 항상 네트워크
  if (url.includes('firebaseio.com') || url.includes('googleapis.com') || url.includes('gstatic.com')) return;

  // OSRM/Nominatim API — 네트워크 우선, 캐시 폴백
  if (url.includes('router.project-osrm.org') || url.includes('nominatim.openstreetmap.org') || url.includes('exchangerate-api.com')) {
    e.respondWith(
      fetch(e.request).then(r => {
        if (r.ok) { const c = r.clone(); caches.open(CACHE_NAME).then(cache => cache.put(e.request, c)); }
        return r;
      }).catch(() => caches.match(e.request))
    );
    return;
  }

  // 지도 타일 — 캐시 우선 + LRU 관리
  // 서브도메인 a/b/c 정규화로 캐시 공유 (Leaflet은 랜덤 서브도메인 사용)
  if (url.includes('basemaps.cartocdn.com') || url.includes('tile.openstreetmap.org')) {
    const normalizedUrl = url.replace(/\/\/[abc]\./, '//a.');
    const cacheKey = new Request(normalizedUrl);
    e.respondWith(
      caches.open(TILE_CACHE).then(cache =>
        cache.match(cacheKey).then(cached => {
          if (cached) return cached;
          return fetch(e.request).then(r => {
            if (r.ok) {
              const c = r.clone();
              cache.put(cacheKey, c);
              // LRU: 타일 수 제한
              cache.keys().then(keys => {
                if (keys.length > TILE_MAX) {
                  const toDelete = keys.slice(0, keys.length - TILE_MAX);
                  toDelete.forEach(k => cache.delete(k));
                }
              });
            }
            return r;
          }).catch(() => new Response('', { status: 408 }));
        })
      )
    );
    return;
  }

  // 기본: 네트워크 우선, 캐시 폴백
  e.respondWith(
    fetch(e.request).then(r => {
      if (r.ok) { const c = r.clone(); caches.open(CACHE_NAME).then(cache => cache.put(e.request, c)); }
      return r;
    }).catch(() => caches.match(e.request))
  );
});

// 오프라인 → 온라인 복귀 시 클라이언트에게 알림
self.addEventListener('message', e => {
  if (e.data === 'SKIP_WAITING') self.skipWaiting();
});

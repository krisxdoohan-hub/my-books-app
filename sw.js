// 更新版號以強制刷新
const CACHE_NAME = 'star-reader-v0.1.0'; 
const ASSETS = [
    './',
    // 移除 './index.html' 避免 308 錯誤
    './manifest.json',
    'https://unpkg.com/@tailwindcss/browser@4',
    'https://unpkg.com/@phosphor-icons/web',
    'https://cdnjs.cloudflare.com/ajax/libs/jszip/3.10.1/jszip.min.js',
    'https://cdn.jsdelivr.net/npm/epubjs/dist/epub.min.js'
];

self.addEventListener('install', (event) => {
    // 強制立即接管
    self.skipWaiting();
    event.waitUntil(
        caches.open(CACHE_NAME).then((cache) => {
            return cache.addAll(ASSETS);
        })
    );
});

self.addEventListener('activate', (event) => {
    // 清理舊版本的快取
    event.waitUntil(
        caches.keys().then((cacheNames) => {
            return Promise.all(
                cacheNames.map((cacheName) => {
                    if (cacheName !== CACHE_NAME) {
                        return caches.delete(cacheName);
                    }
                })
            );
        }).then(() => self.clients.claim())
    );
});

self.addEventListener('fetch', (event) => {
    event.respondWith(
        caches.match(event.request).then((response) => {
            // 加上 .catch() 作為最後防線，避免 Promise 拋出異常導致 ERR_FAILED
            return response || fetch(event.request).catch((err) => {
                console.error('Fetch failed for:', event.request.url, err);
                // 這裡可以選擇回傳離線狀態，目前先捕捉錯誤不讓 PWA 崩潰
            });
        })
    );
});

// 強制進版至 v0.1.3 以觸發更新機制
const CACHE_NAME = 'star-reader-v0.2.6';
const ASSETS = [
    './',
    // 絕對不可放 './index.html'，以避開 CF 308 錯誤
    './manifest.json',
    'https://unpkg.com/@tailwindcss/browser@4',
    'https://unpkg.com/@phosphor-icons/web',
    'https://cdnjs.cloudflare.com/ajax/libs/jszip/3.10.1/jszip.min.js',
    'https://cdn.jsdelivr.net/npm/epubjs/dist/epub.min.js'
];

self.addEventListener('install', (event) => {
    // 關鍵修正 1：強制跳過等待狀態，立即安裝新版
    self.skipWaiting();
    event.waitUntil(
        caches.open(CACHE_NAME).then((cache) => {
            return cache.addAll(ASSETS);
        })
    );
});

self.addEventListener('activate', (event) => {
    // 關鍵修正 2：啟動時徹底掃描並刪除所有舊版快取 (包含死鎖的 v0.1.1 與 v0.1.2)
    event.waitUntil(
        caches.keys().then((cacheNames) => {
            return Promise.all(
                cacheNames.map((cacheName) => {
                    if (cacheName !== CACHE_NAME) {
                        return caches.delete(cacheName);
                    }
                })
            );
        }).then(() => self.clients.claim()) // 強制立即接管所有開啟中的分頁與 App
    );
});

self.addEventListener('fetch', (event) => {
    event.respondWith(
        caches.match(event.request).then((response) => {
            // 關鍵修正 3：加入 .catch() 防止 fetch 遇到網路問題時拋出未捕獲錯誤導致 App 白畫面
            return response || fetch(event.request).catch((err) => {
                console.error('Fetch failed for:', event.request.url, err);
            });
        })
    );
});

/* ========================================
   SERVICE WORKER - STOCK APP
======================================== */

const CACHE_NAME = "stock-app-v1";

const urlsToCache = [
    "./",
    "./index.html",
    "./style.css",
    "./script.js",
    "./manifest.json",
    "./icons/icon-192.png",
    "./icons/icon-512.png"
];


/* ========================================
   INSTALL - Simpan file ke cache
======================================== */

self.addEventListener("install", event => {

    event.waitUntil(

        caches.open(CACHE_NAME)
            .then(cache => {
                return cache.addAll(urlsToCache);
            })
            .then(() => self.skipWaiting())

    );

});


/* ========================================
   ACTIVATE - Hapus cache lama
======================================== */

self.addEventListener("activate", event => {

    event.waitUntil(

        caches.keys().then(cacheNames => {

            return Promise.all(

                cacheNames.map(cacheName => {

                    if (cacheName !== CACHE_NAME) {
                        return caches.delete(cacheName);
                    }

                })

            );

        }).then(() => self.clients.claim())

    );

});


/* ========================================
   FETCH - Ambil dari cache, fallback ke network
======================================== */

self.addEventListener("fetch", event => {

    event.respondWith(

        caches.match(event.request)
            .then(response => {

                // Kalau ada di cache, pakai cache
                if (response) {
                    return response;
                }

                // Kalau tidak, ambil dari internet
                return fetch(event.request);

            })

    );

});

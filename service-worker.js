/* ==========================================================================
   296 GAME — service-worker.js
   Cache-first untuk aset statis (app shell). Game itu sendiri dimuat
   dari CDN HTMLGames dan TIDAK di-cache di sini, karena harus selalu
   terhubung ke internet untuk konten game.
   ========================================================================== */

const CACHE_NAME = "296game-shell-v4";

const APP_SHELL = [
  "./index.html",
  "./play.html",
  "./offline.html",
  "./css/style.css",
  "./css/responsive.css",
  "./js/main.js",
  "./js/player.js",
  "./js/router.js",
  "./js/fullscreen.js",
  "./js/database.js",
  "./js/provider.js",
  "./manifest.json",
  "./assets/logo.png",
  "./assets/favicon.png",
  "./assets/loading.svg",
];

// ===== Install: cache app shell =====
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(APP_SHELL)).catch((err) => {
      console.warn("[296GAME SW] Gagal cache app shell:", err);
    })
  );
  self.skipWaiting();
});

// ===== Activate: bersihkan cache versi lama =====
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key))
      )
    )
  );
  self.clients.claim();
});

// ===== Fetch strategy =====
self.addEventListener("fetch", (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Jangan cache request ke CDN game / domain eksternal — selalu network.
  if (url.origin !== self.location.origin) {
    return;
  }

  // Data game (data/games.json dkk) sering di-update — network-first,
  // cache cuma jadi cadangan kalau user sedang offline. Kalau ini juga
  // dibiarkan cache-first seperti app shell, perubahan pada games.json
  // tidak akan pernah terlihat oleh user sampai cache dibersihkan manual.
  if (url.pathname.includes("/data/")) {
    event.respondWith(
      fetch(request)
        .then((response) => {
          if (response.ok && request.method === "GET") {
            const clone = response.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(request, clone));
          }
          return response;
        })
        .catch(() => caches.match(request))
    );
    return;
  }
 
  // Cache-first untuk app shell, fallback ke offline.html untuk navigasi.
  event.respondWith(
    caches.match(request).then((cached) => {
      if (cached) return cached;
 
      return fetch(request)
        .then((response) => {
          if (response.ok && request.method === "GET") {
            const clone = response.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(request, clone));
          }
          return response;
        })
        .catch(() => {
          if (request.mode === "navigate") {
            return caches.match("./offline.html");
          }
        });
    })
  );
});
 

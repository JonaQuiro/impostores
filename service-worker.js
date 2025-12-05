// Cambiá la versión cuando quieras forzar actualización
const CACHE = "impostores-v3";

const FILES = [
  "./",
  "./index.html",
  "./content/personajes.js",
  "./manifest.json",
  "./logo.png",
  "./image/icon-192.png",
  "./image/icon-512.png"
];

// INSTALACIÓN
self.addEventListener("install", event => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE).then(cache => cache.addAll(FILES))
  );
});

// ACTIVACIÓN
self.addEventListener("activate", event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys
          .filter(k => k !== CACHE)
          .map(k => caches.delete(k))
      )
    )
  );
  clients.claim();
});

// FETCH
self.addEventListener("fetch", event => {
  if (event.request.mode === "navigate") {
    event.respondWith(
      fetch(event.request).catch(() => caches.match("./index.html"))
    );
    return;
  }

  event.respondWith(
    caches.match(event.request).then(cached => {
      const fetchPromise = fetch(event.request)
        .then(net => {
          caches.open(CACHE).then(c => {
            c.put(event.request, net.clone());
          });
          return net;
        })
        .catch(() => cached);

      return cached || fetchPromise;
    })
  );
});

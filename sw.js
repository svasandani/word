const CACHE_NAME = "bee_Site";

self.addEventListener("install", (event) => {
  self.skipWaiting();

  event.waitUntil(
    (async () => {
      const cache = await caches.open(CACHE_NAME);

      await cache.addAll(["/", "/dict.txt", "/site.webmanifest"]);
    })()
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    (async () => {
      const cacheNames = await caches.keys();

      await Promise.all(
        cacheNames
          .filter((cacheName) => cacheName !== CACHE_NAME)
          .map((cacheName) => caches.delete(cacheName))
      );
    })()
  );
});

self.addEventListener("fetch", (event) => {
  event.respondWith(
    (async () => {
      const cache = await caches.open(CACHE_NAME);

      const cachedResponsePromise = await cache.match(event.request);
      const networkResponsePromise = fetch(event.request);

      // cache these in the background
      (async () => {
        try {
          const networkResponse = await networkResponsePromise;
          if (networkResponse.ok) {
            await cache.put(event.request, networkResponse.clone());
          }
        } catch {
          console.log("Couldn't revalidate a request, maybe we're offline?");
        }
      })();

      return cachedResponsePromise || networkResponsePromise;
    })()
  );
});

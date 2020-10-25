const PRECACHE = "precache-v1";
const RUNTIME = "runtime";

// files to cache
// A list of local resources we always want to be cached.
// house our array of files to cache here
const PRECACHE_URLS = [
    "/", //Alias for indexing
    "/index.html",
    "/index.js",
    "/icons/icon-192x192.png",
    "/icons/icon-512x512.png",
    "https://stackpath.bootstrapcdn.com/font-awesome/4.7.0/css/font-awesome.min.css",
    "https://cdn.jsdelivr.net/npm/chart.js@2.8.0",
  ];
// install -- uses waitUntil() and skipWaiting()
self.addEventListener('install', event => {
    event.waitUntil(
      caches.open(PRECACHE)
      .then(cache => cache.addAll(PRECACHE_URLS))
      .then(self.skipWaiting())
    );
  });

// activate -- uses waitUntil()
self.addEventListener('activate', event => {
    //hold values for current caches
    const currentCaches = [PRECACHE, RUNTIME];
    event.waitUntil(
      caches.keys()
      .then(cacheNames => {
        return cacheNames.filter(cacheName => !currentCaches.includes(cacheName));
      })
      .then(cachesToDelete => {
        return Promise.all(cachesToDelete.map(cacheToDelete => {
          return caches.delete(cacheToDelete);
        }));
      })
      .then(() => self.clients.claim())
    );
  });

// fetch -- uses startsWith
self.addEventListener('fetch', event => {
    if (event.request.url.startsWith(self.location.origin)) {
      event.respondWith(
        caches.match(event.request).then(cachedResponse => {
          if (cachedResponse) {
            return cachedResponse;
          }
          return caches.open(RUNTIME)
          .then(cache => {
            return fetch(event.request)
            .then(response => {
              return cache.put(event.request, response.clone())
              .then(() => {
                return response;
              });
            });
          });
        })
      );
    }
  });

  // Now we need to make sure the serviceworker js code is at the bottom of our pages
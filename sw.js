/**
 * NexVora QuickCalc - Service Worker v1.0.0
 * Copyright © 2026 NexVora Labs Ofc. All Rights Reserved.
 * Developer: Prince AR Abdur Rahman
 */

const CACHE_NAME = 'nexvora-quickcalc-v1.0.0';

// Relative assets list to work identically on root domains and GitHub Pages subpaths
const STATIC_ASSETS = [
  './',
  './index.html',
  './percentage-calculator.html',
  './discount-calculator.html',
  './about.html',
  './help.html',
  './privacy.html',
  './404.html',
  './css/style.css',
  './js/translations.js',
  './js/calculator.js',
  './js/tools.js',
  './js/app.js',
  './assets/logo.svg',
  './assets/favicon.svg',
  './manifest.json'
];

// Install: Cache critical static assets
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      // Use addAll with error tolerance
      return Promise.allSettled(
        STATIC_ASSETS.map((asset) => cache.add(asset))
      ).then(() => {
        return self.skipWaiting();
      });
    })
  );
});

// Activate: Clean up previous version caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) {
            return caches.delete(key);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// Fetch: Stale-while-revalidate or Cache-first with network fallback
self.addEventListener('fetch', (event) => {
  // Only handle GET requests
  if (event.request.method !== 'GET') return;

  const url = new URL(event.request.url);

  // Skip browser extensions or cross-origin telemetry
  if (url.origin !== self.location.origin) return;

  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      if (cachedResponse) {
        // Fetch in background to update cache for next time
        fetch(event.request).then((networkResponse) => {
          if (networkResponse && networkResponse.status === 200) {
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(event.request, networkResponse.clone());
            });
          }
        }).catch(() => {
          // Silent catch in offline mode
        });
        return cachedResponse;
      }

      // If not in cache, fetch from network
      return fetch(event.request).then((networkResponse) => {
        if (!networkResponse || networkResponse.status !== 200 || networkResponse.type !== 'basic') {
          return networkResponse;
        }

        const responseToCache = networkResponse.clone();
        caches.open(CACHE_NAME).then((cache) => {
          cache.put(event.request, responseToCache);
        });

        return networkResponse;
      }).catch(() => {
        // Fallback for HTML navigation requests to 404 or index
        if (event.request.headers.get('accept')?.includes('text/html')) {
          return caches.match('./404.html') || caches.match('./index.html');
        }
      });
    })
  );
});

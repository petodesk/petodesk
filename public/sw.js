// Petodesk Service Worker
// Minimal SW — enables PWA installability without offline caching
const CACHE_NAME = 'petodesk-v1';

self.addEventListener('install', (event) => {
  // Activate immediately without waiting
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  // Take control of all clients immediately
  event.waitUntil(clients.claim());
});

// Pass all fetch requests straight through to the network — no caching
self.addEventListener('fetch', (event) => {
  event.respondWith(fetch(event.request));
});
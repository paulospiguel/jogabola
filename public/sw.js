// Minimal service worker — makes the app installable (PWA)
// Offline caching will be enhanced in a future phase
self.addEventListener('install', () => self.skipWaiting());
self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim());
});

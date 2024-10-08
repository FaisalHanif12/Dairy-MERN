// service-worker.js in the 'public' folder
console.log('Service Worker Loaded');

self.addEventListener('install', event => {
  console.log('Service Worker: Installed');
});

self.addEventListener('activate', event => {
  console.log('Service Worker: Activated');
  event.waitUntil(clients.claim()); // Take immediate control of the pages
});

self.addEventListener('fetch', event => {
  // Respond with an entry from cache, or fetch from network if not available
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        return response || fetch(event.request);
      })
  );
});

self.addEventListener('push', event => {
  const payload = event.data ? event.data.text() : 'No payload';
  const title = 'Push Notification';
  event.waitUntil(
    self.registration.showNotification(title, {
      body: payload,
    })
  );
});

self.addEventListener('notificationclick', event => {
  console.log('Notification click Received.');
  event.notification.close();
  event.waitUntil(
    clients.openWindow('http://localhost:3000/')
  );
});

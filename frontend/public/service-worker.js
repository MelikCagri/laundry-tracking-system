// public/service-worker.js
// This file MUST be in /public so Vite serves it at the root path.

self.addEventListener('push', (event) => {
  if (!event.data) return;

  const data = event.data.json();
  const { title, body, url, tag } = data;

  const options = {
    body,
    tag: tag || 'kyk-laundry',
    icon: '/icon-192.png',   // Optional: add an icon to /public/icon-192.png
    badge: '/icon-192.png',
    data: { url: url || '/' },
    requireInteraction: true, // Keeps the notification visible until user interacts
  };

  event.waitUntil(self.registration.showNotification(title, options));
});

// When the user taps the notification, open the app at the given URL
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const targetUrl = event.notification.data?.url || '/';
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      for (const client of clientList) {
        if (client.url.includes(self.location.origin) && 'focus' in client) {
          return client.focus();
        }
      }
      if (clients.openWindow) return clients.openWindow(targetUrl);
    })
  );
});

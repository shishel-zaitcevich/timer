// self.addEventListener('install', (event) => {
//   event.waitUntil(self.skipWaiting());
// });

// self.addEventListener('activate', (event) => {
//   event.waitUntil(self.clients.claim());
// });

// self.addEventListener('push', (event) => {
//   const data = event.data.json();
//   event.waitUntil(
//     self.registration.showNotification(data.title, {
//       body: data.body,
//       icon: '/icon.png',
//     }),
//   );
// });

// self.addEventListener('push', (event) => {
//   const data = event.data?.json() || {};
//   event.waitUntil(
//     self.registration.showNotification(data.title || 'Таймер', {
//       body: data.body || 'Сработал интервал',
//       icon: '/icon-192x192.png',
//       badge: '/badge-72x72.png',
//       vibrate: [200, 100, 200],
//       tag: 'timer',
//       requireInteraction: true,
//       data: data.data || {},
//     }),
//   );
// });

// self.addEventListener('notificationclick', (event) => {
//   event.notification.close();
//   event.waitUntil(clients.openWindow('/'));
// });

// ДЛЯ ПУШЕЙ!!!!
self.addEventListener('push', (event) => {
  const data = event.data?.json() || {};

  event.waitUntil(
    self.registration.showNotification(data.title || '⏰ Таймер', {
      body: data.body || 'Сработал интервал',
      icon: '/icon-192x192.png',
      badge: '/badge-72x72.png',
      vibrate: [200, 100, 200],
      tag: 'timer',
      requireInteraction: true,
      data: data.data || {},
    }),
  );
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  event.waitUntil(clients.openWindow('/'));
});

//СТАРОЕ
// self.addEventListener('push', (event) => {
//   const data = event.data.json();
//   self.registration.showNotification(data.title, {
//     body: data.body,
//     icon: '/icon.png',
//   });
// });

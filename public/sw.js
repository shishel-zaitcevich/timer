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
// self.addEventListener('push', (event) => {
//   const data = event.data?.json() || {};

//   event.waitUntil(
//     self.registration.showNotification(data.title || '⏰ Таймер', {
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

//СТАРОЕ
// self.addEventListener('push', (event) => {
//   const data = event.data.json();
//   self.registration.showNotification(data.title, {
//     body: data.body,
//     icon: '/icon.png',
//   });
// });

// Service Worker для обработки push-уведомлений

self.addEventListener('install', (event) => {
  console.log('Service Worker установлен');
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  console.log('Service Worker активирован');
  event.waitUntil(self.clients.claim());
});

// Обработка push-уведомлений
self.addEventListener('push', (event) => {
  console.log('Push уведомление получено');

  let data = {
    title: 'Уведомление',
    body: 'У вас новое уведомление',
    icon: '/icon-192x192.png',
    badge: '/badge-72x72.png',
    data: { url: '/' },
  };

  if (event.data) {
    try {
      data = event.data.json();
    } catch (e) {
      console.error('Ошибка парсинга данных уведомления', e);
    }
  }

  const options = {
    body: data.body,
    icon: data.icon || '/icon-192x192.png',
    badge: data.badge || '/badge-72x72.png',
    vibrate: [200, 100, 200],
    data: data.data || { url: '/' },
    actions: [
      {
        action: 'open',
        title: 'Открыть',
      },
      {
        action: 'close',
        title: 'Закрыть',
      },
    ],
  };

  event.waitUntil(self.registration.showNotification(data.title, options));
});

// Обработка клика по уведомлению
self.addEventListener('notificationclick', (event) => {
  console.log('Клик по уведомлению');

  event.notification.close();

  if (event.action === 'close') {
    return;
  }

  // Открываем приложение или фокусируемся на существующей вкладке
  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      // Если есть открытая вкладка, фокусируемся на ней
      for (let i = 0; i < clientList.length; i++) {
        const client = clientList[i];
        if (client.url.includes(self.location.origin) && 'focus' in client) {
          return client.focus();
        }
      }
      // Если нет открытых вкладок, открываем новую
      if (self.clients.openWindow) {
        const urlToOpen = event.notification.data?.url || '/';
        return self.clients.openWindow(urlToOpen);
      }
    }),
  );
});

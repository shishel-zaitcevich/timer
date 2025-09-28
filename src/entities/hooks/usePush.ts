// 'use client';
// import { useEffect, useState } from 'react';

// export function usePush() {
//   const [isSubscribed, setIsSubscribed] = useState(false);
//   const [registration, setRegistration] = useState<ServiceWorkerRegistration | null>(null);

//   useEffect(() => {
//     if ('serviceWorker' in navigator && 'PushManager' in window) {
//       navigator.serviceWorker.ready.then((reg) => {
//         setRegistration(reg);
//         reg.pushManager.getSubscription().then((sub) => {
//           setIsSubscribed(!!sub);
//         });
//       });
//     }
//   }, []);

//   const subscribe = async () => {
//     if (!registration) return;

//     const publicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!;
//     const convertedVapidKey = urlBase64ToUint8Array(publicKey);

//     const sub = await registration.pushManager.subscribe({
//       userVisibleOnly: true,
//       applicationServerKey: convertedVapidKey,
//     });

//     // Отправляем подписку на сервер
//     await fetch('/api/save-subscription', {
//       method: 'POST',
//       body: JSON.stringify(sub),
//       headers: { 'Content-Type': 'application/json' },
//     });

//     setIsSubscribed(true);
//   };

//   return { isSubscribed, subscribe };
// }

// function urlBase64ToUint8Array(base64String: string) {
//   const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
//   const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
//   const rawData = window.atob(base64);
//   return Uint8Array.from([...rawData].map((c) => c.charCodeAt(0)));
// }

// entities/hooks/usePush.ts
// entities/hooks/usePush.ts
import { useState, useEffect } from 'react';

export function usePush() {
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Проверяем текущий статус подписки при загрузке
  useEffect(() => {
    checkSubscriptionStatus();
  }, []);

  const checkSubscriptionStatus = async () => {
    if (
      typeof window === 'undefined' ||
      !('serviceWorker' in navigator) ||
      !('PushManager' in window)
    ) {
      return;
    }

    try {
      const registration = await navigator.serviceWorker.ready;
      const subscription = await registration.pushManager.getSubscription();
      setIsSubscribed(!!subscription);
    } catch (err) {
      console.error('Ошибка проверки статуса подписки:', err);
      setError('Ошибка проверки подписки');
    }
  };

  const subscribe = async () => {
    if (
      typeof window === 'undefined' ||
      !('serviceWorker' in navigator) ||
      !('PushManager' in window)
    ) {
      setError('Push уведомления не поддерживаются');
      return false;
    }

    setIsLoading(true);
    setError(null);

    try {
      // Проверяем разрешения
      const permission = await Notification.requestPermission();

      if (permission !== 'granted') {
        throw new Error('Разрешение на уведомления не получено');
      }

      // Ждем регистрации Service Worker
      const registration = await navigator.serviceWorker.ready;

      // Проверяем, нет ли уже активной подписки
      let subscription = await registration.pushManager.getSubscription();

      if (!subscription) {
        // Создаем новую подписку
        const vapidPublicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;

        if (!vapidPublicKey) {
          throw new Error('VAPID ключ не настроен');
        }

        // Конвертируем VAPID ключ в нужный формат
        const applicationServerKey = urlBase64ToUint8Array(vapidPublicKey);

        subscription = await registration.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: applicationServerKey.buffer as ArrayBuffer,
        });

        // console.log('Создана новая подписка:', {
        //   endpoint: subscription.endpoint,
        //   hasKeys: !!subscription.keys,
        //   p256dh: subscription.keys ? !!subscription.getKey('p256dh') : false,
        //   auth: subscription.keys ? !!subscription.getKey('auth') : false,
        // });
      }

      // Отправляем подписку на сервер
      const subscriptionPayload = {
        endpoint: subscription.endpoint,
        keys: {
          p256dh: arrayBufferToBase64(subscription.getKey('p256dh')!),
          auth: arrayBufferToBase64(subscription.getKey('auth')!),
        },
        expirationTime: subscription.expirationTime,
      };

      console.log('Отправляем подписку на сервер:', subscriptionPayload);

      const response = await fetch('/api/save-subscription', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(subscriptionPayload),
      });

      const result = await response.json();

      if (!result.success) {
        throw new Error(result.error || 'Ошибка сохранения подписки');
      }

      setIsSubscribed(true);
      console.log('Подписка на push уведомления успешна');
      return true;
    } catch (err) {
      console.error('Ошибка подписки:', err);
      const errorMessage = err instanceof Error ? err.message : 'Неизвестная ошибка';
      setError(errorMessage);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const unsubscribe = async () => {
    if (typeof window === 'undefined' || !('serviceWorker' in navigator)) {
      return false;
    }

    setIsLoading(true);
    setError(null);

    try {
      const registration = await navigator.serviceWorker.ready;
      const subscription = await registration.pushManager.getSubscription();

      if (subscription) {
        // Отписываемся от push уведомлений
        await subscription.unsubscribe();

        // Удаляем подписку с сервера
        await fetch('/api/save-subscription', {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ endpoint: subscription.endpoint }),
        });
      }

      setIsSubscribed(false);
      console.log('Отписка от push уведомлений успешна');
      return true;
    } catch (err) {
      console.error('Ошибка отписки:', err);
      const errorMessage = err instanceof Error ? err.message : 'Ошибка отписки';
      setError(errorMessage);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    isSubscribed,
    isLoading,
    error,
    subscribe,
    unsubscribe,
    checkSubscriptionStatus,
  };
}

// Вспомогательная функция для конвертации VAPID ключа
function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');

  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

// Вспомогательная функция для конвертации ArrayBuffer в Base64
function arrayBufferToBase64(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer);
  let binary = '';
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return window.btoa(binary);
}

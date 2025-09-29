'use client';

import { useState, useEffect } from 'react';

export function usePush() {
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Проверяем статус подписки при загрузке
  useEffect(() => {
    checkSubscriptionStatus();
  }, []);

  async function subscribe() {
    setIsLoading(true);
    setError(null);

    try {
      // 1. Проверяем поддержку браузера
      if (!('serviceWorker' in navigator)) {
        throw new Error('Service Worker не поддерживается');
      }

      if (!('PushManager' in window)) {
        throw new Error('Push API не поддерживается');
      }

      // 2. Запрашиваем разрешение на уведомления
      const permission = await Notification.requestPermission();

      if (permission !== 'granted') {
        throw new Error('Разрешение на уведомления отклонено');
      }

      // 3. Ждём готовности Service Worker
      const reg = await navigator.serviceWorker.ready;

      // 4. Проверяем, есть ли уже подписка
      let sub = await reg.pushManager.getSubscription();

      if (sub) {
        // Если подписка уже есть, используем её
        setIsSubscribed(true);
      } else {
        // 5. Создаём новую подписку
        const vapidKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;

        if (!vapidKey) {
          throw new Error('VAPID ключ не настроен');
        }

        sub = await reg.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: urlBase64ToUint8Array(vapidKey),
        });

        // 6. Отправляем подписку на сервер
        const response = await fetch('/api/save-subscription', {
          method: 'POST',
          body: JSON.stringify(sub.toJSON()),
          headers: { 'Content-Type': 'application/json' },
        });

        if (!response.ok) {
          throw new Error('Не удалось сохранить подписку на сервере');
        }

        setIsSubscribed(true);
      }

      return true;
    } catch (e: any) {
      console.error('Ошибка подписки:', e);
      setError(e.message || 'Ошибка при подписке');
      setIsSubscribed(false);
      return false;
    } finally {
      setIsLoading(false);
    }
  }

  async function unsubscribe() {
    setIsLoading(true);
    setError(null);

    try {
      const reg = await navigator.serviceWorker.ready;
      const sub = await reg.pushManager.getSubscription();

      if (sub) {
        // Отписываемся от push
        await sub.unsubscribe();

        // Удаляем подписку с сервера
        await fetch('/api/remove-subscription', {
          method: 'POST',
          body: JSON.stringify(sub.toJSON()),
          headers: { 'Content-Type': 'application/json' },
        });
      }

      setIsSubscribed(false);
      return true;
    } catch (e: any) {
      console.error('Ошибка отписки:', e);
      setError(e.message || 'Ошибка при отписке');
      return false;
    } finally {
      setIsLoading(false);
    }
  }

  async function checkSubscriptionStatus() {
    try {
      if (!('serviceWorker' in navigator)) return false;

      const reg = await navigator.serviceWorker.ready;
      const sub = await reg.pushManager.getSubscription();
      const status = !!sub;
      setIsSubscribed(status);
      return status;
    } catch (e) {
      console.error('Ошибка проверки статуса:', e);
      return false;
    }
  }

  async function sendNotification(title: string, body: string) {
    try {
      const response = await fetch('/api/send-notification', {
        method: 'POST',
        body: JSON.stringify({ title, body }),
        headers: { 'Content-Type': 'application/json' },
      });

      if (!response.ok) {
        throw new Error('Ошибка отправки уведомления');
      }
    } catch (e) {
      console.error('Ошибка отправки уведомления:', e);
    }
  }

  return {
    isSubscribed,
    isLoading,
    error,
    subscribe,
    unsubscribe,
    checkSubscriptionStatus,
    sendNotification,
  };
}

// Helper для преобразования VAPID ключа
function urlBase64ToUint8Array(base64String: string) {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');

  const rawData = atob(base64);
  const outputArray = new Uint8Array(rawData.length);

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

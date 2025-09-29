'use client';

import { useState } from 'react';

export function usePush() {
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function subscribe() {
    setIsLoading(true);
    try {
      const reg = await navigator.serviceWorker.ready;

      const sub = await reg.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!),
      });

      await fetch('/api/save-subscription', {
        method: 'POST',
        body: JSON.stringify(sub),
        headers: { 'Content-Type': 'application/json' },
      });

      setIsSubscribed(true);
      setError(null);
      return true;
    } catch (e) {
      console.error(e);
      setError('Ошибка при подписке');
      return false;
    } finally {
      setIsLoading(false);
    }
  }

  async function unsubscribe() {
    setIsLoading(true);
    try {
      const reg = await navigator.serviceWorker.ready;
      const sub = await reg.pushManager.getSubscription();
      if (sub) {
        await sub.unsubscribe();
        setIsSubscribed(false);
      }
      return true;
    } catch (e) {
      console.error(e);
      setError('Ошибка при отписке');
      return false;
    } finally {
      setIsLoading(false);
    }
  }

  async function checkSubscriptionStatus() {
    const reg = await navigator.serviceWorker.ready;
    const sub = await reg.pushManager.getSubscription();
    setIsSubscribed(!!sub);
    return !!sub;
  }

  async function sendNotification(title: string, body: string) {
    try {
      await fetch('/api/send-notification', {
        method: 'POST',
        body: JSON.stringify({ title, body }),
        headers: { 'Content-Type': 'application/json' },
      });
    } catch (e) {
      console.error('Ошибка отправки уведомления', e);
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

// helper для VAPID ключа
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

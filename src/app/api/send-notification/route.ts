import { NextResponse } from 'next/server';
import webpush from 'web-push';
import { subscriptions } from '../save-subscription/route';

// Настройка VAPID
webpush.setVapidDetails(
  'mailto:test@example.com',
  process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!,
  process.env.VAPID_PRIVATE_KEY!,
);

// Адаптер: преобразует браузерный PushSubscription в web-push PushSubscription
function toWebPushSubscription(sub: any): webpush.PushSubscription {
  return {
    endpoint: sub.endpoint,
    keys: {
      auth: sub.keys?.auth,
      p256dh: sub.keys?.p256dh,
    },
  };
}

export async function POST(req: Request) {
  try {
    const { title, body, options } = await req.json();

    const payload = JSON.stringify({
      title,
      body,
      icon: '/icon-192x192.png',
      badge: '/badge-72x72.png',
      data: { url: '/' },
      options: {
        requireInteraction: options?.requireInteraction ?? true,
        vibrate: options?.vibrate ?? [200, 100, 200, 100, 200],
        silent: false,
        renotify: true,
        tag: 'timer-notification',
      },
    });

    const failed: any[] = [];
    const results = await Promise.allSettled(
      subscriptions.map(async (sub) => {
        try {
          const webPushSub = toWebPushSubscription(sub);
          await webpush.sendNotification(webPushSub, payload, {
            urgency: 'high', // Высокий приоритет для Android
            TTL: 60, // Время жизни уведомления
          });
          return { success: true };
        } catch (err: any) {
          console.error('Ошибка при отправке уведомления:', err.message);
          failed.push(sub);
          return { success: false, error: err.message };
        }
      }),
    );

    // Чистим невалидные подписки
    failed.forEach((f) => {
      const idx = subscriptions.indexOf(f);
      if (idx !== -1) subscriptions.splice(idx, 1);
    });

    const successful = results.filter((r) => r.status === 'fulfilled').length;

    return NextResponse.json({
      success: true,
      sent: successful,
      failed: failed.length,
      total: subscriptions.length,
    });
  } catch (e: any) {
    console.error('Ошибка при отправке уведомлений:', e);
    return NextResponse.json(
      {
        success: false,
        error: e.message,
      },
      { status: 500 },
    );
  }
}

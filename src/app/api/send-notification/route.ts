import { NextResponse } from 'next/server';
import webpush from 'web-push';
import { subscriptions } from '../save-subscription/route';

// Настройка VAPID
webpush.setVapidDetails(
  'mailto:test@example.com',
  process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!,
  process.env.VAPID_PRIVATE_KEY!,
);

// ✅ Адаптер: преобразует браузерный PushSubscription в web-push PushSubscription
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
    const { title, body } = await req.json();

    const payload = JSON.stringify({
      title,
      body,
      icon: '/icon-192x192.png',
      badge: '/badge-72x72.png',
      data: { url: '/' },
    });

    const failed: any[] = [];

    await Promise.all(
      subscriptions.map(async (sub) => {
        try {
          const webPushSub = toWebPushSubscription(sub);
          await webpush.sendNotification(webPushSub, payload);
        } catch (err) {
          console.error('Ошибка при отправке уведомления', err);
          failed.push(sub);
        }
      }),
    );

    // чистим невалидные подписки
    failed.forEach((f) => {
      const idx = subscriptions.indexOf(f);
      if (idx !== -1) subscriptions.splice(idx, 1);
    });

    return NextResponse.json({
      success: true,
      sent: subscriptions.length - failed.length,
      failed: failed.length,
    });
  } catch (e) {
    console.error('Ошибка при отправке уведомлений', e);
    return NextResponse.json({ success: false }, { status: 500 });
  }
}

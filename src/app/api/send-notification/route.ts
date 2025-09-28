// import { NextResponse } from 'next/server';
// import webpush from 'web-push';
// import { getSubscriptions } from '../save-subscription/route';

// webpush.setVapidDetails(
//   process.env.VAPID_SUBJECT!,
//   process.env.VAPID_PUBLIC_KEY!,
//   process.env.VAPID_PRIVATE_KEY!,
// );

// export async function POST(req: Request) {
//   const { title, body } = await req.json();
//   const subs = getSubscriptions();

//   for (const sub of subs) {
//     try {
//       await webpush.sendNotification(sub, JSON.stringify({ title, body }));
//     } catch (err) {
//       console.error('Push error:', err);
//     }
//   }

//   return NextResponse.json({ success: true });
// }

// app/api/send-notification/route.ts
import { NextResponse } from 'next/server';
import webpush from 'web-push';
import { getSubscriptions } from '../save-subscription/route';

webpush.setVapidDetails(
  process.env.VAPID_SUBJECT!,
  process.env.VAPID_PUBLIC_KEY!,
  process.env.VAPID_PRIVATE_KEY!,
);

// Функция для преобразования браузерной подписки в формат web-push
function convertToWebPushSubscription(browserSub: any): webpush.PushSubscription {
  return {
    endpoint: browserSub.endpoint,
    keys: {
      p256dh: browserSub.keys?.p256dh || '',
      auth: browserSub.keys?.auth || '',
    },
  };
}

export async function POST(req: Request) {
  try {
    const { title, body } = await req.json();
    const subs = getSubscriptions();

    if (!subs || subs.length === 0) {
      return NextResponse.json({ success: false, message: 'No subscriptions found' });
    }

    const promises = subs.map(async (browserSub) => {
      try {
        // Преобразуем браузерную подписку в формат web-push
        const webPushSub = convertToWebPushSubscription(browserSub);

        await webpush.sendNotification(
          webPushSub,
          JSON.stringify({
            title,
            body,
            icon: '/icon-192x192.png',
            badge: '/badge-72x72.png',
            tag: 'timer-notification',
            requireInteraction: true,
            vibrate: [200, 100, 200],
            data: {
              url: '/',
              timestamp: Date.now(),
            },
          }),
        );
        return { success: true, endpoint: browserSub.endpoint };
      } catch (err) {
        console.error('Push error for subscription:', err);
        return { success: false, endpoint: browserSub.endpoint };
      }
    });

    const results = await Promise.all(promises);
    const successful = results.filter((r) => r.success).length;
    const failed = results.filter((r) => !r.success).length;

    console.log(`Push notifications sent: ${successful} successful, ${failed} failed`);

    return NextResponse.json({
      success: true,
      sent: successful,
      failed: failed,
      total: subs.length,
      results: results,
    });
  } catch (error) {
    console.error('Send notification error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Internal server error',
      },
      { status: 500 },
    );
  }
}

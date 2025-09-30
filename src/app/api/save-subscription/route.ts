import { NextResponse } from 'next/server';

let subscriptions: PushSubscription[] = [];

export async function POST(req: Request) {
  try {
    const sub: PushSubscription = await req.json();

    // сохраняем подписку (пока в памяти, можно в БД)
    const exists = subscriptions.find((s) => JSON.stringify(s) === JSON.stringify(sub));
    if (!exists) {
      subscriptions.push(sub);
    }

    return NextResponse.json({ success: true });
  } catch (e) {
    console.error('Ошибка при сохранении подписки', e);
    return NextResponse.json({ success: false }, { status: 500 });
  }
}

export async function GET() {
  return NextResponse.json({ subscriptionsCount: subscriptions.length });
}

export { subscriptions };

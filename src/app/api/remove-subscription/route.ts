import { NextResponse } from 'next/server';
import { subscriptions } from '../save-subscription/route';

export async function POST(req: Request) {
  try {
    const sub = await req.json();

    // Находим и удаляем подписку
    const index = subscriptions.findIndex((s) => s.endpoint === sub.endpoint);

    if (index !== -1) {
      subscriptions.splice(index, 1);
    }

    return NextResponse.json({ success: true });
  } catch (e) {
    console.error('Ошибка при удалении подписки', e);
    return NextResponse.json({ success: false }, { status: 500 });
  }
}

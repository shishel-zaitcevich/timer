// import { NextResponse } from 'next/server';

// let subscriptions: PushSubscription[] = [];

// export async function POST(req: Request) {
//   const sub = await req.json();
//   subscriptions.push(sub);
//   return NextResponse.json({ success: true });
// }

// // В отдельном роуте можно дергать рассылку
// export function getSubscriptions() {
//   return subscriptions;
// }

// app/api/save-subscription/route.ts
import { NextResponse } from 'next/server';

// Тип для хранения подписок (совместимый с браузерным API)
interface StoredSubscription {
  endpoint: string;
  keys: {
    p256dh: string;
    auth: string;
  };
  expirationTime?: number | null;
}

// В реальном приложении используйте базу данных
// Здесь используем простое хранилище в памяти для демонстрации
let subscriptions: StoredSubscription[] = [];

export function getSubscriptions(): StoredSubscription[] {
  return subscriptions;
}

export async function POST(req: Request) {
  try {
    const subscription = await req.json();

    console.log('Получена подписка:', subscription);

    // Проверяем, что подписка содержит необходимые поля
    if (!subscription || !subscription.endpoint || !subscription.keys) {
      return NextResponse.json(
        { success: false, error: 'Invalid subscription: missing endpoint or keys' },
        { status: 400 },
      );
    }

    if (!subscription.keys.p256dh || !subscription.keys.auth) {
      return NextResponse.json(
        { success: false, error: 'Invalid subscription: missing p256dh or auth keys' },
        { status: 400 },
      );
    }

    // Создаем объект подписки в нужном формате
    const storedSubscription: StoredSubscription = {
      endpoint: subscription.endpoint,
      keys: {
        p256dh: subscription.keys.p256dh,
        auth: subscription.keys.auth,
      },
      expirationTime: subscription.expirationTime || null,
    };

    // Проверяем, не существует ли уже такая подписка
    const existingIndex = subscriptions.findIndex(
      (sub) => sub.endpoint === storedSubscription.endpoint,
    );

    if (existingIndex !== -1) {
      // Обновляем существующую подписку
      subscriptions[existingIndex] = storedSubscription;
      console.log('Подписка обновлена');
    } else {
      // Добавляем новую подписку
      subscriptions.push(storedSubscription);
      console.log('Новая подписка добавлена');
    }

    console.log('Всего подписок:', subscriptions.length);

    return NextResponse.json({
      success: true,
      message: 'Subscription saved successfully',
      totalSubscriptions: subscriptions.length,
    });
  } catch (error) {
    console.error('Ошибка сохранения подписки:', error);
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
}

export async function GET() {
  return NextResponse.json({
    success: true,
    subscriptions: subscriptions.length,
    // Не возвращаем сами подписки по соображениям безопасности
  });
}

export async function DELETE(req: Request) {
  try {
    const { endpoint } = await req.json();

    if (!endpoint) {
      return NextResponse.json({ success: false, error: 'Endpoint required' }, { status: 400 });
    }

    const initialLength = subscriptions.length;
    subscriptions = subscriptions.filter((sub) => sub.endpoint !== endpoint);

    const removed = initialLength - subscriptions.length;

    return NextResponse.json({
      success: true,
      message: `Removed ${removed} subscription(s)`,
      totalSubscriptions: subscriptions.length,
    });
  } catch (error) {
    console.error('Ошибка удаления подписки:', error);
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
}

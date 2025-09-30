'use client';

import dynamic from 'next/dynamic';

const NotificationTest = dynamic(() => import('./NotificationTest'), {
  ssr: false,
  loading: () => (
    <div
      style={{
        padding: '20px',
        textAlign: 'center',
        fontSize: '18px',
        color: '#666',
      }}
    >
      Загрузка тестовой страницы...
    </div>
  ),
});

export default function NotificationTestPage() {
  return <NotificationTest />;
}

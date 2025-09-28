import './globals.scss';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Таймер с озвучкой',
  description:
    'Приложение с FSD, озвучкой времени и подсчетом затраченного времени',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ru">
      <body>{children}</body>
    </html>
  );
}

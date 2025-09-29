'use client';

import { useState, useRef } from 'react';

export function useTimerPush(
  intervalMinutes: number,
  running: boolean,
  paused: boolean,
  sendNotification: (title: string, body: string) => Promise<void>,
) {
  const [currentTime, setCurrentTime] = useState('');
  const [elapsed, setElapsed] = useState(0);
  const startTimeRef = useRef<number | null>(null);
  const pausedTimeRef = useRef(0);
  const pauseStartRef = useRef<number | null>(null);

  const start = () => {
    const now = Date.now();
    startTimeRef.current = now;
    pausedTimeRef.current = 0;
    pauseStartRef.current = null;
    setElapsed(0);

    // планируем пуши
    setInterval(() => {
      if (running && !paused) {
        const timeStr = new Date().toLocaleTimeString('ru-RU', {
          hour: '2-digit',
          minute: '2-digit',
        });
        sendNotification('⏰ Напоминание', `Прошло ${intervalMinutes} мин. Сейчас ${timeStr}`);
      }
    }, intervalMinutes * 60000);
  };

  const stop = () => {
    startTimeRef.current = null;
    pauseStartRef.current = null;
  };

  const pause = () => {
    if (!pauseStartRef.current) pauseStartRef.current = Date.now();
    else {
      pausedTimeRef.current += Date.now() - pauseStartRef.current;
      pauseStartRef.current = null;
    }
  };

  const resume = () => {
    if (pauseStartRef.current) {
      pausedTimeRef.current += Date.now() - pauseStartRef.current;
      pauseStartRef.current = null;
    }
  };

  return { currentTime, elapsed, start, stop, pause, resume };
}

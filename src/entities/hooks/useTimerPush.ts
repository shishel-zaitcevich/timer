'use client';

import { useState, useRef, useEffect } from 'react';

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
  const intervalIdRef = useRef<NodeJS.Timeout | null>(null);
  const notificationIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const animationFrameRef = useRef<number | null>(null);

  // Обновление текущего времени каждую секунду
  useEffect(() => {
    const updateCurrentTime = () => {
      setCurrentTime(
        new Date().toLocaleTimeString('ru-RU', {
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
        }),
      );
    };

    updateCurrentTime();
    const interval = setInterval(updateCurrentTime, 1000);

    return () => clearInterval(interval);
  }, []);

  // Обновление elapsed времени
  useEffect(() => {
    if (!running || paused) {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      return;
    }

    const updateElapsed = () => {
      if (startTimeRef.current !== null) {
        const now = Date.now();
        const pausedTime = pauseStartRef.current
          ? pausedTimeRef.current + (now - pauseStartRef.current)
          : pausedTimeRef.current;

        setElapsed(now - startTimeRef.current - pausedTime);
      }
      animationFrameRef.current = requestAnimationFrame(updateElapsed);
    };

    animationFrameRef.current = requestAnimationFrame(updateElapsed);

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [running, paused]);

  const start = () => {
    const now = Date.now();
    startTimeRef.current = now;
    pausedTimeRef.current = 0;
    pauseStartRef.current = null;
    setElapsed(0);

    // Очищаем предыдущие интервалы
    if (notificationIntervalRef.current) {
      clearInterval(notificationIntervalRef.current);
    }

    // Устанавливаем новый интервал для уведомлений
    notificationIntervalRef.current = setInterval(() => {
      const timeStr = new Date().toLocaleTimeString('ru-RU', {
        hour: '2-digit',
        minute: '2-digit',
      });
      sendNotification('⏰ Напоминание', `Прошло ${intervalMinutes} мин. Сейчас ${timeStr}`);
    }, intervalMinutes * 60000);
  };

  const stop = () => {
    startTimeRef.current = null;
    pauseStartRef.current = null;
    pausedTimeRef.current = 0;

    // Очищаем все интервалы
    if (intervalIdRef.current) {
      clearInterval(intervalIdRef.current);
      intervalIdRef.current = null;
    }
    if (notificationIntervalRef.current) {
      clearInterval(notificationIntervalRef.current);
      notificationIntervalRef.current = null;
    }
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }
  };

  const pause = () => {
    if (!pauseStartRef.current) {
      pauseStartRef.current = Date.now();
    }
  };

  const resume = () => {
    if (pauseStartRef.current) {
      pausedTimeRef.current += Date.now() - pauseStartRef.current;
      pauseStartRef.current = null;
    }
  };

  // Очистка при размонтировании
  useEffect(() => {
    return () => {
      if (intervalIdRef.current) clearInterval(intervalIdRef.current);
      if (notificationIntervalRef.current) clearInterval(notificationIntervalRef.current);
      if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
    };
  }, []);

  return { currentTime, elapsed, start, stop, pause, resume };
}

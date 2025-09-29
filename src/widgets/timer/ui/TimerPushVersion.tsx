'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

import { useTimerPush } from '@/entities/hooks/useTimerPush';
import { usePush } from '@/entities/hooks/usePush';

import s from './Timer.module.scss';
import NotificationMode from '@/features/notificationMode/ui/NotificationMode';
import SetInterval from '@/features/setInterval/ui/SetInterval';
import TimeDisplay from '@/features/timeDisplay/TimeDisplay';
import TimerControl from '@/features/timerControl/ui/TimerControl';
import TimeSummaryModal from '@/features/timeSummaryModal/TimeSummaryModal';

export default function TimerPushVersion() {
  const [intervalMinutes, setIntervalMinutes] = useState(10);
  const [mode, setMode] = useState<'speech' | 'beep' | 'off'>('speech');
  const [running, setRunning] = useState(false);
  const [paused, setPaused] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Подписка на пуши
  const { isSubscribed, subscribe, unsubscribe, isLoading, error, sendNotification } = usePush();

  // Логика таймера
  const { currentTime, elapsed, start, stop, pause, resume } = useTimerPush(
    intervalMinutes,
    running,
    paused,
    async (title: string, body: string) => {
      if (mode !== 'off') {
        await sendNotification(title, body);
      }
    },
  );

  // Регистрируем service worker
  useEffect(() => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker
        .register('/sw.js')
        .then(() => console.log('Service Worker зарегистрирован'))
        .catch((err) => console.error('Ошибка регистрации SW:', err));
    }
  }, []);

  const handleStart = () => {
    if (!isSubscribed) {
      alert('Сначала включите уведомления 🔔');
      return;
    }
    start();
    setRunning(true);
    setPaused(false);
  };

  const handleStop = () => {
    stop();
    setRunning(false);
    setPaused(false);
    setIsModalOpen(true);
  };

  const handlePause = () => {
    if (paused) {
      resume();
      setPaused(false);
    } else {
      pause();
      setPaused(true);
    }
  };

  const handleToggleNotifications = async () => {
    if (isSubscribed) {
      await unsubscribe();
    } else {
      await subscribe();
    }
  };

  return (
    <motion.div className={s.timerContainer} initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      {/* Кнопка управления уведомлениями */}
      <motion.div className={s.pushNotificationContainer}>
        <motion.button
          onClick={handleToggleNotifications}
          disabled={isLoading}
          className={`${s.pushButton} ${isSubscribed ? s.subscribed : ''}`}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          {isLoading ? (
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
              className={s.spinner}
            >
              ⟳
            </motion.div>
          ) : isSubscribed ? (
            '📱 Отключить уведомления'
          ) : (
            '🔔 Включить уведомления'
          )}
        </motion.button>
        {error && <p className={s.error}>❌ {error}</p>}
      </motion.div>

      <motion.h1 className={s.title}>Таймер (Push API)</motion.h1>

      <p className={s.text}>Текущее время: {currentTime}</p>
      <p className={s.timer}>
        Потраченное время: <TimeDisplay elapsed={elapsed} running={running} paused={paused} />
      </p>

      <SetInterval value={intervalMinutes} onChange={setIntervalMinutes} />
      <NotificationMode mode={mode} onChange={setMode} />

      <TimerControl
        running={running}
        paused={paused}
        onStart={handleStart}
        onStop={handleStop}
        onPause={handlePause}
        onResume={handlePause} // Используем одну кнопку для паузы/возобновления
      />

      <TimeSummaryModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        elapsed={elapsed}
      />
    </motion.div>
  );
}

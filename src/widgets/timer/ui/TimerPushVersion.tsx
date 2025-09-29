'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

import { useTimerPush } from '@/entities/hooks/useTimerPush';
import { usePush } from '@/entities/hooks/usePush';
import { notificationService } from '@/shared/services/notificationService';

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
  const [showPermissionDialog, setShowPermissionDialog] = useState(false);

  // Подписка на пуши
  const { isSubscribed, subscribe, unsubscribe, isLoading, error, sendNotification } = usePush();

  // Логика таймера
  const { currentTime, elapsed, start, stop, pause, resume } = useTimerPush(
    intervalMinutes,
    running,
    paused,
    async (title: string, body: string) => {
      // Используем новый сервис уведомлений
      await notificationService.notify(title, body, mode);
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
      setShowPermissionDialog(true);
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

  const handleEnableNotifications = async () => {
    const success = await subscribe();
    if (success) {
      setShowPermissionDialog(false);
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

      {/* Кнопка тестирования уведомлений */}
      {isSubscribed && (
        <motion.button
          onClick={() => notificationService.test(mode)}
          className={s.testButton}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          🧪 Тест уведомлений
        </motion.button>
      )}

      <TimerControl
        running={running}
        paused={paused}
        onStart={handleStart}
        onStop={handleStop}
        onPause={handlePause}
        onResume={handlePause}
      />

      <TimeSummaryModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        elapsed={elapsed}
      />

      {/* Диалог запроса разрешения на уведомления */}
      <AnimatePresence>
        {showPermissionDialog && (
          <motion.div
            className={s.modalOverlay}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowPermissionDialog(false)}
          >
            <motion.div
              className={s.permissionDialog}
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
            >
              <h2>🔔 Включить уведомления?</h2>
              <p>
                Для работы таймера необходимо разрешить уведомления. Они будут приходить каждые{' '}
                {intervalMinutes} минут.
              </p>
              <div className={s.dialogButtons}>
                <motion.button
                  className={s.cancelButton}
                  onClick={() => setShowPermissionDialog(false)}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  Отмена
                </motion.button>
                <motion.button
                  className={s.confirmButton}
                  onClick={handleEnableNotifications}
                  disabled={isLoading}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  {isLoading ? 'Загрузка...' : 'Разрешить'}
                </motion.button>
              </div>
              {error && <p className={s.dialogError}>❌ {error}</p>}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

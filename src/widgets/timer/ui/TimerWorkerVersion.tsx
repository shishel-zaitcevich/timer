'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';

import s from './Timer.module.scss';
import { useTimerWorker } from '@/entities/hooks/useTimeWorker';
import NotificationMode from '@/features/notificationMode/ui/NotificationMode';
import SetInterval from '@/features/setInterval/ui/SetInterval';
import TimeDisplay from '@/features/timeDisplay/TimeDisplay';
import TimerControl from '@/features/timerControl/ui/TimerControl';
import TimeSummaryModal from '@/features/timeSummaryModal/TimeSummaryModal';

export default function TimerWorkerVersion() {
  const [intervalMinutes, setIntervalMinutes] = useState(10);
  const [mode, setMode] = useState<'speech' | 'beep' | 'off'>('speech');
  const [running, setRunning] = useState(false);
  const [paused, setPaused] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const { currentTime, elapsed, start, stop, pause, resume } = useTimerWorker(
    intervalMinutes,
    mode,
    running,
    paused,
  );

  // Регистрация Service Worker
  useEffect(() => {
    if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
      navigator.serviceWorker
        .register('/sw.js')
        .then((registration) => {
          console.log('Service Worker зарегистрирован:', registration);
        })
        .catch((error) => {
          console.error('Ошибка регистрации Service Worker:', error);
        });
    }
  }, []);

  const handleStart = () => {
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
    pause();
    setPaused(true);
  };

  const handleResume = () => {
    resume();
    setPaused(false);
  };

  return (
    <motion.div className={s.timerContainer} initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      <motion.h1 className={s.title}>Таймер (Web Worker)</motion.h1>

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
        onResume={handleResume}
      />

      <TimeSummaryModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        elapsed={elapsed}
      />
    </motion.div>
  );
}

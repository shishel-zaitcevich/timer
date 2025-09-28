'use client';
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import SetInterval from '@/features/setInterval/ui/SetInterval';
import TimerControl from '@/features/timerControl/ui/TimerControl';

import { useTimer } from '../model/useTimer';
import NotificationMode from '@/features/notificationMode/ui/NotificationMode';

import s from './Timer.module.scss';
import TimeDisplay from '@/features/timeDisplay/TimeDisplay';
import TimeSummaryModal from '@/features/timeSummaryModal/TimeSummaryModal';

export default function Timer() {
  const [intervalMinutes, setIntervalMinutes] = useState(10);
  const [mode, setMode] = useState<"speech" | "beep" | "off">("speech");
  const [running, setRunning] = useState(false);
  const [paused, setPaused] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { currentTime, elapsed, start, stop, pause, resume } = useTimer(intervalMinutes, mode, running, paused);

  // Регистрация Service Worker
  useEffect(() => {
    if (typeof window !== "undefined" && "serviceWorker" in navigator) {
      navigator.serviceWorker.register('/sw.js').then((registration) => {
        console.log('Service Worker зарегистрирован:', registration);
      }).catch((error) => {
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
    setPaused(!paused);
  };

  const handleResume = () => {
    resume();
    setPaused(false);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  return (
    <motion.div
      className={s.timerContainer}
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: 'easeOut' }}
    >
      <motion.h1
        className={s.title}
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.6, delay: 0.2 }}
      >
        Таймер с озвучкой специально для Тучки
      </motion.h1>

      <motion.p
        className={s.text}
        initial={{ x: -20, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ duration: 0.3 }}
      >
        Текущее время: <span>{currentTime}</span>
      </motion.p>

      <motion.p className={s.text}>
        Потраченное время: <TimeDisplay elapsed={elapsed} running={running} paused={paused} />
      </motion.p>

      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.4, delay: 0.3 }}
      >
        <SetInterval value={intervalMinutes} onChange={setIntervalMinutes} />
      </motion.div>

      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.4, delay: 0.4 }}
      >
        <NotificationMode mode={mode} onChange={setMode} />
      </motion.div>

      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.4, delay: 0.5 }}
        whileHover={{ scale: 1.05 }}
      >
        <TimerControl
          running={running}
          paused={paused}
          onStart={handleStart}
          onStop={handleStop}
          onPause={handlePause}
          onResume={handleResume}
        />
      </motion.div>

      <TimeSummaryModal isOpen={isModalOpen} onClose={handleCloseModal} elapsed={elapsed} />
    </motion.div>
  );
}

// 'use client';

// import { useState } from 'react';

// import { formatTime } from '@/entities/time/lib/formatTime';
// import SetInterval from '@/features/setInterval/ui/SetInterval';
// import TimerControl from '@/features/timerControl/ui/TimerControl';

// import { useTimer } from '../model/useTimer';
// import NotificationMode from '@/features/notificationMode/ui/NotificationMode';

// import s from './Timer.module.scss'
// import { AnimatePresence, motion } from 'framer-motion';
// import TimeDisplay from '@/features/timeDisplay/TimeDisplay';
// import TimeSummaryModal from '@/features/timeSummaryModal/TimeSummaryModal';


// export default function Timer() {
//   const [intervalMinutes, setIntervalMinutes] = useState(10);
//   const [mode, setMode] = useState<"speech" | "beep" | "off">("speech");
//   const [running, setRunning] = useState(false);
//   const [paused, setPaused] = useState(false);
//   const [isModalOpen, setIsModalOpen] = useState(false);
//   const { currentTime, elapsed, start, stop, pause, resume } = useTimer(intervalMinutes, mode, running, paused);

//   const handleStart = () => {
//     start();
//     setRunning(true);
//     setPaused(false);
//   };

//   const handleStop = () => {
//     stop();
//     setRunning(false);
//     setPaused(false);
//     setIsModalOpen(true);
//   };

//   const handlePause = () => {
//     pause();
//     setPaused(!paused);
//   };

//   const handleResume = () => {
//     resume();
//     setPaused(false);
//   };

//   const handleCloseModal = () => {
//     setIsModalOpen(false);
//   };

//   return (
//     <motion.div
//       className={s.timerContainer}
//       initial={{ opacity: 0, y: 50 }}
//       animate={{ opacity: 1, y: 0 }}
//       transition={{ duration: 0.5, ease: 'easeOut' }}
//     >
//       <motion.h1
//         className={s.title}
//         initial={{ scale: 0.8, opacity: 0 }}
//         animate={{ scale: 1, opacity: 1 }}
//         transition={{ duration: 0.6, delay: 0.2 }}
//       >
//         Таймер с озвучкой специально для Тучки
//       </motion.h1>

//       <motion.p
//         className={s.text}
//         initial={{ x: -20, opacity: 0 }}
//         animate={{ x: 0, opacity: 1 }}
//         transition={{ duration: 0.3 }}
//       >
//         Текущее время: <span>{currentTime}</span>
//       </motion.p>

//       <motion.div className={s.timer}>
//         Потраченное время: <TimeDisplay elapsed={elapsed} running={running} paused={paused} />
//       </motion.div>

//       <motion.div
//         initial={{ y: 20, opacity: 0 }}
//         animate={{ y: 0, opacity: 1 }}
//         transition={{ duration: 0.4, delay: 0.3 }}
//       >
//         <SetInterval value={intervalMinutes} onChange={setIntervalMinutes} />
//       </motion.div>

//       <motion.div
//         initial={{ y: 20, opacity: 0 }}
//         animate={{ y: 0, opacity: 1 }}
//         transition={{ duration: 0.4, delay: 0.4 }}
//       >
//         <NotificationMode mode={mode} onChange={setMode} />
//       </motion.div>

//       <motion.div
//         initial={{ y: 20, opacity: 0 }}
//         animate={{ y: 0, opacity: 1 }}
//         transition={{ duration: 0.4, delay: 0.5 }}
//         whileHover={{ scale: 1.05 }}
//       >
//         <TimerControl
//           running={running}
//           paused={paused}
//           onStart={handleStart}
//           onStop={handleStop}
//           onPause={handlePause}
//           onResume={handleResume}
//         />
//       </motion.div>

//       <TimeSummaryModal isOpen={isModalOpen} onClose={handleCloseModal} elapsed={elapsed} />
//     </motion.div>
//   );
// }
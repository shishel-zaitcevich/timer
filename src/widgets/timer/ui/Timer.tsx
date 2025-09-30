// 'use client';

// import { useState, useEffect } from 'react';
// import { motion, AnimatePresence } from 'framer-motion';

// import SetInterval from '@/features/setInterval/ui/SetInterval';
// import TimerControl from '@/features/timerControl/ui/TimerControl';

// import { useTimer } from '../model/useTimer';
// import NotificationMode from '@/features/notificationMode/ui/NotificationMode';

// import s from './Timer.module.scss';
// import TimeDisplay from '@/features/timeDisplay/TimeDisplay';
// import TimeSummaryModal from '@/features/timeSummaryModal/TimeSummaryModal';
// import { usePush } from '@/entities/hooks/usePush';

// export default function Timer() {
//   const [intervalMinutes, setIntervalMinutes] = useState(10);
//   const [mode, setMode] = useState<'speech' | 'beep' | 'off'>('speech');
//   const [running, setRunning] = useState(false);
//   const [paused, setPaused] = useState(false);
//   const [isModalOpen, setIsModalOpen] = useState(false);
//   const [isIOS, setIsIOS] = useState(false);

//   const { currentTime, elapsed, start, stop, pause, resume } = useTimer(
//     intervalMinutes,
//     mode,
//     running,
//     paused,
//   );

//   const { isSubscribed, subscribe, isLoading, error } = usePush();

//   // Проверка на iOS устройство
//   useEffect(() => {
//     const checkIsIOS = () => {
//       const userAgent = navigator.userAgent || navigator.vendor || (window as any).opera;
//       return /iPad|iPhone|iPod/.test(userAgent) && !(window as any).MSStream;
//     };
//     setIsIOS(checkIsIOS());
//   }, []);

//   // Регистрация Service Worker
//   useEffect(() => {
//     if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
//       navigator.serviceWorker
//         .register('/sw.js')
//         .then((registration) => {
//           console.log('Service Worker зарегистрирован:', registration);
//         })
//         .catch((error) => {
//           console.error('Ошибка регистрации Service Worker:', error);
//         });
//     }
//   }, []);

//   // Автоматическая подписка на пуш-уведомления для iOS
//   useEffect(() => {
//     if (isIOS && mode === 'speech' && !isSubscribed && !isLoading) {
//       console.log('iOS обнаружен, автоматически подписываемся на пуш-уведомления');
//       // Небольшая задержка, чтобы Service Worker успел зарегистрироваться
//       setTimeout(() => {
//         subscribe();
//       }, 1000);
//     }
//   }, [isIOS, mode, isSubscribed, isLoading, subscribe]);

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

//   const handleSubscribe = async () => {
//     const success = await subscribe();
//     if (success) {
//       console.log('Подписка на пуш-уведомления успешна');
//     }
//   };

//   return (
//     <motion.div
//       className={s.timerContainer}
//       initial={{ opacity: 0, y: 50 }}
//       animate={{ opacity: 1, y: 0 }}
//       transition={{ duration: 0.5, ease: 'easeOut' }}
//     >
//       {/* Кнопка управления уведомлениями */}
//       {isIOS && (
//         <motion.div
//           initial={{ opacity: 0, scale: 0.9 }}
//           animate={{ opacity: 1, scale: 1 }}
//           transition={{ duration: 0.5, delay: 0.1 }}
//           className={s.pushNotificationContainer}
//         >
//           <motion.button
//             onClick={handleSubscribe}
//             disabled={isLoading}
//             className={`${s.pushButton} ${isSubscribed ? s.subscribed : ''}`}
//             whileHover={{ scale: 1.05 }}
//             whileTap={{ scale: 0.95 }}
//           >
//             {isLoading ? (
//               <motion.div
//                 animate={{ rotate: 360 }}
//                 transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
//                 className={s.spinner}
//               >
//                 ⟳
//               </motion.div>
//             ) : isSubscribed ? (
//               '📱 Пуш-уведомления включены'
//             ) : (
//               '🔔 Включить уведомления для iPhone'
//             )}
//           </motion.button>
//           {error && (
//             <motion.p
//               className={s.error}
//               initial={{ opacity: 0, y: -10 }}
//               animate={{ opacity: 1, y: 0 }}
//             >
//               ❌ {error}
//             </motion.p>
//           )}
//           {isIOS && isSubscribed && (
//             <motion.p
//               className={s.iosInfo}
//               initial={{ opacity: 0 }}
//               animate={{ opacity: 1 }}
//               transition={{ delay: 0.5 }}
//             >
//               ℹ️ На iPhone уведомления будут приходить даже при заблокированном экране
//             </motion.p>
//           )}
//         </motion.div>
//       )}

//       <motion.h1
//         className={s.title}
//         initial={{ scale: 0.8, opacity: 0 }}
//         animate={{ scale: 1, opacity: 1 }}
//         transition={{ duration: 0.6, delay: 0.2 }}
//       >
//         Таймер с озвучкой специально для Тучки
//         {isIOS && <span className={s.iosIndicator}>📱</span>}
//       </motion.h1>

//       <motion.p
//         className={s.text}
//         initial={{ x: -20, opacity: 0 }}
//         animate={{ x: 0, opacity: 1 }}
//         transition={{ duration: 0.3 }}
//       >
//         Текущее время:
//         <motion.span
//         // key={currentTime}
//         // initial={{ opacity: 0, scale: 0.8 }}
//         // animate={{ opacity: 1, scale: 1 }}
//         // transition={{ duration: 0.3 }}
//         >
//           {currentTime}
//         </motion.span>
//       </motion.p>

//       <motion.p className={s.timer}>
//         Потраченное время:
//         <TimeDisplay elapsed={elapsed} running={running} paused={paused} />
//       </motion.p>

//       <motion.div
//         initial={{ y: 20, opacity: 0 }}
//         animate={{ y: 0, opacity: 1 }}
//         transition={{ duration: 0.4, delay: 0.3 }}
//         whileHover={{ scale: 1.02 }}
//         whileTap={{ scale: 0.98 }}
//       >
//         <SetInterval value={intervalMinutes} onChange={setIntervalMinutes} />
//       </motion.div>

//       <motion.div
//         initial={{ y: 20, opacity: 0 }}
//         animate={{ y: 0, opacity: 1 }}
//         transition={{ duration: 0.4, delay: 0.4 }}
//         whileHover={{ scale: 1.02 }}
//       >
//         <NotificationMode mode={mode} onChange={setMode} />
//         {isIOS && mode === 'speech' && (
//           <motion.p
//             className={s.iosNote}
//             initial={{ opacity: 0 }}
//             animate={{ opacity: 1 }}
//             transition={{ delay: 0.2 }}
//           >
//             🍎 На iPhone будут использоваться пуш-уведомления
//           </motion.p>
//         )}
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

//       {/* Отладочная информация (только в dev режиме) */}
//       {process.env.NODE_ENV === 'development' && (
//         <motion.div
//           className={s.debugInfo}
//           initial={{ opacity: 0 }}
//           animate={{ opacity: 1 }}
//           transition={{ delay: 1 }}
//         >
//           <details>
//             <summary>🔍 Debug Info</summary>
//             <p>iOS: {isIOS ? 'Yes' : 'No'}</p>
//             <p>User Agent: {navigator.userAgent}</p>
//             <p>Push Subscribed: {isSubscribed ? 'Yes' : 'No'}</p>
//             <p>SW Support: {'serviceWorker' in navigator ? 'Yes' : 'No'}</p>
//             <p>Push Support: {'PushManager' in window ? 'Yes' : 'No'}</p>
//             <p>Speech Support: {'speechSynthesis' in window ? 'Yes' : 'No'}</p>
//           </details>
//         </motion.div>
//       )}
//     </motion.div>
//   );
// }

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
import { usePush } from '@/entities/hooks/usePush';

export default function Timer() {
  const [intervalMinutes, setIntervalMinutes] = useState(10);
  const [mode, setMode] = useState<'speech' | 'beep' | 'off'>('speech');
  const [running, setRunning] = useState(false);
  const [paused, setPaused] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { currentTime, elapsed, start, stop, pause, resume } = useTimer(
    intervalMinutes,
    mode,
    running,
    paused,
  );

  const { isSubscribed, subscribe } = usePush();

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
<<<<<<< HEAD
      {/* <button onClick={subscribe}>
        {isSubscribed ? 'Уведомления включены' : 'Включить уведомления'}
      </button> */}

=======
>>>>>>> def595189b827475345b5be1fc95d8a298479af8
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

      <motion.p className={s.timer}>
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


'use client';
import { beep } from '@/shared/lib/beep';
import { formatIntervalWithPastTense } from '@/shared/lib/pluralize';
import { speak } from '@/shared/lib/speak';
import { useEffect, useState, useRef } from 'react';

export function useTimer(
  intervalMinutes: number,
  mode: 'speech' | 'beep' | 'off',
  running: boolean,
  paused: boolean,
) {
  const [currentTime, setCurrentTime] = useState<string>(''); // всегда тикать
  const [startTime, setStartTime] = useState<number | null>(null);
  const [elapsed, setElapsed] = useState<number>(0);

  const [pauseTime, setPauseTime] = useState<number | null>(null);
  const [totalPausedTime, setTotalPausedTime] = useState<number>(0);

  const workerRef = useRef<Worker | null>(null);
  const isSpeakingRef = useRef<boolean>(false);
  const lastNotificationTimeRef = useRef<number>(0);

  // ===== Обработка уведомлений =====
  const handleNotification = (timeStr: string, intervalStr: string) => {
    if (isSpeakingRef.current) return;
    isSpeakingRef.current = true;

    if (mode === 'speech') {
      speak(`${intervalStr}. Сейчас ${timeStr}`)
        .catch((err) => console.warn('Ошибка речи:', err))
        .finally(() => (isSpeakingRef.current = false));
    } else if (mode === 'beep') {
      beep();
      isSpeakingRef.current = false;
    } else {
      isSpeakingRef.current = false;
    }
  };

  // ===== Web Worker или setInterval =====
  useEffect(() => {
    if (typeof window === 'undefined') return;

    // просто часы — всегда обновляем currentTime
    const clock = setInterval(() => {
      setCurrentTime(
        new Date().toLocaleTimeString('ru-RU', {
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
        }),
      );
    }, 1000);

    let timer: NodeJS.Timeout | null = null;

    if (running && startTime) {
      timer = setInterval(() => {
        if (!paused) {
          const now = Date.now();
          setElapsed(now - startTime - totalPausedTime);

          // проверка уведомлений
          if (mode !== 'off' && intervalMinutes > 0) {
            const sinceLast = now - lastNotificationTimeRef.current;
            if (sinceLast >= intervalMinutes * 60000) {
              const timeStr = new Date().toLocaleTimeString('ru-RU', {
                hour: '2-digit',
                minute: '2-digit',
              });
              const intervalStr = formatIntervalWithPastTense(intervalMinutes);

              lastNotificationTimeRef.current = now;
              handleNotification(timeStr, intervalStr);
            }
          }
        }
      }, 1000);
    }

    return () => {
      clearInterval(clock);
      if (timer) clearInterval(timer);
    };
  }, [running, startTime, paused, intervalMinutes, mode, totalPausedTime]);

  // ===== Управление таймером =====
  const start = () => {
    const now = Date.now();
    setStartTime(now);
    setElapsed(0);
    setTotalPausedTime(0);
    setPauseTime(null);
    lastNotificationTimeRef.current = now;
  };

  const stop = () => {
    setStartTime(null);
    setPauseTime(null);
    // ❌ НЕ сбрасываем elapsed, чтобы модалка показывала итог
  };

  const pause = () => {
    if (!paused) {
      setPauseTime(Date.now());
    } else if (pauseTime) {
      const pausedDuration = Date.now() - pauseTime;
      setTotalPausedTime((prev) => prev + pausedDuration);
      setPauseTime(null);
    }
  };

  const resume = () => {
    if (pauseTime) {
      const pausedDuration = Date.now() - pauseTime;
      setTotalPausedTime((prev) => prev + pausedDuration);
      setPauseTime(null);
    }
  };

  return { currentTime, elapsed, start, stop, pause, resume };
}

// "use client";
// import { beep } from "@/shared/lib/beep";
// import { formatIntervalWithPastTense } from "@/shared/lib/pluralize";
// import { speak } from "@/shared/lib/speak";
// import { useEffect, useState } from "react";

// export function useTimer(
//   intervalMinutes: number,
//   mode: "speech" | "beep" | "off",
//   running: boolean,
//   paused: boolean,
// ) {
//   const [lastSpeakTime, setLastSpeakTime] = useState<number>(Date.now());
//   const [currentTime, setCurrentTime] = useState<string>("");
//   const [startTime, setStartTime] = useState<number | null>(null);
//   const [elapsed, setElapsed] = useState<number>(0);
//   const [pauseTime, setPauseTime] = useState<number | null>(null);
//   const [totalPausedTime, setTotalPausedTime] = useState<number>(0);

//   useEffect(() => {
//     const timer = setInterval(() => {
//       const now = new Date();
//       setCurrentTime(now.toLocaleTimeString("ru-RU"));

//       if (running && !paused && startTime) {
//         const newElapsed = Date.now() - startTime - totalPausedTime;
//         setElapsed(newElapsed);
//         console.log('useTimer tick:', {
//           elapsed: newElapsed,
//           seconds: Math.floor(newElapsed / 1000),
//           totalPausedTime,
//           startTime,
//           now: Date.now()
//         });
//       }
//     }, 1000);

//     return () => clearInterval(timer);
//   }, [running, paused, startTime, totalPausedTime]);

//   useEffect(() => {
//     if (!running || paused) return;

//     const interval = setInterval(() => {
//       const now = Date.now();
//       const diffMinutes = Math.floor((now - lastSpeakTime) / 60000);

//       if (diffMinutes >= intervalMinutes) {
//         const nowDate = new Date();
//         const timeStr = nowDate.toLocaleTimeString("ru-RU", {
//           hour: "2-digit",
//           minute: "2-digit",
//         });

//         const intervalStr = formatIntervalWithPastTense(intervalMinutes);

//         if (mode === "speech") {
//           speak(`${intervalStr}. Сейчас ${timeStr}`);
//         } else if (mode === "beep") {
//           beep();
//         }

//         setLastSpeakTime(now);
//       }
//     }, 1000);

//     return () => clearInterval(interval);
//   }, [intervalMinutes, lastSpeakTime, running, paused, mode]);

//   const start = () => {
//     setElapsed(0); // Обнуляем elapsed только при новом запуске
//     setStartTime(Date.now());
//     setLastSpeakTime(Date.now());
//     setPauseTime(null);
//     setTotalPausedTime(0); // Сбрасываем общее время паузы
//   };

//   const resume = () => {
//     if (pauseTime) {
//       // Добавляем время, проведенное на паузе, к totalPausedTime
//       const timePaused = Date.now() - pauseTime;
//       setTotalPausedTime((prev) => prev + timePaused);
//       setPauseTime(null);
//     }
//   };

//   const stop = () => {
//     setStartTime(null);
//     setPauseTime(null);
//     // Не обнуляем elapsed, чтобы сохранить для модального окна
//   };

//   const pause = () => {
//     if (paused) {
//       resume(); // Возобновляем таймер, если уже на паузе
//     } else {
//       // Приостанавливаем таймер
//       setPauseTime(Date.now());
//     }
//   };

//   return { currentTime, elapsed, start, stop, pause, resume };
// }
// "use client";
// import { beep } from "@/shared/lib/beep";
// import { formatIntervalWithPastTense } from "@/shared/lib/pluralize";
// import { speak } from "@/shared/lib/speak";
// import { useEffect, useState } from "react";

// export function useTimer(
//   intervalMinutes: number,
//   mode: "speech" | "beep" | "off",
//   running: boolean,
// ) {
//   const [lastSpeakTime, setLastSpeakTime] = useState<number>(Date.now());
//   const [currentTime, setCurrentTime] = useState<string>("");
//   const [startTime, setStartTime] = useState<number | null>(null);
//   const [elapsed, setElapsed] = useState<number>(0);

//   useEffect(() => {
//     const timer = setInterval(() => {
//       const now = new Date();
//       setCurrentTime(now.toLocaleTimeString("ru-RU"));

//       if (running && startTime) {
//         setElapsed(Date.now() - startTime);
//       }
//     }, 1000);

//     return () => clearInterval(timer);
//   }, [running, startTime]);

//   useEffect(() => {
//     if (!running) return;

//     const interval = setInterval(() => {
//       const now = Date.now();
//       const diffMinutes = Math.floor((now - lastSpeakTime) / 60000);

//       if (diffMinutes >= intervalMinutes) {
//         const nowDate = new Date();
//         const timeStr = nowDate.toLocaleTimeString("ru-RU", {
//           hour: "2-digit",
//           minute: "2-digit",
//         });

//         const intervalStr = formatIntervalWithPastTense(intervalMinutes);

//         if (mode === "speech") {
//           speak(`${intervalStr}. Сейчас ${timeStr}`);
//         } else if (mode === "beep") {
//           beep();
//         }

//         setLastSpeakTime(now);
//       }
//     }, 1000);

//     return () => clearInterval(interval);
//   }, [intervalMinutes, lastSpeakTime, running, mode]);

//   const start = () => {
//     setStartTime(Date.now());
//     setLastSpeakTime(Date.now());
//   };

//   const stop = () => {
//     setStartTime(null);
//     setElapsed(0);
//   };

//   return { currentTime, elapsed, start, stop };
// }

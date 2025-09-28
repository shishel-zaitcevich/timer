"use client";
import { beep } from "@/shared/lib/beep";
import { formatIntervalWithPastTense } from "@/shared/lib/pluralize";
import { speak } from "@/shared/lib/speak";
import { useEffect, useState, useRef } from "react";

export function useTimer(
  intervalMinutes: number,
  mode: "speech" | "beep" | "off",
  running: boolean,
  paused: boolean,
) {
  const [lastSpeakTime, setLastSpeakTime] = useState<number>(Date.now());
  const [currentTime, setCurrentTime] = useState<string>("");
  const [startTime, setStartTime] = useState<number | null>(null);
  const [elapsed, setElapsed] = useState<number>(0);
  const [pauseTime, setPauseTime] = useState<number | null>(null);
  const [totalPausedTime, setTotalPausedTime] = useState<number>(0);
  const workerRef = useRef<Worker | null>(null);

  // Запрашиваем разрешение на уведомления при монтировании
  useEffect(() => {
    if (typeof window !== "undefined" && "Notification" in window) {
      Notification.requestPermission().then((permission) => {
        if (permission === "granted") {
          console.log("Разрешение на уведомления получено");
        } else {
          console.warn("Разрешение на уведомления отклонено");
        }
      });
    }
  }, []);

  // Инициализация Web Worker или резервный механизм
  useEffect(() => {
    if (typeof window !== "undefined" && typeof Worker !== "undefined") {
      try {
        workerRef.current = new Worker("/timerWorker.js");
        workerRef.current.onmessage = (e) => {
          const { type, data } = e.data;
          if (type === "tick") {
            setCurrentTime(data.currentTime);
            if (running && !paused && startTime) {
              const newElapsed = data.now - startTime - totalPausedTime;
              setElapsed(newElapsed);
              console.log('useTimer tick:', {
                elapsed: newElapsed,
                seconds: Math.floor(newElapsed / 1000),
                totalPausedTime,
                startTime,
                now: data.now,
              });
            }
          } else if (type === "notification") {
            const { now, timeStr, intervalStr } = data;
            if (mode === "speech") {
              speak(`${intervalStr}. Сейчас ${timeStr}`);
              if (typeof window !== "undefined" && "Notification" in window && Notification.permission === "granted") {
                new Notification("Таймер", { body: `${intervalStr}. Сейчас ${timeStr}` });
              }
            } else if (mode === "beep") {
              beep();
              if (typeof window !== "undefined" && "Notification" in window && Notification.permission === "granted") {
                new Notification("Таймер", { body: "Бип!" });
              }
            }
            setLastSpeakTime(now);
          }
        };

        return () => {
          workerRef.current?.terminate();
        };
      } catch (error) {
        console.error('Инициализация Web Worker не удалась:', error);
        // Резервный механизм с setInterval
        const timer = setInterval(() => {
          const now = Date.now();
          setCurrentTime(new Date().toLocaleTimeString("ru-RU"));
          if (running && !paused && startTime) {
            const newElapsed = now - startTime - totalPausedTime;
            setElapsed(newElapsed);
            console.log('useTimer резервный tick:', {
              elapsed: newElapsed,
              seconds: Math.floor(newElapsed / 1000),
              totalPausedTime,
              startTime,
              now,
            });
          }
        }, 1000);

        const notificationInterval = setInterval(() => {
          if (running && !paused) {
            const now = Date.now();
            const diffMinutes = Math.floor((now - lastSpeakTime) / 60000);
            if (diffMinutes >= intervalMinutes) {
              const timeStr = new Date().toLocaleTimeString("ru-RU", {
                hour: "2-digit",
                minute: "2-digit",
              });
              const intervalStr = formatIntervalWithPastTense(intervalMinutes);
              if (mode === "speech") {
                speak(`${intervalStr}. Сейчас ${timeStr}`);
                if (typeof window !== "undefined" && "Notification" in window && Notification.permission === "granted") {
                  new Notification("Таймер", { body: `${intervalStr}. Сейчас ${timeStr}` });
                }
              } else if (mode === "beep") {
                beep();
                if (typeof window !== "undefined" && "Notification" in window && Notification.permission === "granted") {
                  new Notification("Таймер", { body: "Бип!" });
                }
              }
              setLastSpeakTime(now);
            }
          }
        }, 1000);

        return () => {
          clearInterval(timer);
          clearInterval(notificationInterval);
        };
      }
    }
  }, [running, paused, startTime, totalPausedTime, mode, intervalMinutes]);

  // Синхронизация состояния с Web Worker
  useEffect(() => {
    if (workerRef.current) {
      workerRef.current.postMessage({
        running,
        paused,
        intervalMinutes,
        lastSpeakTime,
      });
    }
  }, [running, paused, intervalMinutes, lastSpeakTime]);

  const start = () => {
    setElapsed(0);
    setStartTime(Date.now());
    setLastSpeakTime(Date.now());
    setPauseTime(null);
    setTotalPausedTime(0);
  };

  const resume = () => {
    if (pauseTime) {
      const timePaused = Date.now() - pauseTime;
      setTotalPausedTime((prev) => prev + timePaused);
      setPauseTime(null);
    }
  };

  const stop = () => {
    setStartTime(null);
    setPauseTime(null);
  };

  const pause = () => {
    if (paused) {
      resume();
    } else {
      setPauseTime(Date.now());
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
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

  // Инициализация Web Worker
  useEffect(() => {
    if (typeof window !== "undefined") {
      workerRef.current = new Worker(new URL("./timerWorker.ts", import.meta.url));
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
          } else if (mode === "beep") {
            beep();
          }
          setLastSpeakTime(now);
        }
      };

      return () => {
        workerRef.current?.terminate();
      };
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
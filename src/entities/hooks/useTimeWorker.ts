'use client';

import { useEffect, useRef, useState } from 'react';
import { beep } from '@/shared/lib/beep';
import { speak } from '@/shared/lib/speak';
import { formatIntervalWithPastTense } from '@/shared/lib/pluralize';

export function useTimerWorker(
  intervalMinutes: number,
  mode: 'speech' | 'beep' | 'off',
  running: boolean,
  paused: boolean,
) {
  const [currentTime, setCurrentTime] = useState<string>('');
  const [elapsed, setElapsed] = useState<number>(0);
  const workerRef = useRef<Worker | null>(null);
  const startTimeRef = useRef<number | null>(null);
  const pausedTimeRef = useRef<number>(0);
  const pauseStartRef = useRef<number | null>(null);

  useEffect(() => {
    if (!running) return;

    const worker = new Worker(new URL('/timerWorker.js', import.meta.url));
    workerRef.current = worker;

    worker.postMessage({
      running,
      intervalMinutes,
      startTime: startTimeRef.current || Date.now(),
    });

    worker.onmessage = (e) => {
      if (e.data.type === 'tick') {
        setCurrentTime(e.data.data.currentTime);

        if (!paused && startTimeRef.current) {
          setElapsed(Date.now() - startTimeRef.current - pausedTimeRef.current);
        }
      }

      if (e.data.type === 'notification' && !paused) {
        const { timeStr, intervalStr } = e.data.data;
        const formatted = formatIntervalWithPastTense(intervalMinutes);

        if (mode === 'speech') {
          speak(`${formatted}. Сейчас ${timeStr}`).catch(console.error);
        } else if (mode === 'beep') {
          beep();
        }
      }
    };

    return () => {
      worker.terminate();
      workerRef.current = null;
    };
  }, [running, intervalMinutes, paused, mode]);

  const start = () => {
    startTimeRef.current = Date.now();
    pausedTimeRef.current = 0;
    pauseStartRef.current = null;
    setElapsed(0);
  };

  const stop = () => {
    startTimeRef.current = null;
    pauseStartRef.current = null;
  };

  const pause = () => {
    if (!pauseStartRef.current) {
      pauseStartRef.current = Date.now();
    } else {
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

'use client';
import { beep } from '@/shared/lib/beep';
import { speak } from '@/shared/lib/speak';
import { useEffect, useState, useRef } from 'react';

export function useTimer(
  intervalMinutes: number,
  mode: 'speech' | 'beep' | 'off',
  running: boolean,
  paused: boolean,
) {
  const [currentTime, setCurrentTime] = useState<string>('');
  const [elapsed, setElapsed] = useState<number>(0);
  const [startTime, setStartTime] = useState<number | null>(null);

  const workerRef = useRef<Worker | null>(null);
  const isSpeakingRef = useRef(false);

  useEffect(() => {
    if (!running) {
      if (workerRef.current) {
        workerRef.current.terminate();
        workerRef.current = null;
      }
      return;
    }

    workerRef.current = new Worker('/timerWorker.js');
    workerRef.current.postMessage({ running, intervalMinutes, startTime });

    workerRef.current.onmessage = (e) => {
      const { type, data } = e.data;

      if (type === 'tick') {
        setCurrentTime(data.currentTime);
        setElapsed(data.now - (startTime ?? data.now));
      }

      if (type === 'notification' && !isSpeakingRef.current) {
        isSpeakingRef.current = true;

        if (mode === 'speech') {
          speak(`${data.intervalStr}. Сейчас ${data.timeStr}`).finally(
            () => (isSpeakingRef.current = false),
          );
        } else if (mode === 'beep') {
          beep();
          isSpeakingRef.current = false;
        } else {
          isSpeakingRef.current = false;
        }
      }
    };

    return () => {
      workerRef.current?.terminate();
      workerRef.current = null;
    };
  }, [running, intervalMinutes, mode, startTime]);

  const start = () => {
    const now = Date.now();
    setStartTime(now);
    setElapsed(0);
  };

  const stop = () => {
    setStartTime(null);
  };

  const pause = () => {}; // можно доработать по аналогии с твоим кодом
  const resume = () => {};

  return { currentTime, elapsed, start, stop, pause, resume };
}

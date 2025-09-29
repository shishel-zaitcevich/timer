import { useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { formatTime } from '@/entities/time/lib/formatTime';
import s from './TimeDisplay.module.scss';

interface TimeDisplayProps {
  elapsed: number;
  running: boolean;
  paused: boolean;
}

export default function TimeDisplay({ elapsed, running, paused }: TimeDisplayProps) {
  // Используем formatTime только если таймер работает, иначе "00:00"
  const formattedTime = running && !paused ? formatTime(elapsed) : '00:00';

  // Отладочный вывод
  // console.log('TimeDisplay props:', {
  //   elapsed,
  //   running,
  //   paused,
  //   formattedTime,
  // });

  const timeDigits = useMemo(() => {
    // Преобразуем elapsed (в миллисекундах) в часы, минуты, секунды
    const totalSeconds = Math.floor(elapsed / 1000);
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;

    const digits = [
      ...minutes.toString().padStart(2, '0'),
      ':',
      ...seconds.toString().padStart(2, '0'),
    ];

    if (hours > 0) {
      return [...hours.toString().padStart(2, '0'), ':', ...digits];
    }
    return digits;
  }, [elapsed]);

  return (
    <span className={s.timeDisplay}>
      <AnimatePresence mode="popLayout">
        {timeDigits.map((digit, index) => (
          <motion.span
            key={`${index}-${digit}`}
            className={s.digit}
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -20, opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            {digit}
          </motion.span>
        ))}
      </AnimatePresence>
    </span>
  );
}

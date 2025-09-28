import { motion, AnimatePresence } from 'framer-motion';
import s from './TimeSummaryModal.module.scss';

interface TimeSummaryModalProps {
  isOpen: boolean;
  onClose: () => void;
  elapsed: number;
}

export default function TimeSummaryModal({
  isOpen,
  onClose,
  elapsed,
}: TimeSummaryModalProps) {
  // Преобразуем elapsed (в миллисекундах) в формат HH:MM:SS или MM:SS
  const formatElapsedTime = (ms: number): string => {
    const totalSeconds = Math.floor(ms / 1000);
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;

    if (hours > 0) {
      return `${hours.toString().padStart(2, '0')}:${minutes
        .toString()
        .padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    }
    return `${minutes.toString().padStart(2, '0')}:${seconds
      .toString()
      .padStart(2, '0')}`;
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className={s.modalOverlay}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
        >
          <motion.div
            className={s.modalContent}
            initial={{ scale: 0.8, y: 50, opacity: 0 }}
            animate={{ scale: 1, y: 0, opacity: 1 }}
            exit={{ scale: 0.8, y: 50, opacity: 0 }}
            transition={{ duration: 0.3, ease: 'easeOut' }}
          >
            <h2 className={s.title}>Время работы таймера</h2>
            <p className={s.time}>
              Потраченное время: <span>{formatElapsedTime(elapsed)}</span>
            </p>
            <button className={s.closeButton} onClick={onClose}>
              Закрыть
            </button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

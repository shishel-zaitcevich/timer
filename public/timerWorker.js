// Встроенная функция formatIntervalWithPastTense
function formatIntervalWithPastTense(minutes) {
  const lastDigit = minutes % 10;
  const lastTwoDigits = minutes % 100;

  if (lastTwoDigits >= 11 && lastTwoDigits <= 19) {
    return ` ${minutes} минут`;
  }
  if (lastDigit === 1) {
    return ` ${minutes} минута`;
  }
  if (lastDigit >= 2 && lastDigit <= 4) {
    return `${minutes} минуты`;
  }
  return `${minutes} минут`;
}

let intervalId = null;
let lastNotificationTime = null;
let workerStartTime = null;

self.onmessage = (e) => {
  const { running, intervalMinutes, startTime } = e.data;
  console.log('[Worker] Получено сообщение:', { running, intervalMinutes, startTime });

  // Очищаем предыдущий интервал
  if (intervalId) {
    clearInterval(intervalId);
    intervalId = null;
  }

  if (running && startTime) {
    workerStartTime = startTime;
    lastNotificationTime = startTime; // Устанавливаем время последнего уведомления при старте

    const tick = () => {
      const now = Date.now();
      const currentTime = new Date().toLocaleTimeString('ru-RU');

      // Отправляем обновление времени
      self.postMessage({ type: 'tick', data: { currentTime, now } });

      // Проверка интервала для уведомления
      if (intervalMinutes > 0) {
        const timeSinceLastNotification = now - lastNotificationTime;
        const shouldNotify = timeSinceLastNotification >= intervalMinutes * 60000;

        console.log('[Worker] Проверка уведомления:', {
          now,
          lastNotificationTime,
          timeSinceLastNotification: Math.floor(timeSinceLastNotification / 1000),
          intervalMinutes,
          shouldNotify,
        });

        if (shouldNotify) {
          const timeStr = new Date().toLocaleTimeString('ru-RU', {
            hour: '2-digit',
            minute: '2-digit',
          });
          const intervalStr = formatIntervalWithPastTense(intervalMinutes);

          console.log('[Worker] Отправка уведомления:', { timeStr, intervalStr });

          self.postMessage({
            type: 'notification',
            data: { now, timeStr, intervalStr },
          });

          lastNotificationTime = now; // Обновляем время последнего уведомления
        }
      }
    };

    // Запускаем интервал
    intervalId = setInterval(tick, 1000);
    // Выполняем первый тик сразу
    tick();
  } else {
    // Сброс состояния при остановке
    workerStartTime = null;
    lastNotificationTime = null;
  }
};

// Очистка при завершении
self.onclose = () => {
  if (intervalId) {
    clearInterval(intervalId);
  }
  console.log('[Worker] Web Worker завершен');
};

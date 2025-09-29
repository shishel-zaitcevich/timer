function formatIntervalWithPastTense(minutes) {
  const lastDigit = minutes % 10;
  const lastTwoDigits = minutes % 100;

  if (lastTwoDigits >= 11 && lastTwoDigits <= 19) {
    return `${minutes} минут`;
  }
  if (lastDigit === 1) {
    return `${minutes} минута`;
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

  if (intervalId) {
    clearInterval(intervalId);
    intervalId = null;
  }

  if (running && startTime) {
    workerStartTime = startTime;
    lastNotificationTime = startTime;

    const tick = () => {
      const now = Date.now();
      const currentTime = new Date().toLocaleTimeString('ru-RU');

      // отправляем текущее время
      self.postMessage({ type: 'tick', data: { currentTime, now } });

      // проверяем интервал
      if (intervalMinutes > 0) {
        const timeSinceLastNotification = now - lastNotificationTime;
        const shouldNotify = timeSinceLastNotification >= intervalMinutes * 60000;

        if (shouldNotify) {
          const timeStr = new Date().toLocaleTimeString('ru-RU', {
            hour: '2-digit',
            minute: '2-digit',
          });
          const intervalStr = formatIntervalWithPastTense(intervalMinutes);

          self.postMessage({
            type: 'notification',
            data: { now, timeStr, intervalStr },
          });

          lastNotificationTime = now;
        }
      }
    };

    intervalId = setInterval(tick, 1000);
    tick();
  } else {
    workerStartTime = null;
    lastNotificationTime = null;
  }
};

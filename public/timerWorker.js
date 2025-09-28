// Встроенная функция formatIntervalWithPastTense
function formatIntervalWithPastTense(minutes) {
  const lastDigit = minutes % 10;
  const lastTwoDigits = minutes % 100;

  if (lastTwoDigits >= 11 && lastTwoDigits <= 19) {
    return `${minutes} минут назад`;
  }
  if (lastDigit === 1) {
    return `${minutes} минута назад`;
  }
  if (lastDigit >= 2 && lastDigit <= 4) {
    return `${minutes} минуты назад`;
  }
  return `${minutes} минут назад`;
}

self.onmessage = (e) => {
  const { running, paused, intervalMinutes, lastSpeakTime } = e.data;

  const tick = () => {
    const now = Date.now();
    const currentTime = new Date().toLocaleTimeString("ru-RU");

    // Обновление времени
    self.postMessage({ type: "tick", data: { currentTime, now } });

    // Проверка интервала для уведомления
    if (running && !paused) {
      const diffMinutes = Math.floor((now - lastSpeakTime) / 60000);
      if (diffMinutes >= intervalMinutes) {
        const timeStr = new Date().toLocaleTimeString("ru-RU", {
          hour: "2-digit",
          minute: "2-digit",
        });
        const intervalStr = formatIntervalWithPastTense(intervalMinutes);
        self.postMessage({ type: "notification", data: { now, timeStr, intervalStr } });
      }
    }
  };

  // Запускаем интервал
  const intervalId = setInterval(tick, 1000);

  // Очищаем интервал при завершении
  self.onclose = () => {
    clearInterval(intervalId);
  };
};
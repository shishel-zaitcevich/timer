import { formatIntervalWithPastTense } from "@/shared/lib/pluralize";

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
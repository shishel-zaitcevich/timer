// export function speak(text: string) {
//   if (typeof window !== "undefined" && "speechSynthesis" in window) {
//     const utterance = new SpeechSynthesisUtterance(text);
//     utterance.lang = "ru-RU";
//     window.speechSynthesis.speak(utterance);
//   }
// }

export function speak(text: string) {
  if (typeof window !== "undefined" && "speechSynthesis" in window) {
    try {
      // Отменяем предыдущие воспроизведения, чтобы избежать наложения
      window.speechSynthesis.cancel();

      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = "ru-RU";

      // Настраиваем голос (если доступен)
      const voices = window.speechSynthesis.getVoices();
      const ruVoice = voices.find((voice) => voice.lang === "ru-RU");
      if (ruVoice) {
        utterance.voice = ruVoice;
      }

      // Устанавливаем громкость и скорость
      utterance.volume = 1.0;
      utterance.rate = 1.0;
      utterance.pitch = 1.0;

      // Обработка ошибок
      utterance.onerror = (event) => {
        console.error('SpeechSynthesis error:', event);
      };

      window.speechSynthesis.speak(utterance);
    } catch (error) {
      console.error('SpeechSynthesis failed:', error);
    }
  } else {
    console.warn('SpeechSynthesis not supported in this browser');
  }
}

// Загружаем голоса асинхронно (для мобильных устройств)
if (typeof window !== "undefined" && "speechSynthesis" in window) {
  window.speechSynthesis.onvoiceschanged = () => {
    const voices = window.speechSynthesis.getVoices();
    console.log('Available voices:', voices);
  };
}
// export function speak(text: string) {
//   if (typeof window !== "undefined" && "speechSynthesis" in window) {
//     const utterance = new SpeechSynthesisUtterance(text);
//     utterance.lang = "ru-RU";
//     window.speechSynthesis.speak(utterance);
//   }
// }

// export function speak(text: string): Promise<void> {
//   return new Promise((resolve, reject) => {
//     if (typeof window !== "undefined" && "speechSynthesis" in window) {
//       try {
//         // Отменяем предыдущие воспроизведения
//         window.speechSynthesis.cancel();

//         const utterance = new SpeechSynthesisUtterance(text);
//         utterance.lang = "ru-RU";

//         // Получаем голоса
//         let voices = window.speechSynthesis.getVoices();

//         // Если голоса еще не загружены, ждем их загрузки
//         if (voices.length === 0) {
//           const loadVoices = () => {
//             voices = window.speechSynthesis.getVoices();
//             if (voices.length > 0) {
//               setupVoice();
//             } else {
//               // Если голоса так и не загрузились, используем настройки по умолчанию
//               console.warn('Голоса не найдены, используем настройки по умолчанию');
//               speakWithDefaultSettings();
//             }
//           };

//           window.speechSynthesis.addEventListener('voiceschanged', loadVoices, { once: true });

//           // Таймаут на случай, если событие не сработает
//           setTimeout(() => {
//             window.speechSynthesis.removeEventListener('voiceschanged', loadVoices);
//             loadVoices();
//           }, 1000);
//         } else {
//           setupVoice();
//         }

//         function setupVoice() {
//           // Приоритет голосов для разных платформ
//           const preferredVoices = [
//             'Microsoft Irina Desktop - Russian',  // Windows
//             'Microsoft Pavel Desktop - Russian',  // Windows
//             'Milena',                             // macOS
//             'Yuri',                               // macOS
//             'русский',                            // Android
//             'ru-RU',                              // Общий
//           ];

//           let selectedVoice = null;

//           // Ищем подходящий русский голос
//           for (const preferred of preferredVoices) {
//             selectedVoice = voices.find(voice =>
//               voice.name.includes(preferred) ||
//               voice.lang.startsWith('ru')
//             );
//             if (selectedVoice) break;
//           }

//           // Если не найден специфичный голос, берем любой русский
//           if (!selectedVoice) {
//             selectedVoice = voices.find(voice => voice.lang.startsWith('ru'));
//           }

//           if (selectedVoice) {
//             utterance.voice = selectedVoice;
//             console.log('Выбран голос:', selectedVoice.name, selectedVoice.lang);
//           } else {
//             console.warn('Русский голос не найден, используем голос по умолчанию');
//           }

//           speakWithDefaultSettings();
//         }

//         function speakWithDefaultSettings() {
//           // Настройки для разных платформ
//           const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
//           const isAndroid = /Android/.test(navigator.userAgent);
//           const isMobile = isIOS || isAndroid;

//           // Настройки параметров речи
//           utterance.volume = 1.0;
//           utterance.rate = isMobile ? 0.9 : 1.0; // Немного медленнее на мобильных
//           utterance.pitch = 1.0;

//           // Обработка событий
//           utterance.onend = () => {
//             console.log('SpeechSynthesis: Воспроизведение завершено:', text);
//             resolve();
//           };

//           utterance.onerror = (event) => {
//             console.error('Ошибка SpeechSynthesis:', event);

//             // На мобильных устройствах иногда происходят ложные ошибки
//             if (isMobile && event.error === 'not-allowed') {
//               console.log('Возможно ложная ошибка на мобильном устройстве, считаем успешным');
//               resolve();
//             } else {
//               reject(event);
//             }
//           };

//           // Дополнительная защита для мобильных устройств
//           if (isMobile) {
//             // Таймаут на случай, если события не сработают
//             const timeout = setTimeout(() => {
//               console.log('Таймаут воспроизведения речи, считаем успешным');
//               resolve();
//             }, Math.max(text.length * 100, 3000)); // Минимум 3 секунды

//             const originalOnEnd = utterance.onend;
//             const originalOnError = utterance.onerror;

//             utterance.onend = (event) => {
//               clearTimeout(timeout);
//               if (originalOnEnd) originalOnEnd.call(utterance, event);
//             };

//             utterance.onerror = (event) => {
//               clearTimeout(timeout);
//               if (originalOnError) originalOnError.call(utterance, event);
//             };
//           }

//           // Воспроизведение
//           window.speechSynthesis.speak(utterance);

//           // Дополнительная проверка для iOS Safari
//           if (isIOS) {
//             // Иногда на iOS нужно "толкнуть" синтезатор
//             setTimeout(() => {
//               if (window.speechSynthesis.paused) {
//                 window.speechSynthesis.resume();
//               }
//             }, 100);
//           }
//         }

//       } catch (error) {
//         console.error('Не удалось выполнить SpeechSynthesis:', error);
//         reject(error);
//       }
//     } else {
//       console.warn('SpeechSynthesis не поддерживается в этом браузере');
//       reject(new Error('SpeechSynthesis не поддерживается'));
//     }
//   });
// }

// // Предварительная загрузка голосов
// if (typeof window !== "undefined" && "speechSynthesis" in window) {
//   // Принудительно загружаем голоса при инициализации
//   const loadVoices = () => {
//     const voices = window.speechSynthesis.getVoices();
//     console.log('Доступные голоса загружены:', voices.length);
//     voices.forEach(voice => {
//       if (voice.lang.startsWith('ru')) {
//         console.log('Русский голос:', voice.name, voice.lang);
//       }
//     });
//   };

//   // Загружаем голоса сразу
//   loadVoices();

//   // И подписываемся на событие загрузки
//   window.speechSynthesis.addEventListener('voiceschanged', loadVoices);

//   // Предотвращение автоматической паузы в некоторых браузерах
//   document.addEventListener('visibilitychange', () => {
//     if (!document.hidden && window.speechSynthesis.paused) {
//       window.speechSynthesis.resume();
//     }
//   });
// }

export function speak(text: string) {
  if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
    try {
      // Отменяем предыдущие воспроизведения, чтобы избежать наложения
      window.speechSynthesis.cancel();

      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'ru-RU';

      // Настраиваем голос (если доступен)
      const voices = window.speechSynthesis.getVoices();
      const ruVoice = voices.find((voice) => voice.lang === 'ru-RU');
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
if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
  window.speechSynthesis.onvoiceschanged = () => {
    const voices = window.speechSynthesis.getVoices();
    console.log('Available voices:', voices);
  };
}

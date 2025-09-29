// Сервис для управления уведомлениями, звуками и озвучкой

type NotificationMode = 'speech' | 'beep' | 'off';

class NotificationService {
  private audioContext: AudioContext | null = null;
  private isDocumentVisible = true;

  constructor() {
    if (typeof window !== 'undefined') {
      // Отслеживаем видимость документа
      document.addEventListener('visibilitychange', () => {
        this.isDocumentVisible = !document.hidden;
      });

      // Инициализируем AudioContext при первом взаимодействии
      const initAudio = () => {
        if (!this.audioContext) {
          this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
        }
        document.removeEventListener('click', initAudio);
        document.removeEventListener('touchstart', initAudio);
      };
      document.addEventListener('click', initAudio);
      document.addEventListener('touchstart', initAudio);
    }
  }

  // Проигрывание звукового сигнала
  async playBeep(frequency = 800, duration = 500) {
    try {
      if (!this.audioContext) {
        this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      }

      const oscillator = this.audioContext.createOscillator();
      const gainNode = this.audioContext.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(this.audioContext.destination);

      oscillator.frequency.value = frequency;
      oscillator.type = 'sine';

      // Плавное затухание
      gainNode.gain.setValueAtTime(0.3, this.audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(
        0.01,
        this.audioContext.currentTime + duration / 1000,
      );

      oscillator.start(this.audioContext.currentTime);
      oscillator.stop(this.audioContext.currentTime + duration / 1000);

      return true;
    } catch (error) {
      console.error('Ошибка воспроизведения звука:', error);
      return false;
    }
  }

  // Озвучка текста
  async speak(text: string) {
    try {
      if (!('speechSynthesis' in window)) {
        console.warn('Speech Synthesis не поддерживается');
        return false;
      }

      // Останавливаем предыдущую озвучку
      window.speechSynthesis.cancel();

      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'ru-RU';
      utterance.rate = 1;
      utterance.pitch = 1;
      utterance.volume = 1;

      return new Promise<boolean>((resolve) => {
        utterance.onend = () => resolve(true);
        utterance.onerror = (error) => {
          console.error('Ошибка озвучки:', error);
          resolve(false);
        };

        window.speechSynthesis.speak(utterance);
      });
    } catch (error) {
      console.error('Ошибка Speech Synthesis:', error);
      return false;
    }
  }

  // Отправка Push-уведомления
  async sendPushNotification(
    title: string,
    body: string,
    options?: {
      requireInteraction?: boolean;
      vibrate?: number[];
      sound?: string;
    },
  ) {
    try {
      const response = await fetch('/api/send-notification', {
        method: 'POST',
        body: JSON.stringify({
          title,
          body,
          options: {
            requireInteraction: options?.requireInteraction ?? true,
            vibrate: options?.vibrate ?? [200, 100, 200],
            sound: options?.sound ?? '/notification-sound.mp3',
          },
        }),
        headers: { 'Content-Type': 'application/json' },
      });

      return response.ok;
    } catch (error) {
      console.error('Ошибка отправки push:', error);
      return false;
    }
  }

  // Основной метод уведомления
  async notify(title: string, body: string, mode: NotificationMode) {
    if (mode === 'off') return;

    const isBackground = !this.isDocumentVisible;

    // Если документ в фоне - всегда отправляем push
    if (isBackground) {
      await this.sendPushNotification(title, body, {
        requireInteraction: true,
        vibrate: [200, 100, 200, 100, 200],
      });
      return;
    }

    // Если документ активен - используем звук/озвучку
    if (mode === 'beep') {
      await this.playBeep(800, 500);
      // Дополнительно показываем локальное уведомление
      this.showLocalNotification(title, body);
    } else if (mode === 'speech') {
      await this.speak(body);
      // Дополнительно показываем локальное уведомление
      this.showLocalNotification(title, body);
    }

    // На мобильных всегда дублируем push для надёжности
    if (this.isMobile()) {
      await this.sendPushNotification(title, body);
    }
  }

  // Локальное уведомление (без Service Worker)
  private showLocalNotification(title: string, body: string) {
    if ('Notification' in window && Notification.permission === 'granted') {
      try {
        new Notification(title, {
          body,
          icon: '/icon-192x192.png',
          badge: '/badge-72x72.png',
          tag: 'timer-notification',
          requireInteraction: false,
        });
      } catch (error) {
        console.warn('Локальное уведомление не сработало:', error);
      }
    }
  }

  // Проверка на мобильное устройство
  private isMobile(): boolean {
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
      navigator.userAgent,
    );
  }

  // Тестовый метод
  async test(mode: NotificationMode) {
    console.log('Тест уведомления, режим:', mode);
    await this.notify('🧪 Тестовое уведомление', 'Это проверка работы уведомлений', mode);
  }
}

export const notificationService = new NotificationService();

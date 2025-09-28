let audioCtx: AudioContext | null = null;

export function beep(duration = 200, frequency = 440, volume = 1) {
  if (typeof window === "undefined") return;

  if (!audioCtx) {
    const AudioCtx =
      window.AudioContext ||
      (window as typeof window & { webkitAudioContext: typeof AudioContext })
        .webkitAudioContext;

    audioCtx = new AudioCtx();
  }

  const oscillator = audioCtx.createOscillator();
  const gainNode = audioCtx.createGain();

  oscillator.connect(gainNode);
  gainNode.connect(audioCtx.destination);

  oscillator.type = "sine";
  oscillator.frequency.value = frequency;
  gainNode.gain.value = volume;

  oscillator.start();

  setTimeout(() => {
    oscillator.stop();
  }, duration);
}
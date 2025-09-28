export function speak(text: string) {
  if (typeof window !== "undefined" && "speechSynthesis" in window) {
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = "ru-RU";
    window.speechSynthesis.speak(utterance);
  }
}
export function formatTime(ms: number): string {
  const totalSeconds = Math.floor(ms / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  return [
    hours > 0 ? `${hours}ч` : "",
    minutes > 0 ? `${minutes}м` : "",
    `${seconds}с`,
  ]
    .filter(Boolean)
    .join(" ");
}



// export function formatTime(elapsed: number): string {
//   if (isNaN(elapsed) || elapsed < 0) {
//     console.warn('Invalid elapsed value:', elapsed);
//     return '00:00';
//   }
//   const minutes = Math.floor(elapsed / 60);
//   const seconds = elapsed % 60;
//   return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
// }
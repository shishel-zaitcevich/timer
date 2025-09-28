
export function pluralize(
  num: number,
  one: string,
  few: string,
  many: string,
): string {
  const mod10 = num % 10;
  const mod100 = num % 100;

  if (mod100 >= 11 && mod100 <= 14) {
    return many;
  }
  if (mod10 === 1) {
    return one;
  }
  if (mod10 >= 2 && mod10 <= 4) {
    return few;
  }
  return many;
}

export function getPastTenseForm(minutes: number): string {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;

  // Если есть и часы, и минуты - ориентируемся на последнее слово (минуты)
  if (hours > 0 && mins > 0) {
    return pluralize(mins, "прошла", "прошли", "прошло");
  }
  
  // Если только часы
  if (hours > 0 && mins === 0) {
    return pluralize(hours, "прошёл", "прошли", "прошло");
  }
  
  // Если только минуты
  if (hours === 0 && mins > 0) {
    return pluralize(mins, "прошла", "прошли", "прошло");
  }
  
  // Fallback
  return "прошло";
}

export function formatInterval(minutes: number): string {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;

  const parts: string[] = [];

  if (hours > 0) {
    const hoursWord = pluralize(hours, "час", "часа", "часов");
    parts.push(`${hours} ${hoursWord}`);
  }

  if (mins > 0) {
    const minutesWord = pluralize(mins, "минута", "минуты", "минут");
    parts.push(`${mins} ${minutesWord}`);
  }

  return parts.join(" ");
}

// export function formatIntervalWithPastTense(minutes: number): string {
//   const lastDigit = minutes % 10;
//   const lastTwoDigits = minutes % 100;

//   if (lastTwoDigits >= 11 && lastTwoDigits <= 19) {
//     return `${minutes} минут назад`;
//   }
//   if (lastDigit === 1) {
//     return `${minutes} минута назад`;
//   }
//   if (lastDigit >= 2 && lastDigit <= 4) {
//     return `${minutes} минуты назад`;
//   }
//   return `${minutes} минут назад`;
// }

export function formatIntervalWithPastTense(minutes: number): string {
  const pastTense = getPastTenseForm(minutes);
  const interval = formatInterval(minutes);
  return `${pastTense} ${interval}`;
}
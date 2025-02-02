function padZero(num: number) {
  return num < 10 ? `0${num}` : num;
}

export function formatDateString(date: Date) {
  const month = padZero(date.getMonth() + 1);
  const day = padZero(date.getDate());
  const year = padZero(date.getFullYear() % 100);
  return `${month}/${day}/${year}`;
}

export function datePercentInRange(date: number, min = 0, max = 1) {
  return Math.min(max, Math.max(min, date));
}

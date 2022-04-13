export function convertDateTo10DigitsTimestamp(date: Date): number {
  const timestamp = date.getTime();
  const convertedTimestamp = timestamp.toString().slice(0, 10);
  return parseInt(convertedTimestamp);
}

export function convert10DigitsTimestampToDate(timestamp: number): Date {
  const convertedTimestamp = timestamp * 1000;
  const convertedDate = new Date(convertedTimestamp);
  return convertedDate;
}

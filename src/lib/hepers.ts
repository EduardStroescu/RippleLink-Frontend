export const adaptTimezone = (date: string, timezone: string) => {
  const utcDate = new Date(date);
  const localDate = utcDate.toLocaleString(timezone).split(",")[1];
  return localDate;
};

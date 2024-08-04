export const adaptTimezone = (date?: string, timezone?: string) => {
  if (!date) return "";
  if (!timezone) throw new Error("Timezone is required");

  const utcDate = new Date(date);
  const localDate = utcDate.toLocaleString(timezone).split(",")[1];
  return localDate;
};

const IST_OFFSET_MINUTES = 330; // UTC+05:30 (India)

export const getExpiredMatchIds = (matches, dateField, timeField) => {
  const expiredIds = [];
  const now = new Date();

  for (const match of matches) {
    // Skip already completed/cancelled matches
    if (match.status !== "open") continue;

    // PostgreSQL DATE comes as a Date object at UTC midnight
    const date = new Date(match[dateField]);

    // TIME comes as a string: HH:MM:SS
    const [hours, minutes, seconds] = match[timeField].split(":").map(Number);

    // Convert IST time into total minutes
    const istMinutesOfDay = hours * 60 + minutes;

    // Convert IST -> UTC
    const matchDateTime = new Date(
      Date.UTC(
        date.getUTCFullYear(),
        date.getUTCMonth(),
        date.getUTCDate(),
        0,
        istMinutesOfDay - IST_OFFSET_MINUTES,
        seconds,
      ),
    );

    if (matchDateTime <= now) {
      expiredIds.push(match.id);
    }
  }

  return expiredIds;
};

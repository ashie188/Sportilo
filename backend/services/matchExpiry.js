export const getExpiredMatchIds = (matches, dateField, timeField) => {
  const expiredIds = [];
  const now = new Date();

  for (const match of matches) {
    // Skip already completed/cancelled matches
    if (match.status !== "open") continue;

    const matchDateTime = new Date(match[dateField]);

    const [hours, minutes, seconds] = match[timeField].split(":").map(Number);

    matchDateTime.setHours(hours, minutes, seconds, 0);

    if (matchDateTime <= now) {
      expiredIds.push(match.id);
    }
  }

  return expiredIds;
};

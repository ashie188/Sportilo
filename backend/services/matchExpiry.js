export const getExpiredMatchIds = (matches, dateField, timeField) => {
  const expiredIds = [];
  const now = new Date();

  for (const match of matches) {
    // Skip already completed/cancelled matches
    if (match.status !== "open") continue;

    console.log("Date:", match[dateField]);
    console.log("Time:", match[timeField]);

    const matchDateTime = new Date(match[dateField]);

    const [hours, minutes, seconds] = match[timeField].split(":").map(Number);

    matchDateTime.setHours(hours, minutes, seconds, 0);

    console.log("Now:", now);
    console.log("Match:", matchDateTime);
    console.log("Expired:", matchDateTime <= now);

    if (matchDateTime <= now) {
      expiredIds.push(match.id);
    }
  }

  return expiredIds;
};

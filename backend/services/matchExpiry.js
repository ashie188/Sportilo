export const getExpiredMatchIds = (matches, dateField, timeField) => {
  const expiredIds = [];
  const now = new Date();

  for (const match of matches) {
    // Skip already completed/cancelled matches
    if (match.status !== "open") continue;

    const matchDateTime = new Date(match[dateField]);

    const [hours, minutes, seconds] = match[timeField].split(":").map(Number);

    matchDateTime.setHours(hours, minutes, seconds, 0);

    console.log("================================");
    console.log("Match ID:", match.id);
    console.log("Now:", now);
    console.log("Match Date:", match[dateField]);
    console.log("Match Time:", match[timeField]);
    console.log("Match DateTime:", matchDateTime);
    console.log("Status:", match.status);
    console.log("Expired:", matchDateTime <= now);
    console.log("================================");
    if (matchDateTime <= now) {
      expiredIds.push(match.id);
    }
  }

  return expiredIds;
};

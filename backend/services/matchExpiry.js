const IST_OFFSET_MINUTES = 330;

const getDateParts = (value) => {
  if (!value) return null;

  if (value instanceof Date) {
    return {
      year: value.getUTCFullYear(),
      month: value.getUTCMonth() + 1,
      day: value.getUTCDate(),
    };
  }

  const [year, month, day] = String(value).slice(0, 10).split("-").map(Number);

  if (
    !Number.isInteger(year) ||
    !Number.isInteger(month) ||
    !Number.isInteger(day)
  ) {
    return null;
  }
  return { year, month, day };
};

const getTimeParts = (value) => {
  if (!value) return null;

  const [hours, minutes, seconds = 0] = String(value).split(":").map(Number);

  if (
    !Number.isInteger(hours) ||
    !Number.isInteger(minutes) ||
    !Number.isInteger(seconds) ||
    hours < 0 ||
    hours > 23 ||
    minutes < 0 ||
    minutes > 59 ||
    seconds < 0 ||
    seconds > 59
  ) {
    return null;
  }

  return {
    hours,
    minutes,
    seconds,
  };
};

export const getExpiredMatchIds = (matches, dateField, timeField) => {
  const expiredIds = [];

  const nowTimestamp = Date.now();

  for (const match of matches) {
    // Do not process matches that are already finished or cancelled
    if (match.status === "completed" || match.status === "cancelled") {
      continue;
    }

    const dateParts = getDateParts(match[dateField]);
    const timeParts = getTimeParts(match[timeField]);

    if (!dateParts || !timeParts) {
      continue;
    }

    const { year, month, day } = dateParts;
    const { hours, minutes, seconds } = timeParts;

    // Database date/time is interpreted as IST and converted to UTC.
    const matchTimestamp =
      Date.UTC(year, month - 1, day, hours, minutes, seconds) -
      IST_OFFSET_MINUTES * 60 * 1000;

    if (matchTimestamp <= nowTimestamp) {
      expiredIds.push(match.id);
    }
  }

  return expiredIds;
};

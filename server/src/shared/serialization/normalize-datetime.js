const ISO_DATETIME_WITHOUT_TIMEZONE_PATTERN =
  /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d{1,6})?$/;

function isPlainObject(value) {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function normalizeDateTimeString(value) {
  if (!ISO_DATETIME_WITHOUT_TIMEZONE_PATTERN.test(value)) {
    return value;
  }

  return `${value}Z`;
}

export function normalizeDateTimes(value) {
  if (Array.isArray(value)) {
    return value.map((entry) => normalizeDateTimes(entry));
  }

  if (typeof value === "string") {
    return normalizeDateTimeString(value);
  }

  if (isPlainObject(value)) {
    return Object.fromEntries(
      Object.entries(value).map(([key, entry]) => [
        key,
        normalizeDateTimes(entry),
      ]),
    );
  }

  return value;
}

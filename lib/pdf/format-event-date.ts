const JAPAN_TIME_ZONE = "Asia/Tokyo";

function getJapanDateParts(date: Date) {
  const formatter = new Intl.DateTimeFormat("en-CA", {
    timeZone: JAPAN_TIME_ZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
  const parts = formatter.formatToParts(date);

  const year = parts.find((part) => part.type === "year")?.value;
  const month = parts.find((part) => part.type === "month")?.value;
  const day = parts.find((part) => part.type === "day")?.value;

  if (!year || !month || !day) {
    throw new Error("Failed to format event date.");
  }

  return { year, month, day };
}

export function formatEventDateForDisplay(date: Date | null | undefined) {
  if (!date) {
    return null;
  }

  const { year, month, day } = getJapanDateParts(date);
  return `${year}.${month}.${day}`;
}

export function formatEventDateForFilename(date: Date | null | undefined) {
  if (!date) {
    return "undated";
  }

  const { year, month, day } = getJapanDateParts(date);
  return `${year}${month}${day}`;
}

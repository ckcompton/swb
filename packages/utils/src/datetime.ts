const DATE_TIME_FORMAT = new Intl.DateTimeFormat("en-US", {
  weekday: "short",
  month: "short",
  day: "numeric",
  hour: "numeric",
  minute: "2-digit",
});

const DATE_FORMAT = new Intl.DateTimeFormat("en-US", {
  weekday: "short",
  month: "short",
  day: "numeric",
  year: "numeric",
});

const TIME_FORMAT = new Intl.DateTimeFormat("en-US", {
  hour: "numeric",
  minute: "2-digit",
});

export function formatDateTime(iso: string): string {
  return DATE_TIME_FORMAT.format(new Date(iso));
}

export function formatDate(iso: string): string {
  return DATE_FORMAT.format(new Date(iso));
}

// For plain SQL `date` values (e.g. date of birth) that carry no time or
// timezone component -- parsing these with `new Date(iso)` reads them as UTC
// midnight, which rolls back a day once formatted in any UTC-negative
// timezone. Parsing the y/m/d parts into local-midnight avoids that shift.
export function formatCalendarDate(isoDate: string): string {
  const [year, month, day] = isoDate.split("-").map(Number);
  return DATE_FORMAT.format(new Date(year, month - 1, day));
}

export function formatTime(iso: string): string {
  return TIME_FORMAT.format(new Date(iso));
}

export function formatDateRange(startIso: string, endIso: string): string {
  return `${formatDateTime(startIso)} – ${formatTime(endIso)}`;
}

export function isFuture(iso: string, now: Date = new Date()): boolean {
  return new Date(iso).getTime() > now.getTime();
}

export function isPast(iso: string, now: Date = new Date()): boolean {
  return new Date(iso).getTime() < now.getTime();
}

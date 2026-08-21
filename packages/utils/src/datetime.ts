// The gym is in Central Time -- pin display formatting to it explicitly
// rather than the runtime's local timezone, since Vercel serverless
// functions run in UTC and would otherwise render times shifted.
const GYM_TIME_ZONE = "America/Chicago";

const DATE_TIME_FORMAT = new Intl.DateTimeFormat("en-US", {
  weekday: "short",
  month: "short",
  day: "numeric",
  hour: "numeric",
  minute: "2-digit",
  timeZone: GYM_TIME_ZONE,
});

const DATE_FORMAT = new Intl.DateTimeFormat("en-US", {
  weekday: "short",
  month: "short",
  day: "numeric",
  year: "numeric",
  timeZone: GYM_TIME_ZONE,
});

const TIME_FORMAT = new Intl.DateTimeFormat("en-US", {
  hour: "numeric",
  minute: "2-digit",
  timeZone: GYM_TIME_ZONE,
});

// No timeZone set -- formatCalendarDate feeds this a Date already constructed
// from local y/m/d parts (see below), so reformatting in another zone would
// shift it again.
const CALENDAR_DATE_FORMAT = new Intl.DateTimeFormat("en-US", {
  weekday: "short",
  month: "short",
  day: "numeric",
  year: "numeric",
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
  return CALENDAR_DATE_FORMAT.format(new Date(year, month - 1, day));
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

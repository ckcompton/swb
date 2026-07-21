const WEEK_MS = 7 * 24 * 60 * 60 * 1000;

export interface SessionOccurrence {
  startsAt: string;
  endsAt: string;
}

/**
 * Generates `count` weekly occurrences starting from `base`, spaced exactly 7 days apart
 * in UTC. A series spanning a DST transition will shift by an hour in local time -- a known
 * tradeoff for keeping this simple rather than depending on a timezone library.
 */
export function generateWeeklyOccurrences(
  base: SessionOccurrence,
  count: number,
): SessionOccurrence[] {
  const startMs = new Date(base.startsAt).getTime();
  const endMs = new Date(base.endsAt).getTime();

  return Array.from({ length: count }, (_, i) => ({
    startsAt: new Date(startMs + i * WEEK_MS).toISOString(),
    endsAt: new Date(endMs + i * WEEK_MS).toISOString(),
  }));
}

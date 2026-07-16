import type { ClassSession, ClassSessionWithCounts } from "../types";

export function isClassBookable(session: ClassSession, now: Date = new Date()): boolean {
  if (session.status !== "scheduled") return false;
  if (new Date(session.startsAt).getTime() <= now.getTime()) return false;
  return true;
}

export function hasCapacity(session: ClassSessionWithCounts): boolean {
  return session.bookedCount < session.capacity;
}

export function canBookClass(session: ClassSessionWithCounts, now: Date = new Date()): boolean {
  return isClassBookable(session, now) && hasCapacity(session);
}

export function canJoinWaitlist(session: ClassSessionWithCounts, now: Date = new Date()): boolean {
  return isClassBookable(session, now) && !hasCapacity(session);
}

export function isClassSessionValid(startsAt: string, endsAt: string, capacity: number): boolean {
  if (capacity <= 0) return false;
  return new Date(endsAt).getTime() > new Date(startsAt).getTime();
}

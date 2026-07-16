export interface CapacityInfo {
  capacity: number;
  bookedCount: number;
}

export function spotsRemaining({ capacity, bookedCount }: CapacityInfo): number {
  return Math.max(0, capacity - bookedCount);
}

export function isAtCapacity(info: CapacityInfo): boolean {
  return spotsRemaining(info) <= 0;
}

export function capacityLabel(info: CapacityInfo): string {
  const remaining = spotsRemaining(info);
  if (remaining <= 0) return "Full";
  if (remaining === 1) return "1 spot left";
  return `${remaining} spots left`;
}

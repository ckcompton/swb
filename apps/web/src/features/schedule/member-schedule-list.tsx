import Link from "next/link";
import type { ClassSessionWithCounts, Membership } from "@boxing-gym/domain";
import { canBookClass, isMembershipActive } from "@boxing-gym/domain";
import { formatDate, formatTime, capacityLabel } from "@boxing-gym/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BookClassButton } from "@/features/bookings/book-class-button";

export function MemberScheduleList({
  sessions,
  bookedClassSessionIds,
  membership,
  waiverSigned,
}: {
  sessions: ClassSessionWithCounts[];
  bookedClassSessionIds: Set<string>;
  membership: Membership | null;
  waiverSigned: boolean;
}) {
  const membershipActive = isMembershipActive(membership);

  if (sessions.length === 0) {
    return <p className="text-muted-foreground">No upcoming classes are scheduled right now.</p>;
  }

  const byDate = groupByDate(sessions);

  return (
    <div className="space-y-8">
      {!membershipActive && (
        <p className="rounded-md border border-border bg-muted p-3 text-sm text-muted-foreground">
          Your membership is not active, so you can&apos;t book classes yet. Contact the front desk
          to activate your membership.
        </p>
      )}
      {membershipActive && !waiverSigned && (
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-md border border-border bg-muted p-3 text-sm text-muted-foreground">
          <span>Please sign the liability waiver before booking a class.</span>
          <Button size="sm" render={<Link href="/dashboard/waiver">Sign waiver</Link>} />
        </div>
      )}
      {byDate.map(([date, items]) => (
        <div key={date}>
          <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
            {date}
          </h2>
          <div className="grid gap-4 sm:grid-cols-2">
            {items.map((session) => {
              const alreadyBooked = bookedClassSessionIds.has(session.id);
              const bookable =
                membershipActive && waiverSigned && canBookClass(session) && !alreadyBooked;

              return (
                <Card key={session.id}>
                  <CardHeader className="flex flex-row items-start justify-between gap-2">
                    <div>
                      <CardTitle className="text-base">{session.title}</CardTitle>
                      <p className="mt-1 text-sm text-muted-foreground">
                        {formatTime(session.startsAt)} &ndash; {formatTime(session.endsAt)}
                      </p>
                    </div>
                    <Badge
                      variant={session.bookedCount >= session.capacity ? "secondary" : "default"}
                    >
                      {capacityLabel({
                        capacity: session.capacity,
                        bookedCount: session.bookedCount,
                      })}
                    </Badge>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="space-y-1 text-sm text-muted-foreground">
                      {session.trainer && <p>Coach {session.trainer.name}</p>}
                      {session.description && <p>{session.description}</p>}
                    </div>
                    {alreadyBooked ? (
                      <Badge variant="outline">Booked</Badge>
                    ) : (
                      <BookClassButton
                        classSessionId={session.id}
                        disabled={!bookable}
                        disabledLabel={
                          !membershipActive
                            ? "Membership inactive"
                            : !waiverSigned
                              ? "Waiver required"
                              : session.bookedCount >= session.capacity
                                ? "Full"
                                : "Unavailable"
                        }
                      />
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}

function groupByDate(sessions: ClassSessionWithCounts[]): [string, ClassSessionWithCounts[]][] {
  const groups = new Map<string, ClassSessionWithCounts[]>();
  for (const session of sessions) {
    const key = formatDate(session.startsAt);
    const existing = groups.get(key) ?? [];
    existing.push(session);
    groups.set(key, existing);
  }
  return Array.from(groups.entries());
}

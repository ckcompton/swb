import type { ClassSession } from "@boxing-gym/domain";
import { formatDate, formatTime } from "@boxing-gym/utils";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function ScheduleList({
  sessions,
  emptyMessage = "No upcoming classes are scheduled right now.",
}: {
  sessions: ClassSession[];
  emptyMessage?: string;
}) {
  if (sessions.length === 0) {
    return <p className="text-muted-foreground">{emptyMessage}</p>;
  }

  const byDate = groupByDate(sessions);

  return (
    <div className="space-y-8">
      {byDate.map(([date, items]) => (
        <div key={date}>
          <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
            {date}
          </h2>
          <div className="grid gap-4 sm:grid-cols-2">
            {items.map((session) => (
              <Card key={session.id}>
                <CardHeader className="flex flex-row items-start justify-between gap-2">
                  <div>
                    <CardTitle className="text-base">{session.title}</CardTitle>
                    <p className="mt-1 text-sm text-muted-foreground">
                      {formatTime(session.startsAt)} &ndash; {formatTime(session.endsAt)}
                    </p>
                  </div>
                  {session.status === "canceled" && <Badge variant="destructive">Canceled</Badge>}
                </CardHeader>
                <CardContent className="space-y-1 text-sm text-muted-foreground">
                  {session.trainer && <p>Coach {session.trainer.name}</p>}
                  {session.description && <p>{session.description}</p>}
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

function groupByDate(sessions: ClassSession[]): [string, ClassSession[]][] {
  const groups = new Map<string, ClassSession[]>();
  for (const session of sessions) {
    const key = formatDate(session.startsAt);
    const existing = groups.get(key) ?? [];
    existing.push(session);
    groups.set(key, existing);
  }
  return Array.from(groups.entries());
}

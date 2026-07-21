import type { Metadata } from "next";
import { getAllSessionsForAdmin, listTrainers } from "@boxing-gym/data-access";
import { formatDateRange } from "@boxing-gym/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { createClient } from "@/lib/supabase/server";
import { requireAdmin } from "@/lib/auth";
import { ClassSessionForm } from "@/features/admin/classes/class-session-form";
import { CancelClassButton } from "@/features/admin/classes/cancel-class-button";

export const metadata: Metadata = {
  title: "Classes",
};

export default async function AdminClassesPage() {
  await requireAdmin();
  const supabase = await createClient();
  const [sessions, trainers] = await Promise.all([
    getAllSessionsForAdmin(supabase),
    listTrainers(supabase),
  ]);

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight">Classes</h1>
        <ClassSessionForm trainers={trainers} trigger={<Button>New class</Button>} />
      </div>

      {sessions.length === 0 ? (
        <p className="text-muted-foreground">No classes yet.</p>
      ) : (
        <div className="overflow-x-auto rounded-md border border-border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Class</TableHead>
                <TableHead>Trainer</TableHead>
                <TableHead>When</TableHead>
                <TableHead>Capacity</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sessions.map((session) => (
                <TableRow key={session.id}>
                  <TableCell className="font-medium">
                    <div className="flex items-center gap-2">
                      {session.title}
                      {session.seriesId && <Badge variant="secondary">Weekly series</Badge>}
                    </div>
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {session.trainer?.name ?? "—"}
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {formatDateRange(session.startsAt, session.endsAt)}
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {session.bookedCount}/{session.capacity}
                  </TableCell>
                  <TableCell>
                    <Badge variant={session.status === "scheduled" ? "default" : "destructive"}>
                      {session.status === "scheduled" ? "Scheduled" : "Canceled"}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right space-x-2">
                    <ClassSessionForm
                      session={session}
                      trainers={trainers}
                      trigger={
                        <Button size="sm" variant="outline">
                          Edit
                        </Button>
                      }
                    />
                    {session.status === "scheduled" && (
                      <CancelClassButton
                        sessionId={session.id}
                        title={session.title}
                        isPartOfSeries={Boolean(session.seriesId)}
                      />
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}

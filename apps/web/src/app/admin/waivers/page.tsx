import type { Metadata } from "next";
import Link from "next/link";
import { listWaivers } from "@boxing-gym/data-access";
import { formatDateTime } from "@boxing-gym/utils";
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

export const metadata: Metadata = {
  title: "Waivers",
};

export default async function AdminWaiversPage() {
  await requireAdmin();
  const supabase = await createClient();
  const waivers = await listWaivers(supabase);

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold tracking-tight">Waivers</h1>

      {waivers.length === 0 ? (
        <p className="text-muted-foreground">No waivers signed yet.</p>
      ) : (
        <div className="overflow-x-auto rounded-md border border-border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Participant</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Signed</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {waivers.map((waiver) => (
                <TableRow key={waiver.id}>
                  <TableCell className="font-medium">{waiver.participantName}</TableCell>
                  <TableCell>{waiver.participantEmail}</TableCell>
                  <TableCell>{formatDateTime(waiver.signedAt)}</TableCell>
                  <TableCell className="text-right">
                    <Button
                      size="sm"
                      variant="outline"
                      render={<Link href={`/admin/waivers/${waiver.id}`}>View</Link>}
                      nativeButton={false}
                    />
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

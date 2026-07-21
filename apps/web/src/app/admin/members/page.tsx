import type { Metadata } from "next";
import { listMembersWithMemberships, listSignedWaiverStatuses } from "@boxing-gym/data-access";
import { isMembershipActive, membershipStatusLabel } from "@boxing-gym/domain";
import { formatDate, formatDisplayName } from "@boxing-gym/utils";
import { Badge } from "@/components/ui/badge";
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
import { MembershipEditor } from "@/features/admin/members/membership-editor";
import { ResetWaiverButton } from "@/features/admin/members/reset-waiver-button";

export const metadata: Metadata = {
  title: "Members",
};

export default async function AdminMembersPage() {
  await requireAdmin();
  const supabase = await createClient();
  const members = await listMembersWithMemberships(supabase);
  const waivers = await listSignedWaiverStatuses(
    supabase,
    members.map((member) => member.id),
  );

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold tracking-tight">Members</h1>

      {members.length === 0 ? (
        <p className="text-muted-foreground">No members yet.</p>
      ) : (
        <div className="overflow-x-auto rounded-md border border-border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Phone</TableHead>
                <TableHead>Plan</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Waiver</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {members.map((member) => (
                <TableRow key={member.id}>
                  <TableCell className="font-medium">
                    {formatDisplayName(member.firstName, member.lastName)}
                  </TableCell>
                  <TableCell className="text-muted-foreground">{member.phone ?? "—"}</TableCell>
                  <TableCell className="text-muted-foreground">
                    {member.membership?.planName ?? "—"}
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={isMembershipActive(member.membership) ? "default" : "secondary"}
                    >
                      {membershipStatusLabel(member.membership)}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {(() => {
                      const waiver = waivers.get(member.id);
                      if (!waiver?.signedAt) {
                        return <Badge variant="secondary">Not signed</Badge>;
                      }
                      return (
                        <div className="flex items-center gap-2">
                          <Badge>Signed {formatDate(waiver.signedAt)}</Badge>
                          {waiver.documentUrl && (
                            <a
                              href={waiver.documentUrl}
                              target="_blank"
                              rel="noreferrer"
                              className="text-sm text-muted-foreground underline underline-offset-4 hover:text-foreground"
                            >
                              View
                            </a>
                          )}
                          <ResetWaiverButton
                            profileId={member.id}
                            memberName={formatDisplayName(member.firstName, member.lastName)}
                          />
                        </div>
                      );
                    })()}
                  </TableCell>
                  <TableCell className="text-right">
                    <MembershipEditor
                      profileId={member.id}
                      memberName={formatDisplayName(member.firstName, member.lastName)}
                      membership={member.membership}
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

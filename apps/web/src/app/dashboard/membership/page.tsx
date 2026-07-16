import type { Metadata } from "next";
import { getActiveMembershipForProfile } from "@boxing-gym/data-access";
import { isMembershipActive, membershipStatusLabel } from "@boxing-gym/domain";
import { formatDate } from "@boxing-gym/utils";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { createClient } from "@/lib/supabase/server";
import { requireMember } from "@/lib/auth";

export const metadata: Metadata = {
  title: "Membership",
};

export default async function MembershipPage() {
  const auth = await requireMember();
  const supabase = await createClient();
  const membership = await getActiveMembershipForProfile(supabase, auth.userId);

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold tracking-tight">Membership</h1>

      {!membership ? (
        <p className="text-muted-foreground">
          You don&apos;t have a membership yet. Visit the front desk to get started.
        </p>
      ) : (
        <Card className="max-w-md">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>{membership.planName}</CardTitle>
            <Badge variant={isMembershipActive(membership) ? "default" : "secondary"}>
              {membershipStatusLabel(membership)}
            </Badge>
          </CardHeader>
          <CardContent className="space-y-1 text-sm text-muted-foreground">
            <p>Started {formatDate(membership.startsAt)}</p>
            {membership.endsAt && <p>Ends {formatDate(membership.endsAt)}</p>}
            {!isMembershipActive(membership) && (
              <p className="pt-2 text-foreground">
                Your membership is not currently active. Contact the front desk to reactivate it.
              </p>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}

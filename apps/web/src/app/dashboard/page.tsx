import Link from "next/link";
import type { Metadata } from "next";
import {
  getActiveMembershipForProfile,
  getPublishedAnnouncements,
  getUpcomingBookingsForProfile,
} from "@boxing-gym/data-access";
import { isMembershipActive, membershipStatusLabel } from "@boxing-gym/domain";
import { formatDate, formatDateRange } from "@boxing-gym/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { createClient } from "@/lib/supabase/server";
import { requireMember } from "@/lib/auth";

export const metadata: Metadata = {
  title: "Dashboard",
};

export default async function DashboardOverviewPage() {
  const auth = await requireMember();
  const supabase = await createClient();

  const [membership, bookings, announcements] = await Promise.all([
    getActiveMembershipForProfile(supabase, auth.userId),
    getUpcomingBookingsForProfile(supabase, auth.userId),
    getPublishedAnnouncements(supabase),
  ]);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">
          Welcome back, {auth.profile.firstName ?? "there"}
        </h1>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-base">Membership</CardTitle>
            <Badge variant={isMembershipActive(membership) ? "default" : "secondary"}>
              {membershipStatusLabel(membership)}
            </Badge>
          </CardHeader>
          <CardContent>
            {membership ? (
              <p className="text-sm text-muted-foreground">{membership.planName}</p>
            ) : (
              <p className="text-sm text-muted-foreground">No membership on file.</p>
            )}
            <Button
              variant="link"
              className="mt-2 h-auto p-0"
              render={<Link href="/dashboard/membership">View details</Link>}
              nativeButton={false}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Upcoming bookings</CardTitle>
          </CardHeader>
          <CardContent>
            {bookings.length === 0 ? (
              <p className="text-sm text-muted-foreground">No upcoming bookings.</p>
            ) : (
              <ul className="space-y-1 text-sm text-muted-foreground">
                {bookings.slice(0, 3).map((booking) => (
                  <li key={booking.id}>
                    {booking.classSession.title} &mdash;{" "}
                    {formatDateRange(booking.classSession.startsAt, booking.classSession.endsAt)}
                  </li>
                ))}
              </ul>
            )}
            <Button
              variant="link"
              className="mt-2 h-auto p-0"
              render={<Link href="/dashboard/bookings">View all bookings</Link>}
              nativeButton={false}
            />
          </CardContent>
        </Card>
      </div>

      <div>
        <h2 className="mb-3 text-lg font-semibold">Announcements</h2>
        {announcements.length === 0 ? (
          <p className="text-sm text-muted-foreground">No announcements right now.</p>
        ) : (
          <div className="space-y-4">
            {announcements.map((announcement) => (
              <Card key={announcement.id}>
                <CardHeader>
                  <CardTitle className="text-base">{announcement.title}</CardTitle>
                  {announcement.publishedAt && (
                    <p className="text-xs text-muted-foreground">
                      {formatDate(announcement.publishedAt)}
                    </p>
                  )}
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">{announcement.body}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

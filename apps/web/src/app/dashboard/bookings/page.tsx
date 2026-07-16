import type { Metadata } from "next";
import { getUpcomingBookingsForProfile } from "@boxing-gym/data-access";
import { formatDateRange } from "@boxing-gym/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { createClient } from "@/lib/supabase/server";
import { requireMember } from "@/lib/auth";
import { CancelBookingButton } from "@/features/bookings/cancel-booking-button";

export const metadata: Metadata = {
  title: "My bookings",
};

export default async function MyBookingsPage() {
  const auth = await requireMember();
  const supabase = await createClient();
  const bookings = await getUpcomingBookingsForProfile(supabase, auth.userId);

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold tracking-tight">My bookings</h1>

      {bookings.length === 0 ? (
        <p className="text-muted-foreground">
          You don&apos;t have any upcoming bookings. Browse the schedule to book a class.
        </p>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {bookings.map((booking) => (
            <Card key={booking.id}>
              <CardHeader>
                <CardTitle className="text-base">{booking.classSession.title}</CardTitle>
                <p className="text-sm text-muted-foreground">
                  {formatDateRange(booking.classSession.startsAt, booking.classSession.endsAt)}
                </p>
              </CardHeader>
              <CardContent>
                <CancelBookingButton
                  bookingId={booking.id}
                  classTitle={booking.classSession.title}
                />
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

import type { Metadata } from "next";
import {
  getActiveMembershipForProfile,
  getUpcomingBookingsForProfile,
  getUpcomingSessionsWithCounts,
} from "@boxing-gym/data-access";
import { createClient } from "@/lib/supabase/server";
import { requireMember } from "@/lib/auth";
import { MemberScheduleList } from "@/features/schedule/member-schedule-list";

export const metadata: Metadata = {
  title: "Classes",
};

export default async function MemberSchedulePage() {
  const auth = await requireMember();
  const supabase = await createClient();

  const [sessions, membership, bookings] = await Promise.all([
    getUpcomingSessionsWithCounts(supabase),
    getActiveMembershipForProfile(supabase, auth.userId),
    getUpcomingBookingsForProfile(supabase, auth.userId),
  ]);

  const bookedClassSessionIds = new Set(bookings.map((b) => b.classSessionId));

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold tracking-tight">Upcoming classes</h1>
      <MemberScheduleList
        sessions={sessions}
        bookedClassSessionIds={bookedClassSessionIds}
        membership={membership}
      />
    </div>
  );
}

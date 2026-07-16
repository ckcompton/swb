import type { Metadata } from "next";
import { getUpcomingSessionsWithCounts } from "@boxing-gym/data-access";
import { createClient } from "@/lib/supabase/server";
import { ScheduleList } from "@/features/schedule/schedule-list";

export const metadata: Metadata = {
  title: "Class Schedule",
  description: "Browse upcoming classes at the gym.",
};

export default async function SchedulePage() {
  const supabase = await createClient();
  const sessions = await getUpcomingSessionsWithCounts(supabase);

  return (
    <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
      <div className="mb-12 max-w-2xl">
        <h1 className="text-4xl font-bold tracking-tight">Class schedule</h1>
        <p className="mt-4 text-lg text-muted-foreground">
          Browse upcoming classes. Log in to book your spot.
        </p>
      </div>

      <ScheduleList sessions={sessions} />
    </div>
  );
}

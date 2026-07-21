import Link from "next/link";
import { getUpcomingSessionsWithCounts } from "@boxing-gym/data-access";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/server";
import { ScheduleList } from "@/features/schedule/schedule-list";

export async function SchedulePreviewSection() {
  const supabase = await createClient();
  const sessions = await getUpcomingSessionsWithCounts(supabase);
  const preview = sessions.slice(0, 4);

  return (
    <section className="mx-auto max-w-6xl px-4 py-20 sm:px-6">
      <div className="mb-10 text-center">
        <h2 className="font-heading text-3xl font-bold tracking-tight uppercase sm:text-4xl">
          Schedule
        </h2>
      </div>
      <ScheduleList
        sessions={preview}
        emptyMessage="No upcoming classes are scheduled right now. Check back soon."
      />
      <div className="mt-8 text-center">
        <Button
          variant="outline"
          render={<Link href="/schedule">View full schedule</Link>}
          nativeButton={false}
        />
      </div>
    </section>
  );
}

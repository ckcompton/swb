import type { Metadata } from "next";
import {
  getAllAnnouncementsForAdmin,
  getAllSessionsForAdmin,
  listAllProfiles,
  listTrainers,
} from "@boxing-gym/data-access";
import { isClassBookable } from "@boxing-gym/domain";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { createClient } from "@/lib/supabase/server";
import { requireAdmin } from "@/lib/auth";

export const metadata: Metadata = {
  title: "Admin",
};

export default async function AdminOverviewPage() {
  await requireAdmin();
  const supabase = await createClient();

  const [profiles, trainers, sessions, announcements] = await Promise.all([
    listAllProfiles(supabase),
    listTrainers(supabase),
    getAllSessionsForAdmin(supabase),
    getAllAnnouncementsForAdmin(supabase),
  ]);

  const now = new Date();
  const upcomingSessions = sessions.filter((s) => isClassBookable(s, now));
  const publishedAnnouncements = announcements.filter((a) => a.isPublished);

  const stats = [
    { label: "Members", value: profiles.filter((p) => p.role === "member").length },
    { label: "Trainers", value: trainers.filter((t) => t.isActive).length },
    { label: "Upcoming classes", value: upcomingSessions.length },
    { label: "Published announcements", value: publishedAnnouncements.length },
  ];

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold tracking-tight">Admin overview</h1>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.label}>
            <CardHeader>
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {stat.label}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">{stat.value}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

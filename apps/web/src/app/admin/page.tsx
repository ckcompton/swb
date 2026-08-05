import type { Metadata } from "next";
import { countEmailSendsToday, listTrainers, listWaivers } from "@boxing-gym/data-access";
import { RESEND_DAILY_EMAIL_LIMIT } from "@boxing-gym/config";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { createClient } from "@/lib/supabase/server";
import { requireAdmin } from "@/lib/auth";

export const metadata: Metadata = {
  title: "Admin",
};

export default async function AdminOverviewPage() {
  await requireAdmin();
  const supabase = await createClient();

  const [trainers, waivers, emailsSentToday] = await Promise.all([
    listTrainers(supabase),
    listWaivers(supabase),
    countEmailSendsToday(supabase),
  ]);

  const stats = [
    { label: "Trainers", value: trainers.filter((t) => t.isActive).length },
    { label: "Waivers signed", value: waivers.length },
    {
      label: "Emails sent today",
      value: `${emailsSentToday} / ${RESEND_DAILY_EMAIL_LIMIT}`,
    },
  ];

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold tracking-tight">Admin overview</h1>
      <div className="grid gap-4 sm:grid-cols-3">
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

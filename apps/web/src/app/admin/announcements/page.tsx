import type { Metadata } from "next";
import { getAllAnnouncementsForAdmin } from "@boxing-gym/data-access";
import { formatDate } from "@boxing-gym/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { createClient } from "@/lib/supabase/server";
import { requireAdmin } from "@/lib/auth";
import { AnnouncementForm } from "@/features/admin/announcements/announcement-form";
import {
  DeleteAnnouncementButton,
  PublishToggleButton,
} from "@/features/admin/announcements/announcement-actions";

export const metadata: Metadata = {
  title: "Announcements",
};

export default async function AdminAnnouncementsPage() {
  await requireAdmin();
  const supabase = await createClient();
  const announcements = await getAllAnnouncementsForAdmin(supabase);

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight">Announcements</h1>
        <AnnouncementForm trigger={<Button>New announcement</Button>} />
      </div>

      {announcements.length === 0 ? (
        <p className="text-muted-foreground">No announcements yet.</p>
      ) : (
        <div className="space-y-4">
          {announcements.map((announcement) => (
            <Card key={announcement.id}>
              <CardHeader className="flex flex-row items-start justify-between gap-2">
                <div>
                  <CardTitle className="text-base">{announcement.title}</CardTitle>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {announcement.publishedAt
                      ? `Published ${formatDate(announcement.publishedAt)}`
                      : "Not published"}
                  </p>
                </div>
                <Badge variant={announcement.isPublished ? "default" : "secondary"}>
                  {announcement.isPublished ? "Published" : "Draft"}
                </Badge>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-muted-foreground">{announcement.body}</p>
                <div className="flex flex-wrap gap-2">
                  <AnnouncementForm
                    announcement={announcement}
                    trigger={
                      <Button size="sm" variant="outline">
                        Edit
                      </Button>
                    }
                  />
                  <PublishToggleButton
                    announcementId={announcement.id}
                    isPublished={announcement.isPublished}
                  />
                  <DeleteAnnouncementButton
                    announcementId={announcement.id}
                    title={announcement.title}
                  />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

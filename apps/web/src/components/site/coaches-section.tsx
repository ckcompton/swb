import Link from "next/link";
import { listTrainers } from "@boxing-gym/data-access";
import { initialsFromFullName } from "@boxing-gym/utils";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { createClient } from "@/lib/supabase/server";
import { trainerPhotoUrl } from "@/features/trainers/trainer-photo-url";

export async function CoachesSection() {
  const supabase = await createClient();
  const trainers = await listTrainers(supabase, { activeOnly: true });
  const featured = trainers.slice(0, 3);

  if (featured.length === 0) {
    return null;
  }

  return (
    <section className="border-t border-border bg-card/40 py-20">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="mb-10 text-center">
          <h2 className="font-heading text-3xl font-bold tracking-tight uppercase sm:text-4xl">
            Meet the team
          </h2>
        </div>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {featured.map((trainer) => {
            const photoUrl = trainerPhotoUrl(supabase, trainer.photoPath);
            return (
              <Card key={trainer.id}>
                <CardHeader className="flex flex-row items-center gap-4">
                  <Avatar className="size-16">
                    {photoUrl && <AvatarImage src={photoUrl} alt={trainer.name} />}
                    <AvatarFallback className="text-lg">
                      {initialsFromFullName(trainer.name)}
                    </AvatarFallback>
                  </Avatar>
                  <CardTitle className="font-heading text-lg tracking-wide uppercase">
                    {trainer.name}
                  </CardTitle>
                </CardHeader>
                {trainer.bio && (
                  <CardContent>
                    <p className="text-sm text-muted-foreground">{trainer.bio}</p>
                  </CardContent>
                )}
              </Card>
            );
          })}
        </div>
        <div className="mt-8 text-center">
          <Button
            variant="outline"
            render={<Link href="/trainers">Meet the full team</Link>}
            nativeButton={false}
          />
        </div>
      </div>
    </section>
  );
}

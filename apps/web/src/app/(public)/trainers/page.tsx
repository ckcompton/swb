import type { Metadata } from "next";
import { listTrainers } from "@boxing-gym/data-access";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { createClient } from "@/lib/supabase/server";
import { trainerPhotoUrl } from "@/features/trainers/trainer-photo-url";
import { initialsFromFullName } from "@boxing-gym/utils";

export const metadata: Metadata = {
  title: "Trainers",
  description: "Meet the coaches at the gym.",
};

export default async function TrainersPage() {
  const supabase = await createClient();
  const trainers = await listTrainers(supabase, { activeOnly: true });

  return (
    <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
      <div className="mb-12 max-w-2xl">
        <h1 className="text-4xl font-bold tracking-tight">Our trainers</h1>
        <p className="mt-4 text-lg text-muted-foreground">
          Experienced coaches ready to help you reach your goals, from your first class to
          competitive sparring.
        </p>
      </div>

      {trainers.length === 0 ? (
        <p className="text-muted-foreground">No trainers are listed right now. Check back soon.</p>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {trainers.map((trainer) => {
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
                  <CardTitle className="text-lg">{trainer.name}</CardTitle>
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
      )}
    </div>
  );
}

import type { Metadata } from "next";
import { listTrainers } from "@boxing-gym/data-access";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { createClient } from "@/lib/supabase/server";
import { requireAdmin } from "@/lib/auth";
import { TrainerForm } from "@/features/admin/trainers/trainer-form";
import { trainerPhotoUrl } from "@/features/trainers/trainer-photo-url";
import { initialsFromFullName } from "@boxing-gym/utils";

export const metadata: Metadata = {
  title: "Trainers",
};

export default async function AdminTrainersPage() {
  await requireAdmin();
  const supabase = await createClient();
  const trainers = await listTrainers(supabase);

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight">Trainers</h1>
        <TrainerForm trigger={<Button>New trainer</Button>} />
      </div>

      {trainers.length === 0 ? (
        <p className="text-muted-foreground">No trainers yet.</p>
      ) : (
        <div className="overflow-x-auto rounded-md border border-border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Trainer</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {trainers.map((trainer) => {
                const photoUrl = trainerPhotoUrl(supabase, trainer.photoPath);
                return (
                  <TableRow key={trainer.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar>
                          {photoUrl && <AvatarImage src={photoUrl} alt={trainer.name} />}
                          <AvatarFallback>{initialsFromFullName(trainer.name)}</AvatarFallback>
                        </Avatar>
                        <span className="font-medium">{trainer.name}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant={trainer.isActive ? "default" : "secondary"}>
                        {trainer.isActive ? "Active" : "Inactive"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <TrainerForm
                        trainer={trainer}
                        photoUrl={photoUrl}
                        trigger={
                          <Button size="sm" variant="outline">
                            Edit
                          </Button>
                        }
                      />
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}

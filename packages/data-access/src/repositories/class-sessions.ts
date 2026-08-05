import type { SupabaseClient } from "@supabase/supabase-js";
import type { ClassSession } from "@boxing-gym/domain";
import type { Database } from "../database.types";
import { mapClassSession, mapTrainer } from "../mappers";

export interface ListUpcomingSessionsOptions {
  fromIso?: string;
  includeCanceled?: boolean;
}

export async function getUpcomingClassSessions(
  client: SupabaseClient<Database>,
  options: ListUpcomingSessionsOptions = {},
): Promise<ClassSession[]> {
  const from = options.fromIso ?? new Date().toISOString();
  let query = client
    .from("class_sessions")
    .select("*, trainers ( * )")
    .gte("starts_at", from)
    .order("starts_at", { ascending: true });

  if (!options.includeCanceled) {
    query = query.eq("status", "scheduled");
  }

  const { data: sessions, error } = await query;
  if (error) throw error;

  return sessions.map((row) => ({
    ...mapClassSession(row),
    trainer: row.trainers ? mapTrainer(row.trainers) : null,
  }));
}

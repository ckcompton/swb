import type { SupabaseClient } from "@supabase/supabase-js";
import type { ClassSession, ClassSessionWithCounts } from "@boxing-gym/domain";
import { generateWeeklyOccurrences } from "@boxing-gym/domain";
import type { Database } from "../database.types";
import { mapClassSession, mapTrainer } from "../mappers";
import { getWaitlistCounts } from "./waitlist";

export interface ListUpcomingSessionsOptions {
  fromIso?: string;
  includeCanceled?: boolean;
}

export async function getAllSessionsForAdmin(
  client: SupabaseClient<Database>,
): Promise<ClassSessionWithCounts[]> {
  const { data: sessions, error } = await client
    .from("class_sessions")
    .select("*, trainers ( * )")
    .order("starts_at", { ascending: false });
  if (error) throw error;

  const sessionIds = sessions.map((s) => s.id);
  const [counts, waitlistCounts] = await Promise.all([
    getBookedCounts(client, sessionIds),
    getWaitlistCounts(client, sessionIds),
  ]);

  return sessions.map((row) => ({
    ...mapClassSession(row),
    trainer: row.trainers ? mapTrainer(row.trainers) : null,
    bookedCount: counts.get(row.id) ?? 0,
    waitlistCount: waitlistCounts.get(row.id) ?? 0,
  }));
}

export async function getUpcomingSessionsWithCounts(
  client: SupabaseClient<Database>,
  options: ListUpcomingSessionsOptions = {},
): Promise<ClassSessionWithCounts[]> {
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

  const sessionIds = sessions.map((s) => s.id);
  const [counts, waitlistCounts] = await Promise.all([
    getBookedCounts(client, sessionIds),
    getWaitlistCounts(client, sessionIds),
  ]);

  return sessions.map((row) => ({
    ...mapClassSession(row),
    trainer: row.trainers ? mapTrainer(row.trainers) : null,
    bookedCount: counts.get(row.id) ?? 0,
    waitlistCount: waitlistCounts.get(row.id) ?? 0,
  }));
}

async function getBookedCounts(
  client: SupabaseClient<Database>,
  classSessionIds: string[],
): Promise<Map<string, number>> {
  const counts = new Map<string, number>();
  if (classSessionIds.length === 0) return counts;

  const { data, error } = await client
    .from("class_session_booked_counts")
    .select("class_session_id, booked_count")
    .in("class_session_id", classSessionIds);
  if (error) throw error;

  for (const row of data) {
    if (row.class_session_id) {
      counts.set(row.class_session_id, row.booked_count ?? 0);
    }
  }
  return counts;
}

export async function getClassSessionById(
  client: SupabaseClient<Database>,
  sessionId: string,
): Promise<ClassSession | null> {
  const { data, error } = await client
    .from("class_sessions")
    .select("*")
    .eq("id", sessionId)
    .maybeSingle();
  if (error) throw error;
  return data ? mapClassSession(data) : null;
}

export interface CreateClassSessionInput {
  title: string;
  description?: string | null;
  trainerId?: string | null;
  startsAt: string;
  endsAt: string;
  capacity: number;
  allowsFreeTrial?: boolean;
  createdBy?: string | null;
}

export async function createClassSession(
  client: SupabaseClient<Database>,
  input: CreateClassSessionInput,
): Promise<ClassSession> {
  const { data, error } = await client
    .from("class_sessions")
    .insert({
      title: input.title,
      description: input.description ?? null,
      trainer_id: input.trainerId ?? null,
      starts_at: input.startsAt,
      ends_at: input.endsAt,
      capacity: input.capacity,
      allows_free_trial: input.allowsFreeTrial ?? false,
      created_by: input.createdBy ?? null,
    })
    .select("*")
    .single();
  if (error) throw error;
  return mapClassSession(data);
}

export async function createRecurringClassSessions(
  client: SupabaseClient<Database>,
  input: CreateClassSessionInput,
  occurrenceCount: number,
): Promise<ClassSession[]> {
  const seriesId = crypto.randomUUID();
  const occurrences = generateWeeklyOccurrences(
    { startsAt: input.startsAt, endsAt: input.endsAt },
    occurrenceCount,
  );

  const { data, error } = await client
    .from("class_sessions")
    .insert(
      occurrences.map((occurrence) => ({
        title: input.title,
        description: input.description ?? null,
        trainer_id: input.trainerId ?? null,
        starts_at: occurrence.startsAt,
        ends_at: occurrence.endsAt,
        capacity: input.capacity,
        allows_free_trial: input.allowsFreeTrial ?? false,
        created_by: input.createdBy ?? null,
        series_id: seriesId,
      })),
    )
    .select("*");
  if (error) throw error;
  return data.map(mapClassSession);
}

export interface UpdateClassSessionInput {
  title?: string;
  description?: string | null;
  trainerId?: string | null;
  startsAt?: string;
  endsAt?: string;
  capacity?: number;
  allowsFreeTrial?: boolean;
  status?: "scheduled" | "canceled";
}

export async function updateClassSession(
  client: SupabaseClient<Database>,
  sessionId: string,
  input: UpdateClassSessionInput,
): Promise<ClassSession> {
  const { data, error } = await client
    .from("class_sessions")
    .update({
      ...(input.title !== undefined ? { title: input.title } : {}),
      ...(input.description !== undefined ? { description: input.description } : {}),
      ...(input.trainerId !== undefined ? { trainer_id: input.trainerId } : {}),
      ...(input.startsAt !== undefined ? { starts_at: input.startsAt } : {}),
      ...(input.endsAt !== undefined ? { ends_at: input.endsAt } : {}),
      ...(input.capacity !== undefined ? { capacity: input.capacity } : {}),
      ...(input.allowsFreeTrial !== undefined ? { allows_free_trial: input.allowsFreeTrial } : {}),
      ...(input.status !== undefined ? { status: input.status } : {}),
    })
    .eq("id", sessionId)
    .select("*")
    .single();
  if (error) throw error;
  return mapClassSession(data);
}

export async function getEligibleTrialClassSessions(
  client: SupabaseClient<Database>,
): Promise<ClassSession[]> {
  const { data, error } = await client
    .from("class_sessions")
    .select("*")
    .eq("status", "scheduled")
    .eq("allows_free_trial", true)
    .gt("starts_at", new Date().toISOString())
    .order("starts_at", { ascending: true });
  if (error) throw error;
  return data.map(mapClassSession);
}

export async function cancelClassSession(
  client: SupabaseClient<Database>,
  sessionId: string,
): Promise<ClassSession> {
  return updateClassSession(client, sessionId, { status: "canceled" });
}

import type { SupabaseClient } from "@supabase/supabase-js";
import type { Trainer } from "@boxing-gym/domain";
import type { Database } from "../database.types";
import { mapTrainer } from "../mappers";

export interface ListTrainersOptions {
  activeOnly?: boolean;
}

export async function listTrainers(
  client: SupabaseClient<Database>,
  options: ListTrainersOptions = {},
): Promise<Trainer[]> {
  let query = client.from("trainers").select("*").order("name", { ascending: true });
  if (options.activeOnly) {
    query = query.eq("is_active", true);
  }
  const { data, error } = await query;
  if (error) throw error;
  return data.map(mapTrainer);
}

export async function getTrainerById(
  client: SupabaseClient<Database>,
  trainerId: string,
): Promise<Trainer | null> {
  const { data, error } = await client
    .from("trainers")
    .select("*")
    .eq("id", trainerId)
    .maybeSingle();
  if (error) throw error;
  return data ? mapTrainer(data) : null;
}

export interface CreateTrainerInput {
  name: string;
  bio?: string | null;
  isActive?: boolean;
}

export async function createTrainer(
  client: SupabaseClient<Database>,
  input: CreateTrainerInput,
): Promise<Trainer> {
  const { data, error } = await client
    .from("trainers")
    .insert({
      name: input.name,
      bio: input.bio ?? null,
      is_active: input.isActive ?? true,
    })
    .select("*")
    .single();
  if (error) throw error;
  return mapTrainer(data);
}

export interface UpdateTrainerInput {
  name?: string;
  bio?: string | null;
  isActive?: boolean;
  photoPath?: string | null;
}

export async function updateTrainer(
  client: SupabaseClient<Database>,
  trainerId: string,
  input: UpdateTrainerInput,
): Promise<Trainer> {
  const { data, error } = await client
    .from("trainers")
    .update({
      ...(input.name !== undefined ? { name: input.name } : {}),
      ...(input.bio !== undefined ? { bio: input.bio } : {}),
      ...(input.isActive !== undefined ? { is_active: input.isActive } : {}),
      ...(input.photoPath !== undefined ? { photo_path: input.photoPath } : {}),
    })
    .eq("id", trainerId)
    .select("*")
    .single();
  if (error) throw error;
  return mapTrainer(data);
}

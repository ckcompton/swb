import type { SupabaseClient } from "@supabase/supabase-js";
import type { Announcement } from "@boxing-gym/domain";
import type { Database } from "../database.types";
import { mapAnnouncement } from "../mappers";

export async function getPublishedAnnouncements(
  client: SupabaseClient<Database>,
): Promise<Announcement[]> {
  const { data, error } = await client
    .from("announcements")
    .select("*")
    .eq("is_published", true)
    .order("published_at", { ascending: false });
  if (error) throw error;
  return data.map(mapAnnouncement);
}

export async function getAllAnnouncementsForAdmin(
  client: SupabaseClient<Database>,
): Promise<Announcement[]> {
  const { data, error } = await client
    .from("announcements")
    .select("*")
    .order("created_at", { ascending: false });
  if (error) throw error;
  return data.map(mapAnnouncement);
}

export interface CreateAnnouncementInput {
  title: string;
  body: string;
  createdBy?: string | null;
}

export async function createAnnouncement(
  client: SupabaseClient<Database>,
  input: CreateAnnouncementInput,
): Promise<Announcement> {
  const { data, error } = await client
    .from("announcements")
    .insert({
      title: input.title,
      body: input.body,
      created_by: input.createdBy ?? null,
    })
    .select("*")
    .single();
  if (error) throw error;
  return mapAnnouncement(data);
}

export interface UpdateAnnouncementInput {
  title?: string;
  body?: string;
}

export async function updateAnnouncement(
  client: SupabaseClient<Database>,
  announcementId: string,
  input: UpdateAnnouncementInput,
): Promise<Announcement> {
  const { data, error } = await client
    .from("announcements")
    .update({
      ...(input.title !== undefined ? { title: input.title } : {}),
      ...(input.body !== undefined ? { body: input.body } : {}),
    })
    .eq("id", announcementId)
    .select("*")
    .single();
  if (error) throw error;
  return mapAnnouncement(data);
}

export async function setAnnouncementPublished(
  client: SupabaseClient<Database>,
  announcementId: string,
  isPublished: boolean,
): Promise<Announcement> {
  const { data, error } = await client
    .from("announcements")
    .update({
      is_published: isPublished,
      published_at: isPublished ? new Date().toISOString() : null,
    })
    .eq("id", announcementId)
    .select("*")
    .single();
  if (error) throw error;
  return mapAnnouncement(data);
}

export async function deleteAnnouncement(
  client: SupabaseClient<Database>,
  announcementId: string,
): Promise<void> {
  const { error } = await client.from("announcements").delete().eq("id", announcementId);
  if (error) throw error;
}

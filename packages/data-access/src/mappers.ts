import type { ClassSession, Profile, Trainer, Waiver } from "@boxing-gym/domain";
import type { Database } from "./database.types";

type ProfileRow = Database["public"]["Tables"]["profiles"]["Row"];
type TrainerRow = Database["public"]["Tables"]["trainers"]["Row"];
type ClassSessionRow = Database["public"]["Tables"]["class_sessions"]["Row"];
type WaiverRow = Database["public"]["Tables"]["waivers"]["Row"];

export function mapProfile(row: ProfileRow): Profile {
  return {
    id: row.id,
    role: row.role,
    firstName: row.first_name,
    lastName: row.last_name,
    phone: row.phone,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export function mapTrainer(row: TrainerRow): Trainer {
  return {
    id: row.id,
    name: row.name,
    bio: row.bio,
    photoPath: row.photo_path,
    isActive: row.is_active,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export function mapClassSession(row: ClassSessionRow): Omit<ClassSession, "trainer"> {
  return {
    id: row.id,
    title: row.title,
    description: row.description,
    trainerId: row.trainer_id,
    startsAt: row.starts_at,
    endsAt: row.ends_at,
    status: row.status,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export function mapWaiver(row: WaiverRow): Waiver {
  return {
    id: row.id,
    participantName: row.participant_name,
    participantEmail: row.participant_email,
    participantPhone: row.participant_phone,
    isMinor: row.is_minor,
    guardianName: row.guardian_name,
    signaturePath: row.signature_path,
    waiverVersion: row.waiver_version,
    signedAt: row.signed_at,
    createdAt: row.created_at,
  };
}

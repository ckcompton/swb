import type {
  Announcement,
  Booking,
  ClassSession,
  Membership,
  Profile,
  Trainer,
  TrialRequest,
  WaitlistEntry,
} from "@boxing-gym/domain";
import type { Database } from "./database.types";

type ProfileRow = Database["public"]["Tables"]["profiles"]["Row"];
type TrainerRow = Database["public"]["Tables"]["trainers"]["Row"];
type ClassSessionRow = Database["public"]["Tables"]["class_sessions"]["Row"];
type MembershipRow = Database["public"]["Tables"]["memberships"]["Row"];
type BookingRow = Database["public"]["Tables"]["bookings"]["Row"];
type AnnouncementRow = Database["public"]["Tables"]["announcements"]["Row"];
type WaitlistEntryRow = Database["public"]["Tables"]["waitlist_entries"]["Row"];
type TrialRequestRow = Database["public"]["Tables"]["trial_requests"]["Row"];

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

export function mapClassSession(row: ClassSessionRow): ClassSession {
  return {
    id: row.id,
    title: row.title,
    description: row.description,
    trainerId: row.trainer_id,
    startsAt: row.starts_at,
    endsAt: row.ends_at,
    capacity: row.capacity,
    status: row.status,
    allowsFreeTrial: row.allows_free_trial,
    createdBy: row.created_by,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export function mapMembership(row: MembershipRow): Membership {
  return {
    id: row.id,
    profileId: row.profile_id,
    planName: row.plan_name,
    status: row.status,
    startsAt: row.starts_at,
    endsAt: row.ends_at,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export function mapBooking(row: BookingRow): Booking {
  return {
    id: row.id,
    classSessionId: row.class_session_id,
    profileId: row.profile_id,
    status: row.status,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export function mapWaitlistEntry(row: WaitlistEntryRow): WaitlistEntry {
  return {
    id: row.id,
    classSessionId: row.class_session_id,
    profileId: row.profile_id,
    status: row.status,
    position: row.position,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export function mapAnnouncement(row: AnnouncementRow): Announcement {
  return {
    id: row.id,
    title: row.title,
    body: row.body,
    isPublished: row.is_published,
    publishedAt: row.published_at,
    createdBy: row.created_by,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export function mapTrialRequest(row: TrialRequestRow): TrialRequest {
  return {
    id: row.id,
    firstName: row.first_name,
    lastName: row.last_name,
    email: row.email,
    phone: row.phone,
    classSessionId: row.class_session_id,
    experienceLevel: row.experience_level,
    message: row.message,
    status: row.status,
    adminNotes: row.admin_notes,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

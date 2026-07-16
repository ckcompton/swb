import type {
  BookingStatus,
  ClassSessionStatus,
  MembershipStatus,
  Role,
  TrialExperienceLevel,
  TrialRequestStatus,
  WaitlistStatus,
} from "@boxing-gym/config";

export interface Profile {
  id: string;
  role: Role;
  firstName: string | null;
  lastName: string | null;
  phone: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface Trainer {
  id: string;
  name: string;
  bio: string | null;
  photoPath: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ClassSession {
  id: string;
  title: string;
  description: string | null;
  trainerId: string | null;
  startsAt: string;
  endsAt: string;
  capacity: number;
  status: ClassSessionStatus;
  allowsFreeTrial: boolean;
  createdBy: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface ClassSessionWithCounts extends ClassSession {
  bookedCount: number;
  waitlistCount: number;
  trainer: Trainer | null;
}

export interface ProfileWithMembership extends Profile {
  membership: Membership | null;
}

export interface Membership {
  id: string;
  profileId: string;
  planName: string;
  status: MembershipStatus;
  startsAt: string;
  endsAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface Booking {
  id: string;
  classSessionId: string;
  profileId: string;
  status: BookingStatus;
  createdAt: string;
  updatedAt: string;
}

export interface BookingWithSession extends Booking {
  classSession: ClassSession;
}

export interface WaitlistEntry {
  id: string;
  classSessionId: string;
  profileId: string;
  status: WaitlistStatus;
  position: number;
  createdAt: string;
  updatedAt: string;
}

export interface WaitlistEntryWithSession extends WaitlistEntry {
  classSession: ClassSession;
}

export interface WaitlistEntryWithProfile extends WaitlistEntry {
  profile: Profile;
}

export interface Announcement {
  id: string;
  title: string;
  body: string;
  isPublished: boolean;
  publishedAt: string | null;
  createdBy: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface TrialRequest {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  classSessionId: string;
  experienceLevel: TrialExperienceLevel;
  message: string | null;
  status: TrialRequestStatus;
  adminNotes: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface TrialRequestWithSession extends TrialRequest {
  classSession: ClassSession;
}

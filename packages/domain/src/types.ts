import type { ClassSessionStatus, Role } from "@boxing-gym/config";

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
  status: ClassSessionStatus;
  trainer: Trainer | null;
  createdAt: string;
  updatedAt: string;
}

export interface Waiver {
  id: string;
  participantName: string;
  participantEmail: string;
  participantPhone: string | null;
  isMinor: boolean;
  guardianName: string | null;
  signaturePath: string;
  waiverVersion: string;
  signedAt: string;
  createdAt: string;
}

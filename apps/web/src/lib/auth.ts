import "server-only";
import { redirect } from "next/navigation";
import { getProfileById } from "@boxing-gym/data-access";
import type { Profile } from "@boxing-gym/domain";
import { createClient } from "@/lib/supabase/server";

export interface AuthContext {
  userId: string;
  email: string | undefined;
  profile: Profile;
}

/**
 * Verifies the session with Supabase Auth (not just a cookie read) and loads
 * the caller's profile. Use in Server Components / Server Actions that need
 * to know who is calling - never trust client-provided role claims.
 */
export async function getAuthContext(): Promise<AuthContext | null> {
  const supabase = await createClient();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) return null;

  const profile = await getProfileById(supabase, user.id);
  if (!profile) return null;

  return { userId: user.id, email: user.email, profile };
}

export async function requireMember(): Promise<AuthContext> {
  const auth = await getAuthContext();
  if (!auth) redirect("/login");
  return auth;
}

export async function requireAdmin(): Promise<AuthContext> {
  const auth = await getAuthContext();
  if (!auth) redirect("/login");
  if (auth.profile.role !== "admin") redirect("/dashboard");
  return auth;
}

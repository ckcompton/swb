"use server";

import { revalidatePath } from "next/cache";
import { bookClassSession, cancelBooking, getBookingById } from "@boxing-gym/data-access";
import {
  BookingError,
  cancelBookingSchema,
  createBookingSchema,
  friendlyBookingErrorMessage,
} from "@boxing-gym/domain";
import { createClient } from "@/lib/supabase/server";
import { getAuthContext } from "@/lib/auth";

export interface BookingActionResult {
  success: boolean;
  error?: string;
}

export async function bookClassAction(formData: FormData): Promise<BookingActionResult> {
  const auth = await getAuthContext();
  if (!auth) {
    return { success: false, error: friendlyBookingErrorMessage("NOT_AUTHENTICATED") };
  }

  const parsed = createBookingSchema.safeParse({
    classSessionId: formData.get("classSessionId"),
  });
  if (!parsed.success) {
    return { success: false, error: "Invalid class." };
  }

  const supabase = await createClient();
  try {
    await bookClassSession(supabase, parsed.data.classSessionId);
  } catch (error) {
    if (error instanceof BookingError) {
      return { success: false, error: friendlyBookingErrorMessage(error.code) };
    }
    return { success: false, error: friendlyBookingErrorMessage("UNKNOWN_ERROR") };
  }

  revalidatePath("/dashboard/schedule");
  revalidatePath("/dashboard/bookings");
  revalidatePath("/dashboard");
  return { success: true };
}

export async function cancelBookingAction(formData: FormData): Promise<BookingActionResult> {
  const auth = await getAuthContext();
  if (!auth) {
    return { success: false, error: friendlyBookingErrorMessage("NOT_AUTHENTICATED") };
  }

  const parsed = cancelBookingSchema.safeParse({
    bookingId: formData.get("bookingId"),
  });
  if (!parsed.success) {
    return { success: false, error: "Invalid booking." };
  }

  const supabase = await createClient();

  // Defense in depth: RLS also enforces this, but check ownership here too
  // so we can return a clean, friendly error instead of a raw DB error.
  const booking = await getBookingById(supabase, parsed.data.bookingId);
  if (!booking || booking.profileId !== auth.userId) {
    return { success: false, error: friendlyBookingErrorMessage("BOOKING_NOT_FOUND") };
  }

  try {
    await cancelBooking(supabase, parsed.data.bookingId);
  } catch (error) {
    if (error instanceof BookingError) {
      return { success: false, error: friendlyBookingErrorMessage(error.code) };
    }
    return { success: false, error: friendlyBookingErrorMessage("UNKNOWN_ERROR") };
  }

  revalidatePath("/dashboard/schedule");
  revalidatePath("/dashboard/bookings");
  revalidatePath("/dashboard");
  return { success: true };
}

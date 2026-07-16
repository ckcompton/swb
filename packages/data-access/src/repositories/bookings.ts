import type { SupabaseClient } from "@supabase/supabase-js";
import type { Booking, BookingWithSession } from "@boxing-gym/domain";
import { BookingError, mapPostgresErrorToBookingErrorCode } from "@boxing-gym/domain";
import type { Database } from "../database.types";
import { mapBooking, mapClassSession } from "../mappers";

export async function bookClassSession(
  client: SupabaseClient<Database>,
  classSessionId: string,
): Promise<Booking> {
  const { data, error } = await client.rpc("book_class_session", {
    p_class_session_id: classSessionId,
  });
  if (error) {
    throw new BookingError(mapPostgresErrorToBookingErrorCode(error.message));
  }
  return mapBooking(data);
}

export async function cancelBooking(
  client: SupabaseClient<Database>,
  bookingId: string,
): Promise<Booking> {
  const { data, error } = await client.rpc("cancel_booking", {
    p_booking_id: bookingId,
  });
  if (error) {
    throw new BookingError(mapPostgresErrorToBookingErrorCode(error.message));
  }
  return mapBooking(data);
}

export async function getUpcomingBookingsForProfile(
  client: SupabaseClient<Database>,
  profileId: string,
): Promise<BookingWithSession[]> {
  const { data, error } = await client
    .from("bookings")
    .select("*, class_sessions ( * )")
    .eq("profile_id", profileId)
    .eq("status", "booked")
    .order("created_at", { ascending: false });
  if (error) throw error;

  return data
    .filter((row) => row.class_sessions !== null)
    .map((row) => ({
      ...mapBooking(row),
      classSession: mapClassSession(row.class_sessions!),
    }));
}

export async function getBookingById(
  client: SupabaseClient<Database>,
  bookingId: string,
): Promise<Booking | null> {
  const { data, error } = await client
    .from("bookings")
    .select("*")
    .eq("id", bookingId)
    .maybeSingle();
  if (error) throw error;
  return data ? mapBooking(data) : null;
}

export async function getAllBookingsForAdmin(
  client: SupabaseClient<Database>,
): Promise<BookingWithSession[]> {
  const { data, error } = await client
    .from("bookings")
    .select("*, class_sessions ( * )")
    .order("created_at", { ascending: false });
  if (error) throw error;

  return data
    .filter((row) => row.class_sessions !== null)
    .map((row) => ({
      ...mapBooking(row),
      classSession: mapClassSession(row.class_sessions!),
    }));
}

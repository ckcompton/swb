import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";
import type { Database } from "@boxing-gym/data-access";
import { env } from "@/lib/env";

export async function createClient() {
  const cookieStore = await cookies();

  return createServerClient<Database>(
    env.NEXT_PUBLIC_SUPABASE_URL,
    env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            for (const { name, value, options } of cookiesToSet) {
              cookieStore.set(name, value, options);
            }
          } catch {
            // setAll called from a Server Component - safe to ignore because
            // the proxy (middleware) refreshes the session on every request.
          }
        },
      },
    },
  );
}

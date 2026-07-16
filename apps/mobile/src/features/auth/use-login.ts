import { useState } from "react";
import { loginSchema } from "@boxing-gym/domain";
import { supabase } from "@/lib/supabase";

export function useLogin() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function login(email: string, password: string): Promise<boolean> {
    setError(null);

    const parsed = loginSchema.safeParse({ email, password });
    if (!parsed.success) {
      setError(parsed.error.issues[0]?.message ?? "Enter a valid email and password.");
      return false;
    }

    setIsSubmitting(true);
    const { error: signInError } = await supabase.auth.signInWithPassword(parsed.data);
    setIsSubmitting(false);

    if (signInError) {
      setError("Invalid email or password.");
      return false;
    }

    return true;
  }

  return { login, isSubmitting, error };
}
